import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

const GUEST_COOKIE = 'ivanban_guest_token';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (user && user.status === 'active') {
      return NextResponse.json({
        is_guest: false,
        can_generate: true,
        document_count: 0,
        max_docs: 999999,
      });
    }

    const cookieStore = await cookies();
    let guestToken = cookieStore.get(GUEST_COOKIE)?.value;

    if (!guestToken || typeof guestToken !== 'string' || guestToken.length < 16) {
      guestToken = 'guest_' + crypto.randomBytes(16).toString('hex');
    }

    // Lấy giới hạn từ settings
    const settingRes = await query("SELECT value FROM system_settings WHERE key = 'guest_limit'");
    const maxDocs = settingRes.rows.length > 0 && settingRes.rows[0].value?.max_docs !== undefined
      ? Number(settingRes.rows[0].value.max_docs)
      : 1;

    // Lấy số văn bản đã tạo
    let currentCount = 0;
    const sessionRes = await query('SELECT document_count FROM guest_sessions WHERE session_token = $1', [guestToken]);

    if (sessionRes.rows.length > 0) {
      currentCount = Number(sessionRes.rows[0].document_count);
    } else {
      await query(
        'INSERT INTO guest_sessions (session_token, document_count) VALUES ($1, 0) ON CONFLICT (session_token) DO NOTHING',
        [guestToken]
      );
    }

    const canGenerate = currentCount < maxDocs;

    const response = NextResponse.json({
      is_guest: true,
      can_generate: canGenerate,
      document_count: currentCount,
      max_docs: maxDocs,
      remaining: Math.max(0, maxDocs - currentCount),
    });

    response.cookies.set({
      name: GUEST_COOKIE,
      value: guestToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error: unknown) {
    console.error('Guest check error:', error);
    return NextResponse.json({ is_guest: true, can_generate: false, error: 'Lỗi kiểm tra trạng thái' }, { status: 500 });
  }
}
