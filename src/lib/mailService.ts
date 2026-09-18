import nodemailer from 'nodemailer';

/**
 * Cụm hòm thư phụ trách gửi thông báo & nghiệp vụ chuyển đổi số của HVU:
 * - Email mặc định: tochuyendoiso@hvu.edu.vn
 * - Các email phụ xoay vòng: tochuyendoiso01@hvu.edu.vn, tochuyendoiso02@hvu.edu.vn
 */
export const HVU_EMAIL_POOL = [
  'tochuyendoiso@hvu.edu.vn',
  'tochuyendoiso01@hvu.edu.vn',
  'tochuyendoiso02@hvu.edu.vn',
] as const;

export const DEFAULT_SENDER_EMAIL = 'tochuyendoiso@hvu.edu.vn';
export const SENDER_DISPLAY_NAME = 'Tổ Chuyển đổi số - Trường Đại học Hùng Vương';

let poolIndex = 0;

/**
 * Lấy địa chỉ email gửi theo cơ chế xoay vòng (Round-robin)
 */
export function getNextSenderEmail(): string {
  const email = HVU_EMAIL_POOL[poolIndex];
  poolIndex = (poolIndex + 1) % HVU_EMAIL_POOL.length;
  return email;
}

/**
 * Khởi tạo Transporter cho Nodemailer
 */
function createTransporter(fromEmail: string) {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER || fromEmail;
  const pass = process.env.SMTP_PASS || process.env.HVU_EMAIL_PASSWORD || '';

  if (!pass) {
    return null; // Chưa có mật khẩu ứng dụng SMTP
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  preferredSender?: string;
}

/**
 * Gửi email với cơ chế xoay vòng và tự động fallback
 */
export async function sendHVUEmail(options: SendMailOptions): Promise<{ success: boolean; sender: string; messageId?: string }> {
  const senderEmail = options.preferredSender || getNextSenderEmail();
  const fromFormatted = `"${SENDER_DISPLAY_NAME}" <${senderEmail}>`;

  const transporter = createTransporter(senderEmail);

  if (!transporter) {
    // Trường hợp môi trường chưa thiết lập SMTP_PASS trong .env
    console.log(`[HVU Mailer (DEV / SIMULATION)] Đã lập yêu cầu gửi mail:`);
    console.log(`- Từ: ${fromFormatted}`);
    console.log(`- Đến: ${options.to}`);
    console.log(`- Tiêu đề: ${options.subject}`);
    return {
      success: true,
      sender: senderEmail,
      messageId: `simulated_${Date.now()}`,
    };
  }

  try {
    const info = await transporter.sendMail({
      from: fromFormatted,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    console.log(`[HVU Mailer] Đã gửi thành công từ ${senderEmail} đến ${options.to} (ID: ${info.messageId})`);
    return {
      success: true,
      sender: senderEmail,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error(`[HVU Mailer] Lỗi khi gửi từ ${senderEmail}:`, error);
    // Thử lại với sender mặc định nếu sender ban đầu thất bại
    if (senderEmail !== DEFAULT_SENDER_EMAIL) {
      console.log(`[HVU Mailer] Đang thử gửi lại với email mặc định ${DEFAULT_SENDER_EMAIL}...`);
      const defaultTransporter = createTransporter(DEFAULT_SENDER_EMAIL);
      if (defaultTransporter) {
        const fallbackInfo = await defaultTransporter.sendMail({
          from: `"${SENDER_DISPLAY_NAME}" <${DEFAULT_SENDER_EMAIL}>`,
          to: options.to,
          subject: options.subject,
          text: options.text,
          html: options.html,
        });
        return {
          success: true,
          sender: DEFAULT_SENDER_EMAIL,
          messageId: fallbackInfo.messageId,
        };
      }
    }
    throw error;
  }
}

/**
 * Gửi email đặt lại mật khẩu (Password Reset)
 */
export async function sendPasswordResetEmail(params: {
  toEmail: string;
  fullName: string;
  resetToken: string;
  origin?: string;
}): Promise<boolean> {
  const origin = params.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const resetLink = `${origin}/auth/reset-password?token=${params.resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .header { background: #1e3a8a; padding: 28px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px; }
        .header p { margin: 6px 0 0 0; font-size: 13px; opacity: 0.9; }
        .content { padding: 32px 24px; line-height: 1.6; }
        .btn-box { text-align: center; margin: 32px 0; }
        .btn { display: inline-block; background: #2563eb; color: #ffffff !important; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; }
        .footer { background: #f1f5f9; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        .notice { font-size: 13px; color: #64748b; background: #f8fafc; padding: 12px; border-radius: 6px; border-left: 4px solid #3b82f6; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>TRƯỜNG ĐẠI HỌC HÙNG VƯƠNG</h1>
          <p>HỆ THỐNG TRỢ LÝ SỐ SOẠN THẢO VĂN BẢN (iVanban - NĐ 30/2020/NĐ-CP)</p>
        </div>
        <div class="content">
          <p>Kính gửi đồng chí <strong>${params.fullName}</strong>,</p>
          <p>Hệ thống iVanban nhận được yêu cầu đặt lại mật khẩu cho tài khoản đăng ký với email <strong>${params.toEmail}</strong>.</p>
          <p>Đồng chí vui lòng nhấn vào nút bên dưới để tiến hành thiết lập mật khẩu mới:</p>
          <div class="btn-box">
            <a href="${resetLink}" class="btn" target="_blank">Thiết Lập Mật Khẩu Mới</a>
          </div>
          <div class="notice">
            ⚠️ <strong>Lưu ý:</strong> Liên kết này có thời hạn sử dụng trong vòng <strong>60 phút</strong>. Nếu đồng chí không thực hiện yêu cầu này, vui lòng bỏ qua email hoặc liên hệ với Tổ Chuyển đổi số.
          </div>
          <p style="margin-top: 24px; font-size: 13px; color: #64748b;">
            Nếu không bấm được vào nút trên, đồng chí có thể sao chép liên kết sau vào trình duyệt:<br>
            <a href="${resetLink}" style="color: #2563eb; word-break: break-all;">${resetLink}</a>
          </p>
        </div>
        <div class="footer">
          <p><strong>Tổ Chuyển đổi số - Trường Đại học Hùng Vương</strong></p>
          <p>Hòm thư hỗ trợ: tochuyendoiso@hvu.edu.vn | Cơ sở Nông Trang, TP. Việt Trì, Phú Thọ</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await sendHVUEmail({
      to: params.toEmail,
      subject: '[HVU - iVanban] Yêu cầu đặt lại mật khẩu',
      html,
    });
    return true;
  } catch (err) {
    console.error('Failed to send reset password email:', err);
    return false;
  }
}

/**
 * Gửi email thông báo tài khoản Cán bộ đã được kích hoạt
 */
export async function sendAccountApprovedEmail(params: {
  toEmail: string;
  fullName: string;
  origin?: string;
}): Promise<boolean> {
  const origin = params.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const loginLink = `${origin}/auth/login`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
        .header { background: #047857; padding: 28px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 20px; font-weight: 700; }
        .content { padding: 32px 24px; line-height: 1.6; }
        .btn-box { text-align: center; margin: 28px 0; }
        .btn { display: inline-block; background: #059669; color: #ffffff !important; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; }
        .footer { background: #f1f5f9; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>TRƯỜNG ĐẠI HỌC HÙNG VƯƠNG</h1>
          <p style="margin: 4px 0 0 0; font-size: 13px;">THÔNG BÁO KÍCH HOẠT TÀI KHOẢN THÀNH CÔNG</p>
        </div>
        <div class="content">
          <p>Kính gửi đồng chí <strong>${params.fullName}</strong>,</p>
          <p>Tài khoản Cán bộ/Giảng viên của đồng chí trên Hệ thống <strong>iVanban</strong> đã được Quản trị viên Trường Đại học Hùng Vương phê duyệt và kích hoạt thành công.</p>
          <p>Hiện tại đồng chí đã có thể sử dụng đầy đủ các tính năng: Soạn thảo văn bản không giới hạn, Rà soát chuẩn thể thức Nghị định 30, Tự động phúc đáp công văn và Thẩm định thẩm quyền pháp lý.</p>
          <div class="btn-box">
            <a href="${loginLink}" class="btn" target="_blank">Đăng Nhập Hệ Thống Ngay</a>
          </div>
        </div>
        <div class="footer">
          <p><strong>Tổ Chuyển đổi số - Trường Đại học Hùng Vương</strong></p>
          <p>Hòm thư hỗ trợ: tochuyendoiso@hvu.edu.vn</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await sendHVUEmail({
      to: params.toEmail,
      subject: '[HVU - iVanban] Tài khoản Cán bộ đã được kích hoạt thành công',
      html,
    });
    return true;
  } catch (err) {
    console.error('Failed to send approval email:', err);
    return false;
  }
}
