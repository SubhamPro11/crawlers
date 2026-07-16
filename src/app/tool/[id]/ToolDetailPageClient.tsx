"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { mockDb, Tool, slugify } from "@/data/mockDb";
import ToolCard from "@/components/ToolCard";
import { TerminalLoader } from "@/components/TerminalLoader";

export default function ToolDetailPageClient({ id }: { id: string }) {
  const [tool, setTool] = useState<Tool | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [similarTools, setSimilarTools] = useState<Tool[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);

  const fetchToolData = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    const t = await mockDb.getActiveToolById(id);
    if (t) {
      setTool(t);
      setCategoryName(t.categories?.name || "");
      setCategorySlug(t.categories?.slug || "");
      
      // Load similar tools (same category + overlapping tags fallback)
      const res = await mockDb.getSimilarTools(t.id, t.category_id, t.tags);
      setSimilarTools(res.slice(0, 4));

      // Log Recently Viewed
      try {
        const items = JSON.parse(localStorage.getItem("crawlers_recent_items") || "[]");
        const filtered = items.filter((i: { id: string }) => i.id !== t.id);
        const updated = [
          { id: t.id, name: t.name, type: "tool", slugOrUrl: t.id, timestamp: Date.now() },
          ...filtered
        ].slice(0, 10);
        localStorage.setItem("crawlers_recent_items", JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent("recent-items-updated"));
      } catch (e) {
        console.error("Error writing recent items:", e);
      }

      // Load Favorite Status
      try {
        const favs = JSON.parse(localStorage.getItem("crawlers_favorites") || "[]");
        setIsFavorite(favs.includes(t.id));
      } catch (e) {
        console.error("Error reading favorites:", e);
      }
    }
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchToolData();
  }, [fetchToolData]);

  const handleVisit = async () => {
    if (tool) {
      await mockDb.incrementClickCount(tool.id);
      fetchToolData();
    }
  };

  const toggleFavorite = () => {
    if (!tool) return;
    try {
      const favs = JSON.parse(localStorage.getItem("crawlers_favorites") || "[]");
      let nextFavs;
      if (favs.includes(tool.id)) {
        nextFavs = favs.filter((i: string) => i !== tool.id);
        setIsFavorite(false);
        window.dispatchEvent(new CustomEvent("toast", { 
          detail: { message: `Removed "${tool.name}" from bookmarks`, type: "info" } 
        }));
      } else {
        nextFavs = [...favs, tool.id];
        setIsFavorite(true);
        window.dispatchEvent(new CustomEvent("toast", { 
          detail: { message: `Added "${tool.name}" to bookmarks`, type: "success" } 
        }));
      }
      localStorage.setItem("crawlers_favorites", JSON.stringify(nextFavs));
      window.dispatchEvent(new CustomEvent("favorites-updated"));
    } catch (e) {
      console.error("Error toggling favorite:", e);
    }
  };

  const handleShare = async () => {
    if (!tool) return;
    const shareData = {
      title: `${tool.name} | Crawlers`,
      text: tool.short_description,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        window.dispatchEvent(new CustomEvent("toast", { detail: { message: "Shared successfully!", type: "success" } }));
        return;
      } catch {
        // Fallback to copy
      }
    }

    try {
      navigator.clipboard.writeText(window.location.href);
      window.dispatchEvent(new CustomEvent("toast", { detail: { message: "Link copied to clipboard!", type: "success" } }));
    } catch (e) {
      console.error("Error sharing:", e);
    }
  };

  if (isLoading) {
    return <TerminalLoader message="loading_tool_data" />;
  }

  if (!tool) {
    return (
      <div className="flex-1 mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Tool Not Found</h1>
        <p className="text-slate-400 mb-8">The AI tool you are searching for is not registered in our database.</p>
        <Link 
          href="/" 
          className="inline-flex h-11 items-center justify-center rounded-lg bg-[#8FBF3F] px-5 text-sm font-semibold text-slate-950 hover:bg-[#7ba235] transition-colors"
        >
          Go Back Home
        </Link>
      </div>
    );
  }

  const pricingLabels = {
    free: "Free to Use",
    freemium: "Freemium (Free with paid tiers)",
    paid: "Paid / Subscription Only",
    unknown: "Pricing Unspecified"
  };

  const getPricingColor = (pricing: string) => {
    switch (pricing) {
      case "free": return "text-[#8FBF3F] border-[#8FBF3F]/20 bg-[#8FBF3F]/10";
      case "freemium": return "text-amber-400 border-amber-500/20 bg-amber-500/10";
      case "paid": return "text-[#EDEEEA] border-[#212623] bg-[#8A8F87]/15";
      default: return "text-slate-400 border-slate-500/20 bg-slate-500/10";
    }
  };

  const getGradient = (name: string) => {
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      "from-[#8FBF3F] to-[#06B6D4]",
      "from-[#3B82F6] to-[#8B5CF6]",
      "from-[#EC4899] to-[#F43F5E]",
      "from-[#F59E0B] to-[#EF4444]",
    ];
    return colors[hash % colors.length];
  };

  return (
    <div className="flex-1 mx-auto max-w-6xl w-full px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-8 font-sans">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        {categorySlug && (
          <>
            <Link href={`/category/${categorySlug}`} className="hover:text-white transition-colors capitalize">
              {categoryName}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-slate-300">{tool.name}</span>
      </nav>

      {/* Main Detail Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Tool Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-2xl border border-[#212623] bg-[#131615]/30 backdrop-blur-md p-6 sm:p-10 shadow-2xl shadow-black/25">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-[#212623]">
              
              {/* Logo & Basic Info */}
              <div className="flex items-center gap-4">
                <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${getGradient(tool.name)} text-white font-extrabold text-2xl shadow-lg`}>
                  {tool.name.charAt(0)}
                </div>
                <div>
                  <h1 className="font-serif text-2xl sm:text-3xl font-medium text-white tracking-tight">
                    {tool.name}
                  </h1>
                  {categoryName && (
                    <Link 
                      href={`/category/${categorySlug}`}
                      className="inline-block text-xs font-semibold text-[#8FBF3F] hover:underline uppercase tracking-wider mt-1 font-mono"
                    >
                      &gt; {categoryName}
                    </Link>
                  )}
                </div>
              </div>

              {/* Actions: Bookmark & Visit & Share */}
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleFavorite}
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#212623] bg-[#0E100F] text-[#8A8F87] hover:text-[#8FBF3F] hover:border-[#8FBF3F]/40 active:scale-95 transition-all"
                  aria-label="Bookmark Tool"
                >
                  <svg
                    className={`h-5 w-5 ${isFavorite ? "fill-[#8FBF3F] stroke-[#8FBF3F]" : "fill-none stroke-current"}`}
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>

                <button
                  onClick={handleShare}
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#212623] bg-[#0E100F] text-[#8A8F87] hover:text-[#8FBF3F] hover:border-[#8FBF3F]/40 active:scale-95 transition-all"
                  aria-label="Share Tool"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742l4.632-2.316m0 7.144l-4.632-2.316m0 0a3 3 0 100-4.318 3 3 0 000 4.318zm6-6a3 3 0 11-6 0 3 3 0 016 0zm-6 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>

                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleVisit}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#8FBF3F] hover:bg-[#7ba235] px-6 text-sm font-bold text-slate-950 transition-all shadow-md shadow-[#8FBF3F]/15 group font-mono"
                >
                  <span>run_bot</span>
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Description */}
            <div className="pt-8 space-y-6">
              {tool.why_indexed && (
                <div className="border border-[#212623] bg-[#8FBF3F]/5 rounded-xl p-5 mb-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#8FBF3F] mb-2 font-mono">
                    &gt; editorial_note // why we indexed this
                  </h4>
                  <p className="text-slate-350 text-sm leading-relaxed font-sans">
                    {tool.why_indexed}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 font-mono">
                  &gt; description
                </h3>
                <p className="text-slate-350 text-base leading-relaxed whitespace-pre-line font-sans">
                  {tool.short_description}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 font-mono">
                  &gt; tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tool.tags.map((tag, idx) => (
                    <Link 
                      key={`${tag}-${idx}`}
                      href={`/tags/${slugify(tag)}`}
                      className="rounded-lg bg-[#131615] border border-[#212623] hover:border-[#8FBF3F]/40 px-3 py-1.5 text-xs text-slate-300 font-mono hover:text-[#8FBF3F] transition-all"
                    >
                      [{tag}]
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Compliance Note */}
            <div className="mt-12 border-t border-[#212623] pt-6">
              <p className="text-[10px] text-slate-500 leading-normal font-sans">
                This entry was automatically aggregated and paraphrased to ensure Robots.txt compliance and copyright standards. Clicking &quot;run_bot&quot; redirects you to the direct external platform in compliance with link-out conventions.
              </p>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Sticky Metadata Sidebar */}
        <div className="space-y-6">
          <div className="sticky top-24 rounded-2xl border border-[#212623] bg-[#131615]/30 backdrop-blur-md p-6 shadow-2xl shadow-black/25 space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#212623] pb-2 font-mono">
              &gt; system_stats
            </h3>
            
            {/* Pricing Model */}
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 mb-1 font-mono">pricing_model</div>
              <span className={`inline-block rounded px-2.5 py-0.5 text-xs font-semibold border ${getPricingColor(tool.pricing_model)} font-mono mb-2`}>
                {pricingLabels[tool.pricing_model]}
              </span>
              {(tool.starting_price || tool.pricing_url) && (
                <div className="mt-2 pl-3 border-l border-[#212623] space-y-1.5 font-mono text-xs text-slate-400">
                  {tool.starting_price && (
                    <div>
                      <span className="text-slate-500">starting_at:</span> <span className="text-slate-200">{tool.starting_price}</span>
                    </div>
                  )}
                  {tool.pricing_url && (
                    <div>
                      <a 
                        href={tool.pricing_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[#8FBF3F] hover:underline inline-flex items-center gap-1 mt-1 text-[11px]"
                      >
                        <span>[view_pricing_sheet]</span>
                        <svg className="h-3 w-3 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Link Status */}
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 mb-1 font-mono">link_status</div>
              <div className="text-xs font-semibold text-white flex items-center gap-1.5 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-[#8FBF3F] animate-pulse" />
                <span>active_connection</span>
              </div>
            </div>

            {/* Click Count */}
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 mb-0.5 font-mono">click_counter</div>
              <span className="text-xs text-slate-300 font-mono">{tool.click_count || 0} clicks</span>
            </div>

            {/* Source */}
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 mb-0.5 font-mono">indexing_source</div>
              <span className="text-xs text-[#8A8F87] font-mono capitalize">{tool.source.replace("_", " ")}</span>
            </div>

            {/* Last Checked */}
            {tool.last_checked_at && (
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-500 mb-0.5 font-mono">last_checked</div>
                <span className="text-xs text-[#8A8F87] font-mono">
                  {new Date(tool.last_checked_at).toLocaleDateString(undefined, { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            )}

            {/* Last Crawled */}
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 mb-0.5 font-mono">last_crawled</div>
              <span className="text-xs text-[#8A8F87] font-mono">
                {new Date(tool.last_crawled_at).toLocaleDateString(undefined, { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </div>
        
      </div>

      {/* Similar Tools Section */}
      {similarTools.length >= 2 && (
        <div className="space-y-6 mt-12 border-t border-[#212623] pt-12">
          <div className="font-sans">
            <h2 className="font-serif text-2xl font-medium text-white tracking-tight">
              Similar Tools
            </h2>
            <p className="text-slate-500 text-xs mt-1 font-mono">
              &gt; similar_tools
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {similarTools.map((t) => (
              <ToolCard key={t.id} tool={t} categoryName={t.categories?.name} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
