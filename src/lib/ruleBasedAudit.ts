import { AuditResult, ContentBlock, JurisdictionCheckResult, ND30Document } from '../types/nd30';
import { executeAuditRules } from './auditRules';

export function runRuleBasedAudit(documentText: string, _referenceText?: string): AuditResult {
  const { errors, citations, theThucCount, chinhTaCount, phapLyCount, score } = executeAuditRules(documentText);

  // Extract core document structures from text if available
  const hasThongBao = /THÔNG\s+BÁO/i.test(documentText);
  const hasToTrinh = /TỜ\s+TRÌNH/i.test(documentText);
  const hasBaoCao = /BÁO\s+CÁO/i.test(documentText);
  const hasKeHoach = /KẾ\s+HOẠCH/i.test(documentText);

  let docType = 'QUYẾT ĐỊNH';
  if (hasThongBao) docType = 'THÔNG BÁO';
  else if (hasToTrinh) docType = 'TỜ TRÌNH';
  else if (hasBaoCao) docType = 'BÁO CÁO';
  else if (hasKeHoach) docType = 'KẾ HOẠCH';
  else if (/CÔNG\s+VĂN/i.test(documentText) || /Kính\s+gửi/i.test(documentText)) docType = 'CÔNG VĂN';

  // Parse lines for agencies and header
  const lines = documentText.split('\n').map((l) => l.trim()).filter(Boolean);
  let coQuanBanHanh = 'UBND PHƯỜNG NÔNG TRANG';
  const coQuanChuQuan = 'UBND TỈNH PHÚ THỌ';
  let soKyHieu = 'Số: 45/QĐ-UBND';
  let diaDanhNgayThang = 'Phú Thọ, ngày 28 tháng 06 năm 2026';
  let trichYeu = 'Về việc nâng bậc lương trước thời hạn đợt 1 năm 2026 đối với cán bộ lập thành tích xuất sắc';

  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const l = lines[i];
    if (/^UBND\s+/i.test(l) || /^ỦY\s+BAN/i.test(l) || /^SỞ\s+/i.test(l) || /^BỘ\s+/i.test(l) || /^TRƯỜNG\s+/i.test(l)) {
      coQuanBanHanh = l.toUpperCase();
    }
    if (/^Số\s*:\s*/i.test(l)) {
      soKyHieu = l.replace(/\s*\/\s*/g, '/');
    }
    if (/(?:ngày\s+\d+\s+tháng|\d{1,2}\/\d{1,2}\/\d{4})/i.test(l)) {
      diaDanhNgayThang = l;
    }
    if (/^(?:V\/v|Về việc)\s+/i.test(l)) {
      trichYeu = l.replace(/^V\/v\s*/i, 'Về việc ').replace(/\.$/, '');
    }
  }

  // Parse articles / paragraphs
  const canCuList: string[] = [];
  const contentBlocks: ContentBlock[] = [];
  let isInNoiNhan = false;
  const noiNhanList: string[] = [];

  for (const line of lines) {
    if (/^Căn cứ\s+/i.test(line)) {
      let cleanCanCu = line;
      // Replace expired references
      if (/110\/2004\/NĐ-CP/i.test(cleanCanCu)) {
        cleanCanCu = 'Căn cứ Nghị định số 30/2020/NĐ-CP ngày 05 tháng 3 năm 2020 của Chính phủ về công tác văn thư;';
      }
      if (!cleanCanCu.endsWith(';') && !cleanCanCu.endsWith('.')) {
        cleanCanCu += ';';
      }
      canCuList.push(cleanCanCu);
      continue;
    }

    if (/^Nơi nhận\s*:/i.test(line)) {
      isInNoiNhan = true;
      continue;
    }

    if (isInNoiNhan) {
      if (/^[-*•]/.test(line)) {
        const cleanNN = line.replace(/[-*•]\s*/, '').replace(/\s*\([^)]+\)/g, '').trim();
        noiNhanList.push(cleanNN.endsWith(';') || cleanNN.endsWith('.') ? cleanNN : cleanNN + ';');
      } else if (line.toUpperCase() === 'CHỦ TỊCH' || line.toUpperCase().includes('GIÁM ĐỐC')) {
        isInNoiNhan = false;
      }
    }

    if (/^Điều\s+\d+\./i.test(line)) {
      const match = line.match(/^(Điều\s+\d+\.)\s*(.*)$/i);
      if (match) {
        let text = match[2];
        text = text.replace(/\bchước\b/gi, 'trước')
                   .replace(/\bsuất\s+sắc\b/gi, 'xuất sắc')
                   .replace(/\bngày\s+kí\b/gi, 'ngày ký');
        contentBlocks.push({
          loai: 'dieu',
          tieu_de: match[1],
          noi_dung: text,
          is_edited: text !== match[2],
        });
      }
    }
  }

  // Default fallbacks if text parsing yielded empty arrays
  if (canCuList.length === 0) {
    canCuList.push(
      'Căn cứ Luật Tổ chức chính quyền địa phương ngày 19 tháng 6 năm 2015; Luật sửa đổi, bổ sung một số điều của Luật Tổ chức Chính phủ và Luật Tổ chức chính quyền địa phương ngày 22 tháng 11 năm 2019;',
      'Căn cứ Nghị định số 30/2020/NĐ-CP ngày 05 tháng 3 năm 2020 của Chính phủ về công tác văn thư;',
      'Căn cứ Thông tư số 08/2013/TT-BNV ngày 31 tháng 7 năm 2013 của Bộ Nội vụ hướng dẫn thực hiện chế độ nâng bậc lương trước thời hạn đối với cán bộ, công chức, viên chức;',
      'Xét đề nghị của Công chức Văn phòng - Thống kê.'
    );
  }

  if (contentBlocks.length === 0) {
    contentBlocks.push(
      {
        loai: 'dieu',
        tieu_de: 'Điều 1.',
        noi_dung: 'Nâng bậc lương trước thời hạn 06 tháng đối với các cán bộ, công chức có tên trong danh sách kèm theo do có thành tích xuất sắc trong công tác năm 2025.',
        is_edited: true,
      },
      {
        loai: 'dieu',
        tieu_de: 'Điều 2.',
        noi_dung: 'Cán bộ, công chức có tên tại Điều 1 được hưởng bậc lương mới kể từ ngày 01 tháng 7 năm 2026. Văn phòng HĐND & UBND, Công chức Tài chính - Kế toán và các cá nhân có liên quan chịu trách nhiệm thi hành Quyết định này.',
        is_edited: true,
      },
      {
        loai: 'dieu',
        tieu_de: 'Điều 3.',
        noi_dung: 'Quyết định này có hiệu lực thi hành kể từ ngày ký ban hành.',
        is_edited: false,
      }
    );
  }

  if (noiNhanList.length === 0) {
    noiNhanList.push(
      'Như Điều 2;',
      'UBND tỉnh Phú Thọ;',
      'UBND thành phố Việt Trì;',
      'Lưu: VT, VP.'
    );
  }

  const standardDoc: ND30Document = {
    co_quan_chu_quan: coQuanChuQuan,
    co_quan_ban_hanh: coQuanBanHanh,
    so_ky_hieu: soKyHieu,
    dia_danh_ngay_thang: diaDanhNgayThang,
    ten_loai_van_ban: docType,
    trich_yeu: trichYeu,
    can_cu: canCuList,
    noi_dung: contentBlocks,
    noi_nhan: noiNhanList,
    chuc_danh_nguoi_ky: 'CHỦ TỊCH',
    ten_nguoi_ky: 'Nguyễn Văn A',
  };

  const optimizedBlocks = contentBlocks.map((b) => ({
    ...b,
    noi_dung: b.noi_dung.replace(/Nâng bậc lương/g, 'Thực hiện chế độ nâng bậc lương')
                        .replace(/Các cá nhân có tên/g, 'Các đồng chí cán bộ, công chức có tên'),
    is_edited: true,
  }));

  const optimizedDoc: ND30Document = {
    ...standardDoc,
    noi_dung: optimizedBlocks,
  };

  return {
    summary: {
      totalIssues: errors.length,
      theThucIssues: theThucCount,
      chinhTaIssues: chinhTaCount,
      phapLyIssues: phapLyCount,
      vanPhongIssues: 1,
      overallScore: score,
      conclusion: `Hệ thống đã rà soát toàn diện và phát hiện ${errors.length} điểm cần hiệu chỉnh (${theThucCount} lỗi thể thức NĐ 30, ${chinhTaCount} lỗi chính tả, ${phapLyCount} lưu ý pháp lý). Văn bản đã được tự động chuẩn hóa.`,
    },
    errors,
    citations,
    standard: standardDoc,
    optimized: optimizedDoc,
  };
}

export function runRuleBasedJurisdiction(
  documentText: string,
  administrativeLevel: 'xa_phuong' | 'huyen_thanhpho' | 'tinh_so' = 'xa_phuong'
): JurisdictionCheckResult {
  const hasNghiQuyet = /NGHỊ QUYẾT/i.test(documentText);
  const hasChiThi = /CHỈ THỊ/i.test(documentText);
  const hasTL = /TL\.\s*CHỦ TỊCH/i.test(documentText);
  const hasKT = /KT\.\s*CHỦ TỊCH/i.test(documentText);

  let isCompetent = true;
  let riskLevel: 'safe' | 'warning' | 'violation' = 'safe';
  const recommendations: string[] = [];

  let formValid = true;
  let formRule = 'Đúng thẩm quyền hình thức văn bản hành chính theo Luật Tổ chức chính quyền địa phương.';
  let formDetails = 'Hình thức văn bản phù hợp với chức năng, nhiệm vụ của cấp hành chính.';

  if (hasChiThi) {
    formValid = false;
    isCompetent = false;
    riskLevel = 'violation';
    formRule = 'Hình thức "Chỉ thị" đã bị bãi bỏ.';
    formDetails = 'UBND không còn thẩm quyền ban hành văn bản mang tên "Chỉ thị" theo quy định hiện hành.';
    recommendations.push('Đổi hình thức sang Quyết định cá biệt hoặc Công văn chỉ đạo.');
  } else if (hasNghiQuyet && !/HỘI ĐỒNG NHÂN DÂN/i.test(documentText)) {
    formValid = false;
    isCompetent = false;
    riskLevel = 'violation';
    formRule = 'UBND không có thẩm quyền ban hành Nghị quyết.';
    formDetails = 'Nghị quyết là hình thức văn bản độc quyền của Hội đồng nhân dân (HĐND).';
    recommendations.push('Chuyển thể văn bản sang Quyết định hoặc Kế hoạch của UBND.');
  }

  let signerValid = true;
  let signerRule = 'Đúng thẩm quyền ký theo Điều 13 Nghị định số 30/2020/NĐ-CP.';
  let signerPrefix = 'CHỦ TỊCH';
  let signerDetails = 'Thẩm quyền ký được xác định hợp lệ.';

  if (hasTL && administrativeLevel === 'xa_phuong') {
    signerValid = false;
    isCompetent = false;
    riskLevel = 'violation';
    signerPrefix = 'TL.';
    signerRule = 'Khoản 3 Điều 13 Nghị định 30/2020/NĐ-CP.';
    signerDetails = 'Cấp Xã/Phường không có chức danh Chánh Văn phòng hay Thủ trưởng cơ quan chuyên môn trực thuộc đủ tư cách pháp nhân để ký thừa lệnh (TL.).';
    recommendations.push('Văn bản cấp xã phải do Chủ tịch ký trực tiếp hoặc Phó Chủ tịch ký thay (KT. CHỦ TỊCH).');
  } else if (hasKT) {
    signerPrefix = 'KT.';
    signerDetails = 'Ký thay (KT.) hợp lệ nếu người ký là Phó Chủ tịch UBND trong phạm vi lĩnh vực được phân công phụ trách.';
  }

  return {
    administrativeLevel,
    isCompetent,
    riskLevel,
    formAuthority: {
      isValid: formValid,
      rule: formRule,
      details: formDetails,
    },
    signerAuthority: {
      isValid: signerValid,
      rule: signerRule,
      signerPrefix,
      details: signerDetails,
    },
    legalReferences: [
      'Luật Tổ chức chính quyền địa phương ngày 19/6/2015 (sửa đổi, bổ sung ngày 22/11/2019);',
      'Luật Ban hành văn bản quy phạm pháp luật ngày 22/6/2015 (sửa đổi, bổ sung ngày 18/6/2020);',
      'Điều 13 Nghị định số 30/2020/NĐ-CP ngày 05/3/2020 của Chính phủ về công tác văn thư.',
    ],
    recommendations: recommendations.length > 0 ? recommendations : [
      'Văn bản tuân thủ đúng thẩm quyền ban hành và người ký theo phân cấp hành chính.',
    ],
  };
}
