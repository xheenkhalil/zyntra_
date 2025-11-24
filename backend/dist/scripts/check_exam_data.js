"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../services/db"));
const checkData = async () => {
    try {
        const orgId = 'a0632812-0094-4d5a-a81e-9df028174d7c'; // Replace with actual org ID
        console.log('Checking exam submissions...');
        const subs = await db_1.default.query(`
            SELECT es.*, e.organization_id 
            FROM exam_submissions es
            JOIN exams e ON es.exam_id = e.id
            WHERE e.organization_id = $1
            LIMIT 5
        `, [orgId]);
        console.log('Submissions:', JSON.stringify(subs.rows, null, 2));
        console.log('\nChecking exams...');
        const exams = await db_1.default.query(`
            SELECT * FROM exams
            WHERE organization_id = $1
        `, [orgId]);
        console.log('Exams:', JSON.stringify(exams.rows, null, 2));
        process.exit(0);
    }
    catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
};
checkData();
