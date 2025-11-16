// /backend/src/services/db.ts

import { Pool } from 'pg';
import config from '../config';

const pool = new Pool({
    connectionString: config.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },

    // --- FIX #1: Prevent Stale Connections ---
    // Supabase/PgBouncer is very aggressive with idle connections.
    // We set our pool's idle timeout to be *shorter* (10s) than the server's,
    // telling our app to proactively close its own idle connections
    // before Supabase has a chance to kill them and cause an error.
    idleTimeoutMillis: 10000, // 10 seconds
    maxUses: 5000, // Recycle a connection after 5000 queries for stability
});

// --- FIX #2: Prevent the App Crash ---
// This is the most important part.
// We add an error listener to the pool itself. If a client
// in the pool gets terminated unexpectedly (like by Supabase),
// this listener will just log the error instead of crashing the
// entire application.
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