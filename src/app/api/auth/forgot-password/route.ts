import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { query } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/mailService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Vui lòng cung cấp địa chỉ email hợp lệ' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.toLowerCase().trim();

    // Tìm kiếm người dùng
    const userRes = await query('SELECT id, full_name, email, status FROM users WHERE email = $1', [trimmedEmail]);

    // Nguyên tắc bảo mật: Không tiết lộ người dùng có tồn tại hay không (Anti-Enumeration)
    if (userRes.rows.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nếu email tồn tại trên hệ thống, thư hướng dẫn đặt lại mật khẩu sẽ được gửi đến hộp thư của bạn trong giây lát.',
      });
    }

    const user = userRes.rows[0];

    if (user.status === 'blocked') {
      return NextResponse.json(
        { success: false, error: 'Tài khoản này đã bị khóa. Vui lòng liên hệ Quản trị viên HVU.' },
        { status: 403 }
      );
    }

    // Sinh token ngẫu nhiên bảo mật 64 ký tự hex
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 giờ

    // Xóa các token reset cũ của người dùng này
    await query('DELETE FROM password_resets WHERE user_id = $1', [user.id]);

    // Lưu token mới
    await query(
      'INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, resetToken, expiresAt]
    );

    // Xác định origin URL từ request headers
    const url = new URL(request.url);
    const origin = url.origin;

    // Gửi email qua Mail Service HVU
    await sendPasswordResetEmail({
      toEmail: user.email,
      fullName: user.full_name,
      resetToken,
      origin,
    });

    return NextResponse.json({
      success: true,
      message: 'Thư hướng dẫn đặt lại mật khẩu đã được gửi đến hộp thư của bạn. Vui lòng kiểm tra email.',
    });
  } catch (error: unknown) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi hệ thống khi xử lý yêu cầu đặt lại mật khẩu' },
      { status: 500 }
    );
  }
}
