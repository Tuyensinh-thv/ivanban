import { ND30Document } from '../types/nd30';

export interface SampleTemplateItem {
  id: string;
  name: string;
  type: string;
  category: string;
  description: string;
  document: ND30Document;
}

export const SAMPLE_TEMPLATES: SampleTemplateItem[] = [
  {
    id: 'qd-nang-luong',
    name: 'Quyết định Nâng bậc lương trước thời hạn',
    type: 'QUYẾT ĐỊNH',
    category: 'Cán bộ - Tiền lương',
    description: 'Quyết định nâng bậc lương trước thời hạn cho cán bộ lập thành tích xuất sắc tại cấp xã/phường/đơn vị chuẩn NĐ 30.',
    document: {
      co_quan_chu_quan: 'UBND TỈNH PHÚ THỌ',
      co_quan_ban_hanh: 'UBND PHƯỜNG NÔNG TRANG',
      so_ky_hieu: 'Số:    /QĐ-UBND',
      dia_danh_ngay_thang: 'Phú Thọ, ngày 28 tháng 6 năm 2026',
      ten_loai_van_ban: 'QUYẾT ĐỊNH',
      trich_yeu: 'Về việc nâng bậc lương trước thời hạn đợt 1 năm 2026 đối với cán bộ, công chức do lập thành tích xuất sắc trong thực hiện nhiệm vụ',
      can_cu: [
        'Căn cứ Luật Tổ chức chính quyền địa phương ngày 19 tháng 6 năm 2015; Luật sửa đổi, bổ sung một số điều của Luật Tổ chức Chính phủ và Luật Tổ chức chính quyền địa phương ngày 22 tháng 11 năm 2019;',
        'Căn cứ Nghị định số 204/2004/NĐ-CP ngày 14 tháng 12 năm 2004 của Chính phủ về chế độ tiền lương đối với cán bộ, công chức, viên chức và lực lượng vũ trang;',
        'Căn cứ Thông tư số 08/2013/TT-BNV ngày 31 tháng 7 năm 2013 của Bộ Nội vụ hướng dẫn thực hiện chế độ nâng bậc lương thường xuyên và nâng bậc lương trước thời hạn đối với cán bộ, công chức, viên chức và người lao động; Thông tư số 03/2021/TT-BNV ngày 30 tháng 7 năm 2021 của Bộ Nội vụ;',
        'Căn cứ Quy chế nâng bậc lương trước thời hạn ban hành kèm theo Quyết định số 45/QĐ-UBND ngày 15 tháng 01 năm 2024 của UBND phường Nông Trang;',
        'Căn cứ Biên bản họp Hội đồng nâng lương phường Nông Trang ngày 22 tháng 6 năm 2026;',
        'Xét đề nghị của Công chức Văn phòng - Thống kê phường Nông Trang.',
      ],
      noi_dung: [
        {
          loai: 'doan_van',
          tieu_de: '',
          noi_dung: 'CHỦ TỊCH ỦY BAN NHÂN DÂN PHƯỜNG NÔNG TRANG QUYẾT ĐỊNH:',
        },
        {
          loai: 'dieu',
          tieu_de: 'Điều 1.',
          noi_dung: 'Nâng bậc lương trước thời hạn 06 (sáu) tháng kể từ ngày 01 tháng 7 năm 2026 (đợt 1 năm 2026) đối với 03 cán bộ, công chức thuộc Ủy ban nhân dân phường Nông Trang do đã lập thành tích xuất sắc trong thực hiện nhiệm vụ công tác (có Danh sách chi tiết kèm theo).',
        },
        {
          loai: 'dieu',
          tieu_de: 'Điều 2.',
          noi_dung: 'Mức lương mới, thời gian hưởng bậc lương mới và thời hạn tính nâng bậc lương lần sau của các cán bộ, công chức có tên tại Điều 1 được thực hiện theo Danh sách đính kèm Quyết định này.',
        },
        {
          loai: 'dieu',
          tieu_de: 'Điều 3.',
          noi_dung: 'Quyết định này có hiệu lực thi hành kể từ ngày ký ban hành.',
        },
        {
          loai: 'dieu',
          tieu_de: 'Điều 4.',
          noi_dung: 'Công chức Văn phòng - Thống kê, Công chức Tài chính - Kế toán, các tổ chức, cá nhân có liên quan và các cán bộ, công chức có tên tại Điều 1 chịu trách nhiệm thi hành Quyết định này./.',
        },
      ],
      noi_nhan: [
        'Như Điều 4;',
        'UBND tỉnh Phú Thọ;',
        'Sở Nội vụ tỉnh Phú Thọ;',
        'UBND thành phố Việt Trì;',
        'Tổ CĐS Trường ĐH Hùng Vương;',
        'Lưu: VT, VP, KT.',
      ],
      chuc_danh_nguoi_ky: 'CHỦ TỊCH',
      ten_nguoi_ky: 'Nguyễn Văn A',
    },
  },
  {
    id: 'qd-khen-thuong',
    name: 'Quyết định Khen thưởng thành tích xuất sắc',
    type: 'QUYẾT ĐỊNH',
    category: 'Thi đua - Khen thưởng',
    description: 'Quyết định biểu dương, khen thưởng tập thể và cá nhân có thành tích xuất sắc trong công tác cải cách hành chính và chuyển đổi số.',
    document: {
      co_quan_chu_quan: 'UBND TỈNH PHÚ THỌ',
      co_quan_ban_hanh: 'UBND PHƯỜNG NÔNG TRANG',
      so_ky_hieu: 'Số:    /QĐ-UBND',
      dia_danh_ngay_thang: 'Phú Thọ, ngày 15 tháng 11 năm 2026',
      ten_loai_van_ban: 'QUYẾT ĐỊNH',
      trich_yeu: 'Về việc khen thưởng tập thể và các cá nhân có thành tích xuất sắc trong phong trào thi đua chuyển đổi số và cải cách hành chính năm 2026',
      can_cu: [
        'Căn cứ Luật Thi đua, khen thưởng ngày 15 tháng 6 năm 2022;',
        'Căn cứ Luật Tổ chức chính quyền địa phương ngày 19 tháng 6 năm 2015; Luật sửa đổi, bổ sung một số điều của Luật Tổ chức Chính phủ và Luật Tổ chức chính quyền địa phương ngày 22 tháng 11 năm 2019;',
        'Căn cứ Nghị định số 98/2023/NĐ-CP ngày 31 tháng 12 năm 2023 của Chính phủ quy định chi tiết thi hành một số điều của Luật Thi đua, khen thưởng;',
        'Xét đề nghị của Thường trực Hội đồng Thi đua - Khen thưởng phường Nông Trang.',
      ],
      noi_dung: [
        {
          loai: 'doan_van',
          tieu_de: '',
          noi_dung: 'CHỦ TỊCH ỦY BAN NHÂN DÂN PHƯỜNG NÔNG TRANG QUYẾT ĐỊNH:',
        },
        {
          loai: 'dieu',
          tieu_de: 'Điều 1.',
          noi_dung: 'Tặng Giấy khen của Chủ tịch Ủy ban nhân dân phường Nông Trang cho 02 tập thể và 05 cá nhân đã có thành tích xuất sắc trong phong trào thi đua ứng dụng công nghệ thông tin và chuyển đổi số năm 2026.',
        },
        {
          loai: 'dieu',
          tieu_de: 'Điều 2.',
          noi_dung: 'Tiền thưởng kèm theo Giấy khen thực hiện theo quy định hiện hành, trích từ Quỹ thi đua khen thưởng của Ủy ban nhân dân phường.',
        },
        {
          loai: 'dieu',
          tieu_de: 'Điều 3.',
          noi_dung: 'Quyết định này có hiệu lực kể từ ngày ký ban hành. Văn phòng HĐND & UBND, Công chức Kế toán và các tập thể, cá nhân có tên tại Điều 1 chịu trách nhiệm thi hành Quyết định này./.',
        },
      ],
      noi_nhan: [
        'Như Điều 3;',
        'UBND thành phố Việt Trì;',
        'Hội đồng TĐKT phường;',
        'Lưu: VT, VP.',
      ],
      chuc_danh_nguoi_ky: 'CHỦ TỊCH',
      ten_nguoi_ky: 'Nguyễn Văn A',
    },
  },
  {
    id: 'cv-chuyen-doi-so',
    name: 'Công văn Phối hợp ứng dụng Trợ lý ảo AI & Chuyển đổi số',
    type: 'CÔNG VĂN',
    category: 'Chuyển đổi số - Cải cách hành chính',
    description: 'Công văn đề nghị phối hợp tập huấn và triển khai giải pháp số hóa văn bản hành chính theo NĐ 30.',
    document: {
      co_quan_chu_quan: 'UBND TỈNH PHÚ THỌ',
      co_quan_ban_hanh: 'UBND PHƯỜNG NÔNG TRANG',
      so_ky_hieu: 'Số:    /UBND-VP',
      dia_danh_ngay_thang: 'Phú Thọ, ngày 15 tháng 8 năm 2026',
      trich_yeu: 'V/v phối hợp tập huấn và ứng dụng hệ thống AI hỗ trợ soạn thảo, rà soát văn bản hành chính',
      kinh_gui: 'Tổ Chuyển đổi số - Trường Đại học Hùng Vương',
      noi_dung: [
        {
          loai: 'doan_van',
          noi_dung: 'Thực hiện Kế hoạch số 89/KH-UBND của Ủy ban nhân dân tỉnh Phú Thọ về chuyển đổi số và nâng cao chất lượng công tác cải cách hành chính năm 2026, nhằm nâng cao tính chuẩn xác, chuyên nghiệp trong công tác văn thư lưu trữ theo Nghị định số 30/2020/NĐ-CP;',
        },
        {
          loai: 'doan_van',
          noi_dung: 'Ủy ban nhân dân phường Nông Trang trân trọng đề nghị Tổ Chuyển đổi số - Trường Đại học Hùng Vương quan tâm, phối hợp tổ chức lớp hướng dẫn tập huấn nghiệp vụ cho đội ngũ cán bộ, công chức phường về việc ứng dụng hệ thống trợ lý ảo hỗ trợ soạn thảo, thẩm định căn cứ pháp lý và rà soát lỗi văn bản hành chính.',
        },
        {
          loai: 'doan_van',
          noi_dung: 'Thời gian dự kiến: 01 buổi, vào ngày 25 tháng 8 năm 2026 tại Hội trường tầng 3, Trụ sở UBND phường Nông Trang. Kinh phí tổ chức do UBND phường đảm bảo theo quy định hiện hành.',
        },
        {
          loai: 'doan_van',
          noi_dung: 'UBND phường Nông Trang rất mong nhận được sự phối hợp, hỗ trợ của Quý đơn vị để hội nghị tập huấn đạt kết quả tốt đẹp./.',
        },
      ],
      noi_nhan: [
        'Như kính gửi;',
        'UBND thành phố Việt Trì;',
        'Chủ tịch, các PCT UBND phường;',
        'Công chức chuyên môn phường;',
        'Lưu: VT, VP.',
      ],
      chuc_danh_nguoi_ky: 'CHỦ TỊCH',
      ten_nguoi_ky: 'Nguyễn Văn A',
    },
  },
  {
    id: 'tt-kinh-phi-so-hoa',
    name: 'Tờ trình Đề nghị cấp kinh phí số hóa tài liệu lưu trữ',
    type: 'TỜ TRÌNH',
    category: 'Tài chính - Cơ sở vật chất',
    description: 'Tờ trình trình cấp có thẩm quyền phê duyệt danh mục và dự toán kinh phí số hóa văn bản lưu trữ địa phương.',
    document: {
      co_quan_chu_quan: 'UBND TỈNH PHÚ THỌ',
      co_quan_ban_hanh: 'UBND PHƯỜNG NÔNG TRANG',
      so_ky_hieu: 'Số:    /TTr-UBND',
      dia_danh_ngay_thang: 'Phú Thọ, ngày 10 tháng 9 năm 2026',
      ten_loai_van_ban: 'TỜ TRÌNH',
      trich_yeu: 'Về việc đề nghị phê duyệt chủ trương và bố trí kinh phí thực hiện số hóa hồ sơ, văn bản hành chính giai đoạn 2026 - 2027',
      kinh_gui: 'Ủy ban nhân dân thành phố Việt Trì',
      can_cu: [
        'Căn cứ Luật Ngân sách nhà nước ngày 25 tháng 6 năm 2015;',
        'Căn cứ Nghị định số 30/2020/NĐ-CP ngày 05 tháng 3 năm 2020 của Chính phủ về công tác văn thư;',
        'Căn cứ Quyết định của UBND tỉnh Phú Thọ về phê duyệt Đề án Chuyển đổi số tỉnh Phú Thọ đến năm 2025, định hướng đến năm 2030;',
        'Căn cứ tình hình thực tế hồ sơ, văn bản lưu trữ đang quản lý tại trụ sở UBND phường Nông Trang.',
      ],
      noi_dung: [
        {
          loai: 'doan_van',
          noi_dung: 'Để đáp ứng yêu cầu lưu trữ số, phục vụ chỉ đạo điều hành và tra cứu giải quyết thủ tục hành chính cho người dân và doanh nghiệp, UBND phường Nông Trang kính trình UBND thành phố Việt Trì xem xét phê duyệt chủ trương triển khai số hóa hồ sơ, văn bản hành chính với các nội dung chính sau:',
        },
        {
          loai: 'doan_van',
          tieu_de: '1. Mục tiêu và quy mô:',
          noi_dung: 'Số hóa toàn bộ hồ sơ địa chính, hồ sơ hộ tịch và văn bản chỉ đạo điều hành từ năm 2015 đến nay (ước tính khoảng 45.000 trang tài liệu khổ A4) đạt chuẩn OCR tra cứu trực tuyến.',
        },
        {
          loai: 'doan_van',
          tieu_de: '2. Dự toán kinh phí thực hiện:',
          noi_dung: 'Tổng kinh phí đề nghị cấp: 120.000.000 đồng (Một trăm hai mươi triệu đồng chẵn) từ nguồn vốn sự nghiệp công nghệ thông tin của thành phố.',
        },
        {
          loai: 'doan_van',
          tieu_de: '3. Thời gian thực hiện:',
          noi_dung: 'Từ quý IV năm 2026 đến quý II năm 2027.',
        },
        {
          loai: 'doan_van',
          noi_dung: 'Kính trình Ủy ban nhân dân thành phố Việt Trì xem xét, quyết định./.',
        },
      ],
      noi_nhan: [
        'Như kính gửi;',
        'Phòng Nội vụ TP Việt Trì;',
        'Phòng Tài chính - Kế hoạch TP Việt Trì;',
        'Lưu: VT, VP.',
      ],
      chuc_danh_nguoi_ky: 'CHỦ TỊCH',
      ten_nguoi_ky: 'Nguyễn Văn A',
    },
  },
  {
    id: 'bc-cong-tac-thang',
    name: 'Báo cáo Kết quả công tác tháng và phương hướng tháng tới',
    type: 'BÁO CÁO',
    category: 'Kế hoạch - Tổng hợp',
    description: 'Báo cáo định kỳ kết quả triển khai nhiệm vụ kinh tế - xã hội và phương hướng nhiệm vụ trọng tâm.',
    document: {
      co_quan_chu_quan: 'UBND TỈNH PHÚ THỌ',
      co_quan_ban_hanh: 'UBND PHƯỜNG NÔNG TRANG',
      so_ky_hieu: 'Số:    /BC-UBND',
      dia_danh_ngay_thang: 'Phú Thọ, ngày 30 tháng 9 năm 2026',
      ten_loai_van_ban: 'BÁO CÁO',
      trich_yeu: 'Kết quả thực hiện nhiệm vụ phát triển kinh tế - xã hội tháng 9 và nhiệm vụ trọng tâm tháng 10 năm 2026',
      kinh_gui: 'Ủy ban nhân dân thành phố Việt Trì',
      noi_dung: [
        {
          loai: 'doan_van',
          noi_dung: 'Ủy ban nhân dân phường Nông Trang báo cáo kết quả thực hiện nhiệm vụ phát triển kinh tế - xã hội, quốc phòng - an ninh tháng 9 và phương hướng trọng tâm tháng 10 năm 2026 như sau:',
        },
        {
          loai: 'doan_van',
          tieu_de: 'I. KẾT QUẢ ĐẠT ĐƯỢC',
          noi_dung: '1. Về kinh tế - tài chính: Thu ngân sách đạt 108% kế hoạch tháng. Hoạt động thương mại dịch vụ trên địa bàn duy trì ổn định.\n2. Về văn hóa - xã hội: Công tác an sinh xã hội được quan tâm chu đáo. 100% hồ sơ thủ tục hành chính được tiếp nhận và xử lý đúng hẹn trên Cổng dịch vụ công.\n3. Về chuyển đổi số: Đã hoàn thành cấp định danh điện tử mức 2 cho trên 95% công dân.',
        },
        {
          loai: 'doan_van',
          tieu_de: 'II. NHIỆM VỤ TRỌNG TÂM THÁNG 10 NĂM 2026',
          noi_dung: '1. Tập trung rà soát và hoàn thành các chỉ tiêu kinh tế - xã hội năm 2026.\n2. Đẩy mạnh thanh toán không dùng tiền mặt và số hóa 100% kết quả giải quyết TTHC theo Nghị định số 30/2020/NĐ-CP.\n3. Tăng cường công tác đảm bảo an ninh trật tự, trật tự đô thị trên địa bàn.',
        },
      ],
      noi_nhan: [
        'Như kính gửi;',
        'Thường trực Đảng ủy phường;',
        'Thường trực HĐND phường;',
        'Lãnh đạo UBND phường;',
        'Lưu: VT, TH.',
      ],
      chuc_danh_nguoi_ky: 'CHỦ TỊCH',
      ten_nguoi_ky: 'Nguyễn Văn A',
    },
  },
];

export const ND30_RULES_SUMMARY = [
  {
    title: 'Phông chữ & Cỡ chữ chuẩn',
    rule: 'Phông chữ Times New Roman, Unicode tiếng Việt. Tiêu đề in hoa đậm 13-14pt; nội dung chính văn 13-14pt thường; Quốc hiệu 12-13pt in hoa đậm; Tiêu ngữ 13-14pt chữ in thường đậm.',
  },
  {
    title: 'Giãn dòng & Giãn đoạn',
    rule: 'Giãn dòng chính xác (Exactly): 16 pt. Giãn đoạn (Paragraph spacing): Before: 6 pt, After: 6 pt. Thụt đầu dòng đoạn văn: 1.27 cm (tương đương 720 dxa).',
  },
  {
    title: 'Căn lề trang A4',
    rule: 'Lề trên: 20 mm (2.0 cm); Lề dưới: 20 mm (2.0 cm); Lề trái: 30 mm (3.0 cm); Lề phải: 15 - 20 mm (1.5 - 2.0 cm). Căn đều hai bên (Justified).',
  },
  {
    title: 'Quy chuẩn Nơi nhận',
    rule: 'Không dùng dấu ngoặc đơn (...) trong Nơi nhận (ví dụ không ghi "(để b/c)", "(để biết)"). Thứ tự liệt kê: Cấp trên -> Cùng cấp -> Cấp dưới -> Lưu: VT, các bộ phận liên quan.',
  },
  {
    title: 'Thẩm định Trích dẫn (Citation Verification)',
    rule: 'Mọi căn cứ pháp lý phải chỉ rõ ngày tháng năm ban hành, cơ quan ban hành, và phải còn hiệu lực thi hành. Mốc thời gian ban hành văn bản phải sau hoặc bằng ngày ban hành căn cứ.',
  },
  {
    title: 'Quy tắc Viết hoa hành chính',
    rule: 'Viết hoa tên cơ quan, tổ chức theo quy định tại Phụ lục II Nghị định 30/2020/NĐ-CP (ví dụ: "Ủy ban nhân dân tỉnh Phú Thọ", "Chủ tịch Ủy ban nhân dân", "Bộ Nội vụ").',
  },
];
