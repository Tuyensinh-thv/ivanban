import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Yêu cầu quyền Quản trị viên' },
        { status: 403 }
      );
    }

    // 1. Thống kê tạo văn bản theo loại (từ activity_logs)
    const docByType = await query(
      `SELECT 
        COALESCE(metadata->>'doc_type', 'unknown') as doc_type,
        COUNT(*)::int as count
       FROM activity_logs 
       WHERE action_type = 'draft_create'
       GROUP BY metadata->>'doc_type'
       ORDER BY count DESC`
    );

    // 2. Thống kê soát lỗi
    const auditStats = await query(
      `SELECT 
        COUNT(*)::int as total_audits,
        AVG((metadata->>'score')::numeric)::numeric(5,1) as avg_score
       FROM activity_logs 
       WHERE action_type = 'document_audit'`
    );

    // 3. Thống kê API usage 24h
    const apiStats24h = await query(
      `SELECT 
        provider,
        status,
        COUNT(*)::int as count,
        AVG(duration_ms)::int as avg_duration
       FROM api_usage_logs
       WHERE created_at >= NOW() - INTERVAL '24 hours'
       GROUP BY provider, status
       ORDER BY provider, status`
    );

    // 4. Tổng số người dùng
    const userStats = await query(
      `SELECT 
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE status = 'active')::int as active,
        COUNT(*) FILTER (WHERE status = 'pending')::int as pending
       FROM users`
    );

    // 5. Hoạt động gần đây nhất (10 bản ghi)
    const recentActivities = await query(
      `SELECT action_type, user_name, user_email, description, ip_address, created_at
       FROM activity_logs
       ORDER BY created_at DESC
       LIMIT 10`
    );

    // 6. Số căn cứ pháp lý pending
    const pendingLegal = await query(
      `SELECT COUNT(*)::int as count FROM legal_bases WHERE status = 'pending'`
    );

    // 7. Thống kê theo ngày (7 ngày gần nhất)
    const dailyStats = await query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) FILTER (WHERE action_type = 'draft_create')::int as drafts,
        COUNT(*) FILTER (WHERE action_type = 'document_audit')::int as audits,
        COUNT(*) FILTER (WHERE action_type = 'user_login')::int as logins
       FROM activity_logs
       WHERE created_at >= NOW() - INTERVAL '7 days'
       GROUP BY DATE(created_at)
       ORDER BY date DESC`
    );

    return NextResponse.json({
      success: true,
      data: {
        docByType: docByType.rows,
        auditStats: auditStats.rows[0] || { total_audits: 0, avg_score: 0 },
        apiStats24h: apiStats24h.rows,
        userStats: userStats.rows[0] || { total: 0, active: 0, pending: 0 },
        recentActivities: recentActivities.rows,
        pendingLegalCount: pendingLegal.rows[0]?.count || 0,
        dailyStats: dailyStats.rows,
      },
    });
  } catch (error: unknown) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi tải thống kê Dashboard' },
      { status: 500 }
    );
  }
}
