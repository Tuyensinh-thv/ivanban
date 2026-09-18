import React, { useState } from 'react';
import {
  Columns2,
  Rows3,
  Copy,
  Download,
  X,
  Check,
  Percent,
} from 'lucide-react';
import { ND30Document } from '../types/nd30';
import { exportND30ToDocx } from '../lib/docxGenerator';

interface VisualDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalText: string;
  modifiedDoc: ND30Document;
  versionName?: string;
}

interface DiffLine {
  type: 'unchanged' | 'removed' | 'added' | 'modified';
  original?: string;
  modified?: string;
  lineNumber: number;
}

export const VisualDiffModal: React.FC<VisualDiffModalProps> = ({
  isOpen,
  onClose,
  originalText,
  modifiedDoc,
  versionName = 'Bản Hiệu đính Chuẩn hóa',
}) => {
  const [diffMode, setDiffMode] = useState<'side-by-side' | 'unified'>('side-by-side');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

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

  const similarity = Math.max(
    10,
    Math.min(99, Math.round(((maxLines - changeCount) / Math.max(1, maxLines)) * 100))
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(modifiedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-scaleUp">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/80 border border-indigo-400 flex items-center justify-center text-white">
              <Columns2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                So sánh Trực quan (Visual Diff View)
                <span className="text-[10px] bg-emerald-400 text-slate-950 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  Độ tương đồng: {similarity}%
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Đối chiếu chi tiết giữa bản thảo gốc và {versionName}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-slate-800 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setDiffMode('side-by-side')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  diffMode === 'side-by-side' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                Song song
              </button>
              <button
                type="button"
                onClick={() => setDiffMode('unified')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  diffMode === 'unified' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                Gộp dòng
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã sao chép' : 'Chép bản sửa'}</span>
            </button>

            <button
              type="button"
              onClick={() => exportND30ToDocx(modifiedDoc, undefined, true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1"
              title="Xuất file Word có đánh dấu đỏ chỗ sửa"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải .docx đỏ</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Diff content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 font-mono text-xs">
          {diffMode === 'side-by-side' ? (
            <div className="grid grid-cols-2 gap-3">
              {/* Left: Original */}
              <div className="space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="font-bold text-slate-500 uppercase tracking-wider mb-2 font-sans text-xs">
                  Văn bản gốc ban đầu
                </div>
                {diffLines.map((line, idx) => (
                  <div
                    key={idx}
                    className={`p-1.5 rounded leading-relaxed break-words ${
                      line.type === 'removed' || line.type === 'modified'
                        ? 'bg-rose-100 text-rose-900 line-through'
                        : 'text-slate-800'
                    }`}
                  >
                    <span className="text-slate-400 mr-2 select-none">{line.lineNumber}</span>
                    {line.original || <span className="text-slate-300 italic">(trống)</span>}
                  </div>
                ))}
              </div>

              {/* Right: Modified */}
              <div className="space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="font-bold text-indigo-700 uppercase tracking-wider mb-2 font-sans text-xs flex items-center justify-between">
                  <span>{versionName}</span>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Đã chuẩn hóa NĐ 30
                  </span>
                </div>
                {diffLines.map((line, idx) => (
                  <div
                    key={idx}
                    className={`p-1.5 rounded leading-relaxed break-words ${
                      line.type === 'added' || line.type === 'modified'
                        ? 'bg-emerald-100 text-emerald-950 font-medium'
                        : 'text-slate-800'
                    }`}
                  >
                    <span className="text-slate-400 mr-2 select-none">{line.lineNumber}</span>
                    {line.modified || <span className="text-slate-300 italic">(trống)</span>}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Unified Mode */
            <div className="space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              {diffLines.map((line, idx) => (
                <div key={idx} className="space-y-0.5">
                  {(line.type === 'removed' || line.type === 'modified') && line.original && (
                    <div className="p-1.5 rounded bg-rose-100 text-rose-900 line-through">
                      - {line.original}
                    </div>
                  )}
                  {(line.type === 'added' || line.type === 'modified') && line.modified && (
                    <div className="p-1.5 rounded bg-emerald-100 text-emerald-950 font-medium">
                      + {line.modified}
                    </div>
                  )}
                  {line.type === 'unchanged' && (
                    <div className="p-1.5 text-slate-700">  {line.original}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
