import 'dotenv/config';
import pool from '../src/services/db';

async function migrate() {
  try {
    console.log('Adding image_url to guest_quizzes...');
    await pool.query(`
      ALTER TABLE guest_quizzes
      ADD COLUMN IF NOT EXISTS image_url TEXT;
    `);
    console.log('Migration successful.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
