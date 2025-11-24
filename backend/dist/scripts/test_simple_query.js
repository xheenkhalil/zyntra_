"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../services/db"));
const testSimpleQuery = async () => {
    const orgId = 'a0632812-00f6-4ad3-aadd-35b351488eb';
    console.log('Test 1: Count students');
    try {
        const r1 = await db_1.default.query('SELECT COUNT(id) FROM users WHERE organization_id = $1 AND role = $2', [orgId, 'student']);
        console.log('✅ Students:', r1.rows[0]);
    }
    catch (e) {
        console.error('❌ Students query failed:', e.message);
    }
    console.log('\nTest 2: Count exams');
    try {
        const r2 = await db_1.default.query('SELECT COUNT(id) FROM exams WHERE organization_id = $1 AND status = $2', [orgId, 'live']);
        console.log('✅ Exams:', r2.rows[0]);
    }
    catch (e) {
        console.error('❌ Exams query failed:', e.message);
    }
    console.log('\nTest 3: Count submissions (with JOIN)');
    try {
        const r3 = await db_1.default.query(`
            SELECT COUNT(es.id) 
            FROM exam_submissions es 
            JOIN exams e ON es.exam_id = e.id
            WHERE e.organization_id = $1 AND es.status = $2
        `, [orgId, 'completed']);
        console.log('✅ Submissions:', r3.rows[0]);
    }
    catch (e) {
        console.error('❌ Submissions query failed:', e.message);
    }
    process.exit(0);
};
testSimpleQuery();
