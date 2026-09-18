import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

const GUEST_COOKIE = 'ivanban_guest_token';

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (user && user.status === 'active') {
      return NextResponse.json({ success: true, is_guest: false });
    }

    const cookieStore = await cookies();
    const guestToken = cookieStore.get(GUEST_COOKIE)?.value;

    if (guestToken) {
      await query(
        `INSERT INTO guest_sessions (session_token, document_count, last_used_at)
         VALUES ($1, 1, CURRENT_TIMESTAMP)
         ON CONFLICT (session_token) 
         DO UPDATE SET document_count = guest_sessions.document_count + 1, last_used_at = CURRENT_TIMESTAMP;`,
        [guestToken]
      );
    }

    return NextResponse.json({ success: true, is_guest: true });
  } catch (error: unknown) {
    console.error('Guest increment error:', error);
    return NextResponse.json({ success: false, error: 'Lỗi ghi nhận phiên làm việc' }, { status: 500 });
  }
}
