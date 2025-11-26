import pool from './services/db';

const check = async () => {
    try {
        const res = await pool.query("SELECT id, title, instructions FROM exams WHERE status = 'live'");
        console.log("Exams:", JSON.stringify(res.rows, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
};
check();
