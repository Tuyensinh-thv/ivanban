'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  FileCheck2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
} from 'lucide-react';

interface DocumentUploadZoneProps {
  onTextExtracted: (text: string, fileInfo: { filename: string; fileType: string; wordCount: number }) => void;
  compact?: boolean;
  title?: string;
  subtitle?: string;
}

export const DocumentUploadZone: React.FC<DocumentUploadZoneProps> = ({
  onTextExtracted,
  compact = false,
  title = 'Tải tệp lên để tự động trích xuất nội dung',
  subtitle = 'Hỗ trợ Word (.docx), PDF (.pdf), Ảnh chụp/Scan (.jpg, .png) & Text (.txt)',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [successInfo, setSuccessInfo] = useState<{ filename: string; wordCount: number; fileType: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setErrorMessage('');
    setSuccessInfo(null);

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const validExts = ['docx', 'pdf', 'png', 'jpg', 'jpeg', 'webp', 'txt'];

    if (!validExts.includes(ext)) {
      setErrorMessage(`Định dạng .${ext} chưa được hỗ trợ. Vui lòng chọn tệp Word (.docx), PDF (.pdf), hoặc Ảnh (.jpg, .png).`);
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage('Kích thước tệp vượt quá giới hạn cho phép (tối đa 25MB).');
      return;
    }

    try {
      setIsProcessing(true);
      if (ext === 'docx') {
        setProcessingStatus(`Đang giải mã tệp Word "${file.name}"...`);
      } else if (ext === 'pdf') {
        setProcessingStatus(`Đang xử lý PDF & OCR đa phương thức "${file.name}"...`);
      } else if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
        setProcessingStatus(`Đang nhận diện quang học chữ Tiếng Việt (AI OCR) từ ảnh "${file.name}"...`);
      } else {
        setProcessingStatus(`Đang đọc tệp "${file.name}"...`);
      }

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/document/extract', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Không thể trích xuất nội dung từ tệp');
      }

      setSuccessInfo({
        filename: data.filename,
        wordCount: data.wordCount,
        fileType: data.fileType,
      });

      onTextExtracted(data.text, {
        filename: data.filename,
        fileType: data.fileType,
        wordCount: data.wordCount,
      });
    } catch (err: any) {
      console.error('File extract error:', err);
      setErrorMessage(err.message || 'Lỗi bóc tách tài liệu');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".docx,.pdf,.png,.jpg,.jpeg,.webp,.txt"
        onChange={handleFileChange}
        className="hidden"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl transition-all cursor-pointer select-none text-center ${
          isDragging
            ? 'border-blue-500 bg-blue-50/80 scale-[0.99] shadow-inner'
            : isProcessing
            ? 'border-indigo-400 bg-indigo-50/50 cursor-wait'
            : 'border-slate-300 hover:border-blue-500 bg-gradient-to-b from-white to-slate-50/60 hover:bg-blue-50/30'
        } ${compact ? 'p-3' : 'p-4 sm:p-5'}`}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center space-y-2 py-2">
            <div className="relative">
              <div className="w-10 h-10 rounded-full border-3 border-indigo-200 border-t-indigo-600 animate-spin flex items-center justify-center"></div>
              <Sparkles className="w-4 h-4 text-indigo-600 absolute inset-0 m-auto animate-pulse" />
            </div>
            <div className="text-xs sm:text-sm font-bold text-indigo-900 animate-pulse">
              {processingStatus}
            </div>
            <p className="text-[11px] text-slate-500">
              Quá trình nhận diện ký tự quang học (OCR) đang chạy qua hệ thống AI...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-2xs">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div className="flex items-center space-x-1.5 text-xs font-bold">
                <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">Word .docx</span>
                <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800">PDF .pdf</span>
                <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800">Ảnh OCR</span>
              </div>
            </div>

            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-800">
                {title}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Kéo & thả file vào đây hoặc <span className="text-blue-600 underline font-semibold">bấm để chọn từ máy tính</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Success Notification */}
      {successInfo && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              Đã bóc tách thành công <strong>{successInfo.filename}</strong> ({successInfo.wordCount} từ). Nội dung đã được tự động điền vào khung bên dưới.
            </span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSuccessInfo(null);
            }}
            className="text-emerald-700 hover:text-emerald-950 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setErrorMessage('');
            }}
            className="text-rose-700 hover:text-rose-950 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
