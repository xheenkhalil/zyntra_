// /backend/src/config.ts
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const config = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
};

// Update the check
if (!config.DATABASE_URL || !config.JWT_SECRET || !config.OPENAI_API_KEY) {
  throw new Error('DATABASE_URL, JWT_SECRET, or OPENAI_API_KEY is not defined in the .env file');
}

export default config;
