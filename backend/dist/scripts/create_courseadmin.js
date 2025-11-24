"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../services/db"));
const argon2_1 = __importDefault(require("argon2"));
const createCourseAdmin = async () => {
    console.log('🔧 Creating CourseAdmin user...\n');
    try {
        // 1. Get or create organization
        let orgId = '';
        const orgCheck = await db_1.default.query("SELECT id, name FROM organizations LIMIT 1");
        if (orgCheck.rows.length > 0) {
            orgId = orgCheck.rows[0].id;
            console.log(`✅ Found organization: ${orgCheck.rows[0].name} (${orgId})`);
        }
        else {
            const newOrg = await db_1.default.query(`
                INSERT INTO organizations (name, type, status)
                VALUES ('Zyntra Academy', 'school', 'active')
                RETURNING id, name
            `);
            orgId = newOrg.rows[0].id;
            console.log(`✅ Created organization: ${newOrg.rows[0].name} (${orgId})`);
        }
        // 2. Create courseadmin user
        const email = 'teacher@zyntra.com';
        const password = 'Teacher123!';
        const passwordHash = await argon2_1.default.hash(password);
        const userCheck = await db_1.default.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            // Update existing user to be courseadmin
            await db_1.default.query(`
                UPDATE users 
                SET role = 'courseadmin', 
                    password_hash = $1,
                    organization_id = $2,
                    status = 'active'
                WHERE email = $3
            `, [passwordHash, orgId, email]);
            console.log(`✅ Updated existing user to courseadmin: ${email}`);
        }
        else {
            // Create new user
            await db_1.default.query(`
                INSERT INTO users (full_name, email, password_hash, role, organization_id, status)
                VALUES ('Jane Teacher', $1, $2, 'courseadmin', $3, 'active')
            `, [email, passwordHash, orgId]);
            console.log(`✅ Created new courseadmin user: ${email}`);
        }
        // 3. Verify
        const verify = await db_1.default.query(`
            SELECT id, email, role, organization_id 
            FROM users 
            WHERE email = $1
        `, [email]);
        console.log('\n📋 Verification:');
        console.log(JSON.stringify(verify.rows[0], null, 2));
        console.log(`\n🎉 Done! Login with:`);
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);
        process.exit(0);
    }
    catch (e) {
        console.error('❌ Error:', e);
        process.exit(1);
    }
};
createCourseAdmin();
