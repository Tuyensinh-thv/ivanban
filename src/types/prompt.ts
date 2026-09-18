/**
 * Thư viện Prompt & Hồ sơ Cơ quan Type Definitions
 * Hệ thống iVANBAN - Nghị định 30/2020/NĐ-CP
 */

export interface PromptVariable {
  key: string;
  label: string;
  defaultValue: string;
  placeholder?: string;
  type?: 'text' | 'textarea' | 'date' | 'select';
  options?: string[];
}

export interface PromptTemplate {
  id: number;
  title: string;
  group: string;
  groupId: number; // 1: Văn bản HC, 2: Tổng hợp & Phân tích, 3: Truyền thông & DVC, 4: Chuyên ngành
  category: string;
  categoryCode: string;
  docType: string; // 'Công văn' | 'Tờ trình' | 'Thông báo' | 'Báo cáo' | 'Kế hoạch' | 'Biên bản' | 'Quyết định' | 'Bản tin' | 'Khác'
  role: string;
  task: string;
  inputs: Array<{ key: string; value: string }>;
  requirements: string[];
  variables: PromptVariable[];
  templateText: string;
  rawPrompt: string;
  tags: string[];
}

export interface OrgProfile {
  ten_co_quan_chu_quan: string; // Cấp chủ quản (VD: UBND TỈNH PHÚ THỌ hoặc UBND HUYỆN ...)
  ten_co_quan: string;          // Tên đầy đủ (VD: ỦY BAN NHÂN DÂN XÃ TIÊN LỮ)
  cap_don_vi: 'xa' | 'phuong' | 'thi_tran' | 'huyen' | 'khac';
  ten_xa_phuong: string;        // Tên gọn: Xã Tiên Lữ
  ten_tinh_tp: string;          // Tên tỉnh/TP: Tỉnh Phú Thọ
  dia_danh: string;             // Địa danh hành chính: Tiên Lữ
  tru_so: string;               // Trụ sở: Thôn Tân Tiến, xã Tiên Lữ
  danh_sach_thon: string[];     // Danh sách các thôn/khu dân cư
  lanh_dao_ky: string;          // Tên lãnh đạo ký mặc định: Nguyễn Văn A
  chuc_danh_ky: string;         // Chức vụ: CHỦ TỊCH / KT. CHỦ TỊCH - PHÓ CHỦ TỊCH
  so_hieu_co_quan: string;      // Mã ký hiệu: UBND-VP, TTr-UBND, QĐ-UBND
  so_dien_thoai?: string;
  email_co_quan?: string;
}

export const DEFAULT_ORG_PROFILE: OrgProfile = {
  ten_co_quan_chu_quan: 'UBND TỈNH PHÚ THỌ',
  ten_co_quan: 'TRƯỜNG ĐẠI HỌC HÙNG VƯƠNG',
  cap_don_vi: 'khac',
  ten_xa_phuong: 'Trường Đại học Hùng Vương',
  ten_tinh_tp: 'Tỉnh Phú Thọ',
  dia_danh: 'Phú Thọ',
  tru_so: 'Đường Nguyễn Tất Thành, phường Nông Trang, TP Việt Trì, tỉnh Phú Thọ',
  danh_sach_thon: [
    'Khoa Kỹ thuật - Công nghệ',
    'Khoa Kinh tế & Quản trị',
    'Khoa Khoa học Xã hội & Du lịch',
    'Khoa Ngoại ngữ',
    'Khoa Nông - Lâm - Ngư',
    'Khoa Giáo dục Tiểu học & Mầm non',
    'Phòng Đào tạo',
    'Phòng Tổ chức - Cán bộ',
    'Phòng Kế hoạch - Tài chính',
    'Phòng Quản trị Đời sống',
    'Tổ Chuyển đổi số'
  ],
  lanh_dao_ky: 'Hoàng Công Kiên',
  chuc_danh_ky: 'HIỆU TRƯỞNG',
  so_hieu_co_quan: 'ĐHHV-TCCB',
  so_dien_thoai: '0210.399.4666',
  email_co_quan: 'contact@hvu.edu.vn'
};

export const TIEN_LU_ORG_PROFILE: OrgProfile = {
  ten_co_quan_chu_quan: 'UBND TỈNH PHÚ THỌ',
  ten_co_quan: 'ỦY BAN NHÂN DÂN XÃ TIÊN LỮ',
  cap_don_vi: 'xa',
  ten_xa_phuong: 'Xã Tiên Lữ',
  ten_tinh_tp: 'Tỉnh Phú Thọ',
  dia_danh: 'Tiên Lữ',
  tru_so: 'Thôn Tân Tiến, xã Tiên Lữ, tỉnh Phú Thọ',
  danh_sach_thon: [
    'Thôn Cây Phấn',
    'Thôn Quyết Tiến',
    'Thôn Đại Lữ',
    'Thôn Tân Lập',
    'Thôn Nghĩa An',
    'Thôn Sơn Bình',
    'Thôn Hoàng Chung',
    'Thôn Viên Luận',
    'Thôn Lục Thụ',
    'Thôn Đảnh',
    'Thôn Xuân Đán',
    'Thôn Nghĩa Lộ',
    'Thôn Vinh Quang',
    'Thôn Hộ Vệ',
    'Thôn Lai Châu',
    'Thôn Chùa',
    'Thôn Tân Tiến'
  ],
  lanh_dao_ky: 'Nguyễn Văn A',
  chuc_danh_ky: 'KT. CHỦ TỊCH - PHÓ CHỦ TỊCH',
  so_hieu_co_quan: 'UBND-VP',
  so_dien_thoai: '0210.xxx.xxxx',
  email_co_quan: 'ubnd.tienlu@phutho.gov.vn'
};
