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

  // Get color for pricing badges
  const getPricingBadge = (pricing: string) => {
    switch (pricing) {
      case "free":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "freemium":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "paid":
        return "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
    }
  };

  // Generate unique gradient based on name characters
  const getGradient = (name: string) => {
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      "from-[#10B981] to-[#059669]",
      "from-[#3B82F6] to-[#2563EB]",
      "from-[#8B5CF6] to-[#7C3AED]",
      "from-[#EC4899] to-[#DB2777]",
      "from-[#F59E0B] to-[#D97706]",
      "from-[#06B6D4] to-[#0891B2]",
    ];
    return colors[hash % colors.length];
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-slate-800 bg-[#131B2E] p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-slate-700/80 hover:shadow-slate-900/50 glow-emerald">
      <div>
        {/* Header: Logo Initial + Title + Pricing */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${getGradient(tool.name)} text-white font-bold text-base shadow-sm`}>
              {tool.name.charAt(0)}
            </div>
            <div>
              <Link href={`/tool/${tool.id}`} className="hover:underline">
                <h3 className="font-semibold text-white group-hover:text-[#10B981] transition-colors leading-tight line-clamp-1">
                  {tool.name}
                </h3>
              </Link>
              {categoryName && (
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                  {categoryName}
                </span>
              )}
            </div>
          </div>
          
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize ${getPricingBadge(tool.pricing_model)}`}>
            {tool.pricing_model}
          </span>
        </div>

        {/* Short Description */}
        <p className="text-slate-300 text-sm leading-relaxed mb-4 line-clamp-3">
          {tool.short_description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {tool.tags.slice(0, 3).map((tag) => (
            <span 
              key={tag} 
              className="rounded bg-slate-800/60 px-2 py-0.5 text-[11px] text-slate-400 font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between border-t border-slate-800/60 pt-4 mt-auto">
        <div className="flex items-center gap-1 text-slate-500 text-xs">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span>{tool.click_count} redirects</span>
        </div>

        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleVisit}
          className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-[#10B981] hover:text-[#059669] transition-all group/btn"
        >
          <span>Visit Platform</span>
          <svg className="h-3 w-3 transition-transform group-hover/btn:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}
