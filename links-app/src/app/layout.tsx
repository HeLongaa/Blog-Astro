import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "友链申请 - HeLongaa的博客",
  description: "提交您的网站信息，申请加入友链",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
