import { NextResponse } from 'next/server';
import { callGeminiGenerate } from '@/lib/geminiClient';

const SYSTEM_PROMPT = `
Bạn là "Trợ lý Pháp chế & Thể thức Hành chính cao cấp" thuộc Trường Đại học Hùng Vương (Phú Thọ).
Kiến thức bắt buộc:
1. Thể thức văn bản hành chính chuẩn 100% Nghị định số 30/2020/NĐ-CP của Chính phủ.
2. Quy chuẩn phông chữ Times New Roman Unicode màu đen; Quốc hiệu, Tiêu ngữ, Nơi nhận (tuyệt đối không dùng dấu ngoặc đơn), Chữ ký, Số ký hiệu, Giãn dòng Exactly 16pt, Căn lề chuẩn A4.
3. Thẩm quyền ký duyệt theo Luật Tổ chức chính quyền địa phương và Điều 13 Nghị định 30.
Trả lời mạch lạc, chuẩn mực pháp lý, thân thiện với cán bộ công chức.
`;

const MAX_MESSAGES_HISTORY = 10;
const MAX_MESSAGE_LENGTH = 2000;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, context } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Danh sách tin nhắn không hợp lệ' }, { status: 400 });
    }

    // Giới hạn số lượng tin nhắn lịch sử và độ dài ký tự để chống DoS và prompt injection
    const recentMessages = messages.slice(-MAX_MESSAGES_HISTORY);

    const formattedContents = recentMessages.map((m: any) => {
      const role = m.role === 'assistant' || m.role === 'model' ? 'model' : 'user';
      const text = typeof m.content === 'string' ? m.content.slice(0, MAX_MESSAGE_LENGTH) : '';
      return {
        role,
        parts: [{ text }],
      };
    });

    const sanitizedContext = typeof context === 'string' ? context.slice(0, 10000) : '';

    try {
      const reply = await callGeminiGenerate({
        contents: formattedContents,
        systemInstruction: `${SYSTEM_PROMPT}\n${sanitizedContext ? `Ngữ cảnh văn bản người dùng đang xử lý:\n${sanitizedContext}` : ''}`,
      });

      return NextResponse.json({ reply });
    } catch (aiErr) {
      console.warn('AI unavailable for legal chat, providing standard knowledge response:', aiErr);
      return NextResponse.json({
        reply:
          'Hệ thống AI đang ở chế độ dự phòng. Quy chuẩn cốt lõi theo **Nghị định số 30/2020/NĐ-CP**:\n\n1. **Phông chữ:** Bắt buộc dùng **Times New Roman**, cỡ chữ thân bài 13-14pt; giãn dòng Exactly 16pt; giãn đoạn Before 6pt, After 6pt.\n2. **Mục Nơi nhận:** Tuyệt đối không dùng dấu ngoặc đơn (không dùng "(để b/c)", "(để biết)").\n3. **Căn lề trang A4:** Trên 2.0-2.5cm, Dưới 2.0-2.5cm, Trái 3.0-3.5cm, Phải 1.5-2.0cm.\n4. **Ký thừa lệnh (TL.):** Cấp xã/phường không có thẩm quyền ký thừa lệnh.',
      });
    }
  } catch (error: any) {
    console.error('Chat legal error:', error);
    return NextResponse.json({ error: 'Lỗi trao đổi với trợ lý pháp chế' }, { status: 500 });
  }
}
