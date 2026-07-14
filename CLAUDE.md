# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project Overview

MyBlog 是 Rewmington 的个人主页，基于 Next.js 16 静态导出（`output: "export"`），采用毛玻璃拟态（Glassmorphism）+ Bento Grid 布局，部署到 GitHub Pages。单页应用，无路由、无 CMS、无 API 路由。

## Commands

```bash
npm run dev       # 开发服务器 (localhost:3000)
npm run build     # 静态导出到 out/
npm run lint      # ESLint
npm run start     # 生产服务器 (需先 build)
```

环境要求：Node.js ≥ 22

## Architecture

### Static Export Constraints

- `next.config.ts` 设置 `output: "export"`、`images.unoptimized: true`、`trailingSlash: true`
- 不支持 Next.js 服务端功能（API Routes、ISR、SSR with headers/cookies、Image Optimization）
- 构建产物在 `out/` 目录，由 GitHub Actions 部署到 GitHub Pages

### Path Aliases

`@/*` 映射到 `./src/*`（tsconfig.json paths + Next.js 自动解析）

### Component System

所有交互组件均为 `"use client"`，核心组件体系：

- **GlassCard** — 毛玻璃卡片基础组件，集成 3D 倾斜（`useTiltEffect`）+ 聚光灯效果（`useSpotlight`），所有卡片内容通过 children 传入
- **StaggerContainer / StaggerItem** — Framer Motion 交错入场动画容器，页面级使用
- **SakuraBackground** — Canvas 樱花飘落粒子系统
- **MusicPlayer / SearchBar / ProfileCard / StatusBar** — 功能组件

### Custom Hooks

- `useTiltEffect` — 鼠标跟随 3D 倾斜 + perspective
- `useSpotlight` — 鼠标跟随聚光灯光晕
- `useClock` — 实时时钟

### Data Layer

所有数据硬编码在 `src/lib/constants.ts`（articles、musicTracks、techBadges）。类型定义在 `src/types/index.ts`（Article、MusicTrack、SocialLink、SiteConfig）。

### Styling

- Tailwind CSS v4（`@import "tailwindcss"` + `@theme inline` 定义 CSS 变量）
- 渐变动画背景通过 `globals.css` 的 `gradientMove` keyframe 实现
- 毛玻璃效果：`bg-white/30 backdrop-blur-lg border-white/50 rounded-3xl`
- 字体：Geist Sans / Geist Mono（Next.js font 优化加载）

### Deployment

推送 `main` 分支触发 GitHub Actions（`.github/workflows/deploy.yml`）：`npm ci` → `npm run build` → 部署 `out/` 到 GitHub Pages。
