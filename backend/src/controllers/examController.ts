import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import pool from '../services/db';
import { encrypt } from '../services/encryptionService';

// ---------------------------------------------------------
// Create Exam
// ---------------------------------------------------------
export const createExam = async (req: AuthRequest, res: Response) => {
  const { title, instructions, duration_minutes, is_proctored, proctoring_interval } = req.body;
  const courseAdminId = req.user?.userId;
  let organizationId = req.user?.organizationId;

  if (!title) {
    return res.status(400).json({ message: 'Exam title is required' });
  }

  try {
    // Fallback: If organizationId is missing (e.g. old token), fetch it from DB
    if (!organizationId) {
      const userRes = await pool.query('SELECT organization_id FROM users WHERE id = $1', [
        courseAdminId,
      ]);
      if (userRes.rows.length > 0) {
        organizationId = userRes.rows[0].organization_id;
      }
    }

    const query = `
            INSERT INTO exams (title, instructions, duration_minutes, is_proctored, proctoring_interval, course_admin_id, organization_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
    // Ensure organizationId is null if undefined
    const newExam = await pool.query(query, [
      title,
      instructions || null,
      duration_minutes || 60,
      is_proctored || false,
      proctoring_interval || 15,
      courseAdminId,
      organizationId || null,
    ]);
    res.status(201).json(newExam.rows[0]);
  } catch (error: any) {
    console.error('Error creating exam:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// ---------------------------------------------------------
// Get All Exams for Course Admin (UPDATED WITH STATS)
// ---------------------------------------------------------
export const getExamsForCourseAdmin = async (req: AuthRequest, res: Response) => {
  const courseAdminId = req.user?.userId;
  let organizationId = req.user?.organizationId;

  try {
    // Fallback: If organizationId is missing (e.g. old token), fetch it from DB
    if (!organizationId) {
      const userRes = await pool.query('SELECT organization_id FROM users WHERE id = $1', [
        courseAdminId,
      ]);
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
    const result = await pool.query(query, [courseAdminId, organizationId || null]);

    const exams = result.rows.map((row) => {
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
          proctoring_defaulters: 0,
        },
      };
    });

    res.status(200).json(exams);
  } catch (error: any) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
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
      [examId, courseAdminId],
    );

    if (examResult.rows.length === 0) {
      return res
        .status(404)
        .json({ message: 'Exam not found or you do not have permission to view it.' });
    }

    const questionsResult = await pool.query(
      'SELECT * FROM questions WHERE exam_id = $1 ORDER BY created_at ASC',
      [examId],
    );

    // Transform questions to include correct_answer for FILL_BLANK
    const questions = questionsResult.rows.map((q) => {
      if (q.question_type === 'FILL_BLANK' && q.options && q.options.length > 0) {
        return { ...q, correct_answer: q.options[0].text };
      }
      return q;
    });

    const examData = {
      ...examResult.rows[0],
      questions: questions || [],
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
  const { questionText, options, questionType, correctAnswer } = req.body;
  const courseAdminId = req.user?.userId;

  if (!questionText) {
    return res.status(400).json({ message: 'Question text is required.' });
  }

  const type = questionType || 'MCQ';
  let finalOptions = options;

  // Type-specific validation and data preparation
  if (type === 'MCQ' || type === 'MSQ' || type === 'TRUE_FALSE') {
    if (!options || !Array.isArray(options) || options.length < 2) {
      return res
        .status(400)
        .json({ message: 'At least two options are required for this question type.' });
    }
    if (!options.some((opt: any) => opt.isCorrect === true)) {
      return res.status(400).json({ message: 'At least one option must be marked as correct.' });
    }
  } else if (type === 'FILL_BLANK') {
    if (!correctAnswer) {
      return res.status(400).json({ message: 'Correct answer is required for Fill in the Blank.' });
    }
    // Store correct answer as a single option
    finalOptions = [{ text: correctAnswer, isCorrect: true }];
  } else if (type === 'ESSAY') {
    // Essay questions don't strictly need options
    finalOptions = [];
  }

  try {
    const examCheck = await pool.query(
      'SELECT id FROM exams WHERE id = $1 AND course_admin_id = $2',
      [examId, courseAdminId],
    );

    if (examCheck.rows.length === 0) {
      return res
        .status(403)
        .json({ message: 'Forbidden: You do not own this exam or it does not exist.' });
    }

    // Encrypt the question data for student view
    const questionData = {
      questionText,
      questionType: type,
      options: finalOptions,
      questionInstructions: req.body.questionInstructions || null,
      correctAnswer: type === 'FILL_BLANK' ? correctAnswer : null,
    };

    const encryptedData = encrypt(JSON.stringify(questionData));

    const query = `
            INSERT INTO questions (exam_id, question_text, options, question_type, encrypted_data)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
    const newQuestion = await pool.query(query, [
      examId,
      questionText,
      JSON.stringify(finalOptions),
      type,
      encryptedData,
    ]);

    // If it's FILL_BLANK, append correct_answer to response so frontend sees it immediately
    const responseQuestion = newQuestion.rows[0];
    if (type === 'FILL_BLANK') {
      responseQuestion.correct_answer = correctAnswer;
    }

    res.status(201).json(responseQuestion);
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
  const {
    status,
    grading_scale,
    duration_minutes,
    instructions,
    is_proctored,
    proctoring_interval,
  } = req.body;
  const courseAdminId = req.user?.userId;

  if (
    !status &&
    !grading_scale &&
    !duration_minutes &&
    !instructions &&
    is_proctored === undefined &&
    proctoring_interval === undefined
  ) {
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
    if (instructions !== undefined) {
      query += `, instructions = $${paramIndex++}`;
      queryParams.push(instructions);
    }
    if (is_proctored !== undefined) {
      query += `, is_proctored = $${paramIndex++}`;
      queryParams.push(is_proctored);
    }
    if (proctoring_interval !== undefined) {
      query += `, proctoring_interval = $${paramIndex++}`;
      queryParams.push(proctoring_interval);
    }

    query += ` WHERE id = $${paramIndex++} AND course_admin_id = $${paramIndex++} RETURNING *`;
    queryParams.push(examId, courseAdminId);

    const result = await pool.query(query, queryParams);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: 'Exam not found or you do not have permission to edit it.' });
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
export const archiveExam = async (req: AuthRequest, res: Response) => {
  const { examId } = req.params;
  const courseAdminId = req.user?.userId;
  try {
    const result = await pool.query(
      "UPDATE exams SET status = 'archived' WHERE id = $1 AND course_admin_id = $2 RETURNING *",
      [examId, courseAdminId],
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Exam not found' });
    res.json({ message: 'Exam archived', exam: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteExam = async (req: AuthRequest, res: Response) => {
  const { examId } = req.params;
  const courseAdminId = req.user?.userId;
  try {
    const result = await pool.query(
      'DELETE FROM exams WHERE id = $1 AND course_admin_id = $2 RETURNING *',
      [examId, courseAdminId],
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Exam not found' });
    res.json({ message: 'Exam deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const restoreExam = async (req: AuthRequest, res: Response) => {
  const { examId } = req.params;
  const courseAdminId = req.user?.userId;
  try {
    const result = await pool.query(
      "UPDATE exams SET status = 'draft' WHERE id = $1 AND course_admin_id = $2 RETURNING *",
      [examId, courseAdminId],
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Exam not found' });
    res.json({ message: 'Exam restored', exam: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ================== GET EXAM RESULTS (NEW FUNCTION) ==================
export const getExamResults = async (req: AuthRequest, res: Response) => {
  const { examId } = req.params;
  const courseAdminId = req.user?.userId;

  try {
    // Step 1: Security check - does this admin own the exam?
    const examCheckQuery = 'SELECT id FROM exams WHERE id = $1 AND course_admin_id = $2';
    const examCheckResult = await pool.query(examCheckQuery, [examId, courseAdminId]);

    if (examCheckResult.rows.length === 0) {
      return res
        .status(403)
        .json({ message: 'Forbidden: You do not have permission to view results for this exam.' });
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
