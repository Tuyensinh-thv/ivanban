import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  Printer,
  FileText,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { ND30Document } from '../types/nd30';
import { generateND30Blob, downloadDocxBlob } from '../lib/docxGenerator';

interface DocumentA4PreviewProps {
  document: ND30Document;
  title?: string;
  isEditedHighlight?: boolean;
}

export const DocumentA4Preview: React.FC<DocumentA4PreviewProps> = ({
  document: doc,
  title = 'Bản xem trước Văn bản A4 chuẩn NĐ 30/2020/NĐ-CP',
  isEditedHighlight = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const isCongVan = !doc.ten_loai_van_ban;
  const isCitizenDoc =
    !!doc.ten_loai_van_ban &&
    (doc.ten_loai_van_ban.startsWith('ĐƠN') ||
      doc.ten_loai_van_ban.includes('ỦY QUYỀN'));

  const handleDownloadDocx = async () => {
    try {
      setIsExporting(true);
      const blob = await generateND30Blob(doc, { highlightEdits: isEditedHighlight });
      const filename = `${doc.ten_loai_van_ban || 'Cong_van'}_${(doc.trich_yeu || 'Van_ban')
        .substring(0, 30)
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_À-ỹ]/g, '')}`;
      downloadDocxBlob(blob, filename);
    } catch (err: any) {
      alert('Lỗi tạo file Word: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyText = () => {
    let fullText = '';
    if (isCitizenDoc) {
      fullText += `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n${doc.dia_danh_ngay_thang}\n\n`;
      fullText += `${doc.ten_loai_van_ban}\n`;
      if (doc.trich_yeu) fullText += `(${doc.trich_yeu})\n\n`;
      if (doc.kinh_gui) fullText += `Kính gửi: ${doc.kinh_gui}\n\n`;
    } else {
      fullText += `${doc.co_quan_chu_quan ? doc.co_quan_chu_quan + '\n' : ''}${doc.co_quan_ban_hanh}\n${doc.so_ky_hieu}\n\nCỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n${doc.dia_danh_ngay_thang}\n\n`;
      if (doc.ten_loai_van_ban) {
        fullText += `${doc.ten_loai_van_ban}\n${doc.trich_yeu}\n\n`;
      } else {
        fullText += `V/v ${doc.trich_yeu}\n\n`;
      }
      if (doc.kinh_gui) {
        fullText += `Kính gửi: ${doc.kinh_gui}\n\n`;
      }
    }
    if (doc.can_cu && doc.can_cu.length > 0) {
      fullText += doc.can_cu.join('\n') + '\n\n';
    }
    if (doc.noi_dung && doc.noi_dung.length > 0) {
      doc.noi_dung.forEach((block) => {
        fullText += `${block.tieu_de ? block.tieu_de + ' ' : ''}${block.noi_dung}\n\n`;
      });
    }
    if (!isCitizenDoc && doc.noi_nhan && doc.noi_nhan.length > 0) {
      fullText += `Nơi nhận:\n${doc.noi_nhan.map((n) => '- ' + n).join('\n')}\n\n`;
    }
    fullText += `${doc.chuc_danh_nguoi_ky}\n\n\n${doc.ten_nguoi_ky}`;

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 rounded-2xl border border-slate-300 overflow-hidden shadow-sm">
      {/* Action Header */}
      <div className="bg-slate-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-amber-400" />
          <span className="font-semibold text-sm sm:text-base">{title}</span>
          {isEditedHighlight && (
            <span className="bg-rose-500/20 text-rose-300 text-xs px-2 py-0.5 rounded border border-rose-500/40">
              Đánh dấu đỏ chỗ sửa
            </span>
          )}
        </div>

        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={handleCopyText}
            className="flex items-center space-x-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg transition"
            title="Sao chép toàn bộ văn bản"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center space-x-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg transition"
            title="In văn bản"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadDocx}
            disabled={isExporting}
            className="flex items-center space-x-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg font-bold shadow-sm transition disabled:opacity-50"
            title="Tải file Word chuẩn 100% Nghị định 30"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Đang tạo...' : 'Tải .docx chuẩn'}</span>
          </button>
        </div>
      </div>

      {/* A4 Paper Simulation Canvas */}
      <div className="flex-1 overflow-auto p-3 sm:p-6 flex justify-center bg-slate-200/80">
        <div
          id="nd30-a4-page"
          className="bg-white text-slate-900 shadow-xl border border-slate-300 w-full max-w-[800px] min-h-[1050px] p-6 sm:p-12 font-serif text-[15px] leading-[1.4] transition-all"
          style={{
            fontFamily: '"Times New Roman", Times, serif',
            boxSizing: 'border-box',
          }}
        >
          {/* Header */}
          {isCitizenDoc ? (
            <div className="mb-6">
              <div className="text-center">
                <div className="text-[14px] uppercase font-bold tracking-tight text-slate-950">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </div>
                <div className="text-[15px] font-bold text-slate-950 mt-0.5">
                  Độc lập - Tự do - Hạnh phúc
                </div>
                <div className="w-36 h-[1px] bg-slate-950 mx-auto my-1.5"></div>
              </div>
              <div className="text-[14px] italic text-slate-800 text-right mt-3 pr-2">
                {doc.dia_danh_ngay_thang || 'Phú Thọ, ngày ... tháng ... năm 2026'}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-3 mb-6 items-start">
              {/* Left Header */}
              <div className="col-span-5 text-center">
                {doc.co_quan_chu_quan && (
                  <div className="text-[13px] uppercase font-normal tracking-tight text-slate-800">
                    {doc.co_quan_chu_quan}
                  </div>
                )}
                <div className="text-[14px] uppercase font-bold tracking-tight text-slate-950 mt-0.5">
                  {doc.co_quan_ban_hanh}
                </div>
                <div className="w-24 h-[1px] bg-slate-950 mx-auto my-1"></div>
                <div className="text-[13px] font-normal text-slate-900 mt-1">
                  {doc.so_ky_hieu || 'Số:    /…'}
                </div>

                {isCongVan && doc.trich_yeu && (
                  <div className="text-[13px] italic text-slate-900 mt-2 px-1 text-center">
                    V/v{' '}
                    {doc.trich_yeu
                      .replace(/^Về việc\s+/i, '')
                      .replace(/^V\/v\s+/i, '')}
                  </div>
                )}
              </div>

              {/* Right Header: Quoc hieu */}
              <div className="col-span-7 text-center">
                <div className="text-[13px] uppercase font-bold tracking-tight text-slate-950">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </div>
                <div className="text-[14px] font-bold text-slate-950 mt-0.5">
                  Độc lập - Tự do - Hạnh phúc
                </div>
                <div className="w-36 h-[1px] bg-slate-950 mx-auto my-1"></div>
                <div className="text-[14px] italic text-slate-800 mt-2 text-center">
                  {doc.dia_danh_ngay_thang || 'Phú Thọ, ngày ... tháng ... năm ...'}
                </div>
              </div>
            </div>
          )}

          {/* Document Type & Subject */}
          {doc.ten_loai_van_ban && (
            <div className="text-center my-6">
              <div className="text-[16px] font-bold uppercase tracking-wide text-slate-950">
                {doc.ten_loai_van_ban}
              </div>
              {doc.trich_yeu && (
                <div className="text-[14px] font-bold text-slate-900 mt-2 max-w-xl mx-auto leading-snug">
                  {doc.trich_yeu}
                </div>
              )}
            </div>
          )}

          {/* Kính gửi */}
          {doc.kinh_gui && (
            <div className="mb-4 pl-12 text-[15px]">
              <span className="font-bold">Kính gửi:</span> {doc.kinh_gui}
            </div>
          )}

          {/* Căn cứ pháp lý */}
          {doc.can_cu && doc.can_cu.length > 0 && (
            <div className="space-y-2 mb-4">
              {doc.can_cu.map((cc, idx) => (
                <p
                  key={idx}
                  className="text-justify indent-[1.27cm] text-[14.5px] italic text-slate-800 leading-relaxed"
                >
                  {cc}
                </p>
              ))}
            </div>
          )}

          {/* Nội dung chính văn */}
          <div className="space-y-3 mb-8">
            {doc.noi_dung &&
              doc.noi_dung.map((block, idx) => {
                const isEdited = isEditedHighlight && block.is_edited;
                return (
                  <div
                    key={idx}
                    className={`text-justify indent-[1.27cm] text-[15px] leading-relaxed transition-colors ${
                      isEdited
                        ? 'text-rose-700 bg-rose-50/80 p-1 rounded font-medium'
                        : 'text-slate-900'
                    }`}
                  >
                    {block.tieu_de && (
                      <span className="font-bold mr-1">{block.tieu_de}</span>
                    )}
                    <span>{block.noi_dung}</span>
                  </div>
                );
              })}
          </div>

          {/* Footer: Recipients & Signature */}
          {isCitizenDoc ? (
            <div className="flex justify-end mt-8 pt-4 border-t border-dashed border-slate-200">
              <div className="w-64 text-center">
                <div className="font-bold uppercase text-[14px] text-slate-950">
                  {doc.chuc_danh_nguoi_ky || 'NGƯỜI LÀM ĐƠN'}
                </div>
                <div className="h-16" />
                <div className="font-bold text-[14px] text-slate-950">
                  {doc.ten_nguoi_ky}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-4 mt-8 pt-4 border-t border-dashed border-slate-200 items-start">
              {/* Recipients (Nơi nhận) */}
              <div className="col-span-6 text-left text-[12px] text-slate-800">
                <div className="font-bold italic text-[13px] mb-1">Nơi nhận:</div>
                <ul className="space-y-0.5">
                  {(doc.noi_nhan || []).map((item, idx) => (
                    <li key={idx} className="text-[12px]">
                      - {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Signature (Chữ ký) */}
              <div className="col-span-6 text-center">
                <div className="font-bold uppercase text-[14px] text-slate-950">
                  {doc.chuc_danh_nguoi_ky}
                </div>
                <div className="h-16" />
                <div className="font-bold text-[14px] text-slate-950">
                  {doc.ten_nguoi_ky}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
