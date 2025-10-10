// /backend/src/controllers/examController.ts

import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware'; // THE MISSING IMPORT
import pool from '../services/db';

// ---------------------------------------------------------
// Create Exam
// ---------------------------------------------------------
export const createExam = async (req: AuthRequest, res: Response) => {
    const { title } = req.body;
    const courseAdminId = req.user?.userId;
    const organizationId = req.user?.organizationId;

    if (!title) {
        return res.status(400).json({ message: 'Exam title is required' });
    }

    try {
        const query = `
            INSERT INTO exams (title, course_admin_id, organization_id)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const newExam = await pool.query(query, [title, courseAdminId, organizationId]);
        res.status(201).json(newExam.rows[0]);
    } catch (error) {
        console.error('Error creating exam:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// ---------------------------------------------------------
// Get All Exams for Course Admin
// ---------------------------------------------------------
export const getExamsForCourseAdmin = async (req: AuthRequest, res: Response) => {
    const courseAdminId = req.user?.userId;
    try {
        const query = `
            SELECT * FROM exams 
            WHERE course_admin_id = $1 
            ORDER BY created_at DESC;
        `;
        const result = await pool.query(query, [courseAdminId]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching exams:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// ---------------------------------------------------------
// Get Exam by ID
// ---------------------------------------------------------
export const getExamById = async (req: AuthRequest, res: Response) => {
    const { examId } = req.params;
    const courseAdminId = req.user?.userId;

    try {
        const examResult = await pool.query(
            'SELECT * FROM exams WHERE id = $1 AND course_admin_id = $2',
            [examId, courseAdminId]
        );

        if (examResult.rows.length === 0) {
            return res.status(404).json({ message: 'Exam not found or you do not have permission to view it.' });
        }

        const questionsResult = await pool.query(
            'SELECT * FROM questions WHERE exam_id = $1 ORDER BY created_at ASC',
            [examId]
        );

        const examData = {
            ...examResult.rows[0],
            questions: questionsResult.rows || [],
        };

        res.status(200).json(examData);
    } catch (error) {
        console.error('Error fetching exam by ID:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// ---------------------------------------------------------
// Add Question to Exam
// ---------------------------------------------------------
export const addQuestionToExam = async (req: AuthRequest, res: Response) => {
    const { examId } = req.params;
    const { questionText, options } = req.body;
    const courseAdminId = req.user?.userId;

    if (!questionText || !options || !Array.isArray(options) || options.length === 0) {
        return res.status(400).json({ message: 'Question text and an array of options are required.' });
    }
    if (!options.some((opt: any) => opt.isCorrect === true)) {
        return res.status(400).json({ message: 'At least one option must be marked as correct.' });
    }

    try {
        const examCheck = await pool.query(
            'SELECT id FROM exams WHERE id = $1 AND course_admin_id = $2',
            [examId, courseAdminId]
        );

        if (examCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Forbidden: You do not own this exam or it does not exist.' });
        }

        const query = `
            INSERT INTO questions (exam_id, question_text, options)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const newQuestion = await pool.query(query, [examId, questionText, JSON.stringify(options)]);
        res.status(201).json(newQuestion.rows[0]);
    } catch (error) {
        console.error('Error adding question to exam:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// ---------------------------------------------------------
// Update Exam Settings
// ---------------------------------------------------------
export const updateExamSettings = async (req: AuthRequest, res: Response) => {
    const { examId } = req.params;
    const { status, grading_scale, duration_minutes } = req.body;
    const courseAdminId = req.user?.userId;

    if (!status && !grading_scale && !duration_minutes) {
        return res.status(400).json({ message: 'No settings provided to update.' });
    }

    try {
        let query = 'UPDATE exams SET updated_at = NOW()';
        const queryParams: any[] = [];
        let paramIndex = 1;

        if (grading_scale) {
            query += `, grading_scale = $${paramIndex++}`;
            queryParams.push(JSON.stringify(grading_scale));
        }
        if (status) {
            query += `, status = $${paramIndex++}`;
            queryParams.push(status);
        }
        if (duration_minutes) {
            query += `, duration_minutes = $${paramIndex++}`;
            queryParams.push(duration_minutes);
        }

        query += ` WHERE id = $${paramIndex++} AND course_admin_id = $${paramIndex++} RETURNING *`;
        queryParams.push(examId, courseAdminId);

        const result = await pool.query(query, queryParams);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Exam not found or you do not have permission to edit it.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error updating exam settings:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// ---------------------------------------------------------
// Archive, Delete, Restore Exam
// ---------------------------------------------------------
export const archiveExam = async (req: AuthRequest, res: Response) => { /* ... (code from previous step) ... */ };
export const deleteExam = async (req: AuthRequest, res: Response) => { /* ... (code from previous step) ... */ };
export const restoreExam = async (req: AuthRequest, res: Response) => { /* ... (code from previous step) ... */ };

// ================== GET EXAM RESULTS (NEW FUNCTION) ==================
export const getExamResults = async (req: AuthRequest, res: Response) => {
    const { examId } = req.params;
    const courseAdminId = req.user?.userId;

    try {
        // Step 1: Security check - does this admin own the exam?
        const examCheckQuery = 'SELECT id FROM exams WHERE id = $1 AND course_admin_id = $2';
        const examCheckResult = await pool.query(examCheckQuery, [examId, courseAdminId]);

        if (examCheckResult.rows.length === 0) {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to view results for this exam.' });
        }

        // Step 2: Fetch all submissions for this exam and join with user data
        const resultsQuery = `
            SELECT 
                es.id as submission_id,
                es.score_percentage,
                es.grade,
                es.submitted_at,
                u.full_name as student_name,
                u.student_id
            FROM exam_submissions es
            JOIN users u ON es.student_id = u.id
            WHERE es.exam_id = $1
            ORDER BY es.score_percentage DESC;
        `;
        const resultsResult = await pool.query(resultsQuery, [examId]);

        res.status(200).json(resultsResult.rows);

    } catch (error) {
        console.error('Error fetching exam results:', error);
        res.status(500).json({ message: 'Internal server error while fetching results.' });
    }
};