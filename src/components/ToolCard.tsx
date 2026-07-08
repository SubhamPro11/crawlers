"use client";

import Link from "next/link";
import { Tool, mockDb } from "@/data/mockDb";

interface ToolCardProps {
  tool: Tool;
  categoryName?: string;
  onRefresh?: () => void;
}

export default function ToolCard({ tool, categoryName, onRefresh }: ToolCardProps) {
  const handleVisit = () => {
    mockDb.incrementClickCount(tool.id);
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
    <div className="group relative flex flex-col justify-between rounded-lg border border-[#212623] bg-[#131615] p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-[#8FBF3F]/40 hover:shadow-black/50">
      <div>
        {/* Header: Terminal Initials + Title + Pricing */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-[#212623] bg-[#0D0F0E] text-[#8FBF3F] font-mono font-bold text-xs shadow-inner">
              {tool.name.substring(0, 2).toLowerCase()}
            </div>
            <div>
              <Link href={`/tool/${tool.id}`} className="hover:underline">
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
          
          <span className={`rounded-sm px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider ${getPricingBadge(tool.pricing_model)}`}>
            {tool.pricing_model}
          </span>
        </div>

        {/* Short Description */}
        <p className="text-slate-400 text-[15px] leading-relaxed mb-4 line-clamp-3 font-sans">
          {tool.short_description}
        </p>

        {/* Monospace tag list */}
        <div className="flex flex-wrap gap-x-2 gap-y-1 mb-5 font-mono text-[10px] text-[#8A8F87]">
          {tool.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="before:content-['['] after:content-[']']">
              {tag}
            </span>
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
