"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../services/db"));
const createTables = async () => {
    const client = await db_1.default.connect();
    try {
        console.log('🔌 Connected to database. Initializing Proctoring Tables...');
        await client.query('BEGIN');
        // 1. Create/Update proctor_profiles table
        await client.query(`
            CREATE TABLE IF NOT EXISTS proctor_profiles (
                user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                reference_images JSONB NOT NULL,
                rekognition_collection_id TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);
        // Add rekognition_collection_id column if it doesn't exist (for existing tables)
        await client.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'proctor_profiles' 
                    AND column_name = 'rekognition_collection_id'
                ) THEN
                    ALTER TABLE proctor_profiles ADD COLUMN rekognition_collection_id TEXT;
                END IF;
            END $$;
        `);
        console.log('✅ Table "proctor_profiles" ensured.');
        // 2. Create proctor_flags table
        await client.query(`
            CREATE TABLE IF NOT EXISTS proctor_flags (
                id SERIAL PRIMARY KEY,
                submission_id UUID REFERENCES exam_submissions(id) ON DELETE CASCADE,
                student_id UUID REFERENCES users(id) ON DELETE CASCADE,
                type TEXT NOT NULL,
                image_url TEXT,
                warning_count INTEGER DEFAULT 0,
                analysis_data JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);
        console.log('✅ Table "proctor_flags" ensured.');
        await client.query('COMMIT');
        console.log('🚀 Proctoring database setup complete!');
    }
    catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error initializing database:', error);
    }
    finally {
        client.release();
        db_1.default.end(); // Close pool to exit script
    }
};
createTables();
