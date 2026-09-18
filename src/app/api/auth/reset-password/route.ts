import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    if (!token || typeof token !== 'string' || token.length < 32) {
      return NextResponse.json(
        { success: false, error: 'Mã xác thực đặt lại mật khẩu không hợp lệ' },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Vui lòng cung cấp mật khẩu mới' },
        { status: 400 }
      );
    }

    // Kiểm tra độ dài mật khẩu mới: 6 - 128 ký tự
    if (newPassword.length < 6 || newPassword.length > 128) {
      return NextResponse.json(
        { success: false, error: 'Mật khẩu mới phải từ 6 đến 128 ký tự' },
        { status: 400 }
      );
    }

    // Xác thực token trong database
    const tokenRes = await query(
      'SELECT id, user_id, expires_at FROM password_resets WHERE token = $1 AND expires_at > CURRENT_TIMESTAMP',
      [token]
    );

    if (tokenRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Liên kết đặt lại mật khẩu đã hết hạn hoặc không tồn tại. Vui lòng gửi lại yêu cầu mới.' },
        { status: 400 }
      );
    }

    const resetRecord = tokenRes.rows[0];

    // Tạo hash mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    // Cập nhật mật khẩu người dùng
    await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hash, resetRecord.user_id]
    );

    // Xóa token đã sử dụng
    await query('DELETE FROM password_resets WHERE id = $1', [resetRecord.id]);

    return NextResponse.json({
      success: true,
      message: 'Đặt lại mật khẩu thành công! Đồng chí có thể đăng nhập bằng mật khẩu mới.',
    });
  } catch (error: unknown) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi hệ thống khi cập nhật mật khẩu mới' },
      { status: 500 }
    );
  }
}
