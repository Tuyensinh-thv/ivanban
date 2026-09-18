import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { sendAccountApprovedEmail } from '@/lib/mailService';

const ALLOWED_STATUSES = ['active', 'pending', 'blocked'];
const ALLOWED_ROLES = ['admin', 'user'];

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Yêu cầu quyền Quản trị viên (Admin)' }, { status: 403 });
    }

    const res = await query(`
      SELECT id, full_name, email, phone, organization, role, status, created_at, updated_at
      FROM users
      ORDER BY 
        CASE WHEN status = 'pending' THEN 1 ELSE 2 END,
        created_at DESC;
    `);

    return NextResponse.json({ success: true, data: res.rows });
  } catch (error: unknown) {
    console.error('Admin users GET error:', error);
    return NextResponse.json({ success: false, error: 'Lỗi tải danh sách người dùng' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Yêu cầu quyền Quản trị viên (Admin)' }, { status: 403 });
    }

    const body = await request.json();
    const { id, status, role } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ success: false, error: 'User ID không hợp lệ' }, { status: 400 });
    }

    // Không cho phép tự khóa hoặc hạ quyền chính tài khoản admin đang đăng nhập
    if (id === currentUser.id && (status === 'blocked' || role === 'user')) {
      return NextResponse.json({ success: false, error: 'Không thể tự thay đổi quyền hạn tài khoản của chính bạn' }, { status: 400 });
    }

    // Xác thực giá trị hợp lệ theo Allowlist
    if (status && !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Trạng thái không hợp lệ. Cho phép: ${ALLOWED_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    if (role && !ALLOWED_ROLES.includes(role)) {
      return NextResponse.json(
        { success: false, error: `Quyền hạn không hợp lệ. Cho phép: ${ALLOWED_ROLES.join(', ')}` },
        { status: 400 }
      );
    }

    if (!status && !role) {
      return NextResponse.json({ success: false, error: 'Cần cung cấp status hoặc role để cập nhật' }, { status: 400 });
    }

    const updates: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (status) {
      updates.push(`status = $${paramIndex++}`);
      params.push(status);
    }

    if (role) {
      updates.push(`role = $${paramIndex++}`);
      params.push(role);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, full_name, email, role, status;`;
    const res = await query(sql, params);

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy người dùng' }, { status: 404 });
    }

    const updatedUser = res.rows[0];

    // Nếu vừa được kích hoạt trạng thái 'active', gửi email thông báo chúc mừng tới Cán bộ
    if (status === 'active') {
      sendAccountApprovedEmail({
        toEmail: updatedUser.email,
        fullName: updatedUser.full_name,
      }).catch((err) => {
        console.error('Failed to send account approval email in background:', err);
      });
    }

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error: unknown) {
    console.error('Update user error:', error);
    return NextResponse.json({ success: false, error: 'Lỗi khi cập nhật người dùng' }, { status: 500 });
  }
}
