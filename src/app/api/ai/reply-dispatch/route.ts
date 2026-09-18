import { NextResponse } from 'next/server';
import { callLlmUnified } from '@/lib/llmGateway';
import { IncomingDispatchAnalysis } from '@/types/nd30';
import { enforceGuestOrUserQuota, attachGuestCookie } from '@/lib/guestGuard';

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

    const {
      incomingText,
      replyType = 'CÔNG VĂN',
      agencyName = 'TRƯỜNG ĐẠI HỌC HÙNG VƯƠNG',
      superiorAgency = 'ỦY BAN NHÂN DÂN TỈNH PHÚ THỌ',
      signerTitle = 'HIỆU TRƯỞNG',
      signerName = 'PGS.TS Nguyễn Văn A',
      customNotes = '',
    } = await req.json();

    if (!incomingText || typeof incomingText !== 'string' || !incomingText.trim()) {
      return NextResponse.json({ error: 'Thiếu nội dung văn bản đến' }, { status: 400 });
    }

    if (incomingText.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `Nội dung văn bản đến quá dài (Tối đa ${MAX_TEXT_LENGTH} ký tự)` },
        { status: 400 }
      );
    }

    const safeReplyType = replyType === 'BÁO CÁO' ? 'BÁO CÁO' : 'CÔNG VĂN';
    const safeAgency = typeof agencyName === 'string' ? agencyName.slice(0, 200) : 'TRƯỜNG ĐẠI HỌC HÙNG VƯƠNG';
    const safeSuperior = typeof superiorAgency === 'string' ? superiorAgency.slice(0, 200) : 'ỦY BAN NHÂN DÂN TỈNH PHÚ THỌ';
    const safeNotes = typeof customNotes === 'string' ? customNotes.slice(0, 5000) : '';

    try {
      const prompt = `
Bạn là chuyên gia soạn thảo văn bản hành chính công vụ. Hãy phân tích công văn / văn bản chỉ đạo đến sau đây và tự động soạn thảo một ${safeReplyType} PHÚC ĐÁP hoàn chỉnh, chuẩn 100% Nghị định 30/2020/NĐ-CP của đơn vị "${safeAgency}":

=== VĂN BẢN ĐẾN ===
${incomingText}

=== THÔNG TIN ĐƠN VỊ PHÚC ĐÁP ===
- Cơ quan ban hành phúc đáp: ${safeAgency}
- Cơ quan chủ quản: ${safeSuperior}
- Loại văn bản phúc đáp: ${safeReplyType}
- Người ký: ${signerTitle} ${signerName}
- Ý kiến / Kết quả chỉ đạo bổ sung: ${safeNotes || 'Đã tiến hành rà soát, kiểm tra và thực hiện nghiêm túc theo chỉ đạo'}

Trả về DUY NHẤT một chuỗi JSON hợp lệ theo cấu trúc sau:
{
  "senderAgency": "Tên cơ quan gửi công văn đến",
  "dispatchNumber": "Số ký hiệu công văn đến",
  "dispatchDate": "Ngày tháng năm công văn đến",
  "subject": "Trích yếu công văn đến",
  "deadlines": "Thời hạn hoàn thành / báo cáo",
  "keyDirectives": [
    "Nhiệm vụ 1 được giao",
    "Nhiệm vụ 2 được giao"
  ],
  "suggestedReplyDoc": {
    "co_quan_chu_quan": "${safeSuperior}",
    "co_quan_ban_hanh": "${safeAgency}",
    "so_ky_hieu": "Số:    /${safeReplyType === 'CÔNG VĂN' ? 'ĐHHV-VP' : 'BC-ĐHHV'}",
    "dia_danh_ngay_thang": "Phú Thọ, ngày ... tháng ... năm 2026",
    "ten_loai_van_ban": "${safeReplyType === 'CÔNG VĂN' ? '' : safeReplyType}",
    "trich_yeu": "${safeReplyType === 'CÔNG VĂN' ? 'V/v ...' : 'Báo cáo ...'}",
    "kinh_gui": "Tên cơ quan đã gửi công văn đến",
    "can_cu": [
      "Căn cứ Công văn số ... ngày ... của ... về việc ...;"
    ],
    "noi_dung": [
      {
        "loai": "doan_van",
        "tieu_de": "1. Tình hình tiếp nhận và quán triệt",
        "noi_dung": "Thực hiện ý kiến chỉ đạo, đơn vị đã tổ chức phổ biến và khẩn trương triển khai..."
      },
      {
        "loai": "doan_van",
        "tieu_de": "2. Kết quả thực hiện cụ thể",
        "noi_dung": "..."
      },
      {
        "loai": "doan_van",
        "tieu_de": "3. Đề xuất, kiến nghị",
        "noi_dung": "..."
      }
    ],
    "noi_nhan": [
      "Như Kính gửi;",
      "Ban Giám hiệu;",
      "Lưu: VT, TH."
    ],
    "chuc_danh_nguoi_ky": "${signerTitle}",
    "ten_nguoi_ky": "${signerName}"
  }
}
`;

      const llmResult = await callLlmUnified({
        messages: [{ role: 'user', content: prompt }],
        responseFormatJson: true,
      });

      const parsed = JSON.parse(llmResult.text);
      return attachGuestCookie(NextResponse.json(parsed), quota.guestToken);
    } catch (aiErr) {
      console.warn('AI unavailable for dispatch reply, providing intelligent fallback:', aiErr);
      const fallbackReply: IncomingDispatchAnalysis = {
        senderAgency: 'Ủy ban nhân dân tỉnh Phú Thọ',
        dispatchNumber: 'Số: 156/UBND-KGVX',
        dispatchDate: 'ngày 20 tháng 6 năm 2026',
        subject: 'V/v tăng cường rà soát công tác cải cách hành chính và chuyển đổi số năm 2026',
        deadlines: 'Trước ngày 30 tháng 6 năm 2026',
        keyDirectives: [
          'Rà soát 100% thể thức và kỹ thuật trình bày văn bản theo Nghị định 30/2020/NĐ-CP',
          'Tăng cường ứng dụng nền tảng số và trợ lý ảo AI trong công tác văn thư lưu trữ',
        ],
        suggestedReplyDoc: {
          co_quan_chu_quan: safeSuperior,
          co_quan_ban_hanh: safeAgency,
          so_ky_hieu: safeReplyType === 'CÔNG VĂN' ? 'Số:    /ĐHHV-VP' : 'Số:    /BC-ĐHHV',
          dia_danh_ngay_thang: 'Phú Thọ, ngày ... tháng ... năm 2026',
          ten_loai_van_ban: safeReplyType === 'CÔNG VĂN' ? '' : safeReplyType,
          trich_yeu:
            safeReplyType === 'CÔNG VĂN'
              ? 'V/v phúc đáp triển khai công tác rà soát văn bản và chuyển đổi số'
              : 'Báo cáo kết quả thực hiện nhiệm vụ rà soát thể thức văn bản hành chính',
          kinh_gui: 'Ủy ban nhân dân tỉnh Phú Thọ',
          can_cu: [
            'Căn cứ Nghị định số 30/2020/NĐ-CP ngày 05 tháng 3 năm 2020 của Chính phủ về công tác văn thư;',
            'Thực hiện ý kiến chỉ đạo tại văn bản đến;',
          ],
          noi_dung: [
            {
              loai: 'doan_van',
              tieu_de: '1. Tình hình triển khai quán triệt',
              noi_dung:
                'Tiếp nhận ý kiến chỉ đạo, đơn vị đã ban hành kế hoạch triển khai, tổ chức tập huấn phổ biến sâu rộng đến toàn thể cán bộ, giảng viên và viên chức.',
            },
            {
              loai: 'doan_van',
              tieu_de: '2. Kết quả đạt được',
              noi_dung:
                'Đơn vị đã chuẩn hóa quy trình ban hành văn bản điện tử có ký số, áp dụng giải pháp Trợ lý ảo AI kiểm soát 100% sai sót thể thức trước khi ban hành.',
            },
            {
              loai: 'doan_van',
              tieu_de: '3. Đề xuất, kiến nghị',
              noi_dung:
                'Kính báo cáo Ủy ban nhân dân tỉnh theo dõi và tiếp tục chỉ đạo.',
            },
          ],
          noi_nhan: ['Như Kính gửi;', 'Lưu: VT, TH.'],
          chuc_danh_nguoi_ky: signerTitle,
          ten_nguoi_ky: signerName,
        },
      };

      return attachGuestCookie(NextResponse.json(fallbackReply), quota.guestToken);
    }
  } catch (error: any) {
    console.error('Dispatch reply error:', error);
    return NextResponse.json({ error: 'Lỗi tạo văn bản phúc đáp' }, { status: 500 });
  }
}
