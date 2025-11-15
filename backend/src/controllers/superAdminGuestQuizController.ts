// /backend/src/controllers/superAdminGuestQuizController.ts

import { Request, Response } from 'express';
import pool from '../services/db';
import { AuthRequest } from '../middleware/authMiddleware'; // Added AuthRequest import

// Helper interface for consistency
interface QuizOption {
    text: string;
    isCorrect: boolean;
}

/**
 * =====================================
 * HELPER FUNCTION (Copied from superAdminController)
 * =====================================
 */

/**
 * Logs an action to the audit_log table.
 */
const logAudit = async (
  action: string, 
  details: string, 
  userId: string | null | undefined, 
  organizationId: string | null | undefined
) => {
  try {
    const query = `
      INSERT INTO audit_log (action, details, user_id, organization_id)
      VALUES ($1, $2, $3, $4)
    `;
    // Fire-and-forget
    pool.query(query, [action, details, userId, organizationId]);
  } catch (err) {
    console.error('Failed to write to audit log:', err);
  }
};


/**
 * =====================================
 * GUEST QUIZ MANAGEMENT
 * =====================================
 */

// 1. Create a New Guest Quiz
export const createGuestQuiz = async (req: AuthRequest, res: Response) => {
    const { title, category } = req.body;
    const adminUserId = req.user?.userId; // For logging

    if (!title || !category) {
        return res.status(400).json({ message: 'Title and category are required to create a quiz.' });
    }
    try {
        const result = await pool.query(
            'INSERT INTO guest_quizzes (title, category, status) VALUES ($1, $2, $3) RETURNING *',
            [title, category, 'draft'] // New quizzes start as 'draft'
        );
        const newQuiz = result.rows[0];

        // --- AUDIT LOG ---
        logAudit(
          'guest_quiz_created',
          `Created guest quiz: ${newQuiz.title}`,
          adminUserId,
          null // Guest quizzes are not tied to an org
        );
        // -----------------

        res.status(201).json(newQuiz);
    } catch (error) {
        console.error("Error creating guest quiz:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// 2. Get All Guest Quizzes (for Admin Dashboard)
export const getAllGuestQuizzes = async (req: AuthRequest, res: Response) => {
    try {
        const query = `
            SELECT
                gq.id,
                gq.title,
                gq.category,
                gq.status,
                gq.created_at,
                gq.updated_at,
                COALESCE(gq.average_rating, 0.0) AS average_rating, 
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
                gq.average_rating
            ORDER BY gq.created_at DESC;
        `;
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching all guest quizzes for admin:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// 3. Get Specific Guest Quiz by ID (for Admin to Edit)
export const getGuestQuizById = async (req: AuthRequest, res: Response) => {
    const { quizId } = req.params;
    try {
        const quizResult = await pool.query('SELECT * FROM guest_quizzes WHERE id = $1', [quizId]);
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
export const updateGuestQuiz = async (req: AuthRequest, res: Response) => {
    const { quizId } = req.params;
    const { title, category, status } = req.body;
    const adminUserId = req.user?.userId;
    try {
        const result = await pool.query(
            'UPDATE guest_quizzes SET title = $1, category = $2, status = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
            [title, category, status, quizId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Guest quiz not found.' });
        }
        const updatedQuiz = result.rows[0];

        // --- AUDIT LOG ---
        logAudit(
          'guest_quiz_updated',
          `Updated guest quiz: ${updatedQuiz.title} (Status: ${updatedQuiz.status})`,
          adminUserId,
          null
        );
        // -----------------

        res.status(200).json(updatedQuiz);
    } catch (error) {
        console.error("Error updating guest quiz:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// 5. Delete a Guest Quiz (Safer Transactional Delete)
export const deleteGuestQuiz = async (req: AuthRequest, res: Response) => {
    const { quizId } = req.params;
    const adminUserId = req.user?.userId;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Get quiz title for logging before deleting
        const titleResult = await client.query('SELECT title FROM guest_quizzes WHERE id = $1', [quizId]);
        if (titleResult.rows.length === 0) {
          throw new Error('Quiz not found');
        }
        const quizTitle = titleResult.rows[0].title;

        // 2. Delete all questions associated with the quiz
        await client.query('DELETE FROM guest_questions WHERE quiz_id = $1', [quizId]);
        
        // 3. Delete all submissions associated with the quiz
        await client.query('DELETE FROM guest_submissions WHERE quiz_id = $1', [quizId]);
        
        // 4. Finally, delete the quiz itself
        const result = await client.query('DELETE FROM guest_quizzes WHERE id = $1', [quizId]);

        if (result.rowCount === 0) {
            // This case should be caught by the title check, but as a safeguard
            return res.status(404).json({ message: 'Guest quiz not found.' });
        }

        // --- AUDIT LOG ---
        logAudit(
          'guest_quiz_deleted',
          `Deleted guest quiz: ${quizTitle} (ID: ${quizId})`,
          adminUserId,
          null
        );
        // -----------------
        
        await client.query('COMMIT');
        
        res.status(200).json({ message: 'Guest quiz and all associated questions/submissions deleted successfully.' });
    
    } catch (error: any) {
        await client.query('ROLLBACK');
        console.error("Error deleting guest quiz:", error);
        if (error.message === 'Quiz not found') {
            return res.status(404).json({ message: 'Guest quiz not found.' });
        }
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        client.release();
    }
};

// --- Question Management Functions ---

// 6. Add a Question to a Guest Quiz
export const addGuestQuizQuestion = async (req: AuthRequest, res: Response) => {
    const { quizId } = req.params;
    const adminUserId = req.user?.userId;
    const { question_text, options } = req.body;

    if (!question_text || !options || !Array.isArray(options) || options.length < 2) {
        return res.status(400).json({ message: 'Question text and at least two options are required.' });
    }
    if (!options.some((opt: QuizOption) => opt.isCorrect)) {
        return res.status(400).json({ message: 'At least one option must be marked as correct.' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO guest_questions (quiz_id, question_text, options) VALUES ($1, $2, $3) RETURNING *',
            [quizId, question_text, JSON.stringify(options)]
        );
        const newQuestion = result.rows[0];

        // --- AUDIT LOG ---
        logAudit(
          'guest_question_created',
          `New question added to quiz ${quizId}: ${newQuestion.question_text.substring(0, 50)}...`,
          adminUserId,
          null
        );
        // -----------------

        res.status(201).json(newQuestion);
    } catch (error) {
        console.error("Error adding guest quiz question to DB:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// 7. Update a Question in a Guest Quiz
export const updateGuestQuizQuestion = async (req: AuthRequest, res: Response) => {
    const { questionId } = req.params;
    const { question_text, options } = req.body;
    const adminUserId = req.user?.userId;

    if (!question_text || !options || !Array.isArray(options) || options.length < 2) {
        return res.status(400).json({ message: 'Question text and at least two options are required.' });
    }
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

        // --- AUDIT LOG ---
        logAudit(
          'guest_question_updated',
          `Updated question ${questionId}`,
          adminUserId,
          null
        );
        // -----------------

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Error updating guest quiz question:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// 8. Delete a Question from a Guest Quiz
export const deleteGuestQuizQuestion = async (req: AuthRequest, res: Response) => {
    const { questionId } = req.params;
    const adminUserId = req.user?.userId;
    try {
        const result = await pool.query('DELETE FROM guest_questions WHERE id = $1 RETURNING id, question_text, quiz_id', [questionId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Guest quiz question not found.' });
        }

        // --- AUDIT LOG ---
        logAudit(
          'guest_question_deleted',
          `Deleted question: ${result.rows[0].question_text.substring(0, 50)}... from quiz ${result.rows[0].quiz_id}`,
          adminUserId,
          null
        );
        // -----------------

        res.status(200).json({ message: 'Guest quiz question deleted successfully.' });
    } catch (error) {
        console.error("Error deleting guest quiz question:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};