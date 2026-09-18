import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// Danh sách các key cài đặt CÔNG KHAI được phép đọc không cần quyền Admin
const PUBLIC_SETTINGS_KEYS = ['guest_limit', 'menu_config'];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    // NGUYÊN TẮC BẢO MẬT (Least Privilege & Explicit Whitelist):
    // Chỉ các key trong PUBLIC_SETTINGS_KEYS mới được đọc công khai.
    // Mọi yêu cầu đọc key khác hoặc đọc toàn bộ (key rỗng) BẮT BUỘC phải là Quản trị viên (Admin).
    const isPublic = key && PUBLIC_SETTINGS_KEYS.includes(key);

    if (!isPublic) {
      const user = await getCurrentUser();
      if (!user || user.role !== 'admin') {
        return NextResponse.json(
          { success: false, error: 'Từ chối truy cập: Yêu cầu quyền Quản trị viên (Admin)' },
          { status: 403 }
        );
      }
    }

    if (key) {
      const res = await query('SELECT key, value, description FROM system_settings WHERE key = $1', [key]);
      if (res.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Không tìm thấy cấu hình' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: res.rows[0].value });
    }

    const resAll = await query('SELECT key, value, description, updated_at FROM system_settings');
    const settingsMap: Record<string, unknown> = {};
    resAll.rows.forEach((r) => {
      settingsMap[r.key] = r.value;
    });

    return NextResponse.json({ success: true, data: settingsMap });
  } catch (error: unknown) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ success: false, error: 'Lỗi tải cấu hình hệ thống' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Từ chối truy cập: Yêu cầu quyền Quản trị viên (Admin)' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { key, value, description } = body;

    if (!key || typeof key !== 'string' || value === undefined) {
      return NextResponse.json({ success: false, error: 'Thiếu key hoặc value hợp lệ' }, { status: 400 });
    }

    // Giới hạn độ dài key và description để chống DoS
    if (key.length > 64 || (description && description.length > 500)) {
      return NextResponse.json({ success: false, error: 'Key hoặc mô tả vượt quá độ dài cho phép' }, { status: 400 });
    }

    const sql = `
      INSERT INTO system_settings (key, value, description, updated_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (key) 
      DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const res = await query(sql, [key.trim(), JSON.stringify(value), description ? description.trim() : '']);
    return NextResponse.json({ success: true, data: res.rows[0] });
  } catch (error: unknown) {
    console.error('Settings POST error:', error);
    return NextResponse.json({ success: false, error: 'Lỗi cập nhật cấu hình hệ thống' }, { status: 500 });
  }
}
