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
- 📝 **Articles Are Plain Markdown** — `src/content/notes/*.md` with frontmatter, rendered into static pages at build time; `- [ ]` in the body becomes a checkbox whose state can sync across your devices
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
├── siteConfig.ts           # Site-level config: name/bio come from profile.json, social links are hardcoded here
├── app/
│   ├── layout.tsx          # Root layout (navbar, background, theme, transfer meter)
│   ├── page.tsx            # Homepage (Bento Grid)
│   ├── not-found.tsx       # 404 page, exported as out/404.html for Pages to fall back on
│   ├── globals.css / markdown.css  # Theme variables and article typography
│   ├── {about,articles,photos,projects,friends,music}/page.tsx
│   └── articles/[slug]/page.tsx  # One prerendered page per article
├── components/
│   ├── AnimatedEntry.tsx   # Staggered entry animation container
│   ├── ArticleReader.tsx   # Article reader: checkboxes, font size, sync toggle
│   ├── DataMeter.tsx       # Transfer meter (bottom-right)
│   ├── GlassCard.tsx       # Glassmorphism card (3D tilt + spotlight)
│   ├── Home.tsx            # Homepage Bento dashboard (client half; data comes from a server component)
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
│   ├── notes/*.md          # Article bodies: frontmatter + markdown, rendered at build time into /articles/<file>/
│   ├── projects.json       # Just an override table: progress, status, display name
│   ├── github-repos.json   # Public repo list fetched at build time; committed as the offline fallback
│   ├── photos.json         # Photos
│   ├── friends.json        # Friends / blogroll
│   └── music.json          # Music tracks
├── hooks/
│   ├── useClock.ts         # Clock
│   ├── useDataUsage.ts     # Reads transferSize from Resource Timing
│   ├── useSpotlight.ts     # Spotlight effect
│   └── useTiltEffect.ts    # 3D tilt effect
├── lib/
│   ├── constants.ts        # Loads the music/photos/friends JSON; type mismatches fail the build
│   ├── notes.ts            # Renders notes/*.md at build time: TOC, reading time, content hashes for checkboxes
│   ├── projects.ts         # Merges the GitHub list with the projects.json override table; a bad status fails the build
│   └── sync.ts             # Cross-device checkbox sync: private gist + a token kept only in localStorage
└── types/
    └── index.ts            # Type definitions + allowed enum values

tools/
├── fetch-repos.mjs         # first build step: fetch public repos → src/content/github-repos.json
├── notes-meta.mjs          # Reads notes/*.md metadata for the snapshot and the local desk
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
git clone https://github.com/Rewmington/Rewmington-Blog.git
cd Rewmington-Blog

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

**Articles are not written there.** The local desk only handles the four JSON collections and the
profile. Articles live in `src/content/notes/` as `.md`, and the file name is the URL
(`lecture-01-mysql-index.md` → `/articles/lecture-01-mysql-index/`):

```md
---
title: Title
description: One-line summary shown on the list page
date: "2026-10-10"
kind: 笔记            # The label shown top-left on the card
tags: [tag1, tag2]
order: 10             # Higher sorts first: 打卡 30 / 路线 20 / 讲义 10
---
```

`- [ ] item` renders as a tickable checkbox and `##`/`###` headings build the table of contents.
Emptying `notes/` still builds — the list page shows its empty state, and `articles/[slug]` keeps a
placeholder parameter to work around a static-export limitation.

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

### Three behaviours worth knowing

**The content JSON is public.** The build snapshots `src/content/*.json` into `out/content/`, so
`https://wmddd.online/content/*.json` is readable by anyone. That is what makes `/admin` work, and
also why it is safe: read-only, with no write capability. Never put anything private in these files.

**Mobile notes.** Both the particle background and the transfer meter are breakpoint-gated: the
background is `hidden md:block` (absent below 768px to save CPU/GPU), and the transfer meter turns
into a full-width bottom sheet on small screens.

**The checkbox token only ever lives in your browser.** Cross-device sync for article checkboxes
calls `api.github.com` directly (it ships CORS headers) and stores the data in a secret gist of your
own, merged per checkbox — each one carries its own timestamp, newest wins. The token sits in
localStorage on each device and never enters the build output, so visitors to the site can neither
read it (a secret gist 404s for anonymous requests) nor write with it. That holds only while the
site stays free of third-party scripts — any external JS could read it out of localStorage.

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
2. GitHub Actions runs `npm ci` → `npm run build` automatically (the first build step refreshes your public repo list)
3. Build artifacts are uploaded and deployed to GitHub Pages

Besides pushes there is also a **scheduled rebuild every day at 20:20 UTC (04:20 Beijing time)**, so
pushing to any other repository needs no action here — a new repo shows up in the Projects list on
the next build (by the following morning at the latest). Which is also what "new repos appear
automatically" means on that page: the next build, not the instant you push.

A failed build never overwrites the live site: Pages only deploys successfully uploaded artifacts, so
the site stays on the last good build. Fix red runs quickly — it will not warn you, it just quietly
stops updating.

See [.github/workflows/deploy.yml](./.github/workflows/deploy.yml) for details.

## 📄 License

MIT License © Rewmington
