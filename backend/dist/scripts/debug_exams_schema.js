"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../services/db"));
const checkSchema = async () => {
    const client = await db_1.default.connect();
    try {
        console.log('--- CHECKING EXAMS TABLE SCHEMA ---');
        const schemaRes = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'exams';
        `);
        console.table(schemaRes.rows);
    }
    catch (error) {
        console.error('Error checking schema:', error.message);
    }
    finally {
        client.release();
        process.exit();
    }
};
checkSchema();
