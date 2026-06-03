// /backend/src/config.ts
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const config = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  BREVO_API_KEY: process.env.BREVO_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  EMAIL_NAME: process.env.EMAIL_NAME,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  FRONTEND_URL: process.env.FRONTEND_URL || 'https://zyntra-exams.vercel.app',
};

// Update the check
if (!config.DATABASE_URL || !config.JWT_SECRET || !config.OPENAI_API_KEY) {
  throw new Error('DATABASE_URL, JWT_SECRET, or OPENAI_API_KEY is not defined in the .env file');
}

export default config;
