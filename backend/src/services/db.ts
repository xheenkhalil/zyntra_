// /backend/src/services/db.ts

import { Pool } from 'pg';
import config from '../config';

const pool = new Pool({
    connectionString: config.DATABASE_URL,
    // THE FIX IS HERE: We are explicitly adding the SSL configuration
    // This is often required for cloud databases like Supabase to maintain a stable connection.
    ssl: {
        rejectUnauthorized: false
    }
});

export const testDbConnection = async () => {
    let client;
    try {
        client = await pool.connect();
        console.log('Successfully connected to the PostgreSQL database!');
        const result = await client.query('SELECT NOW()');
        return result.rows[0];
    } catch (error) {
        console.error('Error connecting to the database:', error);
        throw error;
    } finally {
        if (client) {
            client.release();
        }
    }
};

export default pool;