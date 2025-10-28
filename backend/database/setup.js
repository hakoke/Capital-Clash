import pool from './index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  try {
    console.log('🔄 Setting up database schema...');

    // Read monopoly schema file
    const schemaPath = path.join(__dirname, 'schema_monopoly.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema
    await pool.query(schema);

    console.log('✅ Database schema created successfully!');
    
    // Test connection
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connection verified:', result.rows[0]);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();

