import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Yêu cầu quyền Quản trị viên' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = (page - 1) * limit;
    const actionType = searchParams.get('action_type');
    const search = searchParams.get('search');

    let whereClause = 'WHERE 1=1';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (actionType && actionType !== 'all') {
      whereClause += ` AND action_type = $${paramIndex++}`;
      params.push(actionType);
    }

    if (search) {
      whereClause += ` AND (user_name ILIKE $${paramIndex} OR user_email ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR ip_address ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*)::int as total FROM activity_logs ${whereClause}`,
      params
    );

    const result = await query(
      `SELECT id, user_email, user_name, action_type, description, metadata, ip_address, created_at
       FROM activity_logs ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total: countResult.rows[0]?.total || 0,
        totalPages: Math.ceil((countResult.rows[0]?.total || 0) / limit),
      },
    });
  } catch (error: unknown) {
    console.error('Activity logs error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi tải nhật ký hoạt động' },
      { status: 500 }
    );
  }
}
