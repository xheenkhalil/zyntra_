"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../services/db"));
async function check() {
    try {
        const r1 = await db_1.default.query("SELECT column_name FROM information_schema.columns WHERE table_name='exam_submissions' ORDER BY ordinal_position");
        console.log('exam_submissions columns:', r1.rows.map((x) => x.column_name));
        const r2 = await db_1.default.query("SELECT column_name FROM information_schema.columns WHERE table_name='proctor_flags' ORDER BY ordinal_position");
        console.log('proctor_flags columns:', r2.rows.map((x) => x.column_name));
    }
    catch (e) {
        console.error(e);
    }
    finally {
        await db_1.default.end();
    }
}
check().catch(console.error);
