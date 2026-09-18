import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const docType = searchParams.get('type');
    const user = await getCurrentUser();

    let sql = 'SELECT * FROM templates WHERE is_active = true';
    const params: unknown[] = [];

    if (user) {
      // Cán bộ đăng nhập: xem mẫu chung của trường + mẫu/drive riêng của mình
      sql += ' AND (is_personal = false OR user_email = $1 OR user_email IS NULL)';
      params.push(user.email);

      if (docType) {
        sql += ' AND doc_type = $2';
        params.push(docType);
      }
    } else {
      // Khách chưa đăng nhập: chỉ xem mẫu chung
      sql += ' AND (is_personal = false OR user_email IS NULL)';
      if (docType) {
        sql += ' AND doc_type = $1';
        params.push(docType);
      }
    }

    sql += ' ORDER BY created_at DESC;';

    const result = await query(sql, params);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error: unknown) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ success: false, error: 'Lỗi tải danh mục mẫu văn bản' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Vui lòng đăng nhập tài khoản Cán bộ để tải lên mẫu văn bản hoặc kết nối Drive' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { code, title, doc_type, agency, description, layout_config, sample_content, drive_file_id, drive_link, is_personal } = body;

    if (!title || !doc_type) {
      return NextResponse.json({ success: false, error: 'Tiêu đề và loại văn bản là bắt buộc' }, { status: 400 });
    }

    // Nếu không phải admin, bắt buộc là mẫu cá nhân
    const isPersonalTemplate = user.role === 'admin' ? (is_personal !== false) : true;
    const templateCode = code || `HVU-${doc_type.toUpperCase()}-${Date.now().toString().slice(-6)}`;

    const result = await query(
      `INSERT INTO templates (code, title, doc_type, agency, description, layout_config, sample_content, drive_file_id, drive_link, user_email, is_personal)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *;`,
      [
        templateCode,
        title,
        doc_type,
        agency || (isPersonalTemplate ? `Cán bộ: ${user.full_name}` : 'TRƯỜNG ĐẠI HỌC HÙNG VƯƠNG'),
        description || '',
        layout_config || {},
        sample_content || '',
        drive_file_id || null,
        drive_link || null,
        user.email,
        isPersonalTemplate
      ]
    );

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: unknown) {
    console.error('Error creating template:', error);
    return NextResponse.json({ success: false, error: 'Lỗi khi lưu mẫu văn bản' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.status !== 'active') {
      return NextResponse.json({ success: false, error: 'Yêu cầu đăng nhập' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu ID mẫu văn bản' }, { status: 400 });
    }

    // Kiểm tra quyền sở hữu mẫu
    const check = await query('SELECT user_email, is_personal FROM templates WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy mẫu văn bản' }, { status: 404 });
    }

    const target = check.rows[0];
    if (user.role !== 'admin' && target.user_email !== user.email) {
      return NextResponse.json({ success: false, error: 'Bạn chỉ có quyền xóa mẫu văn bản cá nhân của mình' }, { status: 403 });
    }

    await query('DELETE FROM templates WHERE id = $1', [id]);
    return NextResponse.json({ success: true, message: 'Đã xóa mẫu văn bản thành công' });
  } catch (error: unknown) {
    console.error('Error deleting template:', error);
    return NextResponse.json({ success: false, error: 'Lỗi khi xóa mẫu văn bản' }, { status: 500 });
  }
}
