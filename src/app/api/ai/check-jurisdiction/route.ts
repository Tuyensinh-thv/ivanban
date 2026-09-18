import { NextResponse } from 'next/server';
import { callLlmUnified } from '@/lib/llmGateway';
import { runRuleBasedJurisdiction } from '@/lib/ruleBasedAudit';
import { enforceGuestOrUserQuota, attachGuestCookie } from '@/lib/guestGuard';

const SYSTEM_PROMPT = `
Bạn là Trọng tài Pháp chế hàng đầu về Luật Tổ chức chính quyền địa phương (năm 2015, sửa đổi 2019), Luật Ban hành văn bản quy phạm pháp luật (năm 2015, sửa đổi 2020) và Nghị định 30/2020/NĐ-CP.
Thẩm định THẨM QUYỀN BAN HÀNH & KÝ VĂN BẢN theo cấp hành chính (xa_phuong, huyen_thanhpho, tinh_so).
`;

const MAX_TEXT_LENGTH = 50000;

export async function POST(req: Request) {
  try {
    // Kiểm soát hạn mức: Cán bộ đăng nhập dùng toàn quyền, khách vãng lai bị giới hạn
    const quota = await enforceGuestOrUserQuota();
    if (!quota.allowed) {
      const blockedResp = NextResponse.json(
        { error: quota.error, isGuestLimitReached: true, maxDocs: quota.maxDocs },
        { status: 403 }
      );
      return attachGuestCookie(blockedResp, quota.guestToken);
    }

    const { documentText, administrativeLevel = 'xa_phuong' } = await req.json();

    if (!documentText || typeof documentText !== 'string' || !documentText.trim()) {
      return NextResponse.json({ error: 'Thiếu nội dung văn bản để kiểm tra thẩm quyền' }, { status: 400 });
    }

    if (documentText.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `Văn bản quá dài (Tối đa ${MAX_TEXT_LENGTH} ký tự)` },
        { status: 400 }
      );
    }

    const safeLevel = ['xa_phuong', 'huyen_thanhpho', 'tinh_so'].includes(administrativeLevel)
      ? administrativeLevel
      : 'xa_phuong';

    try {
      const prompt = `
Hãy thẩm định THẨM QUYỀN BAN HÀNH & KÝ VĂN BẢN của cấp chính quyền: "${safeLevel}" đối với văn bản sau:
=== VĂN BẢN ===
${documentText}

CÁC NGUYÊN TẮC BẮT BUỘC:
1. Thẩm quyền về hình thức văn bản:
- Cấp Xã KHÔNG ĐƯỢC ban hành: "Nghị quyết" (trừ HĐND xã), KHÔNG ĐƯỢC ban hành "Quyết định quy phạm pháp luật", KHÔNG ĐƯỢC ban hành "Chỉ thị".
- Cấp Xã ĐƯỢC ban hành: Quyết định cá biệt, Công văn, Tờ trình, Báo cáo, Kế hoạch, Thông báo, Biên bản, Giấy mời...
2. Thẩm quyền về người ký (Điều 13 Nghị định 30/2020/NĐ-CP):
- Ký trực tiếp: CHỦ TỊCH hoặc cấp trưởng.
- Ký thay (KT.): Chỉ cấp phó mới được ký thay trong lĩnh vực phụ trách.
- Ký thừa lệnh (TL.): Cấp xã không có chế định Ký thừa lệnh (TL.).
- Ký thừa ủy quyền (TUQ.): Phải có văn bản ủy quyền trước.

Trả về DUY NHẤT chuỗi JSON hợp lệ theo cấu trúc:
{
  "administrativeLevel": "${safeLevel}",
  "isCompetent": true,
  "riskLevel": "safe",
  "formAuthority": {
    "isValid": true,
    "rule": "Quy định áp dụng",
    "details": "Chi tiết đánh giá hình thức"
  },
  "signerAuthority": {
    "isValid": true,
    "rule": "Quy định áp dụng",
    "signerPrefix": "CHỦ TỊCH",
    "details": "Chi tiết đánh giá thẩm quyền ký"
  },
  "legalReferences": ["Căn cứ luật..."],
  "recommendations": ["Khuyến nghị cho cán bộ..."]
}
`;

      const llmResult = await callLlmUnified({
        messages: [{ role: 'user', content: prompt }],
        systemInstruction: SYSTEM_PROMPT,
        responseFormatJson: true,
      });

      const parsed = JSON.parse(llmResult.text);
      return attachGuestCookie(NextResponse.json(parsed), quota.guestToken);
    } catch (aiErr) {
      console.warn('AI unavailable for jurisdiction check, using rule-based engine:', aiErr);
      const fallbackResult = runRuleBasedJurisdiction(documentText, safeLevel as any);
      return attachGuestCookie(NextResponse.json(fallbackResult), quota.guestToken);
    }
  } catch (error: any) {
    console.error('Jurisdiction error:', error);
    return NextResponse.json({ error: 'Lỗi kiểm tra thẩm quyền' }, { status: 500 });
  }
}
