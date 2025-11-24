import pool from '../services/db';

const verifyData = async () => {
    console.log('🔍 Verifying CourseAdmin data...\n');

    try {
        // Check organizations
        const orgs = await pool.query("SELECT id, name FROM organizations LIMIT 1");
        console.log(`📊 Organizations: ${orgs.rows.length}`);
        if (orgs.rows.length > 0) {
            console.log(`   └─ ${orgs.rows[0].name} (${orgs.rows[0].id})\n`);
        }

        // Check courseadmin user
        const admins = await pool.query("SELECT email, role FROM users WHERE role = 'courseadmin' LIMIT 1");
        console.log(`👤 Course Admins: ${admins.rows.length}`);
        if (admins.rows.length > 0) {
            console.log(`   └─ ${admins.rows[0].email}\n`);
        }

        // Check students
        const students = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'student'");
        console.log(`🎓 Students: ${students.rows[0].count}\n`);

        // Check exams
        const exams = await pool.query("SELECT id, title, status FROM exams LIMIT 1");
        console.log(`📝 Exams: ${exams.rows.length}`);
        if (exams.rows.length > 0) {
            console.log(`   └─ ${exams.rows[0].title} (${exams.rows[0].status})\n`);
        }

        // Check submissions
        const subs = await pool.query("SELECT COUNT(*) FROM exam_submissions");
        console.log(`✅ Submissions: ${subs.rows[0].count}\n`);

        if (admins.rows.length > 0 && students.rows[0].count > 0) {
            console.log('🎉 CourseAdmin data is present! You can now test the dashboard.');
            console.log('   Login with: teacher@zyntra.com / Teacher123!');
        } else {
            console.log('⚠️  Missing data. Seed script may have failed.');
        }

        process.exit(0);
    } catch (e) {
        console.error('❌ Verification failed:', e);
        process.exit(1);
    }
};

verifyData();
