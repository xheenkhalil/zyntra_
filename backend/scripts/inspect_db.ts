import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function inspect() {
  const client = await pool.connect();
  try {
    const orgs = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'organizations'`);
    console.log("--- ORGANIZATIONS TABLE ---");
    console.table(orgs.rows);

    const users = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'`);
    console.log("--- USERS TABLE ---");
    console.table(users.rows);

  } catch(e) {
    console.error(e);
  } finally {
    client.release();
    await pool.end();
  }
}

inspect();
