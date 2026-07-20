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

    console.log("Creating certifications table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS certifications (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        title text NOT NULL,
        description text NOT NULL,
        overview text,
        image_url text,
        price numeric(10, 2) DEFAULT 0.00,
        is_published boolean DEFAULT false,
        created_at timestamp with time zone DEFAULT now() NOT NULL,
        updated_at timestamp with time zone DEFAULT now() NOT NULL
      );
    `);

    console.log("Creating certification_modules table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS certification_modules (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        certification_id uuid REFERENCES certifications(id) ON DELETE CASCADE,
        title text NOT NULL,
        order_index integer NOT NULL DEFAULT 0,
        created_at timestamp with time zone DEFAULT now() NOT NULL
      );
    `);

    console.log("Creating certification_units table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS certification_units (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        module_id uuid REFERENCES certification_modules(id) ON DELETE CASCADE,
        title text NOT NULL,
        content text,
        video_url text,
        order_index integer NOT NULL DEFAULT 0,
        created_at timestamp with time zone DEFAULT now() NOT NULL
      );
    `);

    console.log("Creating certification_enrollments table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS certification_enrollments (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id uuid REFERENCES users(id) ON DELETE CASCADE,
        certification_id uuid REFERENCES certifications(id) ON DELETE CASCADE,
        progress_percentage integer DEFAULT 0,
        enrolled_at timestamp with time zone DEFAULT now() NOT NULL,
        completed_at timestamp with time zone,
        UNIQUE(user_id, certification_id)
      );
    `);

    console.log("Creating certification_unit_progress table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS certification_unit_progress (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id uuid REFERENCES users(id) ON DELETE CASCADE,
        unit_id uuid REFERENCES certification_units(id) ON DELETE CASCADE,
        is_completed boolean DEFAULT false,
        completed_at timestamp with time zone,
        UNIQUE(user_id, unit_id)
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
