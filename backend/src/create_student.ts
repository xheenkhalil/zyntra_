import pool from './services/db';
import bcrypt from 'bcrypt';

const create = async () => {
    try {
        const orgRes = await pool.query("SELECT id FROM organizations LIMIT 1");
        const orgId = orgRes.rows[0]?.id;

        // Fallback if no org (shouldn't happen in valid setup but...)
        // Actually, if no org, we can't create user easily with FK constraint.
        if (!orgId) {
            console.log("No organization found. Cannot create student.");
            process.exit(1);
        }

        const email = 'teststudent@example.com';
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);

        const check = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
        if (check.rows.length > 0) {
            console.log("Student already exists. ID:", check.rows[0].id);
        } else {
            const res = await pool.query(
                "INSERT INTO users (email, password, role, first_name, last_name, organization_id) VALUES ($1, $2, 'student', 'Test', 'Student', $3) RETURNING id",
                [email, hashedPassword, orgId]
            );
            console.log("Created student. ID:", res.rows[0].id);
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
};
create();
