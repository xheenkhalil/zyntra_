import pool from '../services/db';

const testQuery = async () => {
    const orgId = 'a0632812-00f6-4ad3-aadd-35b351488eb';

    console.log('Testing stats query for org:', orgId);

    try {
        const statsQuery = `
            SELECT
                (SELECT COUNT(id) FROM users WHERE organization_id = $1 AND role = 'student') AS total_students,
                (SELECT COUNT(id) FROM exams WHERE organization_id = $1 AND status = 'live') AS active_exams,
                (SELECT COUNT(id) FROM exam_submissions es 
                 JOIN exams e ON es.exam_id = e.id
                 WHERE e.organization_id = $1 AND es.status = 'completed') AS total_submissions_completed;
        `;

        const result = await pool.query(statsQuery, [orgId]);
        console.log('Query result:', JSON.stringify(result.rows, null, 2));

        if (result.rows.length === 0) {
            console.log('❌ No rows returned!');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Query failed:', error);
        process.exit(1);
    }
};

testQuery();
