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
- 🌸 **樱花飘落动画** — 60 片 DOM 粒子配 CSS keyframes（不是 Canvas），种子固定所以服务端与客户端渲染一致
- 🎵 **音乐播放器** — 内置播放器组件，支持曲目切换
- 💡 **3D 倾斜交互** — 鼠标跟随的卡片倾斜与聚光灯效果
- 🎬 **入场动画** — 基于 Framer Motion 的交错渐入动画
- 🌗 **明暗主题切换** — `useSyncExternalStore` 读 localStorage，无刷新闪烁
- 📡 **传输量计** — 右下角显示当前页面真实下载字节（gzip 后）与 JS/CSS/字体/图片 构成
- 📱 **响应式设计** — 移动端自适应；樱花背景与传输量计按断点控制（见下方"移动端注意"）
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
├── siteConfig.ts           # 站点级配置：作者名/简介取自 profile.json，社交链接写在这里
├── app/
│   ├── layout.tsx          # 根布局（导航栏、背景、主题、网速计都挂在这里）
│   ├── page.tsx            # 首页（Bento Grid）
│   ├── not-found.tsx       # 404 页，构建时导出成 out/404.html 由 Pages 兜底
│   ├── globals.css / markdown.css  # 主题变量与文章排版
│   ├── {about,articles,photos,projects,friends,music}/page.tsx
│   └── articles/[slug]/page.tsx  # 每篇文章一页，generateStaticParams 在构建期铺好
├── components/
│   ├── AnimatedEntry.tsx   # 交错入场动画容器
│   ├── ArticleReader.tsx   # 文章阅读层：勾选框、字号、同步开关
│   ├── DataMeter.tsx       # 传输量计（右下角）
│   ├── GlassCard.tsx       # 毛玻璃卡片（3D 倾斜 + 聚光灯）
│   ├── Home.tsx            # 首页 Bento 仪表盘（客户端部分，数据由 server 组件传入）
│   ├── MusicPlayer.tsx     # 音乐播放器
│   ├── Navbar.tsx          # 顶部导航 + 主题切换 + 移动端菜单
│   ├── PhotoCarousel.tsx   # 首页照片轮播
│   ├── PhotoLightbox.tsx   # 照片放大层
│   ├── ProfileCard.tsx     # 个人信息卡
│   ├── ProjectTracker.tsx  # 项目进度卡
│   ├── SakuraBackground.tsx# 樱花粒子背景
│   ├── StatusBar.tsx       # 首页底部状态栏
│   ├── SystemTopBar.tsx    # 首页 OS 风格顶栏（⌘K 弹窗目前无检索逻辑）
│   └── ThemeProvider.tsx   # 明暗主题
├── content/                # ← 全站内容，改这里；用 npm run studio 或 /admin 编辑
│   ├── profile.json        # 昵称、简介、头像
│   ├── notes/*.md          # 文章正文：frontmatter + markdown，构建期渲染成 /articles/<文件名>/
│   ├── projects.json       # 只是覆盖表：进度、状态、想改的显示名
│   ├── github-repos.json   # 构建期抓下来的公开仓库清单，提交进仓库当断网兜底
│   ├── photos.json         # 照片
│   ├── friends.json        # 友链
│   └── music.json          # 音乐
├── hooks/
│   ├── useClock.ts         # 时钟
│   ├── useDataUsage.ts     # 读 Resource Timing 的 transferSize
│   ├── useSpotlight.ts     # 聚光灯效果
│   └── useTiltEffect.ts    # 3D 倾斜效果
├── lib/
│   ├── constants.ts        # 读 music/photos/friends 三份 JSON，类型不符构建期报错
│   ├── notes.ts            # 构建期渲染 notes/*.md：目录、阅读时长、勾选框的内容哈希
│   ├── projects.ts         # GitHub 清单与 projects.json 覆盖表合并，status 写错构建期报错
│   └── sync.ts             # 打卡状态跨设备同步：私有 gist + 只存 localStorage 的 token
└── types/
    └── index.ts            # 类型定义 + 允许的枚举值

tools/
├── fetch-repos.mjs         # 构建第一步：抓公开仓库清单 → src/content/github-repos.json
├── notes-meta.mjs          # 读 notes/*.md 的元数据，给快照和本地发布台用
├── publish-content.mjs     # 构建后把 content/*.json 快照到 out/content/，供 /admin 同源读取
└── studio/                 # npm run studio 的本地发布台（不进构建产物）
    ├── server.mjs          # 读写 content/*.json、压图、commit + push
    ├── schema.mjs          # 字段定义与校验，本地台专用
    └── ui.html             # 填表界面

public/
├── admin/index.html        # 线上后台：纯静态，生成待粘贴的 JSON，不需要任何凭据
└── images/posts/           # 照片与封面，URL 去掉 public 前缀
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

### 值得知道的两个行为

**内容 JSON 是公开的。** 构建会把 `src/content/*.json` 原样快照到 `out/content/`，所以
`https://wmddd.online/content/*.json` 任何人都能读到。这是 `/admin` 能工作的前提，也是它安全的原因
（只读、无写能力）。不要往这些 JSON 里放任何私密内容。

**移动端注意。** 樱花粒子背景和传输量计都受断点控制：粒子背景 `hidden md:block`（<768px 不显示，
省 CPU/GPU），传输量计在移动端改为贴底的满宽抽屉。

### 构建与部署

```bash
# 构建静态站点（输出到 out/ 目录，末尾会自动生成 out/content/ 快照）
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
