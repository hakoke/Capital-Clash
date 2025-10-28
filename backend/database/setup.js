import pool from './index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  try {
    console.log('🔄 Setting up Monopoly database schema...');

    // Read monopoly schema file
    const schemaPath = path.join(__dirname, 'schema_monopoly.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema (split by semicolons for PostgreSQL)
    const statements = schema.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await pool.query(statement);
      }
    }

    console.log('✅ Monopoly database schema created successfully!');
    
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

