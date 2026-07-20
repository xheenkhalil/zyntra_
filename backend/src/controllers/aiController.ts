import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config';
import mammoth from 'mammoth';
import pool from '../services/db';
import { encrypt } from '../services/encryptionService';
const pdf = require('pdf-parse');

const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY as string);

async function generateWithFallback(systemPrompt: string, userPrompt: string) {
  const modelsToTry = [
    'gemini-2.5-flash',
    'gemini-flash-latest',
    'gemini-3.5-flash',
    'gemini-2.0-flash',
  ];
  let lastError: any;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemPrompt,
      });

      const response = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      });
      let content = response.response.text();
      if (!content) throw new Error('AI returned an empty response.');

      content = content
        .replace(/^```json\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();

      const result = JSON.parse(content);
      const questions = result.questions || result;

      if (!Array.isArray(questions))
        throw new Error('AI did not return a valid array of questions.');

      return questions;
    } catch (error: any) {
      console.warn(`Model ${modelName} failed:`, error?.message || String(error));
      lastError = error;
    }
  }

  throw lastError || new Error('All fallback models failed to generate valid content.');
}

// Build the system prompt dynamically based on which question types are requested
function buildSystemPrompt(requestedTypes: string[]): string {
  const typeSchemas: Record<string, string> = {
    MCQ: `For MCQ (Multiple Choice Question): The object must have "type": "MCQ", "questionText": string, and "options": an array of 4 option objects. Each option has "text" (string) and "isCorrect" (boolean). Exactly ONE option must have "isCorrect": true.`,
    MSQ: `For MSQ (Multiple Select Question): The object must have "type": "MSQ", "questionText": string, and "options": an array of 4-5 option objects. Each option has "text" (string) and "isCorrect" (boolean). TWO or MORE options must have "isCorrect": true.`,
    TRUE_FALSE: `For TRUE_FALSE (True or False): The object must have "type": "TRUE_FALSE", "questionText": string, and "options": an array of exactly 2 option objects: [{"text": "True", "isCorrect": <boolean>}, {"text": "False", "isCorrect": <boolean>}]. Exactly one must be correct.`,
    FILL_BLANK: `For FILL_BLANK (Fill in the Blank): The object must have "type": "FILL_BLANK", "questionText": string (use a blank marker like "___" in the text where the answer goes), and "correctAnswer": string (the correct answer text). Do NOT include an "options" array.`,
    ESSAY: `For ESSAY: The object must have "type": "ESSAY" and "questionText": string. Do NOT include "options" or "correctAnswer". Essay questions are open-ended and graded manually.`,
  };

  const schemaInstructions = requestedTypes
    .map((t) => typeSchemas[t])
    .filter(Boolean)
    .join('\n');

  return `You are an expert quiz generation assistant. Your task is to generate a list of questions on a given topic.
You MUST respond with ONLY a valid JSON object containing a single key "questions" which is an array of question objects.
Do not include any introductory text, explanations, or markdown formatting.

Each question object MUST include a "type" field indicating its question type.

Here are the schemas for each question type you must use:
${schemaInstructions}

IMPORTANT: Follow the exact schema for each type. Do not add extra fields.`;
}

// Build the user prompt with per-type counts
function buildUserPrompt(
  topic: string,
  difficulty: string,
  questionTypes: Record<string, number>,
): string {
  const parts = Object.entries(questionTypes)
    .map(([type, count]) => `${count} ${type}`)
    .join(', ');
  return `Generate the following questions about "${topic}" at a ${difficulty} difficulty level: ${parts}.`;
}

// Save a single generated question to the database
async function saveQuestionToDb(examId: string, q: any) {
  const type = q.type || 'MCQ';
  let finalOptions: any[] = [];
  let correctAnswer: string | null = null;

  if (type === 'MCQ' || type === 'MSQ' || type === 'TRUE_FALSE') {
    finalOptions = q.options || [];
  } else if (type === 'FILL_BLANK') {
    correctAnswer = q.correctAnswer || '';
    finalOptions = [{ text: correctAnswer, isCorrect: true }];
  } else if (type === 'ESSAY') {
    finalOptions = [];
  }

  const questionData = {
    questionText: q.questionText,
    questionType: type,
    options: finalOptions,
    questionInstructions: null,
    correctAnswer,
  };
  const encryptedData = encrypt(JSON.stringify(questionData));
  await pool.query(
    `INSERT INTO questions (exam_id, question_text, options, question_type, encrypted_data)
     VALUES ($1, $2, $3, $4, $5)`,
    [examId, q.questionText, JSON.stringify(finalOptions), type, encryptedData],
  );
}

export const generateAiQuestions = async (req: AuthRequest, res: Response) => {
  const {
    topic,
    difficulty = 'Medium',
    count,
    numQuestions,
    numOptions = 4,
    examId,
    questionTypes,
  } = req.body;

  if (!topic) {
    return res.status(400).json({ message: 'Topic is required.' });
  }

  // Build type breakdown: either from questionTypes map or fall back to all-MCQ
  let typeBreakdown: Record<string, number>;
  if (questionTypes && typeof questionTypes === 'object' && Object.keys(questionTypes).length > 0) {
    typeBreakdown = questionTypes;
  } else {
    const targetCount = count || numQuestions || 5;
    typeBreakdown = { MCQ: targetCount };
  }

  const requestedTypes = Object.keys(typeBreakdown);
  const systemPrompt = buildSystemPrompt(requestedTypes);
  const userPrompt = buildUserPrompt(topic, difficulty, typeBreakdown);

  try {
    const questions = await generateWithFallback(systemPrompt, userPrompt);

    if (examId) {
      for (const q of questions) {
        await saveQuestionToDb(examId, q);
      }
    }

    res.status(200).json(questions);
  } catch (error: any) {
    console.error('Error generating AI questions:', error);
    res.status(500).json({
      message: 'Failed to generate questions from AI.',
      error: error?.message || String(error),
    });
  }
};

export const generateFromDocument = async (req: AuthRequest, res: Response) => {
  const { numQuestions, count, numOptions = 4, examId, questionTypes } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'No document file uploaded.' });
  }

  try {
    let documentText = '';

    if (file.mimetype === 'application/pdf') {
      const data = await pdf(file.buffer);
      documentText = data.text;
    } else if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      documentText = result.value;
    } else {
      return res
        .status(400)
        .json({ message: 'Unsupported file type. Please upload a PDF or DOCX file.' });
    }

    if (documentText.length < 100) {
      return res
        .status(400)
        .json({ message: 'Document is too short to generate meaningful questions.' });
    }

    // Build type breakdown
    let typeBreakdown: Record<string, number>;
    if (
      questionTypes &&
      typeof questionTypes === 'object' &&
      Object.keys(questionTypes).length > 0
    ) {
      typeBreakdown = questionTypes;
    } else {
      const targetCount = count || numQuestions || 5;
      typeBreakdown = { MCQ: targetCount };
    }

    const requestedTypes = Object.keys(typeBreakdown);
    const systemPrompt = buildSystemPrompt(requestedTypes);

    const parts = Object.entries(typeBreakdown)
      .map(([type, c]) => `${c} ${type}`)
      .join(', ');
    const userPrompt = `Based on the following text, generate the following questions: ${parts}.\n\n--- TEXT CONTEXT ---\n${documentText.substring(0, 12000)}\n--- END OF TEXT CONTEXT ---`;

    const questions = await generateWithFallback(systemPrompt, userPrompt);

    if (examId) {
      for (const q of questions) {
        await saveQuestionToDb(examId, q);
      }
    }

    res.status(200).json(questions);
  } catch (error: any) {
    console.error('Error generating from document:', error);
    res.status(500).json({
      message: 'Failed to generate questions from document.',
      error: error?.message || String(error),
    });
  }
};

// Save generated question to guest_quizzes
async function saveGuestQuestionToDb(quizId: string, q: any) {
  let finalOptions = q.options || [];
  if (q.type === 'FILL_BLANK') {
    finalOptions = [{ text: q.correctAnswer || '', isCorrect: true }];
  } else if (q.type === 'ESSAY') {
    finalOptions = [];
  }
  await pool.query(
    `INSERT INTO guest_questions (quiz_id, question_text, options) VALUES ($1, $2, $3)`,
    [quizId, q.questionText, JSON.stringify(finalOptions)]
  );
}

export const generateGuestQuizQuestions = async (req: AuthRequest, res: Response) => {
  const { topic, difficulty = 'Medium', count = 5, quizId } = req.body;
  if (!topic) return res.status(400).json({ message: 'Topic is required.' });

  const typeBreakdown = { MCQ: count };
  const systemPrompt = buildSystemPrompt(['MCQ']);
  const userPrompt = buildUserPrompt(topic, difficulty, typeBreakdown);

  try {
    const questions = await generateWithFallback(systemPrompt, userPrompt);
    if (quizId) {
      for (const q of questions) {
        await saveGuestQuestionToDb(quizId, q);
      }
    }
    res.status(200).json(questions);
  } catch (error: any) {
    console.error('Error generating AI guest quiz questions:', error);
    res.status(500).json({ message: 'Failed to generate guest quiz questions.', error: error?.message });
  }
};

// Save assessment question to certification_module_questions
async function saveCertAssessmentQuestionToDb(moduleId: string, q: any) {
  let finalOptions = q.options || [];
  await pool.query(
    `INSERT INTO certification_module_questions (module_id, question_text, options) VALUES ($1, $2, $3)`,
    [moduleId, q.questionText, JSON.stringify(finalOptions)]
  );
}

export const generateCertificationAssessment = async (req: AuthRequest, res: Response) => {
  const { moduleId } = req.body;
  if (!moduleId) return res.status(400).json({ message: 'moduleId is required.' });

  try {
    // Get module and its settings
    const moduleRes = await pool.query(`SELECT * FROM certification_modules WHERE id = $1`, [moduleId]);
    if (moduleRes.rows.length === 0) return res.status(404).json({ message: 'Module not found.' });
    const module = moduleRes.rows[0];

    const questionCount = module.assessment_question_count || 5;

    // Get units content
    const unitsRes = await pool.query(`SELECT content FROM certification_units WHERE module_id = $1 ORDER BY order_index ASC`, [moduleId]);
    const unitsContent = unitsRes.rows.map(u => u.content).join('\n\n');

    const typeBreakdown = { MCQ: questionCount };
    const systemPrompt = buildSystemPrompt(['MCQ']);
    
    let userPrompt = '';
    if (unitsContent.trim().length > 0) {
      userPrompt = `Based on the following text about "${module.title}", generate ${questionCount} MCQ questions.\n\n--- TEXT CONTEXT ---\n${unitsContent.substring(0, 12000)}\n--- END OF TEXT CONTEXT ---`;
    } else {
      userPrompt = buildUserPrompt(module.title, 'Medium', typeBreakdown);
    }

    const questions = await generateWithFallback(systemPrompt, userPrompt);

    // Delete old assessment questions if they exist
    await pool.query(`DELETE FROM certification_module_questions WHERE module_id = $1`, [moduleId]);

    for (const q of questions) {
      await saveCertAssessmentQuestionToDb(moduleId, q);
    }

    res.status(200).json(questions);
  } catch (error: any) {
    console.error('Error generating certification assessment:', error);
    res.status(500).json({ message: 'Failed to generate assessment.', error: error?.message });
  }
};

// =============================================
// AI Full Certification Course Generation
// =============================================

async function generateCourseWithFallback(systemPrompt: string, userPrompt: string) {
  const modelsToTry = [
    'gemini-2.5-flash',
    'gemini-flash-latest',
    'gemini-3.5-flash',
    'gemini-2.0-flash',
  ];
  let lastError: any;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemPrompt,
      });

      const response = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      });
      let content = response.response.text();
      if (!content) throw new Error('AI returned an empty response.');

      content = content
        .replace(/^```json\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();

      return JSON.parse(content);
    } catch (error: any) {
      console.warn(`Model ${modelName} failed for course gen:`, error?.message || String(error));
      lastError = error;
    }
  }

  throw lastError || new Error('All fallback models failed to generate course content.');
}

export const generateFullCertificationCourse = async (req: AuthRequest, res: Response) => {
  const { topic, moduleCount = 3, audienceLevel = 'Intermediate', description = '' } = req.body;

  if (!topic) {
    return res.status(400).json({ message: 'Topic is required.' });
  }

  const systemPrompt = `You are an expert educational course designer and curriculum developer. Your task is to generate a complete, professional certification course curriculum.

You MUST respond with ONLY a valid JSON object with this exact structure:
{
  "title": "Course Title",
  "description": "Brief 1-2 sentence course description",
  "overview": "Detailed 2-3 paragraph overview of what students will learn, prerequisites, and outcomes",
  "modules": [
    {
      "title": "Module Title",
      "has_assessment": true,
      "passing_rate": 80,
      "assessment_question_count": 5,
      "units": [
        {
          "title": "Unit Title",
          "content": "<rich HTML content>",
          "video_url": ""
        }
      ],
      "assessment_questions": [
        {
          "questionText": "Question?",
          "options": [
            {"text": "Option A", "isCorrect": false},
            {"text": "Option B", "isCorrect": true},
            {"text": "Option C", "isCorrect": false},
            {"text": "Option D", "isCorrect": false}
          ]
        }
      ]
    }
  ]
}

CRITICAL CONTENT RULES:
- Each unit's "content" field must be RICH HTML with professional styling
- Use HTML tables with inline styles for data comparisons (e.g. <table style="width:100%;border-collapse:collapse;margin:16px 0"><thead><tr style="background:#111A50;color:#fff"><th style="padding:12px;text-align:left">...</th></tr></thead><tbody>...</tbody></table>)
- Use styled section headers: <h3 style="color:#111A50;border-bottom:2px solid #111A50;padding-bottom:8px;margin-top:24px">Section Title</h3>
- Use info boxes: <div style="background:#f0f4ff;border-left:4px solid #111A50;padding:16px;margin:16px 0;border-radius:4px"><strong>💡 Key Takeaway:</strong> Important point here</div>
- Use warning boxes: <div style="background:#fff3e0;border-left:4px solid #ff9800;padding:16px;margin:16px 0;border-radius:4px"><strong>⚠️ Important:</strong> Warning content</div>
- Use ordered and unordered lists with proper spacing
- Use <code style="background:#e8eaf6;padding:2px 6px;border-radius:3px;font-family:monospace">inline code</code> for technical terms
- Use <pre style="background:#1e1e1e;color:#d4d4d4;padding:16px;border-radius:8px;overflow-x:auto"><code>code blocks</code></pre> for code examples when relevant
- Include SVG diagrams or flowcharts where they help explain concepts (use inline SVG with viewBox)
- Each unit content should be AT LEAST 800 words of substantive educational content
- Make the content genuinely educational, not placeholder text
- Include real-world examples, case studies, and practical applications

Each module should have 2-3 units and 5 MCQ assessment questions.
Do NOT include any text outside the JSON object.`;

  const userPrompt = `Generate a complete ${audienceLevel}-level certification course about "${topic}" with exactly ${moduleCount} modules.${description ? `\n\nAdditional context: ${description}` : ''}

Requirements:
- Each module should have 2-3 units with rich, educational HTML content
- Include HTML tables for comparisons and structured data
- Include styled info boxes and key takeaways
- Include SVG diagrams where they add value
- Each module needs 5 MCQ assessment questions with correct answers
- Target audience: ${audienceLevel} level learners
- Make the content comprehensive, professional, and genuinely educational`;

  try {
    const course = await generateCourseWithFallback(systemPrompt, userPrompt);

    // Validate structure
    if (!course.title || !course.modules || !Array.isArray(course.modules)) {
      return res.status(500).json({ message: 'AI generated an invalid course structure.' });
    }

    // Normalize the output
    const normalizedCourse = {
      title: course.title,
      description: course.description || '',
      overview: course.overview || '',
      modules: course.modules.map((mod: any, i: number) => ({
        id: `ai-${Date.now()}-${i}`,
        title: mod.title || `Module ${i + 1}`,
        order_index: i,
        has_assessment: mod.has_assessment !== false,
        passing_rate: mod.passing_rate || 80,
        assessment_question_count: mod.assessment_question_count || 5,
        units: (mod.units || []).map((unit: any, j: number) => ({
          id: `ai-unit-${Date.now()}-${i}-${j}`,
          title: unit.title || `Unit ${j + 1}`,
          content: unit.content || '',
          video_url: unit.video_url || '',
          order_index: j,
        })),
        assessment_questions: mod.assessment_questions || [],
      })),
    };

    res.status(200).json(normalizedCourse);
  } catch (error: any) {
    console.error('Error generating full certification course:', error);
    res.status(500).json({
      message: 'Failed to generate certification course.',
      error: error?.message || String(error),
    });
  }
};

