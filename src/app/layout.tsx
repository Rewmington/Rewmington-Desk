import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./markdown.css";
import SakuraBackground from "@/components/SakuraBackground";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import DataMeter from "@/components/DataMeter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // metadataBase 缺了的话，Open Graph 里的相对图片路径不会补成绝对 URL，
  // 分享到聊天软件时卡片就不显示图。
  metadataBase: new URL("https://wmddd.online"),
  title: {
    default: "Rewmington 的个人工作台",
    template: "%s · Rewmington",
  },
  description:
    "Rewmington 的个人主页：项目、照片、音乐与随笔。Next.js 16 静态导出，部署在 GitHub Pages。",
  openGraph: {
    type: "website",
    url: "https://wmddd.online",
    siteName: "Rewmington 的个人工作台",
    title: "Rewmington 的个人工作台",
    description:
      "Rewmington 的个人主页：项目、照片、音乐与随笔。Next.js 16 静态导出，部署在 GitHub Pages。",
    images: [{ url: "/avatar.jpg", width: 512, height: 512, alt: "Rewmington" }],
    locale: "zh_CN",
  },
  twitter: {
    card: "summary",
    title: "Rewmington 的个人工作台",
    description: "项目、照片、音乐与随笔。",
    images: ["/avatar.jpg"],
  },
  robots: {
    index: true,
    // /admin 是编辑入口，不该进搜索结果。它本身只读、无凭据，但没必要被收录。
  },
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
      data-theme="dark"
    >
      <body className="min-h-full flex flex-col relative mesh-gradient" suppressHydrationWarning>
        {/* 光晕 */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] bg-[var(--halo-1)] rounded-full blur-[120px] animate-[float_8s_ease-in-out_infinite]" />
          <div className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] bg-[var(--halo-2)] rounded-full blur-[120px] animate-[float_10s_ease-in-out_infinite_1s]" />
          <div className="absolute top-[50%] left-[50%] w-[400px] h-[400px] bg-[var(--halo-3)] rounded-full blur-[100px] animate-[float_12s_ease-in-out_infinite_2s]" />
        </div>

        {/* 粒子 */}
        <SakuraBackground />

        {/* 主题 Provider */}
        <ThemeProvider>
          {/* 导航栏 */}
          <Navbar />

          {/* 内容 */}
          <div className="relative z-20 flex-1 pt-14">{children}</div>
        </ThemeProvider>

        <DataMeter />
      </body>
    </html>
  );
}
