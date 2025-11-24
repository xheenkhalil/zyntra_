import pool from '../services/db';
import { encrypt } from '../services/encryptionService';

const debugInsert = async () => {
    const client = await pool.connect();
    try {
        // 1. Get a valid exam ID (or create one temporarily if needed, but better to use existing)
        const examRes = await client.query('SELECT id FROM exams LIMIT 1');
        if (examRes.rows.length === 0) {
            console.log('No exams found to test with.');
            return;
        }
        const examId = examRes.rows[0].id;
        console.log('Testing with Exam ID:', examId);

        // 2. Prepare data
        const content = {
            questionText: 'Test Question',
            questionType: 'MCQ',
            options: [{ text: 'A', isCorrect: true }, { text: 'B', isCorrect: false }],
            correctAnswer: null,
            questionInstructions: null
        };
        const encryptedData = encrypt(JSON.stringify(content));

        // 3. Attempt Insert (Mirroring the controller logic)
        const query = `
            INSERT INTO questions (
                exam_id, 
                question_text, 
                question_type, 
                question_instructions,
                encrypted_data,
                options, 
                created_at
            )
            VALUES ($1, $2, $3, $4, $5, NULL, NOW())
            RETURNING *;
        `;

        console.log('Attempting insert...');
        await client.query(query, [
            examId,
            content.questionText,
            content.questionType,
            content.questionInstructions,
            encryptedData
        ]);
        console.log('Insert SUCCESS!');

    } catch (error: any) {
        console.error('Insert FAILED:', error.message);
        console.error('Detail:', error.detail);
        console.error('Hint:', error.hint);
    } finally {
        client.release();
        process.exit();
    }
};

debugInsert();
