import { Pool } from 'pg';
import fs from 'fs';

// Read DATABASE_URL from .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
let dbUrl = '';
for (const line of envFile.split('\n')) {
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.substring('DATABASE_URL='.length).trim();
    break;
  }
}

if (!dbUrl) {
  console.error('DATABASE_URL not found in .env.local');
  process.exit(1);
}

const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  console.log('Connecting to database...');
  const client = await pool.connect();
  try {
    console.log('Running migrations...');

    // 1. activity_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_email VARCHAR(100),
        user_name VARCHAR(100),
        action_type VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        metadata JSONB,
        ip_address VARCHAR(45),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs (created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_activity_logs_action_type ON activity_logs (action_type);
      CREATE INDEX IF NOT EXISTS idx_activity_logs_user_email ON activity_logs (user_email);
    `);
    console.log('✓ activity_logs table checked/created');

    // 2. api_usage_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS api_usage_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        provider VARCHAR(50) NOT NULL,
        model VARCHAR(100),
        status VARCHAR(20) NOT NULL,
        status_code INT,
        duration_ms INT,
        error_message TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_api_usage_logs_created_at ON api_usage_logs (created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_api_usage_logs_provider ON api_usage_logs (provider);
    `);
    console.log('✓ api_usage_logs table checked/created');

    // 3. legal_bases alterations
    await client.query(`
      ALTER TABLE legal_bases ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
      ALTER TABLE legal_bases ADD COLUMN IF NOT EXISTS source_type VARCHAR(50) DEFAULT 'manual';
      ALTER TABLE legal_bases ADD COLUMN IF NOT EXISTS source_doc_name VARCHAR(255);
      CREATE INDEX IF NOT EXISTS idx_legal_bases_status ON legal_bases (status);
    `);
    console.log('✓ legal_bases table columns checked/altered');

    console.log('All migrations completed successfully!');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
