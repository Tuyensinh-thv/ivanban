import { NextResponse } from 'next/server';
import { callLlmUnified } from '@/lib/llmGateway';
import { runRuleBasedAudit } from '@/lib/ruleBasedAudit';
import { enforceGuestOrUserQuota, attachGuestCookie } from '@/lib/guestGuard';
import { logActivity } from '@/lib/activityLogger';
import { recordApiCall } from '@/lib/apiUsageTracker';
import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/db';

async function harvestLegalCitations(documentText: string): Promise<void> {
  try {
    const citationPatterns = [
      /Căn cứ\s+(Luật[^;.]+)/gi,
      /Căn cứ\s+(Nghị \u0111ịnh[^;.]+)/gi,
      /Căn cứ\s+(Thông tư[^;.]+)/gi,
      /Căn cứ\s+(Quyết \u0111ịnh[^;.]+)/gi,
      /Căn cứ\s+(Nghị quyết[^;.]+)/gi,
      /Căn cứ\s+(Chỉ thị[^;.]+)/gi,
    ];

    const citations = new Set<string>();
    for (const pattern of citationPatterns) {
      const matches = documentText.matchAll(pattern);
      for (const match of matches) {
        const citation = match[1].trim().replace(/[;.,]+$/, '');
        if (citation.length > 10 && citation.length < 500) {
          citations.add(citation);
        }
      }
    }

    for (const citation of citations) {
      const existing = await query(
        'SELECT id FROM legal_bases WHERE title ILIKE $1 LIMIT 1',
        [`%${citation.substring(0, 80)}%`]
      );
      if (existing.rows.length === 0) {
        await query(
          `INSERT INTO legal_bases (title, status, source_type, source_doc_name)
           VALUES ($1, 'pending', 'harvested_from_doc', 'uploaded_document')
           ON CONFLICT DO NOTHING`,
          [citation]
        );
      }
    }
  } catch (err) {
    console.error('[Harvest] Failed to harvest citations:', err);
  }
}

const SYSTEM_PROMPT = `
Bạn là "Trưởng ban Thẩm định Văn bản & Pháp chế Chuyển đổi số" thuộc Trường Đại học Hùng Vương (Phú Thọ).
Kiểm tra, phát hiện lỗi và tạo 2 PHIÊN BẢN HIỆU ĐÍNH chuẩn 100% Nghị định số 30/2020/NĐ-CP:
1. "Bản Chuẩn hóa" (Standard Version): Sửa triệt để lỗi chính tả, câu từ, thể thức NĐ 30, giữ nguyên ý.
2. "Bản Tối ưu" (Optimized Version): Nâng cấp văn phong hành chính công vụ sắc sảo, chặt chẽ, trang trọng.
3. Thẩm định trích dẫn pháp lý: Đánh giá còn hiệu lực hay đã hết hiệu lực, thay thế bởi luật nào.
`;

const MAX_DOCUMENT_LENGTH = 100000; // 100KB of text max

export async function POST(req: Request) {
  try {
    // Kiểm soát hạn mức: Người dùng đăng nhập được dùng toàn quyền, khách vãng lai bị giới hạn
    const quota = await enforceGuestOrUserQuota();
    if (!quota.allowed) {
      const blockedResp = NextResponse.json(
        { error: quota.error, isGuestLimitReached: true, maxDocs: quota.maxDocs },
        { status: 403 }
      );
      return attachGuestCookie(blockedResp, quota.guestToken);
    }

    const body = await req.json();
    const { documentText, referenceText } = body;

    if (!documentText || typeof documentText !== 'string' || !documentText.trim()) {
      return NextResponse.json({ error: 'Thiếu nội dung văn bản cần rà soát' }, { status: 400 });
    }

    if (documentText.length > MAX_DOCUMENT_LENGTH) {
      return NextResponse.json(
        { error: `Nội dung văn bản quá dài (Tối đa ${MAX_DOCUMENT_LENGTH} ký tự)` },
        { status: 400 }
      );
    }

    const sanitizedRefText = typeof referenceText === 'string' ? referenceText.slice(0, 50000) : '';

    try {
      const prompt = `
Rà soát toàn diện văn bản sau theo Nghị định 30/2020/NĐ-CP:
=== VĂN BẢN ĐẦU VÀO ===
${documentText}

${sanitizedRefText ? `=== TÀI LIỆU THAM CHIẾU ===\n${sanitizedRefText}` : ''}

Trả về DUY NHẤT một chuỗi JSON hợp lệ theo cấu trúc:
{
  "summary": {
    "totalIssues": 3,
    "theThucIssues": 1,
    "chinhTaIssues": 1,
    "phapLyIssues": 1,
    "vanPhongIssues": 0,
    "overallScore": 75,
    "conclusion": "Nhận xét tổng quan..."
  },
  "errors": [
    {
      "type": "the_thuc",
      "severity": "error",
      "location": "Vị trí lỗi",
      "originalText": "Đoạn có lỗi",
      "suggestedText": "Đoạn sửa đúng chuẩn",
      "explanation": "Căn cứ điều khoản Nghị định 30"
    }
  ],
  "citations": [
    {
      "citation": "Tên văn bản luật được viện dẫn",
      "status": "valid",
      "note": "Ghi chú hiệu lực"
    }
  ],
  "standard": {
    "co_quan_chu_quan": "UBND TỈNH PHÚ THỌ",
    "co_quan_ban_hanh": "...",
    "so_ky_hieu": "...",
    "dia_danh_ngay_thang": "...",
    "ten_loai_van_ban": "...",
    "trich_yeu": "...",
    "kinh_gui": "...",
    "can_cu": ["Căn cứ..."],
    "noi_dung": [
      {
        "loai": "dieu",
        "tieu_de": "Điều 1.",
        "noi_dung": "...",
        "is_edited": false
      }
    ],
    "noi_nhan": ["..."],
    "chuc_danh_nguoi_ky": "...",
    "ten_nguoi_ky": "..."
  },
  "optimized": {
    "co_quan_chu_quan": "UBND TỈNH PHÚ THỌ",
    "co_quan_ban_hanh": "...",
    "so_ky_hieu": "...",
    "dia_danh_ngay_thang": "...",
    "ten_loai_van_ban": "...",
    "trich_yeu": "...",
    "kinh_gui": "...",
    "can_cu": ["Căn cứ..."],
    "noi_dung": [
      {
        "loai": "dieu",
        "tieu_de": "Điều 1.",
        "noi_dung": "...",
        "is_edited": true
      }
    ],
    "noi_nhan": ["..."],
    "chuc_danh_nguoi_ky": "...",
    "ten_nguoi_ky": "..."
  }
}
`;

      const llmResult = await callLlmUnified({
        messages: [{ role: 'user', content: prompt }],
        systemInstruction: SYSTEM_PROMPT,
        responseFormatJson: true,
      });

      const parsed = JSON.parse(llmResult.text);

      const currentUser = await getCurrentUser().catch(() => null);
      await logActivity({
        userEmail: currentUser?.email,
        userName: currentUser?.full_name,
        actionType: 'document_audit',
        description: `Soát lỗi văn bản (${documentText.length} ký tự)`,
        metadata: { score: parsed?.summary?.overallScore, totalIssues: parsed?.summary?.totalIssues },
      });

      harvestLegalCitations(documentText);

      return attachGuestCookie(NextResponse.json(parsed), quota.guestToken);
    } catch (aiErr) {
      console.warn('AI unavailable for audit, serving rule-based engine result:', aiErr);
      const fallbackResult = runRuleBasedAudit(documentText, sanitizedRefText);

      harvestLegalCitations(documentText);

      return attachGuestCookie(NextResponse.json(fallbackResult), quota.guestToken);
    }
  } catch (error: any) {
    console.error('Audit route error:', error);
    return NextResponse.json({ error: 'Lỗi khi rà soát văn bản' }, { status: 500 });
  }
}
