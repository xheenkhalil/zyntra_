import pool from './src/services/db';

async function run() {
  const r = await pool.query(`
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name IN ('certifications', 'certification_modules', 'certification_units', 'guest_quizzes', 'guest_questions', 'questions') 
    ORDER BY table_name, ordinal_position;
  `);
  console.table(r.rows);
  process.exit(0);
}
run();
