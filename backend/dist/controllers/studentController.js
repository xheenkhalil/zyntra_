"use strict";
// /backend/src/controllers/studentController.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitExam = exports.saveExamProgress = exports.startOrResumeExam = exports.getAvailableExams = void 0;
const db_1 = __importDefault(require("../services/db"));
// Fetches all exams with 'live' status for the student's organization.
// It will now ALSO show exams that are 'in_progress' for the student to resume.
const getAvailableExams = async (req, res) => {
    const studentId = req.user?.userId;
    const organizationId = req.user?.organizationId;
    try {
        const query = `
            SELECT 
                e.id, 
                e.title, 
                e.duration_minutes, 
                e.created_at,
                es.status as submission_status
            FROM exams e
            LEFT JOIN exam_submissions es ON e.id = es.exam_id AND es.student_id = $1
            WHERE e.organization_id = $2
            AND e.status = 'live'
            AND (es.status IS NULL OR es.status = 'in_progress');
        `;
        const result = await db_1.default.query(query, [studentId, organizationId]);
        res.status(200).json(result.rows);
    }
    catch (error) {
        console.error("Error fetching available exams:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAvailableExams = getAvailableExams;
// Starts an exam if not started, or resumes it if 'in_progress'
// CORRECTED: Added an explicit return type 'Promise<any>' to satisfy TypeScript for the recursive call
const startOrResumeExam = async (req, res) => {
    const { examId } = req.params;
    const studentId = req.user?.userId;
    const client = await db_1.default.connect();
    try {
        // Check for an existing 'in_progress' submission first
        const existingSubmissionQuery = 'SELECT * FROM exam_submissions WHERE exam_id = $1 AND student_id = $2';
        const submissionResult = await client.query(existingSubmissionQuery, [examId, studentId]);
        if (submissionResult.rows[0] && submissionResult.rows[0].status === 'completed') {
            return res.status(409).json({ message: 'You have already completed this exam.' });
        }
        const examQuery = 'SELECT * FROM exams WHERE id = $1 AND status = \'live\'';
        const examResult = await client.query(examQuery, [examId]);
        if (examResult.rows.length === 0) {
            return res.status(404).json({ message: 'Exam not found or is not live.' });
        }
        const exam = examResult.rows[0];
        // If a submission exists and is in_progress, resume it
        if (submissionResult.rows.length > 0) {
            const inProgressSubmission = submissionResult.rows[0];
            // Fetch questions but remove the isCorrect flag
            const questionsQuery = 'SELECT id, question_text, options FROM questions WHERE exam_id = $1 ORDER BY created_at ASC';
            const questionsResult = await client.query(questionsQuery, [examId]);
            const sanitizedQuestions = questionsResult.rows.map(q => ({
                id: q.id,
                question_text: q.question_text,
                options: q.options.map((opt) => ({ text: opt.text })) // Type safety for opt
            }));
            return res.status(200).json({
                message: "Resuming exam.",
                exam: {
                    id: exam.id,
                    title: exam.title,
                    questions: sanitizedQuestions,
                },
                submission: {
                    id: inProgressSubmission.id,
                    answers: inProgressSubmission.answers || {},
                    time_remaining_seconds: inProgressSubmission.time_remaining_seconds,
                }
            });
        }
        // If no submission exists, create a new one to start the exam
        const startTime = exam.duration_minutes * 60; // Convert duration to seconds
        const startQuery = `
            INSERT INTO exam_submissions (exam_id, student_id, status, time_remaining_seconds, answers)
            VALUES ($1, $2, 'in_progress', $3, '{}') RETURNING id;
        `;
        await client.query(startQuery, [examId, studentId, startTime]);
        // Now fetch and return the exam data just like in the resume flow
        return (0, exports.startOrResumeExam)(req, res);
    }
    catch (error) {
        console.error("Error starting or resuming exam:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
    finally {
        client.release();
    }
};
exports.startOrResumeExam = startOrResumeExam;
// NEW: Periodically saves the student's progress
const saveExamProgress = async (req, res) => {
    const { submissionId } = req.params;
    const studentId = req.user?.userId;
    const { answers, time_remaining_seconds } = req.body;
    try {
        const query = `
            UPDATE exam_submissions
            SET answers = $1, time_remaining_seconds = $2
            WHERE id = $3 AND student_id = $4 AND status = 'in_progress';
        `;
        const result = await db_1.default.query(query, [JSON.stringify(answers), time_remaining_seconds, submissionId, studentId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'In-progress submission not found.' });
        }
        res.status(200).json({ message: 'Progress saved.' });
    }
    catch (error) {
        console.error("Error saving exam progress:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.saveExamProgress = saveExamProgress;
// Handles the final submission of an exam, grades it, and saves the result.
const submitExam = async (req, res) => {
    const { submissionId } = req.params;
    const studentId = req.user?.userId;
    const { answers } = req.body;
    if (!answers || typeof answers !== 'object') {
        return res.status(400).json({ message: 'Answers object is required.' });
    }
    const client = await db_1.default.connect();
    try {
        await client.query('BEGIN');
        const submissionQuery = `
            SELECT * FROM exam_submissions 
            WHERE id = $1 AND student_id = $2 AND status = 'in_progress' FOR UPDATE;
        `;
        const submissionResult = await client.query(submissionQuery, [submissionId, studentId]);
        if (submissionResult.rows.length === 0) {
            return res.status(404).json({ message: 'In-progress submission not found. It may have been completed or expired.' });
        }
        const examId = submissionResult.rows[0].exam_id;
        const examQuery = 'SELECT grading_scale FROM exams WHERE id = $1';
        // CORRECTED: Apply the QuestionFromDB type here
        const questionsQuery = 'SELECT id, options FROM questions WHERE exam_id = $1';
        const examResult = await client.query(examQuery, [examId]);
        const questionsResult = await client.query(questionsQuery, [examId]);
        const gradingScale = examResult.rows[0].grading_scale;
        // TypeScript now understands 'q' and 'opt' correctly because of our new interfaces
        const correctAnswers = new Map(questionsResult.rows.map(q => {
            const correctOption = q.options.find(opt => opt.isCorrect === true);
            return [q.id, correctOption ? correctOption.text : null];
        }));
        let score = 0;
        Object.keys(answers).forEach(questionId => {
            if (correctAnswers.get(questionId) === answers[questionId]) {
                score++;
            }
        });
        const totalQuestions = correctAnswers.size;
        const scorePercentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
        let finalGrade = 'F';
        if (gradingScale) {
            const sortedGrades = Object.entries(gradingScale).sort((a, b) => Number(b[1]) - Number(a[1]));
            for (const [grade, minScore] of sortedGrades) {
                if (scorePercentage >= Number(minScore)) {
                    finalGrade = grade;
                    break;
                }
            }
        }
        const updateSubmissionQuery = `
            UPDATE exam_submissions
            SET score_percentage = $1, grade = $2, answers = $3, status = 'completed'
            WHERE id = $4
            RETURNING id, score_percentage, grade, submitted_at;
        `;
        const finalResult = await client.query(updateSubmissionQuery, [
            scorePercentage.toFixed(2), finalGrade, JSON.stringify(answers), submissionId
        ]);
        await client.query('COMMIT');
        res.status(201).json({
            message: 'Exam submitted successfully!',
            submission: finalResult.rows[0]
        });
    }
    catch (error) {
        await client.query('ROLLBACK');
        console.error("Error submitting exam:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
    finally {
        client.release();
    }
};
exports.submitExam = submitExam;
