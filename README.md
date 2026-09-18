# 📄 iVANBAN - Hệ thống Soạn thảo Văn bản Hành chính Thông minh

<div align="center">

**Nền tảng hỗ trợ soạn thảo văn bản hành chính theo Nghị định 30/2020/NĐ-CP**  
**Tích hợp AI (Google Gemini, NVIDIA NIM) • Thư viện 200 Prompt nghiệp vụ • Kiểm tra thể thức tự động**

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

</div>

---

## ✨ Tính năng chính

| Tính năng | Mô tả |
|-----------|--------|
| 📝 **Soạn thảo trực quan** | Tạo văn bản hành chính (Quyết định, Công văn, Tờ trình, Thông báo...) theo đúng thể thức NĐ30 |
| 🤖 **Hỗ trợ AI** | Tích hợp Google Gemini & NVIDIA NIM để gợi ý nội dung, kiểm lỗi, và tối ưu văn bản |
| 📚 **Thư viện 200 Prompt** | Bộ prompt nghiệp vụ mẫu cho cấp cơ sở, tùy biến theo hồ sơ tổ chức |
| ✅ **Kiểm tra thể thức** | Tự động phát hiện lỗi căn lề, font chữ, ký hiệu, và cấu trúc văn bản |
| 🏛️ **Hồ sơ Tổ chức** | Quản lý thông tin cơ quan (mặc định: Trường ĐH Hùng Vương), hỗ trợ nhiều đơn vị |
| 📤 **Xuất DOCX** | Xuất văn bản hoàn chỉnh định dạng Word (.docx) |
| 👥 **Quản lý người dùng** | Đăng ký, đăng nhập, phân quyền (Admin/User), dùng thử cho khách |

## 🛠️ Công nghệ sử dụng

- **Frontend**: Next.js 16.3 + React 19 + TypeScript
- **Styling**: TailwindCSS 4
- **Database**: PostgreSQL (Supabase)
- **AI**: Google Gemini API, NVIDIA NIM API
- **Icons**: Lucide React
- **Document Export**: docx.js

## 🚀 Cài đặt và Khởi chạy

### Yêu cầu hệ thống

- Node.js >= 18
- npm >= 9
- PostgreSQL (hoặc tài khoản Supabase)

### Các bước cài đặt

```bash
# 1. Clone repository
git clone https://github.com/Tuyensinh-thv/ivanban.git
cd ivanban

# 2. Cài đặt dependencies
npm install

# 3. Cấu hình biến môi trường
cp .env.example .env.local
# Chỉnh sửa .env.local với thông tin thực tế của bạn

# 4. Khởi tạo cơ sở dữ liệu
node setup_database.js

# 5. Khởi chạy server phát triển
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để sử dụng.

### Build cho Production

```bash
npm run build
npm start
```

## 📁 Cấu trúc dự án

```
ivanban/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Trang chính (85KB - bao gồm toàn bộ UI)
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   ├── admin/              # Trang quản trị
│   │   └── api/                # API Routes (auth, documents, AI...)
│   ├── components/             # React Components
│   │   ├── DraftingStudio.tsx   # Studio soạn thảo văn bản
│   │   ├── AuditStudio.tsx      # Kiểm tra thể thức
│   │   ├── PromptLibrary.tsx    # Thư viện Prompt
│   │   ├── PromptBuilder.tsx    # Trình tạo Prompt tùy chỉnh
│   │   ├── OrgProfileSetup.tsx  # Cài đặt hồ sơ tổ chức
│   │   └── ...                  # Các component khác
│   ├── data/                   # Dữ liệu tĩnh
│   │   ├── promptLibrary.ts     # 200 Prompt nghiệp vụ
│   │   ├── documentPresets.ts   # Mẫu văn bản
│   │   └── sampleTemplates.ts   # Template mẫu
│   ├── lib/                    # Thư viện tiện ích
│   │   ├── geminiClient.ts      # Google Gemini integration
│   │   ├── nvidiaClient.ts      # NVIDIA NIM integration
│   │   ├── llmGateway.ts        # Gateway điều phối AI
│   │   ├── docxGenerator.ts     # Xuất file DOCX
│   │   ├── ruleBasedAudit.ts    # Kiểm tra thể thức
│   │   └── ...                  # Auth, DB, Mail...
│   └── types/                  # TypeScript type definitions
│       ├── nd30.ts              # Kiểu dữ liệu NĐ30
│       └── prompt.ts            # Kiểu dữ liệu Prompt
├── public/                     # Static assets
├── scripts/                    # Database scripts
├── setup_database.js           # Script khởi tạo DB
├── .env.example                # Template biến môi trường
└── package.json
```

## 🏛️ Hồ sơ Tổ chức mặc định

Hệ thống được cấu hình mặc định cho **Trường Đại học Hùng Vương** với các preset sẵn:

- 🎓 Trường Đại học Hùng Vương (mặc định)
- 🏘️ UBND Xã Tiên Lữ
- 🏙️ UBND Phường Nông Trang

Người dùng có thể tùy chỉnh thông tin tổ chức theo nhu cầu.

## 📜 Giấy phép

MIT License - Xem file [LICENSE](LICENSE) cho chi tiết.

## 👨‍💻 Tác giả

**Trường Đại học Hùng Vương** - Phú Thọ, Việt Nam

---

<div align="center">

*Hệ thống iVANBAN - Soạn thảo văn bản hành chính chuẩn NĐ30 với hỗ trợ AI*

</div>
