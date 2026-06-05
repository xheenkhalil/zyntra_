"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../services/db"));
async function migrate() {
    try {
        await db_1.default.query('ALTER TABLE exams ADD COLUMN IF NOT EXISTS proctoring_interval INTEGER DEFAULT 15;');
        console.log('Migration complete: proctoring_interval column added to exams.');
    }
    catch (err) {
        console.error('Migration failed:', err);
    }
    finally {
        await db_1.default.end();
    }
}
migrate();
