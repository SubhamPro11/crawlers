"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Tool, mockDb, slugify } from "@/data/mockDb";

export function cleanDescription(desc: string): string {
  if (!desc) return "";
  let clean = desc.trim();
  
  // Pattern matches common trailing conjunctions/prepositions
  const danglingPattern = /\s+(and|or|the|with|a|an|for|of|to|at|by|from|in|on|about|as|but|so|yet)[.,\s]*([.]{3}|…)?$/i;
  clean = clean.replace(danglingPattern, (match, word, dots) => {
    return dots ? ` ${dots}` : "";
  });
  
  // Clean up trailing commas, colons, or semicolons before ellipsis
  clean = clean.replace(/[,;:]\s*([.]{3}|…)$/, "$1");
  
  // Clean up trailing commas or punctuation at the very end
  clean = clean.replace(/[,;:]+$/, "");
  
  return clean;
}

interface ToolCardProps {
  tool: Tool;
  categoryName?: string;
  onRefresh?: () => void;
}

export default function ToolCard({ tool, categoryName, onRefresh }: ToolCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem("crawlers_favorites") || "[]");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsFavorite(favs.includes(tool.id));
  }, [tool.id]);

  const handleVisit = () => {
    mockDb.incrementClickCount(tool.id);
    if (onRefresh) onRefresh();
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const canonicalUrl = `${window.location.origin}/tool/${tool.id}`;
    if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(canonicalUrl).catch(() => {
        // fallback ignored
      });
    } else if (typeof document !== "undefined") {
      const textArea = document.createElement("textarea");
      textArea.value = canonicalUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }

    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1500);
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const favs = JSON.parse(localStorage.getItem("crawlers_favorites") || "[]");
    let nextFavs;
    if (favs.includes(tool.id)) {
      nextFavs = favs.filter((id: string) => id !== tool.id);
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
    if (onRefresh) onRefresh();
  };

  const getPricingBadge = (pricing: string) => {
    switch (pricing) {
      case "free":
        return "bg-[#8FBF3F]/10 text-[#8FBF3F] border border-[#8FBF3F]/20";
      case "freemium":
        return "bg-[#E8A33D]/10 text-[#E8A33D] border border-[#E8A33D]/20";
      case "paid":
        return "bg-[#8A8F87]/15 text-[#EDEEEA] border border-[#212623]";
      default:
        return "bg-transparent text-[#8A8F87] border border-[#212623]/60";
    }
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-[#212623] bg-[#131615]/40 backdrop-blur-md p-5 transition-colors duration-[120ms] hover:border-[#8FBF3F]/35">
      
      {/* Action Buttons: Copy-Link & Favorite */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5">
        {/* Copy-Link Button */}
        <button
          onClick={handleCopyLink}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#212623] bg-[#0E100F] text-[#8A8F87] hover:text-[#8FBF3F] hover:border-[#8FBF3F]/40 active:bg-[#1a1f1d] transition-colors duration-[100ms] cursor-pointer"
          aria-label={isCopied ? `Copied link for ${tool.name}` : `Copy link for ${tool.name}`}
          title={isCopied ? "Link copied!" : "Copy tool page link"}
        >
          {isCopied ? (
            <svg
              className="h-4 w-4 stroke-[#8FBF3F] fill-none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg
              className="h-4 w-4 fill-none stroke-current"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          )}
        </button>

        {/* Favorite Toggle Button */}
        <button
          onClick={toggleFavorite}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#212623] bg-[#0E100F] text-[#8A8F87] hover:text-[#8FBF3F] hover:border-[#8FBF3F]/40 active:bg-[#1a1f1d] transition-colors duration-[100ms] cursor-pointer"
          aria-label={isFavorite ? `Remove ${tool.name} from bookmarks` : `Bookmark ${tool.name}`}
        >
          <svg
            className={`h-4.5 w-4.5 transition-all duration-[150ms] ${isFavorite ? "fill-[#8FBF3F] stroke-[#8FBF3F]" : "fill-none stroke-current"}`}
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      <div>
        {/* Header: Initials + Title + Pricing */}
        <div className="flex items-start justify-between gap-3 mb-4 pr-20">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-[#212623] bg-[#0D0F0E] text-[#8FBF3F] font-mono font-bold text-xs shadow-inner">
              {tool.name.substring(0, 2).toLowerCase()}
            </div>
            <div>
              <Link href={`/tool/${tool.id}`}>
                <h3 className="font-serif text-lg font-medium text-white group-hover:text-[#8FBF3F] transition-colors leading-tight line-clamp-1">
                  {tool.name}
                </h3>
              </Link>
              {categoryName && (
                <span className="font-mono text-[9px] tracking-wider text-[#8A8F87] uppercase">
                  &gt; {categoryName}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Badges below Title */}
        <div className="flex items-center gap-2 mb-3 flex-wrap font-mono">
          <span className={`rounded-sm px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider ${getPricingBadge(tool.pricing_model)}`}>
            {tool.pricing_model}
          </span>

          {(tool.status === "needs_review" || tool.status === "broken_link") && (
            <span className="rounded-sm px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider bg-[#E8A33D]/15 text-[#E8A33D] border border-[#E8A33D]/30">
              ⚠ needs re-check
            </span>
          )}
        </div>

        {/* Short Description */}
        <p className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-3 font-sans">
          {cleanDescription(tool.short_description)}
        </p>

        {/* Monospace tag list */}
        <div className="flex flex-wrap gap-x-2 gap-y-1 mb-5 font-mono text-[10px] text-[#8A8F87]">
          {tool.tags.slice(0, 3).map((tag, idx) => (
            <Link
              key={`${tag}-${idx}`}
              href={`/tags/${slugify(tag)}`}
              className="before:content-['['] after:content-[']'] hover:text-[#8FBF3F] transition-colors"
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      {(() => {
        const isExtension = 
          categoryName?.toLowerCase().includes("extension") ||
          tool.category_id === "fe1ee758-4faf-4b9f-873a-bb95a5939552" ||
          tool.tags?.some(t => t.toLowerCase().includes("extension")) ||
          tool.url?.includes("chromewebstore") ||
          tool.url?.includes("chrome.google.com") ||
          tool.url?.includes("addons.mozilla.org");

        const ctaLabel = isExtension ? "get_extension" : "run_bot";

        return (
          <div className="flex items-center justify-between border-t border-[#212623]/60 pt-4 mt-auto">
            <div className="flex items-center gap-1.5 text-[#8A8F87] font-mono text-[9px] uppercase tracking-wider">
              <span className="h-1 w-1 rounded-full bg-[#8FBF3F]" />
              {(() => {
                const dateStr = tool.last_checked_at || tool.last_crawled_at || tool.created_at;
                let formatted = "";
                if (dateStr) {
                  const d = new Date(dateStr);
                  if (!isNaN(d.getTime())) {
                    formatted = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  }
                }
                return <span>verified{formatted ? ` ${formatted}` : ""}</span>;
              })()}
            </div>

            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleVisit}
              className="inline-flex items-center justify-center gap-1 text-[11px] font-mono font-bold text-[#8FBF3F] hover:text-[#7ba235] active:text-[#6c9130] transition-colors duration-[100ms] group/btn"
            >
              <span>{ctaLabel}</span>
              <span className="text-[#8A8F87]/60 font-normal">→</span>
            </a>
          </div>
        );
      })()}
    </div>
  );
}
