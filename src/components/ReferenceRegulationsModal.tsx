import React from 'react';
import { BookOpen, CheckCircle, X, Layout, FileSpreadsheet } from 'lucide-react';

interface ReferenceRegulationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReferenceRegulationsModal: React.FC<ReferenceRegulationsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const FONT_SPECIFICATIONS = [
    {
      id: '1',
      component: '1. Quốc hiệu',
      sample: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM',
      font: 'Times New Roman, 12-13pt',
      style: 'Chữ in hoa, đứng, đậm',
      position: 'Ô 1 phía trên bên phải trang đầu',
    },
    {
      id: '2',
      component: '2. Tiêu ngữ',
      sample: 'Độc lập - Tự do - Hạnh phúc',
      font: 'Times New Roman, 13-14pt',
      style: 'Chữ in thường, đứng, đậm (chữ cái đầu viết hoa, gạch nối có cách)',
      position: 'Dưới Quốc hiệu, có đường kẻ ngang liền bằng độ dài',
    },
    {
      id: '3',
      component: '3. Cơ quan ban hành',
      sample: 'TRƯỜNG ĐẠI HỌC HÙNG VƯƠNG',
      font: 'Times New Roman, 12-13pt',
      style: 'Chữ in hoa, đứng, đậm',
      position: 'Phía trên bên trái, dưới cơ quan chủ quản (nếu có)',
    },
    {
      id: '4',
      component: '4. Số, ký hiệu',
      sample: 'Số: 45/QĐ-ĐHHV hoặc Số: 120/ĐHHV-VP',
      font: 'Times New Roman, 13pt',
      style: 'Chữ in thường, đứng',
      position: 'Canh giữa dưới tên cơ quan ban hành, có gạch ngang',
    },
    {
      id: '5',
      component: '5. Địa danh, ngày tháng',
      sample: 'Phú Thọ, ngày 28 tháng 6 năm 2026',
      font: 'Times New Roman, 13-14pt',
      style: 'Chữ in thường, nghiêng',
      position: 'Canh giữa dưới Tiêu ngữ',
    },
    {
      id: '6',
      component: '6. Tên loại & Trích yếu',
      sample: 'QUYẾT ĐỊNH / BÁO CÁO / Về việc...',
      font: 'Times New Roman, 13-14pt (hoặc 14-15pt in hoa đậm)',
      style: 'Tên loại: in hoa đậm; Trích yếu: in thường đậm',
      position: 'Canh giữa trang văn bản',
    },
    {
      id: '7',
      component: '7. Nội dung văn bản',
      sample: 'Thân văn bản (các Điều, Khoản, Điểm, Đoạn văn)',
      font: 'Times New Roman, 13-14pt',
      style: 'Chữ in thường, đứng, căn đều 2 bên (Justified)',
      position: 'Thụt đầu dòng 1.27cm; giãn đoạn before/after 6pt; giãn dòng exactly 16pt',
    },
    {
      id: '8',
      component: '8. Chức vụ & Người ký',
      sample: 'HIỆU TRƯỞNG / CHỦ TỊCH / GIÁM ĐỐC',
      font: 'Times New Roman, 13-14pt',
      style: 'Chức danh: in hoa đậm; Họ tên: in thường/hoa đậm',
      position: 'Canh giữa ô bên phải dưới cùng',
    },
    {
      id: '9',
      component: '9. Nơi nhận',
      sample: 'Nơi nhận:\n- Như Điều...;\n- Lưu: VT.',
      font: 'Times New Roman, 12pt (tiêu đề), 11pt (nội dung)',
      style: 'Tiêu đề nghiêng đậm; gạch đầu dòng; TUYỆT ĐỐI KHÔNG NGOẶC ĐƠN',
      position: 'Ô bên trái phía dưới văn bản',
    },
  ];

  const CORE_RULES = [
    {
      title: 'Phông chữ & Bảng mã thống nhất',
      desc: 'Bắt buộc sử dụng phông chữ Times New Roman, bộ mã ký tự Unicode (theo TCVN 6909:2001), màu đen.',
    },
    {
      title: 'Khổ giấy & Căn lề chuẩn A4',
      desc: 'Khổ A4 (210 x 297mm). Lề trên: 20-25mm; Lề dưới: 20-25mm; Lề trái: 30-35mm; Lề phải: 15-20mm.',
    },
    {
      title: 'Cấm dấu ngoặc đơn trong Nơi nhận',
      desc: 'Không ghi "(để b/c)", "(để biết)", "(để phối hợp)". Chỉ ghi trực tiếp tên cơ quan nhận kèm dấu chấm phẩy (;).',
    },
    {
      title: 'Trích yếu Công văn vs Quyết định',
      desc: 'Công văn: Không có tên loại; trích yếu ghi "V/v..." dưới số ký hiệu. Quyết định: Ghi trực tiếp hoặc "Về việc...", không viết tắt "V/v".',
    },
    {
      title: 'Thẩm quyền Ký thay (KT.) & Ký thừa lệnh (TL.)',
      desc: 'Cấp phó ký thay (KT.) các lĩnh vực phân công. Cấp xã KHÔNG có thẩm quyền ký thừa lệnh (TL.) do không có tư cách văn phòng độc lập.',
    },
    {
      title: 'Trích dẫn pháp lý phải còn hiệu lực',
      desc: 'Nghị định 110/2004/NĐ-CP đã hết hiệu lực, thay bởi NĐ 30/2020. Luật TCCQĐP 2015 phải kèm Luật sửa đổi năm 2019.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-scaleUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-900 via-rose-900 to-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-rose-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600/80 border border-rose-400 flex items-center justify-center text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">
                Cẩm nang Kỹ thuật Soạn thảo theo Nghị định số 30/2020/NĐ-CP
              </h3>
              <p className="text-xs text-rose-200">
                Quy định chuẩn 9 thành phần thể thức bắt buộc và kỹ thuật trình bày văn bản hành chính Nhà nước
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* 6 Core Rules */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              6 Nguyên tắc Thể thức Bắt buộc Cần Ghi nhớ
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {CORE_RULES.map((rule, idx) => (
                <div key={idx} className="p-3.5 bg-rose-50/50 rounded-2xl border border-rose-100 space-y-1">
                  <div className="font-bold text-xs text-rose-950 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center text-[11px] font-extrabold shrink-0">
                      {idx + 1}
                    </span>
                    <span>{rule.title}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-6">{rule.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 9 Specifications Table */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              Quy cách 9 Thành phần Thể thức Chính (Phụ lục I NĐ 30)
            </h4>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                    <th className="p-3 w-32">Thành phần</th>
                    <th className="p-3">Ví dụ thực tế</th>
                    <th className="p-3 w-40">Phông chữ & Cỡ chữ</th>
                    <th className="p-3">Kiểu chữ (Style)</th>
                    <th className="p-3">Vị trí trình bày</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {FONT_SPECIFICATIONS.map((spec) => (
                    <tr key={spec.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 font-bold text-slate-900">{spec.component}</td>
                      <td className="p-3 font-serif text-slate-800 italic">{spec.sample}</td>
                      <td className="p-3 text-blue-800 font-medium">{spec.font}</td>
                      <td className="p-3 text-slate-700">{spec.style}</td>
                      <td className="p-3 text-slate-500">{spec.position}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
