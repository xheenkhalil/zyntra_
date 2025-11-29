
import pool from '../src/services/db';
import argon2 from 'argon2';

async function createTestSuperAdmin() {
    try {
        const email = 'testsuperadmin@zyntra.com';
        const password = 'password123';
        const passwordHash = await argon2.hash(password);

        // Check if exists
        const check = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (check.rows.length > 0) {
            console.log('User already exists, updating password...');
            await pool.query('UPDATE users SET password_hash = $1, role = $2 WHERE email = $3', [passwordHash, 'superadmin', email]);
        } else {
            console.log('Creating new superadmin...');
            await pool.query(
                "INSERT INTO users (full_name, email, password_hash, role, status) VALUES ($1, $2, $3, $4, 'active')",
                ['Test SuperAdmin', email, passwordHash, 'superadmin']
            );
        }
        console.log('✅ Test SuperAdmin ready.');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

createTestSuperAdmin();
