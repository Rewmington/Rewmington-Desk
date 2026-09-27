<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Framer_Motion-12-FF0055?style=flat-square" alt="Framer Motion" />
</p>

# Rewmington Desk — Rewmington 的个人工作台

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
│   └── StatusBar.tsx       # 底部状态栏
├── content/                # ← 改内容就来这里，JSON 可在 GitHub 网页直接编辑
│   ├── profile.json        # 昵称、简介、头像
│   ├── articles.json       # 文章
│   ├── projects.json       # 项目
│   ├── photos.json         # 照片
│   ├── friends.json        # 友链
│   └── music.json          # 音乐
├── hooks/
│   ├── useClock.ts         # 时钟 Hook
│   ├── useSpotlight.ts     # 聚光灯效果 Hook
│   └── useTiltEffect.ts    # 3D 倾斜效果 Hook
├── lib/
│   └── constants.ts        # 读取 content/*.json，字段写错时构建期报错
└── types/
    └── index.ts            # TypeScript 类型定义

tools/
├── publish-content.mjs     # 构建后把 content/*.json 快照到 out/content/，供 /admin 同源读取
└── studio/                 # npm run studio 的本地发布台（不进构建产物）
    ├── server.mjs          # 读写 content/*.json、压图、commit + push
    ├── schema.mjs          # 字段定义与校验，本地台专用
    └── ui.html             # 填表界面

public/admin/index.html     # 线上后台：纯静态，生成待粘贴的 JSON，不需要任何凭据
```

## 🚀 快速开始

### 环境要求

- Node.js ≥ 22
- npm、yarn、pnpm 或 bun

### 安装与运行

```bash
# 克隆仓库
git clone https://github.com/Rewmington/Rewmington-Desk.git
cd Rewmington-Desk

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000) 即可预览。

### 写内容（推荐入口）

```bash
npm run studio
```

打开 http://127.0.0.1:5178 就是一个填表式的编辑台：选分类、填字段、点「换图」选本地图片，
保存即写入 `src/content/*.json`，点「提交并发布」自动 commit + push，等 Actions 构建完就上线。

- 图片会先经 sharp 压到 1600px 宽 / q82 再落盘，避免手机原图直接进仓库把页面拖肥
- 字段写错（比如状态不在四个候选里）会被服务端拒绝，一个文件都不写
- 只监听 127.0.0.1，不联网、不需要任何 token
- 从手机等别处改内容时，仍然可以直接在 GitHub 网页上编辑这些 JSON

### 在线后台（`/admin`，零凭据）

不在自己电脑上时，打开 `https://wmddd.online/admin`。它是一个**纯静态页面，不联网写任何东西**，
也不需要密码或 token：

1. 页面从**同源**的 `/content/*.json` 读取内容（构建时由 `tools/publish-content.mjs` 把
   `src/content/*.json` 快照过去），渲染成表单
2. 改完点「生成提交内容」——只有真正变过的文件会列出来，每个给一个「复制」按钮和一个
   「在 GitHub 打开」链接
3. 粘贴 → Commit → 等约 40 秒 Actions 构建完，线上更新

加图片走 GitHub 自带的拖拽上传页（`…/upload/main/public/images/posts/`），传完把地址填回字段。

**为什么不做成"点一下就发布"**：浏览器要替你 commit，就必须持有一个能代表你身份的凭据，
没有例外。那样一来这个 token 等于仓库写权限，一旦站点引入任何第三方脚本就可能被读走。
现在这个设计把整类风险消掉了，代价是每次多两下粘贴。

两个已知边界：

- `/content/*.json` 是**上次成功构建的快照**，可能落后于 main。兜底是 GitHub 编辑页——粘贴后
  它会先给你看 diff，不会静默覆盖
- 表单字段定义在 `public/admin/index.html` 里有一份，和本地发布台的 `tools/studio/schema.mjs`
  有意保持同形。加字段时两处都要改；真正的硬校验在构建期 `src/lib/constants.ts`，漏改只会
  让表单少一个输入框，不会写坏数据

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
| `npm run studio` | 启动本地内容发布台（http://127.0.0.1:5178） |

## 🌐 部署

项目使用 GitHub Actions 自动部署到 GitHub Pages：

1. 推送代码到 `main` 分支
2. GitHub Actions 自动执行 `npm ci` → `npm run build`
3. 构建产物上传并部署到 GitHub Pages

详见 [.github/workflows/deploy.yml](./.github/workflows/deploy.yml)。

## 📄 许可证

MIT License © Rewmington
