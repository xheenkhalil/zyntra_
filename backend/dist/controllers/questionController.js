"use strict";
// /backend/src/controllers/questionController.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteQuestion = exports.updateQuestion = void 0;
const db_1 = __importDefault(require("../services/db"));
const updateQuestion = async (req, res) => {
    const { questionId } = req.params;
    const { questionText, options } = req.body;
    const courseAdminId = req.user?.userId;
    if (!questionText || !options) {
        return res.status(400).json({ message: 'Question text and options are required.' });
    }
    try {
        // Security Check: Join with exams table to ensure the user owns the exam this question belongs to.
        const query = `
            UPDATE questions q SET
                question_text = $1,
                options = $2
            FROM exams e
            WHERE q.id = $3 AND q.exam_id = e.id AND e.course_admin_id = $4
            RETURNING q.*;
        `;
        const result = await db_1.default.query(query, [questionText, JSON.stringify(options), questionId, courseAdminId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Question not found or you do not have permission to edit it.' });
        }
        res.status(200).json(result.rows[0]);
    }
    catch (error) {
        console.error('Error updating question:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateQuestion = updateQuestion;
const deleteQuestion = async (req, res) => {
    const { questionId } = req.params;
    const courseAdminId = req.user?.userId;
    try {
        // Security Check: Join with exams table to ensure user owns the parent exam.
        const query = `
            DELETE FROM questions q
            USING exams e
            WHERE q.id = $1 AND q.exam_id = e.id AND e.course_admin_id = $2;
        `;
        const result = await db_1.default.query(query, [questionId, courseAdminId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Question not found or you do not have permission to delete it.' });
        }
        res.status(204).send(); // Success, no content
    }
    catch (error) {
        console.error('Error deleting question:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteQuestion = deleteQuestion;
