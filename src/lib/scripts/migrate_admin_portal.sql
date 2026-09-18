-- Migration: Tạo bảng activity_logs, api_usage_logs và bổ sung cột cho legal_bases
-- Date: 2024-09-15

-- 1. Bảng Nhật ký Hoạt động
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email VARCHAR(100),
  user_name VARCHAR(100),
  action_type VARCHAR(50) NOT NULL,
  description TEXT,
  metadata JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_action_type ON activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_email ON activity_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- 2. Bảng Ghi nhận API Usage
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

CREATE INDEX IF NOT EXISTS idx_api_usage_provider ON api_usage_logs(provider);
CREATE INDEX IF NOT EXISTS idx_api_usage_status ON api_usage_logs(status);
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON api_usage_logs(created_at DESC);

-- 3. Bổ sung cột cho bảng legal_bases (nếu chưa có)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='legal_bases' AND column_name='status') THEN
    ALTER TABLE legal_bases ADD COLUMN status VARCHAR(20) DEFAULT 'active';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='legal_bases' AND column_name='source_type') THEN
    ALTER TABLE legal_bases ADD COLUMN source_type VARCHAR(50) DEFAULT 'manual';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='legal_bases' AND column_name='source_doc_name') THEN
    ALTER TABLE legal_bases ADD COLUMN source_doc_name VARCHAR(255);
  END IF;
END $$;
