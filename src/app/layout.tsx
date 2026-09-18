import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "iVanban HVU - Trợ lý Thể thức Văn bản Hành chính NĐ 30/2020/NĐ-CP",
  description: "Hệ thống hỗ trợ soạn thảo, kiểm tra thể thức và chuẩn hóa văn bản hành chính theo Nghị định 30/2020/NĐ-CP - Trường Đại học Hùng Vương",
  icons: {
    icon: "/hvu-logo.png",
    shortcut: "/hvu-logo.png",
    apple: "/hvu-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
