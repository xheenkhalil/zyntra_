import pool from './services/db';

const update = async () => {
    try {
        const res = await pool.query("UPDATE exams SET instructions = 'These are the default instructions. Please read them carefully. Good luck!' WHERE instructions IS NULL AND status = 'live'");
        console.log(`Updated ${res.rowCount} exams with default instructions.`);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
};
update();
