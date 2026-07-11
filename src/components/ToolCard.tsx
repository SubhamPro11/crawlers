"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Tool, mockDb } from "@/data/mockDb";

interface ToolCardProps {
  tool: Tool;
  categoryName?: string;
  onRefresh?: () => void;
}

export default function ToolCard({ tool, categoryName, onRefresh }: ToolCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem("crawlers_favorites") || "[]");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsFavorite(favs.includes(tool.id));
  }, [tool.id]);

  const handleVisit = () => {
    mockDb.incrementClickCount(tool.id);
    if (onRefresh) onRefresh();
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
    <div className="group relative flex flex-col justify-between rounded-xl border border-[#212623] bg-[#131615]/40 backdrop-blur-md p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-[#8FBF3F]/35 hover:shadow-2xl hover:shadow-[#8FBF3F]/5">
      
      {/* Favorite Toggle Button */}
      <button
        onClick={toggleFavorite}
        className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-[#212623] bg-[#0E100F] text-[#8A8F87] hover:text-[#8FBF3F] hover:border-[#8FBF3F]/40 hover:scale-105 active:scale-95 transition-all duration-200"
        aria-label="Toggle Bookmark"
      >
        <svg
          className={`h-4.5 w-4.5 transition-transform duration-300 ${isFavorite ? "fill-[#8FBF3F] stroke-[#8FBF3F] scale-110" : "fill-none stroke-current"}`}
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      <div>
        {/* Header: Initials + Title + Pricing */}
        <div className="flex items-start justify-between gap-3 mb-4 pr-8">
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

        {/* Pricing Badge below Title */}
        <div className="mb-3">
          <span className={`rounded-sm px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider ${getPricingBadge(tool.pricing_model)}`}>
            {tool.pricing_model}
          </span>
        </div>

        {/* Short Description */}
        <p className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-3 font-sans">
          {tool.short_description}
        </p>

        {/* Monospace tag list */}
        <div className="flex flex-wrap gap-x-2 gap-y-1 mb-5 font-mono text-[10px] text-[#8A8F87]">
          {tool.tags.slice(0, 3).map((tag, idx) => (
            <Link
              key={`${tag}-${idx}`}
              href={`/tag/${encodeURIComponent(tag)}`}
              className="before:content-['['] after:content-[']'] hover:text-[#8FBF3F] transition-colors"
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between border-t border-[#212623]/60 pt-4 mt-auto">
        <div className="flex items-center gap-1.5 text-[#8A8F87] font-mono text-[9px] uppercase tracking-wider">
          <span className="h-1 w-1 rounded-full bg-[#8FBF3F]" />
          <span>verified</span>
        </div>

        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleVisit}
          className="inline-flex items-center justify-center gap-1 text-[11px] font-mono font-bold text-[#8FBF3F] hover:text-[#7ba235] transition-all group/btn"
        >
          <span>run_bot</span>
          <span className="text-[#8A8F87]/60 font-normal transition-transform group-hover/btn:translate-x-0.5">→</span>
        </a>
      </div>
    </div>
  );
}
