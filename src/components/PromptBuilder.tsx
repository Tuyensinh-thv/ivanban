'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  Sliders,
  RotateCcw,
  FileText,
  Building2,
  MapPin,
  Send,
  Eye,
  Code
} from 'lucide-react';
import { PromptTemplate, OrgProfile } from '@/types/prompt';
import { renderPrompt } from '@/data/promptLibrary';

interface PromptBuilderProps {
  template: PromptTemplate | null;
  orgProfile: OrgProfile;
  isOpen: boolean;
  onClose: () => void;
  onUseInDrafting?: (template: PromptTemplate, renderedPrompt: string, variableValues: Record<string, string>) => void;
}

export const PromptBuilder: React.FC<PromptBuilderProps> = ({
  template,
  orgProfile,
  isOpen,
  onClose,
  onUseInDrafting
}) => {
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'rendered' | 'raw'>('rendered');

  // Initialize variable values when template changes or profile updates
  useEffect(() => {
    if (!template) return;
    const initial: Record<string, string> = {};

    // Standard org values
    initial['ten_xa'] = orgProfile.ten_xa_phuong;
    initial['ten_tinh'] = orgProfile.ten_tinh_tp;
    initial['dia_danh'] = orgProfile.dia_danh;
    initial['co_quan_ban_hanh'] = orgProfile.ten_co_quan;

    // Specific template variables
    template.variables.forEach(v => {
      if (v.key === 'ten_xa') {
        initial['ten_xa'] = orgProfile.ten_xa_phuong;
      } else if (v.key === 'ten_tinh') {
        initial['ten_tinh'] = orgProfile.ten_tinh_tp;
      } else if (v.key === 'dia_danh') {
        initial['dia_danh'] = orgProfile.dia_danh;
      } else if (v.key === 'co_quan_ban_hanh') {
        initial['co_quan_ban_hanh'] = orgProfile.ten_co_quan;
      } else if (v.key === 'ten_thon') {
        // Default to first village in profile or default value
        initial['ten_thon'] = orgProfile.danh_sach_thon[0] || v.defaultValue;
      } else {
        initial[v.key] = v.defaultValue;
      }
    });

    setVariableValues(initial);
    setCopied(false);
  }, [template, orgProfile]);

  const renderedPrompt = useMemo(() => {
    if (!template) return '';
    return renderPrompt(template, variableValues, orgProfile);
  }, [template, variableValues, orgProfile]);

  if (!isOpen || !template) return null;

  const handleVariableChange = (key: string, value: string) => {
    setVariableValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCopy = async () => {
    const textToCopy = viewMode === 'raw' ? template.rawPrompt : renderedPrompt;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleResetToDefault = () => {
    const resetValues: Record<string, string> = {
      ten_xa: orgProfile.ten_xa_phuong,
      ten_tinh: orgProfile.ten_tinh_tp,
      dia_danh: orgProfile.dia_danh,
      co_quan_ban_hanh: orgProfile.ten_co_quan
    };
    template.variables.forEach(v => {
      if (v.key === 'ten_thon') {
        resetValues['ten_thon'] = orgProfile.danh_sach_thon[0] || v.defaultValue;
      } else if (!resetValues[v.key]) {
        resetValues[v.key] = v.defaultValue;
      }
    });
    setVariableValues(resetValues);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-xs font-mono font-bold border border-blue-400/30">
              Prompt #{template.id}
            </span>
            <div>
              <h2 className="text-base md:text-lg font-bold text-white line-clamp-1">
                {template.title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-300 mt-0.5">
                <span>{template.category}</span>
                <span>•</span>
                <span className="text-emerald-400 font-medium">{template.docType}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
              title="Đóng cửa sổ"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          
          {/* Left Column: Variable Configuration Form (5 cols) */}
          <div className="lg:col-span-5 border-r border-slate-200 p-5 overflow-y-auto max-h-[calc(92vh-140px)] bg-slate-50/60">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
                <Sliders size={16} className="text-blue-600" />
                <span>Thông số nghiệp vụ</span>
              </div>
              <button
                type="button"
                onClick={handleResetToDefault}
                className="text-[11px] text-slate-500 hover:text-blue-600 flex items-center gap-1 font-medium transition"
              >
                <RotateCcw size={12} />
                Làm mới thông số
              </button>
            </div>

            {/* Current Active Org Context */}
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 mb-4 text-xs text-blue-900">
              <div className="flex items-center gap-1.5 font-semibold mb-1">
                <Building2 size={13} className="text-blue-600" />
                <span>Đang áp dụng hồ sơ: {orgProfile.ten_co_quan}</span>
              </div>
              <p className="text-[11px] text-blue-700">
                Địa danh: <strong>{orgProfile.dia_danh}</strong> | {orgProfile.ten_tinh_tp} | Thôn/Khu: {orgProfile.danh_sach_thon.length} đơn vị
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-3.5">
              {template.variables.map(v => {
                const isVillage = v.key === 'ten_thon';
                const isTextarea = v.type === 'textarea';
                const currentValue = variableValues[v.key] ?? v.defaultValue;

                return (
                  <div key={v.key} className="space-y-1">
                    <label className="flex items-center justify-between text-xs font-medium text-slate-700">
                      <span>{v.label}</span>
                      {isVillage && (
                        <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-0.5">
                          <MapPin size={11} /> 17 thôn Tiên Lữ
                        </span>
                      )}
                    </label>

                    {isVillage && orgProfile.danh_sach_thon.length > 0 ? (
                      <div className="space-y-1.5">
                        <select
                          value={currentValue}
                          onChange={e => handleVariableChange(v.key, e.target.value)}
                          className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-800"
                        >
                          {orgProfile.danh_sach_thon.map((thon, i) => (
                            <option key={i} value={thon}>
                              {thon}
                            </option>
                          ))}
                        </select>
                        {/* Option to type custom village if not in list */}
                        <input
                          type="text"
                          value={currentValue}
                          onChange={e => handleVariableChange(v.key, e.target.value)}
                          placeholder="Hoặc gõ tên thôn/địa điểm cụ thể..."
                          className="w-full px-3 py-1.5 bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-700"
                        />
                      </div>
                    ) : isTextarea ? (
                      <textarea
                        rows={3}
                        value={currentValue}
                        onChange={e => handleVariableChange(v.key, e.target.value)}
                        placeholder={v.placeholder}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-800 resize-y"
                      />
                    ) : (
                      <input
                        type="text"
                        value={currentValue}
                        onChange={e => handleVariableChange(v.key, e.target.value)}
                        placeholder={v.placeholder}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-800"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Requirements & Tips */}
            {template.requirements.length > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-200">
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText size={13} className="text-slate-500" />
                  Tiêu chuẩn định dạng Nghị định 30
                </h4>
                <ul className="space-y-1 text-[11px] text-slate-600 list-disc list-inside">
                  {template.requirements.slice(0, 4).map((req, i) => (
                    <li key={i} className="line-clamp-2">
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column: Live Rendered Prompt & Actions (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between bg-white overflow-hidden max-h-[calc(92vh-140px)]">
            
            {/* View switcher tab bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50/70">
              <div className="flex items-center gap-1.5 p-0.5 bg-slate-200/80 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('rendered')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition ${
                    viewMode === 'rendered'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Eye size={13} />
                  Prompt hoàn chỉnh (Live)
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('raw')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition ${
                    viewMode === 'raw'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Code size={13} />
                  Mẫu gốc xã Tiên Lữ
                </button>
              </div>

              <span className="text-[11px] text-slate-500 font-mono">
                {viewMode === 'rendered' ? renderedPrompt.length : template.rawPrompt.length} ký tự
              </span>
            </div>

            {/* Prompt Text Display */}
            <div className="p-5 flex-1 overflow-y-auto font-mono text-xs leading-relaxed text-slate-800 whitespace-pre-wrap select-all bg-[#fafafa]">
              {viewMode === 'rendered' ? renderedPrompt : template.rawPrompt}
            </div>

            {/* Bottom Action Footer */}
            <div className="p-4 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 shadow-lg">
              <div className="text-xs text-slate-500">
                Nhấn <strong>Sao chép Prompt</strong> để dán vào ChatGPT/Gemini, hoặc dùng ngay trong <strong>iVANBAN</strong>.
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                    copied
                      ? 'bg-emerald-600 text-white shadow-emerald-700/20'
                      : 'bg-slate-800 hover:bg-slate-900 text-white shadow-slate-900/10'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check size={15} /> Đã sao chép vào Clipboard!
                    </>
                  ) : (
                    <>
                      <Copy size={15} /> Sao chép Prompt 1-Click
                    </>
                  )}
                </button>

                {onUseInDrafting && (
                  <button
                    type="button"
                    onClick={() => {
                      onUseInDrafting(template, renderedPrompt, variableValues);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-700/20 transition transform active:scale-95"
                  >
                    <Sparkles size={15} /> Soạn trong iVANBAN <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
