import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { signToken, COOKIE_NAME } from '@/lib/auth';
import { logActivity } from '@/lib/activityLogger';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ success: false, error: 'Vui lòng nhập Email và Mật khẩu' }, { status: 400 });
    }

    const trimmedEmail = email.toLowerCase().trim();

    if (trimmedEmail.length > 100 || password.length > 128) {
      return NextResponse.json({ success: false, error: 'Email hoặc mật khẩu không chính xác' }, { status: 401 });
    }

    const res = await query(
      'SELECT id, full_name, email, phone, organization, password_hash, role, status FROM users WHERE email = $1',
      [trimmedEmail]
    );

    if (res.rows.length === 0) {
      await logActivity({ userEmail: trimmedEmail, actionType: 'user_login_failed', description: 'Đăng nhập thất bại: Email không tồn tại' });
      return NextResponse.json({ success: false, error: 'Email hoặc mật khẩu không chính xác' }, { status: 401 });
    }

    const user = res.rows[0];

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      await logActivity({ userEmail: trimmedEmail, userName: user.full_name, actionType: 'user_login_failed', description: 'Đăng nhập thất bại: Sai mật khẩu' });
      return NextResponse.json({ success: false, error: 'Email hoặc mật khẩu không chính xác' }, { status: 401 });
    }

    if (user.status === 'blocked') {
      return NextResponse.json(
        { success: false, error: 'Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ Quản trị viên HVU.' },
        { status: 403 }
      );
    }

    if (user.status === 'pending') {
      return NextResponse.json(
        {
          success: false,
          error: 'Tài khoản của bạn đang chờ Quản trị viên phê duyệt. Vui lòng thử lại sau khi được kích hoạt.',
          pending: true,
        },
        { status: 403 }
      );
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      status: user.status,
      organization: user.organization,
      phone: user.phone,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        organization: user.organization,
        phone: user.phone,
      },
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    await logActivity({
      userEmail: user.email,
      userName: user.full_name,
      actionType: 'user_login',
      description: `Đăng nhập thành công: ${user.full_name} (${user.organization || 'N/A'})`,
      metadata: { role: user.role, organization: user.organization },
    });

    return response;
  } catch (error: unknown) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Lỗi hệ thống khi đăng nhập' }, { status: 500 });
  }
}
