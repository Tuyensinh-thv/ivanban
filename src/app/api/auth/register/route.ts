import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { sendHVUEmail, DEFAULT_SENDER_EMAIL } from '@/lib/mailService';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+.\-\s()]{8,20}$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { full_name, email, phone, organization, password } = body;

    if (!full_name || !email || !password || !phone || !organization) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng điền đầy đủ tất cả các trường thông tin bắt buộc' },
        { status: 400 }
      );
    }

    if (typeof full_name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ success: false, error: 'Dữ liệu không hợp lệ' }, { status: 400 });
    }

    const trimmedName = full_name.trim();
    const trimmedEmail = email.toLowerCase().trim();
    const trimmedPhone = typeof phone === 'string' ? phone.trim() : '';
    const trimmedOrg = typeof organization === 'string' ? organization.trim() : '';

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      return NextResponse.json({ success: false, error: 'Họ và tên phải từ 2 đến 100 ký tự' }, { status: 400 });
    }

    if (!EMAIL_REGEX.test(trimmedEmail) || trimmedEmail.length > 100) {
      return NextResponse.json({ success: false, error: 'Định dạng email không hợp lệ' }, { status: 400 });
    }

    if (!PHONE_REGEX.test(trimmedPhone)) {
      return NextResponse.json({ success: false, error: 'Số điện thoại không hợp lệ' }, { status: 400 });
    }

    if (trimmedOrg.length < 2 || trimmedOrg.length > 200) {
      return NextResponse.json({ success: false, error: 'Tên cơ quan / đơn vị phải từ 2 đến 200 ký tự' }, { status: 400 });
    }

    // Đảm bảo mật khẩu an toàn: tối thiểu 6 ký tự, tối đa 128 ký tự (ngăn ngừa bcrypt DoS)
    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Mật khẩu phải có tối thiểu 6 ký tự' }, { status: 400 });
    }

    if (password.length > 128) {
      return NextResponse.json({ success: false, error: 'Mật khẩu không được vượt quá 128 ký tự' }, { status: 400 });
    }

    // Kiểm tra email trùng
    const existing = await query('SELECT id FROM users WHERE email = $1', [trimmedEmail]);
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Email này đã được đăng ký trên hệ thống' },
        { status: 400 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Mặc định tài khoản đăng ký mới sẽ ở trạng thái 'pending' để Admin phê duyệt
    const res = await query(
      `INSERT INTO users (full_name, email, phone, organization, password_hash, role, status)
       VALUES ($1, $2, $3, $4, $5, 'user', 'pending')
       RETURNING id, full_name, email, phone, organization, role, status, created_at;`,
      [trimmedName, trimmedEmail, trimmedPhone, trimmedOrg, hash]
    );

    const newUser = res.rows[0];

    // Gửi thông báo đến Tổ Chuyển đổi số HVU (tochuyendoiso@hvu.edu.vn)
    sendHVUEmail({
      to: DEFAULT_SENDER_EMAIL,
      subject: `[HVU - iVanban] Yêu cầu phê duyệt tài khoản mới: ${trimmedName}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #1e293b;">
          <h3 style="color: #1e3a8a;">Thông báo: Cán bộ mới đăng ký tài khoản iVanban</h3>
          <p>Có một tài khoản cán bộ mới vừa đăng ký và đang chờ Quản trị viên phê duyệt:</p>
          <ul>
            <li><strong>Họ và tên:</strong> ${trimmedName}</li>
            <li><strong>Email:</strong> ${trimmedEmail}</li>
            <li><strong>Số điện thoại:</strong> ${trimmedPhone}</li>
            <li><strong>Cơ quan / Đơn vị:</strong> ${trimmedOrg}</li>
            <li><strong>Thời gian:</strong> ${new Date().toLocaleString('vi-VN')}</li>
          </ul>
          <p>Vui lòng đăng nhập trang Quản trị để kiểm tra và phê duyệt kích hoạt tài khoản.</p>
        </div>
      `,
    }).catch((err) => {
      console.error('Failed to notify admin on new registration:', err);
    });

    return NextResponse.json({
      success: true,
      message: 'Đăng ký tài khoản thành công! Tài khoản của bạn đang được chuyển đến Quản trị viên HVU phê duyệt.',
      data: newUser,
    });
  } catch (error: unknown) {
    console.error('Registration error:', error);
    return NextResponse.json({ success: false, error: 'Lỗi hệ thống khi đăng ký tài khoản' }, { status: 500 });
  }
}
