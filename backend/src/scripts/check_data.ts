
import pool from '../services/db';

const checkData = async () => {
    try {
        const res = await pool.query("SELECT email, role FROM users WHERE email = 'teacher@zyntra.com'");
        console.log('Check Result:', res.rows);
        process.exit(0);
    } catch (e) {
        console.error('Check failed:', e);
        process.exit(1);
    }
};

checkData();
