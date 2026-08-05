"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { mockDb, Tool, slugify } from "@/data/mockDb";
import ToolCard from "@/components/ToolCard";
import { TerminalLoader } from "@/components/TerminalLoader";

interface TagPageClientProps {
  slug: string;
  initialTagName?: string;
  initialTools?: Tool[];
}

export default function TagPageClient({
  slug,
  initialTagName = "",
  initialTools = [],
}: TagPageClientProps) {
  const [tagName, setTagName] = useState<string>(initialTagName);
  const [tools, setTools] = useState<Tool[]>(initialTools);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "recent">("name");
  const [isLoading, setIsLoading] = useState(!initialTagName && Boolean(slug));

  const sortedAndFilteredTools = useMemo(() => {
    const filtered = tools.filter(tool => {
      if (activeFilter === "all") return true;
      return tool.pricing_model === activeFilter;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return a.name.localeCompare(b.name);
    });
  }, [tools, activeFilter, sortBy]);

  const relatedTags = useMemo(() => {
    if (!tagName) return [];
    const allTags = new Set<string>();
    tools.forEach((t) => {
      if (t.tags) {
        t.tags.forEach((tagItem) => {
          const trimmed = tagItem.trim();
          if (trimmed && trimmed.toLowerCase() !== tagName.toLowerCase()) {
            allTags.add(trimmed);
          }
        });
      }
    });
    return Array.from(allTags).slice(0, 8);
  }, [tools, tagName]);

  const fetchTagData = useCallback(async () => {
    if (!slug) {
      setIsLoading(false);
      return;
    }
    const res = await mockDb.getToolsByTagSlug(slug);
    setTools(res.tools);
    setTagName(res.tagName);
    setIsLoading(false);
  }, [slug]);

  useEffect(() => {
    if (!initialTagName && slug) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchTagData();
    }
  }, [slug, initialTagName, fetchTagData]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <TerminalLoader message="querying_tag_index" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 font-sans">
      {/* Breadcrumbs */}
      <div className="mb-6 flex items-center gap-2 font-mono text-xs text-[#8A8F87]">
        <Link href="/" className="hover:text-white transition-colors">
          index
        </Link>
        <span>/</span>
        <Link href="/tags" className="hover:text-[#8FBF3F] transition-colors">
          tags
        </Link>
        <span>/</span>
        <span className="text-white font-bold">[{tagName || slug}]</span>
      </div>

      {/* Header Info */}
      <div className="mb-8 border-b border-[#212623] pb-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[#8FBF3F] font-mono font-bold text-2xl sm:text-3xl">&gt;</span>
              <h1 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
                [{tagName || slug}]
              </h1>
              <span className="rounded-full bg-[#131615] border border-[#212623] px-3 py-1 text-xs font-mono font-bold text-[#8FBF3F]">
                {tools.length} {tools.length === 1 ? 'tool' : 'tools'}
              </span>
            </div>
            <p className="text-slate-400 text-sm max-w-3xl leading-relaxed mt-2 font-sans">
              All indexed AI platforms, command utilities, and bots tagged under <code className="text-[#8FBF3F] font-mono">[{tagName || slug}]</code>.
            </p>
          </div>

          <Link
            href="/tags"
            className="rounded-lg border border-[#212623] bg-[#131615] px-3 py-2 text-xs font-mono text-[#8A8F87] hover:text-white hover:border-[#8FBF3F]/40 transition-all shrink-0"
          >
            &larr; All Tags
          </Link>
        </div>

        {/* Related Tags Row */}
        {relatedTags.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="text-slate-500 text-[10px] uppercase font-bold mr-1">related tags:</span>
            {relatedTags.map((tag) => (
              <Link
                key={tag}
                href={`/tags/${slugify(tag)}`}
                className="rounded bg-[#131615] border border-[#212623] px-2.5 py-1 text-[10px] text-[#8A8F87] hover:text-[#8FBF3F] hover:border-[#8FBF3F]/35 transition-colors"
              >
                [{tag}]
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#212623]/60 pb-4 font-mono text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-500 uppercase font-bold text-[10px] mr-1">pricing:</span>
          {["all", "free", "freemium", "paid"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`rounded-lg px-3 py-1.5 font-semibold capitalize transition-all cursor-pointer ${
                activeFilter === filter
                  ? "bg-[#8FBF3F] text-slate-950 font-bold"
                  : "bg-[#131615] border border-[#212623] text-slate-400 hover:text-white hover:border-slate-700"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 uppercase font-bold text-[10px]">sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "name" | "recent")}
            className="rounded-lg border border-[#212623] bg-[#131615] px-3 py-1.5 text-white outline-none focus:border-[#8FBF3F] transition-all cursor-pointer font-mono"
          >
            <option value="name">Alphabetical (A-Z)</option>
            <option value="recent">Recently Added</option>
          </select>
        </div>
      </div>

      {/* Tools Grid */}
      {sortedAndFilteredTools.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sortedAndFilteredTools.map((tool) => (
            <ToolCard 
              key={tool.id} 
              tool={tool} 
              categoryName={tool.categories?.name}
              onRefresh={fetchTagData}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center border border-[#212623] rounded-xl bg-[#131615] font-mono">
          <div className="text-slate-500 text-xs mb-2">&gt; no_tools_tagged</div>
          <p className="text-slate-400 text-sm mb-4">
            No tools tagged <code className="text-[#8FBF3F]">[{tagName || slug}]</code> match the selected filter <code className="text-[#8FBF3F]">{activeFilter}</code>.
          </p>
          <button
            onClick={() => setActiveFilter("all")}
            className="rounded-lg bg-[#131615] border border-[#212623] px-4 py-2 text-xs font-bold text-[#8FBF3F] hover:border-[#8FBF3F] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
