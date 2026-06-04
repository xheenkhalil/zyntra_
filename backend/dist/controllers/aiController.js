"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFromDocument = exports.generateAiQuestions = void 0;
const generative_ai_1 = require("@google/generative-ai");
const config_1 = __importDefault(require("../config"));
const mammoth_1 = __importDefault(require("mammoth"));
const db_1 = __importDefault(require("../services/db"));
const encryptionService_1 = require("../services/encryptionService");
const pdf = require('pdf-parse');
const genAI = new generative_ai_1.GoogleGenerativeAI(config_1.default.GEMINI_API_KEY);
async function generateWithFallback(systemPrompt, userPrompt) {
    const modelsToTry = [
        'gemini-2.5-flash',
        'gemini-flash-latest',
        'gemini-3.5-flash',
        'gemini-2.0-flash'
    ];
    let lastError;
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
            if (!content)
                throw new Error('AI returned an empty response.');
            content = content.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
            const result = JSON.parse(content);
            const questions = result.questions || result;
            if (!Array.isArray(questions))
                throw new Error('AI did not return a valid array of questions.');
            return questions;
        }
        catch (error) {
            console.warn(`Model ${modelName} failed:`, error?.message || String(error));
            lastError = error;
        }
    }
    throw lastError || new Error('All fallback models failed to generate valid content.');
}
// Build the system prompt dynamically based on which question types are requested
function buildSystemPrompt(requestedTypes) {
    const typeSchemas = {
        MCQ: `For MCQ (Multiple Choice Question): The object must have "type": "MCQ", "questionText": string, and "options": an array of 4 option objects. Each option has "text" (string) and "isCorrect" (boolean). Exactly ONE option must have "isCorrect": true.`,
        MSQ: `For MSQ (Multiple Select Question): The object must have "type": "MSQ", "questionText": string, and "options": an array of 4-5 option objects. Each option has "text" (string) and "isCorrect" (boolean). TWO or MORE options must have "isCorrect": true.`,
        TRUE_FALSE: `For TRUE_FALSE (True or False): The object must have "type": "TRUE_FALSE", "questionText": string, and "options": an array of exactly 2 option objects: [{"text": "True", "isCorrect": <boolean>}, {"text": "False", "isCorrect": <boolean>}]. Exactly one must be correct.`,
        FILL_BLANK: `For FILL_BLANK (Fill in the Blank): The object must have "type": "FILL_BLANK", "questionText": string (use a blank marker like "___" in the text where the answer goes), and "correctAnswer": string (the correct answer text). Do NOT include an "options" array.`,
        ESSAY: `For ESSAY: The object must have "type": "ESSAY" and "questionText": string. Do NOT include "options" or "correctAnswer". Essay questions are open-ended and graded manually.`,
    };
    const schemaInstructions = requestedTypes.map(t => typeSchemas[t]).filter(Boolean).join('\n');
    return `You are an expert quiz generation assistant. Your task is to generate a list of questions on a given topic.
You MUST respond with ONLY a valid JSON object containing a single key "questions" which is an array of question objects.
Do not include any introductory text, explanations, or markdown formatting.

Each question object MUST include a "type" field indicating its question type.

Here are the schemas for each question type you must use:
${schemaInstructions}

IMPORTANT: Follow the exact schema for each type. Do not add extra fields.`;
}
// Build the user prompt with per-type counts
function buildUserPrompt(topic, difficulty, questionTypes) {
    const parts = Object.entries(questionTypes)
        .map(([type, count]) => `${count} ${type}`)
        .join(', ');
    return `Generate the following questions about "${topic}" at a ${difficulty} difficulty level: ${parts}.`;
}
// Save a single generated question to the database
async function saveQuestionToDb(examId, q) {
    const type = q.type || 'MCQ';
    let finalOptions = [];
    let correctAnswer = null;
    if (type === 'MCQ' || type === 'MSQ' || type === 'TRUE_FALSE') {
        finalOptions = q.options || [];
    }
    else if (type === 'FILL_BLANK') {
        correctAnswer = q.correctAnswer || '';
        finalOptions = [{ text: correctAnswer, isCorrect: true }];
    }
    else if (type === 'ESSAY') {
        finalOptions = [];
    }
    const questionData = {
        questionText: q.questionText,
        questionType: type,
        options: finalOptions,
        questionInstructions: null,
        correctAnswer,
    };
    const encryptedData = (0, encryptionService_1.encrypt)(JSON.stringify(questionData));
    await db_1.default.query(`INSERT INTO questions (exam_id, question_text, options, question_type, encrypted_data)
     VALUES ($1, $2, $3, $4, $5)`, [examId, q.questionText, JSON.stringify(finalOptions), type, encryptedData]);
}
const generateAiQuestions = async (req, res) => {
    const { topic, difficulty = 'Medium', count, numQuestions, numOptions = 4, examId, questionTypes } = req.body;
    if (!topic) {
        return res.status(400).json({ message: 'Topic is required.' });
    }
    // Build type breakdown: either from questionTypes map or fall back to all-MCQ
    let typeBreakdown;
    if (questionTypes && typeof questionTypes === 'object' && Object.keys(questionTypes).length > 0) {
        typeBreakdown = questionTypes;
    }
    else {
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
    }
    catch (error) {
        console.error('Error generating AI questions:', error);
        res.status(500).json({ message: 'Failed to generate questions from AI.', error: error?.message || String(error) });
    }
};
exports.generateAiQuestions = generateAiQuestions;
const generateFromDocument = async (req, res) => {
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
        }
        else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const result = await mammoth_1.default.extractRawText({ buffer: file.buffer });
            documentText = result.value;
        }
        else {
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
        let typeBreakdown;
        if (questionTypes && typeof questionTypes === 'object' && Object.keys(questionTypes).length > 0) {
            typeBreakdown = questionTypes;
        }
        else {
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
    }
    catch (error) {
        console.error('Error generating from document:', error);
        res.status(500).json({ message: 'Failed to generate questions from document.', error: error?.message || String(error) });
    }
};
exports.generateFromDocument = generateFromDocument;
