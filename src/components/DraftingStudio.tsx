'use client';

import React, { useState, useEffect } from 'react';
import {
  Wand2,
  FileText,
  RotateCcw,
  Sparkles,
  Save,
  HelpCircle,
  Plus,
  Trash2,
  BookOpen,
  Send,
  Loader2,
  CheckCircle2,
  FileCheck,
  Mail,
  Scale,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  FileUp,
  Sliders,
  PanelLeftClose,
  PanelLeftOpen,
  Copy,
  Info,
  Layers,
  Link2,
  ExternalLink,
  FolderOpen,
} from 'lucide-react';
import { ND30Document, ContentBlock } from '../types/nd30';
import { DocumentA4Preview } from './DocumentA4Preview';
import { DOCUMENT_PRESETS } from '../data/documentPresets';

import { OrgProfile, PromptTemplate } from '../types/prompt';

interface DraftingStudioProps {
  currentUser?: any;
  initialDocument?: ND30Document | null;
  onSaveToPersonalDrive?: (doc: ND30Document) => void;
  orgProfile?: OrgProfile;
  initialPromptTemplate?: PromptTemplate | null;
  initialRenderedPrompt?: string;
  onNavigateToPromptLibrary?: () => void;
  onNavigateToOrgProfile?: () => void;
}

export const DraftingStudio: React.FC<DraftingStudioProps> = ({
  currentUser,
  initialDocument,
  onSaveToPersonalDrive,
  orgProfile,
  initialPromptTemplate,
  initialRenderedPrompt,
  onNavigateToPromptLibrary,
  onNavigateToOrgProfile,
}) => {
  // Selected Template ID & Reference Link (Top Control Bar)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('QUYẾT ĐỊNH');
  const [referenceLink, setReferenceLink] = useState<string>('');

  // Document Type & Core Fields
  const [docType, setDocType] = useState<string>('QUYẾT ĐỊNH');
  const [subject, setSubject] = useState<string>(
    DOCUMENT_PRESETS['QUYẾT ĐỊNH']?.subject || 'Về việc ban hành Kế hoạch Chuyển đổi số và Ứng dụng CNTT năm 2026'
  );
  const [directives, setDirectives] = useState<string>(
    DOCUMENT_PRESETS['QUYẾT ĐỊNH']?.directives || 'Ban hành Kế hoạch thực hiện chuyển đổi số toàn diện. Phân công các đơn vị triển khai.'
  );
  const [references, setReferences] = useState<string>(
    DOCUMENT_PRESETS['QUYẾT ĐỊNH']?.references || 'Luật Tổ chức chính quyền địa phương ngày 19/6/2015; Nghị định số 30/2020/NĐ-CP của Chính phủ;'
  );
  const [recipientsCustom, setRecipientsCustom] = useState<string>(
    DOCUMENT_PRESETS['QUYẾT ĐỊNH']?.recipients || 'Như Điều 3; UBND cấp trên; Lưu: VT.'
  );

  // Agency & Signer parameters (Prioritize OrgProfile)
  const [superiorAgency, setSuperiorAgency] = useState<string>(
    orgProfile?.ten_co_quan_chu_quan || 'UBND TỈNH PHÚ THỌ'
  );
  const [issuingAgency, setIssuingAgency] = useState<string>(
    orgProfile?.ten_co_quan || 'TRƯỜNG ĐẠI HỌC HÙNG VƯƠNG'
  );
  const [location, setLocation] = useState<string>(orgProfile?.dia_danh || 'Phú Thọ');
  const [signerTitle, setSignerTitle] = useState<string>(
    orgProfile?.chuc_danh_ky || 'HIỆU TRƯỞNG'
  );
  const [signerName, setSignerName] = useState<string>(
    currentUser?.full_name || orgProfile?.lanh_dao_ky || 'Hoàng Công Kiên'
  );
  const [kinhGui, setKinhGui] = useState<string>('Ủy ban nhân dân tỉnh Phú Thọ');

  // Citizen-specific fields
  const [citizenName, setCitizenName] = useState<string>('Trần Thị Thu');
  const [citizenIdCard, setCitizenIdCard] = useState<string>('02518200xxxx');
  const [citizenAddress, setCitizenAddress] = useState<string>('Số nhà 45, Đường Hùng Vương, Phường Nông Trang, TP Việt Trì');

  // Specific parameters for Tờ trình & Báo cáo & Đề án
  const [toTrinhBudget, setToTrinhBudget] = useState<string>('450.000.000 đồng');
  const [toTrinhTimeline, setToTrinhTimeline] = useState<string>('Từ quý IV năm 2026 đến quý II năm 2027');

  // Working Document
  const [document, setDocument] = useState<ND30Document>(() => {
    if (initialDocument) return initialDocument;
    const p = DOCUMENT_PRESETS['QUYẾT ĐỊNH'];
    const curSuperior = orgProfile?.ten_co_quan_chu_quan || 'UBND TỈNH PHÚ THỌ';
    const curIssuing = orgProfile?.ten_co_quan || 'TRƯỜNG ĐẠI HỌC HÙNG VƯƠNG';
    const curLocation = orgProfile?.dia_danh || 'Phú Thọ';
    const curSignerTitle = orgProfile?.chuc_danh_ky || 'HIỆU TRƯỞNG';
    const curSignerName = currentUser?.full_name || orgProfile?.lanh_dao_ky || 'Hoàng Công Kiên';

    return {
      co_quan_chu_quan: curSuperior,
      co_quan_ban_hanh: curIssuing,
      so_ky_hieu: 'Số:    /QĐ-UBND',
      dia_danh_ngay_thang: `${curLocation}, ngày ... tháng ... năm 2026`,
      ten_loai_van_ban: 'QUYẾT ĐỊNH',
      trich_yeu: p.subject,
      can_cu: p.references ? p.references.split(';').map((s) => s.trim()).filter(Boolean) : [],
      noi_dung: p.noiDung,
      noi_nhan: p.recipients.split(';').map((s) => s.trim()).filter(Boolean),
      chuc_danh_nguoi_ky: curSignerTitle,
      ten_nguoi_ky: curSignerName,
    };
  });

  // Sync OrgProfile changes
  useEffect(() => {
    if (orgProfile) {
      setSuperiorAgency(orgProfile.ten_co_quan_chu_quan);
      setIssuingAgency(orgProfile.ten_co_quan);
      setLocation(orgProfile.dia_danh);
      setSignerTitle(orgProfile.chuc_danh_ky);
      if (!currentUser?.full_name && orgProfile.lanh_dao_ky) {
        setSignerName(orgProfile.lanh_dao_ky);
      }
      setDocument((prev) => ({
        ...prev,
        co_quan_chu_quan: orgProfile.ten_co_quan_chu_quan,
        co_quan_ban_hanh: orgProfile.ten_co_quan,
        dia_danh_ngay_thang: `${orgProfile.dia_danh}, ngày ... tháng ... năm 2026`,
        chuc_danh_nguoi_ky: orgProfile.chuc_danh_ky,
        ten_nguoi_ky: currentUser?.full_name || orgProfile.lanh_dao_ky,
      }));
    }
  }, [orgProfile, currentUser]);

  // Sync Initial Prompt Template changes
  useEffect(() => {
    if (initialPromptTemplate) {
      if (initialPromptTemplate.title) {
        setSubject(initialPromptTemplate.title);
        setDocument((prev) => ({ ...prev, trich_yeu: initialPromptTemplate.title }));
      }
      if (initialRenderedPrompt) {
        setDirectives(initialRenderedPrompt);
      }
      // Determine docType from prompt
      const upperType = initialPromptTemplate.docType.toUpperCase();
      if (DOCUMENT_PRESETS[upperType]) {
        setDocType(upperType);
        setDocument((prev) => ({ ...prev, ten_loai_van_ban: upperType === 'CÔNG VĂN' ? '' : upperType }));
      } else if (upperType.includes('CÔNG VĂN')) {
        setDocType('CÔNG VĂN');
        setDocument((prev) => ({ ...prev, ten_loai_van_ban: '' }));
      } else if (upperType.includes('TỜ TRÌNH')) {
        setDocType('TỜ TRÌNH');
        setDocument((prev) => ({ ...prev, ten_loai_van_ban: 'TỜ TRÌNH' }));
      } else if (upperType.includes('THÔNG BÁO')) {
        setDocType('THÔNG BÁO');
        setDocument((prev) => ({ ...prev, ten_loai_van_ban: 'THÔNG BÁO' }));
      } else if (upperType.includes('BÁO CÁO')) {
        setDocType('BÁO CÁO');
        setDocument((prev) => ({ ...prev, ten_loai_van_ban: 'BÁO CÁO' }));
      } else if (upperType.includes('KẾ HOẠCH')) {
        setDocType('KẾ HOẠCH');
        setDocument((prev) => ({ ...prev, ten_loai_van_ban: 'KẾ HOẠCH' }));
      } else if (upperType.includes('QUYẾT ĐỊNH')) {
        setDocType('QUYẾT ĐỊNH');
        setDocument((prev) => ({ ...prev, ten_loai_van_ban: 'QUYẾT ĐỊNH' }));
      }
    }
  }, [initialPromptTemplate, initialRenderedPrompt]);

  // UI States
  const [isGenerating, setIsGenerating] = useState(false);
  const [interviewQuestion, setInterviewQuestion] = useState<string | null>(null);
  const [interviewAnswer, setInterviewAnswer] = useState<string>('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeLeftTab, setActiveLeftTab] = useState<'params' | 'chat' | 'import_md'>('params');

  // AI Interactive Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string }>>([
    {
      role: 'assistant',
      text: 'Chào đồng chí! Tôi là Trợ lý Soạn thảo AI chuẩn Nghị định 30/2020. Đồng chí có thể yêu cầu tôi chỉnh sửa bất kỳ nội dung nào (ví dụ: "Thêm Điều 3 về phân công nhiệm vụ", "Sửa lại căn cứ pháp lý...", "Bổ sung nơi nhận...").',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);

  // Markdown Import State
  const [markdownInput, setMarkdownInput] = useState('');
  const [isParsingMarkdown, setIsParsingMarkdown] = useState(false);

  useEffect(() => {
    if (initialDocument) {
      setDocument(initialDocument);
      if (initialDocument.ten_loai_van_ban) {
        setDocType(initialDocument.ten_loai_van_ban);
        setSelectedTemplateId(initialDocument.ten_loai_van_ban);
      } else {
        setDocType('CÔNG VĂN');
        setSelectedTemplateId('CÔNG VĂN');
      }
      if (initialDocument.trich_yeu) setSubject(initialDocument.trich_yeu);
      if (initialDocument.co_quan_chu_quan) setSuperiorAgency(initialDocument.co_quan_chu_quan);
      if (initialDocument.co_quan_ban_hanh) setIssuingAgency(initialDocument.co_quan_ban_hanh);
      if (initialDocument.chuc_danh_nguoi_ky) setSignerTitle(initialDocument.chuc_danh_nguoi_ky);
      if (initialDocument.ten_nguoi_ky) setSignerName(initialDocument.ten_nguoi_ky);
      if (initialDocument.kinh_gui) setKinhGui(initialDocument.kinh_gui);
    }
  }, [initialDocument]);

  // Apply Preset Document Type from Combobox
  const handleSelectTemplateOrType = (value: string) => {
    setSelectedTemplateId(value);

    const preset = DOCUMENT_PRESETS[value];
    if (preset) {
      setDocType(preset.docType);
      setSubject(preset.subject);
      setDirectives(preset.directives);
      setReferences(preset.references || '');
      setRecipientsCustom(preset.recipients);
      setSignerTitle(preset.signerTitle);
      setSignerName(preset.signerName);
      if (preset.kinhGui) setKinhGui(preset.kinhGui);
      if (preset.toTrinhBudget) setToTrinhBudget(preset.toTrinhBudget);
      if (preset.toTrinhTimeline) setToTrinhTimeline(preset.toTrinhTimeline);
      if (preset.citizenName) setCitizenName(preset.citizenName);
      if (preset.citizenIdCard) setCitizenIdCard(preset.citizenIdCard);
      if (preset.citizenAddress) setCitizenAddress(preset.citizenAddress);

      const isCongVan = value === 'CÔNG VĂN';
      const isCitizen = preset.category === 'citizen';

      setDocument({
        co_quan_chu_quan: isCitizen ? undefined : superiorAgency,
        co_quan_ban_hanh: isCitizen ? '' : issuingAgency,
        so_ky_hieu: isCitizen
          ? ''
          : `Số:    /${
              value === 'QUYẾT ĐỊNH'
                ? 'QĐ-UBND'
                : value === 'TỜ TRÌNH'
                ? 'TTr-UBND'
                : value === 'BÁO CÁO'
                ? 'BC-UBND'
                : value === 'KẾ HOẠCH'
                ? 'KH-UBND'
                : value === 'THÔNG BÁO'
                ? 'TB-UBND'
                : 'UBND-VP'
            }`,
        dia_danh_ngay_thang: `${location}, ngày ... tháng ... năm 2026`,
        ten_loai_van_ban: isCongVan ? '' : value,
        trich_yeu: preset.subject,
        kinh_gui: preset.kinhGui,
        can_cu: preset.references
          ? preset.references.split(';').map((s) => s.trim()).filter(Boolean)
          : [],
        noi_dung: preset.noiDung,
        noi_nhan: preset.recipients.split(';').map((s) => s.trim()).filter(Boolean),
        chuc_danh_nguoi_ky: preset.signerTitle,
        ten_nguoi_ky: preset.signerName,
      });
      return;
    }

    // fallback if not found in presets
    const isCongVan = value === 'CÔNG VĂN';
    setDocType(value);
    setDocument((prev) => ({
      ...prev,
      ten_loai_van_ban: isCongVan ? '' : value,
      kinh_gui: isCongVan || value === 'TỜ TRÌNH' || value === 'BÁO CÁO' ? kinhGui : undefined,
    }));
  };

  // AI Auto Draft
  const handleAiDraft = async () => {
    try {
      setIsGenerating(true);
      setInterviewQuestion(null);

      const additionalContext = [
        referenceLink ? `Tài liệu/Link tham khảo: ${referenceLink}` : '',
        interviewAnswer ? `Ý kiến bổ sung của Cán bộ: ${interviewAnswer}` : '',
        docType === 'TỜ TRÌNH' && toTrinhBudget ? `Dự toán kinh phí: ${toTrinhBudget}` : '',
        docType === 'TỜ TRÌNH' && toTrinhTimeline ? `Thời gian thực hiện: ${toTrinhTimeline}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      const payload = {
        mode: 'draft',
        documentType: docType,
        issuingAgency,
        superiorAgency,
        location,
        subject,
        directives: directives + (additionalContext ? `\n${additionalContext}` : ''),
        references,
        signerTitle,
        signerName,
        recipients: recipientsCustom
          .split(';')
          .map((r) => r.trim())
          .filter(Boolean),
      };

      const res = await fetch('/api/ai/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Lỗi từ máy chủ AI');
      }

      const draftedDoc: ND30Document = await res.json();
      setDocument(draftedDoc);
    } catch (err: any) {
      alert('Lỗi soạn thảo văn bản: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // AI Interview Question
  const handleAskInterview = () => {
    setInterviewQuestion(
      `Trợ lý AI HVU: Để văn bản "${subject}" chuẩn xác 100% theo quy định, xin đồng chí cho biết rõ: 1) Văn bản này áp dụng cho đối tượng/phòng ban cụ thể nào? 2) Căn cứ quy chế nội bộ hoặc quyết định phân công công tác nào? 3) Thời hạn báo cáo hoàn thành hoặc hiệu lực thi hành từ ngày nào?`
    );
  };

  // Chat AI Document Modification
  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isChatSending) return;

    const userText = chatInput.trim();
    setChatInput('');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChatMessages((prev) => [...prev, { role: 'user', text: userText, time }]);
    setIsChatSending(true);

    try {
      const res = await fetch('/api/ai/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'chat_edit',
          currentDocument: document,
          userInstruction: userText,
        }),
      });

      if (!res.ok) {
        throw new Error('Lỗi phản hồi từ máy chủ AI');
      }

      const data = await res.json();
      if (data.document) {
        setDocument(data.document);
      }

      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.message || 'Tôi đã cập nhật văn bản theo đúng yêu cầu của đồng chí.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `Đã xảy ra lỗi: ${err.message}. Vui lòng thử lại câu lệnh khác.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsChatSending(false);
    }
  };

  // Import from Markdown or Raw Text
  const handleParseMarkdown = async () => {
    if (!markdownInput.trim()) {
      alert('Vui lòng nhập hoặc dán nội dung văn bản');
      return;
    }

    try {
      setIsParsingMarkdown(true);
      const res = await fetch('/api/ai/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'parse_markdown',
          markdownText: markdownInput,
          docType,
        }),
      });

      if (!res.ok) throw new Error('Không thể phân tích văn bản');
      const parsedDoc: ND30Document = await res.json();
      setDocument(parsedDoc);
      if (parsedDoc.trich_yeu) setSubject(parsedDoc.trich_yeu);
      setActiveLeftTab('params');
      alert('Đã chuyển đổi văn bản thành công chuẩn Nghị định 30!');
    } catch (err: any) {
      alert('Lỗi phân tích: ' + err.message);
    } finally {
      setIsParsingMarkdown(false);
    }
  };

  // Quick Article / Clause manipulation
  const handleAddClause = () => {
    const clauseCount = document.noi_dung.filter((b) => b.loai === 'dieu').length;
    const newClause: ContentBlock = {
      loai: 'dieu',
      tieu_de: `Điều ${clauseCount + 1}.`,
      noi_dung: 'Nội dung điều khoản mới quy định quyền hạn và trách nhiệm...',
    };
    setDocument({
      ...document,
      noi_dung: [...document.noi_dung, newClause],
    });
  };

  const handleUpdateClause = (index: number, updatedBlock: ContentBlock) => {
    const updated = [...document.noi_dung];
    updated[index] = updatedBlock;
    setDocument({ ...document, noi_dung: updated });
  };

  const handleRemoveClause = (index: number) => {
    const updated = document.noi_dung.filter((_, i) => i !== index);
    setDocument({ ...document, noi_dung: updated });
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Prompt Banner or Active Org Status */}
      {(initialPromptTemplate || orgProfile) && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white px-4 py-2.5 rounded-2xl border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            {initialPromptTemplate ? (
              <>
                <span className="px-2.5 py-0.5 bg-blue-500 text-white rounded-lg font-mono font-bold text-[11px] shadow-xs">
                  Prompt #{initialPromptTemplate.id}
                </span>
                <span className="font-bold text-white line-clamp-1">
                  {initialPromptTemplate.title}
                </span>
                <span className="text-slate-400 hidden sm:inline">•</span>
                <span className="text-emerald-400 font-medium hidden sm:inline">
                  {initialPromptTemplate.category}
                </span>
              </>
            ) : (
              orgProfile && (
                <>
                  <span className="font-bold text-slate-200">
                    🏛️ Đang áp dụng hồ sơ: <strong className="text-white">{orgProfile.ten_co_quan}</strong>
                  </span>
                  <span className="text-slate-400 hidden sm:inline">•</span>
                  <span className="text-amber-300 hidden sm:inline">
                    {orgProfile.dia_danh} ({orgProfile.danh_sach_thon.length} thôn/khu)
                  </span>
                </>
              )
            )}
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToPromptLibrary && (
              <button
                type="button"
                onClick={onNavigateToPromptLibrary}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[11px] font-medium transition border border-white/10 flex items-center gap-1"
              >
                <Sparkles size={12} className="text-yellow-300" />
                {initialPromptTemplate ? 'Đổi Prompt' : 'Kho 200 Prompt'}
              </button>
            )}
            {onNavigateToOrgProfile && (
              <button
                type="button"
                onClick={onNavigateToOrgProfile}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[11px] font-medium transition border border-white/10"
              >
                ⚙️ Cấu hình xã/phường
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOP CONTROL BAR: COMBOBOX MẪU, LINK THAM KHẢO & NÚT TẠO VĂN BẢN NỔI BẬT */}
      {/* ========================================================================= */}
      <div className="bg-[#0f172a] text-white p-3 sm:p-4 rounded-2xl border border-slate-800 shadow-md flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Item 1: Combo Box Mẫu (Styling matching user photo) */}
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <label htmlFor="select-template-main" className="text-xs font-bold text-slate-300 whitespace-nowrap">
            Mẫu:
          </label>
          <div className="relative flex-1">
            <select
              id="select-template-main"
              value={selectedTemplateId}
              onChange={(e) => handleSelectTemplateOrType(e.target.value)}
              className="w-full text-xs font-bold py-2.5 pl-3.5 pr-8 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-hidden transition shadow-inner cursor-pointer"
            >
              <optgroup label="🏛️ Văn bản Chỉ đạo & Điều hành (Cốt lõi)" className="bg-slate-900 text-amber-300">
                <option value="QUYẾT ĐỊNH" className="text-white py-1">Quyết định (Cá biệt theo thẩm quyền)</option>
                <option value="CÔNG VĂN" className="text-white py-1">Công văn (Hành chính / Phúc đáp)</option>
                <option value="TỜ TRÌNH" className="text-white py-1">Tờ trình (Đề nghị phê duyệt chủ trương, dự toán)</option>
                <option value="BÁO CÁO" className="text-white py-1">Báo cáo (Định kỳ / Chuyên đề / Tổng kết)</option>
                <option value="KẾ HOẠCH" className="text-white py-1">Kế hoạch (Triển khai nhiệm vụ, đề án)</option>
                <option value="THÔNG BÁO" className="text-white py-1">Thông báo (Kết luận / Lịch công tác)</option>
                <option value="GIẤY MỜI" className="text-white py-1">Giấy mời (Dự họp / Hội nghị)</option>
              </optgroup>

              <optgroup label="📑 Đề án, Dự án & Quy chế chuyên đề" className="bg-slate-900 text-sky-300">
                <option value="ĐỀ ÁN" className="text-white py-1">Đề án (Chiến lược phát triển / Đào tạo)</option>
                <option value="DỰ ÁN" className="text-white py-1">Dự án (Đầu tư công / CNTT / Hạ tầng)</option>
                <option value="PHƯƠNG ÁN" className="text-white py-1">Phương án (Xử lý tình huống / Bảo đảm an toàn)</option>
                <option value="QUY CHẾ" className="text-white py-1">Quy chế (Quy chế làm việc / Quy định nội bộ)</option>
                <option value="BIÊN BẢN" className="text-white py-1">Biên bản (Họp, bàn giao, kiểm tra)</option>
              </optgroup>

              <optgroup label="📝 Mẫu Đơn & Dịch vụ công (Người dân & Cán bộ)" className="bg-slate-900 text-emerald-300">
                <option value="ĐƠN KIẾN NGHỊ" className="text-white py-1">Đơn kiến nghị / Phản ánh (Dành cho công dân)</option>
                <option value="ĐƠN XIN XÁC NHẬN" className="text-white py-1">Đơn xin xác nhận hành chính (Cư trú / Hoàn cảnh)</option>
                <option value="GIẤY GIỚI THIỆU" className="text-white py-1">Giấy giới thiệu (Cán bộ liên hệ công tác)</option>
                <option value="GIẤY ỦY QUYỀN" className="text-white py-1">Giấy ủy quyền (Thực hiện thủ tục hành chính)</option>
                <option value="GIẤY NGHỈ PHÉP" className="text-white py-1">Giấy nghỉ phép (Cán bộ / Giảng viên / Công chức)</option>
              </optgroup>
            </select>
          </div>
        </div>

        {/* Item 2: Link văn bản mẫu / Drive tham khảo */}
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Link2 className="w-3.5 h-3.5" />
            </div>
            <input
              type="url"
              value={referenceLink}
              onChange={(e) => setReferenceLink(e.target.value)}
              placeholder="Dán link Google Drive hoặc tài liệu mẫu tham khảo..."
              className="w-full text-xs py-2.5 pl-9 pr-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden transition shadow-inner"
            />
          </div>
        </div>

        {/* Item 3: Nút Tạo Văn Bản Hiển Thị Nổi Bật */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleAiDraft}
            className="w-full lg:w-auto px-6 py-2.5 bg-gradient-to-r from-red-600 via-red-700 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-extrabold text-xs rounded-xl shadow-lg hover:shadow-red-600/30 transition-all flex items-center justify-center space-x-2 border border-red-500/50 whitespace-nowrap active:scale-95"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-200" />
                <span>ĐANG SOẠN THẢO...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>TẠO VĂN BẢN (AI DRAFT)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN SPLIT-SCREEN WORKSPACE: DYNAMIC PARAMETERS (LEFT) VS A4 PAPER (RIGHT) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0 items-start">
        {/* LEFT COLUMN: Input Parameters, Chat AI & Article Editor */}
        <div
          className={`${
            sidebarCollapsed ? 'lg:col-span-1 hidden lg:block' : 'lg:col-span-5'
          } transition-all duration-300 flex flex-col space-y-4`}
        >
          {sidebarCollapsed ? (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xs text-slate-600 hover:text-blue-600 flex flex-col items-center gap-2"
              title="Mở rộng bảng thông số"
            >
              <PanelLeftOpen className="w-5 h-5 text-blue-600" />
              <span className="text-[10px] font-bold writing-mode-vertical">MỞ RỘNG THÔNG SỐ</span>
            </button>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              {/* Left Column Header with Tabs */}
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => setActiveLeftTab('params')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 ${
                      activeLeftTab === 'params'
                        ? 'bg-red-700 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-200/70'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Thông số {docType}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveLeftTab('chat')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 ${
                      activeLeftTab === 'chat'
                        ? 'bg-red-700 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-200/70'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat Lệnh AI</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveLeftTab('import_md')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 ${
                      activeLeftTab === 'import_md'
                        ? 'bg-red-700 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-200/70'
                    }`}
                  >
                    <FileUp className="w-3.5 h-3.5" />
                    <span>Nhập MD/Text</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setSidebarCollapsed(true)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                  title="Thu gọn bảng điều khiển để xem văn bản rộng hơn"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>

              {/* TAB CONTENT 1: DYNAMIC PARAMETERS FORM ADAPTED TO DOCTYPE */}
              {activeLeftTab === 'params' && (
                <div className="p-4 space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto">
                  {/* Notice of active document type */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-red-700" />
                      <span>Đang soạn: <strong className="text-red-700 uppercase">{docType}</strong></span>
                    </span>
                    <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded">
                      Chuẩn NĐ 30
                    </span>
                  </div>

                  {/* 1. Cơ quan & Địa danh OR Citizen Info */}
                  {docType.startsWith('ĐƠN') || docType.includes('ỦY QUYỀN') ? (
                    <div className="space-y-2 p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
                      <div className="text-[11px] font-bold text-emerald-900 uppercase flex items-center gap-1.5">
                        <span>👤 Thông tin người làm đơn / Người yêu cầu:</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Họ tên người làm đơn:</label>
                          <input
                            type="text"
                            value={citizenName}
                            onChange={(e) => {
                              setCitizenName(e.target.value);
                              setSignerName(e.target.value);
                              setDocument((prev) => ({ ...prev, ten_nguoi_ky: e.target.value }));
                            }}
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-900 font-bold bg-white"
                            placeholder="Trần Thị Thu"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Số CCCD / Định danh:</label>
                          <input
                            type="text"
                            value={citizenIdCard}
                            onChange={(e) => setCitizenIdCard(e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-900 bg-white"
                            placeholder="02518200xxxx"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Nơi cư trú / Địa chỉ liên hệ:</label>
                        <input
                          type="text"
                          value={citizenAddress}
                          onChange={(e) => setCitizenAddress(e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-900 bg-white"
                          placeholder="Số nhà 45, Đường Hùng Vương, Phường Nông Trang, TP Việt Trì..."
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Cơ quan cấp trên:</label>
                        <input
                          type="text"
                          value={superiorAgency}
                          onChange={(e) => {
                            setSuperiorAgency(e.target.value);
                            setDocument((prev) => ({ ...prev, co_quan_chu_quan: e.target.value }));
                          }}
                          className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-800"
                          placeholder="UBND TỈNH PHÚ THỌ"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Cơ quan ban hành:</label>
                        <input
                          type="text"
                          value={issuingAgency}
                          onChange={(e) => {
                            setIssuingAgency(e.target.value);
                            setDocument((prev) => ({ ...prev, co_quan_ban_hanh: e.target.value }));
                          }}
                          className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-800 font-bold"
                          placeholder="UBND PHƯỜNG NÔNG TRANG"
                        />
                      </div>
                    </div>
                  )}

                  {/* Kính gửi (dành cho Công văn, Tờ trình, Báo cáo, Giấy mời, Mẫu đơn) */}
                  {(docType === 'CÔNG VĂN' ||
                    docType === 'TỜ TRÌNH' ||
                    docType === 'BÁO CÁO' ||
                    docType === 'GIẤY MỜI' ||
                    docType.startsWith('ĐƠN') ||
                    docType.includes('ỦY QUYỀN')) && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {docType.startsWith('ĐƠN') || docType.includes('ỦY QUYỀN')
                          ? 'Kính gửi (Cơ quan có thẩm quyền tiếp nhận & giải quyết):'
                          : 'Kính gửi (Cơ quan/Cá nhân tiếp nhận):'}
                      </label>
                      <input
                        type="text"
                        value={kinhGui}
                        onChange={(e) => {
                          setKinhGui(e.target.value);
                          setDocument((prev) => ({ ...prev, kinh_gui: e.target.value }));
                        }}
                        className="w-full text-xs px-3 py-1.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-red-600 outline-hidden"
                        placeholder={
                          docType.startsWith('ĐƠN')
                            ? 'Ủy ban nhân dân phường Nông Trang (TP Việt Trì)'
                            : 'Ủy ban nhân dân thành phố Việt Trì'
                        }
                      />
                    </div>
                  )}

                  {/* 2. Trích yếu nội dung văn bản */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {docType === 'CÔNG VĂN'
                        ? 'Trích yếu công văn (V/v):'
                        : docType.startsWith('ĐƠN')
                        ? 'Tiêu đề đơn / Nội dung kiến nghị:'
                        : 'Trích yếu nội dung văn bản:'}
                    </label>
                    <textarea
                      rows={2}
                      value={subject}
                      onChange={(e) => {
                        setSubject(e.target.value);
                        setDocument((prev) => ({ ...prev, trich_yeu: e.target.value }));
                      }}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-red-600 outline-hidden transition"
                      placeholder={
                        docType === 'CÔNG VĂN'
                          ? 'V/v phối hợp tổ chức tập huấn kỹ năng số...'
                          : docType === 'TỜ TRÌNH'
                          ? 'V/v đề nghị phê duyệt chủ trương và kinh phí...'
                          : 'Về việc nâng bậc lương trước thời hạn đợt 1 năm 2026...'
                      }
                    />
                  </div>

                  {/* 3. Căn cứ pháp lý tham chiếu (Quyết định, Tờ trình, Kế hoạch, Đề án, Quy chế) */}
                  {(docType === 'QUYẾT ĐỊNH' ||
                    docType === 'TỜ TRÌNH' ||
                    docType === 'KẾ HOẠCH' ||
                    docType === 'ĐỀ ÁN' ||
                    docType === 'QUY CHẾ') && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                        <span>Căn cứ pháp lý tham chiếu:</span>
                        <span className="text-[10px] text-slate-400 italic">Cách nhau bằng dấu chấm phẩy (;)</span>
                      </label>
                      <textarea
                        rows={2}
                        value={references}
                        onChange={(e) => {
                          setReferences(e.target.value);
                          setDocument((prev) => ({
                            ...prev,
                            can_cu: e.target.value.split(';').map((s) => s.trim()).filter(Boolean),
                          }));
                        }}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-red-600 outline-hidden transition"
                        placeholder="Luật Tổ chức chính quyền địa phương 2015/2019; Nghị định 30/2020/NĐ-CP..."
                      />
                    </div>
                  )}

                  {/* 4. Nội dung yêu cầu / Chỉ đạo cụ thể theo từng loại văn bản */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {docType === 'QUYẾT ĐỊNH'
                        ? 'Nội dung chỉ đạo cụ thể (Đưa vào các Điều):'
                        : docType === 'CÔNG VĂN'
                        ? 'Nội dung công văn cần truyền đạt / đề nghị:'
                        : docType === 'TỜ TRÌNH'
                        ? 'Nội dung đề nghị phê duyệt (Sự cần thiết, Mục tiêu):'
                        : docType === 'BÁO CÁO'
                        ? 'Nội dung báo cáo kết quả & phương hướng:'
                        : docType.startsWith('ĐƠN')
                        ? 'Nội dung trình bày / Đề nghị giải quyết cụ thể:'
                        : 'Nội dung chi tiết yêu cầu:'}
                    </label>
                    <textarea
                      rows={3}
                      value={directives}
                      onChange={(e) => setDirectives(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-red-600 outline-hidden transition"
                      placeholder="Mô tả nội dung cụ thể để AI soạn thảo vào văn bản..."
                    />
                  </div>

                  {/* Bổ sung các trường riêng cho Tờ trình / Đề án / Dự án (Dự toán & Thời gian) */}
                  {(docType === 'TỜ TRÌNH' || docType === 'ĐỀ ÁN' || docType === 'DỰ ÁN') && (
                    <div className="grid grid-cols-2 gap-2 p-3 bg-amber-50/70 rounded-xl border border-amber-200">
                      <div>
                        <label className="block text-[11px] font-bold text-amber-900 mb-1">
                          {docType === 'DỰ ÁN' ? 'Tổng mức đầu tư dự án:' : 'Dự toán kinh phí:'}
                        </label>
                        <input
                          type="text"
                          value={toTrinhBudget}
                          onChange={(e) => setToTrinhBudget(e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-amber-300 bg-white text-slate-800"
                          placeholder="450.000.000 đồng"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-amber-900 mb-1">
                          {docType === 'DỰ ÁN' ? 'Tiến độ thực hiện:' : 'Thời gian thực hiện:'}
                        </label>
                        <input
                          type="text"
                          value={toTrinhTimeline}
                          onChange={(e) => setToTrinhTimeline(e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-amber-300 bg-white text-slate-800"
                          placeholder="Quý IV/2026 - Quý II/2027"
                        />
                      </div>
                    </div>
                  )}

                  {/* 5. Nơi nhận */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                      <span>Nơi nhận:</span>
                      <span className="text-[10px] text-red-600 font-semibold italic">(Tuyệt đối không ngoặc đơn)</span>
                    </label>
                    <input
                      type="text"
                      value={recipientsCustom}
                      onChange={(e) => {
                        setRecipientsCustom(e.target.value);
                        setDocument((prev) => ({
                          ...prev,
                          noi_nhan: e.target.value.split(';').map((s) => s.trim()).filter(Boolean),
                        }));
                      }}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-red-600 outline-hidden"
                      placeholder="Như Điều 4; UBND tỉnh Phú Thọ; Sở Nội vụ; Lưu: VT."
                    />
                  </div>

                  {/* 6. Người ký & Chức danh */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        {docType.startsWith('ĐƠN') || docType.includes('ỦY QUYỀN') ? 'Tư cách ký:' : 'Chức danh ký:'}
                      </label>
                      <input
                        type="text"
                        value={signerTitle}
                        onChange={(e) => {
                          setSignerTitle(e.target.value);
                          setDocument((prev) => ({ ...prev, chuc_danh_nguoi_ky: e.target.value }));
                        }}
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-800 font-bold uppercase"
                        placeholder={docType.startsWith('ĐƠN') ? 'NGƯỜI LÀM ĐƠN' : 'CHỦ TỊCH'}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Họ tên người ký:</label>
                      <input
                        type="text"
                        value={signerName}
                        onChange={(e) => {
                          setSignerName(e.target.value);
                          setDocument((prev) => ({ ...prev, ten_nguoi_ky: e.target.value }));
                        }}
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-800 font-bold"
                        placeholder="Nguyễn Văn A"
                      />
                    </div>
                  </div>

                  {/* Nút Phỏng vấn bổ sung */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={handleAskInterview}
                      className="text-xs text-slate-600 hover:text-red-700 font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition flex items-center space-x-1.5"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>AI Phỏng vấn bổ sung chi tiết</span>
                    </button>
                  </div>

                  {/* Interview Question Box */}
                  {interviewQuestion && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-2">
                      <p className="font-semibold text-amber-900">{interviewQuestion}</p>
                      <textarea
                        rows={2}
                        value={interviewAnswer}
                        onChange={(e) => setInterviewAnswer(e.target.value)}
                        placeholder="Nhập câu trả lời bổ sung tại đây rồi bấm 'TẠO VĂN BẢN'..."
                        className="w-full text-xs p-2 rounded-lg border border-amber-300 bg-white"
                      />
                    </div>
                  )}

                  {/* CHỈNH SỬA NHANH CÁC ĐIỀU / ĐOẠN VĂN BẢN */}
                  <div className="pt-3 border-t border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        {docType === 'QUYẾT ĐỊNH' ? 'Chỉnh sửa các Điều khoản:' : 'Chỉnh sửa các Đoạn văn bản:'}
                      </h3>
                      <button
                        type="button"
                        onClick={handleAddClause}
                        className="text-xs font-bold text-red-700 hover:text-red-900 flex items-center space-x-1 bg-red-50 px-2.5 py-1 rounded-lg transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{docType === 'QUYẾT ĐỊNH' ? 'Thêm Điều' : 'Thêm Đoạn'}</span>
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                      {document.noi_dung.map((block, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white transition space-y-1.5 text-xs shadow-2xs"
                        >
                          <div className="flex items-center justify-between">
                            <input
                              type="text"
                              value={block.tieu_de || ''}
                              onChange={(e) =>
                                handleUpdateClause(idx, { ...block, tieu_de: e.target.value })
                              }
                              placeholder={block.loai === 'dieu' ? 'Tiêu đề (VD: Điều 1.)' : 'Tiêu đề đoạn (nếu có)'}
                              className="font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-red-600 outline-hidden w-2/3"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveClause(idx)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded"
                              title="Xóa điều/đoạn này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <textarea
                            rows={2}
                            value={block.noi_dung}
                            onChange={(e) =>
                              handleUpdateClause(idx, { ...block, noi_dung: e.target.value })
                            }
                            className="w-full text-xs p-1.5 rounded-lg border border-slate-200 bg-white text-slate-800"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT 2: INTERACTIVE AI CHAT ASSISTANT */}
              {activeLeftTab === 'chat' && (
                <div className="flex flex-col h-[calc(100vh-250px)]">
                  <div className="p-3 bg-red-50/60 border-b border-red-100 text-[11px] text-red-900 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>
                      Nhập câu lệnh để AI sửa trực tiếp vào tờ A4 bên phải. Ví dụ: <em>"Bổ sung Điều 3 quy định trách nhiệm thi hành"</em>, <em>"Thêm căn cứ Nghị định 30/2020"</em>.
                    </span>
                  </div>

                  {/* Chat message list */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {chatMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex flex-col ${
                          msg.role === 'user' ? 'items-end' : 'items-start'
                        }`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-red-700 text-white rounded-br-xs'
                              : 'bg-slate-100 text-slate-800 rounded-bl-xs border border-slate-200 shadow-2xs'
                          }`}
                        >
                          <p>{msg.text}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
                      </div>
                    ))}
                    {isChatSending && (
                      <div className="flex items-center space-x-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200 w-fit">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                        <span>AI đang phân tích & cập nhật văn bản...</span>
                      </div>
                    )}
                  </div>

                  {/* Chat input box */}
                  <form
                    onSubmit={handleSendChatMessage}
                    className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Nhập yêu cầu sửa văn bản..."
                      disabled={isChatSending}
                      className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-red-600 outline-hidden"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || isChatSending}
                      className="p-2 rounded-xl bg-red-700 hover:bg-red-800 text-white disabled:opacity-50 transition"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}

              {/* TAB CONTENT 3: IMPORT FROM MARKDOWN / RAW TEXT */}
              {activeLeftTab === 'import_md' && (
                <div className="p-4 space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto text-xs">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-[11px] leading-relaxed">
                    <p className="font-bold flex items-center gap-1 mb-1">
                      <Info className="w-3.5 h-3.5 text-blue-600" />
                      Sao chép nội dung từ file .md hoặc file Word:
                    </p>
                    Dán toàn bộ văn bản hoặc ghi chú vào ô bên dưới. Hệ thống AI sẽ tự động phân tách Quốc hiệu, Căn cứ, Điều khoản, Nơi nhận để hiển thị lên khổ A4.
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Dán nội dung văn bản (.md hoặc văn bản thô):
                    </label>
                    <textarea
                      rows={12}
                      value={markdownInput}
                      onChange={(e) => setMarkdownInput(e.target.value)}
                      placeholder={`# QUYẾT ĐỊNH\nVề việc nâng lương...\n\nCăn cứ Luật Tổ chức chính quyền địa phương...\nĐiều 1. Nâng bậc lương trước thời hạn cho cán bộ...`}
                      className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-red-600 outline-hidden"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={isParsingMarkdown || !markdownInput.trim()}
                    onClick={handleParseMarkdown}
                    className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs transition flex items-center justify-center space-x-2 disabled:opacity-50 text-xs"
                  >
                    {isParsingMarkdown ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Đang phân tích cấu trúc văn bản...</span>
                      </>
                    ) : (
                      <>
                        <FileCheck className="w-4 h-4 text-blue-200" />
                        <span>Chuyển đổi sang Chuẩn NĐ 30 & Đưa vào A4</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: REAL-TIME A4 PREVIEW (Matching Image 2) */}
        <div
          className={`${
            sidebarCollapsed ? 'lg:col-span-11' : 'lg:col-span-7'
          } transition-all duration-300 h-full min-h-[700px]`}
        >
          <DocumentA4Preview
            document={document}
            title={`Văn bản chuẩn: ${document.ten_loai_van_ban || 'CÔNG VĂN'}`}
          />
        </div>
      </div>
    </div>
  );
};
