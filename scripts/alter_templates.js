const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.dlvndouocdjacwjesbok:Phutho2024%40%21@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await pool.query(`
    ALTER TABLE templates ADD COLUMN IF NOT EXISTS user_email VARCHAR(255);
    ALTER TABLE templates ADD COLUMN IF NOT EXISTS is_personal BOOLEAN DEFAULT false;
  `);
  console.log('✅ Altered templates table with user_email and is_personal');

  const cols = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'templates'");
  console.log('templates columns:', cols.rows.map(c => c.column_name).join(', '));
  await pool.end();
}

main().catch(err => {
  console.error(err);
  pool.end();
  process.exit(1);
});
