import { NextResponse } from 'next/server';
import { callLlmUnified } from '@/lib/llmGateway';
import { ND30Document } from '@/types/nd30';
import { enforceGuestOrUserQuota, attachGuestCookie } from '@/lib/guestGuard';
import { logActivity } from '@/lib/activityLogger';
import { recordApiCall } from '@/lib/apiUsageTracker';
import { getCurrentUser } from '@/lib/auth';

const SYSTEM_PROMPT = `
Bạn là "Chuyên gia Soạn thảo Văn bản & Pháp chế Hành chính" trực thuộc Trường Đại học Hùng Vương (Phú Thọ).
Nhiệm vụ: Soạn thảo, chỉnh sửa hoặc bóc tách văn bản hành chính theo chuẩn 100% Nghị định số 30/2020/NĐ-CP của Chính phủ.
Quy tắc thể thức bắt buộc:
1. Quốc hiệu, Tiêu ngữ, Cơ quan ban hành, Số ký hiệu, Địa danh ngày tháng.
2. Nếu là QUYẾT ĐỊNH: Bắt buộc có các Căn cứ pháp lý kết thúc bằng dấu chấm phẩy (;), căn cứ cuối bằng dấu chấm (.). Có chữ "QUYẾT ĐỊNH:" và chia thành các Điều (Điều 1, Điều 2...).
3. Nếu là CÔNG VĂN: Không ghi tên loại văn bản (để trống), trích yếu mở đầu bằng "V/v ...", bắt buộc có "Kính gửi: ...".
4. Nếu là TỜ TRÌNH: Có "Kính gửi:", các mục Sự cần thiết, Mục tiêu & quy mô, Dự toán kinh phí, Kiến nghị.
5. Nếu là BÁO CÁO: Có "Kính gửi:", kết quả đạt được, tồn tại hạn chế, phương hướng nhiệm vụ.
6. Mục Nơi nhận: TUYỆT ĐỐI KHÔNG dùng dấu ngoặc đơn (...), ví dụ không ghi "(để b/c)", "(để biết)".
`;

export async function POST(req: Request) {
  try {
    const quota = await enforceGuestOrUserQuota();
    if (!quota.allowed) {
      const blockedResp = NextResponse.json(
        { error: quota.error, isGuestLimitReached: true, maxDocs: quota.maxDocs },
        { status: 403 }
      );
      return attachGuestCookie(blockedResp, quota.guestToken);
    }

    const body = await req.json();
    const { mode } = body;

    // 1. CHẾ ĐỘ CHAT RA LỆNH CHỈNH SỬA VĂN BẢN (CHAT-EDIT MODE)
    if (mode === 'chat_edit') {
      const { currentDocument, userInstruction } = body;
      if (!currentDocument || !userInstruction) {
        return NextResponse.json({ error: 'Thiếu văn bản hiện tại hoặc câu lệnh chỉnh sửa' }, { status: 400 });
      }

      const prompt = `
Dưới đây là văn bản hành chính hiện tại:
${JSON.stringify(currentDocument, null, 2)}

YÊU CẦU CHỈNH SỬA CỦA CÁN BỘ:
"${userInstruction}"

Hãy phân tích và thực hiện sửa đổi văn bản theo đúng yêu cầu, đồng thời đảm bảo 100% chuẩn thể thức Nghị định 30/2020/NĐ-CP.
Trả về DUY NHẤT một chuỗi JSON hợp lệ không có markdown bọc ngoài hoặc có thể trong khối json, theo cấu trúc:
{
  "message": "Lời giải thích ngắn gọn, trang trọng cho cán bộ về những gì vừa được chỉnh sửa.",
  "document": { ...toàn bộ đối tượng ND30Document sau khi đã cập nhật... }
}
`;

      try {
        const llmResult = await callLlmUnified({
          messages: [{ role: 'user', content: prompt }],
          systemInstruction: SYSTEM_PROMPT,
          responseFormatJson: true,
        });

        const cleaned = llmResult.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return NextResponse.json(parsed);
      } catch (err: any) {
        console.warn('AI chat edit error or busy:', err.message);
        return NextResponse.json({
          message: `Hệ thống đã tiếp nhận yêu cầu: "${userInstruction}". Do máy chủ AI phản hồi chậm, vui lòng thử lại hoặc chỉnh sửa trực tiếp trên bảng điều khiển.`,
          document: currentDocument,
        });
      }
    }

    // 2. CHẾ ĐỘ NHẬP TỪ FILE MARKDOWN / TEXT THÔ (PARSE-MARKDOWN MODE)
    if (mode === 'parse_markdown') {
      const { markdownText, docType } = body;
      if (!markdownText || typeof markdownText !== 'string') {
        return NextResponse.json({ error: 'Thiếu nội dung văn bản cần chuyển đổi' }, { status: 400 });
      }

      const prompt = `
Hãy phân tích nội dung Markdown / Text thô sau và chuyển đổi thành đối tượng văn bản chuẩn hóa ND30Document theo Nghị định 30/2020/NĐ-CP:

=== VĂN BẢN ĐẦU VÀO ===
${markdownText}

=== LOẠI VĂN BẢN DỰ KIẾN ===
${docType || 'Tự động nhận diện'}

Trả về DUY NHẤT một chuỗi JSON hợp lệ theo cấu trúc:
{
  "co_quan_chu_quan": "Tên cơ quan cấp trên",
  "co_quan_ban_hanh": "Tên cơ quan ban hành",
  "so_ky_hieu": "Số ký hiệu văn bản",
  "dia_danh_ngay_thang": "Địa danh, ngày ... tháng ... năm ...",
  "ten_loai_van_ban": "Tên loại (QUYẾT ĐỊNH, TỜ TRÌNH, BÁO CÁO... để trống nếu là CÔNG VĂN)",
  "trich_yeu": "Trích yếu nội dung",
  "kinh_gui": "Cơ quan/Cá nhân kính gửi",
  "can_cu": ["Căn cứ 1...", "Căn cứ 2..."],
  "noi_dung": [
    {
      "loai": "dieu" hoặc "doan_van",
      "tieu_de": "Điều 1." (nếu có),
      "noi_dung": "Nội dung chi tiết..."
    }
  ],
  "noi_nhan": ["Nơi nhận 1;", "Lưu: VT."],
  "chuc_danh_nguoi_ky": "CHỦ TỊCH / HIỆU TRƯỞNG...",
  "ten_nguoi_ky": "Họ và tên người ký"
}
`;

      try {
        const llmResult = await callLlmUnified({
          messages: [{ role: 'user', content: prompt }],
          systemInstruction: SYSTEM_PROMPT,
          responseFormatJson: true,
        });

        const cleaned = llmResult.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return NextResponse.json(parsed);
      } catch (err: any) {
        console.warn('AI parse markdown error:', err.message);
        // Fallback basic parse
        const lines = markdownText.split('\n').map(l => l.trim()).filter(Boolean);
        const fallbackDoc: ND30Document = {
          co_quan_ban_hanh: 'UBND PHƯỜNG NÔNG TRANG',
          so_ky_hieu: 'Số:    /QĐ-UBND',
          dia_danh_ngay_thang: 'Phú Thọ, ngày ... tháng ... năm 2026',
          ten_loai_van_ban: docType || 'QUYẾT ĐỊNH',
          trich_yeu: lines[0] || 'Văn bản chuyển đổi từ tệp tin',
          noi_dung: lines.slice(1).map((l, i) => ({
            loai: l.startsWith('Điều') ? 'dieu' : 'doan_van',
            tieu_de: l.startsWith('Điều') ? l.split(':')[0] : '',
            noi_dung: l.startsWith('Điều') ? l.substring(l.indexOf(':') + 1).trim() : l,
          })),
          noi_nhan: ['Như Điều 1;', 'Lưu: VT.'],
          chuc_danh_nguoi_ky: 'CHỦ TỊCH',
          ten_nguoi_ky: 'Nguyễn Văn A',
        };
        return NextResponse.json(fallbackDoc);
      }
    }

    // 3. CHẾ ĐỘ SOẠN THẢO TỰ ĐỘNG BAN ĐẦU (AI DRAFT FROM PARAMS)
    const {
      documentType,
      issuingAgency,
      superiorAgency,
      location,
      subject,
      directives,
      references,
      signerTitle,
      signerName,
      recipients,
    } = body;

    const prompt = `
Hãy soạn thảo một văn bản hành chính hoàn chỉnh, chuẩn xác 100% theo Nghị định 30/2020/NĐ-CP dành cho đơn vị thuộc tỉnh Phú Thọ với các thông tin sau:
- Loại văn bản: ${documentType || 'QUYẾT ĐỊNH'}
- Cơ quan chủ quản: ${superiorAgency || 'UBND TỈNH PHÚ THỌ'}
- Cơ quan ban hành: ${issuingAgency || 'UBND PHƯỜNG NÔNG TRANG'}
- Địa danh: ${location || 'Phú Thọ'}
- Trích yếu nội dung: ${subject || 'Soạn thảo văn bản'}
- Nội dung chỉ đạo/yêu cầu cụ thể: ${directives || 'Theo quy định hiện hành'}
- Tài liệu/căn cứ tham chiếu: ${references || 'Các văn bản quy phạm pháp luật liên quan'}
- Chức danh người ký: ${signerTitle || 'CHỦ TỊCH'}
- Họ và tên người ký: ${signerName || 'Nguyễn Văn A'}
- Nơi nhận: ${Array.isArray(recipients) ? recipients.join(', ') : recipients || ''}

Trả về DUY NHẤT một chuỗi JSON hợp lệ tuân thủ đúng cấu trúc ND30Document:
{
  "co_quan_chu_quan": "${superiorAgency || 'UBND TỈNH PHÚ THỌ'}",
  "co_quan_ban_hanh": "${issuingAgency || 'UBND PHƯỜNG NÔNG TRANG'}",
  "so_ky_hieu": "Số:    /${documentType === 'QUYẾT ĐỊNH' ? 'QĐ-UBND' : documentType === 'TỜ TRÌNH' ? 'TTr-UBND' : documentType === 'BÁO CÁO' ? 'BC-UBND' : 'UBND-VP'}",
  "dia_danh_ngay_thang": "${location || 'Phú Thọ'}, ngày ... tháng ... năm 2026",
  "ten_loai_van_ban": "${documentType === 'CÔNG VĂN' ? '' : (documentType || 'QUYẾT ĐỊNH')}",
  "trich_yeu": "${subject || 'Trích yếu nội dung văn bản'}",
  "kinh_gui": "${documentType === 'CÔNG VĂN' || documentType === 'TỜ TRÌNH' || documentType === 'BÁO CÁO' ? 'Ủy ban nhân dân thành phố Việt Trì' : ''}",
  "can_cu": [
    "Căn cứ Luật...",
    "Căn cứ Nghị định..."
  ],
  "noi_dung": [
    {
      "loai": "dieu" hoặc "doan_van",
      "tieu_de": "Điều 1.",
      "noi_dung": "Nội dung chi tiết..."
    }
  ],
  "noi_nhan": [
    "Như Điều ...;",
    "UBND tỉnh Phú Thọ;",
    "Lưu: VT."
  ],
  "chuc_danh_nguoi_ky": "${signerTitle || 'CHỦ TỊCH'}",
  "ten_nguoi_ky": "${signerName || 'Nguyễn Văn A'}"
}

LƯU Ý QUAN TRỌNG:
1. Nếu là CÔNG VĂN, "ten_loai_van_ban" phải để trống (""), "trich_yeu" bắt đầu bằng "V/v ...", phải có "kinh_gui".
2. Nếu là QUYẾT ĐỊNH, phải có căn cứ thẩm quyền và các Điều (Điều 1, Điều 2...).
3. Trong "noi_nhan", KHÔNG dùng dấu ngoặc đơn (...).
4. Các căn cứ pháp luật phải chính xác, trích dẫn ngày tháng năm ban hành đầy đủ.
`;

    try {
      const llmResult = await callLlmUnified({
        messages: [{ role: 'user', content: prompt }],
        systemInstruction: SYSTEM_PROMPT,
        responseFormatJson: true,
      });

      const cleaned = llmResult.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);

      const currentUser = await getCurrentUser().catch(() => null);
      await logActivity({
        userEmail: currentUser?.email,
        userName: currentUser?.full_name,
        actionType: 'draft_create',
        description: `Soạn thảo văn bản: ${documentType || 'UNKNOWN'} - ${subject || 'N/A'}`,
        metadata: { doc_type: documentType || 'UNKNOWN', subject },
      });

      return NextResponse.json(parsed);
    } catch (err: any) {
      console.warn('All AI models busy, generating fallback compliant draft:', err.message);
      const isCongVan = documentType === 'CÔNG VĂN';
      const fallbackDoc: ND30Document = {
        co_quan_chu_quan: superiorAgency || 'UBND TỈNH PHÚ THỌ',
        co_quan_ban_hanh: issuingAgency || 'UBND PHƯỜNG NÔNG TRANG',
        so_ky_hieu: `Số:    /${documentType === 'QUYẾT ĐỊNH' ? 'QĐ-UBND' : isCongVan ? 'UBND-VP' : 'TTr-UBND'}`,
        dia_danh_ngay_thang: `${location || 'Phú Thọ'}, ngày ... tháng ... năm 2026`,
        ten_loai_van_ban: isCongVan ? '' : (documentType || 'QUYẾT ĐỊNH'),
        trich_yeu: subject || 'Về việc triển khai nhiệm vụ công tác theo quy định',
        kinh_gui: isCongVan || documentType === 'TỜ TRÌNH' ? 'Ủy ban nhân dân thành phố Việt Trì' : undefined,
        can_cu: [
          'Căn cứ Luật Tổ chức chính quyền địa phương ngày 19 tháng 6 năm 2015; Luật sửa đổi, bổ sung một số điều của Luật Tổ chức Chính phủ và Luật Tổ chức chính quyền địa phương ngày 22 tháng 11 năm 2019;',
          'Căn cứ Nghị định số 30/2020/NĐ-CP ngày 05 tháng 3 năm 2020 của Chính phủ về công tác văn thư;',
          'Xét đề nghị của bộ phận chuyên môn.',
        ],
        noi_dung: [
          {
            loai: isCongVan ? 'doan_van' : 'dieu',
            tieu_de: isCongVan ? '' : 'Điều 1.',
            noi_dung: directives || 'Triển khai thực hiện nhiệm vụ công tác theo đúng kế hoạch và quy định hiện hành.',
          },
          {
            loai: isCongVan ? 'doan_van' : 'dieu',
            tieu_de: isCongVan ? '' : 'Điều 2.',
            noi_dung: isCongVan
              ? 'UBND phường Nông Trang trân trọng báo cáo và đề nghị cấp có thẩm quyền quan tâm hỗ trợ./.'
              : 'Quyết định này có hiệu lực thi hành kể từ ngày ký ban hành.',
          },
        ],
        noi_nhan: isCongVan ? ['Như kính gửi;', 'Lưu: VT, VP.'] : ['Như Điều 1;', 'UBND thành phố Việt Trì;', 'Lưu: VT.'],
        chuc_danh_nguoi_ky: signerTitle || 'CHỦ TỊCH',
        ten_nguoi_ky: signerName || 'Nguyễn Văn A',
      };
      return NextResponse.json(fallbackDoc);
    }
  } catch (error: any) {
    console.error('Error drafting document with AI:', error);
    return NextResponse.json({ error: error.message || 'Lỗi khi soạn thảo văn bản với AI' }, { status: 500 });
  }
}
