"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// /backend/src/config.ts
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
const config = {
    PORT: process.env.PORT || 5000,
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    BREVO_API_KEY: process.env.BREVO_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    EMAIL_NAME: process.env.EMAIL_NAME,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    FRONTEND_URL: process.env.FRONTEND_URL || 'https://zyntraexams.vercel.app',
    ZYNTRA_API_URL: process.env.ZYNTRA_API_URL || 'https://zyntra-ai-hio1.onrender.com',
    ZYNTRA_API_KEY: process.env.ZYNTRA_API_KEY || '',
};
// Update the check
if (!config.DATABASE_URL ||
    !config.JWT_SECRET ||
    !config.GEMINI_API_KEY ||
    !config.ZYNTRA_API_KEY) {
    throw new Error('DATABASE_URL, JWT_SECRET, GEMINI_API_KEY, or ZYNTRA_API_KEY is not defined in the .env file');
}
exports.default = config;
