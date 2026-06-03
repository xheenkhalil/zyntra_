import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config';
import mammoth from 'mammoth';
const pdf = require('pdf-parse');

const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY as string);

export const generateAiQuestions = async (req: AuthRequest, res: Response) => {
  const { topic, difficulty, numQuestions = 5, numOptions = 4 } = req.body;

  if (!topic || !difficulty) {
    return res.status(400).json({ message: 'Topic and difficulty are required.' });
  }

  const systemPrompt = `You are an expert quiz generation assistant. Your task is to generate a list of multiple-choice questions on a given topic. You MUST respond with ONLY a valid JSON object containing a single key "questions" which is an array of question objects. Do not include any introductory text, explanations, or markdown formatting. Each object in the "questions" array must have two keys: "questionText" (a string) and "options" (an array of objects). Each option object must have two keys: "text" (a string for the option) and "isCorrect" (a boolean). For each question, exactly ONE option must have "isCorrect" set to true.`;
  const userPrompt = `Generate ${numQuestions} questions about "${topic}" at a ${difficulty} difficulty level. Each question should have ${numOptions} options.`;

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemPrompt,
    });

    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    });

    const content = response.response.text();
    if (!content) throw new Error('AI returned an empty response.');

    const result = JSON.parse(content);
    const questions = result.questions || result;

    if (!Array.isArray(questions)) throw new Error('AI did not return a valid array of questions.');

    res.status(200).json(questions);
  } catch (error) {
    console.error('Error generating AI questions:', error);
    res.status(500).json({ message: 'Failed to generate questions from AI.' });
  }
};

export const generateFromDocument = async (req: AuthRequest, res: Response) => {
  const { numQuestions = 5, numOptions = 4 } = req.body;
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

    const systemPrompt = `You are an expert quiz generation assistant. Your task is to generate a list of multiple-choice questions based *only* on the provided text context. You MUST respond with ONLY a valid JSON object containing a single key "questions" which is an array of question objects. Do not include any introductory text, explanations, or markdown formatting. Each object in the "questions" array must have two keys: "questionText" (a string) and "options" (an array of objects). Each option object must have two keys: "text" (a string for the option) and "isCorrect" (a boolean). For each question, exactly ONE option must have "isCorrect" set to true.`;
    const userPrompt = `Based on the following text, generate ${numQuestions} multiple-choice questions. Each question should have ${numOptions} options.\n\n--- TEXT CONTEXT ---\n${documentText.substring(0, 12000)}\n--- END OF TEXT CONTEXT ---`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemPrompt,
    });

    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    });

    const content = response.response.text();
    if (!content) throw new Error('AI returned an empty response.');

    const result = JSON.parse(content);
    const questions = result.questions || result;

    if (!Array.isArray(questions)) throw new Error('AI did not return a valid array.');

    res.status(200).json(questions);
  } catch (error) {
    console.error('Error generating from document:', error);
    res.status(500).json({ message: 'Failed to generate questions from document.' });
  }
};
