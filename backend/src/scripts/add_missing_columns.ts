import pool from '../services/db';

const migrate = async () => {
    const client = await pool.connect();
    try {
        console.log('--- MIGRATING EXAMS TABLE ---');

        // 1. Add is_proctored if not exists
        await client.query(`
            ALTER TABLE exams 
            ADD COLUMN IF NOT EXISTS is_proctored BOOLEAN DEFAULT FALSE;
        `);
        console.log('Added is_proctored column.');

        // 2. Add grading_scale if not exists (just in case)
        await client.query(`
            ALTER TABLE exams 
            ADD COLUMN IF NOT EXISTS grading_scale JSONB DEFAULT NULL;
        `);
        console.log('Checked grading_scale column.');

        console.log('Migration SUCCESS!');

    } catch (error: any) {
        console.error('Migration FAILED:', error.message);
    } finally {
        client.release();
        process.exit();
    }
};

migrate();
