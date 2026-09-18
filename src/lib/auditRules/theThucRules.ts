import { AuditRule } from './ruleTypes';
import { DocumentErrorItem } from '../../types/nd30';

export const theThucRules: AuditRule[] = [
  // 1. Trích yếu Quyết định viết tắt V/v
  {
    id: 'tt_quyet_dinh_vv',
    name: 'Trích yếu Quyết định viết tắt V/v',
    category: 'the_thuc',
    severity: 'error',
    description: 'Quyết định không được viết tắt V/v ở phần trích yếu nội dung',
    nd30Reference: 'Phụ lục I Nghị định số 30/2020/NĐ-CP',
    check: (text: string) => {
      const regex = /QUYẾT\s+ĐỊNH[\s\S]{0,150}(?:V\/v|V\/V)\s+([^\n\r]+)/i;
      const match = text.match(regex);
      if (match) {
        return [
          {
            type: 'the_thuc',
            severity: 'error',
            location: 'Trích yếu Quyết định',
            originalText: match[0].split('\n').pop() || match[0],
            suggestedText: `Về việc ${match[1].trim()}`,
            explanation: 'Theo Phụ lục I Nghị định 30/2020/NĐ-CP, trích yếu của Quyết định phải ghi trực tiếp hoặc bắt đầu bằng cụm từ "Về việc...", tuyệt đối không viết tắt thành "V/v".',
          },
        ];
      }
      return null;
    },
  },

  // 2. Dấu ngoặc đơn chú thích mục đích gửi trong Nơi nhận
  {
    id: 'tt_noi_nhan_ngoac_don',
    name: 'Nơi nhận chứa ghi chú trong ngoặc đơn',
    category: 'the_thuc',
    severity: 'error',
    description: 'Không dùng dấu ngoặc đơn (...) trong phần Nơi nhận để giải thích mục đích',
    nd30Reference: 'Khoản 1 Điều 12 & Phụ lục I Nghị định số 30/2020/NĐ-CP',
    check: (text: string) => {
      const errors: DocumentErrorItem[] = [];
      const regex = /[-*•]?\s*([^\n\r]+?\((?:để\s+b\/c|để\s+biết|b\/c|để\s+p\/h|để\s+phối\s+hợp|báo\s+cáo|thực\s+hiện)\)[^\n\r]*)/gi;
      let match;
      while ((match = regex.exec(text)) !== null) {
        const line = match[1].trim();
        const cleaned = line.replace(/\s*\([^)]+\)/g, ';');
        errors.push({
          type: 'the_thuc',
          severity: 'error',
          location: 'Nơi nhận',
          originalText: line,
          suggestedText: cleaned.endsWith(';') ? cleaned : cleaned + ';',
          explanation: 'Nghị định 30/2020/NĐ-CP quy định: Mục Nơi nhận chỉ ghi tên cơ quan, đơn vị, cá nhân nhận văn bản kèm dấu chấm phẩy (;), tuyệt đối không dùng ngoặc đơn (...) để ghi chú mục đích gửi như (để b/c), (để biết).',
        });
      }
      return errors.length > 0 ? errors : null;
    },
  },

  // 3. Tiêu ngữ "Độc lập - Tự do - Hạnh phúc" sai định dạng
  {
    id: 'tt_tieu_ngu_sai',
    name: 'Định dạng Tiêu ngữ chưa chuẩn',
    category: 'the_thuc',
    severity: 'warning',
    description: 'Tiêu ngữ phải viết hoa chữ cái đầu các từ, giữa các từ có gạch nối và dấu cách',
    nd30Reference: 'Điều 10 & Phụ lục I Nghị định số 30/2020/NĐ-CP',
    check: (text: string) => {
      const match = text.match(/(Độc\s*lập[\s\-_–—]+Tự\s*do[\s\-_–—]+Hạnh\s*phúc)/i);
      if (match && match[0] !== 'Độc lập - Tự do - Hạnh phúc') {
        return [
          {
            type: 'the_thuc',
            severity: 'warning',
            location: 'Tiêu ngữ',
            originalText: match[0],
            suggestedText: 'Độc lập - Tự do - Hạnh phúc',
            explanation: 'Tiêu ngữ chuẩn theo Nghị định 30: "Độc lập - Tự do - Hạnh phúc" (chữ cái đầu mỗi từ viết hoa, giữa các cụm từ nối bằng gạch nối có dấu cách 2 bên).',
          },
        ];
      }
      return null;
    },
  },

  // 4. Quốc hiệu không viết hoa toàn bộ
  {
    id: 'tt_quoc_hieu_chua_hoa',
    name: 'Quốc hiệu chưa in hoa toàn bộ',
    category: 'the_thuc',
    severity: 'error',
    description: 'Quốc hiệu phải viết IN HOA toàn bộ',
    nd30Reference: 'Phụ lục I Nghị định 30/2020/NĐ-CP',
    check: (text: string) => {
      const match = text.match(/Cộng\s+hòa\s+xã\s+hội\s+chủ\s+nghĩa\s+Việt\s+Nam/);
      if (match) {
        return [
          {
            type: 'the_thuc',
            severity: 'error',
            location: 'Quốc hiệu',
            originalText: match[0],
            suggestedText: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM',
            explanation: 'Quốc hiệu bắt buộc phải viết in hoa toàn bộ, cỡ chữ 12-13, đứng, đậm.',
          },
        ];
      }
      return null;
    },
  },

  // 5. Khoảng trắng số ký hiệu sai cách (Số: 45 /QĐ hoặc Số: 45/ QĐ)
  {
    id: 'tt_so_ky_hieu_khoang_trang',
    name: 'Số và ký hiệu văn bản thừa khoảng trắng',
    category: 'the_thuc',
    severity: 'warning',
    description: 'Sau dấu gạch chéo trong số ký hiệu không có khoảng trắng',
    nd30Reference: 'Điều 10 Nghị định số 30/2020/NĐ-CP',
    check: (text: string) => {
      const match = text.match(/Số\s*:\s*(\d+)\s*\/\s*([A-Za-z0-9_Đ\-]+)/i);
      if (match && (text.includes(`${match[1]} /`) || text.includes(`/ `))) {
        return [
          {
            type: 'the_thuc',
            severity: 'warning',
            location: 'Số và ký hiệu văn bản',
            originalText: match[0],
            suggestedText: `Số: ${match[1]}/${match[2].trim()}`,
            explanation: 'Giữa số thứ tự, dấu gạch chéo và chữ viết tắt cơ quan/loại văn bản không được chèn dấu cách thừa.',
          },
        ];
      }
      return null;
    },
  },

  // 6. Định dạng Ngày tháng: Ngày dưới 10 và Tháng 1, 2 thiếu số 0
  {
    id: 'tt_dia_danh_ngay_thang_so_0',
    name: 'Ngày tháng ban hành thiếu số 0 phía trước',
    category: 'the_thuc',
    severity: 'warning',
    description: 'Ngày dưới 10 và tháng 1, 2 phải ghi kèm số 0 phía trước',
    nd30Reference: 'Phụ lục I Mục II Nghị định số 30/2020/NĐ-CP',
    check: (text: string) => {
      const regex = /(ngày\s+([1-9])\s+tháng\s+([1-9]|1[0-2])\s+năm\s+(\d{4}))/i;
      const match = text.match(regex);
      if (match) {
        const day = parseInt(match[2], 10);
        const month = parseInt(match[3], 10);
        let needsCorrection = false;
        let correctedDay = match[2];
        let correctedMonth = match[3];

        if (day < 10 && !match[1].includes(`ngày 0${day}`)) {
          correctedDay = `0${day}`;
          needsCorrection = true;
        }
        if ((month === 1 || month === 2) && !match[1].includes(`tháng 0${month}`)) {
          correctedMonth = `0${month}`;
          needsCorrection = true;
        }

        if (needsCorrection) {
          return [
            {
              type: 'the_thuc',
              severity: 'warning',
              location: 'Địa danh và thời gian ban hành',
              originalText: match[0],
              suggestedText: `ngày ${correctedDay} tháng ${correctedMonth} năm ${match[4]}`,
              explanation: 'Theo Nghị định 30/2020/NĐ-CP, đối với những ngày dưới 10 và tháng 1, tháng 2 phải ghi thêm số 0 ở trước (ví dụ: ngày 05 tháng 02 năm 2026).',
            },
          ];
        }
      }
      return null;
    },
  },

  // 7. Địa danh tỉnh/thành phố viết thường không đúng
  {
    id: 'tt_dia_danh_viet_hoa',
    name: 'Địa danh hành chính chưa viết hoa đúng',
    category: 'the_thuc',
    severity: 'warning',
    description: 'Địa danh ban hành văn bản phải viết hoa chữ cái đầu các âm tiết',
    nd30Reference: 'Phụ lục I Nghị định số 30/2020/NĐ-CP',
    check: (text: string) => {
      const match = text.match(/(phú\s+thọ|hà\s+nội|việt\s+trì|vĩnh\s+phúc|hải\s+phòng)[\s,]+ngày/i);
      if (match && match[1] === match[1].toLowerCase()) {
        const proper = match[1].split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        return [
          {
            type: 'the_thuc',
            severity: 'warning',
            location: 'Địa danh ban hành',
            originalText: match[1],
            suggestedText: proper,
            explanation: 'Tên địa danh phải viết hoa chữ cái đầu của tất cả các âm tiết tạo thành tên riêng địa danh.',
          },
        ];
      }
      return null;
    },
  },

  // 8. Ký hiệu ký thay, ký thừa lệnh viết sai (K.T, T.L thay vì KT., TL.)
  {
    id: 'tt_ky_thay_thua_lenh_format',
    name: 'Ký hiệu KT., TL., TM., TUQ. sai quy chuẩn',
    category: 'the_thuc',
    severity: 'error',
    description: 'Ký hiệu viết tắt thẩm quyền ký phải dùng KT., TL., TM., TUQ. có dấu chấm chuẩn',
    nd30Reference: 'Điều 13 Nghị định 30/2020/NĐ-CP',
    check: (text: string) => {
      const match = text.match(/\b(K\.T\.|T\.L\.|T\.M\.|K\.T|T\.L|T\.M)\b/);
      if (match) {
        const proper = match[0].replace(/\./g, '') + '.';
        return [
          {
            type: 'the_thuc',
            severity: 'error',
            location: 'Quyền hạn, chức vụ người ký',
            originalText: match[0],
            suggestedText: proper,
            explanation: 'Viết tắt quyền hạn ký văn bản hành chính theo Điều 13 Nghị định 30: "TM." (Thay mặt), "KT." (Ký thay), "TL." (Thừa lệnh), "TUQ." (Thừa ủy quyền). Không viết K.T. hoặc K.T.',
          },
        ];
      }
      return null;
    },
  },

  // 9. Dấu chấm kết thúc các căn cứ pháp lý
  {
    id: 'tt_can_cu_dau_cau',
    name: 'Căn cứ ban hành sai dấu ngắt câu',
    category: 'the_thuc',
    severity: 'warning',
    description: 'Các căn cứ phải kết thúc bằng dấu chấm phẩy (;), căn cứ cuối cùng kết thúc bằng dấu chấm (.)',
    nd30Reference: 'Phụ lục I Mục V Nghị định 30/2020/NĐ-CP',
    check: (text: string) => {
      const errors: DocumentErrorItem[] = [];
      const lines = text.split('\n');
      const canCuLines = lines.filter(l => /^\s*Căn cứ\s+/i.test(l));

      canCuLines.forEach((line, idx) => {
        const trimmed = line.trim();
        const isLast = idx === canCuLines.length - 1;
        if (!isLast && !trimmed.endsWith(';')) {
          errors.push({
            type: 'the_thuc',
            severity: 'warning',
            location: 'Căn cứ ban hành',
            originalText: trimmed,
            suggestedText: trimmed.replace(/[,.]$/, '') + ';',
            explanation: 'Mỗi căn cứ ban hành (trừ căn cứ cuối cùng) phải kết thúc bằng dấu chấm phẩy (;).',
          });
        } else if (isLast && !trimmed.endsWith('.')) {
          errors.push({
            type: 'the_thuc',
            severity: 'warning',
            location: 'Căn cứ ban hành cuối cùng',
            originalText: trimmed,
            suggestedText: trimmed.replace(/[,;]$/, '') + '.',
            explanation: 'Căn cứ ban hành cuối cùng phải kết thúc bằng dấu chấm (.).',
          });
        }
      });

      return errors.length > 0 ? errors : null;
    },
  },

  // 10. Dấu kết thúc dòng Nơi nhận cuối cùng (Lưu: VT)
  {
    id: 'tt_noi_nhan_luu_vt',
    name: 'Dòng Lưu nơi nhận chưa đúng quy cách',
    category: 'the_thuc',
    severity: 'warning',
    description: 'Dòng cuối cùng của Nơi nhận ghi "Lưu: VT, [đơn vị soạn thảo]." kết thúc bằng dấu chấm',
    nd30Reference: 'Phụ lục I Mục VII Nghị định 30/2020/NĐ-CP',
    check: (text: string) => {
      const match = text.match(/[-*•]?\s*Lưu\s*:\s*VT([^\n\r]*)/i);
      if (match) {
        const line = match[0].trim();
        if (!line.endsWith('.')) {
          return [
            {
              type: 'the_thuc',
              severity: 'warning',
              location: 'Nơi nhận (phần lưu trữ)',
              originalText: line,
              suggestedText: line.replace(/[,;]$/, '') + '.',
              explanation: 'Dòng cuối cùng của mục Nơi nhận (Lưu văn thư) bắt buộc phải kết thúc bằng dấu chấm (.).',
            },
          ];
        }
      }
      return null;
    },
  },

  // 11. Chức danh người ký không viết hoa toàn bộ
  {
    id: 'tt_chuc_danh_nguoi_ky_viet_hoa',
    name: 'Chức vụ người ký chưa in hoa toàn bộ',
    category: 'the_thuc',
    severity: 'warning',
    description: 'Chức danh của người ký (CHỦ TỊCH, GIÁM ĐỐC, HIỆU TRƯỞNG...) phải viết IN HOA toàn bộ',
    nd30Reference: 'Điều 13 Nghị định 30/2020/NĐ-CP',
    check: (text: string) => {
      const match = text.match(/\n(Chủ tịch|Phó chủ tịch|Phó Chủ tịch|Giám đốc|Hiệu trưởng|Trưởng phòng)\s*\n/);
      if (match) {
        return [
          {
            type: 'the_thuc',
            severity: 'warning',
            location: 'Chức vụ người ký',
            originalText: match[1],
            suggestedText: match[1].toUpperCase(),
            explanation: 'Chức vụ/chức danh của người ký văn bản phải được trình bày bằng chữ in hoa toàn bộ (CHỦ TỊCH, PHÓ CHỦ TỊCH...).',
          },
        ];
      }
      return null;
    },
  },

  // 12. Tên người ký không viết hoa hoặc thiếu họ tên
  {
    id: 'tt_ten_nguoi_ky_dinh_dang',
    name: 'Họ tên người ký văn bản',
    category: 'the_thuc',
    severity: 'warning',
    description: 'Họ và tên người ký viết hoa chữ cái đầu các âm tiết, cỡ chữ 13-14, đậm',
    nd30Reference: 'Phụ lục I Mục VI Nghị định 30/2020/NĐ-CP',
    check: (text: string) => {
      // Check if signature section has lower case only
      const match = text.match(/\n([a-zà-ỹ\s]{3,30})\s*$/);
      if (match && match[1].trim() && match[1] === match[1].toLowerCase()) {
        const proper = match[1].trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        return [
          {
            type: 'the_thuc',
            severity: 'warning',
            location: 'Họ và tên người ký',
            originalText: match[1].trim(),
            suggestedText: proper,
            explanation: 'Họ và tên người ký phải được viết hoa chữ cái đầu các từ, in đậm, đứng.',
          },
        ];
      }
      return null;
    },
  },

  // 13. Sử dụng từ "kính gửi" sai vị trí hoặc sai chữ hoa trong Công văn
  {
    id: 'tt_kinh_gui_dinh_dang',
    name: 'Định dạng mục Kính gửi',
    category: 'the_thuc',
    severity: 'warning',
    description: 'Từ "Kính gửi:" viết hoa chữ K, sau dấu hai chấm là danh xưng cơ quan/cá nhân nhận',
    nd30Reference: 'Phụ lục I Mục IV Nghị định 30/2020/NĐ-CP',
    check: (text: string) => {
      const match = text.match(/(kính\s+gửi\s*:|Kính\s+Gửi\s*:)/);
      if (match) {
        return [
          {
            type: 'the_thuc',
            severity: 'warning',
            location: 'Địa chỉ nhận văn bản (Kính gửi)',
            originalText: match[0],
            suggestedText: 'Kính gửi:',
            explanation: 'Cụm từ "Kính gửi:" chỉ viết hoa chữ cái "K", chữ "gửi" viết thường, tiếp theo là dấu hai chấm (:).',
          },
        ];
      }
      return null;
    },
  },

  // 14. Ghi chú "(Ký và ghi rõ họ tên)" hay "(Ký, đóng dấu)" thừa trong văn bản chính thức
  {
    id: 'tt_ghi_chu_chu_ky_thua',
    name: 'Chứa placeholder chữ ký thừa',
    category: 'the_thuc',
    severity: 'suggestion',
    description: 'Văn bản hành chính chính thức không để dòng chữ chú thích "(Ký tên, đóng dấu)"',
    nd30Reference: 'Phụ lục I Nghị định 30/2020/NĐ-CP',
    check: (text: string) => {
      const match = text.match(/\((?:Ký\s+tên,\s+đóng\s+dấu|Ký\s+và\s+ghi\s+rõ\s+họ\s+tên|Ký,\s*đóng\s*dấu)\)/i);
      if (match) {
        return [
          {
            type: 'the_thuc',
            severity: 'suggestion',
            location: 'Khung chữ ký',
            originalText: match[0],
            suggestedText: '(Để trống khoảng cách 5-6 dòng cho chữ ký)',
            explanation: 'Trên văn bản phát hành chính thức, không cần ghi dòng chú thích "(Ký tên, đóng dấu)" mà để khoảng trống tương đương 5-6 dòng để người có thẩm quyền ký và đóng dấu.',
          },
        ];
      }
      return null;
    },
  },

  // 15. Dấu chấm câu trong trích yếu văn bản
  {
    id: 'tt_trich_yeu_dau_cham',
    name: 'Trích yếu nội dung văn bản kết thúc bằng dấu chấm',
    category: 'the_thuc',
    severity: 'warning',
    description: 'Trích yếu nội dung văn bản không được có dấu chấm (.) ở cuối',
    nd30Reference: 'Phụ lục I Mục III Nghị định 30/2020/NĐ-CP',
    check: (text: string) => {
      const match = text.match(/(?:Về việc|V\/v)\s+([^\n\r]+?\.)(?:\r?\n|$)/i);
      if (match && match[1].endsWith('.')) {
        return [
          {
            type: 'the_thuc',
            severity: 'warning',
            location: 'Trích yếu nội dung văn bản',
            originalText: match[1],
            suggestedText: match[1].slice(0, -1),
            explanation: 'Theo quy định thể thức NĐ 30/2020/NĐ-CP, trích yếu nội dung văn bản không đặt dấu chấm câu (.) ở cuối dòng.',
          },
        ];
      }
      return null;
    },
  },
];
