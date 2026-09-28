<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Framer_Motion-12-FF0055?style=flat-square" alt="Framer Motion" />
</p>

# Rewmington Desk — Rewmington's Personal Workspace

A modern personal homepage built with Next.js 16, featuring a Glassmorphism design style, Bento Grid layout, and rich interactive animations.

English | [简体中文](./README.md)

## ✨ Features

- 🎨 **Glassmorphism Design** — Semi-transparent cards with blurred backgrounds for an immersive visual experience
- 📐 **Bento Grid Layout** — Flexible multi-column grid that adapts to different content types
- 🌸 **Sakura Falling Animation** — 60 DOM particles driven by CSS keyframes (not Canvas), seeded so server and client render identically
- 🎵 **Music Player** — Built-in player component with track switching
- 💡 **3D Tilt Interaction** — Mouse-following card tilt and spotlight effect
- 🎬 **Entry Animations** — Staggered fade-in animations powered by Framer Motion
- 🌗 **Light / Dark Theme** — `useSyncExternalStore` over localStorage, no flash of the wrong theme
- 📡 **Transfer Meter** — A bottom-right badge showing the page's real downloaded bytes (post-gzip) and its JS/CSS/font/image split
- 📱 **Responsive Design** — Adapts to mobile; the particle background and transfer meter are breakpoint-gated (see the note below)
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
│   ├── layout.tsx          # Root layout (navbar, background, theme, transfer meter)
│   ├── page.tsx            # Homepage (Bento Grid)
│   ├── not-found.tsx       # 404 page, exported as out/404.html for Pages to fall back on
│   └── {about,articles,photos,projects,friends,music}/page.tsx
├── components/
│   ├── AnimatedEntry.tsx   # Staggered entry animation container
│   ├── ArticleCard.tsx     # Article card
│   ├── DataMeter.tsx       # Transfer meter (bottom-right)
│   ├── GlassCard.tsx       # Glassmorphism card (3D tilt + spotlight)
│   ├── MusicPlayer.tsx     # Music player
│   ├── Navbar.tsx          # Top nav, theme toggle, mobile menu
│   ├── PhotoCarousel.tsx   # Homepage photo carousel
│   ├── PhotoLightbox.tsx   # Enlarged photo overlay
│   ├── ProfileCard.tsx     # Profile information card
│   ├── ProjectTracker.tsx  # Project progress card
│   ├── SakuraBackground.tsx# Sakura particle background
│   ├── StatusBar.tsx       # Homepage bottom status bar
│   ├── SystemTopBar.tsx    # OS-style top bar (its ⌘K modal has no search logic yet)
│   └── ThemeProvider.tsx   # Light/dark theme
├── content/                # ← All site content lives here; edit via `npm run studio` or /admin
│   ├── profile.json        # Name, bio, avatar
│   ├── articles.json       # Articles
│   ├── projects.json       # Projects
│   ├── photos.json         # Photos
│   ├── friends.json        # Friends / blogroll
│   └── music.json          # Music tracks
├── hooks/
│   ├── useClock.ts         # Clock
│   ├── useDataUsage.ts     # Reads transferSize from Resource Timing
│   ├── useSpotlight.ts     # Spotlight effect
│   └── useTiltEffect.ts    # 3D tilt effect
├── lib/
│   └── constants.ts        # Loads content/*.json, fails the build on bad fields
└── types/
    └── index.ts            # Type definitions + allowed enum values

tools/
├── publish-content.mjs     # after build, snapshot content/*.json into out/content/ for /admin
└── studio/                 # local publishing desk behind `npm run studio` (not in the build output)
    ├── server.mjs          # reads/writes content/*.json, compresses images, commits + pushes
    ├── schema.mjs          # field definitions and validation, used by the local desk
    └── ui.html             # the form UI

public/
├── admin/index.html        # online admin: static, emits paste-ready JSON, needs no credentials
└── images/posts/           # photos and covers; URLs drop the `public` prefix
```

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 22
- npm, yarn, pnpm, or bun

### Installation & Development

```bash
# Clone the repository
git clone https://github.com/Rewmington/Rewmington-Desk.git
cd Rewmington-Desk

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to preview.

### Editing content (recommended entry point)

```bash
npm run studio
```

http://127.0.0.1:5178 is a form-based editor: pick a collection, fill in the fields, hit
"换图" to choose a local image. Saving writes `src/content/*.json`; "提交并发布" commits and
pushes, and Actions takes it live once the build finishes.

- Images run through sharp at 1600px / q82 before they touch the repo, so a phone original
  can't quietly fatten the page
- A bad field value (a status outside the four options, progress over 100) is rejected
  server-side and no file is written
- Binds 127.0.0.1 only — no network exposure, no tokens
- Editing `content/*.json` directly in GitHub's web UI still works from anywhere else

### Online admin (`/admin`, zero credentials)

When you're away from your own machine, open `https://wmddd.online/admin`. It is a **plain
static page that writes nothing over the network** and needs no password or token:

1. It reads content from **same-origin** `/content/*.json` (snapshotted from
   `src/content/*.json` at build time by `tools/publish-content.mjs`) and renders a form
2. After editing, hit "生成提交内容" — only files that actually changed are listed, each with a
   copy button and an "open on GitHub" link
3. Paste → Commit → wait ~40s for Actions and it's live

Images go through GitHub's own drag-and-drop upload page (`…/upload/main/public/images/posts/`);
paste the resulting path back into the field.

**Why not make it one-click**: for a browser to commit on your behalf it must hold a credential
that represents you — there is no exception. That token equals write access to the repo, and it
could be exfiltrated by any third-party script the site ever loads. This design removes that whole
class of risk in exchange for two extra pastes.

Two known edges:

- `/content/*.json` is a snapshot of the **last successful build** and may lag behind `main`. The
  safety net is GitHub's edit page — it shows a diff before committing, so nothing is clobbered
  silently
- The form field list exists in `public/admin/index.html` as well as in `tools/studio/schema.mjs`,
  deliberately kept in the same shape. Add a field and you touch both. The real hard validation is
  at build time in `src/lib/constants.ts`, so a missed edit only costs you one input, not bad data

### Two behaviours worth knowing

**The content JSON is public.** The build snapshots `src/content/*.json` into `out/content/`, so
`https://wmddd.online/content/*.json` is readable by anyone. That is what makes `/admin` work, and
also why it is safe: read-only, with no write capability. Never put anything private in these files.

**Mobile notes.** Both the particle background and the transfer meter are breakpoint-gated: the
background is `hidden md:block` (absent below 768px to save CPU/GPU), and the transfer meter turns
into a full-width bottom sheet on small screens.

### Build & Deploy

```bash
# Build the static site (outputs to out/, and snapshots into out/content/ at the end)
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
| `npm run studio` | Start the local content desk (http://127.0.0.1:5178) |

## 🌐 Deployment

The project uses GitHub Actions for automated deployment to GitHub Pages:

1. Push code to the `main` branch
2. GitHub Actions runs `npm ci` → `npm run build` automatically
3. Build artifacts are uploaded and deployed to GitHub Pages

See [.github/workflows/deploy.yml](./.github/workflows/deploy.yml) for details.

## 📄 License

MIT License © Rewmington
