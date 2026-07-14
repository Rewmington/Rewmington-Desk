import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SakuraBackground from "@/components/SakuraBackground";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rewmington's Blog",
  description: "一个喜欢折腾代码和二次元的人 ✨",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative">
        {/* 梦幻光晕 */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-purple-400/30 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-pink-400/30 rounded-full blur-[100px]" />
        </div>

        {/* 樱花飘落 */}
        <SakuraBackground />

        {/* 导航栏 */}
        <Navbar />

        {/* 内容 */}
        <div className="relative z-20 flex-1 pt-14">{children}</div>
      </body>
    </html>
  );
}
