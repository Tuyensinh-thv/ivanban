import React, { useState } from 'react';
import {
  Mail,
  FileCheck2,
  Clock,
  ListOrdered,
  Download,
  X,
  RotateCcw,
  Send,
  Building,
} from 'lucide-react';
import { IncomingDispatchAnalysis, ND30Document } from '../types/nd30';
import { DocumentA4Preview } from './DocumentA4Preview';
import { DocumentUploadZone } from './DocumentUploadZone';
import { exportND30ToDocx } from '../lib/docxGenerator';

interface DispatchReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyToDrafting?: (doc: ND30Document) => void;
}

const SAMPLE_INCOMING_DISPATCH = `ỦY BAN NHÂN DÂN
THÀNH PHỐ VIỆT TRÌ
Số: 215/UBND-VP
V/v Tăng cường rà soát thể thức văn bản và đẩy mạnh chuyển đổi số hành chính năm 2026

CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
Việt Trì, ngày 18 tháng 6 năm 2026

Kính gửi: 
- Trưởng các phòng, ban, đơn vị trực thuộc UBND thành phố;
- Chủ tịch UBND các phường, xã trên địa bàn thành phố Việt Trì.

Thực hiện Kế hoạch số 45/KH-UBND của UBND tỉnh Phú Thọ về cải cách hành chính và chỉ đạo của Thường trực Thành ủy Việt Trì; nhằm chấn chỉnh kỷ luật, kỷ cương trong công tác văn thư và nâng cao chỉ số phục vụ người dân, doanh nghiệp, Chủ tịch UBND thành phố Việt Trì yêu cầu:

1. Thủ trưởng các cơ quan, đơn vị, Chủ tịch UBND các phường, xã chỉ đạo khẩn trương tự kiểm tra, rà soát 100% các văn bản hành chính (Quyết định, Công văn, Tờ trình) đã ban hành trong 6 tháng đầu năm 2026, bảo đảm tuân thủ nghiêm ngặt Nghị định số 30/2020/NĐ-CP của Chính phủ.
2. Tích cực ứng dụng Trợ lý ảo AI của Trường Đại học Hùng Vương trong hỗ trợ thẩm định, soát lỗi chính tả, thể thức và căn cứ pháp luật trước khi ký số ban hành.
3. Báo cáo kết quả rà soát và đề xuất giải pháp gửi về UBND thành phố (qua Văn phòng HĐND & UBND thành phố) trước ngày 28 tháng 6 năm 2026 để tổng hợp báo cáo UBND tỉnh.

Yêu cầu các đơn vị, địa phương nghiêm túc triển khai thực hiện./.

Nơi nhận:
- Như trên;
- Chủ tịch, các PCT UBND thành phố;
- Lưu: VT, VP.

CHỦ TỊCH
(Đã ký)
Nguyễn Văn B`;

export const DispatchReplyModal: React.FC<DispatchReplyModalProps> = ({
  isOpen,
  onClose,
  onApplyToDrafting,
}) => {
  const [incomingText, setIncomingText] = useState<string>(SAMPLE_INCOMING_DISPATCH);
  const [replyType, setReplyType] = useState<'CÔNG VĂN' | 'BÁO CÁO'>('CÔNG VĂN');
  const [agencyName, setAgencyName] = useState<string>('TRƯỜNG ĐẠI HỌC HÙNG VƯƠNG');
  const [superiorAgency, setSuperiorAgency] = useState<string>('ỦY BAN NHÂN DÂN TỈNH PHÚ THỌ');
  const [customNotes, setCustomNotes] = useState<string>(
    'Đã tổ chức rà soát 52 văn bản, chuẩn hóa 100% theo Nghị định 30, chưa phát hiện sai sót lớn về thẩm quyền.'
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<IncomingDispatchAnalysis | null>(null);

  if (!isOpen) return null;

  const handleGenerateReply = async () => {
    if (!incomingText.trim()) {
      alert('Vui lòng dán nội dung văn bản chỉ đạo đến.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch('/api/ai/reply-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incomingText,
          replyType,
          agencyName,
          superiorAgency,
          signerTitle: 'HIỆU TRƯỞNG',
          signerName: 'PGS.TS Nguyễn Văn A',
          customNotes,
        }),
      });

      if (!res.ok) {
        throw new Error('Lỗi tạo phúc đáp từ máy chủ');
      }

      const data: IncomingDispatchAnalysis = await res.json();
      setAnalysisResult(data);
    } catch (err: any) {
      alert('Lỗi tạo phúc đáp: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-scaleUp">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-blue-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/80 border border-blue-400 flex items-center justify-center text-white">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                Trợ lý Xử lý & Tự động Lập Phúc đáp Công văn Đến
                <span className="text-[10px] bg-amber-400 text-slate-950 font-extrabold px-2 py-0.5 rounded-full">
                  AI DISPATCH
                </span>
              </h3>
              <p className="text-xs text-blue-200">
                Tự động bóc tách hạn xử lý, nhiệm vụ trọng tâm và tạo dự thảo văn bản phúc đáp chuẩn NĐ 30
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {!analysisResult ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Input Dispatch Text */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-blue-600" />
                    Nội dung Công văn / Văn bản chỉ đạo đến
                  </label>
                  <button
                    type="button"
                    onClick={() => setIncomingText(SAMPLE_INCOMING_DISPATCH)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Nạp mẫu công văn chỉ đạo
                  </button>
                </div>

                {/* Document Upload / Scan Zone */}
                <DocumentUploadZone
                  compact={true}
                  onTextExtracted={(text) => setIncomingText(text)}
                  title="Tải tệp hoặc ảnh scan công văn đến (Word, PDF, Ảnh chụp)"
                  subtitle="Tự động bóc tách từ ảnh chụp văn bản giấy hoặc file PDF scan chỉ đạo của cấp trên"
                />

                <textarea
                  rows={11}
                  value={incomingText}
                  onChange={(e) => setIncomingText(e.target.value)}
                  placeholder="Nội dung công văn bóc tách từ tệp sẽ xuất hiện ở đây, hoặc bạn có thể dán trực tiếp..."
                  className="w-full p-4 rounded-2xl border border-slate-300 text-xs font-serif leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/50"
                ></textarea>
              </div>

              {/* Right Column: Unit Configuration */}
              <div className="lg:col-span-5 space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Building className="w-4 h-4 text-blue-600" />
                  Cấu hình Văn bản Phúc đáp
                </h4>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hình thức phúc đáp</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setReplyType('CÔNG VĂN')}
                      className={`py-2 px-3 rounded-xl font-bold text-center border transition ${
                        replyType === 'CÔNG VĂN'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      ✉️ Công văn phúc đáp
                    </button>
                    <button
                      type="button"
                      onClick={() => setReplyType('BÁO CÁO')}
                      className={`py-2 px-3 rounded-xl font-bold text-center border transition ${
                        replyType === 'BÁO CÁO'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      📊 Báo cáo kết quả
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cơ quan ban hành phúc đáp</label>
                  <input
                    type="text"
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cơ quan chủ quản cấp trên</label>
                  <input
                    type="text"
                    value={superiorAgency}
                    onChange={(e) => setSuperiorAgency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Số liệu / Kết quả thực hiện bổ sung (nếu có)
                  </label>
                  <textarea
                    rows={3}
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    placeholder="Nhập ghi chú số liệu cụ thể của đơn vị để AI đưa vào báo cáo..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  ></textarea>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleGenerateReply}
                    disabled={isLoading}
                    className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Đang phân tích & soạn thảo...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Tự động Tạo Dự thảo Phúc đáp</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Analysis & Draft Preview View */
            <div className="space-y-6">
              {/* Top Summary of Incoming Dispatch */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200">
                  <div className="text-[11px] text-blue-800 font-bold uppercase">Cơ quan ban hành đến</div>
                  <div className="text-sm font-bold text-blue-950 mt-1">{analysisResult.senderAgency}</div>
                  <div className="text-xs text-blue-700 mt-0.5">
                    {analysisResult.dispatchNumber} ({analysisResult.dispatchDate})
                  </div>
                </div>

                <div className="p-3.5 bg-purple-50/70 rounded-2xl border border-purple-200">
                  <div className="text-[11px] text-purple-800 font-bold uppercase flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Thời hạn hoàn thành / Báo cáo
                  </div>
                  <div className="text-sm font-bold text-purple-950 mt-1">
                    {analysisResult.deadlines || 'Theo quy định'}
                  </div>
                  <div className="text-xs text-purple-700 mt-0.5 line-clamp-1">{analysisResult.subject}</div>
                </div>

                <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200">
                  <div className="text-[11px] text-emerald-800 font-bold uppercase flex items-center gap-1">
                    <ListOrdered className="w-3.5 h-3.5" />
                    Nhiệm vụ trọng tâm được giao
                  </div>
                  <ul className="text-xs text-emerald-950 mt-1 space-y-1 list-disc list-inside">
                    {analysisResult.keyDirectives.map((d, i) => (
                      <li key={i} className="line-clamp-1">
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setAnalysisResult(null)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                  >
                    ← Phân tích văn bản khác
                  </button>
                  <span className="text-xs text-slate-500 font-medium">
                    Dự thảo {replyType} đã sẵn sàng
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => exportND30ToDocx(analysisResult.suggestedReplyDoc)}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải file Word (.docx)</span>
                  </button>

                  {onApplyToDrafting && (
                    <button
                      type="button"
                      onClick={() => {
                        onApplyToDrafting(analysisResult.suggestedReplyDoc);
                        onClose();
                      }}
                      className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>Áp dụng vào Soạn thảo chính</span>
                    </button>
                  )}
                </div>
              </div>

              {/* A4 Paper Preview */}
              <div className="h-[650px]">
                <DocumentA4Preview
                  document={analysisResult.suggestedReplyDoc}
                  title={`Dự thảo ${replyType} Phúc đáp Chuẩn Nghị định 30`}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
