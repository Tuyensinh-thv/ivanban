'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  FileText,
  BarChart3,
  Radio,
  Scale,
  Sparkles,
  Copy,
  Check,
  ChevronRight,
  Sliders,
  Building2,
  MapPin,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Eye,
  Settings,
  Layers
} from 'lucide-react';
import { PromptTemplate, OrgProfile } from '@/types/prompt';
import {
  PROMPT_LIBRARY,
  PROMPT_GROUPS,
  PROMPT_CATEGORIES,
  searchPrompts,
  renderPrompt
} from '@/data/promptLibrary';
import { PromptBuilder } from './PromptBuilder';

interface PromptLibraryProps {
  orgProfile: OrgProfile;
  onNavigateToOrgProfile?: () => void;
  onUseInDrafting?: (template: PromptTemplate, renderedPrompt: string, variableValues: Record<string, string>) => void;
}

export const PromptLibrary: React.FC<PromptLibraryProps> = ({
  orgProfile,
  onNavigateToOrgProfile,
  onUseInDrafting
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<number>(0); // 0 = all
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDocType, setSelectedDocType] = useState<string>('all');
  
  // Active modal state
  const [activeTemplate, setActiveTemplate] = useState<PromptTemplate | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [quickCopiedId, setQuickCopiedId] = useState<number | null>(null);

  // Pagination / Load more
  const [visibleCount, setVisibleCount] = useState(24);

  // Filtered prompt list
  const filteredPrompts = useMemo(() => {
    return searchPrompts(
      searchQuery,
      selectedGroup > 0 ? selectedGroup : undefined,
      selectedCategory !== 'all' ? selectedCategory : undefined,
      selectedDocType !== 'all' ? selectedDocType : undefined
    );
  }, [searchQuery, selectedGroup, selectedCategory, selectedDocType]);

  // Available categories based on selected group
  const availableCategories = useMemo(() => {
    if (selectedGroup === 0) return PROMPT_CATEGORIES;
    return PROMPT_CATEGORIES.filter(c => c.groupId === selectedGroup);
  }, [selectedGroup]);

  // Unique document types in current dataset
  const availableDocTypes = useMemo(() => {
    const types = new Set<string>();
    PROMPT_LIBRARY.forEach(p => {
      if (p.docType) types.add(p.docType);
    });
    return Array.from(types).sort();
  }, []);

  const handleOpenBuilder = (template: PromptTemplate) => {
    setActiveTemplate(template);
    setIsBuilderOpen(true);
  };

  const handleQuickCopy = async (e: React.MouseEvent, template: PromptTemplate) => {
    e.stopPropagation();
    const rendered = renderPrompt(template, {}, orgProfile);
    try {
      await navigator.clipboard.writeText(rendered);
      setQuickCopiedId(template.id);
      setTimeout(() => setQuickCopiedId(null), 2000);
    } catch {
      // fallback
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedGroup(0);
    setSelectedCategory('all');
    setSelectedDocType('all');
    setVisibleCount(24);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 text-white pointer-events-none">
          <BookOpen size={300} />
        </div>
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold mb-3 border border-white/15">
            <Sparkles size={14} className="text-yellow-300" />
            Bộ Thư Viện 200 Prompt Nghiệp Vụ Cấp Xã / Phường
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Tra Cứu & Tối Ưu Prompt Mẫu Chuẩn AI
          </h1>
          <p className="text-slate-200 text-sm md:text-base mt-2 leading-relaxed">
            200 tình huống nghiệp vụ thực tế cấp cơ sở chuẩn hóa theo <strong>Nghị định 30/2020/NĐ-CP</strong>. Tự động khớp thông số địa phương, sẵn sàng sao chép hoặc chuyển ngay vào phòng soạn thảo iVANBAN.
          </p>

          {/* Active profile pill */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 border border-blue-400/30 rounded-xl text-xs backdrop-blur-sm text-blue-200">
              <Building2 size={14} className="text-blue-400" />
              <span>Cơ quan áp dụng: <strong className="text-white">{orgProfile.ten_co_quan}</strong></span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 border border-amber-400/30 rounded-xl text-xs backdrop-blur-sm text-amber-200">
              <MapPin size={14} className="text-amber-400" />
              <span>{orgProfile.danh_sach_thon.length} thôn/khu</span>
            </div>
            {onNavigateToOrgProfile && (
              <button
                type="button"
                onClick={onNavigateToOrgProfile}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-medium text-white transition border border-white/20"
              >
                <Settings size={13} />
                Đổi hồ sơ cơ quan
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4 Group Selector Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* All Tab */}
        <button
          type="button"
          onClick={() => {
            setSelectedGroup(0);
            setSelectedCategory('all');
            setVisibleCount(24);
          }}
          className={`p-3.5 rounded-2xl text-left transition flex flex-col justify-between border ${
            selectedGroup === 0
              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
              : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/30'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">Tất cả</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              selectedGroup === 0 ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              200
            </span>
          </div>
          <span className="text-sm font-bold line-clamp-1">Toàn bộ thư viện</span>
        </button>

        {/* Group 1 */}
        <button
          type="button"
          onClick={() => {
            setSelectedGroup(1);
            setSelectedCategory('all');
            setVisibleCount(24);
          }}
          className={`p-3.5 rounded-2xl text-left transition flex flex-col justify-between border ${
            selectedGroup === 1
              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
              : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/30'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider opacity-80">
              <FileText size={14} /> Nhóm 1
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              selectedGroup === 1 ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              50
            </span>
          </div>
          <span className="text-xs font-bold line-clamp-2">Văn bản hành chính NĐ 30</span>
        </button>

        {/* Group 2 */}
        <button
          type="button"
          onClick={() => {
            setSelectedGroup(2);
            setSelectedCategory('all');
            setVisibleCount(24);
          }}
          className={`p-3.5 rounded-2xl text-left transition flex flex-col justify-between border ${
            selectedGroup === 2
              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
              : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/30'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider opacity-80">
              <BarChart3 size={14} /> Nhóm 2
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              selectedGroup === 2 ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              50
            </span>
          </div>
          <span className="text-xs font-bold line-clamp-2">Tổng hợp số liệu & Báo cáo</span>
        </button>

        {/* Group 3 */}
        <button
          type="button"
          onClick={() => {
            setSelectedGroup(3);
            setSelectedCategory('all');
            setVisibleCount(24);
          }}
          className={`p-3.5 rounded-2xl text-left transition flex flex-col justify-between border ${
            selectedGroup === 3
              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
              : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/30'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider opacity-80">
              <Radio size={14} /> Nhóm 3
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              selectedGroup === 3 ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              50
            </span>
          </div>
          <span className="text-xs font-bold line-clamp-2">Truyền thanh, Zalo & DVC</span>
        </button>

        {/* Group 4 */}
        <button
          type="button"
          onClick={() => {
            setSelectedGroup(4);
            setSelectedCategory('all');
            setVisibleCount(24);
          }}
          className={`p-3.5 rounded-2xl text-left transition flex flex-col justify-between border ${
            selectedGroup === 4
              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
              : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/30'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider opacity-80">
              <Scale size={14} /> Nhóm 4
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              selectedGroup === 4 ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              50
            </span>
          </div>
          <span className="text-xs font-bold line-clamp-2">Nghiệp vụ chuyên ngành</span>
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          
          {/* Search input */}
          <div className="md:col-span-5 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setVisibleCount(24);
              }}
              placeholder="Tìm theo số hiệu (#1), tiêu đề, thôn xóm, từ khóa..."
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-800"
            />
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-4">
            <select
              value={selectedCategory}
              onChange={e => {
                setSelectedCategory(e.target.value);
                setVisibleCount(24);
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-700 bg-white"
            >
              <option value="all">Tất cả danh mục nghiệp vụ ({availableCategories.length})</option>
              {availableCategories.map(cat => (
                <option key={cat.code} value={cat.code}>
                  {cat.code} - {cat.name} ({cat.range})
                </option>
              ))}
            </select>
          </div>

          {/* DocType Dropdown */}
          <div className="md:col-span-2">
            <select
              value={selectedDocType}
              onChange={e => {
                setSelectedDocType(e.target.value);
                setVisibleCount(24);
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-700 bg-white"
            >
              <option value="all">Mọi loại văn bản</option>
              {availableDocTypes.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters button */}
          <div className="md:col-span-1 flex justify-end">
            <button
              type="button"
              onClick={handleResetFilters}
              className="w-full md:w-auto p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition flex items-center justify-center"
              title="Đặt lại bộ lọc"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Filter summary status */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <div>
            Tìm thấy <strong className="text-slate-800 font-semibold">{filteredPrompts.length}</strong> / 200 prompt
            {searchQuery && <span> cho từ khóa &quot;{searchQuery}&quot;</span>}
          </div>
          <span className="text-[11px] text-slate-400">
            Hiển thị {Math.min(visibleCount, filteredPrompts.length)} kết quả
          </span>
        </div>
      </div>

      {/* Prompts Cards Grid */}
      {filteredPrompts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
            <Search size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-800">Không tìm thấy Prompt phù hợp</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Vui lòng thử tìm với từ khóa khác hoặc bấm nút đặt lại bộ lọc.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
          >
            Xem tất cả 200 Prompt
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPrompts.slice(0, visibleCount).map(template => {
            const isCopied = quickCopiedId === template.id;

            return (
              <div
                key={template.id}
                onClick={() => handleOpenBuilder(template)}
                className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 p-5 flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  {/* Top badges */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-mono font-bold group-hover:bg-blue-50 group-hover:text-blue-700 transition">
                        #{template.id}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {template.categoryCode}
                      </span>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      {template.docType}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition line-clamp-2 mb-2">
                    {template.title}
                  </h3>

                  {/* Role / Context snippet */}
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                    {template.task || template.role}
                  </p>

                  {/* Key input highlight */}
                  {template.inputs.length > 0 && (
                    <div className="bg-slate-50 rounded-xl p-2.5 text-[11px] text-slate-600 space-y-1 mb-4 border border-slate-100">
                      {template.inputs.slice(0, 2).map((inp, idx) => (
                        <div key={idx} className="line-clamp-1">
                          <span className="font-semibold text-slate-700">{inp.key}:</span> {inp.value}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-blue-600 font-semibold group-hover:underline flex items-center gap-1">
                    <Sliders size={12} /> Tùy biến biến số
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={e => handleQuickCopy(e, template)}
                      className={`p-2 rounded-lg text-xs transition border ${
                        isCopied
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                      title="Sao chép nhanh Prompt"
                    >
                      {isCopied ? <Check size={13} /> : <Copy size={13} />}
                    </button>

                    {onUseInDrafting && (
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          const rendered = renderPrompt(template, {}, orgProfile);
                          onUseInDrafting(template, rendered, {});
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium transition flex items-center gap-1"
                        title="Dùng trong Soạn thảo"
                      >
                        <Sparkles size={13} /> Soạn
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load More Button */}
      {visibleCount < filteredPrompts.length && (
        <div className="text-center pt-4">
          <button
            type="button"
            onClick={() => setVisibleCount(prev => prev + 24)}
            className="px-6 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-300 shadow-sm transition"
          >
            Xem thêm 24 Prompt tiếp theo ({filteredPrompts.length - visibleCount} còn lại)
          </button>
        </div>
      )}

      {/* Prompt Builder Modal */}
      <PromptBuilder
        template={activeTemplate}
        orgProfile={orgProfile}
        isOpen={isBuilderOpen}
        onClose={() => {
          setIsBuilderOpen(false);
          setActiveTemplate(null);
        }}
        onUseInDrafting={onUseInDrafting}
      />
    </div>
  );
};
