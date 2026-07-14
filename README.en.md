<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Framer_Motion-12-FF0055?style=flat-square" alt="Framer Motion" />
</p>

# MyBlog — Rewmington's Personal Homepage

A modern personal homepage built with Next.js 16, featuring a Glassmorphism design style, Bento Grid layout, and rich interactive animations.

English | [简体中文](./README.md)

## ✨ Features

- 🎨 **Glassmorphism Design** — Semi-transparent cards with blurred backgrounds for an immersive visual experience
- 📐 **Bento Grid Layout** — Flexible multi-column grid that adapts to different content types
- 🌸 **Sakura Falling Animation** — Canvas-rendered dynamic background particle effects
- 🎵 **Music Player** — Built-in player component with track switching
- 🔍 **Search Bar** — Search component with spotlight effect
- 💡 **3D Tilt Interaction** — Mouse-following card tilt and gloss effects
- 🎬 **Entry Animations** — Staggered fade-in animations powered by Framer Motion
- 📱 **Responsive Design** — Perfectly adapted for both desktop and mobile
- ⚡ **Static Export** — `output: "export"` for a fully static site with zero server cost
- 🚀 **GitHub Pages Deployment** — Automated CI/CD build and deployment

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| [Next.js](https://nextjs.org/) | 16 | React full-stack framework (App Router) |
| [React](https://react.dev/) | 19 | UI component library |
| [TypeScript](https://www.typescriptlang.org/) | 5 | Type safety |
| [Tailwind CSS](https://tailwindcss.com/) | 4 | Utility-first CSS |
| [Framer Motion](https://www.framer.com/motion/) | 12 | Animations & interactions |

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Homepage (Bento Grid)
├── components/
│   ├── AnimatedEntry.tsx   # Staggered entry animation container
│   ├── GlassCard.tsx       # Glassmorphism card component
│   ├── MusicPlayer.tsx     # Music player
│   ├── ProfileCard.tsx     # Profile information card
│   ├── SakuraBackground.tsx # Sakura falling background
│   ├── SearchBar.tsx       # Search bar
│   └── StatusBar.tsx       # Bottom status bar
├── hooks/
│   ├── useClock.ts         # Clock hook
│   ├── useSpotlight.ts     # Spotlight effect hook
│   └── useTiltEffect.ts    # 3D tilt effect hook
├── lib/
│   └── constants.ts        # Articles, music, and tech badge data
└── types/
    └── index.ts            # TypeScript type definitions
```

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 22
- npm, yarn, pnpm, or bun

### Installation & Development

```bash
# Clone the repository
git clone https://github.com/StanleyWong-sys/个人网页.git
cd 个人网页

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to preview.

### Build & Deploy

```bash
# Build the static site (output to out/ directory)
npm run build
```

Pushing to the `main` branch triggers GitHub Actions to automatically build and deploy to GitHub Pages.

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production (static export) |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint checks |

## 🌐 Deployment

The project uses GitHub Actions for automated deployment to GitHub Pages:

1. Push code to the `main` branch
2. GitHub Actions runs `npm ci` → `npm run build` automatically
3. Build artifacts are uploaded and deployed to GitHub Pages

See [.github/workflows/deploy.yml](./.github/workflows/deploy.yml) for details.

## 📄 License

MIT License © Rewmington
