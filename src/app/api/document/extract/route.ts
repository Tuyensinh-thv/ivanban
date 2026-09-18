import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';
import { callLlmVisionUnified } from '@/lib/llmGateway';

export const runtime = 'nodejs';
export const maxDuration = 60; // Allow enough time for multimodal OCR

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng chọn hoặc kéo thả tệp tin tải lên' },
        { status: 400 }
      );
    }

    const filename = file.name || 'document';
    const fileSizeMB = file.size / (1024 * 1024);

    if (fileSizeMB > 25) {
      return NextResponse.json(
        { success: false, error: 'Kích thước tệp vượt quá giới hạn 25MB' },
        { status: 400 }
      );
    }

    const mimeType = file.type || '';
    const ext = filename.split('.').pop()?.toLowerCase() || '';

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = '';
    let method = '';

    // Case 1: Plain Text (.txt, .md, .markdown, .rtf)
    if (
      ext === 'txt' ||
      ext === 'md' ||
      ext === 'markdown' ||
      mimeType === 'text/plain' ||
      mimeType === 'text/markdown'
    ) {
      extractedText = buffer.toString('utf-8');
      method = ext === 'md' || ext === 'markdown' ? 'markdown_text' : 'text_plain';
    }
    // Case 1.5: Rich Text Format (.rtf)
    else if (ext === 'rtf' || mimeType === 'application/rtf' || mimeType === 'text/rtf') {
      const rawRtf = buffer.toString('utf-8');
      // Simple RTF text strip: remove rtf control words
      extractedText = rawRtf
        .replace(/\\par[d]?/g, '\n')
        .replace(/\{\*?\\[^{}]+;?\}|\\'[0-9a-fA-F]{2}|\\[a-zA-Z]+-?\d* ?/g, '')
        .replace(/[{}]/g, '')
        .trim();
      method = 'rtf_text';
    }
    // Case 2: Microsoft Word (.docx)
    else if (
      ext === 'docx' ||
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value.trim();
      method = 'word_docx';

      if (!extractedText) {
        return NextResponse.json(
          { success: false, error: 'Không thể trích xuất nội dung từ tệp Word hoặc tệp rỗng' },
          { status: 400 }
        );
      }
    }
    // Case 3: PDF Document (.pdf) or Images (.jpg, .jpeg, .png, .webp) -> Gemini Multimodal OCR
    else if (
      ext === 'pdf' ||
      mimeType === 'application/pdf' ||
      ext === 'jpg' ||
      ext === 'jpeg' ||
      ext === 'png' ||
      ext === 'webp' ||
      mimeType.startsWith('image/')
    ) {
      method = ext === 'pdf' || mimeType === 'application/pdf' ? 'pdf_ai_ocr' : 'image_ai_ocr';

      let targetMimeType = mimeType;
      if (!targetMimeType || targetMimeType === 'application/octet-stream') {
        if (ext === 'pdf') targetMimeType = 'application/pdf';
        else if (ext === 'png') targetMimeType = 'image/png';
        else if (ext === 'webp') targetMimeType = 'image/webp';
        else targetMimeType = 'image/jpeg';
      }

      const base64Data = buffer.toString('base64');

      const ocrPrompt = `Bạn là chuyên gia số hóa và rà soát văn bản hành chính Việt Nam theo chuẩn Nghị định 30/2020/NĐ-CP.
Hãy đọc kỹ tài liệu này (ảnh chụp/bản scan hoặc PDF) và trích xuất TOÀN BỘ nội dung văn bản một cách chính xác và đầy đủ nhất:
1. Giữ nguyên tất cả các thành phần thể thức theo thứ tự: Quốc hiệu, Tiêu ngữ, Tên cơ quan ban hành, Số ký hiệu, Địa danh ngày tháng, Tên loại văn bản và Trích yếu nội dung.
2. Trích xuất toàn bộ các căn cứ pháp lý ("Căn cứ...").
3. Trích xuất toàn văn phần nội dung các Điều, Khoản, Điểm hoặc các mục trao đổi.
4. Trích xuất phần chức vụ, người ký và Nơi nhận.
5. Sửa các lỗi nhận diện ký tự quang học (OCR) nếu có, đảm bảo đúng chính tả Tiếng Việt.
CHỈ TRẢ VỀ TOÀN VĂN NỘI DUNG VĂN BẢN ĐÃ TRÍCH XUẤT. Không thêm bất kỳ lời dẫn, lời chào hay phần giải thích nào.`;

      const visionResult = await callLlmVisionUnified({
        prompt: ocrPrompt,
        imageBase64: base64Data,
        mimeType: targetMimeType,
      });

      extractedText = visionResult.text.trim();
    } else {
      return NextResponse.json(
        {
          success: false,
          error: `Định dạng tệp .${ext} chưa được hỗ trợ. Vui lòng tải lên tệp Word (.docx), PDF (.pdf), Ảnh (.jpg, .png), Markdown (.md, .txt) hoặc RTF (.rtf).`,
        },
        { status: 400 }
      );
    }

    const wordCount = extractedText.split(/\s+/).filter(Boolean).length;

    return NextResponse.json({
      success: true,
      text: extractedText,
      filename,
      fileType: ext,
      method,
      wordCount,
    });
  } catch (error: any) {
    console.error('Error extracting document:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Lỗi xử lý bóc tách tệp văn bản',
      },
      { status: 500 }
    );
  }
}
