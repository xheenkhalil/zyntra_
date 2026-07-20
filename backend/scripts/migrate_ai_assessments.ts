import 'dotenv/config';
import pool from '../src/services/db';

async function migrate() {
  try {
    console.log('Running migration for AI Assessments and Certifications...');

    // 1. Add fields to certification_modules
    console.log('Adding fields to certification_modules...');
    await pool.query(`
      ALTER TABLE certification_modules
      ADD COLUMN IF NOT EXISTS has_assessment BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS passing_rate NUMERIC DEFAULT 80.0,
      ADD COLUMN IF NOT EXISTS assessment_question_count INTEGER DEFAULT 5;
    `);

    // 2. Add fields to certifications
    console.log('Adding fields to certifications...');
    await pool.query(`
      ALTER TABLE certifications
      ADD COLUMN IF NOT EXISTS average_rating NUMERIC DEFAULT 0.0,
      ADD COLUMN IF NOT EXISTS participant_count INTEGER DEFAULT 0;
    `);

    // 3. Create certification_module_questions table
    console.log('Creating certification_module_questions table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS certification_module_questions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        module_id UUID NOT NULL REFERENCES certification_modules(id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        options JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Create certification_module_progress table
    console.log('Creating certification_module_progress table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS certification_module_progress (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        enrollment_id UUID NOT NULL REFERENCES certification_enrollments(id) ON DELETE CASCADE,
        module_id UUID NOT NULL REFERENCES certification_modules(id) ON DELETE CASCADE,
        passed BOOLEAN DEFAULT false,
        score NUMERIC DEFAULT 0.0,
        attempts INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(enrollment_id, module_id)
      );
    `);

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
