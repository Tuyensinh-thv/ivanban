import { AuditRule } from './ruleTypes';
import { DocumentErrorItem } from '../../types/nd30';

interface SpellingPattern {
  pattern: RegExp;
  correct: string;
  explanation: string;
  severity?: 'error' | 'warning' | 'suggestion';
}

const SPELLING_PATTERNS: SpellingPattern[] = [
  {
    pattern: /\bchước\b/gi,
    correct: 'trước',
    explanation: 'Lỗi chính tả phụ âm đầu: dùng "trước" (thời gian, thứ tự, phía trước) thay vì "chước".',
    severity: 'error',
  },
  {
    pattern: /\bsuất\s+sắc\b/gi,
    correct: 'xuất sắc',
    explanation: 'Lỗi chính tả: dùng "xuất sắc" (ưu tú, thành tích vượt trội), không dùng "suất sắc".',
    severity: 'error',
  },
  {
    pattern: /\bngày\s+kí\b/gi,
    correct: 'ngày ký',
    explanation: 'Quy chuẩn chính tả văn bản hành chính theo Nghị định 30/2020/NĐ-CP thống nhất dùng "ký" (y dài) thay vì "kí".',
    severity: 'warning',
  },
  {
    pattern: /\bqui\s+định\b/gi,
    correct: 'quy định',
    explanation: 'Quy chuẩn chính tả hành chính thống nhất viết "quy định" (y dài), không viết "qui định".',
    severity: 'warning',
  },
  {
    pattern: /\bbổ\s+xung\b/gi,
    correct: 'bổ sung',
    explanation: 'Lỗi chính tả: dùng "bổ sung" (thêm vào cho đầy đủ), không dùng "bổ xung".',
    severity: 'error',
  },
  {
    pattern: /\bsắp\s+sếp\b/gi,
    correct: 'sắp xếp',
    explanation: 'Lỗi chính tả: dùng "sắp xếp" (bố trí, trật tự), không dùng "sắp sếp".',
    severity: 'error',
  },
  {
    pattern: /\bsát\s+nhập\b/gi,
    correct: 'sáp nhập',
    explanation: 'Thuật ngữ hành chính chuẩn là "sáp nhập" (hợp nhất đơn vị), không dùng "sát nhập".',
    severity: 'error',
  },
  {
    pattern: /\bthăm\s+quan\b/gi,
    correct: 'tham quan',
    explanation: 'Từ chuẩn tiếng Việt là "tham quan" (đi xem để học hỏi), không dùng "thăm quan".',
    severity: 'warning',
  },
  {
    pattern: /\bvô\s+hình\s+chung\b/gi,
    correct: 'vô hình trung',
    explanation: 'Thành ngữ chuẩn là "vô hình trung" (nghĩa là ngẫu nhiên làm nên điều gì đó), không dùng "vô hình chung".',
    severity: 'error',
  },
  {
    pattern: /\bchuẩn\s+đoán\b/gi,
    correct: 'chẩn đoán',
    explanation: 'Từ ngữ chuẩn là "chẩn đoán" (xác định tình trạng), không dùng "chuẩn đoán".',
    severity: 'error',
  },
  {
    pattern: /\bsơ\s+xuất\b/gi,
    correct: 'sơ suất',
    explanation: 'Lỗi chính tả: dùng "sơ suất" (bất cẩn, thiếu sót), không dùng "sơ xuất".',
    severity: 'error',
  },
  {
    pattern: /\bnăng\s+xuất\b/gi,
    correct: 'năng suất',
    explanation: 'Lỗi chính tả: dùng "năng suất" (hiệu quả lao động), không dùng "năng xuất".',
    severity: 'error',
  },
  {
    pattern: /\bchiển\s+khai\b/gi,
    correct: 'triển khai',
    explanation: 'Lỗi phụ âm đầu: dùng "triển khai" (thực hiện kế hoạch), không dùng "chiển khai".',
    severity: 'error',
  },
  {
    pattern: /\bchực\s+thuộc\b/gi,
    correct: 'trực thuộc',
    explanation: 'Lỗi phụ âm đầu: dùng "trực thuộc" (dưới quyền chỉ đạo trực tiếp), không dùng "chực thuộc".',
    severity: 'error',
  },
  {
    pattern: /\bchủ\s+chì\b/gi,
    correct: 'chủ trì',
    explanation: 'Lỗi chính tả: dùng "chủ trì" (chịu trách nhiệm chính trong cuộc họp/công việc), không dùng "chủ chì".',
    severity: 'error',
  },
  {
    pattern: /\bxử\s+lí\b/gi,
    correct: 'xử lý',
    explanation: 'Quy chuẩn chính tả văn bản hành chính thống nhất dùng "xử lý" (y dài).',
    severity: 'warning',
  },
  {
    pattern: /\bquản\s+lí\b/gi,
    correct: 'quản lý',
    explanation: 'Quy chuẩn chính tả văn bản hành chính thống nhất dùng "quản lý" (y dài).',
    severity: 'warning',
  },
  {
    pattern: /\btrao\s+dồi\b/gi,
    correct: 'trau dồi',
    explanation: 'Lỗi chính tả: dùng "trau dồi" (rèn luyện, nâng cao phẩm chất), không dùng "trao dồi".',
    severity: 'error',
  },
  {
    pattern: /\bbàng\s+quang\b/gi,
    correct: 'bàng quan',
    explanation: 'Từ ngữ chính xác là "bàng quan" (thờ ơ, đứng ngoài xem), "bàng quang" là cơ quan giải phẫu tiết niệu.',
    severity: 'error',
  },
  {
    pattern: /\bxuất\s+sứ\b/gi,
    correct: 'xuất xứ',
    explanation: 'Từ chuẩn là "xuất xứ" (nguồn gốc xuất phát), không dùng "xuất sứ".',
    severity: 'error',
  },
  {
    pattern: /\bgiành\s+cho\b/gi,
    correct: 'dành cho',
    explanation: 'Dùng "dành cho" (để lại cho ai), còn "giành" dùng trong "giành giật, giành quyền".',
    severity: 'error',
  },
  {
    pattern: /\bchính\s+xách\b/gi,
    correct: 'chính sách',
    explanation: 'Lỗi chính tả phụ âm đầu: dùng "chính sách" (chủ trương của Nhà nước), không dùng "chính xách".',
    severity: 'error',
  },
  {
    pattern: /\btập\s+trung\b/gi,
    correct: 'tập trung',
    explanation: 'Lỗi chính tả: từ chuẩn là "tập trung", tránh viết sai thành "tập chung".',
    severity: 'error',
  },
  {
    pattern: /\btập\s+chung\b/gi,
    correct: 'tập trung',
    explanation: 'Lỗi phụ âm đầu: dùng "tập trung" (dồn sức, tụ hội), không dùng "tập chung".',
    severity: 'error',
  },
];

export const chinhTaRules: AuditRule[] = SPELLING_PATTERNS.map((item, index) => ({
  id: `ct_pattern_${index + 1}`,
  name: `Chính tả: ${item.correct}`,
  category: 'chinh_ta',
  severity: item.severity || 'error',
  description: `Kiểm tra lỗi dùng sai từ "${item.correct}"`,
  nd30Reference: 'Quy chuẩn chính tả tiếng Việt & Nghị định số 30/2020/NĐ-CP',
  check: (text: string) => {
    const errors: DocumentErrorItem[] = [];
    let match;
    const regex = new RegExp(item.pattern.source, 'gi');
    while ((match = regex.exec(text)) !== null) {
      errors.push({
        type: 'chinh_ta',
        severity: item.severity || 'error',
        location: 'Nội dung văn bản',
        originalText: match[0],
        suggestedText: item.correct,
        explanation: item.explanation,
      });
    }
    return errors.length > 0 ? errors : null;
  },
}));
