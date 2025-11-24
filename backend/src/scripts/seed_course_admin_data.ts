
import pool from '../services/db';
import * as crypto from 'crypto';
import argon2 from 'argon2';

// --- Configuration ---
const ORG_ID = 'org_1234567890';

const generateStudentCode = (): string => {
    const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
    const timestampComponent = (Date.now() % 100).toString().padStart(2, '0');
    const suffix = (randomHex + timestampComponent).slice(0, 9);
    return `Z${suffix}`;
};

const seedData = async () => {
    console.log('🚀 Initializing seed script...');
    console.log('🔌 Connecting to database...');

    let client;
    try {
        client = await pool.connect();
        console.log('✅ Connected to database');
    } catch (e) {
        console.error('❌ Connection failed:', e);
        process.exit(1);
    }

    try {
        await client.query('BEGIN');
        console.log('🌱 Starting transaction...');

        // 1. Get or Create Organization
        let orgId = '';
        const orgRes = await client.query("SELECT id FROM organizations LIMIT 1");
        if (orgRes.rows.length > 0) {
            orgId = orgRes.rows[0].id;
            console.log(`✅ Using existing Organization ID: ${orgId}`);
        } else {
            const newOrg = await client.query(`
                INSERT INTO organizations (name, type, status) 
                VALUES ('Zyntra Academy', 'school', 'active') 
                RETURNING id
            `);
            orgId = newOrg.rows[0].id;
            console.log(`✅ Created new Organization: ${orgId}`);
        }

        // 2. Create Course Admin User (if not exists)
        const adminEmail = 'teacher@zyntra.com';
        const adminPass = await argon2.hash('Teacher123!');
        await client.query(`
            INSERT INTO users (full_name, email, password_hash, role, organization_id, status)
            VALUES ('Jane Teacher', $1, $2, 'courseadmin', $3, 'active')
            ON CONFLICT (email) DO NOTHING
        `, [adminEmail, adminPass, orgId]);
        console.log(`✅ Course Admin ensured: ${adminEmail} / Teacher123!`);

        // 3. Create Students
        const students = [
            { name: 'Alice Johnson', email: 'alice@example.com' },
            { name: 'Bob Smith', email: 'bob@example.com' },
            { name: 'Charlie Brown', email: 'charlie@example.com' },
            { name: 'Diana Prince', email: 'diana@example.com' },
            { name: 'Evan Wright', email: 'evan@example.com' },
        ];

        const studentIds = [];
        for (const s of students) {
            const code = generateStudentCode();
            const res = await client.query(`
                INSERT INTO users (full_name, email, student_id, role, organization_id, status)
                VALUES ($1, $2, $3, 'student', $4, 'active')
                ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
                RETURNING id
            `, [s.name, s.email, code, orgId]);
            studentIds.push(res.rows[0].id);
        }
        console.log(`✅ Seeded ${studentIds.length} students.`);

        // 4. Create an Exam
        const examRes = await client.query(`
            INSERT INTO exams (title, organization_id, course_admin_id, status, duration_minutes)
            VALUES ('Midterm Mathematics', $1, (SELECT id FROM users WHERE email = $2), 'live', 60)
            RETURNING id
        `, [orgId, adminEmail]);
        const examId = examRes.rows[0].id;
        console.log(`✅ Created Exam: ${examId}`);

        // 5. Create Submissions (Past 30 days)
        const now = new Date();
        for (let i = 0; i < 20; i++) {
            const studentId = studentIds[Math.floor(Math.random() * studentIds.length)];
            const score = Math.floor(Math.random() * 40) + 60; // 60-100
            const daysAgo = Math.floor(Math.random() * 30);
            const submittedAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

            await client.query(`
                INSERT INTO exam_submissions (exam_id, student_id, score_percentage, status, submitted_at)
                VALUES ($1, $2, $3, 'completed', $4)
            `, [examId, studentId, score, submittedAt]);
        }
        console.log(`✅ Seeded 20 exam submissions.`);

        await client.query('COMMIT');
        console.log('🎉 Seeding complete!');

    } catch (e) {
        await client.query('ROLLBACK');
        console.error('❌ Seeding failed:', e);
    } finally {
        client.release();
        process.exit(0);
    }
};

seedData();
