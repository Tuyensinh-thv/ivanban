import { ContentBlock } from '../types/nd30';

export interface DocumentPresetItem {
  id: string;
  docType: string;
  name: string;
  category: 'core' | 'project' | 'citizen';
  subject: string;
  directives: string;
  references?: string;
  recipients: string;
  signerTitle: string;
  signerName: string;
  kinhGui?: string;
  superiorAgency?: string;
  issuingAgency?: string;
  toTrinhBudget?: string;
  toTrinhTimeline?: string;
  citizenName?: string;
  citizenIdCard?: string;
  citizenAddress?: string;
  noiDung: ContentBlock[];
}

export const DOCUMENT_PRESETS: Record<string, DocumentPresetItem> = {
  'QUYẾT ĐỊNH': {
    id: 'QUYẾT ĐỊNH',
    docType: 'QUYẾT ĐỊNH',
    name: 'Quyết định (Cá biệt theo thẩm quyền)',
    category: 'core',
    subject: 'Về việc ban hành Kế hoạch Chuyển đổi số và Ứng dụng công nghệ thông tin năm 2026',
    directives: 'Ban hành Kế hoạch thực hiện chuyển đổi số toàn diện. Phân công các phòng, ban, đơn vị triển khai các nhiệm vụ cụ thể.',
    references: 'Luật Tổ chức chính quyền địa phương ngày 19 tháng 6 năm 2015; Luật sửa đổi, bổ sung một số điều của Luật Tổ chức Chính phủ và Luật Tổ chức chính quyền địa phương ngày 22 tháng 11 năm 2019; Nghị định số 30/2020/NĐ-CP ngày 05 tháng 3 năm 2020 của Chính phủ về công tác văn thư;',
    recipients: 'Như Điều 3; Thường trực HĐND; Chủ tịch, các Phó Chủ tịch; Lưu: VT, CĐS.',
    signerTitle: 'CHỦ TỊCH',
    signerName: 'Nguyễn Văn A',
    noiDung: [
      {
        loai: 'doan_van',
        tieu_de: '',
        noi_dung: 'QUYẾT ĐỊNH:',
      },
      {
        loai: 'dieu',
        tieu_de: 'Điều 1.',
        noi_dung: 'Ban hành kèm theo Quyết định này Kế hoạch Chuyển đổi số và Ứng dụng công nghệ thông tin giai đoạn 2026 - 2030.',
      },
      {
        loai: 'dieu',
        tieu_de: 'Điều 2.',
        noi_dung: 'Quyết định này có hiệu lực thi hành kể từ ngày ký ban hành.',
      },
      {
        loai: 'dieu',
        tieu_de: 'Điều 3.',
        noi_dung: 'Chánh Văn phòng, Trưởng các phòng, ban, đơn vị trực thuộc và các tổ chức, cá nhân có liên quan chịu trách nhiệm thi hành Quyết định này./.',
      },
    ],
  },

  'CÔNG VĂN': {
    id: 'CÔNG VĂN',
    docType: 'CÔNG VĂN',
    name: 'Công văn (Hành chính / Phúc đáp)',
    category: 'core',
    subject: 'V/v phối hợp rà soát, chuẩn hóa dữ liệu hồ sơ cán bộ công chức điện tử',
    directives: 'Đề nghị các cơ quan, đơn vị khẩn trương rà soát, đối chiếu và cập nhật thông tin dữ liệu cán bộ lên hệ thống trước ngày 15/10/2026.',
    references: '',
    kinhGui: 'Các phòng, ban, đơn vị trực thuộc',
    recipients: 'Như kính gửi; Lãnh đạo cơ quan; Lưu: VT.',
    signerTitle: 'THỦ TRƯỞNG ĐƠN VỊ',
    signerName: 'Nguyễn Văn A',
    noiDung: [
      {
        loai: 'doan_van',
        tieu_de: '',
        noi_dung: 'Thực hiện chỉ đạo của cấp có thẩm quyền về việc đẩy mạnh chuyển đổi số và chuẩn hóa cơ sở dữ liệu quốc gia về cán bộ, công chức, viên chức;',
      },
      {
        loai: 'doan_van',
        tieu_de: '',
        noi_dung: 'Để đảm bảo tiến độ và độ chính xác của cơ sở dữ liệu, đề nghị các cơ quan, đơn vị phối hợp triển khai thực hiện nghiêm túc các nội dung sau:',
      },
      {
        loai: 'doan_van',
        tieu_de: '1.',
        noi_dung: 'Khẩn trương kiểm tra, đối soát thông tin từng hồ sơ cán bộ, công chức, viên chức thuộc thẩm quyền quản lý.',
      },
      {
        loai: 'doan_van',
        tieu_de: '2.',
        noi_dung: 'Tổng hợp các vướng mắc, sai lệch và gửi báo cáo về Văn phòng trước ngày 15/10/2026 để tổng hợp, báo cáo cấp trên giải quyết.',
      },
      {
        loai: 'doan_van',
        tieu_de: '',
        noi_dung: 'Rất mong nhận được sự phối hợp chặt chẽ, kịp thời của các đơn vị./.',
      },
    ],
  },

  'TỜ TRÌNH': {
    id: 'TỜ TRÌNH',
    docType: 'TỜ TRÌNH',
    name: 'Tờ trình (Đề nghị phê duyệt chủ trương, dự toán)',
    category: 'core',
    subject: 'Về việc đề nghị phê duyệt chủ trương đầu tư dự án nâng cấp hạ tầng số',
    directives: 'Kính trình cấp có thẩm quyền xem xét, phê duyệt chủ trương và bố trí kinh phí thực hiện dự án nâng cấp hạ tầng công nghệ thông tin.',
    references: 'Luật Đầu tư công ngày 13 tháng 6 năm 2019; Luật Ngân sách nhà nước ngày 25 tháng 6 năm 2015;',
    kinhGui: 'Ủy ban nhân dân cấp trên / Cấp có thẩm quyền phê duyệt',
    toTrinhBudget: '450.000.000 đồng',
    toTrinhTimeline: 'Quý IV/2026 đến Quý II/2027',
    recipients: 'Như kính gửi; Phòng Tài chính - Kế hoạch; Lưu: VT.',
    signerTitle: 'THỦ TRƯỞNG ĐƠN VỊ',
    signerName: 'Nguyễn Văn A',
    noiDung: [
      {
        loai: 'doan_van',
        tieu_de: 'I. SỰ CẦN THIẾT VÀ CĂN CỨ THỰC HIỆN:',
        noi_dung: 'Hệ thống hạ tầng mạng và máy chủ hiện tại đã khai thác qua nhiều năm, thường xuyên xảy ra tình trạng quá tải, không đáp ứng kịp thời yêu cầu số hóa hồ sơ thủ tục hành chính.',
      },
      {
        loai: 'doan_van',
        tieu_de: 'II. MỤC TIÊU VÀ QUY MÔ ĐỀ NGHỊ:',
        noi_dung: 'Nâng cấp toàn bộ hệ thống đường truyền nội bộ, trang bị giải pháp bảo mật dữ liệu cấp độ 3 và số hóa 100% hồ sơ tài liệu lưu trữ hành chính.',
      },
      {
        loai: 'doan_van',
        tieu_de: 'III. DỰ KIẾN KINH PHÍ VÀ THỜI GIAN THỰC HIỆN:',
        noi_dung: 'Tổng kinh phí dự kiến: 450.000.000 đồng (Bốn trăm năm mươi triệu đồng). Nguồn vốn: Ngân sách nhà nước cấp và nguồn sự nghiệp.',
      },
      {
        loai: 'doan_van',
        tieu_de: 'IV. KIẾN NGHỊ:',
        noi_dung: 'Kính trình cấp có thẩm quyền xem xét, quyết định phê duyệt chủ trương để đơn vị có cơ sở triển khai các bước tiếp theo./.',
      },
    ],
  },

  'BÁO CÁO': {
    id: 'BÁO CÁO',
    docType: 'BÁO CÁO',
    name: 'Báo cáo (Định kỳ / Chuyên đề / Tổng kết)',
    category: 'core',
    subject: 'Báo cáo Kết quả công tác quý III và phương hướng nhiệm vụ trọng tâm quý IV năm 2026',
    directives: 'Báo cáo đánh giá toàn diện các mặt công tác, chỉ rõ kết quả đạt được, tồn tại hạn chế và đề ra phương hướng giải pháp quý tiếp theo.',
    references: '',
    kinhGui: 'Ủy ban nhân dân cấp trên / Ban Giám đốc',
    recipients: 'Như kính gửi; Các phòng ban liên quan; Lưu: VT.',
    signerTitle: 'THỦ TRƯỞNG ĐƠN VỊ',
    signerName: 'Nguyễn Văn A',
    noiDung: [
      {
        loai: 'doan_van',
        tieu_de: 'I. KẾT QUẢ CÔNG TÁC QUÝ III/2026:',
        noi_dung: '1. Về công tác chỉ đạo, điều hành: Đã ban hành kịp thời 100% kế hoạch và văn bản phân công nhiệm vụ.\n2. Về chuyển đổi số: Tỷ lệ xử lý hồ sơ trực tuyến đạt 96.5%, hoàn thành đúng hạn 100% văn bản chỉ đạo.',
      },
      {
        loai: 'doan_van',
        tieu_de: 'II. ĐÁNH GIÁ TỒN TẠI, HẠN CHẾ:',
        noi_dung: 'Một số bộ phận cập nhật số liệu còn chậm; công tác tuyên truyền dịch vụ công trực tuyến chưa thực sự đồng đều giữa các đơn vị.',
      },
      {
        loai: 'doan_van',
        tieu_de: 'III. PHƯƠNG HƯỚNG NHIỆM VỤ QUÝ IV/2026:',
        noi_dung: 'Tập trung hoàn thành 100% các chỉ tiêu kinh tế - kỹ thuật được giao; tổ chức đánh giá tổng kết thi đua khen thưởng năm 2026 đúng quy định.',
      },
    ],
  },

  'KẾ HOẠCH': {
    id: 'KẾ HOẠCH',
    docType: 'KẾ HOẠCH',
    name: 'Kế hoạch (Triển khai nhiệm vụ)',
    category: 'core',
    subject: 'Kế hoạch Triển khai Chiến dịch 60 ngày đêm chuyển đổi số và nâng cao tỷ lệ dịch vụ công trực tuyến',
    directives: 'Tổ chức đợt cao điểm hướng dẫn người dân tạo tài khoản định danh VNeID và nộp hồ sơ trực tuyến tại bộ phận một cửa.',
    references: 'Nghị quyết của Tỉnh ủy về chuyển đổi số; Quyết định phân công nhiệm vụ công tác năm 2026;',
    recipients: 'Như Mục III; UBND cấp trên; Các đoàn thể; Lưu: VT.',
    signerTitle: 'CHỦ TỊCH / THỦ TRƯỞNG',
    signerName: 'Nguyễn Văn A',
    noiDung: [
      {
        loai: 'doan_van',
        tieu_de: 'I. MỤC ĐÍCH, YÊU CẦU:',
        noi_dung: 'Nhằm nâng cao nhận thức, trách nhiệm của cán bộ, công chức và tạo thuận lợi tối đa cho tổ chức, công dân khi tham gia giải quyết thủ tục hành chính qua môi trường điện tử.',
      },
      {
        loai: 'doan_van',
        tieu_de: 'II. NỘI DUNG VÀ TIẾN ĐỘ THỰC HIỆN:',
        noi_dung: '1. Thành lập Tổ công nghệ số cộng đồng trực tiếp hỗ trợ công dân từ thứ 2 đến thứ 6 hàng tuần.\n2. Rà soát, đơn giản hóa các bước tiếp nhận hồ sơ đủ điều kiện thực hiện dịch vụ công trực tuyến toàn trình.',
      },
      {
        loai: 'doan_van',
        tieu_de: 'III. TỔ CHỨC THỰC HIỆN:',
        noi_dung: 'Giao Đoàn Thanh niên, Bộ phận Một cửa và Tổ Chuyển đổi số chịu trách nhiệm thường trực theo dõi, đôn đốc và tổng hợp kết quả hàng tuần.',
      },
    ],
  },

  'THÔNG BÁO': {
    id: 'THÔNG BÁO',
    docType: 'THÔNG BÁO',
    name: 'Thông báo (Kết luận / Lịch công tác)',
    category: 'core',
    subject: 'Thông báo Kết luận cuộc họp giao ban công tác tháng và phân công nhiệm vụ trọng tâm',
    directives: 'Thông báo ý kiến kết luận chỉ đạo của Chủ tịch/Thủ trưởng tại cuộc họp giao ban định kỳ để các phòng, ban tổ chức thực hiện.',
    references: 'Biên bản cuộc họp giao ban định kỳ;',
    recipients: 'Lãnh đạo cơ quan; Các phòng, ban, đơn vị trực thuộc; Lưu: VT.',
    signerTitle: 'CHÁNH VĂN PHÒNG',
    signerName: 'Trần Văn B',
    noiDung: [
      {
        loai: 'doan_van',
        tieu_de: '',
        noi_dung: 'Ngày ... tháng ... năm 2026, đồng chí Thủ trưởng đơn vị đã chủ trì cuộc họp giao ban đánh giá tiến độ công tác. Sau khi nghe báo cáo và ý kiến thảo luận của các thành viên dự họp, đồng chí kết luận như sau:',
      },
      {
        loai: 'doan_van',
        tieu_de: '1.',
        noi_dung: 'Giao Phòng Kế hoạch - Tài chính hoàn thành thẩm định dự toán ngân sách trước ngày 25 hàng tháng.',
      },
      {
        loai: 'doan_van',
        tieu_de: '2.',
        noi_dung: 'Yêu cầu các đơn vị tăng cường kỷ cương hành chính và chấp hành nghiêm túc chế độ thông tin báo cáo.',
      },
      {
        loai: 'doan_van',
        tieu_de: '',
        noi_dung: 'Văn phòng xin thông báo đến các cơ quan, đơn vị biết và nghiêm túc tổ chức triển khai thực hiện./.',
      },
    ],
  },

  'GIẤY MỜI': {
    id: 'GIẤY MỜI',
    docType: 'GIẤY MỜI',
    name: 'Giấy mời (Dự họp / Hội nghị)',
    category: 'core',
    subject: 'Giấy mời Dự Hội nghị tập huấn nghiệp vụ công tác văn thư lưu trữ và quản lý văn bản điện tử',
    directives: 'Mời đại diện các cơ quan, đơn vị tham dự hội nghị tập huấn chuyên môn.',
    kinhGui: 'Đại diện Lãnh đạo và Cán bộ phụ trách văn thư các cơ quan, đơn vị',
    recipients: 'Như kính gửi; Lãnh đạo cơ quan; Lưu: VT.',
    signerTitle: 'THỦ TRƯỞNG ĐƠN VỊ',
    signerName: 'Nguyễn Văn A',
    noiDung: [
      {
        loai: 'doan_van',
        tieu_de: '',
        noi_dung: 'Đơn vị trân trọng kính mời các đồng chí tham dự Hội nghị tập huấn nghiệp vụ với các thông tin chi tiết như sau:',
      },
      {
        loai: 'doan_van',
        tieu_de: '1. Thời gian:',
        noi_dung: '08 giờ 00 phút, ngày ... tháng ... năm 2026.',
      },
      {
        loai: 'doan_van',
        tieu_de: '2. Địa điểm:',
        noi_dung: 'Hội trường Tầng 3, Trụ sở cơ quan.',
      },
      {
        loai: 'doan_van',
        tieu_de: '3. Thành phần:',
        noi_dung: 'Đại diện Lãnh đạo phòng/ban và cán bộ trực tiếp thực hiện công tác văn thư, lưu trữ điện tử.',
      },
      {
        loai: 'doan_van',
        tieu_de: '4. Nội dung:',
        noi_dung: 'Hướng dẫn thể thức văn bản theo Nghị định số 30/2020/NĐ-CP và vận hành hệ thống iVanban điện tử.',
      },
      {
        loai: 'doan_van',
        tieu_de: '',
        noi_dung: 'Đề nghị các đại biểu tham dự đầy đủ, đúng giờ để Hội nghị đạt kết quả tốt đẹp./.',
      },
    ],
  },

  // ==========================================
  // NHÓM ĐỀ ÁN, DỰ ÁN, QUY CHẾ CHUYÊN ĐỀ
  // ==========================================
  'ĐỀ ÁN': {
    id: 'ĐỀ ÁN',
    docType: 'ĐỀ ÁN',
    name: 'Đề án (Chiến lược phát triển / Đào tạo)',
    category: 'project',
    subject: 'Đề án Đổi mới nâng cao chất lượng quản trị đại học và chuyển đổi số toàn diện',
    directives: 'Xây dựng mục tiêu, lộ trình, nguồn lực và giải pháp chuyển đổi số đồng bộ trong toàn cơ quan, đơn vị.',
    references: 'Luật Giáo dục đại học; Nghị quyết của Đảng ủy về đẩy mạnh chuyển đổi số;',
    recipients: 'Đảng ủy, Ban Giám hiệu; Các Khoa, Phòng chức năng; Lưu: VT.',
    signerTitle: 'HIỆU TRƯỞNG / THỦ TRƯỞNG',
    signerName: 'Nguyễn Văn A',
    noiDung: [
      {
        loai: 'doan_van',
        tieu_de: 'PHẦN I. SỰ CẦN THIẾT VÀ CĂN CỨ XÂY DỰNG ĐỀ ÁN',
        noi_dung: 'Nêu rõ bối cảnh thực tiễn, thực trạng hạ tầng, nhân lực và yêu cầu cấp thiết phải hiện đại hóa quy trình quản trị trên môi trường số.',
      },
      {
        loai: 'doan_van',
        tieu_de: 'PHẦN II. MỤC TIÊU VÀ CÁC CHỈ TIÊU CỤ THỂ',
        noi_dung: '1. Mục tiêu tổng quát: Đến năm 2030 trở thành cơ sở giáo dục đại học thông minh, tiên tiến.\n2. Chỉ tiêu cụ thể: 100% hồ sơ công việc xử lý trên môi trường mạng, 100% cán bộ giảng viên đạt chuẩn kỹ năng số.',
      },
      {
        loai: 'doan_van',
        tieu_de: 'PHẦN III. NHIỆM VỤ VÀ GIẢI PHÁP TRỌNG TÂM',
        noi_dung: 'Nâng cấp trung tâm tích hợp dữ liệu; xây dựng học liệu điện tử dùng chung; tích hợp trợ lý ảo AI hỗ trợ xử lý văn bản hành chính.',
      },
      {
        loai: 'doan_van',
        tieu_de: 'PHẦN IV. KINH PHÍ VÀ LỘ TRÌNH THỰC HIỆN',
        noi_dung: 'Dự toán kinh phí và phân kỳ đầu tư theo từng giai đoạn từ năm 2026 đến năm 2030.',
      },
    ],
  },

  'DỰ ÁN': {
    id: 'DỰ ÁN',
    docType: 'DỰ ÁN',
    name: 'Dự án (Đầu tư công / CNTT / Cơ sở hạ tầng)',
    category: 'project',
    subject: 'Dự án Xây dựng Trung tâm Dữ liệu và Phòng điều hành thông minh (IOC)',
    directives: 'Trình duyệt thiết kế, dự toán và giải pháp công nghệ cho dự án hiện đại hóa cơ sở vật chất.',
    references: 'Luật Đầu tư công; Luật Công nghệ thông tin; Báo cáo nghiên cứu khả thi;',
    recipients: 'Cơ quan chủ quản; Ban Quản lý dự án; Lưu: VT.',
    signerTitle: 'GIÁM ĐỐC BAN QUẢN LÝ',
    signerName: 'Nguyễn Văn A',
    noiDung: [
      {
        loai: 'doan_van',
        tieu_de: '1. Tên dự án và Chủ đầu tư:',
        noi_dung: 'Dự án Xây dựng Trung tâm Dữ liệu và Phòng điều hành thông minh (IOC).',
      },
      {
        loai: 'doan_van',
        tieu_de: '2. Quy mô đầu tư và Thiết kế kỹ thuật:',
        noi_dung: 'Trang bị 08 tủ rack tiêu chuẩn Tier 3, đường truyền cáp quang băng thông cao dự phòng kép, màn hình hiển thị chuyên dụng 55 inch.',
      },
      {
        loai: 'doan_van',
        tieu_de: '3. Tổng mức đầu tư và Nguồn vốn:',
        noi_dung: 'Tổng dự toán: 1.850.000.000 đồng (Một tỷ tám trăm năm mươi triệu đồng) từ nguồn vốn đầu tư công và vốn hợp pháp khác.',
      },
      {
        loai: 'doan_van',
        tieu_de: '4. Thời gian và Tiến độ thực hiện:',
        noi_dung: 'Thời gian thực hiện dự kiến trong 12 tháng kể từ ngày được cấp có thẩm quyền phê duyệt.',
      },
    ],
  },

  'PHƯƠNG ÁN': {
    id: 'PHƯƠNG ÁN',
    docType: 'PHƯƠNG ÁN',
    name: 'Phương án (Xử lý tình huống / Bảo đảm an toàn)',
    category: 'project',
    subject: 'Phương án Bảo đảm an ninh trật tự, an toàn phòng chống cháy nổ và vận hành số',
    directives: 'Kế hoạch phân công ca trực, lực lượng phản ứng nhanh và phương án xử lý sự cố kỹ thuật.',
    references: 'Luật Phòng cháy chữa cháy; Kế hoạch bảo đảm an toàn cơ quan;',
    recipients: 'Lãnh đạo đơn vị; Các tổ công tác; Lưu: VT.',
    signerTitle: 'THỦ TRƯỞNG ĐƠN VỊ',
    signerName: 'Nguyễn Văn A',
    noiDung: [
      {
        loai: 'doan_van',
        tieu_de: '1. Mục tiêu và Nguyên tắc bố trí:',
        noi_dung: 'Bảo đảm an toàn tuyệt đối cho người và tài sản, duy trì hệ thống máy chủ và dịch vụ số hoạt động liên tục 24/7.',
      },
      {
        loai: 'doan_van',
        tieu_de: '2. Phân công lực lượng và Ca trực:',
        noi_dung: 'Bố trí 03 tổ trực luân phiên gồm lực lượng bảo vệ, kỹ thuật viên công nghệ và đại diện trực lãnh đạo cơ quan.',
      },
      {
        loai: 'doan_van',
        tieu_de: '3. Kịch bản ứng phó sự cố khẩn cấp:',
        noi_dung: 'Quy định các bước ngắt nguồn điện khu vực gặp sự cố, kích hoạt hệ thống báo động và chuyển hướng máy chủ dự phòng.',
      },
    ],
  },

  'QUY CHẾ': {
    id: 'QUY CHẾ',
    docType: 'QUY CHẾ',
    name: 'Quy chế (Quy chế làm việc / Quy định nội bộ)',
    category: 'project',
    subject: 'Quy chế Quản lý, sử dụng văn bản điện tử và chữ ký số trong hoạt động cơ quan',
    directives: 'Quy định quyền hạn, trách nhiệm của cán bộ, công chức trong quy trình soạn thảo, ký số và phát hành văn bản.',
    references: 'Nghị định số 30/2020/NĐ-CP; Luật Giao dịch điện tử;',
    recipients: 'Các phòng ban, đơn vị trực thuộc; Cán bộ, công chức, viên chức; Lưu: VT.',
    signerTitle: 'THỦ TRƯỞNG ĐƠN VỊ',
    signerName: 'Nguyễn Văn A',
    noiDung: [
      {
        loai: 'dieu',
        tieu_de: 'Điều 1. Phạm vi điều chỉnh và đối tượng áp dụng',
        noi_dung: 'Quy chế này quy định việc tạo lập, gửi nhận, xử lý, ký số và lưu trữ văn bản điện tử áp dụng cho toàn thể cán bộ, viên chức.',
      },
      {
        loai: 'dieu',
        tieu_de: 'Điều 2. Nguyên tắc quản lý và sử dụng chữ ký số',
        noi_dung: 'Chữ ký số cá nhân và chữ ký số cơ quan chỉ được sử dụng đúng thẩm quyền, nghiêm cấm bàn giao thiết bị chứng thư số cho người khác sử dụng.',
      },
      {
        loai: 'dieu',
        tieu_de: 'Điều 3. Trách nhiệm thi hành',
        noi_dung: 'Thủ trưởng các đơn vị trực thuộc chịu trách nhiệm kiểm tra, đôn đốc cán bộ chấp hành nghiêm túc Quy chế này./.',
      },
    ],
  },

  'BIÊN BẢN': {
    id: 'BIÊN BẢN',
    docType: 'BIÊN BẢN',
    name: 'Biên bản (Họp, bàn giao, kiểm tra)',
    category: 'project',
    subject: 'Biên bản Họp đánh giá tiến độ thực hiện nhiệm vụ công tác tháng và kiểm điểm trách nhiệm',
    directives: 'Ghi nhận đầy đủ diễn biến cuộc họp, các ý kiến phát biểu và kết luận của chủ tọa.',
    references: '',
    recipients: 'Thành viên dự họp; Lưu: VT.',
    signerTitle: 'THƯ KÝ CUỘC HỌP',
    signerName: 'Nguyễn Văn C',
    noiDung: [
      {
        loai: 'doan_van',
        tieu_de: '1. Thời gian, địa điểm:',
        noi_dung: 'Bắt đầu hồi 08 giờ 30 phút, ngày ... tháng ... năm 2026, tại Phòng họp số 1.',
      },
      {
        loai: 'doan_van',
        tieu_de: '2. Thành phần tham dự:',
        noi_dung: 'Chủ trì: Đồng chí Thủ trưởng cơ quan. Thư ký: Đồng chí Nguyễn Văn C. Cùng đại diện lãnh đạo các phòng, ban chức năng.',
      },
      {
        loai: 'doan_van',
        tieu_de: '3. Nội dung cuộc họp:',
        noi_dung: 'Sau khi nghe báo cáo tổng hợp và thảo luận dân chủ, tập thể cuộc họp thống nhất 100% thông qua các chỉ tiêu trọng tâm.',
      },
      {
        loai: 'doan_van',
        tieu_de: '',
        noi_dung: 'Cuộc họp kết thúc vào hồi 11 giờ 30 phút cùng ngày. Biên bản đã được đọc lại cho mọi người cùng nghe và thống nhất ký tên./.',
      },
    ],
  },

  // ==========================================
  // NHÓM MẪU ĐƠN HÀNH CHÍNH & DỊCH VỤ CÔNG (NGƯỜI DÂN & CÁN BỘ)
  // ==========================================
  'ĐƠN KIẾN NGHỊ': {
    id: 'ĐƠN KIẾN NGHỊ',
    docType: 'ĐƠN KIẾN NGHỊ',
    name: 'Đơn Kiến nghị / Phản ánh (Dành cho công dân)',
    category: 'citizen',
    subject: 'Đơn Kiến nghị về việc nâng cấp hệ thống chiếu sáng và thoát nước công cộng',
    directives: 'Người dân trình bày tâm tư, phản ánh thực tế về bất cập hạ tầng trên địa bàn để chính quyền xem xét giải quyết.',
    kinhGui: 'Ủy ban nhân dân cấp xã/phường nơi tiếp nhận kiến nghị',
    citizenName: 'Trần Thị Thu (Đại diện các hộ dân khu dân cư)',
    citizenIdCard: '02518200xxxx',
    citizenAddress: 'Số nhà 45, Đường Hùng Vương, Phường Nông Trang, TP Việt Trì, tỉnh Phú Thọ',
    recipients: 'Như kính gửi; Đại diện Tổ dân phố; Người làm đơn lưu.',
    signerTitle: 'NGƯỜI LÀM ĐƠN',
    signerName: 'Trần Thị Thu',
    noiDung: [
      {
        loai: 'doan_van',
        tieu_de: 'Họ và tên người làm đơn:',
        noi_dung: 'Trần Thị Thu, sinh năm 1982. Số CCCD: 02518200xxxx cấp tại Cục Cảnh sát QLHC về TTXH.',
      },
      {
        loai: 'doan_van',
        tieu_de: 'Nơi cư trú hiện nay:',
        noi_dung: 'Số nhà 45, Đường Hùng Vương, Tổ 12, Phường Nông Trang, thành phố Việt Trì, tỉnh Phú Thọ. Điện thoại: 0988.xxx.xxx.',
      },
      {
        loai: 'doan_van',
        tieu_de: 'Nội dung kiến nghị, phản ánh:',
        noi_dung: 'Hiện nay đoạn đường gom thuộc khu vực ngõ 15 bị ngập úng cục bộ sau mỗi đợt mưa lớn do hệ thống thoát nước bị tắc nghẽn, gây khó khăn cho việc đi lại của bà con và tiềm ẩn nguy cơ mất an toàn giao thông.',
      },
      {
        loai: 'doan_van',
        tieu_de: 'Đề nghị giải quyết:',
        noi_dung: 'Kính mong UBND phường sớm cử cán bộ chuyên môn kiểm tra thực tế hiện trường và chỉ đạo các bên liên quan khơi thông dòng chảy để bảo đảm vệ sinh môi trường.',
      },
      {
        loai: 'doan_van',
        tieu_de: 'Cam đoan:',
        noi_dung: 'Tôi xin cam đoan toàn bộ thông tin trình bày trên là đúng sự thật và xin hoàn toàn chịu trách nhiệm trước pháp luật về nội dung kiến nghị./.',
      },
    ],
  },

  'ĐƠN XIN XÁC NHẬN': {
    id: 'ĐƠN XIN XÁC NHẬN',
    docType: 'ĐƠN XIN XÁC NHẬN',
    name: 'Đơn xin Xác nhận hành chính (Cư trú / Hoàn cảnh)',
    category: 'citizen',
    subject: 'Đơn xin Xác nhận nơi cư trú và hoàn cảnh gia đình',
    directives: 'Công dân đề nghị chính quyền cấp xã/phường xác nhận lý lịch, nơi cư trú hoặc hoàn cảnh để hoàn thiện thủ tục hành chính.',
    kinhGui: 'Ủy ban nhân dân cấp xã/phường nơi đăng ký thường trú',
    citizenName: 'Lê Hoàng Nam',
    citizenIdCard: '02520400xxxx',
    citizenAddress: 'Khu phố 3, Phường Gia Cẩm, TP Việt Trì, tỉnh Phú Thọ',
    recipients: 'Như kính gửi; Người làm đơn lưu.',
    signerTitle: 'NGƯỜI LÀM ĐƠN',
    signerName: 'Lê Hoàng Nam',
    noiDung: [
      {
        loai: 'doan_van',
        tieu_de: 'Họ và tên:',
        noi_dung: 'Lê Hoàng Nam, sinh ngày 15/08/2004. Số CCCD: 02520400xxxx.',
      },
      {
        loai: 'doan_van',
        tieu_de: 'Hộ khẩu thường trú:',
        noi_dung: 'Khu phố 3, Phường Gia Cẩm, thành phố Việt Trì, tỉnh Phú Thọ.',
      },
      {
        loai: 'doan_van',
        tieu_de: 'Lý do xin xác nhận:',
        noi_dung: 'Để bổ sung hoàn thiện hồ sơ xét chính sách hỗ trợ học tập tại Trường Đại học Hùng Vương năm học 2026 - 2027.',
      },
      {
        loai: 'doan_van',
        tieu_de: 'Nội dung đề nghị xác nhận:',
        noi_dung: 'Kính mong Ủy ban nhân dân phường xác nhận tôi hiện đang sinh sống thường trú tại địa phương và gia đình chấp hành nghiêm chỉnh các chính sách của Nhà nước./.',
      },
    ],
  },

  'GIẤY GIỚI THIỆU': {
    id: 'GIẤY GIỚI THIỆU',
    docType: 'GIẤY GIỚI THIỆU',
    name: 'Giấy Giới thiệu (Cán bộ liên hệ công tác)',
    category: 'citizen',
    subject: 'Giấy Giới thiệu liên hệ công tác và phối hợp chuyển đổi số',
    directives: 'Giới thiệu cán bộ, viên chức đến làm việc tại cơ quan, đối tác liên quan.',
    kinhGui: 'Ủy ban nhân dân các huyện, thị xã, thành phố trên địa bàn',
    recipients: 'Như kính gửi; Cán bộ được cử đi; Lưu: VT.',
    signerTitle: 'HIỆU TRƯỞNG / THỦ TRƯỞNG',
    signerName: 'Nguyễn Văn A',
    noiDung: [
      {
        loai: 'doan_van',
        tieu_de: '',
        noi_dung: 'Ban Giám hiệu Trường Đại học Hùng Vương trân trọng giới thiệu:',
      },
      {
        loai: 'doan_van',
        tieu_de: 'Đồng chí:',
        noi_dung: 'Nguyễn Tiến Dũng, Chức vụ: Phó Giám đốc Trung tâm CNTT & Chuyển đổi số.',
      },
      {
        loai: 'doan_van',
        tieu_de: 'Được cử đến:',
        noi_dung: 'Làm việc với Quý cơ quan về việc khảo sát, phối hợp triển khai giải pháp chuẩn hóa thể thức văn bản số theo Nghị định 30/2020/NĐ-CP.',
      },
      {
        loai: 'doan_van',
        tieu_de: 'Thời hạn:',
        noi_dung: 'Giấy giới thiệu này có giá trị từ ngày ký đến hết ngày 30 tháng 11 năm 2026.',
      },
      {
        loai: 'doan_van',
        tieu_de: '',
        noi_dung: 'Kính mong Quý cơ quan tạo điều kiện thuận lợi để đồng chí hoàn thành tốt nhiệm vụ được giao./.',
      },
    ],
  },

  'GIẤY ỦY QUYỀN': {
    id: 'GIẤY ỦY QUYỀN',
    docType: 'GIẤY ỦY QUYỀN',
    name: 'Giấy Ủy quyền (Thực hiện thủ tục hành chính)',
    category: 'citizen',
    subject: 'Giấy Ủy quyền thực hiện thủ tục nộp và nhận kết quả hồ sơ hành chính',
    directives: 'Người ủy quyền bàn giao quyền hạn đại diện cho người được ủy quyền thực hiện thủ tục tại cơ quan hành chính.',
    kinhGui: 'Bộ phận Tiếp nhận và Trả kết quả thủ tục hành chính',
    citizenName: 'Hoàng Văn C',
    citizenIdCard: '02517500xxxx',
    citizenAddress: 'Phường Tiên Cát, thành phố Việt Trì, Phú Thọ',
    recipients: 'Như kính gửi; Bên ủy quyền; Bên được ủy quyền.',
    signerTitle: 'NGƯỜI ỦY QUYỀN',
    signerName: 'Hoàng Văn C',
    noiDung: [
      {
        loai: 'doan_van',
        tieu_de: '1. Bên ủy quyền (Bên A):',
        noi_dung: 'Họ và tên: Hoàng Văn C, CCCD: 02517500xxxx, Nơi cư trú: Phường Tiên Cát, thành phố Việt Trì, tỉnh Phú Thọ.',
      },
      {
        loai: 'doan_van',
        tieu_de: '2. Bên được ủy quyền (Bên B):',
        noi_dung: 'Họ và tên: Nguyễn Thị Mai, CCCD: 02518900xxxx, Quan hệ với người ủy quyền: Em ruột.',
      },
      {
        loai: 'doan_van',
        tieu_de: '3. Nội dung ủy quyền:',
        noi_dung: 'Đại diện Bên A trực tiếp nộp hồ sơ, ký nhận phiếu hẹn và nhận kết quả giải quyết thủ tục hành chính về đăng ký biến động đất đai.',
      },
      {
        loai: 'doan_van',
        tieu_de: '4. Cam kết:',
        noi_dung: 'Hai bên cam kết việc ủy quyền hoàn toàn tự nguyện và chịu hoàn toàn trách nhiệm trước pháp luật về nội dung ủy quyền này./.',
      },
    ],
  },

  'GIẤY NGHỈ PHÉP': {
    id: 'GIẤY NGHỈ PHÉP',
    docType: 'GIẤY NGHỈ PHÉP',
    name: 'Giấy Nghỉ phép (Cán bộ / Giảng viên / Công chức)',
    category: 'citizen',
    subject: 'Đơn xin nghỉ phép năm theo chế độ quy định',
    directives: 'Cán bộ trình bày lý do xin nghỉ phép và phương án bàn giao công việc trong thời gian nghỉ.',
    kinhGui: 'Ban Giám hiệu / Lãnh đạo đơn vị và Trưởng phòng Tổ chức cán bộ',
    recipients: 'Như kính gửi; Lưu: VT, TCCB.',
    signerTitle: 'NGƯỜI LÀM ĐƠN',
    signerName: 'Vũ Thị Thanh',
    noiDung: [
      {
        loai: 'doan_van',
        tieu_de: 'Tôi tên là:',
        noi_dung: 'Vũ Thị Thanh, Chức vụ: Chuyên viên Văn phòng.',
      },
      {
        loai: 'doan_van',
        tieu_de: 'Thời gian xin nghỉ:',
        noi_dung: 'Nghỉ 03 (ba) ngày, kể từ ngày ... đến hết ngày ... năm 2026.',
      },
      {
        loai: 'doan_van',
        tieu_de: 'Lý do xin nghỉ:',
        noi_dung: 'Giải quyết công việc gia đình.',
      },
      {
        loai: 'doan_van',
        tieu_de: 'Bàn giao công việc:',
        noi_dung: 'Trong thời gian nghỉ, tôi đã bàn giao toàn bộ công việc tiếp nhận văn bản cho đồng chí Nguyễn Thị Hương tạm thời phụ trách.',
      },
      {
        loai: 'doan_van',
        tieu_de: '',
        noi_dung: 'Kính mong Lãnh đạo đơn vị xem xét, phê duyệt./.',
      },
    ],
  },
};
