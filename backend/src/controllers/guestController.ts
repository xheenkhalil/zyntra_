import { Request, Response } from 'express';
import pool from '../services/db';
import CacheService from '../services/cacheService';

// ============================================================
// Type definitions
// ============================================================
interface QuizOption {
  text: string;
  isCorrect?: boolean;
}

// ============================================================
// 1️⃣ FETCH ALL PUBLISHED GUEST QUIZZES (For Homepage)
// ============================================================
export const getPublicQuizzes = async (req: Request, res: Response) => {
  try {
    const cacheKey = 'public_quizzes';
    const cachedData = await CacheService.get(cacheKey);

    if (cachedData) {
      console.log('⚡ Cache Hit: public_quizzes');
      return res.status(200).json(cachedData);
    }

    const query = `
            SELECT
                gq.id,
                gq.title,
                gq.category,
                CAST(COUNT(gs.id) AS INTEGER) AS participant_count,
                ROUND(AVG(gs.rating), 1) AS average_rating
            FROM guest_quizzes gq
            LEFT JOIN guest_submissions gs ON gq.id = gs.quiz_id
            WHERE gq.status = 'published'
            GROUP BY gq.id
            ORDER BY gq.created_at;
        `;
    const result = await pool.query(query);

    // Cache for 5 minutes
    await CacheService.set(cacheKey, result.rows, 300);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching public quizzes:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ============================================================
// 2️⃣ FETCH A SINGLE QUIZ (Remove correct answers)
// ============================================================
export const getPublicQuizById = async (req: Request, res: Response) => {
  const { quizId } = req.params;
  const cacheKey = `public_quiz_${quizId}`;

  try {
    const cachedData = await CacheService.get(cacheKey);
    if (cachedData) {
      console.log(`⚡ Cache Hit: ${cacheKey}`);
      return res.status(200).json(cachedData);
    }

    const quizResult = await pool.query(
      "SELECT id, title FROM guest_quizzes WHERE id = $1 AND status = 'published'",
      [quizId],
    );
    if (quizResult.rows.length === 0) {
      return res.status(404).json({ message: 'Quiz not found or not published.' });
    }

    const questionsResult = await pool.query(
      'SELECT id, question_text, options FROM guest_questions WHERE quiz_id = $1 ORDER BY created_at',
      [quizId],
    );

    const sanitizedQuestions = questionsResult.rows.map((q) => ({
      id: q.id,
      question_text: q.question_text,
      options: (q.options as QuizOption[]).map((opt) => ({ text: opt.text })),
    }));

    const responseData = {
      ...quizResult.rows[0],
      duration_minutes: 30,
      questions: sanitizedQuestions,
    };

    // Cache for 10 minutes
    await CacheService.set(cacheKey, responseData, 600);

    res.status(200).json(responseData);
  } catch (error) {
    console.error('Error fetching public quiz:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ============================================================
// 3️⃣ SUBMIT QUIZ ANSWERS + STORE SCORE & OPTIONAL RATING
// ============================================================
export const submitPublicQuiz = async (req: Request, res: Response) => {
  const { quizId } = req.params;
  const { answers, rating } = req.body;

  if (!answers) return res.status(400).json({ message: 'Answers are required.' });

  console.log(`📝 Submitting quiz ${quizId}`);
  console.log(`Answers: ${JSON.stringify(answers)}`);
  console.log(`Rating received: ${rating}`);

  try {
    // Fetch correct answers
    const questionsQuery = 'SELECT id, options FROM guest_questions WHERE quiz_id = $1';
    const questionsResult = await pool.query(questionsQuery, [quizId]);

    const correctAnswers = new Map(
      questionsResult.rows.map((q: { id: string; options: QuizOption[] }) => {
        const correctOption = q.options.find((opt) => opt.isCorrect === true);
        return [q.id, correctOption ? correctOption.text : null];
      }),
    );

    // Calculate score
    let score = 0;
    Object.keys(answers).forEach((questionId) => {
      if (correctAnswers.get(questionId) === answers[questionId]) score++;
    });

    const totalQuestions = correctAnswers.size;
    const scorePercentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

    // Store submission
    const submissionQuery = `
            INSERT INTO guest_submissions (quiz_id, score_percentage, answers, rating)
            VALUES ($1, $2, $3, $4)
        `;
    await pool.query(submissionQuery, [
      quizId,
      scorePercentage,
      JSON.stringify(answers),
      rating || null,
    ]);

    console.log(
      `✅ Submission inserted for quiz ${quizId}. Score: ${scorePercentage.toFixed(1)}%, Rating stored: ${rating || 'null'}`,
    );

    // Invalidate cache since participant count or rating might have changed
    await CacheService.del('public_quizzes');
    // We don't necessarily need to invalidate the individual quiz cache unless we show stats there, but let's be safe if we add that later
    // await CacheService.del(`public_quiz_${quizId}`);

    res.status(201).json({
      message: 'Quiz submitted successfully!',
      score,
      totalQuestions,
      scorePercentage: scorePercentage.toFixed(1),
    });
  } catch (error) {
    console.error('Error submitting public quiz:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ============================================================
// 4️⃣ UPDATE QUIZ RATING (Fixed version – safe insert)
// ============================================================
export const updateQuizRating = async (req: Request, res: Response) => {
  const { quizId } = req.params;
  const { rating } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
  }

  try {
    // ✅ Step 1: Insert a dummy record with score 0 for required columns
    await pool.query(
      `
            INSERT INTO guest_submissions (quiz_id, score_percentage, answers, rating)
            VALUES ($1, 0, '{}'::jsonb, $2)
            `,
      [quizId, rating],
    );

    // ✅ Step 2: Recalculate average rating
    const updateQuery = `
            UPDATE guest_quizzes
            SET average_rating = sub.avg_rating
            FROM (
                SELECT quiz_id, ROUND(AVG(rating), 1) AS avg_rating
                FROM guest_submissions
                WHERE quiz_id = $1 AND rating IS NOT NULL
                GROUP BY quiz_id
            ) AS sub
            WHERE guest_quizzes.id = sub.quiz_id
            RETURNING guest_quizzes.average_rating;
        `;

    const updateResult = await pool.query(updateQuery, [quizId]);
    const newAvg = updateResult.rows[0]?.average_rating || rating;

    console.log(`✅ Quiz ${quizId} rating updated successfully. New average: ${newAvg}`);

    // Invalidate cache
    await CacheService.del('public_quizzes');

    res.status(200).json({
      message: 'Rating updated successfully.',
      newAverage: newAvg,
    });
  } catch (error) {
    console.error('Error updating quiz rating:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
