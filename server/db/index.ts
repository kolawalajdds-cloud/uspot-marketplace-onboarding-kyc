import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString || connectionString.includes('YOUR_PASSWORD')) {
  console.warn('⚠️ WARNING: Valid DATABASE_URL not detected in .env. Please update .env with your Neon connection string.');
}

export const pool = new Pool({
  connectionString: connectionString || undefined,
  ssl: connectionString && connectionString.includes('sslmode=require') 
    ? { rejectUnauthorized: false } 
    : undefined,
});

export const db = drizzle(pool, { schema });
