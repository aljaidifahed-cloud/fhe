import pg from 'pg';
const { Client } = pg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DB_CONFIG = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASS || 'password',
    port: 5432,
};
const DB_NAME = process.env.DB_NAME || 'ksa_hrms';

async function initializeDatabase() {
    console.log('--- Database Initialization Started ---');

    // 1. Connect to default 'postgres' database to check/create target DB
    const client = new Client({ ...DB_CONFIG, database: 'postgres' });
    try {
        await client.connect();

        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [DB_NAME]);
        if (res.rowCount === 0) {
            console.log(`Database '${DB_NAME}' does not exist. Creating...`);
            await client.query(`CREATE DATABASE "${DB_NAME}"`);
            console.log(`Database '${DB_NAME}' created successfully.`);
        } else {
            console.log(`Database '${DB_NAME}' already exists.`);
        }
    } catch (err) {
        console.error('Error checking/creating database:', err);
        process.exit(1);
    } finally {
        await client.end();
    }

    // 2. Connect to the target database and run schema
    const pool = new Client({ ...DB_CONFIG, database: DB_NAME });
    try {
        await pool.connect();

        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Applying schema...');
        await pool.query(schemaSql);
        console.log('Schema applied successfully.');

    } catch (err) {
        console.error('Error applying schema:', err);
        process.exit(1);
    } finally {
        await pool.end();
    }

    console.log('--- Database Initialization Completed ---');
}

initializeDatabase();
