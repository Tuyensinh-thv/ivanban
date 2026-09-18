import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { query } from '@/lib/db';
import { getCurrentUser, UserSession } from '@/lib/auth';

export const GUEST_COOKIE_NAME = 'ivanban_guest_token';

export interface QuotaCheckResult {
  allowed: boolean;
  isGuest: boolean;
  user?: UserSession;
  guestToken?: string;
  currentCount?: number;
  maxDocs?: number;
  remaining?: number;
  error?: string;
}

/**
 * Kiểm soát giới hạn sử dụng phía Server (Server-Side Quota Guard):
 * - Nếu người dùng đã đăng nhập (active user): Toàn quyền sử dụng, không bị giới hạn.
 * - Nếu là khách vãng lai: Kiểm tra phiên làm việc, nếu vượt quá số lượng cho phép (mặc định 1 VB),
 *   chặn ngay tại Backend và yêu cầu đăng ký/đăng nhập.
 */
export async function enforceGuestOrUserQuota(): Promise<QuotaCheckResult> {
  try {
    // 1. Kiểm tra phiên người dùng đã đăng nhập
    const user = await getCurrentUser();
    if (user && user.status === 'active') {
      return {
        allowed: true,
        isGuest: false,
        user,
      };
    }

    // 2. Xử lý khách vãng lai (Guest)
    const cookieStore = await cookies();
    let guestToken = cookieStore.get(GUEST_COOKIE_NAME)?.value;

    if (!guestToken || typeof guestToken !== 'string' || guestToken.length < 16) {
      guestToken = 'guest_' + crypto.randomBytes(16).toString('hex');
    }

    // Lấy cấu hình giới hạn từ system_settings
    let maxDocs = 1;
    try {
      const settingRes = await query("SELECT value FROM system_settings WHERE key = 'guest_limit'");
      if (settingRes.rows.length > 0 && settingRes.rows[0].value?.max_docs !== undefined) {
        maxDocs = Number(settingRes.rows[0].value.max_docs);
      }
    } catch {
      maxDocs = 1;
    }

    // Truy vấn hoặc khởi tạo lượt dùng trong guest_sessions
    const sessionRes = await query(
      'SELECT document_count FROM guest_sessions WHERE session_token = $1',
      [guestToken]
    );

    let currentCount = 0;
    if (sessionRes.rows.length > 0) {
      currentCount = Number(sessionRes.rows[0].document_count);
    } else {
      await query(
        'INSERT INTO guest_sessions (session_token, document_count, last_used_at) VALUES ($1, 0, CURRENT_TIMESTAMP) ON CONFLICT (session_token) DO NOTHING',
        [guestToken]
      );
    }

    // Kiểm tra giới hạn
    if (currentCount >= maxDocs) {
      return {
        allowed: false,
        isGuest: true,
        guestToken,
        currentCount,
        maxDocs,
        remaining: 0,
        error: `Bạn đã sử dụng hết lượt trải nghiệm miễn phí (${currentCount}/${maxDocs} văn bản). Vui lòng đăng ký hoặc đăng nhập tài khoản Cán bộ HVU để sử dụng đầy đủ các tính năng.`,
      };
    }

    // Tăng số lượng văn bản đã sử dụng ngay tại Server
    await query(
      `UPDATE guest_sessions 
       SET document_count = document_count + 1, last_used_at = CURRENT_TIMESTAMP 
       WHERE session_token = $1`,
      [guestToken]
    );

    return {
      allowed: true,
      isGuest: true,
      guestToken,
      currentCount: currentCount + 1,
      maxDocs,
      remaining: Math.max(0, maxDocs - (currentCount + 1)),
    };
  } catch (error: unknown) {
    console.error('Server quota guard error:', error);
    // Trong trường hợp lỗi database, cho phép để không làm gián đoạn người dùng nhưng log cảnh báo
    return {
      allowed: true,
      isGuest: true,
    };
  }
}

/**
 * Đính kèm Cookie Guest Token vào phản hồi NextResponse
 */
export function attachGuestCookie(response: NextResponse, guestToken?: string): NextResponse {
  if (guestToken) {
    response.cookies.set({
      name: GUEST_COOKIE_NAME,
      value: guestToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 ngày
    });
  }
  return response;
}
