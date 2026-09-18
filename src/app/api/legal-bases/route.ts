import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logActivity } from '@/lib/activityLogger';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let whereClause = 'WHERE 1=1';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (status && status !== 'all') {
      whereClause += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    if (search) {
      whereClause += ` AND (title ILIKE $${paramIndex} OR code ILIKE $${paramIndex} OR issuer ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const result = await query(
      `SELECT * FROM legal_bases ${whereClause} ORDER BY created_at DESC LIMIT 200`,
      params
    );
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error: unknown) {
    console.error('Error fetching legal bases:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi tải danh mục căn cứ pháp lý' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Yêu cầu quyền Quản trị viên' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { code, title, issuer, category, summary, full_content, status: inputStatus, source_type, source_doc_name } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Tiêu đề căn cứ là bắt buộc' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO legal_bases (code, title, issuer, category, summary, full_content, status, source_type, source_doc_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *;`,
      [
        code,
        title,
        issuer,
        category,
        summary,
        full_content,
        inputStatus || 'active',
        source_type || 'manual',
        source_doc_name || null,
      ]
    );

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: unknown) {
    console.error('Error creating legal base:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi lưu căn cứ pháp lý' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Yêu cầu quyền Quản trị viên' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status || !['active', 'pending', 'archived'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'ID và trạng thái hợp lệ là bắt buộc' },
        { status: 400 }
      );
    }

    const result = await query(
      'UPDATE legal_bases SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy căn cứ pháp lý' },
        { status: 404 }
      );
    }

    const actionType = status === 'active' ? 'legal_base_approve' : 'legal_base_reject';
    await logActivity({
      userEmail: user.email,
      userName: user.full_name,
      actionType,
      description: `${status === 'active' ? 'Phê duyệt' : 'Từ chối'} căn cứ: ${result.rows[0].title}`,
      metadata: { legal_base_id: id, new_status: status },
    });

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: unknown) {
    console.error('Error updating legal base:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi cập nhật căn cứ pháp lý' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Yêu cầu quyền Quản trị viên' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Thiếu ID căn cứ pháp lý' },
        { status: 400 }
      );
    }

    const result = await query('DELETE FROM legal_bases WHERE id = $1 RETURNING title', [id]);

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy căn cứ pháp lý' },
        { status: 404 }
      );
    }

    await logActivity({
      userEmail: user.email,
      userName: user.full_name,
      actionType: 'legal_base_reject',
      description: `Xóa căn cứ pháp lý: ${result.rows[0].title}`,
      metadata: { legal_base_id: id },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error deleting legal base:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi xóa căn cứ pháp lý' },
      { status: 500 }
    );
  }
}
