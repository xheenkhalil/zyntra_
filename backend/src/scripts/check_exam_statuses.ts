import pool from '../services/db';

const checkExamStatuses = async () => {
    const orgId = 'a0632812-00f6-4ad3-aadd-35b351488eb';
    try {
        const result = await pool.query(`
            SELECT status, COUNT(*) as count
            FROM exams
            WHERE organization_id = $1
            GROUP BY status
        `, [orgId]);
        console.log('Exam status counts:', result.rows);
        const total = await pool.query(`SELECT COUNT(*) as total FROM exams WHERE organization_id = $1`, [orgId]);
        console.log('Total exams:', total.rows[0]);
        process.exit(0);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
};

checkExamStatuses();
