import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        organization: user.organization,
        phone: user.phone,
        status: user.status,
      },
    });
  } catch (error: unknown) {
    console.error('Auth error in /api/auth/me:', error);
    return NextResponse.json({ authenticated: false, error: 'Lỗi xác thực người dùng' }, { status: 500 });
  }
}
