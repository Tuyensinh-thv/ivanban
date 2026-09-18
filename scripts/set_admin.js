const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.dlvndouocdjacwjesbok:Phutho2024%40%21@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const email = 'kiennt@hvu.edu.vn';
  const rawPassword = 'Phutho2024@!';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(rawPassword, salt);

  console.log('Checking for user:', email);
  const existing = await pool.query('SELECT id, email, role FROM users WHERE email = $1', [email]);
  
  if (existing.rows.length > 0) {
    await pool.query(
      'UPDATE users SET password_hash = $1, role = $2, status = $3, full_name = $4 WHERE email = $5',
      [hash, 'admin', 'active', 'Nguyễn Trung Kiên (Admin)', email]
    );
    console.log('✅ Updated user to admin successfully!');
  } else {
    await pool.query(
      'INSERT INTO users (id, full_name, email, password_hash, role, status) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)',
      ['Nguyễn Trung Kiên (Admin)', email, hash, 'admin', 'active']
    );
    console.log('✅ Created new admin user successfully!');
  }

  const res = await pool.query('SELECT id, full_name, email, role, status FROM users WHERE email = $1', [email]);
  console.log('Result user:', res.rows[0]);

  const verify = await bcrypt.compare(rawPassword, hash);
  console.log('Password test match:', verify);

  await pool.end();
}

main().catch(err => {
  console.error('Error:', err);
  pool.end();
  process.exit(1);
});
