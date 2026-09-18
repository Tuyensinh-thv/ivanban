'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface UserItem {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  organization: string;
  role: 'admin' | 'user';
  status: 'active' | 'pending' | 'blocked';
  created_at: string;
}

interface ApiKeysConfig {
  gemini: string[];
  groq: string[];
  deepseek: string[];
}

interface DriveConfig {
  folder_id: string;
  folder_name: string;
  is_connected: boolean;
  service_email?: string;
}

interface DashboardStats {
  docByType: { doc_type: string; count: number }[];
  auditStats: { total_audits: number; avg_score: number };
  apiStats24h: { provider: string; status: string; count: number; avg_duration: number }[];
  userStats: { total: number; active: number; pending: number };
  recentActivities: ActivityLog[];
  pendingLegalCount: number;
  dailyStats: { date: string; drafts: number; audits: number; logins: number }[];
}

interface ActivityLog {
  id: string;
  user_email: string;
  user_name: string;
  action_type: string;
  description: string;
  metadata: Record<string, unknown>;
  ip_address: string;
  created_at: string;
}

interface LegalBase {
  id: string;
  code: string;
  title: string;
  issuer: string;
  category: string;
  status: 'active' | 'pending' | 'archived';
  source_type: string;
  source_doc_name: string;
  created_at: string;
}

type TabType = 'dashboard' | 'activity' | 'legal' | 'users' | 'settings';

const ACTION_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  draft_create: { label: 'Soạn thảo', color: 'bg-blue-100 text-blue-800' },
  document_audit: { label: 'Soát lỗi', color: 'bg-teal-100 text-teal-800' },
  user_login: { label: 'Đăng nhập', color: 'bg-emerald-100 text-emerald-800' },
  user_login_failed: { label: 'Đăng nhập lỗi', color: 'bg-red-100 text-red-800' },
  user_register: { label: 'Đăng ký', color: 'bg-cyan-100 text-cyan-800' },
  config_update: { label: 'Cấu hình', color: 'bg-amber-100 text-amber-800' },
  legal_base_approve: { label: 'Duyệt PL', color: 'bg-indigo-100 text-indigo-800' },
  legal_base_reject: { label: 'Từ chối PL', color: 'bg-rose-100 text-rose-800' },
  user_status_change: { label: 'Đổi TT', color: 'bg-orange-100 text-orange-800' },
  api_key_update: { label: 'API Key', color: 'bg-violet-100 text-violet-800' },
};

const DOC_TYPE_COLORS: Record<string, string> = {
  'QUYẾT ĐỊNH': '#3B82F6',
  'CÔNG VĂN': '#10B981',
  'TỜ TRÌNH': '#F59E0B',
  'BÁO CÁO': '#8B5CF6',
  'KẾ HOẠCH': '#EC4899',
  'THÔNG BÁO': '#06B6D4',
  'GIẤY MỜI': '#F97316',
  'ĐỀ ÁN': '#6366F1',
  'unknown': '#94A3B8',
};

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminPortal() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserItem | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Dashboard
  const [dashStats, setDashStats] = useState<DashboardStats | null>(null);
  const [dashLoading, setDashLoading] = useState(false);

  // Users
  const [users, setUsers] = useState<UserItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Activity Logs
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [activityPage, setActivityPage] = useState(1);
  const [activityTotal, setActivityTotal] = useState(0);
  const [activityFilter, setActivityFilter] = useState('all');
  const [activitySearch, setActivitySearch] = useState('');
  const [activityLoading, setActivityLoading] = useState(false);

  // Legal Bases
  const [legalBases, setLegalBases] = useState<LegalBase[]>([]);
  const [legalFilter, setLegalFilter] = useState<string>('all');
  const [legalSearch, setLegalSearch] = useState('');
  const [legalLoading, setLegalLoading] = useState(false);

  // API Keys / Drive / Guest
  const [apiKeys, setApiKeys] = useState<ApiKeysConfig>({ gemini: [], groq: [], deepseek: [] });
  const [newGeminiKey, setNewGeminiKey] = useState('');
  const [newGroqKey, setNewGroqKey] = useState('');
  const [newDeepSeekKey, setNewDeepSeekKey] = useState('');
  const [driveConfig, setDriveConfig] = useState<DriveConfig>({
    folder_id: '',
    folder_name: 'Kho Văn bản Mẫu HVU',
    is_connected: false,
  });
  const [guestMaxDocs, setGuestMaxDocs] = useState(1);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Auth check
  useEffect(() => {
    async function checkAdmin() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (!data.authenticated || data.user?.role !== 'admin') {
          router.push('/');
          return;
        }
        setCurrentUser(data.user);
        setIsLoadingAuth(false);
      } catch {
        router.push('/');
      }
    }
    checkAdmin();
  }, [router]);

  // Load data when tab changes
  useEffect(() => {
    if (isLoadingAuth) return;
    if (activeTab === 'dashboard') loadDashboard();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'activity') loadActivityLogs();
    if (activeTab === 'legal') loadLegalBases();
    if (activeTab === 'settings') loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isLoadingAuth]);

  const loadDashboard = async () => {
    setDashLoading(true);
    try {
      const res = await fetch('/api/admin/dashboard/stats');
      const data = await res.json();
      if (data.success) setDashStats(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setDashLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadActivityLogs = useCallback(async () => {
    setActivityLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(activityPage),
        limit: '20',
      });
      if (activityFilter !== 'all') params.set('action_type', activityFilter);
      if (activitySearch) params.set('search', activitySearch);

      const res = await fetch(`/api/admin/activity-logs?${params}`);
      const data = await res.json();
      if (data.success) {
        setActivityLogs(data.data);
        setActivityTotal(data.pagination.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActivityLoading(false);
    }
  }, [activityPage, activityFilter, activitySearch]);

  useEffect(() => {
    if (activeTab === 'activity') loadActivityLogs();
  }, [activeTab, activityPage, activityFilter, loadActivityLogs]);

  const loadLegalBases = async () => {
    setLegalLoading(true);
    try {
      const params = new URLSearchParams();
      if (legalFilter !== 'all') params.set('status', legalFilter);
      if (legalSearch) params.set('search', legalSearch);

      const res = await fetch(`/api/legal-bases?${params}`);
      const data = await res.json();
      if (data.success) setLegalBases(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLegalLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success && data.data) {
        if (data.data.api_keys) setApiKeys(data.data.api_keys);
        if (data.data.drive_config) setDriveConfig(data.data.drive_config);
        if (data.data.guest_limit?.max_docs !== undefined) {
          setGuestMaxDocs(data.data.guest_limit.max_docs);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateUserStatus = async (id: string, status: 'active' | 'blocked' | 'pending') => {
    setActionLoadingId(id);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));
      } else {
        alert(data.error || 'Có lỗi xảy ra');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleAdminRole = async (id: string, currentRole: 'admin' | 'user') => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`Bạn có chắc muốn ${newRole === 'admin' ? 'cấp quyền Quản trị viên' : 'gỡ quyền Quản trị viên'} cho cán bộ này?`)) return;

    setActionLoadingId(id);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: newRole } : u)));
      } else {
        alert(data.error || 'Có lỗi xảy ra');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleApproveLegal = async (id: string) => {
    try {
      const res = await fetch('/api/legal-bases', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'active' }),
      });
      const data = await res.json();
      if (data.success) {
        setLegalBases((prev) => prev.map((lb) => (lb.id === id ? { ...lb, status: 'active' } : lb)));
        showSuccess('Đã phê duyệt căn cứ pháp lý');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleArchiveLegal = async (id: string) => {
    try {
      const res = await fetch('/api/legal-bases', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'archived' }),
      });
      const data = await res.json();
      if (data.success) {
        setLegalBases((prev) => prev.filter((lb) => lb.id !== id));
        showSuccess('Đã lưu trữ căn cứ pháp lý');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveApiKeys = async () => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'api_keys',
          value: apiKeys,
          description: 'Danh sách API Keys xoay vòng miễn phí',
        }),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess('Đã cập nhật danh sách API Keys thành công!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveDriveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'drive_config',
          value: driveConfig,
          description: 'Cấu hình thư mục Google Drive dùng chung của Trường HVU',
        }),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess('Đã lưu thông số Google Drive thành công!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveGeneralSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'guest_limit',
          value: { max_docs: Number(guestMaxDocs), allow_trial: true },
          description: 'Số lượng văn bản tạo cho khách chưa đăng nhập',
        }),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess('Đã lưu cấu hình giới hạn Guest thành công!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const showSuccess = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-600">Đang kiểm tra quyền Quản trị viên...</p>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.organization && u.organization.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.phone && u.phone.includes(searchTerm));
    const matchStatus = filterStatus === 'all' || u.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const pendingCount = users.filter((u) => u.status === 'pending').length;
  const pendingLegalCount = dashStats?.pendingLegalCount || legalBases.filter((lb) => lb.status === 'pending').length;

  // Compute API stats for dashboard
  const totalApiCalls = dashStats?.apiStats24h?.reduce((s, r) => s + r.count, 0) || 0;
  const successApiCalls = dashStats?.apiStats24h?.filter((r) => r.status === 'success').reduce((s, r) => s + r.count, 0) || 0;
  const failedApiCalls = totalApiCalls - successApiCalls;
  const apiSuccessRate = totalApiCalls > 0 ? Math.round((successApiCalls / totalApiCalls) * 100) : 0;

  const TABS: { key: TabType; label: string; icon: string; badge?: number }[] = [
    { key: 'dashboard', label: 'Bảng Điều Khiển', icon: '📊' },
    { key: 'activity', label: 'Nhật ký Hoạt động', icon: '📜' },
    { key: 'legal', label: 'Kho Căn cứ Pháp lý', icon: '⚖️', badge: pendingLegalCount },
    { key: 'users', label: 'Quản lý Cán bộ', icon: '👥', badge: pendingCount },
    { key: 'settings', label: 'Cấu hình Hệ thống', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center p-1">
              <Image src="/hvu-logo.png" alt="HVU Logo" width={36} height={36} className="object-contain" priority />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg text-slate-900">iVanban Admin</span>
                <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-bold">Hệ Thống</span>
              </div>
              <p className="text-xs text-slate-500">Cổng Quản trị Trường Đại học Hùng Vương</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <span>← Về Soạn thảo</span>
            </Link>

            <div className="h-5 w-px bg-slate-200"></div>

            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-900">{currentUser?.full_name}</div>
                <div className="text-[11px] text-slate-500">{currentUser?.email}</div>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg font-medium transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-3.5 px-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>{tab.icon} {tab.label}</span>
              {tab.badge && tab.badge > 0 ? (
                <span className="bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold min-w-[20px] text-center animate-pulse">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 w-full">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2">
            <span>✓</span> {saveSuccessMsg}
          </div>
        </div>
      )}

      {/* Tab Contents */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">

        {/* ═══ TAB 1: DASHBOARD ═══ */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {dashLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-sm text-slate-500">Đang tải thống kê...</span>
              </div>
            ) : dashStats ? (
              <>
                {/* KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-xs font-semibold text-slate-500">Tổng Văn bản Đã Tạo</div>
                    <div className="text-2xl font-extrabold text-slate-900 mt-1">
                      {dashStats.docByType.reduce((s, d) => s + d.count, 0)}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{dashStats.docByType.length} loại văn bản</div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-xs font-semibold text-teal-600">Lượt Soát lỗi</div>
                    <div className="text-2xl font-extrabold text-teal-700 mt-1">{dashStats.auditStats.total_audits}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Điểm TB: <strong className="text-slate-700">{dashStats.auditStats.avg_score || 'N/A'}</strong>/100
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-xs font-semibold text-blue-600">Cán bộ Đang Hoạt động</div>
                    <div className="text-2xl font-extrabold text-blue-700 mt-1">{dashStats.userStats.active}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Tổng: {dashStats.userStats.total} | Chờ: {dashStats.userStats.pending}
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-xs font-semibold text-amber-600">API 24h</div>
                    <div className="text-2xl font-extrabold text-amber-700 mt-1">{totalApiCalls}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      ✓ {successApiCalls} | ✗ {failedApiCalls} | {apiSuccessRate}% OK
                    </div>
                  </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Document Distribution */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-sm text-slate-900 mb-4">📊 Phân Bổ Loại Văn bản</h3>
                    {dashStats.docByType.length === 0 ? (
                      <p className="text-xs text-slate-400 py-8 text-center">Chưa có dữ liệu soạn thảo</p>
                    ) : (
                      <div className="space-y-2.5">
                        {dashStats.docByType.map((item) => {
                          const totalDocs = dashStats.docByType.reduce((s, d) => s + d.count, 0);
                          const pct = totalDocs > 0 ? Math.round((item.count / totalDocs) * 100) : 0;
                          const color = DOC_TYPE_COLORS[item.doc_type] || DOC_TYPE_COLORS['unknown'];
                          return (
                            <div key={item.doc_type}>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="font-semibold text-slate-700">{item.doc_type || 'Khác'}</span>
                                <span className="font-bold text-slate-900">{item.count} <span className="text-slate-400 font-normal">({pct}%)</span></span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2.5">
                                <div
                                  className="h-2.5 rounded-full transition-all duration-500"
                                  style={{ width: `${pct}%`, backgroundColor: color }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* API Usage Monitor */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-sm text-slate-900 mb-4">🔌 Giám sát API (24h qua)</h3>
                    {dashStats.apiStats24h.length === 0 ? (
                      <p className="text-xs text-slate-400 py-8 text-center">Chưa có lượt gọi API</p>
                    ) : (
                      <div className="space-y-3">
                        {/* Success rate gauge */}
                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                          <div className="relative w-16 h-16">
                            <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E2E8F0" strokeWidth="3" />
                              <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke={apiSuccessRate >= 90 ? '#10B981' : apiSuccessRate >= 70 ? '#F59E0B' : '#EF4444'}
                                strokeWidth="3"
                                strokeDasharray={`${apiSuccessRate}, 100`}
                              />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-extrabold text-slate-800">{apiSuccessRate}%</span>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800">Tỷ lệ Phản hồi Thành công</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {successApiCalls} thành công / {failedApiCalls} lỗi (429/503)
                            </div>
                          </div>
                        </div>

                        {/* Per-provider breakdown */}
                        <div className="space-y-1.5">
                          {dashStats.apiStats24h.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs">
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${item.status === 'success' ? 'bg-emerald-500' : item.status === 'rate_limited' ? 'bg-amber-500' : 'bg-red-500'}`}></span>
                                <span className="font-semibold text-slate-700 capitalize">{item.provider}</span>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${item.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                  {item.status}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-slate-800">{item.count}</span>
                                {item.avg_duration && <span className="text-slate-400 ml-1.5">~{item.avg_duration}ms</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Activities */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-sm text-slate-900">🕐 Hoạt Động Gần Đây</h3>
                    <button
                      onClick={() => setActiveTab('activity')}
                      className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Xem toàn bộ →
                    </button>
                  </div>
                  {dashStats.recentActivities.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">Chưa có hoạt động nào</p>
                  ) : (
                    <div className="space-y-2">
                      {dashStats.recentActivities.map((act, idx) => {
                        const typeInfo = ACTION_TYPE_LABELS[act.action_type] || { label: act.action_type, color: 'bg-slate-100 text-slate-700' };
                        return (
                          <div key={idx} className="flex items-center gap-3 p-2.5 hover:bg-slate-50 rounded-lg transition-colors">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${typeInfo.color} whitespace-nowrap`}>
                              {typeInfo.label}
                            </span>
                            <span className="text-xs text-slate-700 flex-1 truncate">{act.description}</span>
                            <span className="text-[11px] text-slate-400 whitespace-nowrap">{formatTime(act.created_at)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <p className="text-sm text-slate-500">Không thể tải dữ liệu Dashboard</p>
                <button onClick={loadDashboard} className="mt-3 text-xs text-blue-600 hover:text-blue-700 font-semibold">Thử lại</button>
              </div>
            )}
          </div>
        )}

        {/* ═══ TAB 2: NHẬT KÝ HOẠT ĐỘNG ═══ */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Tìm theo tên, email, IP..."
                  value={activitySearch}
                  onChange={(e) => { setActivitySearch(e.target.value); setActivityPage(1); }}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={activityFilter}
                  onChange={(e) => { setActivityFilter(e.target.value); setActivityPage(1); }}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả hành động</option>
                  <option value="draft_create">Soạn thảo</option>
                  <option value="document_audit">Soát lỗi</option>
                  <option value="user_login">Đăng nhập</option>
                  <option value="user_login_failed">Đăng nhập lỗi</option>
                  <option value="config_update">Cấu hình</option>
                  <option value="legal_base_approve">Duyệt PL</option>
                </select>
                <button
                  onClick={() => loadActivityLogs()}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
                >
                  Làm mới
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {activityLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-2 text-xs text-slate-500">Đang tải...</span>
                </div>
              ) : activityLogs.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">Chưa có nhật ký hoạt động nào</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                        <tr>
                          <th className="px-5 py-3">Thời gian</th>
                          <th className="px-5 py-3">Loại</th>
                          <th className="px-5 py-3">Cán bộ</th>
                          <th className="px-5 py-3">Mô tả</th>
                          <th className="px-5 py-3">IP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {activityLogs.map((log) => {
                          const typeInfo = ACTION_TYPE_LABELS[log.action_type] || { label: log.action_type, color: 'bg-slate-100 text-slate-700' };
                          return (
                            <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="px-5 py-3 whitespace-nowrap text-slate-500">{formatTime(log.created_at)}</td>
                              <td className="px-5 py-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${typeInfo.color}`}>{typeInfo.label}</span>
                              </td>
                              <td className="px-5 py-3">
                                <div className="font-semibold text-slate-800">{log.user_name || 'Khách'}</div>
                                <div className="text-slate-400 text-[11px]">{log.user_email || '-'}</div>
                              </td>
                              <td className="px-5 py-3 text-slate-700 max-w-xs truncate">{log.description}</td>
                              <td className="px-5 py-3 font-mono text-slate-400">{log.ip_address}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination */}
                  <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50">
                    <span className="text-xs text-slate-500">Tổng: <strong>{activityTotal}</strong> bản ghi</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        disabled={activityPage <= 1}
                        onClick={() => setActivityPage((p) => p - 1)}
                        className="px-3 py-1 text-xs rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 font-medium"
                      >
                        ← Trước
                      </button>
                      <span className="text-xs text-slate-600 font-semibold px-2">Trang {activityPage}</span>
                      <button
                        disabled={activityLogs.length < 20}
                        onClick={() => setActivityPage((p) => p + 1)}
                        className="px-3 py-1 text-xs rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 font-medium"
                      >
                        Sau →
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ═══ TAB 3: KHO CĂN CỨ PHÁP LÝ ═══ */}
        {activeTab === 'legal' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Tìm theo tên, mã, cơ quan ban hành..."
                  value={legalSearch}
                  onChange={(e) => setLegalSearch(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={legalFilter}
                  onChange={(e) => setLegalFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="pending">⏳ Chờ phê duyệt</option>
                  <option value="active">✅ Đang hoạt động</option>
                  <option value="archived">🗄️ Đã lưu trữ</option>
                </select>
                <button
                  onClick={loadLegalBases}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
                >
                  Làm mới
                </button>
              </div>
            </div>

            {/* Pending Alert */}
            {legalBases.filter((lb) => lb.status === 'pending').length > 0 && legalFilter !== 'active' && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-4 py-3 rounded-xl font-semibold flex items-center gap-2">
                <span>⚠️</span>
                Có <strong>{legalBases.filter((lb) => lb.status === 'pending').length}</strong> căn cứ pháp lý được hệ thống tự động bóc tách từ văn bản — cần phê duyệt.
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {legalLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : legalBases.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">Không có căn cứ pháp lý nào</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="px-5 py-3">Tiêu đề / Mã</th>
                        <th className="px-5 py-3">Trạng thái</th>
                        <th className="px-5 py-3">Nguồn</th>
                        <th className="px-5 py-3">Ngày tạo</th>
                        <th className="px-5 py-3 text-right">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {legalBases.map((lb) => (
                        <tr key={lb.id} className={`hover:bg-slate-50/70 transition-colors ${lb.status === 'pending' ? 'bg-amber-50/30' : ''}`}>
                          <td className="px-5 py-3">
                            <div className="font-semibold text-slate-800 max-w-md">{lb.title}</div>
                            {lb.code && <div className="text-[11px] text-slate-400 mt-0.5">{lb.code}</div>}
                          </td>
                          <td className="px-5 py-3">
                            {lb.status === 'active' && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Hoạt động</span>}
                            {lb.status === 'pending' && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 animate-pulse">Chờ duyệt</span>}
                            {lb.status === 'archived' && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">Lưu trữ</span>}
                          </td>
                          <td className="px-5 py-3">
                            {lb.source_type === 'harvested_from_doc' ? (
                              <span className="text-[11px] text-blue-600 font-medium">🤖 Tự động bóc tách</span>
                            ) : (
                              <span className="text-[11px] text-slate-500">Nhập thủ công</span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{formatTime(lb.created_at)}</td>
                          <td className="px-5 py-3 text-right space-x-1.5">
                            {lb.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApproveLegal(lb.id)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors text-[11px]"
                                >
                                  ✓ Duyệt
                                </button>
                                <button
                                  onClick={() => handleArchiveLegal(lb.id)}
                                  className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-colors text-[11px]"
                                >
                                  Bỏ qua
                                </button>
                              </>
                            )}
                            {lb.status === 'active' && (
                              <button
                                onClick={() => handleArchiveLegal(lb.id)}
                                className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 font-medium transition-colors text-[11px]"
                              >
                                Lưu trữ
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ TAB 4: QUẢN LÝ CÁN BỘ ═══ */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-xs font-semibold text-slate-500">Tổng số tài khoản</div>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">{users.length}</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-xs font-semibold text-amber-600">Đang chờ phê duyệt</div>
                <div className="text-2xl font-extrabold text-amber-600 mt-1">{pendingCount}</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-xs font-semibold text-emerald-600">Đang hoạt động</div>
                <div className="text-2xl font-extrabold text-emerald-600 mt-1">
                  {users.filter((u) => u.status === 'active').length}
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Tìm theo tên, email, SĐT, cơ quan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <span className="text-xs text-slate-500 font-medium">Lọc:</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="pending">Chờ phê duyệt</option>
                  <option value="active">Đang hoạt động</option>
                  <option value="blocked">Đã tạm khóa</option>
                </select>
                <button
                  onClick={loadUsers}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
                >
                  Làm mới
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-5 py-3.5">Cán bộ / Đơn vị</th>
                      <th className="px-5 py-3.5">Liên hệ (Email & SĐT)</th>
                      <th className="px-5 py-3.5">Vai trò</th>
                      <th className="px-5 py-3.5">Trạng thái</th>
                      <th className="px-5 py-3.5 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                          Không có tài khoản nào phù hợp với bộ lọc.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-4">
                            <div className="font-bold text-slate-900 text-sm">{u.full_name}</div>
                            <div className="text-slate-500 font-medium mt-0.5">{u.organization || 'Chưa cập nhật'}</div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="font-medium text-slate-800">{u.email}</div>
                            <div className="text-slate-500 mt-0.5">{u.phone || 'Chưa có SĐT'}</div>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${
                                u.role === 'admin'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {u.role === 'admin' ? 'Quản trị viên' : 'Cán bộ'}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            {u.status === 'active' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                                <span className="w-1.5 h-1.5 mr-1 bg-emerald-500 rounded-full"></span>
                                Hoạt động
                              </span>
                            )}
                            {u.status === 'pending' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
                                <span className="w-1.5 h-1.5 mr-1 bg-amber-500 rounded-full animate-ping"></span>
                                Chờ phê duyệt
                              </span>
                            )}
                            {u.status === 'blocked' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-red-100 text-red-800">
                                Đã khóa
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right space-x-1.5">
                            {u.status === 'pending' && (
                              <button
                                disabled={actionLoadingId === u.id}
                                onClick={() => handleUpdateUserStatus(u.id, 'active')}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors shadow-sm"
                              >
                                Duyệt ngay
                              </button>
                            )}
                            {u.status === 'active' && (
                              <button
                                disabled={actionLoadingId === u.id || u.id === currentUser?.id}
                                onClick={() => handleUpdateUserStatus(u.id, 'blocked')}
                                className="px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-medium transition-colors"
                              >
                                Tạm khóa
                              </button>
                            )}
                            {u.status === 'blocked' && (
                              <button
                                disabled={actionLoadingId === u.id}
                                onClick={() => handleUpdateUserStatus(u.id, 'active')}
                                className="px-2.5 py-1.5 rounded-lg border border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-medium transition-colors"
                              >
                                Mở khóa
                              </button>
                            )}
                            {u.id !== currentUser?.id && (
                              <button
                                disabled={actionLoadingId === u.id}
                                onClick={() => handleToggleAdminRole(u.id, u.role)}
                                className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium transition-colors"
                              >
                                {u.role === 'admin' ? 'Hạ quyền' : 'Cấp Admin'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═══ TAB 5: CẤU HÌNH HỆ THỐNG ═══ */}
        {activeTab === 'settings' && (
          <div className="max-w-4xl space-y-6">
            {/* API Keys */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-base text-slate-900">🔑 Quản lý API Keys Xoay Vòng Miễn Phí (Zero-Cost Pool)</h3>
              <p className="text-xs text-slate-500 mt-1">
                Các keys nhập vào đây được lưu mã hóa an toàn trong PostgreSQL. Khi một key chạm hạn mức (Rate Limit / 429), hệ thống tự động nhảy sang key kế tiếp.
              </p>

              {/* Gemini Section */}
              <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-slate-800">1. Google Gemini Keys (Free 15 RPM)</div>
                  <span className="text-xs text-slate-500">{apiKeys.gemini?.length || 0} keys đã nạp</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="Dán mã Gemini API Key mới..."
                    value={newGeminiKey}
                    onChange={(e) => setNewGeminiKey(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => { if (!newGeminiKey.trim()) return; setApiKeys((prev) => ({ ...prev, gemini: [...(prev.gemini || []), newGeminiKey.trim()] })); setNewGeminiKey(''); }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
                  >
                    + Thêm Key
                  </button>
                </div>
                {apiKeys.gemini && apiKeys.gemini.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    {apiKeys.gemini.map((k, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs border border-slate-200">
                        <span className="font-mono text-slate-700">••••••••••••••••{k.slice(-6)}</span>
                        <button type="button" onClick={() => setApiKeys((prev) => ({ ...prev, gemini: prev.gemini.filter((_, i) => i !== idx) }))} className="text-red-500 hover:text-red-700 font-semibold text-xs">Xóa</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Groq Section */}
              <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-slate-800">2. Groq Cloud Keys (Dự phòng siêu tốc)</div>
                  <span className="text-xs text-slate-500">{apiKeys.groq?.length || 0} keys đã nạp</span>
                </div>
                <div className="flex gap-2">
                  <input type="password" placeholder="Dán mã Groq API Key mới..." value={newGroqKey} onChange={(e) => setNewGroqKey(e.target.value)} className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <button type="button" onClick={() => { if (!newGroqKey.trim()) return; setApiKeys((prev) => ({ ...prev, groq: [...(prev.groq || []), newGroqKey.trim()] })); setNewGroqKey(''); }} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold">+ Thêm Key</button>
                </div>
                {apiKeys.groq && apiKeys.groq.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    {apiKeys.groq.map((k, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs border border-slate-200">
                        <span className="font-mono text-slate-700">••••••••••••••••{k.slice(-6)}</span>
                        <button type="button" onClick={() => setApiKeys((prev) => ({ ...prev, groq: prev.groq.filter((_, i) => i !== idx) }))} className="text-red-500 hover:text-red-700 font-semibold text-xs">Xóa</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* DeepSeek Section */}
              <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-slate-800">3. DeepSeek / OpenRouter Keys</div>
                  <span className="text-xs text-slate-500">{apiKeys.deepseek?.length || 0} keys đã nạp</span>
                </div>
                <div className="flex gap-2">
                  <input type="password" placeholder="Dán mã DeepSeek API Key mới..." value={newDeepSeekKey} onChange={(e) => setNewDeepSeekKey(e.target.value)} className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <button type="button" onClick={() => { if (!newDeepSeekKey.trim()) return; setApiKeys((prev) => ({ ...prev, deepseek: [...(prev.deepseek || []), newDeepSeekKey.trim()] })); setNewDeepSeekKey(''); }} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold">+ Thêm Key</button>
                </div>
                {apiKeys.deepseek && apiKeys.deepseek.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    {apiKeys.deepseek.map((k, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs border border-slate-200">
                        <span className="font-mono text-slate-700">••••••••••••••••{k.slice(-6)}</span>
                        <button type="button" onClick={() => setApiKeys((prev) => ({ ...prev, deepseek: prev.deepseek.filter((_, i) => i !== idx) }))} className="text-red-500 hover:text-red-700 font-semibold text-xs">Xóa</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end">
                <button type="button" onClick={handleSaveApiKeys} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm">
                  💾 Lưu Cấu Hình API Keys
                </button>
              </div>
            </div>

            {/* Google Drive */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-base text-slate-900">📁 Cấu hình Thư mục Google Drive Nhà Trường</h3>
              <p className="text-xs text-slate-500 mt-1">
                Kết nối thư mục Drive chứa các văn bản mẫu (.docx) và căn cứ pháp lý đã ban hành của Trường ĐH Hùng Vương.
              </p>
              <form onSubmit={handleSaveDriveConfig} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Google Drive Folder ID (Mã thư mục)</label>
                  <input type="text" placeholder="Ví dụ: 1a2B3c4D5e6F7g8H9..." value={driveConfig.folder_id} onChange={(e) => setDriveConfig({ ...driveConfig, folder_id: e.target.value })} className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Lấy ID từ thanh địa chỉ trình duyệt: <code>drive.google.com/drive/folders/<strong>FOLDER_ID</strong></code>
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Tên hiển thị thư mục</label>
                  <input type="text" value={driveConfig.folder_name} onChange={(e) => setDriveConfig({ ...driveConfig, folder_name: e.target.value })} className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 leading-relaxed">
                  📌 <strong>Hướng dẫn phân quyền:</strong> Bạn chỉ cần chia sẻ (Share) thư mục Google Drive trên cho tài khoản công vụ của hệ thống với quyền <em>&ldquo;Người xem (Viewer)&rdquo;</em>.
                </div>
                <div className="flex justify-end pt-3">
                  <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm">💾 Lưu Cấu Hình Drive</button>
                </div>
              </form>
            </div>

            {/* Guest Limit */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-base text-slate-900">🚫 Giới hạn Người dùng Vãng lai (Guest)</h3>
              <p className="text-xs text-slate-500 mt-1">
                Quy định số lượng văn bản tối đa khách được tạo thử trước khi bắt buộc đăng ký tài khoản cán bộ.
              </p>
              <form onSubmit={handleSaveGeneralSettings} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Số văn bản tối đa cho Guest (chưa đăng nhập)</label>
                  <input type="number" min={1} max={10} value={guestMaxDocs} onChange={(e) => setGuestMaxDocs(Number(e.target.value))} className="w-32 px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <span className="text-[11px] text-slate-500 mt-1 block">Theo yêu cầu hiện tại: Thiết lập là <strong>1</strong> văn bản.</span>
                </div>
                <div className="flex justify-end pt-3">
                  <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm">💾 Cập Nhật Giới Hạn</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
