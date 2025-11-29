
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env') });

import { Pool } from 'pg';

console.log('Starting migration...');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const migrate = async () => {
    try {
        console.log('Connecting...');
        const client = await pool.connect();
        console.log('Connected!');

        console.log("Adding 'pending' to organization_status enum...");
        // We use a try-catch block for the query in case 'pending' already exists (though we know it doesn't)
        // PostgreSQL doesn't support "IF NOT EXISTS" for enum values directly in all versions easily without a block,
        // but since we just checked, we can try to add it.
        try {
            await client.query("ALTER TYPE organization_status ADD VALUE 'pending'");
            console.log("Successfully added 'pending' to organization_status.");
        } catch (e: any) {
            console.log("Error adding value (might already exist):", e.message);
        }

        client.release();
    } catch (err) {
        console.error('Migration error:', err);
    } finally {
        console.log('Done.');
        await pool.end();
        process.exit();
    }
};

migrate();
