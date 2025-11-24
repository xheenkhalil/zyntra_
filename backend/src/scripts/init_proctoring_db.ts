import pool from '../services/db';

const initProctoringDB = async () => {
    const client = await pool.connect();
    try {
        console.log('Initializing Proctoring Database Tables...');

        await client.query('BEGIN');

        // 1. Proctor Profiles Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS proctor_profiles (
                user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                reference_images JSONB NOT NULL,
                rekognition_collection_id VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('Checked/Created proctor_profiles table.');

        // 2. Proctor Flags Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS proctor_flags (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                submission_id UUID REFERENCES exam_submissions(id) ON DELETE CASCADE,
                student_id UUID REFERENCES users(id) ON DELETE CASCADE,
                type VARCHAR(50) NOT NULL,
                image_url TEXT,
                warning_count INT DEFAULT 0,
                analysis_data JSONB DEFAULT '{}',
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('Checked/Created proctor_flags table.');

        await client.query('COMMIT');
        console.log('Proctoring DB Initialization Complete.');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Failed to initialize proctoring DB:', error);
    } finally {
        client.release();
        process.exit();
    }
};

initProctoringDB();
