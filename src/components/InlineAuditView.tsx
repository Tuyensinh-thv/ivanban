'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Wand2,
  RefreshCw,
  Copy,
  Check,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { DocumentErrorItem } from '../types/nd30';

interface InlineAuditViewProps {
  initialText: string;
  errors: DocumentErrorItem[];
  onApplyAllFixes?: (updatedText: string) => void;
  onTextChange?: (text: string) => void;
}

export const InlineAuditView: React.FC<InlineAuditViewProps> = ({
  initialText,
  errors,
  onApplyAllFixes,
  onTextChange,
}) => {
  const [currentText, setCurrentText] = useState<string>(initialText);
  const [selectedError, setSelectedError] = useState<DocumentErrorItem | null>(null);
  const [appliedErrorIndices, setAppliedErrorIndices] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState<boolean>(false);

  // Apply single fix
  const handleApplyFix = (err: DocumentErrorItem, index: number) => {
    if (!err.originalText || !err.suggestedText) return;

    if (currentText.includes(err.originalText)) {
      const updated = currentText.replace(err.originalText, err.suggestedText);
      setCurrentText(updated);
      onTextChange?.(updated);
      setAppliedErrorIndices((prev) => new Set(prev).add(index));
      if (selectedError === err) setSelectedError(null);
    }
  };

  // Apply all fixes
  const handleApplyAll = () => {
    let updated = currentText;
    const newApplied = new Set(appliedErrorIndices);

    errors.forEach((err, idx) => {
      if (err.originalText && err.suggestedText && updated.includes(err.originalText)) {
        updated = updated.replace(err.originalText, err.suggestedText);
        newApplied.add(idx);
      }
    });

    setCurrentText(updated);
    setAppliedErrorIndices(newApplied);
    onApplyAllFixes?.(updated);
    onTextChange?.(updated);
  };

  // Reset to original
  const handleReset = () => {
    setCurrentText(initialText);
    setAppliedErrorIndices(new Set());
    setSelectedError(null);
    onTextChange?.(initialText);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const remainingCount = errors.length - appliedErrorIndices.size;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Top action bar */}
      <div className="p-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold flex items-center gap-2">
              Soát Lỗi Trực Quan & Hiệu Chỉnh Nhanh (Interactive Review)
            </h4>
            <p className="text-[11px] text-slate-300">
              Bấm vào từng lỗi để xem căn cứ pháp lý NĐ 30 và áp dụng sửa đổi ngay lập tức
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleCopy}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl border border-slate-700 transition flex items-center space-x-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700 transition flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Khôi phục gốc</span>
          </button>

          <button
            type="button"
            onClick={handleApplyAll}
            disabled={remainingCount === 0}
            className="text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Wand2 className="w-3.5 h-3.5 text-amber-300" />
            <span>Sửa toàn bộ ({remainingCount} điểm)</span>
          </button>
        </div>
      </div>

      {/* Progress pill strip */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-3">
          <span className="font-semibold text-slate-700">Tiến độ hiệu chỉnh:</span>
          <div className="flex items-center space-x-1.5">
            <span className="px-2 py-0.5 rounded-full font-bold text-[10.5px] bg-emerald-100 text-emerald-800">
              Đã khắc phục: {appliedErrorIndices.size}
            </span>
            <span className="px-2 py-0.5 rounded-full font-bold text-[10.5px] bg-rose-100 text-rose-800">
              Còn lại: {remainingCount}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Thể thức
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Chính tả
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Pháp lý
          </span>
        </div>
      </div>

      {/* Main split: Text display vs Error inspector */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
        {/* Text viewer (8 cols) */}
        <div className="md:col-span-8 p-4 overflow-y-auto font-mono text-xs leading-relaxed bg-white border-r border-slate-200">
          <div className="whitespace-pre-wrap text-slate-800">
            {currentText}
          </div>
        </div>

        {/* Error Inspector & Fast Actions (4 cols) */}
        <div className="md:col-span-4 p-3 bg-slate-50 overflow-y-auto space-y-2.5 flex flex-col">
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider px-1">
            Danh sách điểm cần sửa ({errors.length})
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto">
            {errors.map((err, idx) => {
              const isApplied = appliedErrorIndices.has(idx);
              const isSelected = selectedError === err;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedError(err)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                    isApplied
                      ? 'bg-emerald-50/60 border-emerald-200 opacity-60'
                      : isSelected
                      ? 'bg-white border-red-500 ring-2 ring-red-100 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
                      <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="truncate max-w-[140px]">{err.location}</span>
                    </span>

                    <span
                      className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold uppercase ${
                        err.type === 'the_thuc'
                          ? 'bg-red-100 text-red-800'
                          : err.type === 'chinh_ta'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {err.type === 'the_thuc' ? 'Thể thức' : err.type === 'chinh_ta' ? 'Chính tả' : 'Pháp lý'}
                    </span>
                  </div>

                  <div className="text-[11px] space-y-1">
                    <div className="text-rose-700 line-through bg-rose-50 p-1 rounded font-mono truncate">
                      {err.originalText}
                    </div>
                    <div className="text-emerald-800 font-semibold bg-emerald-50 p-1 rounded font-mono truncate">
                      {err.suggestedText}
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="text-[10px] text-slate-500 italic truncate max-w-[120px]">
                      {err.explanation}
                    </span>

                    {isApplied ? (
                      <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Đã sửa
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyFix(err, idx);
                        }}
                        className="text-[10.5px] bg-red-600 hover:bg-red-700 text-white font-bold px-2 py-0.5 rounded-lg transition shadow-2xs"
                      >
                        Sửa ngay
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected error details popup / panel */}
          {selectedError && (
            <div className="p-3 bg-white rounded-xl border border-slate-300 shadow-sm space-y-2 text-xs animate-fadeIn">
              <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs text-red-800">
                <Info className="w-4 h-4 text-red-600" />
                <span>Chi tiết căn cứ Nghị định 30/2020/NĐ-CP:</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                {selectedError.explanation}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
