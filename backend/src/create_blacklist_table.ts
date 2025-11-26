import pool from './services/db';

const createTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS token_blacklist (
                token TEXT PRIMARY KEY,
                expires_at TIMESTAMP NOT NULL
            );
        `);
        console.log('token_blacklist table created successfully');
    } catch (error) {
        console.error('Error creating table:', error);
    } finally {
        await pool.end();
    }
};

createTable();
