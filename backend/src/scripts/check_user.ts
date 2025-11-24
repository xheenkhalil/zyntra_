// Quick debug script to check user token
import pool from '../services/db';

const checkUser = async () => {
    try {
        const res = await pool.query(`
            SELECT id, email, role, organization_id 
            FROM users  
            WHERE email = 'teacher@zyntra.com'
        `);

        if (res.rows.length > 0) {
            console.log('✅ User found in DB:');
            console.log(JSON.stringify(res.rows[0], null, 2));
        } else {
            console.log('❌ User NOT found');
        }

        // Check students for this org
        if (res.rows.length > 0) {
            const orgId = res.rows[0].organization_id;
            const students = await pool.query(`
                SELECT COUNT(*) 
                FROM users 
                WHERE organization_id = $1 AND role = 'student'
            `, [orgId]);
            console.log(`\n👥 Students in org: ${students.rows[0].count}`);
        }

        process.exit(0);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
};

checkUser();
