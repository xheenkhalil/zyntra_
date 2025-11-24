"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../services/db"));
const checkData = async () => {
    try {
        const res = await db_1.default.query("SELECT email, role FROM users WHERE email = 'teacher@zyntra.com'");
        console.log('Check Result:', res.rows);
        process.exit(0);
    }
    catch (e) {
        console.error('Check failed:', e);
        process.exit(1);
    }
};
checkData();
