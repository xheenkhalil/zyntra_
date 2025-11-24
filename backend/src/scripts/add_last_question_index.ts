import pool from '../services/db';

const addLastQuestionIndex = async () => {
    const client = await pool.connect();
    try {
        console.log('Adding last_question_index to exam_submissions...');

        await client.query('BEGIN');

        await client.query(`
            ALTER TABLE exam_submissions 
            ADD COLUMN IF NOT EXISTS last_question_index INT DEFAULT 0;
        `);

        console.log('Column added successfully.');

        await client.query('COMMIT');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Failed to add column:', error);
    } finally {
        client.release();
        process.exit();
    }
};

addLastQuestionIndex();
