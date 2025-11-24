"use strict";
// /backend/src/controllers/examController.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExamResults = exports.restoreExam = exports.deleteExam = exports.archiveExam = exports.updateExamSettings = exports.deleteQuestion = exports.updateQuestionInExam = exports.addQuestionToExam = exports.getExamById = exports.getExamsForCourseAdmin = exports.createExam = void 0;
const db_1 = __importDefault(require("../services/db"));
// ---------------------------------------------------------
// Create Exam
// ---------------------------------------------------------
const createExam = async (req, res) => {
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
        const newExam = await db_1.default.query(query, [title, courseAdminId, organizationId]);
        res.status(201).json(newExam.rows[0]);
    }
    catch (error) {
        console.error('Error creating exam:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createExam = createExam;
// ---------------------------------------------------------
// Get All Exams for Course Admin
// ---------------------------------------------------------
const getExamsForCourseAdmin = async (req, res) => {
    const courseAdminId = req.user?.userId;
    const organizationId = req.user?.organizationId;
    try {
        // Get all exams
        const examsQuery = `SELECT * FROM exams WHERE course_admin_id = $1 ORDER BY created_at DESC`;
        const examsResult = await db_1.default.query(examsQuery, [courseAdminId]);
        // Get total students in admin's organization
        const studentsQuery = `SELECT COUNT(*) as total_students FROM users WHERE organization_id = $1 AND role = 'student'`;
        const studentsResult = await db_1.default.query(studentsQuery, [organizationId]);
        const totalStudents = parseInt(studentsResult.rows[0]?.total_students) || 0;
        // For each exam, get question data and submission stats
        const formattedExams = await Promise.all(examsResult.rows.map(async (exam) => {
            // Question data
            const questionsQuery = `
                SELECT 
                    COUNT(*) as total_questions,
                    ARRAY_AGG(DISTINCT question_type) FILTER (WHERE question_type IS NOT NULL) as question_types
                FROM questions 
                WHERE exam_id = $1
            `;
            const questionResult = await db_1.default.query(questionsQuery, [exam.id]);
            const questionData = questionResult.rows[0];
            // Submission stats
            const submissionsQuery = `
                SELECT 
                    COUNT(DISTINCT student_id) as completed_count,
                    COUNT(DISTINCT CASE WHEN auto_submitted = true THEN student_id END) as auto_submitted_count
                FROM exam_submissions 
                WHERE exam_id = $1 AND status = 'completed'
            `;
            const submissionsResult = await db_1.default.query(submissionsQuery, [exam.id]);
            const submissionData = submissionsResult.rows[0];
            const completedCount = parseInt(submissionData.completed_count) || 0;
            const autoSubmittedCount = parseInt(submissionData.auto_submitted_count) || 0;
            const pendingCount = Math.max(0, totalStudents - completedCount);
            return {
                ...exam,
                total_questions: parseInt(questionData.total_questions) || 0,
                question_types: questionData.question_types || [],
                time_limit: exam.duration_minutes || 60,
                stats: {
                    registered: totalStudents,
                    completed: completedCount,
                    pending: pendingCount,
                    auto_submitted: autoSubmittedCount,
                    proctoring_defaulters: 0,
                }
            };
        }));
        res.status(200).json(formattedExams);
    }
    catch (error) {
        console.error('Error fetching exams:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getExamsForCourseAdmin = getExamsForCourseAdmin;
// ---------------------------------------------------------
// Get Exam by ID
// ---------------------------------------------------------
const getExamById = async (req, res) => {
    const { examId } = req.params;
    const courseAdminId = req.user?.userId;
    try {
        const examResult = await db_1.default.query('SELECT * FROM exams WHERE id = $1 AND course_admin_id = $2', [examId, courseAdminId]);
        if (examResult.rows.length === 0) {
            return res.status(404).json({ message: 'Exam not found or you do not have permission to view it.' });
        }
        const questionsResult = await db_1.default.query('SELECT * FROM questions WHERE exam_id = $1 ORDER BY created_at ASC', [examId]);
        const examData = {
            ...examResult.rows[0],
            questions: questionsResult.rows || [],
        };
        res.status(200).json(examData);
    }
    catch (error) {
        console.error('Error fetching exam by ID:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getExamById = getExamById;
// ---------------------------------------------------------
// Add Question to Exam
// ---------------------------------------------------------
const addQuestionToExam = async (req, res) => {
    const { examId } = req.params;
    const { questionText, options } = req.body;
    const courseAdminId = req.user?.userId;
    if (!questionText || !options || !Array.isArray(options) || options.length === 0) {
        return res.status(400).json({ message: 'Question text and an array of options are required.' });
    }
    if (!options.some((opt) => opt.isCorrect === true)) {
        return res.status(400).json({ message: 'At least one option must be marked as correct.' });
    }
    try {
        const examCheck = await db_1.default.query('SELECT id FROM exams WHERE id = $1 AND course_admin_id = $2', [examId, courseAdminId]);
        if (examCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Forbidden: You do not own this exam or it does not exist.' });
        }
        const query = `
            INSERT INTO questions (exam_id, question_text, options)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const newQuestion = await db_1.default.query(query, [examId, questionText, JSON.stringify(options)]);
        res.status(201).json(newQuestion.rows[0]);
    }
    catch (error) {
        console.error('Error adding question to exam:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.addQuestionToExam = addQuestionToExam;
// ---------------------------------------------------------
// Update Question in Exam
// ---------------------------------------------------------
const updateQuestionInExam = async (req, res) => {
    const { questionId } = req.params;
    const { examId, questionText, options } = req.body;
    const courseAdminId = req.user?.userId;
    try {
        const examCheck = await db_1.default.query('SELECT id FROM exams WHERE id = $1 AND course_admin_id = $2', [examId, courseAdminId]);
        if (examCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Forbidden: You do not own this exam.' });
        }
        const query = `
            UPDATE questions 
            SET question_text = $1, options = $2, updated_at = NOW()
            WHERE id = $3 AND exam_id = $4
            RETURNING *;
        `;
        const result = await db_1.default.query(query, [questionText, JSON.stringify(options), questionId, examId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Question not found.' });
        }
        res.status(200).json(result.rows[0]);
    }
    catch (error) {
        console.error('Error updating question:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateQuestionInExam = updateQuestionInExam;
// ---------------------------------------------------------
// Delete Question
// ---------------------------------------------------------
const deleteQuestion = async (req, res) => {
    const { questionId } = req.params;
    const courseAdminId = req.user?.userId;
    try {
        const query = `
            DELETE FROM questions q
            USING exams e
            WHERE q.id = $1 AND q.exam_id = e.id AND e.course_admin_id = $2
            RETURNING q.id;
        `;
        const result = await db_1.default.query(query, [questionId, courseAdminId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Question not found or you do not have permission to delete it.' });
        }
        res.status(200).json({ message: 'Question deleted successfully.' });
    }
    catch (error) {
        console.error('Error deleting question:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteQuestion = deleteQuestion;
// ---------------------------------------------------------
// Update Exam Settings
// ---------------------------------------------------------
const updateExamSettings = async (req, res) => {
    const { examId } = req.params;
    const { status, grading_scale, duration_minutes } = req.body;
    const courseAdminId = req.user?.userId;
    if (!status && !grading_scale && !duration_minutes) {
        return res.status(400).json({ message: 'No settings provided to update.' });
    }
    try {
        let query = 'UPDATE exams SET updated_at = NOW()';
        const queryParams = [];
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
        const result = await db_1.default.query(query, queryParams);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Exam not found or you do not have permission to edit it.' });
        }
        res.status(200).json(result.rows[0]);
    }
    catch (error) {
        console.error('Error updating exam settings:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateExamSettings = updateExamSettings;
// ---------------------------------------------------------
// Archive, Delete, Restore Exam
// ---------------------------------------------------------
const archiveExam = async (req, res) => { };
exports.archiveExam = archiveExam;
const deleteExam = async (req, res) => { };
exports.deleteExam = deleteExam;
const restoreExam = async (req, res) => { };
exports.restoreExam = restoreExam;
// ================== GET EXAM RESULTS (NEW FUNCTION) ==================
const getExamResults = async (req, res) => {
    const { examId } = req.params;
    const courseAdminId = req.user?.userId;
    try {
        // Step 1: Security check - does this admin own the exam?
        const examCheckQuery = 'SELECT id FROM exams WHERE id = $1 AND course_admin_id = $2';
        const examCheckResult = await db_1.default.query(examCheckQuery, [examId, courseAdminId]);
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
        const resultsResult = await db_1.default.query(resultsQuery, [examId]);
        res.status(200).json(resultsResult.rows);
    }
    catch (error) {
        console.error('Error fetching exam results:', error);
        res.status(500).json({ message: 'Internal server error while fetching results.' });
    }
};
exports.getExamResults = getExamResults;
