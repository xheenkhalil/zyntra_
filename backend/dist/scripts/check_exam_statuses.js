"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../services/db"));
const checkExamStatuses = async () => {
    const orgId = 'a0632812-00f6-4ad3-aadd-35b351488eb';
    try {
        const result = await db_1.default.query(`
            SELECT status, COUNT(*) as count
            FROM exams
            WHERE organization_id = $1
            GROUP BY status
        `, [orgId]);
        console.log('Exam status counts:', result.rows);
        const total = await db_1.default.query(`SELECT COUNT(*) as total FROM exams WHERE organization_id = $1`, [orgId]);
        console.log('Total exams:', total.rows[0]);
        process.exit(0);
    }
    catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
};
checkExamStatuses();
