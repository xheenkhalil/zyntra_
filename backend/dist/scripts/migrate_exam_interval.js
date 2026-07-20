"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../services/db"));
async function migrate() {
    try {
        // Add 'submitted_auto' to the submission_status enum if it doesn't already exist
        await db_1.default.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum 
          WHERE enumlabel = 'submitted_auto' 
          AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'submission_status')
        ) THEN
          ALTER TYPE submission_status ADD VALUE 'submitted_auto';
          RAISE NOTICE 'Added submitted_auto to submission_status enum.';
        ELSE
          RAISE NOTICE 'submitted_auto already exists in submission_status enum.';
        END IF;
      END
      $$;
    `);
        console.log('Migration complete: submitted_auto added to submission_status enum.');
        // Also add proctoring_interval column if not exists
        await db_1.default.query('ALTER TABLE exams ADD COLUMN IF NOT EXISTS proctoring_interval INTEGER DEFAULT 15;');
        console.log('Migration complete: proctoring_interval column ensured.');
    }
    catch (err) {
        console.error('Migration failed:', err);
    }
    finally {
        await db_1.default.end();
    }
}
migrate().catch(console.error);
