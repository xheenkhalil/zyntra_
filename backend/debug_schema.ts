
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env') });

import { Pool } from 'pg';

console.log('Starting schema check...');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const checkSchema = async () => {
    try {
        console.log('Connecting...');
        const client = await pool.connect();
        console.log('Connected!');

        console.log('Checking organizations table status column...');
        const res = await client.query(`
            SELECT column_name, data_type, udt_name
            FROM information_schema.columns
            WHERE table_name = 'organizations' AND column_name = 'status';
        `);
        console.log('Column info:', res.rows[0]);

        if (res.rows[0] && res.rows[0].udt_name) {
            const enumRes = await client.query(`
                SELECT e.enumlabel
                FROM pg_enum e
                JOIN pg_type t ON e.enumtypid = t.oid
                WHERE t.typname = $1
            `, [res.rows[0].udt_name]);
            console.log('Enum values:', enumRes.rows.map(r => r.enumlabel));
        } else {
            console.log('Not an enum or column not found.');
        }

        client.release();
    } catch (err) {
        console.error('Error checking schema:', err);
    } finally {
        console.log('Done.');
        await pool.end();
        process.exit();
    }
};

checkSchema();
