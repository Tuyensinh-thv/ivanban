import React, { useState } from 'react';
import {
  Scale,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Building2,
  BookOpen,
} from 'lucide-react';
import { JurisdictionCheckResult } from '../types/nd30';

interface JurisdictionCheckSectionProps {
  documentText: string;
  defaultLevel?: 'xa_phuong' | 'huyen_thanhpho' | 'tinh_so';
}

export const JurisdictionCheckSection: React.FC<JurisdictionCheckSectionProps> = ({
  documentText,
  defaultLevel = 'xa_phuong',
}) => {
  const [level, setLevel] = useState<'xa_phuong' | 'huyen_thanhpho' | 'tinh_so'>(defaultLevel);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<JurisdictionCheckResult | null>(null);

  const handleCheck = async (selectedLevel = level) => {
    if (!documentText.trim()) {
      alert('Vui lòng nhập hoặc có nội dung văn bản để kiểm tra thẩm quyền.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch('/api/ai/check-jurisdiction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText,
          administrativeLevel: selectedLevel,
        }),
      });

      if (!res.ok) {
        throw new Error('Không thể kiểm tra thẩm quyền');
      }

      const data: JurisdictionCheckResult = await res.json();
      setResult(data);
    } catch (err: any) {
      alert('Lỗi kiểm tra thẩm quyền: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
              Thẩm định Thẩm quyền Ban hành & Ký văn bản
            </h4>
            <p className="text-[11px] text-slate-500">
              Căn cứ Luật Tổ chức CQĐP và Điều 13 Nghị định 30/2020/NĐ-CP
            </p>
          </div>
        </div>

        {/* Level selector */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => {
              setLevel('xa_phuong');
              handleCheck('xa_phuong');
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              level === 'xa_phuong'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cấp Xã/Phường
          </button>
          <button
            type="button"
            onClick={() => {
              setLevel('huyen_thanhpho');
              handleCheck('huyen_thanhpho');
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              level === 'huyen_thanhpho'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cấp Huyện/TP
          </button>
          <button
            type="button"
            onClick={() => {
              setLevel('tinh_so');
              handleCheck('tinh_so');
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              level === 'tinh_so'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cấp Tỉnh/Sở
          </button>
        </div>
      </div>

      {/* Trigger Button if not checked */}
      {!result && (
        <div className="text-center py-4">
          <button
            type="button"
            onClick={() => handleCheck()}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-medium text-xs shadow-sm transition inline-flex items-center space-x-2"
          >
            <Scale className="w-4 h-4" />
            <span>{isLoading ? 'Đang thẩm định thẩm quyền...' : 'Bấm để Kiểm tra Thẩm quyền Cấp này'}</span>
          </button>
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="space-y-4 pt-1 animate-fadeIn">
          {/* Status Banner */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between ${
              result.riskLevel === 'safe'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : result.riskLevel === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              {result.riskLevel === 'safe' ? (
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : result.riskLevel === 'warning' ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <div>
                <span className="font-bold text-xs uppercase tracking-wider block">
                  {result.riskLevel === 'safe'
                    ? 'HỢP LỆ VỀ THẨM QUYỀN'
                    : result.riskLevel === 'warning'
                    ? 'CẢNH BÁO CẦN LƯU Ý'
                    : 'VI PHẠM THẨM QUYỀN BAN HÀNH'}
                </span>
                <span className="text-xs">
                  {result.isCompetent
                    ? 'Văn bản tuân thủ đúng chức năng và phân cấp quản lý nhà nước.'
                    : 'Phát hiện nội dung hoặc người ký vượt thẩm quyền cấp hành chính.'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleCheck()}
              disabled={isLoading}
              className="text-xs underline font-medium opacity-80 hover:opacity-100"
            >
              Kiểm tra lại
            </button>
          </div>

          {/* Form & Signer cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Form Authority */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  Thẩm quyền về Hình thức Văn bản
                </span>
                {result.formAuthority.isValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600" />
                )}
              </div>
              <p className="text-slate-600">{result.formAuthority.details}</p>
              <div className="text-[11px] text-slate-400 italic">Áp dụng: {result.formAuthority.rule}</div>
            </div>

            {/* Signer Authority */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-purple-600" />
                  Thẩm quyền về Người ký ({result.signerAuthority.signerPrefix || 'CHỦ TỊCH'})
                </span>
                {result.signerAuthority.isValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600" />
                )}
              </div>
              <p className="text-slate-600">{result.signerAuthority.details}</p>
              <div className="text-[11px] text-slate-400 italic">Áp dụng: {result.signerAuthority.rule}</div>
            </div>
          </div>

          {/* Recommendations */}
          {result.recommendations && result.recommendations.length > 0 && (
            <div className="bg-purple-50/60 p-3 rounded-xl border border-purple-100 text-xs text-purple-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-purple-900">
                <BookOpen className="w-3.5 h-3.5" />
                Khuyến nghị nghiệp vụ cho cán bộ:
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-purple-900/90 pl-1">
                {result.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
