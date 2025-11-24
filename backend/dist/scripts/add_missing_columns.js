"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../services/db"));
const migrate = async () => {
    const client = await db_1.default.connect();
    try {
        console.log('--- MIGRATING EXAMS TABLE ---');
        // 1. Add is_proctored if not exists
        await client.query(`
            ALTER TABLE exams 
            ADD COLUMN IF NOT EXISTS is_proctored BOOLEAN DEFAULT FALSE;
        `);
        console.log('Added is_proctored column.');
        // 2. Add grading_scale if not exists (just in case)
        await client.query(`
            ALTER TABLE exams 
            ADD COLUMN IF NOT EXISTS grading_scale JSONB DEFAULT NULL;
        `);
        console.log('Checked grading_scale column.');
        console.log('Migration SUCCESS!');
    }
    catch (error) {
        console.error('Migration FAILED:', error.message);
    }
    finally {
        client.release();
        process.exit();
    }
};
migrate();
