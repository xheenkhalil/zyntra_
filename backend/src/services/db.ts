// /backend/src/services/db.ts

import { Pool } from 'pg';
import config from '../config';

const pool = new Pool({
    connectionString: config.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    idleTimeoutMillis: 10000,
    maxUses: 5000, // Recycle a connection after 5000 queries for stability
});

pool.on('error', (err, client) => {
    console.error('[DATABASE POOL ERROR]', err.message, client);
});

// This is your existing, correct test function
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