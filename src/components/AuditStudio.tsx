'use client';

import React, { useState, useMemo } from 'react';
import {
  Upload,
  FileCheck2,
  AlertTriangle,
  CheckCircle,
  FileText,
  Sparkles,
  Layers,
  ArrowRight,
  Download,
  CloudUpload,
  RefreshCw,
  Eye,
  Sliders,
  ShieldAlert,
  HelpCircle,
  Check,
  XCircle,
  Search,
  CheckCheck,
  BookOpen,
  Columns2,
  Scale,
  Mail,
  Loader2,
  Wand2,
  Printer,
  Copy,
  Trash2,
  FileCode,
} from 'lucide-react';
import { AuditResult, ND30Document } from '../types/nd30';
import { DocumentA4Preview } from './DocumentA4Preview';
import { VisualDiffView } from './VisualDiffView';
import { InlineAuditView } from './InlineAuditView';
import { exportND30ToDocx } from '../lib/docxGenerator';
import { JurisdictionCheckSection } from './JurisdictionCheckSection';

interface AuditStudioProps {
  currentUser?: any;
  onSelectDocumentForDraft?: (doc: ND30Document) => void;
}

const SAMPLE_ERROR_DOC = `UBND PHƯỜNG NÔNG TRANG
Số: 45 /QĐ-UBND

CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
Phú thọ, ngày 28 tháng 6 năm 2026

QUYẾT ĐỊNH
V/v Nâng bậc lương trước hạn đợt 1 năm 2026 đối với cán bộ lập thành tích xuất sắc

Căn cứ Nghị định số 110/2004/NĐ-CP ngày 08/4/2004 của Chính phủ về công tác văn thư;
Căn cứ Luật Tổ chức chính quyền địa phương 2015;
Căn cứ Thông tư 08/2013/TT-BNV của Bộ Nội vụ;
Xét đề nghị của Văn phòng UBND phường.

CHỦ TỊCH UBND PHƯỜNG NÔNG TRANG QUYẾT ĐỊNH:

Điều 1. Nay nâng bậc lương chước thời hạn 06 tháng cho các đồng chí cán bộ có tên sau vì đã có thành tích hoàn thành suất sắc nhiệm vụ được giao trong năm 2025.
Điều 2. Các ông bà có tên chịu trách nhiệm thi hành quyết định này và được nhận lương mới từ tháng 7.
Điều 3. Quyết định có hiệu lực từ ngày kí.

Nơi nhận:
- Như điều 2
- UBND tỉnh Phú Thọ (để b/c)
- UBND Thành phố Việt Trì (để biết)
- Lưu: VT.

CHỦ TỊCH
(Ký tên, đóng dấu)
Nguyễn Văn A`;

export const AuditStudio: React.FC<AuditStudioProps> = ({
  currentUser,
  onSelectDocumentForDraft,
}) => {
  const [inputText, setInputText] = useState<string>(SAMPLE_ERROR_DOC);
  const [referenceText, setReferenceText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [auditStep, setAuditStep] = useState<string>('');
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [activeTab, setActiveTab] = useState<'inline' | 'diff' | 'standard' | 'optimized' | 'report' | 'jurisdiction'>('inline');
  const [uploadFileName, setUploadFileName] = useState<string | null>('van_ban_du_thao_mau.docx');
  const [uploadFileSize, setUploadFileSize] = useState<string | null>('14.2 KB');
  const [extractMethod, setExtractMethod] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [highlightEdits, setHighlightEdits] = useState<boolean>(true);
  const [errorSearchQuery, setErrorSearchQuery] = useState<string>('');
  const [reportCopied, setReportCopied] = useState<boolean>(false);

  // Statistics
  const wordCount = useMemo(() => {
    return inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  }, [inputText]);

  const charCount = useMemo(() => inputText.length, [inputText]);

  // File Upload Handler (.docx, .doc, .pdf, scan image, .txt, .md, .rtf)
  const processFile = async (file: File) => {
    setUploadFileName(file.name);
    setUploadFileSize(`${(file.size / 1024).toFixed(1)} KB`);
    setIsLoading(true);
    setAuditStep('Đang trích xuất nội dung văn bản...');
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/document/extract', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Lỗi trích xuất văn bản từ tệp tin tải lên');
      }

      const data = await res.json();
      if (data.text) {
        setInputText(data.text);
        setExtractMethod(data.method || 'auto');
      }
    } catch (err: any) {
      // Fallback text read
      try {
        const text = await file.text();
        setInputText(text);
        setExtractMethod('text_fallback');
      } catch (fallbackErr) {
        setErrorMessage('Không thể đọc tệp: ' + err.message);
      }
    } finally {
      setIsLoading(false);
      setAuditStep('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleClearFile = () => {
    setUploadFileName(null);
    setUploadFileSize(null);
    setExtractMethod(null);
    setInputText('');
  };

  const handleRunAudit = async () => {
    if (!inputText.trim()) {
      setErrorMessage('Vui lòng dán hoặc tải lên nội dung văn bản cần soát lỗi.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      setAuditStep('Đang phân tích cấu trúc & đối chiếu quy chuẩn NĐ 30/2020...');

      const res = await fetch('/api/document/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText: inputText,
          referenceText: referenceText,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Lỗi từ máy chủ rà soát');
      }

      const data: AuditResult = await res.json();
      setAuditResult(data);
      setActiveTab('inline'); // Default to interactive inline view
    } catch (err: any) {
      setErrorMessage('Lỗi rà soát: ' + err.message);
    } finally {
      setIsLoading(false);
      setAuditStep('');
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const handleCopyErrorReport = () => {
    if (!auditResult) return;
    const lines = [
      `# BÁO CÁO THẨM ĐỊNH THỂ THỨC NGHỊ ĐỊNH 30/2020/NĐ-CP`,
      `Điểm đánh giá: ${auditResult.summary.overallScore}/100`,
      `Tổng số vấn đề: ${auditResult.summary.totalIssues}`,
      `- Lỗi Thể thức: ${auditResult.summary.theThucIssues}`,
      `- Lỗi Chính tả: ${auditResult.summary.chinhTaIssues}`,
      `- Pháp lý: ${auditResult.summary.phapLyIssues}`,
      `\n## Đánh giá tổng quan:\n${auditResult.summary.conclusion}\n`,
      `## Chi tiết các điểm cần sửa:`,
      ...auditResult.errors.map((e, idx) => `${idx + 1}. [${e.type.toUpperCase()}] ${e.location}\n   - Gốc: "${e.originalText}"\n   - Sửa: "${e.suggestedText}"\n   - Căn cứ: ${e.explanation}`),
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setReportCopied(true);
    setTimeout(() => setReportCopied(false), 2500);
  };

  const filteredErrors = useMemo(() => {
    if (!auditResult) return [];
    if (!errorSearchQuery.trim()) return auditResult.errors;
    const q = errorSearchQuery.toLowerCase();
    return auditResult.errors.filter(
      (e) =>
        e.location.toLowerCase().includes(q) ||
        e.originalText.toLowerCase().includes(q) ||
        e.suggestedText.toLowerCase().includes(q) ||
        e.explanation.toLowerCase().includes(q)
    );
  }, [auditResult, errorSearchQuery]);

  return (
    <div className="flex flex-col space-y-4">
      {/* INPUT AREA & UPLOAD PANEL */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Soát lỗi & Thẩm định Thể thức Nghị định 30/2020
              </h2>
              <p className="text-[11px] text-slate-500">
                Hỗ trợ đa định dạng: Word (.docx, .doc), PDF, Ảnh chụp scan, Markdown (.md), Text (.txt, .rtf)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                setInputText(SAMPLE_ERROR_DOC);
                setUploadFileName('van_ban_du_thao_mau.docx');
              }}
              className="text-xs text-slate-600 hover:text-slate-900 font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
            >
              Nạp văn bản mẫu có lỗi
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={handleRunAudit}
              className="px-4 py-2 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white font-bold rounded-xl shadow-xs transition flex items-center space-x-2 text-xs disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                  <span>{auditStep || 'Đang rà soát đa tầng...'}</span>
                </>
              ) : (
                <>
                  <FileCheck2 className="w-3.5 h-3.5 text-amber-300" />
                  <span>TIẾN HÀNH SOÁT LỖI</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Drag & Drop Upload Zone + Textarea */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`p-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center transition cursor-pointer relative ${
              isDragging
                ? 'border-red-500 bg-red-50/50'
                : 'border-slate-300 hover:border-red-400 bg-slate-50/50'
            }`}
          >
            <input
              type="file"
              id="audit-file-upload"
              accept=".docx,.doc,.pdf,.txt,.md,.markdown,.rtf,image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <label htmlFor="audit-file-upload" className="cursor-pointer flex flex-col items-center space-y-2 w-full">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center">
                <CloudUpload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Chọn hoặc Kéo thả tệp tin</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Word (.docx), PDF, Ảnh, Markdown (.md), .txt</p>
              </div>

              {uploadFileName && (
                <div className="flex items-center gap-1.5 mt-1 max-w-full">
                  <span className="text-[10px] font-mono bg-white px-2 py-1 rounded border border-slate-200 text-slate-700 truncate max-w-[170px]">
                    📄 {uploadFileName} ({uploadFileSize})
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleClearFile();
                    }}
                    title="Xóa tệp"
                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}

              {extractMethod && (
                <span className="text-[9.5px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-medium">
                  Trích xuất: {extractMethod}
                </span>
              )}
            </label>
          </div>

          <div className="md:col-span-2 flex flex-col space-y-1.5">
            <textarea
              rows={5}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Hoặc dán toàn bộ nội dung văn bản cần kiểm tra vào đây..."
              className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-red-600 outline-hidden transition shadow-2xs resize-y"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span>
                Thống kê: <strong className="text-slate-700">{wordCount}</strong> từ, <strong className="text-slate-700">{charCount}</strong> ký tự
              </span>
              {inputText && (
                <button
                  type="button"
                  onClick={() => setInputText('')}
                  className="text-slate-400 hover:text-rose-600 transition text-[10.5px]"
                >
                  Xóa trắng nội dung
                </button>
              )}
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* RESULTS DISPLAY TABS */}
      {auditResult && (
        <div className="space-y-4">
          {/* TAB STRIP */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-2 rounded-2xl shadow-2xs">
            <div className="flex items-center flex-wrap gap-2">
              {/* Tab 0: Sửa nhanh trực quan */}
              <button
                type="button"
                onClick={() => setActiveTab('inline')}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 ${
                  activeTab === 'inline'
                    ? 'bg-rose-50 text-rose-900 border border-rose-300 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Wand2 className="w-4 h-4 text-rose-600" />
                <span>0. Sửa Nhanh Trực Quan</span>
                <span className="text-[10px] bg-rose-200 text-rose-900 px-1.5 py-0.2 rounded font-semibold">
                  Mới
                </span>
              </button>

              {/* Tab 1 */}
              <button
                type="button"
                onClick={() => setActiveTab('diff')}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 ${
                  activeTab === 'diff'
                    ? 'bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Columns2 className="w-4 h-4 text-amber-600" />
                <span>1. So sánh Đối chiếu (Diff)</span>
              </button>

              {/* Tab 2 */}
              <button
                type="button"
                onClick={() => setActiveTab('standard')}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 ${
                  activeTab === 'standard'
                    ? 'bg-emerald-50 text-emerald-900 border-b-2 border-red-600 font-extrabold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>2. Bản Chuẩn Hóa</span>
              </button>

              {/* Tab 3 */}
              <button
                type="button"
                onClick={() => setActiveTab('optimized')}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 ${
                  activeTab === 'optimized'
                    ? 'bg-purple-50 text-purple-900 border border-purple-300 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>3. Bản Tối Ưu</span>
              </button>

              {/* Tab 4 */}
              <button
                type="button"
                onClick={() => setActiveTab('report')}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 ${
                  activeTab === 'report'
                    ? 'bg-blue-50 text-blue-900 border border-blue-300 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-blue-600" />
                <span>4. Chi tiết Lỗi ({auditResult.errors.length})</span>
              </button>

              {/* Tab 5: Thẩm quyền */}
              <button
                type="button"
                onClick={() => setActiveTab('jurisdiction')}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 ${
                  activeTab === 'jurisdiction'
                    ? 'bg-slate-100 text-slate-900 border border-slate-300 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Scale className="w-4 h-4 text-purple-600" />
                <span>5. Thẩm quyền ký</span>
              </button>
            </div>

            {/* Quick action to send to Draft */}
            {onSelectDocumentForDraft && (
              <button
                type="button"
                onClick={() => {
                  const docToSend =
                    activeTab === 'optimized' ? auditResult.optimized : auditResult.standard;
                  onSelectDocumentForDraft(docToSend);
                }}
                className="text-xs font-bold text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Chuyển sang Soạn thảo tiếp</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* TAB 0: SỬA NHANH TRỰC QUAN */}
          {activeTab === 'inline' && (
            <div className="h-[680px]">
              <InlineAuditView
                initialText={inputText}
                errors={auditResult.errors}
                onApplyAllFixes={(updated) => setInputText(updated)}
                onTextChange={(updated) => setInputText(updated)}
              />
            </div>
          )}

          {/* TAB 1: VISUAL DIFF */}
          {activeTab === 'diff' && (
            <div className="h-[650px]">
              <VisualDiffView
                originalText={inputText}
                modifiedDoc={auditResult.standard}
                versionName="Bản Chuẩn Hóa NĐ 30"
              />
            </div>
          )}

          {/* TAB 2: BẢN CHUẨN HÓA */}
          {activeTab === 'standard' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span className="font-bold">Bản Chuẩn Hóa (Sửa sạch lỗi chính tả & thể thức NĐ 30)</span>
                  <label className="inline-flex items-center gap-1.5 ml-3 cursor-pointer bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-700">
                    <input
                      type="checkbox"
                      checked={highlightEdits}
                      onChange={(e) => setHighlightEdits(e.target.checked)}
                      className="rounded text-red-600 focus:ring-0"
                    />
                    <span className="text-[11px] text-amber-300 font-semibold">Đánh dấu đỏ chỗ sửa</span>
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handlePrintPDF}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded-lg font-bold transition flex items-center space-x-1"
                    title="In trực tiếp hoặc Lưu thành tệp PDF"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>In / Tải PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => exportND30ToDocx(auditResult.standard, undefined, highlightEdits)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg font-bold transition flex items-center space-x-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải .docx chuẩn</span>
                  </button>
                </div>
              </div>

              <div className="h-[750px]">
                <DocumentA4Preview
                  document={auditResult.standard}
                  title="Bản Chuẩn Hóa Thể Thức Nghị Định 30/2020"
                  isEditedHighlight={highlightEdits}
                />
              </div>
            </div>
          )}

          {/* TAB 3: BẢN TỐI ƯU */}
          {activeTab === 'optimized' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-purple-900 text-white px-4 py-2.5 rounded-xl text-xs">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span className="font-bold">Bản Tối Ưu (Nâng cao văn phong hành chính, câu từ trang trọng sắc nét)</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handlePrintPDF}
                    className="bg-purple-800 hover:bg-purple-700 text-white px-3 py-1 rounded-lg font-bold transition flex items-center space-x-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>In / Tải PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => exportND30ToDocx(auditResult.optimized, 'Van_ban_Toi_Uu')}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg font-bold transition flex items-center space-x-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải .docx tối ưu</span>
                  </button>
                </div>
              </div>

              <div className="h-[750px]">
                <DocumentA4Preview
                  document={auditResult.optimized}
                  title="Bản Tối Ưu Văn Phong Công Vụ"
                />
              </div>
            </div>
          )}

          {/* TAB 4: CHI TIẾT LỖI */}
          {activeTab === 'report' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-center">
                  <div className="text-xl font-black text-red-700">{auditResult.summary.theThucIssues}</div>
                  <div className="text-[11px] font-bold text-red-900">Lỗi Thể thức NĐ 30</div>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center">
                  <div className="text-xl font-black text-amber-700">{auditResult.summary.chinhTaIssues}</div>
                  <div className="text-[11px] font-bold text-amber-900">Lỗi Chính tả / Từ ngữ</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-center">
                  <div className="text-xl font-black text-blue-700">{auditResult.summary.phapLyIssues}</div>
                  <div className="text-[11px] font-bold text-blue-900">Căn cứ Pháp lý</div>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                  <div className="text-xl font-black text-emerald-700">{auditResult.summary.overallScore}/100</div>
                  <div className="text-[11px] font-bold text-emerald-900">Điểm Đánh giá</div>
                </div>
              </div>

              {auditResult.summary.conclusion && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed">
                  <strong>Đánh giá tổng quan:</strong> {auditResult.summary.conclusion}
                </div>
              )}

              {/* Search & Actions toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={errorSearchQuery}
                    onChange={(e) => setErrorSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm lỗi theo từ khóa hoặc vị trí..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-600 outline-hidden"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleCopyErrorReport}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 font-medium transition flex items-center space-x-1.5"
                >
                  {reportCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{reportCopied ? 'Đã sao chép báo cáo' : 'Sao chép Báo cáo Markdown'}</span>
                </button>
              </div>

              {/* Error items list */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Danh sách chi tiết ({filteredErrors.length} mục):
                </h3>
                {filteredErrors.map((err, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <span>{err.location}</span>
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          err.type === 'the_thuc'
                            ? 'bg-red-100 text-red-800'
                            : err.type === 'chinh_ta'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {err.type === 'the_thuc'
                          ? 'Thể thức'
                          : err.type === 'chinh_ta'
                          ? 'Chính tả'
                          : 'Pháp lý'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11.5px]">
                      <div className="p-2 bg-rose-50/80 rounded-lg text-rose-900 border border-rose-200">
                        <span className="font-bold text-rose-700 block text-[10px] uppercase">Gốc:</span>
                        <span className="line-through">{err.originalText}</span>
                      </div>
                      <div className="p-2 bg-emerald-50/80 rounded-lg text-emerald-950 font-semibold border border-emerald-200">
                        <span className="font-bold text-emerald-700 block text-[10px] uppercase">Sửa đúng:</span>
                        <span>{err.suggestedText}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 italic">
                      <strong>Căn cứ:</strong> {err.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: THẨM QUYỀN KÝ */}
          {activeTab === 'jurisdiction' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <JurisdictionCheckSection
                documentText={`${auditResult.standard.ten_loai_van_ban || 'CÔNG VĂN'}\n${auditResult.standard.trich_yeu}\n${auditResult.standard.chuc_danh_nguoi_ky} ${auditResult.standard.ten_nguoi_ky}`}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
