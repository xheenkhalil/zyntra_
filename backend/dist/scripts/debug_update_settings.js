"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../services/db"));
const runDebug = async () => {
    const client = await db_1.default.connect();
    try {
        console.log('\n--- CHECKING EXAM ---');
        const examRes = await client.query('SELECT id FROM exams LIMIT 1');
        if (examRes.rows.length === 0) {
            console.log('No exams found.');
            return;
        }
        const examId = examRes.rows[0].id;
        console.log('Using Exam ID:', examId);
        // Mimic the controller logic
        const grading_scale = { A: 90, B: 80 };
        const status = 'live';
        const duration_minutes = 45;
        const is_proctored = true;
        let query = 'UPDATE exams SET updated_at = NOW()';
        const queryParams = [];
        let paramIndex = 1;
        // Controller logic: JSON.stringify(grading_scale)
        query += `, grading_scale = $${paramIndex++}`;
        queryParams.push(JSON.stringify(grading_scale));
        query += `, status = $${paramIndex++}`;
        queryParams.push(status);
        query += `, duration_minutes = $${paramIndex++}`;
        queryParams.push(duration_minutes);
        query += `, is_proctored = $${paramIndex++}`;
        queryParams.push(is_proctored);
        // We don't have course_admin_id easily available, so we'll just use ID for this test
        // In real controller: WHERE id = $x AND course_admin_id = $y
        query += ` WHERE id = $${paramIndex++} RETURNING *`;
        queryParams.push(examId);
        console.log('Query:', query);
        console.log('Params:', queryParams);
        await client.query(query, queryParams);
        console.log('Update SUCCESS!');
    }
    catch (error) {
        console.error('\n!!! ERROR OCCURRED !!!');
        console.error('Message:', error.message);
        console.error('Code:', error.code);
    }
    finally {
        client.release();
        process.exit();
    }
};
runDebug();
