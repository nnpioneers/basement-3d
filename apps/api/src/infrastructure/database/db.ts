import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load env from the root of apps/api
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/demo_new',
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
export default pool;
