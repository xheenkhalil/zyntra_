import pool from './services/db';

const test = async () => {
    try {
        // Check roles
        const roles = await pool.query("SELECT DISTINCT role FROM users");
        console.log("Roles found:", roles.rows);

        // Try to find an admin (course_admin or similar)
        // Note: The error 22P02 might be because I used a string literal that isn't in the enum.
        // I'll try to get ANY user with organization_id to test.
        const userRes = await pool.query("SELECT id, organization_id, role FROM users WHERE organization_id IS NOT NULL LIMIT 1");

        if (userRes.rows.length === 0) {
            console.log("No user found.");
            return;
        }

        const user = userRes.rows[0];
        console.log("Using user:", user);

        const title = "Test Exam With Instructions " + Date.now();
        const instructions = "These are the test instructions.";

        const query = `
            INSERT INTO exams (title, instructions, duration_minutes, is_proctored, course_admin_id, organization_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const res = await pool.query(query, [title, instructions, 30, false, user.id, user.organization_id]);
        console.log("Created Exam:", res.rows[0]);

        if (res.rows[0].instructions === instructions) {
            console.log("SUCCESS: Instructions saved correctly.");
        } else {
            console.log("FAILURE: Instructions NOT saved.");
        }

    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
};
test();
