import React, { useState } from 'react';
import {
  Columns2,
  Rows3,
  CheckCircle,
  Copy,
  Download,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { ND30Document } from '../types/nd30';
import { exportND30ToDocx } from '../lib/docxGenerator';

interface VisualDiffViewProps {
  originalText: string;
  modifiedDoc: ND30Document;
  versionName: string; // 'Bản Chuẩn Hóa' | 'Bản Tối Ưu'
}

interface DiffLine {
  type: 'unchanged' | 'removed' | 'added' | 'modified';
  original?: string;
  modified?: string;
  lineNumber: number;
}

export const VisualDiffView: React.FC<VisualDiffViewProps> = ({
  originalText,
  modifiedDoc,
  versionName,
}) => {
  const [diffMode, setDiffMode] = useState<'side-by-side' | 'unified'>('side-by-side');
  const [copied, setCopied] = useState(false);

  // Convert modifiedDoc into clean full string for comparison
  const modifiedText = [
    modifiedDoc.co_quan_chu_quan,
    modifiedDoc.co_quan_ban_hanh,
    modifiedDoc.so_ky_hieu,
    'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM',
    'Độc lập - Tự do - Hạnh phúc',
    modifiedDoc.dia_danh_ngay_thang,
    modifiedDoc.ten_loai_van_ban,
    modifiedDoc.trich_yeu,
    modifiedDoc.kinh_gui,
    ...(modifiedDoc.can_cu || []),
    ...(modifiedDoc.noi_dung || []).map((b) =>
      b.tieu_de ? `${b.tieu_de} ${b.noi_dung}` : b.noi_dung
    ),
    'Nơi nhận:\n' + (modifiedDoc.noi_nhan || []).join('\n'),
    modifiedDoc.chuc_danh_nguoi_ky,
    modifiedDoc.ten_nguoi_ky,
  ]
    .filter(Boolean)
    .join('\n\n');

  // Compute line-by-line diff
  const origLines = originalText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const modLines = modifiedText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const maxLines = Math.max(origLines.length, modLines.length);
  const diffLines: DiffLine[] = [];
  let changeCount = 0;

  for (let i = 0; i < maxLines; i++) {
    const o = origLines[i] || '';
    const m = modLines[i] || '';

    if (o === m) {
      diffLines.push({ type: 'unchanged', original: o, modified: m, lineNumber: i + 1 });
    } else if (o && !m) {
      diffLines.push({ type: 'removed', original: o, lineNumber: i + 1 });
      changeCount++;
    } else if (!o && m) {
      diffLines.push({ type: 'added', modified: m, lineNumber: i + 1 });
      changeCount++;
    } else {
      diffLines.push({ type: 'modified', original: o, modified: m, lineNumber: i + 1 });
      changeCount++;
    }
  }

  // Calculate similarity percentage roughly
  const similarity = Math.max(
    10,
    Math.min(99, Math.round(((maxLines - changeCount) / Math.max(1, maxLines)) * 100))
  );

  const handleCopyModified = () => {
    navigator.clipboard.writeText(modifiedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadDocx = () => {
    exportND30ToDocx(modifiedDoc);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header toolbar */}
      <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
            <Columns2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
              Đối chiếu Song song: <span className="text-amber-300">Bản Gốc vs {versionName}</span>
            </h3>
            <p className="text-[11px] text-slate-300">
              Công nghệ so khớp văn bản trực quan phát hiện từng dòng sửa đổi, xóa bỏ hoặc thêm mới
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Mode toggle */}
          <div className="bg-slate-800 p-1 rounded-xl flex items-center space-x-1 border border-slate-700 text-xs">
            <button
              onClick={() => setDiffMode('side-by-side')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition flex items-center space-x-1 ${
                diffMode === 'side-by-side'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span>Song song</span>
            </button>
            <button
              onClick={() => setDiffMode('unified')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition flex items-center space-x-1 ${
                diffMode === 'unified'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Rows3 className="w-3.5 h-3.5" />
              <span>Gộp (Inline)</span>
            </button>
          </div>

          <button
            onClick={handleCopyModified}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl border border-slate-700 transition flex items-center space-x-1.5"
            title="Sao chép nội dung văn bản đã chuẩn hóa"
          >
            {copied ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-semibold">Đã chép</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Sao chép</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadDocx}
            className="text-xs bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white px-3.5 py-1.5 rounded-xl font-bold shadow-xs transition flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5 text-amber-200" />
            <span>Tải .docx chuẩn</span>
          </button>
        </div>
      </div>

      {/* Comparison Statistics Strip */}
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-slate-600">Độ tương đồng cấu trúc:</span>
            <strong className="text-blue-700 font-bold">{similarity}%</strong>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-600">Điểm sửa/cắt bỏ:</span>
            <strong className="text-rose-600 font-bold">{changeCount} đoạn</strong>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-600">Đoạn chuẩn hóa mới:</span>
            <strong className="text-emerald-700 font-bold">{modLines.length} dòng</strong>
          </div>
        </div>

        <div className="text-[11px] text-slate-500">
          <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded mr-2 font-mono">
            - Đỏ: Bản gốc có lỗi
          </span>
          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono">
            + Xanh: Đã chuẩn hóa NĐ 30
          </span>
        </div>
      </div>

      {/* Diff Content Viewport */}
      <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed bg-slate-100/50">
        {diffMode === 'side-by-side' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-w-[700px]">
            {/* Left: Original */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 font-bold text-slate-700 flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-rose-700">
                  <FileText className="w-3.5 h-3.5 text-rose-500" />
                  DỰ THẢO GỐC (CHỨA LỖI)
                </span>
                <span className="text-slate-400 font-normal">Trình bày ban đầu</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-[550px] overflow-y-auto">
                {diffLines.map((line, idx) => {
                  const isDiff = line.type === 'removed' || line.type === 'modified';
                  return (
                    <div
                      key={idx}
                      className={`flex items-start p-2 text-[11.5px] ${
                        isDiff
                          ? 'bg-rose-50/80 text-rose-950 font-medium'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="w-8 shrink-0 text-slate-400 text-[10px] select-none text-right pr-2">
                        {line.lineNumber}
                      </span>
                      <div className="flex-1 break-words">
                        {isDiff ? (
                          <span className="line-through decoration-rose-500 decoration-2 text-rose-900 bg-rose-100/70 px-1 py-0.5 rounded">
                            {line.original || '(Trống)'}
                          </span>
                        ) : (
                          <span>{line.original || ''}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Modified */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="bg-emerald-50 px-3 py-2 border-b border-emerald-100 font-bold text-emerald-800 flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  {versionName.toUpperCase()} (ĐÃ SỬA CHUẨN)
                </span>
                <span className="text-emerald-600 font-normal">Nghị định 30/2020/NĐ-CP</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-[550px] overflow-y-auto">
                {diffLines.map((line, idx) => {
                  const isDiff = line.type === 'added' || line.type === 'modified';
                  return (
                    <div
                      key={idx}
                      className={`flex items-start p-2 text-[11.5px] ${
                        isDiff
                          ? 'bg-emerald-50/80 text-emerald-950 font-medium'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="w-8 shrink-0 text-slate-400 text-[10px] select-none text-right pr-2">
                        {line.lineNumber}
                      </span>
                      <div className="flex-1 break-words">
                        {isDiff ? (
                          <span className="bg-emerald-100/80 text-emerald-950 font-semibold px-1 py-0.5 rounded border border-emerald-300">
                            {line.modified || ''}
                          </span>
                        ) : (
                          <span>{line.modified || ''}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Unified Inline Diff */
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs max-h-[550px] overflow-y-auto">
            <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 font-bold text-slate-700 text-[11px]">
              SO SÁNH GỘP (INLINE UNIFIED DIFF)
            </div>
            <div className="divide-y divide-slate-100">
              {diffLines.map((line, idx) => (
                <div key={idx} className="p-2 text-[11.5px]">
                  {line.type === 'unchanged' && (
                    <div className="flex items-start text-slate-700">
                      <span className="w-8 shrink-0 text-slate-400 text-[10px] select-none text-right pr-2">
                        {line.lineNumber}
                      </span>
                      <span className="text-slate-400 select-none w-4 font-mono"> </span>
                      <span className="flex-1">{line.modified}</span>
                    </div>
                  )}

                  {line.type === 'modified' && (
                    <div className="space-y-1">
                      <div className="flex items-start bg-rose-50 text-rose-900 p-1.5 rounded">
                        <span className="w-8 shrink-0 text-rose-400 text-[10px] select-none text-right pr-2">
                          {line.lineNumber}
                        </span>
                        <span className="text-rose-600 font-bold select-none w-4">-</span>
                        <span className="flex-1 line-through">{line.original}</span>
                      </div>
                      <div className="flex items-start bg-emerald-50 text-emerald-950 p-1.5 rounded font-semibold">
                        <span className="w-8 shrink-0 text-emerald-500 text-[10px] select-none text-right pr-2">
                          {line.lineNumber}
                        </span>
                        <span className="text-emerald-600 font-bold select-none w-4">+</span>
                        <span className="flex-1">{line.modified}</span>
                      </div>
                    </div>
                  )}

                  {line.type === 'removed' && (
                    <div className="flex items-start bg-rose-50 text-rose-900 p-1.5 rounded">
                      <span className="w-8 shrink-0 text-rose-400 text-[10px] select-none text-right pr-2">
                        {line.lineNumber}
                      </span>
                      <span className="text-rose-600 font-bold select-none w-4">-</span>
                      <span className="flex-1 line-through">{line.original}</span>
                    </div>
                  )}

                  {line.type === 'added' && (
                    <div className="flex items-start bg-emerald-50 text-emerald-950 p-1.5 rounded font-semibold">
                      <span className="w-8 shrink-0 text-emerald-500 text-[10px] select-none text-right pr-2">
                        {line.lineNumber}
                      </span>
                      <span className="text-emerald-600 font-bold select-none w-4">+</span>
                      <span className="flex-1">{line.modified}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
