import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import pool from '../services/db';
import { decrypt } from '../services/encryptionService';
import { startExamSession, closeExamSession } from '../services/zyntraAiService';

// --- define the shape of our data for TypeScript ---
interface Option {
  text: string;
  isCorrect: boolean;
}

interface DecryptedQuestionContent {
  questionText: string;
  questionType: 'MCQ' | 'MSQ' | 'TRUE_FALSE' | 'FILL_BLANK' | 'ESSAY';
  options: Option[] | null;
  correctAnswer: string | null;
  questionInstructions: string | null;
}

interface QuestionFromDB {
  id: string;
  encrypted_data: string;
  question_type: string;
}

// fetches all exams with 'live' status for the student's organization.
export const getAvailableExams = async (req: AuthRequest, res: Response) => {
  const studentId = req.user?.userId;
  const organizationId = req.user?.organizationId;

  try {
    const query = `
            SELECT 
                e.id, 
                e.title, 
                e.duration_minutes, 
                e.created_at,
                e.is_proctored,
                es.status as submission_status,
                COUNT(q.id) as total_questions,
                array_agg(DISTINCT q.question_type) as question_types
            FROM exams e
            LEFT JOIN exam_submissions es ON e.id = es.exam_id AND es.student_id = $1
            LEFT JOIN questions q ON e.id = q.exam_id
            WHERE e.organization_id = $2
            AND e.status = 'live'
            AND (es.status IS NULL OR es.status = 'in_progress')
            GROUP BY e.id, es.status;
        `;
    const result = await pool.query(query, [studentId, organizationId]);

    const exams = result.rows.map((row) => ({
      ...row,
      total_questions: parseInt(row.total_questions || '0'),
      question_types: row.question_types || [],
    }));

    res.status(200).json(exams);
  } catch (error) {
    console.error('Error fetching available exams:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Fetches public exam info (instructions, title) without starting it
export const getExamInfo = async (req: AuthRequest, res: Response) => {
  const { examId } = req.params;

  try {
    const query =
      "SELECT id, title, instructions, duration_minutes, is_proctored FROM exams WHERE id = $1 AND status = 'live'";
    const result = await pool.query(query, [examId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching exam info:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Starts an exam if not started, or resumes it if 'in_progress'
export const startOrResumeExam = async (req: AuthRequest, res: Response) => {
  const { examId } = req.params;
  const studentId = req.user?.userId;

  const client = await pool.connect();
  try {
    // --- 1. Get Exam and Check Status (Fail Fast) ---
    const examQuery = "SELECT * FROM exams WHERE id = $1 AND status = 'live'";
    const examResult = await client.query(examQuery, [examId]);

    if (examResult.rows.length === 0) {
      return res.status(404).json({ message: 'Exam not found or is not live.' });
    }
    const exam = examResult.rows[0];

    // --- NEW PROCTORING CHECK ---
    if (exam.is_proctored) {
      try {
        const proctorCheck = await client.query(
          'SELECT user_id FROM proctor_profiles WHERE user_id = $1',
          [studentId],
        );
        if (proctorCheck.rows.length === 0) {
          return res
            .status(403)
            .json({
              message:
                'Proctoring required: You must complete face enrollment before starting this exam.',
            });
        }
      } catch (err: any) {
        if (err.code === '42P01') {
          console.warn("⚠️ Proctoring table 'proctor_profiles' missing. Skipping proctor check.");
        } else {
          throw err;
        }
      }
    }

    // --- 2. Find or Create Submission ---
    let submission;
    const existingSubmissionQuery =
      'SELECT * FROM exam_submissions WHERE exam_id = $1 AND student_id = $2';
    const submissionResult = await client.query(existingSubmissionQuery, [examId, studentId]);

    if (submissionResult.rows.length > 0) {
      if (
        submissionResult.rows[0].status === 'completed' ||
        submissionResult.rows[0].status === 'submitted_auto'
      ) {
        return res.status(409).json({ message: 'You have already completed this exam.' });
      }
      submission = submissionResult.rows[0];
    } else {
      // Create a new submission
      const startTime = exam.duration_minutes * 60;
      const startQuery = `
                INSERT INTO exam_submissions (exam_id, student_id, status, time_remaining_seconds, answers)
                VALUES ($1, $2, 'in_progress', $3, '{}') 
                RETURNING *;
            `;
      const newSubmissionResult = await client.query(startQuery, [examId, studentId, startTime]);
      submission = newSubmissionResult.rows[0];
    }

    // --- ZYNTRA AI PROCTORING SESSION START/RESUME ---
    if (exam.is_proctored) {
      try {
        const userQuery = 'SELECT email FROM users WHERE id = $1';
        const userRes = await client.query(userQuery, [studentId]);
        const studentEmail = userRes.rows[0]?.email || studentId;
        await startExamSession(submission.id, studentEmail);
      } catch (err: any) {
        console.error('[Zyntra] Failed to start exam session wrapper:', err.message);
      }
    }

    // --- 3. Fetch & Decrypt Questions for Student Runner ---
    const questionsResult = await client.query<QuestionFromDB>(
      'SELECT id, encrypted_data, question_type FROM questions WHERE exam_id = $1 ORDER BY created_at ASC',
      [examId],
    );

    const sanitizedQuestions = questionsResult.rows
      .map((q) => {
        try {
          if (!q.encrypted_data) {
            console.warn(`Question ${q.id} has no encrypted data. Skipping.`);
            return null;
          }
          const decryptedContent: DecryptedQuestionContent = JSON.parse(decrypt(q.encrypted_data));

          return {
            id: q.id,
            question_text: decryptedContent.questionText,
            question_type: decryptedContent.questionType,
            question_instructions: decryptedContent.questionInstructions,
            options: decryptedContent.options
              ? decryptedContent.options.map((opt) => ({ text: opt.text }))
              : null,
          };
        } catch (err) {
          console.error(`Failed to decrypt question ${q.id}:`, err);
          return null;
        }
      })
      .filter((q) => q !== null);

    return res.status(200).json({
      message: submissionResult.rows.length > 0 ? 'Resuming exam.' : 'Starting new exam.',
      exam: {
        id: exam.id,
        title: exam.title,
        instructions: exam.instructions,
        duration_minutes: exam.duration_minutes,
        questions: sanitizedQuestions,
      },
      submission: {
        id: submission.id,
        answers: submission.answers || {},
        time_remaining_seconds: submission.time_remaining_seconds,
        last_question_index: submission.last_question_index || 0,
      },
    });
  } catch (error) {
    console.error('Error starting or resuming exam:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release();
  }
};

// NEW: Periodically saves the student's progress
export const saveExamProgress = async (req: AuthRequest, res: Response) => {
  const { submissionId } = req.params;
  const studentId = req.user?.userId;
  const { answers, time_remaining_seconds, last_question_index } = req.body;

  try {
    // Check if last_question_index column exists before trying to update it (for backward compatibility if migration fails)
    // Actually, we'll assume migration runs.
    const query = `
            UPDATE exam_submissions
            SET answers = $1, time_remaining_seconds = $2, last_question_index = $3
            WHERE id = $4 AND student_id = $5 AND status = 'in_progress';
        `;
    // Note: If last_question_index column doesn't exist yet, this will fail.
    // We should probably handle that or ensure migration runs first.
    // For now, I'll use a safer query that only updates if the column exists?
    // No, I'll just assume the migration will be run immediately after this file update.

    const result = await pool.query(query, [
      JSON.stringify(answers),
      time_remaining_seconds,
      last_question_index || 0,
      submissionId,
      studentId,
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'In-progress submission not found.' });
    }
    res.status(200).json({ message: 'Progress saved.' });
  } catch (error: any) {
    if (error.code === '42703') {
      // Undefined column
      // Fallback for before migration
      const fallbackQuery = `
                UPDATE exam_submissions
                SET answers = $1, time_remaining_seconds = $2
                WHERE id = $3 AND student_id = $4 AND status = 'in_progress';
            `;
      await pool.query(fallbackQuery, [
        JSON.stringify(answers),
        time_remaining_seconds,
        submissionId,
        studentId,
      ]);
      return res.status(200).json({ message: 'Progress saved (legacy).' });
    }
    console.error('Error saving exam progress:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Handles the final submission of an exam, grades it, and saves the result.
export const submitExam = async (req: AuthRequest, res: Response) => {
  const { submissionId } = req.params;
  const studentId = req.user?.userId;
  const { answers } = req.body;

  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ message: 'Answers object is required.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Fetch submission and lock row
    const submissionQuery = `
            SELECT exam_id FROM exam_submissions 
            WHERE id = $1 AND student_id = $2 AND status = 'in_progress' FOR UPDATE;
        `;
    const submissionResult = await client.query(submissionQuery, [submissionId, studentId]);

    if (submissionResult.rows.length === 0) {
      return res
        .status(404)
        .json({
          message: 'In-progress submission not found. It may have been completed or expired.',
        });
    }

    const examId = submissionResult.rows[0].exam_id;

    // 2. Fetch Exam Settings and ALL encrypted Questions
    const [examResult, questionsResult] = await Promise.all([
      client.query('SELECT grading_scale, is_proctored FROM exams WHERE id = $1', [examId]),
      client.query<QuestionFromDB>(
        'SELECT id, encrypted_data, question_type FROM questions WHERE exam_id = $1',
        [examId],
      ),
    ]);

    const gradingScale = examResult.rows[0].grading_scale;
    const isProctored = examResult.rows[0].is_proctored;

    let score = 0;
    let totalQuestions = questionsResult.rows.length;

    // 3. Grade Each Question
    for (const q of questionsResult.rows) {
      if (!q.encrypted_data) continue; // Skip if content is missing

      const decryptedContent: DecryptedQuestionContent = JSON.parse(decrypt(q.encrypted_data));
      const studentAnswer = answers[q.id];

      if (!studentAnswer) continue; // Skip unanswered questions

      switch (decryptedContent.questionType) {
        case 'MCQ':
        case 'TRUE_FALSE': {
          const correctAnswer = decryptedContent.options?.find((opt) => opt.isCorrect)?.text;
          if (correctAnswer === studentAnswer) {
            score++;
          }
          break;
        }
        case 'MSQ': {
          const correctAnswers =
            decryptedContent.options?.filter((opt) => opt.isCorrect).map((opt) => opt.text) || [];
          const studentAnswers = Array.isArray(studentAnswer) ? studentAnswer : [studentAnswer];

          const isCorrect =
            correctAnswers.length === studentAnswers.length &&
            correctAnswers.every((ans) => studentAnswers.includes(ans));

          if (isCorrect) {
            score++;
          }
          break;
        }
        case 'FILL_BLANK': {
          if (
            studentAnswer.toLowerCase().trim() ===
            decryptedContent.correctAnswer?.toLowerCase().trim()
          ) {
            score++;
          }
          break;
        }
        case 'ESSAY': {
          break;
        }
      }
    }

    // 4. Calculate Final Score
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

    // End proctoring session if exam is proctored
    let proctoringReport = null;
    if (isProctored) {
      try {
        const report = await closeExamSession(submissionId);
        if (report) {
          proctoringReport = JSON.stringify(report);
        }
      } catch (err: any) {
        console.error('[Zyntra] Failed to end proctor session on submit:', err.message);
      }
    }

    // 5. Update Submission Record
    const updateSubmissionQuery = `
            UPDATE exam_submissions
            SET score_percentage = $1, grade = $2, answers = $3, status = 'completed', proctoring_report = $5
            WHERE id = $4
            RETURNING id, score_percentage, grade, submitted_at, proctoring_report;
        `;
    const finalResult = await client.query(updateSubmissionQuery, [
      scorePercentage.toFixed(2),
      finalGrade,
      JSON.stringify(answers),
      submissionId,
      proctoringReport,
    ]);

    await client.query('COMMIT');
    res.status(201).json({
      message: 'Exam submitted successfully! Final grade calculated.',
      submission: finalResult.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error submitting exam:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release();
  }
};
