const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.dlvndouocdjacwjesbok:Phutho2024%40%21@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
  console.log('TABLES:', tables.rows.map(r => r.table_name));

  for (const t of tables.rows.map(r => r.table_name)) {
    const cols = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1", [t]);
    console.log(`Table [${t}]:`, cols.rows.map(c => c.column_name).join(', '));
  }
  await pool.end();
}

main().catch(e => {
  console.error(e);
  pool.end();
});
