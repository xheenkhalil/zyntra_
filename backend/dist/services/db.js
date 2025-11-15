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
    ssl: {
        rejectUnauthorized: false
    },
    idleTimeoutMillis: 10000,
    maxUses: 5000, // Recycle a connection after 5000 queries for stability
});
pool.on('error', (err, client) => {
    console.error('[DATABASE POOL ERROR]', err.message, client);
});
// This is your existing, correct test function
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
