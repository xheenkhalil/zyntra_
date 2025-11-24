import pool from '../services/db';
import { encrypt } from '../services/encryptionService';

const runDebug = async () => {
    const client = await pool.connect();
    try {
        console.log('\n--- CHECKING EXAM ---');
        const examRes = await client.query('SELECT id FROM exams LIMIT 1');
        if (examRes.rows.length === 0) {
            console.log('No exams found.');
            return;
        }
        const examId = examRes.rows[0].id;
        console.log('Using Exam ID:', examId);

        console.log('\n--- ATTEMPTING INSERT WITH [] FOR OPTIONS ---');
        const content = {
            questionText: 'Debug Question Fixed',
            questionType: 'MCQ',
            options: [{ text: 'A', isCorrect: true }, { text: 'B', isCorrect: false }],
            correctAnswer: null,
            questionInstructions: null
        };
        const encryptedData = encrypt(JSON.stringify(content));

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
            VALUES ($1, $2, $3, $4, $5, '[]', NOW())
            RETURNING *;
        `;

        await client.query(query, [
            examId,
            content.questionText,
            content.questionType,
            content.questionInstructions,
            encryptedData
        ]);
        console.log('Insert SUCCESS!');

    } catch (error: any) {
        console.error('\n!!! ERROR OCCURRED !!!');
        console.error('Message:', error.message);
        console.error('Code:', error.code);
        console.error('Detail:', error.detail);
        console.error('Routine:', error.routine);
    } finally {
        client.release();
        process.exit();
    }
};

runDebug();
