import pool from '../services/db';

const checkSchema = async () => {
    const client = await pool.connect();
    try {
        console.log('--- CHECKING EXAMS TABLE SCHEMA ---');
        const schemaRes = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'exams';
        `);
        console.table(schemaRes.rows);
    } catch (error: any) {
        console.error('Error checking schema:', error.message);
    } finally {
        client.release();
        process.exit();
    }
};

checkSchema();
