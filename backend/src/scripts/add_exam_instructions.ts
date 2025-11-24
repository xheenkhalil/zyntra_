// backend/src/scripts/add_exam_instructions.ts

import pool from '../services/db';

async function addExamInstructions() {
    try {
        console.log('Adding instructions column to exams table...');

        await pool.query(`
            ALTER TABLE exams 
            ADD COLUMN IF NOT EXISTS instructions TEXT;
        `);

        console.log('✓ Instructions column added successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error adding instructions column:', error);
        process.exit(1);
    }
}

addExamInstructions();
