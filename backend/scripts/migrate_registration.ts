import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigrations() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log("Adding columns to organizations table...");
    await client.query(`
      ALTER TABLE organizations 
      ADD COLUMN IF NOT EXISTS email text,
      ADD COLUMN IF NOT EXISTS website text,
      ADD COLUMN IF NOT EXISTS size text,
      ADD COLUMN IF NOT EXISTS industry text;
    `);

    console.log("Adding columns to users table...");
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS location text,
      ADD COLUMN IF NOT EXISTS subject text,
      ADD COLUMN IF NOT EXISTS phone text;
    `);

    console.log("Creating email_verifications table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS email_verifications (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        email text NOT NULL,
        otp text NOT NULL,
        expires_at timestamp with time zone NOT NULL,
        created_at timestamp with time zone DEFAULT now() NOT NULL
      );
    `);

    await client.query('COMMIT');
    console.log("Migrations applied successfully.");

  } catch(e) {
    await client.query('ROLLBACK');
    console.error("Migration failed:", e);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
