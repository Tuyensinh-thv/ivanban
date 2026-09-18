import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { query } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'ivanban-hvu-secure-random-token-2026-production-do-not-share';
const COOKIE_NAME = 'ivanban_token';

export interface UserSession {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
  status: 'active' | 'pending' | 'blocked';
  organization?: string;
  phone?: string;
}

export function signToken(user: UserSession): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      status: user.status,
      organization: user.organization,
      phone: user.phone,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): UserSession | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserSession;
    return decoded;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) return null;

    // Xác thực lại với DB để đảm bảo user chưa bị khóa hoặc thay đổi quyền
    const res = await query('SELECT id, email, full_name, role, status, organization, phone FROM users WHERE id = $1', [decoded.id]);
    if (res.rows.length === 0) return null;

    const dbUser = res.rows[0] as UserSession;
    if (dbUser.status !== 'active') return null;

    return dbUser;
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
