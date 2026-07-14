<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Framer_Motion-12-FF0055?style=flat-square" alt="Framer Motion" />
</p>

# MyBlog — Rewmington 的个人主页

一个基于 Next.js 16 的现代个人主页，采用毛玻璃拟态（Glassmorphism）设计风格，搭配 Bento Grid 布局和丰富的交互动画。

[English](./README.en.md) | 简体中文

## ✨ 特性

- 🎨 **毛玻璃拟态设计** — 半透明卡片 + 模糊背景，打造沉浸式视觉体验
- 📐 **Bento Grid 布局** — 灵活的多栏网格，适配不同内容类型
- 🌸 **樱花飘落动画** — Canvas 绘制的动态背景粒子效果
- 🎵 **音乐播放器** — 内置播放器组件，支持曲目切换
- 🔍 **搜索栏** — 带聚光灯效果的搜索组件
- 💡 **3D 倾斜交互** — 鼠标跟随的卡片倾斜与光泽效果
- 🎬 **入场动画** — 基于 Framer Motion 的交错渐入动画
- 📱 **响应式设计** — 完美适配桌面端与移动端
- ⚡ **静态导出** — `output: "export"` 纯静态站点，零服务器成本
- 🚀 **GitHub Pages 部署** — CI/CD 自动构建与部署

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| [Next.js](https://nextjs.org/) | 16 | React 全栈框架（App Router） |
| [React](https://react.dev/) | 19 | UI 组件库 |
| [TypeScript](https://www.typescriptlang.org/) | 5 | 类型安全 |
| [Tailwind CSS](https://tailwindcss.com/) | 4 | 原子化 CSS |
| [Framer Motion](https://www.framer.com/motion/) | 12 | 动画与交互 |

## 📁 项目结构

```
src/
├── app/
│   ├── layout.tsx          # 根布局
│   └── page.tsx            # 首页（Bento Grid）
├── components/
│   ├── AnimatedEntry.tsx   # 交错入场动画容器
│   ├── GlassCard.tsx       # 毛玻璃卡片组件
│   ├── MusicPlayer.tsx     # 音乐播放器
│   ├── ProfileCard.tsx     # 个人信息卡
│   ├── SakuraBackground.tsx # 樱花飘落背景
│   ├── SearchBar.tsx       # 搜索栏
│   └── StatusBar.tsx       # 底部状态栏
├── hooks/
│   ├── useClock.ts         # 时钟 Hook
│   ├── useSpotlight.ts     # 聚光灯效果 Hook
│   └── useTiltEffect.ts    # 3D 倾斜效果 Hook
├── lib/
│   └── constants.ts        # 文章、音乐、技术徽章数据
└── types/
    └── index.ts            # TypeScript 类型定义
```

## 🚀 快速开始

### 环境要求

- Node.js ≥ 22
- npm、yarn、pnpm 或 bun

### 安装与运行

```bash
# 克隆仓库
git clone https://github.com/StanleyWong-sys/个人网页.git
cd 个人网页

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000) 即可预览。

### 构建与部署

```bash
# 构建静态站点（输出到 out/ 目录）
npm run build
```

推送到 `main` 分支后，GitHub Actions 会自动构建并部署到 GitHub Pages。

## 📜 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本（静态导出） |
| `npm run start` | 启动生产服务器 |
| `npm run lint` | 运行 ESLint 检查 |

## 🌐 部署

项目使用 GitHub Actions 自动部署到 GitHub Pages：

1. 推送代码到 `main` 分支
2. GitHub Actions 自动执行 `npm ci` → `npm run build`
3. 构建产物上传并部署到 GitHub Pages

详见 [.github/workflows/deploy.yml](./.github/workflows/deploy.yml)。

## 📄 许可证

MIT License © Rewmington
