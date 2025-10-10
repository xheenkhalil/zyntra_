"use strict";
// /backend/src/services/db.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testDbConnection = void 0;
const pg_1 = require("pg");
const config_1 = __importDefault(require("../config"));
const pool = new pg_1.Pool({
    connectionString: config_1.default.DATABASE_URL,
    // THE FIX IS HERE: We are explicitly adding the SSL configuration
    // This is often required for cloud databases like Supabase to maintain a stable connection.
    ssl: {
        rejectUnauthorized: false
    }
});
const testDbConnection = async () => {
    let client;
    try {
        client = await pool.connect();
        console.log('Successfully connected to the PostgreSQL database!');
        const result = await client.query('SELECT NOW()');
        return result.rows[0];
    }
    catch (error) {
        console.error('Error connecting to the database:', error);
        throw error;
    }
    finally {
        if (client) {
            client.release();
        }
    }
};
exports.testDbConnection = testDbConnection;
exports.default = pool;
