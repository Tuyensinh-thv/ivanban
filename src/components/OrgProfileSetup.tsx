'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  MapPin,
  UserCheck,
  Phone,
  Mail,
  FileCheck,
  Sparkles,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { OrgProfile, DEFAULT_ORG_PROFILE, TIEN_LU_ORG_PROFILE } from '@/types/prompt';

interface OrgProfileSetupProps {
  currentProfile?: OrgProfile;
  onSave?: (profile: OrgProfile) => void;
  onNavigateToPromptLibrary?: () => void;
  onNavigateToDrafting?: () => void;
}

const PRESETS: Record<string, OrgProfile> = {
  dai_hoc_hung_vuong: DEFAULT_ORG_PROFILE,
  tien_lu: TIEN_LU_ORG_PROFILE,
  nong_trang: {
    ten_co_quan_chu_quan: 'UBND THÀNH PHỐ VIỆT TRÌ',
    ten_co_quan: 'ỦY BAN NHÂN DÂN PHƯỜNG NÔNG TRANG',
    cap_don_vi: 'phuong',
    ten_xa_phuong: 'Phường Nông Trang',
    ten_tinh_tp: 'Tỉnh Phú Thọ',
    dia_danh: 'Nông Trang',
    tru_so: 'Số 45 Đại lộ Hùng Vương, Phường Nông Trang, TP Việt Trì',
    danh_sach_thon: [
      'Khu 1', 'Khu 2', 'Khu 3', 'Khu 4', 'Khu 5', 'Khu 6', 'Khu 7', 'Khu 8', 'Khu 9'
    ],
    lanh_dao_ky: 'Trần Văn Nam',
    chuc_danh_ky: 'CHỦ TỊCH',
    so_hieu_co_quan: 'UBND-VP',
    so_dien_thoai: '0210.384.xxxx',
    email_co_quan: 'ubnd.nongtrang@viettri.gov.vn'
  }
};

export const OrgProfileSetup: React.FC<OrgProfileSetupProps> = ({
  currentProfile,
  onSave,
  onNavigateToPromptLibrary,
  onNavigateToDrafting
}) => {
  const [profile, setProfile] = useState<OrgProfile>(() => {
    if (currentProfile) return currentProfile;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ivanban_org_profile');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return DEFAULT_ORG_PROFILE;
  });

  const [newThonName, setNewThonName] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (currentProfile) {
      setProfile(currentProfile);
    }
  }, [currentProfile]);

  const handleChange = (field: keyof OrgProfile, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddThon = () => {
    if (!newThonName.trim()) return;
    const trimmed = newThonName.trim();
    if (!profile.danh_sach_thon.includes(trimmed)) {
      setProfile(prev => ({
        ...prev,
        danh_sach_thon: [...prev.danh_sach_thon, trimmed]
      }));
    }
    setNewThonName('');
  };

  const handleRemoveThon = (index: number) => {
    setProfile(prev => ({
      ...prev,
      danh_sach_thon: prev.danh_sach_thon.filter((_, i) => i !== index)
    }));
  };

  const handleApplyPreset = (presetKey: string) => {
    const p = PRESETS[presetKey];
    if (p) {
      setProfile(p);
      setSaveSuccess(false);
    }
  };

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ivanban_org_profile', JSON.stringify(profile));
    }
    if (onSave) {
      onSave(profile);
    }
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 4000);
  };

  const handleReset = () => {
    if (confirm('Bạn có chắc muốn khôi phục thông số về mặc định Trường Đại học Hùng Vương?')) {
      setProfile(DEFAULT_ORG_PROFILE);
      if (typeof window !== 'undefined') {
        localStorage.setItem('ivanban_org_profile', JSON.stringify(DEFAULT_ORG_PROFILE));
      }
      if (onSave) {
        onSave(DEFAULT_ORG_PROFILE);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-8 pointer-events-none">
          <Building2 size={240} />
        </div>
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold mb-2">
                <Sparkles size={14} className="text-yellow-300" />
                Đồng bộ tự động toàn hệ thống
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Hồ Sơ Cơ Quan & Thông Số Địa Phương
              </h1>
              <p className="text-blue-100 text-sm md:text-base mt-1 max-w-2xl">
                Thiết lập thông số xã/phường của bạn một lần duy nhất. Toàn bộ 200 Prompt nghiệp vụ AI và phòng Soạn thảo iVANBAN sẽ tự động khớp dữ liệu chuẩn 100%.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition backdrop-blur-sm border border-white/20"
                title="Khôi phục mặc định"
              >
                <RotateCcw size={16} />
                Mặc định
              </button>
              <button
                onClick={handleSave}
                type="button"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-900/30 transition transform active:scale-95"
              >
                <Save size={16} />
                Lưu hồ sơ cơ quan
              </button>
            </div>
          </div>

          {/* Quick preset selector chips */}
          <div className="mt-5 pt-4 border-t border-white/20 flex flex-wrap items-center gap-2">
            <span className="text-xs text-blue-200 font-medium">Mẫu nhanh cơ quan:</span>
            <button
              onClick={() => handleApplyPreset('dai_hoc_hung_vuong')}
              type="button"
              className="px-3 py-1 bg-white/25 hover:bg-white/40 rounded-lg text-xs font-bold transition border border-white/20"
            >
              🎓 Trường ĐH Hùng Vương (Mặc định)
            </button>
            <button
              onClick={() => handleApplyPreset('tien_lu')}
              type="button"
              className="px-3 py-1 bg-white/15 hover:bg-white/30 rounded-lg text-xs font-medium transition border border-white/10"
            >
              🏛️ Xã Tiên Lữ (Phú Thọ) - 17 thôn
            </button>
            <button
              onClick={() => handleApplyPreset('nong_trang')}
              type="button"
              className="px-3 py-1 bg-white/15 hover:bg-white/30 rounded-lg text-xs font-medium transition border border-white/10"
            >
              🏙️ Phường Nông Trang (Việt Trì)
            </button>
          </div>
        </div>
      </div>

      {/* Save Success Alert */}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-5 py-4 rounded-xl shadow-sm flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">Đã lưu hồ sơ cơ quan thành công!</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Mọi Prompt trong Thư viện và công cụ Soạn thảo đã được cập nhật thông số theo: <strong>{profile.ten_co_quan}</strong>.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onNavigateToPromptLibrary && (
              <button
                onClick={onNavigateToPromptLibrary}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition"
              >
                Xem Thư viện Prompt <ArrowRight size={14} />
              </button>
            )}
            {onNavigateToDrafting && (
              <button
                onClick={onNavigateToDrafting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition"
              >
                Vào Soạn thảo <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Form sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Organization & Legal Info (2 cols wide) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Thông tin Hành chính Cơ quan */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Building2 size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">1. Thông tin Hành chính Cơ quan</h2>
                <p className="text-xs text-slate-500">Tên cơ quan theo đúng Quyết định thành lập và Nghị định 30/2020/NĐ-CP</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tên cơ quan ban hành */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tên cơ quan ban hành văn bản (Dòng 2 Header) *
                </label>
                <input
                  type="text"
                  value={profile.ten_co_quan}
                  onChange={e => handleChange('ten_co_quan', e.target.value)}
                  placeholder="Ví dụ: ỦY BAN NHÂN DÂN XÃ TIÊN LỮ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-slate-800 uppercase"
                />
                <p className="text-[11px] text-slate-500 mt-1">In hoa, căn giữa góc trên bên trái văn bản</p>
              </div>

              {/* Tên cơ quan cấp trên */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Cơ quan chủ quản / Cấp trên trực tiếp *
                </label>
                <input
                  type="text"
                  value={profile.ten_co_quan_chu_quan}
                  onChange={e => handleChange('ten_co_quan_chu_quan', e.target.value)}
                  placeholder="Ví dụ: UBND TỈNH PHÚ THỌ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-slate-800 uppercase"
                />
                <p className="text-[11px] text-slate-500 mt-1">Dòng trên tên cơ quan (cỡ 12-13pt)</p>
              </div>

              {/* Cấp đơn vị */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Cấp đơn vị hành chính *
                </label>
                <select
                  value={profile.cap_don_vi}
                  onChange={e => handleChange('cap_don_vi', e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-slate-800 bg-white"
                >
                  <option value="xa">Xã</option>
                  <option value="phuong">Phường</option>
                  <option value="thi_tran">Thị trấn</option>
                  <option value="huyen">Huyện / Quận / Thị xã</option>
                  <option value="khac">Đơn vị sự nghiệp / Khác</option>
                </select>
              </div>

              {/* Tên gọi ngắn gọn */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tên xã/phường rút gọn *
                </label>
                <input
                  type="text"
                  value={profile.ten_xa_phuong}
                  onChange={e => handleChange('ten_xa_phuong', e.target.value)}
                  placeholder="Ví dụ: Xã Tiên Lữ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800"
                />
              </div>

              {/* Tỉnh / Thành phố */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tỉnh / Thành phố trực thuộc *
                </label>
                <input
                  type="text"
                  value={profile.ten_tinh_tp}
                  onChange={e => handleChange('ten_tinh_tp', e.target.value)}
                  placeholder="Ví dụ: Tỉnh Phú Thọ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800"
                />
              </div>

              {/* Địa danh */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Địa danh ban hành văn bản *
                </label>
                <input
                  type="text"
                  value={profile.dia_danh}
                  onChange={e => handleChange('dia_danh', e.target.value)}
                  placeholder="Ví dụ: Tiên Lữ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800"
                />
                <p className="text-[11px] text-slate-500 mt-1">Xuất hiện ở cụm ngày tháng: &quot;Tiên Lữ, ngày... tháng... năm...&quot;</p>
              </div>

              {/* Trụ sở UBND */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Địa chỉ trụ sở UBND
                </label>
                <input
                  type="text"
                  value={profile.tru_so}
                  onChange={e => handleChange('tru_so', e.target.value)}
                  placeholder="Ví dụ: Thôn Tân Tiến, xã Tiên Lữ, tỉnh Phú Thọ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Thông tin Ký duyệt & Thẩm quyền */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <UserCheck size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">2. Thông tin Ký duyệt & Thẩm quyền</h2>
                <p className="text-xs text-slate-500">Mặc định hiển thị tại bảng Nơi nhận & Chữ ký cuối văn bản</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Người ký đại diện */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Họ và tên người ký *
                </label>
                <input
                  type="text"
                  value={profile.lanh_dao_ky}
                  onChange={e => handleChange('lanh_dao_ky', e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-slate-800"
                />
              </div>

              {/* Chức danh ký */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Quyền hạn & Chức vụ người ký *
                </label>
                <input
                  type="text"
                  value={profile.chuc_danh_ky}
                  onChange={e => handleChange('chuc_danh_ky', e.target.value)}
                  placeholder="Ví dụ: CHỦ TỊCH hoặc KT. CHỦ TỊCH - PHÓ CHỦ TỊCH"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-slate-800"
                />
              </div>

              {/* Ký hiệu viết tắt cơ quan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Ký hiệu cơ quan ban hành *
                </label>
                <input
                  type="text"
                  value={profile.so_hieu_co_quan}
                  onChange={e => handleChange('so_hieu_co_quan', e.target.value)}
                  placeholder="Ví dụ: UBND-VP (cho Công văn), QĐ-UBND (cho Quyết định)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800 font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">Xuất hiện ở Số: .../UBND-VP</p>
              </div>

              {/* Điện thoại liên hệ */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Số điện thoại công vụ
                </label>
                <input
                  type="text"
                  value={profile.so_dien_thoai || ''}
                  onChange={e => handleChange('so_dien_thoai', e.target.value)}
                  placeholder="Ví dụ: 0210.384.xxxx"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Village & Sub-units Management (1 col) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-4">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <MapPin size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Thôn / Khu Dân Cư</h3>
                  <p className="text-[11px] text-slate-500">
                    Tổng số: <span className="font-semibold text-amber-600">{profile.danh_sach_thon.length}</span> đơn vị
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              Danh sách thôn/khu sẽ tự động hiển thị trong dropdown chọn địa bàn cho 200 Prompt nghiệp vụ và phòng soạn thảo.
            </p>

            {/* Add new village */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newThonName}
                onChange={e => setNewThonName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddThon();
                  }
                }}
                placeholder="Thêm thôn mới..."
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-800"
              />
              <button
                type="button"
                onClick={handleAddThon}
                className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1"
              >
                <Plus size={14} /> Thêm
              </button>
            </div>

            {/* Village list chips */}
            <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
              {profile.danh_sach_thon.map((thon, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-amber-50/50 border border-slate-200/70 text-xs transition group"
                >
                  <span className="font-medium text-slate-700 flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-mono w-5">{idx + 1}.</span>
                    {thon}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveThon(idx)}
                    className="text-slate-400 hover:text-red-500 p-1 opacity-60 group-hover:opacity-100 transition"
                    title="Xóa thôn"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            {/* Quick reload unit buttons */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 gap-2">
              <button
                type="button"
                onClick={() => handleChange('danh_sach_thon', DEFAULT_ORG_PROFILE.danh_sach_thon)}
                className="hover:text-blue-600 font-medium transition text-[11px]"
              >
                ↻ Các Khoa/Phòng HVU
              </button>
              <button
                type="button"
                onClick={() => handleChange('danh_sach_thon', TIEN_LU_ORG_PROFILE.danh_sach_thon)}
                className="hover:text-amber-600 font-medium transition text-[11px]"
              >
                ↻ 17 thôn Xã Tiên Lữ
              </button>
            </div>

            {/* Bottom Save Reminder */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSave}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition shadow-md flex items-center justify-center gap-2"
              >
                <Save size={14} /> Lưu thay đổi hồ sơ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
