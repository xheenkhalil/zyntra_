"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExamResults = exports.restoreExam = exports.deleteExam = exports.archiveExam = exports.updateExamSettings = exports.addQuestionToExam = exports.getExamById = exports.getExamsForCourseAdmin = exports.createExam = void 0;
const db_1 = __importDefault(require("../services/db"));
const encryptionService_1 = require("../services/encryptionService");
// ---------------------------------------------------------
// Create Exam
// ---------------------------------------------------------
const createExam = async (req, res) => {
    const { title } = req.body;
    const courseAdminId = req.user?.userId;
    let organizationId = req.user?.organizationId;
    if (!title) {
        return res.status(400).json({ message: 'Exam title is required' });
    }
    try {
        // Fallback: If organizationId is missing (e.g. old token), fetch it from DB
        if (!organizationId) {
            const userRes = await db_1.default.query('SELECT organization_id FROM users WHERE id = $1', [courseAdminId]);
            if (userRes.rows.length > 0) {
                organizationId = userRes.rows[0].organization_id;
            }
        }
        const query = `
            INSERT INTO exams (title, course_admin_id, organization_id)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        // Ensure organizationId is null if undefined
        const newExam = await db_1.default.query(query, [title, courseAdminId, organizationId || null]);
        res.status(201).json(newExam.rows[0]);
    }
    catch (error) {
        console.error('Error creating exam:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
exports.createExam = createExam;
// ---------------------------------------------------------
// Get All Exams for Course Admin (UPDATED WITH STATS)
// ---------------------------------------------------------
const getExamsForCourseAdmin = async (req, res) => {
    const courseAdminId = req.user?.userId;
    let organizationId = req.user?.organizationId;
    try {
        // Fallback: If organizationId is missing (e.g. old token), fetch it from DB
        if (!organizationId) {
            const userRes = await db_1.default.query('SELECT organization_id FROM users WHERE id = $1', [courseAdminId]);
            if (userRes.rows.length > 0) {
                organizationId = userRes.rows[0].organization_id;
            }
        }
        const query = `
            SELECT 
                e.*,
                (SELECT COUNT(*) FROM users u WHERE u.organization_id = $2 AND u.role = 'student') as registered_count,
                (SELECT COUNT(*) FROM exam_submissions es WHERE es.exam_id = e.id AND es.status = 'completed') as completed_count,
                (SELECT COUNT(*) FROM questions q WHERE q.exam_id = e.id) as total_questions
            FROM exams e 
            WHERE course_admin_id = $1 
            ORDER BY created_at DESC;
        `;
        // Ensure organizationId is null if undefined
        const result = await db_1.default.query(query, [courseAdminId, organizationId || null]);
        const exams = result.rows.map(row => {
            const registered = parseInt(row.registered_count || '0');
            const completed = parseInt(row.completed_count || '0');
            const autoSubmitted = 0; // DB enum doesn't support 'submitted_auto' yet
            // Pending = Registered - (Completed + AutoSubmitted)
            const pending = Math.max(0, registered - (completed + autoSubmitted));
            return {
                ...row,
                total_questions: parseInt(row.total_questions || '0'),
                stats: {
                    registered: registered,
                    completed: completed,
                    pending: pending,
                    auto_submitted: autoSubmitted,
                    proctoring_defaulters: 0
                }
            };
        });
        res.status(200).json(exams);
    }
    catch (error) {
        console.error('Error fetching exams:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
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
    const { questionText, options, questionType } = req.body;
    const courseAdminId = req.user?.userId;
    if (!questionText || !options || !Array.isArray(options) || options.length === 0) {
        return res.status(400).json({ message: 'Question text and an array of options are required.' });
    }
    if (!options.some((opt) => opt.isCorrect === true)) {
        return res.status(400).json({ message: 'At least one option must be marked as correct.' });
    }
    const type = questionType || 'MCQ';
    try {
        const examCheck = await db_1.default.query('SELECT id FROM exams WHERE id = $1 AND course_admin_id = $2', [examId, courseAdminId]);
        if (examCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Forbidden: You do not own this exam or it does not exist.' });
        }
        // Encrypt the question data for student view
        const questionData = {
            questionText,
            questionType: type,
            options,
            questionInstructions: req.body.questionInstructions || null,
            correctAnswer: null
        };
        const encryptedData = (0, encryptionService_1.encrypt)(JSON.stringify(questionData));
        const query = `
            INSERT INTO questions (exam_id, question_text, options, question_type, encrypted_data)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const newQuestion = await db_1.default.query(query, [
            examId,
            questionText,
            JSON.stringify(options),
            type,
            encryptedData
        ]);
        res.status(201).json(newQuestion.rows[0]);
    }
    catch (error) {
        console.error('Error adding question to exam:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.addQuestionToExam = addQuestionToExam;
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
const archiveExam = async (req, res) => {
    const { examId } = req.params;
    const courseAdminId = req.user?.userId;
    try {
        const result = await db_1.default.query('UPDATE exams SET status = \'archived\' WHERE id = $1 AND course_admin_id = $2 RETURNING *', [examId, courseAdminId]);
        if (result.rows.length === 0)
            return res.status(404).json({ message: 'Exam not found' });
        res.json({ message: 'Exam archived', exam: result.rows[0] });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.archiveExam = archiveExam;
const deleteExam = async (req, res) => {
    const { examId } = req.params;
    const courseAdminId = req.user?.userId;
    try {
        const result = await db_1.default.query('DELETE FROM exams WHERE id = $1 AND course_admin_id = $2 RETURNING *', [examId, courseAdminId]);
        if (result.rows.length === 0)
            return res.status(404).json({ message: 'Exam not found' });
        res.json({ message: 'Exam deleted' });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deleteExam = deleteExam;
const restoreExam = async (req, res) => {
    const { examId } = req.params;
    const courseAdminId = req.user?.userId;
    try {
        const result = await db_1.default.query('UPDATE exams SET status = \'draft\' WHERE id = $1 AND course_admin_id = $2 RETURNING *', [examId, courseAdminId]);
        if (result.rows.length === 0)
            return res.status(404).json({ message: 'Exam not found' });
        res.json({ message: 'Exam restored', exam: result.rows[0] });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
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
