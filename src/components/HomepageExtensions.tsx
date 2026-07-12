"use client";

import { useRouter } from "next/navigation";

// Predefined Collections with corresponding search queries
const COLLECTIONS = [
  { id: "students", name: "Best AI for Students", query: "study study-aid research notes education", icon: "🎓", color: "from-[#3B82F6]/20 to-[#1D4ED8]/10" },
  { id: "coding", name: "Best Coding AI", query: "code programmer python developer git vscode vscode-extension javascript typescript cursor copilot IDE compiler debugging database sql sql-queries terminal commands CLI api sdk coding documentation documentation-ai documentation-generator automation automation-tools automation-ai scripts script-generation code-generation code-editor code-review pull-request devops kubernetes docker cloud deployment ci-cd software-engineering software-architect software-developer programming programming-assistant coding-assistant", icon: "💻", color: "from-[#10B981]/20 to-[#047857]/10" },
  { id: "image", name: "Best Image AI", query: "image generation illustration design midjourney photo logo upscale vector stable-diffusion dall-e canva drawing painting graphic-design texture", icon: "🎨", color: "from-[#EC4899]/20 to-[#BE185D]/10" },
  { id: "marketing", name: "Best Marketing AI", query: "marketing seo copywriting ad-generation social-media linkedin instagram twitter advertising marketing-copy email-marketing analytics sales outbound cold-email leads campaigns campaign-management content-marketing blog-posts articles outreach growth-hacking conversion-optimization funnel-optimization landing-pages", icon: "📈", color: "from-[#F59E0B]/20 to-[#B45309]/10" },
  { id: "writing", name: "Best Writing AI", query: "writing copywriting storytelling newsletters blogging notes editor documentation grammar spellcheck translator resume localization", icon: "✍️", color: "from-[#8B5CF6]/20 to-[#6D28D9]/10" },
  { id: "video", name: "Best Video AI", query: "video youtube editing shorts tiktok reel capcut subtitles video-editor transcript audio voiceover text-to-speech avatar cloning animation dynamic-video sora runway pika luma", icon: "🎬", color: "from-[#EF4444]/20 to-[#B91C1C]/10" },
  { id: "productivity", name: "Best Productivity AI", query: "productivity note-taking documentation task-manager scheduler automation templates calender workspace notion slack discord meetings summaries transcriptions recording action-items follow-ups emails newsletters shortcuts flow workflow-integration integration dashboards", icon: "⚡", color: "from-[#06B6D4]/25 to-[#0891B2]/10" },
  { id: "free", name: "Best Free AI", query: "free open-source no-login offline self-hosted free-plan free-tier community-edition", icon: "🎁", color: "from-[#8FBF3F]/25 to-[#6E9B28]/10" }
];

// Curated News Items (Statically defined as fallback, gracefully updates)
const NEWS_ITEMS = [
  {
    title: "Claude 3.5 Sonnet Released with Artifacts UI",
    date: "July 2026",
    summary: "Anthropic's latest model shows groundbreaking software engineering reasoning and introduces interactive code workspaces.",
    tag: "Model Update",
    url: "https://www.anthropic.com/news/claude-3-5-sonnet"
  },
  {
    title: "Google Studio Launches 2M Token Context Window",
    date: "June 2026",
    summary: "Gemini 1.5 Pro now processes up to 2 million tokens of source code, logs, video, and audio file inputs simultaneously.",
    tag: "Feature Release",
    url: "https://deepmind.google/technologies/gemini/"
  },
  {
    title: "GPT-4o mini Replaces Legacy 3.5 Turbo Models",
    date: "June 2026",
    summary: "OpenAI launches a highly capable small model with multimodal processing, offering 60% lower costs than prior API models.",
    tag: "API Announcement",
    url: "https://openai.com/news/"
  }
];

interface HomepageExtensionsProps {
  totalTools: number;
  totalCategories: number;
  lastUpdated?: string;
}

export function FeaturedCollections() {
  const router = useRouter();

  const handleCollectionClick = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 border-b border-slate-900 font-sans">
      <div className="mb-6">
        <h2 className="font-serif text-xl font-medium tracking-tight text-white sm:text-2xl">
          Featured Collections
        </h2>
        <p className="text-slate-500 text-xs mt-1 font-mono">
          &gt; curated_toolsets_by_usecase
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {COLLECTIONS.map((c) => (
          <button
            key={c.id}
            onClick={() => handleCollectionClick(c.query)}
            className={`group relative flex flex-col justify-between rounded-xl border border-[#212623] bg-gradient-to-br ${c.color} p-5 hover:border-[#8FBF3F]/35 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 text-left`}
          >
            <div className="text-2xl mb-3 group-hover:scale-110 transition-transform duration-300">{c.icon}</div>
            <div>
              <h3 className="font-bold text-white text-sm group-hover:text-[#8FBF3F] transition-colors">
                {c.name}
              </h3>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">
                Explore tools &rarr;
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

export function WhyCrawlers({ totalTools, totalCategories, lastUpdated }: HomepageExtensionsProps) {
  const stats = [
    { value: totalTools > 0 ? totalTools.toLocaleString() : "...", label: "ai tools listed" },
    { value: totalCategories > 0 ? totalCategories.toLocaleString() : "...", label: "use-case categories" },
    { value: "Direct Link", label: "no embeds or iframes" },
    { value: lastUpdated || "today", label: "last updated", isDate: true }
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 border-b border-slate-900 font-sans">
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <h2 className="font-serif text-2xl font-medium tracking-tight text-white">
          Why Crawlers?
        </h2>
        <p className="text-slate-400 text-sm mt-2">
          An AI tools directory organized by **use case**, not by brand. Monospace style, curated listings, link-out only.
        </p>
      </div>

      {/* Trust Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="border border-[#212623] bg-[#131615]/30 rounded-xl p-6">
          <div className="text-[#8FBF3F] font-mono text-xs uppercase mb-2">&gt; curated_listings</div>
          <h3 className="text-white font-bold text-base mb-2 font-serif">Original Paraphrasing</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Crawlers checks robots.txt, and paraphrases marketing copy in original words to avoid copyright issues. We index tools by tasks, not by brand logos.
          </p>
        </div>

        <div className="border border-[#212623] bg-[#131615]/30 rounded-xl p-6">
          <div className="text-[#8FBF3F] font-mono text-xs uppercase mb-2">&gt; direct_connection</div>
          <h3 className="text-white font-bold text-base mb-2 font-serif">No Embeds or Iframes</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            We prioritize user speed and security. No annoying trackers, iframe embeds, or proxies. Click-out only, leading you directly to the original bot.
          </p>
        </div>

        <div className="border border-[#212623] bg-[#131615]/30 rounded-xl p-6">
          <div className="text-[#8FBF3F] font-mono text-xs uppercase mb-2">&gt; free_index</div>
          <h3 className="text-white font-bold text-base mb-2 font-serif">Completely Free</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            No registration or paywall required to browse lists. Save favorites locally and submit new discoveries directly to the queue.
          </p>
        </div>
      </div>

      {/* Statistics Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-xl border border-[#212623]/80 bg-[#131615]/40 text-center">
        {stats.map((s, idx) => (
          <div key={idx} className="space-y-1">
            <div className={`text-2xl sm:text-3xl font-bold font-serif ${s.isDate ? "text-white/80" : "text-[#8FBF3F]"}`}>
              {s.value}
            </div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function AINews() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 border-b border-slate-900 font-sans">
      <div className="mb-6">
        <h2 className="font-serif text-xl font-medium tracking-tight text-white sm:text-2xl">
          Latest AI Releases & Updates
        </h2>
        <p className="text-[#8FBF3F] text-xs mt-1 font-mono">
          &gt; real_time_industry_news_ticks
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {NEWS_ITEMS.map((item, idx) => (
          <a
            key={idx}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block border border-[#212623] bg-[#131615]/30 rounded-xl p-6 hover:border-[#8FBF3F]/35 transition-all duration-300"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] px-2 py-0.5 rounded border border-[#8FBF3F]/20 bg-[#8FBF3F]/10 text-[#8FBF3F] font-mono uppercase">
                {item.tag}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {item.date}
              </span>
            </div>
            <h3 className="text-white font-bold text-sm group-hover:text-[#8FBF3F] transition-colors leading-snug line-clamp-1 mb-2 font-serif">
              {item.title}
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
              {item.summary}
            </p>
            <div className="mt-4 text-[10px] font-mono text-[#8FBF3F]/80 group-hover:text-white transition-colors">
              Read source article &rarr;
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
