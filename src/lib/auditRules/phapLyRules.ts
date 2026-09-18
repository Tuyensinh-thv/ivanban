import { AuditRule, LegalCitationRule } from './ruleTypes';
import { LegalCitation } from '../../types/nd30';

export const LEGAL_CITATION_RULES: LegalCitationRule[] = [
  {
    id: 'pl_nd_110_2004',
    name: 'Nghị định 110/2004/NĐ-CP',
    pattern: /110\/2004\/NĐ-CP/i,
    status: 'expired',
    note: 'HẾT HIỆU LỰC: Đã bị thay thế toàn diện bởi Nghị định số 30/2020/NĐ-CP ngày 05/3/2020 của Chính phủ về công tác văn thư.',
    replacement: 'Nghị định số 30/2020/NĐ-CP ngày 05 tháng 3 năm 2020 của Chính phủ về công tác văn thư',
  },
  {
    id: 'pl_nd_09_2010',
    name: 'Nghị định 09/2010/NĐ-CP',
    pattern: /09\/2010\/NĐ-CP/i,
    status: 'expired',
    note: 'HẾT HIỆU LỰC: Nghị định sửa đổi Nghị định 110/2004 đã hết hiệu lực từ ngày 05/3/2020 theo Nghị định 30/2020/NĐ-CP.',
    replacement: 'Nghị định số 30/2020/NĐ-CP ngày 05 tháng 3 năm 2020 của Chính phủ về công tác văn thư',
  },
  {
    id: 'pl_tt_01_2011',
    name: 'Thông tư 01/2011/TT-BNV',
    pattern: /01\/2011\/TT-BNV/i,
    status: 'expired',
    note: 'HẾT HIỆU LỰC: Thông tư hướng dẫn thể thức và kỹ thuật trình bày văn bản hành chính đã hết hiệu lực, thay thế bởi Nghị định 30/2020/NĐ-CP.',
    replacement: 'Nghị định số 30/2020/NĐ-CP ngày 05 tháng 3 năm 2020 của Chính phủ về công tác văn thư',
  },
  {
    id: 'pl_luat_tc_cqdp_2015',
    name: 'Luật Tổ chức chính quyền địa phương 2015',
    pattern: /Luật\s+Tổ\s+chức\s+chính\s+quyền\s+địa\s+phương(?:\s+năm|\s+số|\s+ngày)?/i,
    status: 'warning',
    note: 'CẦN BỔ SUNG: Luật số 77/2015/QH13 đã được sửa đổi, bổ sung bởi Luật số 47/2019/QH14.',
    replacement: 'Luật Tổ chức chính quyền địa phương ngày 19 tháng 6 năm 2015; Luật sửa đổi, bổ sung một số điều của Luật Tổ chức Chính phủ và Luật Tổ chức chính quyền địa phương ngày 22 tháng 11 năm 2019',
  },
  {
    id: 'pl_luat_bhvb_2015',
    name: 'Luật Ban hành văn bản quy phạm pháp luật 2015',
    pattern: /Luật\s+Ban\s+hành\s+văn\s+bản\s+quy\s+phạm\s+pháp\s+luật(?:\s+năm|\s+số|\s+ngày)?/i,
    status: 'warning',
    note: 'CẦN BỔ SUNG: Luật số 80/2015/QH13 đã được sửa đổi, bổ sung bởi Luật số 63/2020/QH14.',
    replacement: 'Luật Ban hành văn bản quy phạm pháp luật ngày 22 tháng 6 năm 2015; Luật sửa đổi, bổ sung một số điều của Luật Ban hành văn bản quy phạm pháp luật ngày 18 tháng 6 năm 2020',
  },
  {
    id: 'pl_luat_cbcc_2008',
    name: 'Luật Cán bộ, công chức 2008',
    pattern: /Luật\s+Cán\s+bộ[,\s]+công\s+chức(?:\s+năm|\s+số|\s+ngày)?/i,
    status: 'warning',
    note: 'CẦN BỔ SUNG: Luật số 22/2008/QH12 đã được sửa đổi, bổ sung bởi Luật số 52/2019/QH14.',
    replacement: 'Luật Cán bộ, công chức ngày 13 tháng 11 năm 2008; Luật sửa đổi, bổ sung một số điều của Luật Cán bộ, công chức và Luật Viên chức ngày 25 tháng 11 năm 2019',
  },
  {
    id: 'pl_luat_vien_chuc_2010',
    name: 'Luật Viên chức 2010',
    pattern: /Luật\s+Viên\s+chức(?:\s+năm|\s+số|\s+ngày)?/i,
    status: 'warning',
    note: 'CẦN BỔ SUNG: Luật số 58/2010/QH12 đã được sửa đổi, bổ sung bởi Luật số 52/2019/QH14.',
    replacement: 'Luật Viên chức ngày 15 tháng 11 năm 2010; Luật sửa đổi, bổ sung một số điều của Luật Cán bộ, công chức và Luật Viên chức ngày 25 tháng 11 năm 2019',
  },
  {
    id: 'pl_phap_lenh_34_2007',
    name: 'Pháp lệnh 34/2007/PL-UBTVQH11',
    pattern: /34\/2007\/PL-UBTVQH11/i,
    status: 'expired',
    note: 'HẾT HIỆU LỰC: Pháp lệnh dân chủ ở xã, phường, thị trấn đã hết hiệu lực từ ngày 01/7/2023, được thay thế bởi Luật Thực hiện dân chủ ở cơ sở số 10/2022/QH15.',
    replacement: 'Luật Thực hiện dân chủ ở cơ sở ngày 10 tháng 11 năm 2022',
  },
  {
    id: 'pl_luat_dat_dai_2013',
    name: 'Luật Đất đai 2013',
    pattern: /Luật\s+Đất\s+đai(?:\s+năm\s+2013|\s+số\s+45\/2013)/i,
    status: 'expired',
    note: 'HẾT HIỆU LỰC: Luật Đất đai năm 2013 đã được thay thế bởi Luật Đất đai năm 2024 (Luật số 31/2024/QH15 có hiệu lực từ 01/8/2024).',
    replacement: 'Luật Đất đai ngày 18 tháng 01 năm 2024',
  },
  {
    id: 'pl_luat_dau_thau_2013',
    name: 'Luật Đấu thầu 2013',
    pattern: /Luật\s+Đấu\s+thầu(?:\s+năm\s+2013|\s+số\s+43\/2013)/i,
    status: 'expired',
    note: 'HẾT HIỆU LỰC: Luật Đấu thầu năm 2013 đã được thay thế bởi Luật Đấu thầu số 22/2023/QH15 (có hiệu lực từ 01/01/2024).',
    replacement: 'Luật Đấu thầu ngày 23 tháng 6 năm 2023',
  },
];

export const phapLyRules: AuditRule[] = LEGAL_CITATION_RULES.map((item) => ({
  id: item.id,
  name: `Pháp lý: ${item.name}`,
  category: 'phap_ly',
  severity: item.status === 'expired' ? 'error' : 'warning',
  description: item.note,
  nd30Reference: 'Quy chuẩn dẫn chiếu văn bản pháp luật hiện hành',
  check: (text: string) => {
    if (item.pattern.test(text)) {
      const match = text.match(item.pattern);
      return [
        {
          type: 'phap_ly',
          severity: item.status === 'expired' ? 'error' : 'warning',
          location: 'Căn cứ ban hành / Viện dẫn pháp lý',
          originalText: match ? match[0] : item.name,
          suggestedText: item.replacement || item.name,
          explanation: item.note,
        },
      ];
    }
    return null;
  },
}));

export function extractLegalCitations(text: string): LegalCitation[] {
  const results: LegalCitation[] = [];
  for (const rule of LEGAL_CITATION_RULES) {
    if (rule.pattern.test(text)) {
      results.push({
        citation: rule.name,
        status: rule.status,
        note: rule.note,
      });
    }
  }
  return results;
}
