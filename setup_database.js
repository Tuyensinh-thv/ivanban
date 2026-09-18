const fs = require('fs');
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

// Đọc DATABASE_URL an toàn từ biến môi trường hoặc .env.local
let connectionString = process.env.DATABASE_URL;
if (!connectionString && fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
  if (match) connectionString = match[1];
}

if (!connectionString) {
  console.error('CRITICAL: DATABASE_URL not found in process.env or .env.local');
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function runCompleteDatabaseSetup() {
  try {
    console.log('Connecting to PostgreSQL database...');
    await client.connect();

    console.log('Running unified schema migration...');

    const schemaSql = `
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      -- 1. Bảng Người dùng (Users & Staff)
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        organization VARCHAR(255),
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user', -- 'admin', 'user'
        status VARCHAR(50) DEFAULT 'pending', -- 'active', 'pending', 'blocked'
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- 2. Bảng Theo dõi lượt dùng thử của khách (Guest Sessions)
      CREATE TABLE IF NOT EXISTS guest_sessions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        session_token VARCHAR(255) UNIQUE NOT NULL,
        document_count INT DEFAULT 0,
        ip_address VARCHAR(100),
        last_used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- 3. Bảng Cấu hình hệ thống (System Settings)
      CREATE TABLE IF NOT EXISTS system_settings (
        key VARCHAR(100) PRIMARY KEY,
        value JSONB NOT NULL,
        description TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- 4. Bảng Yêu cầu Đặt lại mật khẩu (Password Resets)
      CREATE TABLE IF NOT EXISTS password_resets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);

      -- 5. Bảng Mẫu văn bản (Templates)
      CREATE TABLE IF NOT EXISTS templates (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        code VARCHAR(50) UNIQUE,
        title VARCHAR(255) NOT NULL,
        doc_type VARCHAR(50) NOT NULL,
        agency VARCHAR(255) DEFAULT 'TRƯỜNG ĐẠI HỌC HÙNG VƯƠNG',
        description TEXT,
        layout_config JSONB DEFAULT '{}'::jsonb,
        sample_content TEXT,
        drive_file_id VARCHAR(255),
        drive_link TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- 6. Bảng Căn cứ pháp lý (Legal Bases)
      CREATE TABLE IF NOT EXISTS legal_bases (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        code VARCHAR(100),
        title VARCHAR(500) NOT NULL,
        issuer VARCHAR(255),
        issue_date DATE,
        effective_date DATE,
        category VARCHAR(100),
        summary TEXT,
        full_content TEXT,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- 7. Bảng Tài liệu soạn thảo (Documents)
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(500) NOT NULL,
        doc_type VARCHAR(50) NOT NULL,
        doc_number VARCHAR(100),
        subject VARCHAR(500),
        signer_name VARCHAR(100),
        signer_title VARCHAR(100),
        recipient TEXT,
        body_content JSONB DEFAULT '{}'::jsonb,
        docx_storage_path TEXT,
        status VARCHAR(50) DEFAULT 'draft',
        user_email VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- 8. Bảng Đồng bộ Google Drive
      CREATE TABLE IF NOT EXISTS drive_sync_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        drive_folder_id VARCHAR(255),
        file_id VARCHAR(255) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        mime_type VARCHAR(100),
        extracted_status VARCHAR(50) DEFAULT 'pending',
        error_message TEXT,
        synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await client.query(schemaSql);
    console.log('✅ Đã tạo/đồng bộ toàn bộ Schema cơ sở dữ liệu!');

    // Cài đặt system_settings mặc định
    const defaultSettings = [
      {
        key: 'guest_limit',
        value: { max_docs: 1, allow_trial: true },
        description: 'Giới hạn số lượng văn bản tạo cho khách vãng lai chưa đăng nhập',
      },
      {
        key: 'api_keys',
        value: { gemini: [], groq: [], deepseek: [] },
        description: 'Danh sách API Keys xoay vòng miễn phí được quản lý động',
      },
      {
        key: 'drive_config',
        value: {
          folder_id: '',
          folder_name: 'Kho Văn bản Mẫu HVU',
          is_connected: false,
          service_email: '',
        },
        description: 'Cấu hình thư mục Google Drive dùng chung của Nhà trường',
      },
      {
        key: 'menu_config',
        value: {
          allowed_types: ['decision', 'dispatch', 'statement', 'notice', 'plan', 'minutes'],
        },
        description: 'Danh mục loại văn bản được phép tạo',
      },
    ];

    for (const s of defaultSettings) {
      await client.query(
        `INSERT INTO system_settings (key, value, description)
         VALUES ($1, $2, $3)
         ON CONFLICT (key) DO NOTHING;`,
        [s.key, JSON.stringify(s.value), s.description]
      );
    }
    console.log('✅ Đã nạp cấu hình hệ thống ban đầu.');

    // Nạp căn cứ pháp lý ban đầu
    await client.query(`
      INSERT INTO legal_bases (code, title, issuer, category, summary)
      VALUES 
      ('30/2020/NĐ-CP', 'Nghị định số 30/2020/NĐ-CP của Chính phủ về công tác văn thư', 'Chính phủ', 'van_thu', 'Quy định chi tiết về thể thức, kỹ thuật trình bày văn bản hành chính và bản sao văn bản.'),
      ('34/2018/QH14', 'Luật sửa đổi, bổ sung một số điều của Luật Giáo dục đại học', 'Quốc hội', 'giao_duc', 'Quy định về tự chủ đại học, cơ cấu tổ chức và hoạt động của cơ sở giáo dục đại học.'),
      ('38/2020/NĐ-CP', 'Nghị định quy định về tuyển dụng, sử dụng và quản lý viên chức', 'Chính phủ', 'to_chuc_can_bo', 'Quy định chi tiết về chế độ, vị trí việc làm và quyền lợi của viên chức.')
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ Đã nạp danh mục căn cứ pháp lý mặc định.');

    await client.end();
    console.log('🚀 Khởi tạo và thiết lập Cơ sở dữ liệu iVanban thành công 100%!');
  } catch (err) {
    console.error('Lỗi khi thiết lập cơ sở dữ liệu:', err);
    process.exit(1);
  }
}

runCompleteDatabaseSetup();
