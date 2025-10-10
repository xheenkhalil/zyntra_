// /backend/src/controllers/superAdminGuestQuizController.ts

import { Request, Response } from 'express';
import pool from '../services/db';

// Helper interface for consistency
interface QuizOption {
    text: string;
    isCorrect: boolean;
}

// 1. Create a New Guest Quiz
export const createGuestQuiz = async (req: Request, res: Response) => {
    const { title, category } = req.body; // Expecting title and category
    if (!title || !category) {
        return res.status(400).json({ message: 'Title and category are required to create a quiz.' });
    }
    try {
        const result = await pool.query(
            'INSERT INTO guest_quizzes (title, category, status) VALUES ($1, $2, $3) RETURNING *',
            [title, category, 'draft'] // New quizzes start as 'draft'
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error creating guest quiz:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// 2. Get All Guest Quizzes (for Admin Dashboard)
export const getAllGuestQuizzes = async (req: Request, res: Response) => {
    try {
        // We want all quizzes for the admin, including drafts.
        // We now select the average_rating directly from guest_quizzes as it's a stored column.
        // participant_count is still calculated on the fly.
        const query = `
            SELECT
                gq.id,
                gq.title,
                gq.category,
                gq.status,
                gq.created_at,
                gq.updated_at,
                -- Select the pre-calculated and stored average_rating from guest_quizzes table.
                -- Use COALESCE to ensure it's always a number (default to 0.0 if NULL).
                COALESCE(gq.average_rating, 0.0) AS average_rating, 
                -- Calculate participant_count on the fly from guest_submissions.
                -- Use COALESCE to ensure it's always an integer (default to 0 if NULL).
                COALESCE(CAST(COUNT(DISTINCT gs.id) AS INTEGER), 0) AS participant_count
            FROM guest_quizzes gq
            LEFT JOIN guest_submissions gs ON gq.id = gs.quiz_id
            GROUP BY 
                gq.id, 
                gq.title, 
                gq.category, 
                gq.status, 
                gq.created_at, 
                gq.updated_at, 
                gq.average_rating -- All non-aggregated columns from gq must be in GROUP BY
            ORDER BY gq.created_at DESC;
        `;
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching all guest quizzes for admin:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// 3. Get Specific Guest Quiz by ID (for Admin to Edit, includes questions and correct answers)
export const getGuestQuizById = async (req: Request, res: Response) => {
    const { quizId } = req.params;
    try {
        const quizResult = await pool.query('SELECT id, title, category, status, created_at, updated_at, average_rating FROM guest_quizzes WHERE id = $1', [quizId]);
        if (quizResult.rows.length === 0) {
            return res.status(404).json({ message: 'Guest quiz not found.' });
        }

        const questionsResult = await pool.query('SELECT id, question_text, options FROM guest_questions WHERE quiz_id = $1 ORDER BY created_at', [quizId]);
        
        res.status(200).json({
            ...quizResult.rows[0],
            questions: questionsResult.rows
        });
    } catch (error) {
        console.error("Error fetching specific guest quiz for admin:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// 4. Update a Guest Quiz (Title, Category, Status)
export const updateGuestQuiz = async (req: Request, res: Response) => {
    const { quizId } = req.params;
    const { title, category, status } = req.body;
    try {
        const result = await pool.query(
            'UPDATE guest_quizzes SET title = $1, category = $2, status = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
            [title, category, status, quizId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Guest quiz not found.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Error updating guest quiz:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// 5. Delete a Guest Quiz
export const deleteGuestQuiz = async (req: Request, res: Response) => {
    const { quizId } = req.params;
    try {
        // Important: Deleting a quiz should also cascade delete its questions and submissions.
        // Ensure your database foreign key constraints are set to ON DELETE CASCADE.
        // If not, you'd need to manually delete questions and submissions first.
        const result = await pool.query('DELETE FROM guest_quizzes WHERE id = $1 RETURNING id', [quizId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Guest quiz not found.' });
        }
        res.status(200).json({ message: 'Guest quiz and associated data deleted successfully.' });
    } catch (error) {
        console.error("Error deleting guest quiz:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// --- Question Management Functions ---

// 6. Add a Question to a Guest Quiz
export const addGuestQuizQuestion = async (req: Request, res: Response) => {
    const { quizId } = req.params;

    // --- DEBUGGING LINES ---
    console.log('\n--- Incoming Request to addGuestQuizQuestion ---');
    console.log('req.params:', req.params);
    console.log('req.body (before destructure):', req.body);
    console.log('Content-Type header:', req.headers['content-type']);
    // --- END DEBUGGING LINES ---

    const { question_text, options } = req.body; // options is an array of { text: string, isCorrect: boolean }
    
    // --- DEBUGGING LINES ---
    console.log('Destructured question_text:', question_text);
    console.log('Destructured options:', options);
    // --- END DEBUGGING LINES ---

    if (!question_text || !options || !Array.isArray(options) || options.length < 2) {
        console.warn('Validation failed for addGuestQuizQuestion:', { question_text, options }); // Add warn
        return res.status(400).json({ message: 'Question text and at least two options are required.' });
    }
    // Basic validation: ensure at least one option is marked as correct
    if (!options.some((opt: QuizOption) => opt.isCorrect)) {
        console.warn('Validation failed: No correct option specified.'); // Add warn
        return res.status(400).json({ message: 'At least one option must be marked as correct.' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO guest_questions (quiz_id, question_text, options) VALUES ($1, $2, $3) RETURNING *',
            [quizId, question_text, JSON.stringify(options)]
        );
        console.log('Question added successfully:', result.rows[0]); // Success log
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error adding guest quiz question to DB:", error); // More specific error log
        res.status(500).json({ message: 'Internal server error' });
    }
};

// 7. Update a Question in a Guest Quiz
export const updateGuestQuizQuestion = async (req: Request, res: Response) => {
    const { questionId } = req.params;
    const { question_text, options } = req.body;
    if (!question_text || !options || !Array.isArray(options) || options.length < 2) {
        return res.status(400).json({ message: 'Question text and at least two options are required.' });
    }
    // Basic validation: ensure at least one option is marked as correct
    if (!options.some((opt: QuizOption) => opt.isCorrect)) {
        return res.status(400).json({ message: 'At least one option must be marked as correct.' });
    }

    try {
        const result = await pool.query(
            'UPDATE guest_questions SET question_text = $1, options = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
            [question_text, JSON.stringify(options), questionId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Guest quiz question not found.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Error updating guest quiz question:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// 8. Delete a Question from a Guest Quiz
export const deleteGuestQuizQuestion = async (req: Request, res: Response) => {
    const { questionId } = req.params;
    try {
        const result = await pool.query('DELETE FROM guest_questions WHERE id = $1 RETURNING id', [questionId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Guest quiz question not found.' });
        }
        res.status(200).json({ message: 'Guest quiz question deleted successfully.' });
    } catch (error) {
        console.error("Error deleting guest quiz question:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};