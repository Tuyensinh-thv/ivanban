'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Scale,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
  Columns2,
  Sparkles,
  BookOpen,
  Mail,
  Bot,
  RotateCcw,
  Check,
  Building,
  Calendar,
  Clock,
  Send,
  Printer,
  ChevronRight,
  ChevronDown,
  Menu,
  Search,
  Bell,
  Plus,
  ChevronLeft,
  LogOut,
  LogIn,
  Settings,
  Key,
  FolderOpen,
  Upload,
  Link2,
  ExternalLink,
  Trash2,
  Cloud,
  HardDrive,
} from 'lucide-react';

import { ND30Document, AuditResult } from '@/types/nd30';
import { DocumentA4Preview } from '@/components/DocumentA4Preview';
import { JurisdictionCheckSection } from '@/components/JurisdictionCheckSection';
import { DispatchReplyModal } from '@/components/DispatchReplyModal';
import { ReferenceRegulationsModal } from '@/components/ReferenceRegulationsModal';
import { VisualDiffModal } from '@/components/VisualDiffModal';
import { LegalAssistantModal } from '@/components/LegalAssistantModal';
import { DraftingStudio } from '@/components/DraftingStudio';
import { AuditStudio } from '@/components/AuditStudio';
import { DocumentUploadZone } from '@/components/DocumentUploadZone';
import { PromptLibrary } from '@/components/PromptLibrary';
import { OrgProfileSetup } from '@/components/OrgProfileSetup';
import { OrgProfile, DEFAULT_ORG_PROFILE, PromptTemplate } from '@/types/prompt';

interface LegalBase {
  id: string;
  code: string;
  title: string;
  issuer: string;
  summary: string;
  category: string;
}

interface Template {
  id: string;
  title: string;
  doc_type: string;
  agency: string;
  description: string;
  sample_content?: string;
  drive_link?: string;
  user_email?: string;
  is_personal?: boolean;
  created_at?: string;
}

interface UserSession {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
  organization?: string;
  phone?: string;
  status: string;
}

interface GuestStatus {
  is_guest: boolean;
  can_generate: boolean;
  document_count: number;
  max_docs: number;
  remaining: number;
}

const SAMPLE_AUDIT_DOC = `ỦY BAN NHÂN DÂN PHƯỜNG NÔNG TRANG
Số: 45/QĐ-UBND
V/v Nâng bậc lương trước thời hạn đợt 1 năm 2026 cho cán bộ

CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
Phú Thọ, ngày 28 tháng 6 năm 2026

QUYẾT ĐỊNH
Về việc nâng bậc lương trước thời hạn đợt 1 năm 2026

Căn cứ Luật Tổ chức chính quyền địa phương ngày 19 tháng 6 năm 2015;
Căn cứ Nghị định số 110/2004/NĐ-CP ngày 08/4/2004 của Chính phủ về công tác văn thư;
Xét đề nghị của Văn phòng UBND phường Nông Trang.

QUYẾT ĐỊNH:
Điều 1. Nâng bậc lương chước thời hạn 06 tháng đối với các cán bộ công chức có tên trong danh sách do hoàn thành suất sắc nhiệm vụ.
Điều 2. Cán bộ công chức được hưởng bậc lương mới từ ngày 01/7/2026.
Điều 3. Quyết định này có hiệu lực từ ngày kí.

Nơi nhận:
- UBND tỉnh Phú Thọ (để b/c)
- UBND Thành phố Việt Trì (để biết)
- Lưu: VT.

TL. CHỦ TỊCH
Nguyễn Văn A`;

export default function Home() {
  const [activeTab, setActiveTab] = useState<'draft' | 'audit' | 'templates' | 'legal_bases' | 'standards' | 'keys' | 'personal_templates' | 'prompt_library' | 'org_profile'>('draft');
  const [docType, setDocType] = useState('decision');
  const [isGenerating, setIsGenerating] = useState(false);
  const [legalBases, setLegalBases] = useState<LegalBase[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);

  // Org Profile & Prompt states
  const [orgProfile, setOrgProfile] = useState<OrgProfile>(DEFAULT_ORG_PROFILE);
  const [selectedPromptForDraft, setSelectedPromptForDraft] = useState<PromptTemplate | null>(null);
  const [selectedRenderedPrompt, setSelectedRenderedPrompt] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ivanban_org_profile');
      if (saved) {
        try {
          setOrgProfile(JSON.parse(saved));
        } catch {
          // fallback
        }
      }
    }
  }, []);

  const handleUsePromptInDrafting = (
    template: PromptTemplate,
    renderedPrompt: string,
    variableValues: Record<string, string>
  ) => {
    setSelectedPromptForDraft(template);
    setSelectedRenderedPrompt(renderedPrompt);
    setActiveTab('draft');
  };

  // Personal Templates State (cho Cán bộ sau khi đăng nhập)
  const [personalTab, setPersonalTab] = useState<'upload' | 'drive'>('upload');
  const [newTemplateTitle, setNewTemplateTitle] = useState('');
  const [newTemplateDocType, setNewTemplateDocType] = useState('decision');
  const [newTemplateDriveLink, setNewTemplateDriveLink] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [newTemplateExtractedContent, setNewTemplateExtractedContent] = useState('');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [templateSaveSuccess, setTemplateSaveSuccess] = useState('');
  const [templateSaveError, setTemplateSaveError] = useState('');
  const [selectedPersonalTemplateId, setSelectedPersonalTemplateId] = useState<string>('');

  // Auth & Guest states
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [guestStatus, setGuestStatus] = useState<GuestStatus>({
    is_guest: true,
    can_generate: true,
    document_count: 0,
    max_docs: 1,
    remaining: 1,
  });

  // Modal states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showRegulationsModal, setShowRegulationsModal] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [showDiffModal, setShowDiffModal] = useState(false);
  const [showToolsDropdown, setShowToolsDropdown] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regOrg, setRegOrg] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  // Document Draft Form
  const [agency, setAgency] = useState('TRƯỜNG ĐẠI HỌC HÙNG VƯƠNG');
  const [docSubject, setDocSubject] = useState('');
  const [docDate, setDocDate] = useState('Phú Thọ, ngày ... tháng ... năm 2026');
  const [docDetails, setDocDetails] = useState('');
  const [draftedND30, setDraftedND30] = useState<ND30Document | null>(null);

  // Audit Tab states
  const [auditInputText, setAuditInputText] = useState(SAMPLE_AUDIT_DOC);
  const [auditRefText, setAuditRefText] = useState('');
  const [auditLevel, setAuditLevel] = useState<'xa_phuong' | 'huyen_thanhpho' | 'tinh_so'>('xa_phuong');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [selectedAuditVersion, setSelectedAuditVersion] = useState<'standard' | 'optimized'>('standard');
  const [highlightEdits, setHighlightEdits] = useState(true);

  const documentTypes = [
    { id: 'decision', name: 'Quyết định (Cá biệt)', icon: '⚖️', desc: 'Ban hành quy định, khen thưởng, bổ nhiệm, thành lập ban...' },
    { id: 'dispatch', name: 'Công văn hành chính', icon: '✉️', desc: 'Trao đổi công việc, hướng dẫn chuyên môn, báo cáo cấp trên...' },
    { id: 'statement', name: 'Tờ trình đề xuất', icon: '📝', desc: 'Đề xuất phê duyệt kế hoạch, dự toán, chính sách mới...' },
    { id: 'notice', name: 'Thông báo nội bộ & công văn', icon: '📢', desc: 'Thông báo kết luận, lịch công tác, sự kiện...' },
    { id: 'plan', name: 'Kế hoạch công tác', icon: '📅', desc: 'Kế hoạch năm học, đào tạo, nghiên cứu khoa học...' },
    { id: 'minutes', name: 'Biên bản cuộc họp / Hội đồng', icon: '📋', desc: 'Ghi chép diễn biến họp, kiểm phiếu, đánh giá luận văn...' },
  ];

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated && data.user) {
        setCurrentUser(data.user);
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    }
  };

  const fetchGuestStatus = async () => {
    try {
      const res = await fetch('/api/guest/check');
      const data = await res.json();
      setGuestStatus(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    async function init() {
      await fetchSession();
      await fetchGuestStatus();

      try {
        const res = await fetch('/api/legal-bases');
        const json = await res.json();
        if (json.success) {
          setLegalBases(json.data);
          setDbConnected(true);
        } else {
          setDbConnected(false);
        }
      } catch {
        setDbConnected(false);
      }

      try {
        const resTpl = await fetch('/api/templates');
        const jsonTpl = await resTpl.json();
        if (jsonTpl.success) {
          setTemplates(jsonTpl.data);
        }
      } catch {
        // ignore
      }
    }
    init();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();

      if (!data.success) {
        setLoginError(data.error || 'Đăng nhập không thành công');
      } else {
        setCurrentUser(data.user);
        setShowLoginModal(false);
        setLoginEmail('');
        setLoginPassword('');
        await fetchGuestStatus();
      }
    } catch {
      setLoginError('Lỗi kết nối máy chủ');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');
    setRegLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: regFullName,
          email: regEmail,
          phone: regPhone,
          organization: regOrg,
          password: regPassword,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        setRegError(data.error || 'Đăng ký không thành công');
      } else {
        setRegSuccess(data.message || 'Đăng ký thành công! Đang chờ Quản trị viên phê duyệt.');
        setTimeout(() => {
          setShowRegisterModal(false);
          setRegSuccess('');
          setShowLoginModal(true);
        }, 3000);
      }
    } catch {
      setRegError('Lỗi kết nối máy chủ');
    } finally {
      setRegLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setCurrentUser(null);
    await fetchGuestStatus();
  };

  const handleSavePersonalTemplate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setTemplateSaveError('');
    setTemplateSaveSuccess('');

    if (!newTemplateTitle.trim()) {
      setTemplateSaveError('Vui lòng nhập tên hoặc trích yếu của mẫu văn bản');
      return;
    }

    if (personalTab === 'drive' && !newTemplateDriveLink.trim()) {
      setTemplateSaveError('Vui lòng dán đường link Google Drive');
      return;
    }

    setIsSavingTemplate(true);
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTemplateTitle.trim(),
          doc_type: newTemplateDocType,
          description: newTemplateDescription.trim() || (personalTab === 'drive' ? `Tài liệu Google Drive: ${newTemplateDriveLink}` : 'Mẫu văn bản do cán bộ tải lên làm căn cứ'),
          sample_content: newTemplateExtractedContent,
          drive_link: personalTab === 'drive' ? newTemplateDriveLink.trim() : undefined,
          is_personal: true,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setTemplateSaveError(data.error || 'Lỗi khi lưu mẫu văn bản');
      } else {
        setTemplateSaveSuccess('✅ Đã lưu mẫu văn bản vào kho cá nhân thành công! Hệ thống sẽ dùng mẫu này làm căn cứ khi xây dựng văn bản.');
        setNewTemplateTitle('');
        setNewTemplateDriveLink('');
        setNewTemplateDescription('');
        setNewTemplateExtractedContent('');
        // Refresh templates list
        const resTpl = await fetch('/api/templates');
        const jsonTpl = await resTpl.json();
        if (jsonTpl.success) {
          setTemplates(jsonTpl.data);
        }
      }
    } catch {
      setTemplateSaveError('Lỗi kết nối khi lưu mẫu văn bản');
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handleDeletePersonalTemplate = async (id: string) => {
    if (!confirm('Đồng chí có chắc chắn muốn xóa mẫu văn bản cá nhân này khỏi kho căn cứ?')) return;
    try {
      const res = await fetch(`/api/templates?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setTemplates(prev => prev.filter(t => t.id !== id));
      } else {
        alert(data.error || 'Lỗi khi xóa mẫu');
      }
    } catch {
      alert('Lỗi kết nối khi xóa');
    }
  };

  const handleApplyPersonalTemplateToDraft = (tpl: Template) => {
    setDocType(tpl.doc_type);
    if (tpl.title) setDocSubject(tpl.title);
    if (tpl.sample_content) {
      setDocDetails(prev => prev ? `${prev}\n\n[Căn cứ theo mẫu ${tpl.title}]:\n${tpl.sample_content}` : (tpl.sample_content || ''));
    }
    setSelectedPersonalTemplateId(tpl.id);
    setActiveTab('draft');
  };

  const handleDraftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check Guest limit
    if (!currentUser) {
      const checkRes = await fetch('/api/guest/check');
      const checkData = await checkRes.json();
      if (!checkData.can_generate) {
        setShowLimitModal(true);
        return;
      }
    }

    setIsGenerating(true);

    if (!currentUser) {
      await fetch('/api/guest/increment', { method: 'POST' });
      await fetchGuestStatus();
    }

    setTimeout(() => {
      setIsGenerating(false);
      const isCongVan = docType === 'dispatch';
      const typeName = isCongVan ? '' : docType === 'decision' ? 'QUYẾT ĐỊNH' : docType === 'statement' ? 'TỜ TRÌNH' : 'BÁO CÁO';
      
      const newDoc: ND30Document = {
        co_quan_chu_quan: agency.includes('TRƯỜNG') ? 'BỘ GIÁO DỤC VÀ ĐÀO TẠO' : 'UBND TỈNH PHÚ THỌ',
        co_quan_ban_hanh: agency || 'TRƯỜNG ĐẠI HỌC HÙNG VƯƠNG',
        so_ky_hieu: isCongVan ? 'Số:    /ĐHHV-VP' : 'Số:    /QĐ-ĐHHV',
        dia_danh_ngay_thang: docDate || 'Phú Thọ, ngày ... tháng ... năm 2026',
        ten_loai_van_ban: typeName,
        trich_yeu: docSubject || 'Về việc triển khai nhiệm vụ công tác chuyên môn',
        kinh_gui: isCongVan ? 'Ủy ban nhân dân tỉnh Phú Thọ' : '',
        can_cu: [
          'Căn cứ Luật Giáo dục đại học ngày 18 tháng 6 năm 2012; Luật sửa đổi, bổ sung một số điều của Luật Giáo dục đại học ngày 19 tháng 11 năm 2018;',
          'Căn cứ Nghị định số 30/2020/NĐ-CP ngày 05 tháng 3 năm 2020 của Chính phủ về công tác văn thư;',
          'Căn cứ chức năng, quyền hạn và nhiệm vụ của cơ quan theo quy định hiện hành;',
          'Xét đề nghị của bộ phận chuyên môn.',
        ],
        noi_dung: [
          {
            loai: 'dieu',
            tieu_de: isCongVan ? '' : 'Điều 1.',
            noi_dung: docDetails || 'Triển khai thực hiện nhiệm vụ công tác theo đúng nội dung kế hoạch đã đề ra, bảo đảm tiến độ và chất lượng theo quy định.',
          },
          {
            loai: 'dieu',
            tieu_de: isCongVan ? '' : 'Điều 2.',
            noi_dung: 'Quyết định này có hiệu lực thi hành kể từ ngày ký ban hành. Các bộ phận, đơn vị và cá nhân có liên quan chịu trách nhiệm thi hành Quyết định này./.',
          },
        ],
        noi_nhan: ['Như Điều 2;', 'Ban Giám hiệu;', 'Lưu: VT, TH.'],
        chuc_danh_nguoi_ky: 'HIỆU TRƯỞNG',
        ten_nguoi_ky: 'PGS.TS Nguyễn Văn A',
      };

      setDraftedND30(newDoc);
    }, 1000);
  };

  const handleRunAudit = async () => {
    if (!auditInputText.trim()) {
      alert('Vui lòng nhập nội dung văn bản cần rà soát.');
      return;
    }

    try {
      setIsAuditing(true);
      const res = await fetch('/api/document/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText: auditInputText,
          referenceText: auditRefText,
        }),
      });

      if (!res.ok) {
        throw new Error('Lỗi từ máy chủ khi rà soát');
      }

      const data: AuditResult = await res.json();
      data.originalText = auditInputText;
      setAuditResult(data);
    } catch (err: any) {
      alert('Lỗi rà soát văn bản: ' + err.message);
    } finally {
      setIsAuditing(false);
    }
  };

  const activeAuditDoc = auditResult
    ? selectedAuditVersion === 'standard'
      ? auditResult.standard
      : auditResult.optimized
    : null;

  return (
    <div className="h-screen flex flex-col bg-slate-100 text-slate-900 font-sans overflow-hidden">
      {/* 1. TOP HEADER (Dark Navy - Style Cổng Điều Hành Chuyển Đổi Số HVU) */}
      <header className="sticky top-0 z-40 bg-[#0B192C] text-white border-b border-slate-800 shadow-md flex-shrink-0">
        <div className="w-full px-3 sm:px-5 h-16 flex items-center justify-between gap-3">
          {/* Left: Brand */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-700 shadow-xs flex items-center justify-center p-1 flex-shrink-0">
              <Image src="/hvu-logo.png" alt="Logo Trường Đại học Hùng Vương" width={34} height={34} className="object-contain" priority />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white whitespace-nowrap uppercase">
                Trường Đại học Hùng Vương
              </span>
              <span className="text-xs text-amber-400 font-bold whitespace-nowrap tracking-wide uppercase">
                Hệ thống hỗ trợ xây dựng văn bản hành chính
              </span>
            </div>
          </div>

          {/* Center: Global Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    setActiveTab('templates');
                  }
                }}
                placeholder="Tìm kiếm mẫu văn bản, số hiệu, điều khoản NĐ 30, trích yếu... (Nhấn Enter)"
                className="w-full pl-9 pr-4 py-2 bg-slate-900/90 text-xs sm:text-sm text-white placeholder-slate-400 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Right: Notification + User Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            {/* Notification Bell */}
            <button
              type="button"
              className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Thông báo hệ thống"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            </button>

            {currentUser ? (
              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* User info */}
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-white whitespace-nowrap">{currentUser.full_name}</div>
                  <div className="text-[11px] text-slate-400 font-medium whitespace-nowrap">{currentUser.organization || 'Cán bộ HVU'}</div>
                </div>

                {/* Avatar circle */}
                <div className="w-9 h-9 rounded-xl bg-red-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                  {currentUser.full_name ? currentUser.full_name.charAt(0).toUpperCase() : 'U'}
                </div>

                {currentUser.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="hidden sm:flex px-2.5 py-1.5 rounded-lg bg-purple-900/60 hover:bg-purple-800 text-purple-200 text-xs font-bold border border-purple-700 transition-colors items-center gap-1 whitespace-nowrap"
                  >
                    <span>⚙️ Admin</span>
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="text-xs text-slate-300 hover:text-red-400 px-2.5 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 font-medium transition-colors whitespace-nowrap flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Thoát</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition-colors whitespace-nowrap"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors whitespace-nowrap"
                >
                  Đăng ký Cán bộ
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. BODY LAYOUT: LEFT SIDEBAR + RIGHT WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR (Dark Navy, matching image) */}
        <aside
          className={`bg-[#0d1b2a] text-slate-300 flex flex-col border-r border-slate-800 transition-all duration-200 flex-shrink-0 z-30 select-none ${
            isSidebarCollapsed ? 'w-[72px]' : 'w-64'
          }`}
        >
          {/* Navigation Links Scrollable */}
          <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4 text-xs font-medium scrollbar-thin scrollbar-thumb-slate-700">
            {/* Group 1: VĂN BẢN HÀNH CHÍNH */}
            <div>
              {!isSidebarCollapsed && (
                <div className="px-3 mb-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Văn bản hành chính
                </div>
              )}
              <div className="space-y-1">
                {/* 1. Soạn thảo văn bản mới */}
                <button
                  onClick={() => setActiveTab('draft')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors whitespace-nowrap text-left ${
                    activeTab === 'draft'
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  title="Soạn thảo văn bản mới"
                >
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  {!isSidebarCollapsed && <span>Soạn thảo văn bản mới</span>}
                </button>

                {/* 2. Soát lỗi văn bản */}
                <button
                  onClick={() => setActiveTab('audit')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors whitespace-nowrap text-left ${
                    activeTab === 'audit'
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  title="Soát lỗi văn bản theo Nghị định 30/2020"
                >
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    {!isSidebarCollapsed && <span>Soát lỗi văn bản</span>}
                  </div>
                  {!isSidebarCollapsed && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  )}
                </button>
              </div>
            </div>

            {/* Group: THƯ VIỆN PROMPT CẤP XÃ & HỒ SƠ */}
            <div>
              {!isSidebarCollapsed && (
                <div className="px-3 mb-1.5 text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Nghiệp vụ AI Cấp Xã</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded-full font-bold">200</span>
                </div>
              )}
              <div className="space-y-1">
                {/* 200 Prompt Nghiệp vụ AI */}
                <button
                  onClick={() => setActiveTab('prompt_library')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors whitespace-nowrap text-left ${
                    activeTab === 'prompt_library'
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  title="Thư viện 200 Prompt nghiệp vụ AI chuẩn hóa NĐ 30"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    {!isSidebarCollapsed && <span>Thư viện 200 Prompt</span>}
                  </div>
                  {!isSidebarCollapsed && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold px-1.5 py-0.2 rounded-full">
                      200
                    </span>
                  )}
                </button>

                {/* Hồ sơ Cơ quan */}
                <button
                  onClick={() => setActiveTab('org_profile')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors whitespace-nowrap text-left ${
                    activeTab === 'org_profile'
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  title="Thiết lập thông số cơ quan & danh sách thôn"
                >
                  <div className="flex items-center gap-3">
                    <Building className="w-4 h-4 text-sky-400 flex-shrink-0" />
                    {!isSidebarCollapsed && <span>Hồ sơ Cơ quan</span>}
                  </div>
                  {!isSidebarCollapsed && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {orgProfile.dia_danh}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Group 2: MẪU VĂN BẢN VÀ TRA CỨU */}
            <div>
              {!isSidebarCollapsed && (
                <div className="px-3 mb-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Mẫu văn bản và tra cứu
                </div>
              )}
              <div className="space-y-1">
                {/* 3. Văn bản mẫu */}
                <button
                  onClick={() => setActiveTab('templates')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors whitespace-nowrap text-left ${
                    activeTab === 'templates'
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  title="Kho văn bản mẫu hành chính"
                >
                  <div className="flex items-center gap-3">
                    <FolderOpen className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    {!isSidebarCollapsed && <span>Văn bản mẫu</span>}
                  </div>
                  {!isSidebarCollapsed && templates.length > 0 && (
                    <span className="text-[10px] bg-slate-700 text-slate-300 font-bold px-1.5 py-0.2 rounded-full">
                      {templates.length}
                    </span>
                  )}
                </button>

                {/* 3.1. Mẫu & Drive cá nhân (Chỉ hiển thị cho Cán bộ đã đăng nhập) */}
                {currentUser && (
                  <button
                    onClick={() => setActiveTab('personal_templates')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors whitespace-nowrap text-left ${
                      activeTab === 'personal_templates'
                        ? 'bg-blue-600 text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                    title="Kho Mẫu & Thư mục Google Drive cá nhân của cán bộ"
                  >
                    <div className="flex items-center gap-3">
                      <Cloud className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      {!isSidebarCollapsed && <span>Mẫu & Drive cá nhân</span>}
                    </div>
                    {!isSidebarCollapsed && (
                      <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold px-1.5 py-0.2 rounded-full">
                        {templates.filter(t => t.is_personal || t.user_email === currentUser.email).length}
                      </span>
                    )}
                  </button>
                )}

                {/* 4. Căn cứ pháp lý tham chiếu */}
                <button
                  onClick={() => setActiveTab('legal_bases')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors whitespace-nowrap text-left ${
                    activeTab === 'legal_bases'
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  title="Căn cứ pháp lý tham chiếu"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    {!isSidebarCollapsed && <span>Căn cứ pháp lý tham chiếu</span>}
                  </div>
                  {!isSidebarCollapsed && legalBases.length > 0 && (
                    <span className="text-[10px] bg-slate-700 text-slate-300 font-bold px-1.5 py-0.2 rounded-full">
                      {legalBases.length}
                    </span>
                  )}
                </button>

                {/* 5. Tra cứu Nghị định 30/2020 */}
                <button
                  onClick={() => setActiveTab('standards')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors whitespace-nowrap text-left ${
                    activeTab === 'standards'
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  title="Tra cứu toàn văn Nghị định 30/2020/NĐ-CP"
                >
                  <Scale className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  {!isSidebarCollapsed && <span>Tra cứu Nghị định 30/2020</span>}
                </button>
              </div>
            </div>

            {/* Quản trị hệ thống (Chỉ hiển thị khi Admin đăng nhập) */}
            {currentUser?.role === 'admin' && (
              <div className="pt-2 border-t border-slate-800/80">
                <Link
                  href="/admin"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-purple-300 hover:bg-purple-950/50 hover:text-purple-100 transition-colors whitespace-nowrap text-left"
                  title="Quản trị tài khoản & hệ thống"
                >
                  <Settings className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  {!isSidebarCollapsed && <span>Quản trị Cán bộ</span>}
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar Footer Controls */}
          <div className="p-2 border-t border-slate-800 space-y-1">
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs font-medium whitespace-nowrap"
              title={isSidebarCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
            >
              <ChevronLeft className={`w-4 h-4 flex-shrink-0 transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
              {!isSidebarCollapsed && <span>Thu gọn menu</span>}
            </button>

            {currentUser && (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors text-xs font-medium whitespace-nowrap"
                title="Đăng xuất khỏi hệ thống"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                {!isSidebarCollapsed && <span>Đăng xuất ({currentUser.full_name.split(' ').pop()})</span>}
              </button>
            )}
          </div>
        </aside>

        {/* RIGHT MAIN WORKSPACE */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden">
          {/* Scrollable Workspace View */}
          <div className="flex-1 overflow-y-auto min-w-0 flex flex-col">
            {/* Top KPI Stat Cards (Hidden on draft and audit tabs to maximize screen space) */}
            {activeTab !== 'draft' && activeTab !== 'audit' && (
              <div className="p-4 sm:p-5 bg-white border-b border-slate-200 shadow-2xs">
                <div className="max-w-[1600px] mx-auto">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {/* Card 1 */}
                    <div className="p-3.5 rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50/50 to-white flex items-center space-x-3 shadow-2xs">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">Văn bản xử lý</div>
                        <div className="text-base sm:text-lg font-black text-slate-900 leading-tight">Chuẩn NĐ 30</div>
                      </div>
                    </div>

                    {/* Card 2 */}
                    <div className="p-3.5 rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-50/50 to-white flex items-center space-x-3 shadow-2xs">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">Đạt chuẩn thể thức</div>
                        <div className="text-base sm:text-lg font-black text-emerald-700 leading-tight">100% Khổ A4</div>
                      </div>
                    </div>

                    {/* Card 3 */}
                    <div className="p-3.5 rounded-2xl border border-slate-200 bg-gradient-to-br from-purple-50/50 to-white flex items-center space-x-3 shadow-2xs">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">Bộ máy Rà soát</div>
                        <div className="text-base sm:text-lg font-black text-purple-700 leading-tight">Dual-Engine</div>
                      </div>
                    </div>

                    {/* Card 4 */}
                    <div className="p-3.5 rounded-2xl border border-slate-200 bg-gradient-to-br from-amber-50/50 to-white flex items-center space-x-3 shadow-2xs">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                        <Scale className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">Thẩm quyền ký</div>
                        <div className="text-base sm:text-lg font-black text-amber-700 leading-tight">Điều 13 NĐ 30</div>
                      </div>
                    </div>

                    {/* Card 5 */}
                    <div className="p-3.5 rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50/50 to-white flex items-center space-x-3 shadow-2xs col-span-2 sm:col-span-1">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">Quyền truy cập</div>
                        <div className="text-xs sm:text-sm font-bold text-indigo-700 leading-tight truncate">
                          {currentUser ? currentUser.full_name : 'Khách trải nghiệm'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick AI Action Chips */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lối tắt AI:</span>
                      <button
                        type="button"
                        onClick={() => setShowDispatchModal(true)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition border border-blue-200 shadow-2xs whitespace-nowrap"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Phúc đáp CV đến</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowRegulationsModal(true)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition border border-rose-200 shadow-2xs whitespace-nowrap"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Cẩm nang NĐ 30</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowLegalModal(true)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition border border-purple-200 shadow-2xs whitespace-nowrap"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        <span>Trợ lý Pháp chế AI</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('prompt_library')}
                        className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition border border-amber-200 shadow-2xs whitespace-nowrap"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Kho 200 Prompt Cấp Xã</span>
                      </button>
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium hidden md:block">
                      Hệ thống thẩm định & số hóa văn bản công vụ HVU • Chuẩn NĐ 30/2020
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* Main Content Area */}
          <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* TAB 1: SOẠN THẢO VĂN BẢN MỚI (DUAL-SCREEN STUDIO) */}
            {activeTab === 'draft' && (
              <DraftingStudio
                currentUser={currentUser}
                initialDocument={draftedND30}
                orgProfile={orgProfile}
                initialPromptTemplate={selectedPromptForDraft}
                initialRenderedPrompt={selectedRenderedPrompt}
                onNavigateToPromptLibrary={() => setActiveTab('prompt_library')}
                onNavigateToOrgProfile={() => setActiveTab('org_profile')}
              />
            )}

            {/* TAB 2: SOÁT LỖI VĂN BẢN (AUDIT STUDIO) */}
            {activeTab === 'audit' && (
              <AuditStudio
                currentUser={currentUser}
                onSelectDocumentForDraft={(doc) => {
                  setDraftedND30(doc);
                  setActiveTab('draft');
                }}
              />
            )}

        {/* TAB 3: MẪU VĂN BẢN HÀNH CHÍNH CHUẨN */}
        {activeTab === 'templates' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Kho Văn Bản Mẫu Hành Chính HVU</h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  Các mẫu văn bản hành chính quy chuẩn theo Nghị định 30/2020/NĐ-CP của Trường Đại học Hùng Vương.
                </p>
              </div>
              {currentUser && (
                <button
                  type="button"
                  onClick={() => setActiveTab('personal_templates')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Cloud className="w-4 h-4" />
                  <span>Kho Mẫu & Drive Cá Nhân Của Tôi</span>
                </button>
              )}
            </div>

            {searchQuery && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center justify-between">
                <span>Kết quả tìm kiếm cho: <strong>"{searchQuery}"</strong></span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-blue-600 hover:text-blue-800 font-bold ml-2 underline"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates
                .filter(tpl => !tpl.is_personal)
                .filter(tpl =>
                  !searchQuery ||
                  tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  tpl.doc_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  tpl.description.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((tpl) => (
                <div key={tpl.id} className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-white transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800 uppercase">
                        Mẫu {tpl.doc_type}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">{tpl.agency || 'HVU'}</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 leading-snug">{tpl.title}</h4>
                    <p className="text-xs text-slate-600 mt-1.5 line-clamp-3">{tpl.description}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setDocType(tpl.doc_type);
                        setDocSubject(tpl.title);
                        setActiveTab('draft');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Soạn theo mẫu này</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3.1: KHO MẪU & GOOGLE DRIVE CÁ NHÂN (DÀNH CHO CÁN BỘ ĐĂNG NHẬP) */}
        {activeTab === 'personal_templates' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-5xl mx-auto space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Cloud className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <h2 className="text-lg font-bold text-slate-900">
                  Kho Mẫu Văn Bản & Google Drive Cá Nhân của Cán Bộ
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600">
                Đồng chí có thể tải lên các tệp mẫu (.docx, .pdf, scan ảnh) hoặc kết nối đường link Google Drive để hệ thống AI lưu trữ làm căn cứ chuẩn khi xây dựng văn bản về sau.
              </p>
            </div>

            {/* Sub Tabs: Upload vs Drive Link */}
            <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-200 flex space-x-2 max-w-md">
              <button
                type="button"
                onClick={() => setPersonalTab('upload')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                  personalTab === 'upload' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Tải lên Tệp mẫu (.docx, .pdf, ảnh)</span>
              </button>
              <button
                type="button"
                onClick={() => setPersonalTab('drive')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                  personalTab === 'drive' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Link2 className="w-4 h-4" />
                <span>Kết nối Link Google Drive</span>
              </button>
            </div>

            {/* FORM CONTAINER */}
            <div className="p-5 rounded-2xl border border-blue-100 bg-blue-50/30 space-y-4">
              {templateSaveSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{templateSaveSuccess}</span>
                </div>
              )}
              {templateSaveError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{templateSaveError}</span>
                </div>
              )}

              {personalTab === 'upload' && (
                <div className="space-y-4">
                  <DocumentUploadZone
                    title="Kéo & thả tệp văn bản mẫu vào đây (.docx, .pdf, ảnh scan, .txt)"
                    subtitle="Hệ thống sẽ tự động bóc tách nội dung, trích xuất căn cứ và thể thức để lưu vào kho mẫu của đồng chí."
                    onTextExtracted={(text, fileInfo) => {
                      setNewTemplateExtractedContent(text);
                      if (!newTemplateTitle) {
                        setNewTemplateTitle(fileInfo.filename.replace(/\.[^/.]+$/, ''));
                      }
                      setTemplateSaveSuccess(`Đã bóc tách thành công nội dung tệp "${fileInfo.filename}" (${fileInfo.wordCount} từ). Vui lòng xác nhận thông tin bên dưới để lưu.`);
                    }}
                  />
                </div>
              )}

              {personalTab === 'drive' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Đường dẫn Google Drive (Thư mục hoặc Tệp mẫu của đồng chí) *
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        placeholder="https://drive.google.com/drive/folders/... hoặc https://docs.google.com/..."
                        value={newTemplateDriveLink}
                        onChange={(e) => setNewTemplateDriveLink(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-white text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Hệ thống sẽ liên kết và trích xuất làm nguồn tài liệu tham chiếu khi tạo văn bản theo đúng phong cách đơn vị của đồng chí.
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tên / Trích yếu Mẫu văn bản *
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Mẫu Quyết định khen thưởng Khoa CNTT 2026"
                    value={newTemplateTitle}
                    onChange={(e) => setNewTemplateTitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Loại văn bản hành chính *
                  </label>
                  <select
                    value={newTemplateDocType}
                    onChange={(e) => setNewTemplateDocType(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="decision">Quyết định (Cá biệt)</option>
                    <option value="dispatch">Công văn hành chính</option>
                    <option value="statement">Tờ trình đề xuất</option>
                    <option value="notice">Thông báo kết luận / chỉ đạo</option>
                    <option value="plan">Kế hoạch công tác</option>
                    <option value="minutes">Biên bản họp / Hội đồng</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Ghi chú hoặc Căn cứ đặc thù (AI sẽ dùng để trích dẫn)
                </label>
                <textarea
                  rows={2}
                  placeholder="VD: Mẫu có kèm căn cứ Nghị quyết Hội đồng trường số... hoặc theo quy chế chi tiêu nội bộ HVU."
                  value={newTemplateDescription}
                  onChange={(e) => setNewTemplateDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  disabled={isSavingTemplate}
                  onClick={handleSavePersonalTemplate}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSavingTemplate ? 'Đang lưu trữ...' : '💾 Lưu vào Kho Căn Cứ Mẫu Cán Bộ'}</span>
                </button>
              </div>
            </div>

            {/* LIST OF SAVED PERSONAL TEMPLATES */}
            <div>
              <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
                <span>Danh mục Mẫu & Google Drive Cá nhân đã lưu ({templates.filter(t => t.is_personal || t.user_email === currentUser?.email).length})</span>
              </h3>

              {templates.filter(t => t.is_personal || t.user_email === currentUser?.email).length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500 text-xs">
                  <Cloud className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
                  <p className="font-medium">Đồng chí chưa tải lên mẫu văn bản hoặc kết nối link Google Drive cá nhân nào.</p>
                  <p className="text-slate-400 mt-1">Hãy sử dụng khung phía trên để nạp mẫu đầu tiên của mình!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates
                    .filter(t => t.is_personal || t.user_email === currentUser?.email)
                    .map((tpl) => (
                    <div key={tpl.id} className="p-4 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/40 to-white shadow-2xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${tpl.drive_link ? 'bg-cyan-100 text-cyan-800' : 'bg-purple-100 text-purple-800'}`}>
                            {tpl.drive_link ? '📁 Google Drive' : '📄 Tệp Tải Lên'}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500 uppercase">
                            Mẫu {tpl.doc_type}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 leading-snug">{tpl.title}</h4>
                        {tpl.drive_link && (
                          <a
                            href={tpl.drive_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1 font-medium"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span className="truncate">{tpl.drive_link}</span>
                          </a>
                        )}
                        <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                          {tpl.description || (tpl.sample_content ? tpl.sample_content.slice(0, 140) + '...' : 'Không có mô tả chi tiết')}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => handleDeletePersonalTemplate(tpl.id)}
                          className="text-rose-600 hover:text-rose-800 text-xs font-medium flex items-center gap-1 p-1 hover:bg-rose-50 rounded"
                          title="Xóa mẫu này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyPersonalTemplateToDraft(tpl)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Áp dụng Soạn thảo</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3.2: CĂN CỨ PHÁP LÝ THAM CHIẾU */}
        {activeTab === 'legal_bases' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Kho Căn Cứ Pháp Lý Tham Chiếu HVU</h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  Hệ thống các Luật, Nghị định, Thông tư và Quy chế chuẩn của Trường Đại học Hùng Vương được lưu trong database để AI tự động trích xuất căn cứ khi soạn thảo.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRegulationsModal(true)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 whitespace-nowrap"
              >
                <BookOpen className="w-4 h-4" />
                <span>Cẩm nang 9 Thành phần NĐ 30</span>
              </button>
            </div>

            {searchQuery && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center justify-between">
                <span>Kết quả tìm kiếm cho: <strong>"{searchQuery}"</strong></span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-blue-600 hover:text-blue-800 font-bold ml-2 underline"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {legalBases
                .filter(base =>
                  !searchQuery ||
                  base.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  base.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  base.summary.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((base) => (
                <div key={base.id} className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-white transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                      {base.code}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">{base.issuer}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 mt-2 line-clamp-2">{base.title}</h4>
                  <p className="text-xs text-slate-600 mt-1.5 line-clamp-3 leading-relaxed">{base.summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: API KEYS */}
        {activeTab === 'keys' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Quản lý API Keys Xoay Vòng (Zero-Cost Architecture)</h2>
            <p className="text-sm text-slate-600 mb-6">
              Hệ thống sử dụng cơ chế Round-Robin thông minh. Khi một Key chạm hạn mức (Rate Limit / 429), iVanban sẽ tự động chuyển sang Key tiếp theo mà không làm gián đoạn người dùng.
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-slate-900">Google Gemini API (Miễn phí 15 RPM)</div>
                  <div className="text-xs text-slate-500">Mô hình: gemini-1.5-flash, gemini-1.5-pro, gemini-2.0-flash</div>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">Sẵn sàng nạp keys</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-slate-900">Groq Cloud API (Miễn phí siêu tốc)</div>
                  <div className="text-xs text-slate-500">Mô hình: llama-3.3-70b-versatile, mixtral-8x7b</div>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">Dự phòng tốc độ cao</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-slate-900">DeepSeek / OpenRouter (Free tier)</div>
                  <div className="text-xs text-slate-500">Mô hình: deepseek-chat, deepseek-r1</div>
                </div>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">Hỗ trợ suy luận sâu</span>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800">
              💡 <strong>Dành cho Quản trị viên:</strong> Bạn có thể quản lý, thêm/xóa API keys trực tiếp tại{' '}
              <Link href="/admin" className="font-bold underline">
                Trang Quản Trị Hệ Thống (/admin)
              </Link>
              .
            </div>
          </div>
        )}

        {/* TAB 5: NGHỊ ĐỊNH 30 */}
        {activeTab === 'standards' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto space-y-4">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Nghị định số 30/2020/NĐ-CP của Chính phủ</h2>
            <p className="text-sm text-slate-600 mb-4">
              Về công tác văn thư: Quy định chi tiết các thành phần thể thức bắt buộc, cỡ chữ, phông chữ Times New Roman và quy tắc trình bày.
            </p>
            <div className="space-y-3 text-sm text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-semibold text-slate-900">1. Quốc hiệu và Tiêu ngữ</div>
                <div className="text-xs text-slate-600 mt-1">Ô số 1, góc trên cùng bên phải. Tiêu ngữ có các từ viết hoa chữ cái đầu và gạch nối có cách chữ.</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-semibold text-slate-900">2. Tên cơ quan, tổ chức ban hành</div>
                <div className="text-xs text-slate-600 mt-1">Ô số 2, góc trên cùng bên trái. Tên cơ quan chủ quản (nếu có) viết chữ in hoa cỡ nhỏ hơn.</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-semibold text-slate-900">3. Số, ký hiệu của văn bản</div>
                <div className="text-xs text-slate-600 mt-1">Ô số 3, đặt canh giữa dưới tên cơ quan ban hành. Ví dụ: Số: .../QĐ-ĐHHV.</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowRegulationsModal(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" />
              <span>Xem Cẩm nang Bảng Tra cứu 9 Thành phần Thể thức Đầy đủ</span>
            </button>
          </div>
        )}

        {/* TAB 6: THƯ VIỆN 200 PROMPT NGHIỆP VỤ AI */}
        {activeTab === 'prompt_library' && (
          <PromptLibrary
            orgProfile={orgProfile}
            onNavigateToOrgProfile={() => setActiveTab('org_profile')}
            onUseInDrafting={handleUsePromptInDrafting}
          />
        )}

        {/* TAB 7: HỒ SƠ CƠ QUAN */}
        {activeTab === 'org_profile' && (
          <OrgProfileSetup
            currentProfile={orgProfile}
            onSave={(newProfile) => {
              setOrgProfile(newProfile);
            }}
            onNavigateToPromptLibrary={() => setActiveTab('prompt_library')}
            onNavigateToDrafting={() => setActiveTab('draft')}
          />
        )}
          </main>
          </div>

          {/* FIXED FOOTER (Cố định ở đáy màn hình 100VH, màu nền đồng bộ thanh lịch, bỏ viền khung rườm rà) */}
          <footer className="flex-shrink-0 z-20 bg-[#0d1b2a] border-t border-slate-800/90 px-4 sm:px-6 py-2.5 text-xs text-slate-300 shadow-md">
            <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-bold text-white tracking-wide whitespace-nowrap uppercase">
                  TRƯỜNG ĐẠI HỌC HÙNG VƯƠNG
                </span>
                <span className="text-slate-600 hidden sm:inline">|</span>
                <span className="text-slate-300 font-medium whitespace-nowrap">
                  Hệ thống hỗ trợ xây dựng văn bản hành chính
                </span>
              </div>
              <div className="text-slate-400 text-xs whitespace-nowrap">
                © 2026 HVU. Phát triển bởi Tổ Chuyển đổi số.
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* MODAL: ĐĂNG NHẬP */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold text-lg"
            >
              ✕
            </button>

            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-sm mx-auto flex items-center justify-center p-1.5 mb-2">
                <Image src="/hvu-logo.png" alt="HVU Logo" width={40} height={40} className="object-contain" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900">Đăng Nhập Cán Bộ</h3>
              <p className="text-xs text-slate-500 mt-0.5">Hệ thống Trợ lý Thể thức Văn bản Hành chính HVU</p>
            </div>

            {loginError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="canbo@hvu.edu.vn"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Mật khẩu</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors"
              >
                {loginLoading ? 'Đang xác thực...' : 'Đăng Nhập'}
              </button>
            </form>

            <div className="mt-5 text-center text-xs text-slate-500">
              Chưa có tài khoản cán bộ?{' '}
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  setShowRegisterModal(true);
                }}
                className="text-blue-600 font-bold hover:underline"
              >
                Đăng ký ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ĐĂNG KÝ TÀI KHOẢN CÁN BỘ */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowRegisterModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold text-lg"
            >
              ✕
            </button>

            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-sm mx-auto flex items-center justify-center p-1.5 mb-2">
                <Image src="/hvu-logo.png" alt="HVU Logo" width={40} height={40} className="object-contain" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900">Đăng Ký Tài Khoản Cán Bộ</h3>
              <p className="text-xs text-slate-500 mt-0.5">Dành cho Cán bộ, Giảng viên, Viên chức Trường ĐH Hùng Vương</p>
            </div>

            {regError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                {regError}
              </div>
            )}

            {regSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
                {regSuccess}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Họ và tên cán bộ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Email công vụ / cá nhân <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="canbo@hvu.edu.vn"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0912xxxxxx"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Cơ quan / Đơn vị công tác <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Phòng Hành chính - Tổng hợp / Khoa CNTT..."
                  value={regOrg}
                  onChange={(e) => setRegOrg(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Mật khẩu đăng nhập <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Tối thiểu 6 ký tự"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-800 leading-snug">
                ℹ️ <strong>Quy trình phê duyệt:</strong> Sau khi đăng ký, thông tin của bạn sẽ được gửi tới Quản trị viên để kích hoạt tài khoản cán bộ.
              </div>

              <button
                type="submit"
                disabled={regLoading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors"
              >
                {regLoading ? 'Đang gửi đăng ký...' : 'Hoàn Tất Đăng Ký'}
              </button>
            </form>

            <div className="mt-4 text-center text-xs text-slate-500">
              Đã có tài khoản?{' '}
              <button
                onClick={() => {
                  setShowRegisterModal(false);
                  setShowLoginModal(true);
                }}
                className="text-blue-600 font-bold hover:underline"
              >
                Đăng nhập
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CẢNH BÁO HẾT LƯỢT DÙNG THỬ */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-2xl mx-auto mb-3">
              ⚠️
            </div>
            <h3 className="font-extrabold text-lg text-slate-900">Đã Hết Lượt Dùng Thử Miễn Phí!</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Bạn đã tạo thành công <strong>01 văn bản dùng thử</strong> trên hệ thống iVanban HVU. Để tạo thêm các văn bản tiếp theo và sử dụng đầy đủ các tính năng, vui lòng đăng ký tài khoản Cán bộ - Viên chức.
            </p>

            <div className="mt-6 space-y-2">
              <button
                onClick={() => {
                  setShowLimitModal(false);
                  setShowRegisterModal(true);
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
              >
                Đăng Ký Tài Khoản Cán Bộ Ngay
              </button>
              <button
                onClick={() => {
                  setShowLimitModal(false);
                  setShowLoginModal(true);
                }}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Tôi đã có tài khoản (Đăng nhập)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PHÚC ĐÁP CÔNG VĂN ĐẾN */}
      <DispatchReplyModal
        isOpen={showDispatchModal}
        onClose={() => setShowDispatchModal(false)}
        onApplyToDrafting={(doc) => {
          setDraftedND30(doc);
          setActiveTab('draft');
        }}
      />

      {/* MODAL: CẨM NANG NGHỊ ĐỊNH 30 */}
      <ReferenceRegulationsModal
        isOpen={showRegulationsModal}
        onClose={() => setShowRegulationsModal(false)}
      />

      {/* MODAL: TRỢ LÝ PHÁP CHẾ */}
      <LegalAssistantModal
        isOpen={showLegalModal}
        onClose={() => setShowLegalModal(false)}
        contextText={activeAuditDoc ? JSON.stringify(activeAuditDoc) : docSubject}
      />

      {/* MODAL: SO SÁNH VISUAL DIFF */}
      {auditResult && activeAuditDoc && (
        <VisualDiffModal
          isOpen={showDiffModal}
          onClose={() => setShowDiffModal(false)}
          originalText={auditResult.originalText || auditInputText}
          modifiedDoc={activeAuditDoc}
          versionName={selectedAuditVersion === 'standard' ? 'Bản Chuẩn Hóa' : 'Bản Tối Ưu'}
        />
      )}
    </div>
  );
}
