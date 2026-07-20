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
