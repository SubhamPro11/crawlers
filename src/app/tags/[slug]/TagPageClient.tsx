"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { mockDb, Tool, slugify } from "@/data/mockDb";
import ToolCard from "@/components/ToolCard";
import { TerminalLoader } from "@/components/TerminalLoader";

export default function TagPageClient({ slug }: { slug: string }) {
  const [tagName, setTagName] = useState<string>("");
  const [tools, setTools] = useState<Tool[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "recent">("name");
  const [isLoading, setIsLoading] = useState(true);

  const sortedAndFilteredTools = useMemo(() => {
    const filtered = tools.filter(tool => {
      if (activeFilter === "all") return true;
      if (activeFilter === "premium" || activeFilter === "paid") {
        return tool.pricing_model === "paid";
      }
      return tool.pricing_model === activeFilter;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return a.name.localeCompare(b.name);
    });
  }, [tools, activeFilter, sortBy]);

  // Find related tags
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
    return Array.from(allTags).slice(0, 8); // Limit to 8 related tags
  }, [tools, tagName]);

  const fetchTagData = useCallback(async () => {
    if (!slug) {
      setTimeout(() => setIsLoading(false), 0);
      return;
    }
    const res = await mockDb.getToolsByTagSlug(slug);
    setTools(res.tools);
    setTagName(res.tagName);
    setIsLoading(false);
  }, [slug]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchTagData();
    }, 0);
    return () => clearTimeout(timeout);
  }, [fetchTagData]);

  if (isLoading) {
    return <TerminalLoader message="loading_tag_data" />;
  }

  const pricingFilters = [
    { label: "All", value: "all" },
    { label: "Free", value: "free" },
    { label: "Freemium", value: "freemium" },
    { label: "Premium", value: "premium" }
  ];

  return (
    <div className="flex-1 mx-auto max-w-7xl w-full px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6 font-sans">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <Link href="/tags" className="hover:text-white transition-colors">Tags</Link>
        <span>/</span>
        <span className="text-[#8FBF3F] font-mono">[{tagName || slug.replace(/-/g, " ")}]</span>
      </nav>

      {/* Header Info */}
      <div className="border-b border-slate-800/80 pb-8 mb-8 font-sans">
        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#8FBF3F] mb-2 font-mono">
          &gt; tag: {tagName || slug.replace(/-/g, " ")}
        </span>
        <h1 className="font-serif text-3xl font-medium tracking-tight text-white sm:text-4xl">
          <span className="font-mono text-[#8FBF3F]">[</span>{tagName || slug.replace(/-/g, " ")}<span className="font-mono text-[#8FBF3F]">]</span>
        </h1>
        <p className="text-slate-400 text-sm mt-3 max-w-2xl leading-relaxed font-sans">
          {tools.length} tool{tools.length !== 1 ? "s" : ""} available
        </p>
      </div>

      {/* Related Tags Hopping Link list */}
      {relatedTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-8 font-mono text-[10px] text-[#8A8F87]">
          <span className="text-[9px] uppercase font-bold text-slate-500">Related tags:</span>
          {relatedTags.map((relatedTag, idx) => (
            <Link
              key={idx}
              href={`/tags/${slugify(relatedTag)}`}
              className="rounded-lg bg-[#131615] border border-[#212623] hover:border-[#8FBF3F]/35 hover:text-[#8FBF3F] px-2.5 py-1 transition-all"
            >
              [{relatedTag}]
            </Link>
          ))}
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-8 font-sans">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap gap-2 font-mono">
            {pricingFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-mono font-semibold transition-colors duration-100 cursor-pointer ${
                  activeFilter === filter.value
                    ? "bg-[#8FBF3F] text-slate-950 border border-[#8FBF3F]"
                    : "bg-[#131615] text-slate-400 border border-[#212623] hover:text-white hover:border-[#8FBF3F]/40"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <label htmlFor="tag-sort-select" className="text-[#8FBF3F] font-bold">
            &gt; sort_by:
          </label>
          <div className="relative">
            <select
              id="tag-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "name" | "recent")}
              className="appearance-none bg-[#131615] text-slate-300 border border-[#212623] hover:border-[#8FBF3F]/40 focus:border-[#8FBF3F] rounded-lg px-3 py-1.5 pr-8 text-xs font-mono font-medium outline-none cursor-pointer transition-colors"
            >
              <option value="recent">Recently Added</option>
              <option value="name">A-Z</option>
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
              ▾
            </div>
          </div>
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
        <div className="rounded-xl border border-dashed border-[#212623] bg-[#131615]/20 p-12 text-center font-sans">
          <h3 className="text-base font-bold text-white mb-2">No tools found</h3>
          <p className="text-slate-400 text-xs max-w-xs mx-auto mb-6">
            There are no tools tagged with <span className="font-mono text-[#8FBF3F]">[{tagName}]</span> matching the active filter.
          </p>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[#8FBF3F] px-5 text-xs font-semibold text-slate-950 hover:bg-[#7ba235] transition-colors"
          >
            Back to Directory
          </Link>
        </div>
      )}
    </div>
  );
}
