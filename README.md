# > crawlers // AI Tools Directory

> An AI tools and bots directory organized strictly by **use case**, not brand hype.

Live Site: [crawlers.dpdns.org](https://crawlers.dpdns.org)

---

## Overview

**Crawlers** indexes 150+ AI tools and agent categories structured into 9 core domain sections:

1. **Text & Writing**
2. **Audio/Video & Media**
3. **Design & 3D Creative**
4. **Productivity & Business**
5. **Developer & Tech Tools**
6. **Data/Models & Security**
7. **Marketing/Sales & SEO**
8. **Search/Chat & AI Agents**
9. **Education & Lifestyle**

### Brand & Design Philosophy
- **Terminal & Monospace Aesthetics**: Dark-mode primary, monospace accents (`> crawlers //`, `run_bot`, `[tags]`). Intentionally distinct from generic purple-gradient AI directory templates.
- **Scannable & Structured**: High visual hierarchy, icon differentiation, and category grouping.
- **Ethical Indexing**: Checks `robots.txt`, paraphrases tool copy, and links directly out to official sources without iframe wrappers.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + Lucide React
- **Backend / Database**: Supabase (PostgreSQL, Auth, RLS)
- **Hosting / Edge**: Cloudflare Pages via `@opennextjs/cloudflare` & Wrangler

---

## Project Structure

```text
crawlers/
├── scripts/              # Data crawlers, sanitizers & SQL scripts
│   ├── crawlAiExtensions.js
│   ├── crawlAixploria.js
│   ├── crawlBestAiAgents.js
│   └── verifyAndCleanExtensions.js
├── src/
│   ├── app/              # Next.js App Router (pages, layouts, tags, API)
│   ├── components/       # Terminal UI components & overlay windows
│   └── lib/              # Supabase client integration & utilities
├── supabase/             # Database migrations & RPC functions
├── wrangler.jsonc        # Cloudflare Pages deployment configuration
└── open-next.config.ts   # OpenNext adapter configuration
```

---

## Getting Started

### Prerequisites
- Node.js (v20+)
- npm / pnpm
- Supabase Project Credentials

### Environment Setup
Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Running Locally

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application locally.

---

## Build & Deployment

The application is deployed on Cloudflare Pages using OpenNext.

```bash
# Build production bundle for Cloudflare
npm run build

# Preview / deploy via Wrangler
npx wrangler pages deploy .open-next/assets
```

---

## License

Distributed under the MIT License. See [LICENSE](file:///d:/vs%20code/crawlers/LICENSE) for more details.

