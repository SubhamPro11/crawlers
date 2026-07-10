<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Crawlers — Project Brain

This file is persistent context for Antigravity. Read it before starting any task on this repo. It exists so I don't have to re-explain the project, the stack, or the guardrails every session.

## What this project is

Crawlers (crawlers.dpdns.org) is an AI tools directory organized by **use case**, not by brand. ~150+ categories grouped into 9 top-level sections (Text & Writing, Audio/Video & Media, Design & 3D Creative, Productivity & Business, Developer & Tech Tools, Data/Models & Security, Marketing/Sales & SEO, Search/Chat & AI Agents, Education & Lifestyle, Science/Health & Industry). Brand voice is terminal/monospace (`> crawlers //`, `run_bot`, `[tags]`) — deliberately not another purple-gradient AI-template site. Never dilute that voice with generic SaaS styling.

## Stack

- **IDE / agent**: Antigravity (this file's audience)
- **Backend**: Supabase
- **Hosting**: Cloudflare Pages, custom domain

## Hard constraints — do not touch without explicit sign-off

- Authentication / Supabase Auth config
- Session handling
- Data-fetching logic
- Database schema

All requested changes are **UI, copy, and styling layer only** unless a task explicitly says otherwise. If a fix seems to require touching one of the above, stop and flag it instead of proceeding.

## Workflow rules

- Work in structured, section-by-section prompts with a review gate between sections. Don't batch unrelated changes into one pass.
- Before big changes, confirm current behavior against production (not just localhost) — this project has previously had prod/localhost data mismatches traced to Cloudflare env var misconfiguration and Supabase RLS policy issues. Never assume localhost behavior reflects prod.

## Design principles

- Actively avoid "AI-generated design fingerprints": purple/cyan gradients, generic sparkle logos, fabricated engagement metrics, placeholder content that reads as filler.
- Prioritize visual hierarchy and scannability over decoration. A grid of 150+ categories needs strong differentiation (icons, grouping, count-based emphasis) or it becomes unscannable.
- Mobile responsiveness is a first-class requirement, not an afterthought pass.

## Known open issues (as of last audit)

1. Category grid: too many categories share the same placeholder/generic icon (e.g. the circle-question-mark shows up across a dozen+ unrelated categories), killing visual scannability.
2. No sub-grouping within oversized sections — Education & Lifestyle has 31 categories in one flat grid with no internal structure, nearly 3x the size of the next largest section.
3. Zero-count categories need defined display handling (currently unclear/inconsistent).
4. Category count shown in the search placeholder ("Search 143 categories...") doesn't match the actual number of categories rendered on the page — likely hardcoded rather than pulled live.
5. Filter pill row (category quick-filters) overflows/truncates with no visible scroll affordance on desktop.
6. Card description truncation is inconsistent — some cut off mid-clause ("...and") rather than at clean boundaries.
7. Production vs. localhost data discrepancy: empty categories on live site, suspected Cloudflare Pages env var misconfig and/or Supabase RLS policy gaps.

## Compliance notes (from site footer, keep consistent with any copy work)

Crawlers indexes tools via crawlers that check robots.txt, and paraphrases marketing copy in original words to avoid copyright issues. It does not embed or iframe external tools — link-out only, direct to source.

