export type DocumentType =
  | 'QUYẾT ĐỊNH'
  | 'CÔNG VĂN'
  | 'TỜ TRÌNH'
  | 'BÁO CÁO'
  | 'KẾ HOẠCH'
  | 'THÔNG BÁO'
  | 'GIẤY MỜI'
  | 'ĐỀ ÁN'
  | 'DỰ ÁN'
  | 'PHƯƠNG ÁN'
  | 'QUY CHẾ'
  | 'QUY ĐỊNH'
  | 'BIÊN BẢN'
  | 'ĐƠN KIẾN NGHỊ'
  | 'ĐƠN XIN XÁC NHẬN'
  | 'GIẤY GIỚI THIỆU'
  | 'GIẤY NGHỈ PHÉP'
  | 'GIẤY ỦY QUYỀN';

export interface ContentBlock {
  loai: 'dieu' | 'doan_van' | 'muc' | 'bang';
  tieu_de?: string;
  noi_dung: string;
  is_edited?: boolean;
  edit_reason?: string;
}

export interface Signer {
  chuc_danh: string;
  ten: string;
}

export interface ND30Document {
  co_quan_chu_quan?: string;
  co_quan_ban_hanh: string;
  so_ky_hieu: string;
  dia_danh_ngay_thang: string;
  ten_loai_van_ban?: string; // Để trống đối với Công văn
  trich_yeu: string;
  kinh_gui?: string;
  can_cu?: string[];
  noi_dung: ContentBlock[];
  noi_nhan: string[];
  chuc_danh_nguoi_ky: string;
  ten_nguoi_ky: string;
  nguoi_ky?: Signer[];
}

export interface LegalCitation {
  citation: string;
  status: 'valid' | 'warning' | 'invalid' | 'verified_source' | 'expired';
  source?: string;
  note: string;
}

export interface DocumentErrorItem {
  type: 'the_thuc' | 'chinh_ta' | 'phap_ly' | 'van_phong';
  severity: 'error' | 'warning' | 'suggestion' | 'critical';
  location: string;
  originalText: string;
  suggestedText: string;
  explanation: string;
}

export interface JurisdictionCheckResult {
  administrativeLevel: 'xa_phuong' | 'huyen_thanhpho' | 'tinh_so';
  isCompetent: boolean;
  riskLevel: 'safe' | 'warning' | 'violation';
  formAuthority: {
    isValid: boolean;
    rule: string;
    details: string;
  };
  signerAuthority: {
    isValid: boolean;
    rule: string;
    signerPrefix: string;
    details: string;
  };
  legalReferences: string[];
  recommendations: string[];
}

export interface AuditResult {
  summary: {
    totalIssues: number;
    theThucIssues: number;
    chinhTaIssues: number;
    phapLyIssues: number;
    vanPhongIssues: number;
    overallScore: number;
    conclusion: string;
  };
  errors: DocumentErrorItem[];
  citations: LegalCitation[];
  standard: ND30Document;
  optimized: ND30Document;
  originalText?: string;
  jurisdiction?: JurisdictionCheckResult;
}

export interface IncomingDispatchAnalysis {
  senderAgency: string;
  dispatchNumber: string;
  dispatchDate: string;
  subject: string;
  deadlines: string;
  keyDirectives: string[];
  suggestedReplyDoc: ND30Document;
}

export interface MunicipalConfig {
  co_quan_chu_quan: string;
  co_quan_ban_hanh: string;
  dia_danh: string;
  chuc_danh_nguoi_ky: string;
  ten_nguoi_ky: string;
  ban_quyen: string;
  noi_nhan_mac_dinh: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  suggestions?: string[];
}
