import pool from '../services/db';

const testSimpleQuery = async () => {
    const orgId = 'a0632812-00f6-4ad3-aadd-35b351488eb';

    console.log('Test 1: Count students');
    try {
        const r1 = await pool.query('SELECT COUNT(id) FROM users WHERE organization_id = $1 AND role = $2', [orgId, 'student']);
        console.log('✅ Students:', r1.rows[0]);
    } catch (e: any) {
        console.error('❌ Students query failed:', e.message);
    }

    console.log('\nTest 2: Count exams');
    try {
        const r2 = await pool.query('SELECT COUNT(id) FROM exams WHERE organization_id = $1 AND status = $2', [orgId, 'live']);
        console.log('✅ Exams:', r2.rows[0]);
    } catch (e: any) {
        console.error('❌ Exams query failed:', e.message);
    }

    console.log('\nTest 3: Count submissions (with JOIN)');
    try {
        const r3 = await pool.query(`
            SELECT COUNT(es.id) 
            FROM exam_submissions es 
            JOIN exams e ON es.exam_id = e.id
            WHERE e.organization_id = $1 AND es.status = $2
        `, [orgId, 'completed']);
        console.log('✅ Submissions:', r3.rows[0]);
    } catch (e: any) {
        console.error('❌ Submissions query failed:', e.message);
    }

    process.exit(0);
};

testSimpleQuery();
