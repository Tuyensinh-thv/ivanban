import { query } from './db';
import { headers } from 'next/headers';

export type ActionType =
  | 'draft_create'
  | 'document_audit'
  | 'user_login'
  | 'user_login_failed'
  | 'user_register'
  | 'config_update'
  | 'legal_base_approve'
  | 'legal_base_reject'
  | 'user_status_change'
  | 'api_key_update';

interface LogActivityParams {
  userEmail?: string | null;
  userName?: string | null;
  actionType: ActionType;
  description: string;
  metadata?: Record<string, unknown>;
}

async function getClientIp(): Promise<string> {
  try {
    const headersList = await headers();
    const forwarded = headersList.get('x-forwarded-for');
    if (forwarded) return forwarded.split(',')[0].trim();
    const realIp = headersList.get('x-real-ip');
    if (realIp) return realIp;
    return '127.0.0.1';
  } catch {
    return '127.0.0.1';
  }
}

export async function logActivity(params: LogActivityParams): Promise<void> {
  const { userEmail, userName, actionType, description, metadata } = params;
  const ipAddress = await getClientIp();

  try {
    await query(
      `INSERT INTO activity_logs (user_email, user_name, action_type, description, metadata, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        userEmail || null,
        userName || null,
        actionType,
        description,
        metadata ? JSON.stringify(metadata) : null,
        ipAddress,
      ]
    );
  } catch (err) {
    console.error('[ActivityLogger] Failed to log activity:', err);
  }
}
