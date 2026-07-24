"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { mockDb, Category, Tool, getCategoryGroup } from "@/data/mockDb";
import ToolCard from "@/components/ToolCard";
import { TerminalLoader } from "@/components/TerminalLoader";

export default function CategoryPageClient({ slug }: { slug: string }) {
  const [category, setCategory] = useState<Category | null>(null);
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

  // Load from local storage cache instantly on mount/slug change
  useEffect(() => {
    if (!slug) return;
    try {
      const cached = localStorage.getItem(`crawlers_cached_cat_${slug}`);
      if (cached) {
        const { category: cachedCat, tools: cachedTools } = JSON.parse(cached);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCategory(cachedCat);
        setTools(cachedTools);
        setIsLoading(false);
      }
    } catch (e) {
      console.error("Error reading category cache:", e);
    }
  }, [slug]);

  const fetchCategoryData = useCallback(async () => {
    if (!slug) {
      setIsLoading(false);
      return;
    }
    const cat = await mockDb.getCategoryBySlug(slug);
    if (cat) {
      setCategory(cat);
      const categoryTools = await mockDb.getToolsByCategory(cat.id);
      setTools(categoryTools);

      // Save to cache
      try {
        localStorage.setItem(
          `crawlers_cached_cat_${slug}`,
          JSON.stringify({ category: cat, tools: categoryTools })
        );
      } catch (e) {
        console.error("Error writing category cache:", e);
      }

      // Log Recently Viewed Category
      const items = JSON.parse(localStorage.getItem("crawlers_recent_items") || "[]");
      const filtered = items.filter((i: { id: string }) => i.id !== cat.id);
      const updated = [
        { id: cat.id, name: cat.name, type: "category", slugOrUrl: cat.slug, timestamp: Date.now() },
        ...filtered
      ].slice(0, 10);
      localStorage.setItem("crawlers_recent_items", JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("recent-items-updated"));
    }
    setIsLoading(false);
  }, [slug]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategoryData();
  }, [fetchCategoryData]);

  if (isLoading) {
    return <TerminalLoader message="loading_category_data" />;
  }

  if (!category) {
    return (
      <div className="flex-1 mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Category Not Found</h1>
        <p className="text-slate-400 mb-8">The category you are looking for does not exist in our directory.</p>
        <Link 
          href="/" 
          className="inline-flex h-11 items-center justify-center rounded-lg bg-[#8FBF3F] px-5 text-sm font-semibold text-slate-950 hover:bg-[#7ba235] transition-colors"
        >
          Go Back Home
        </Link>
      </div>
    );
  }

  const pricingFilters = [
    { label: "All", value: "all" },
    { label: "Free", value: "free" },
    { label: "Freemium", value: "freemium" },
    { label: "Premium", value: "premium" }
  ];

  const parentGroup = category ? getCategoryGroup(category) : null;

  return (
    <div className="flex-1 mx-auto max-w-7xl w-full px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6 font-sans">
        <Link href="/" className="hover:text-white transition-colors font-sans">Home</Link>
        <span>/</span>
        {parentGroup && (
          <>
            <Link href={`/#group-${parentGroup.id}`} className="hover:text-white transition-colors font-sans capitalize">
              {parentGroup.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-slate-300 capitalize font-sans">{category.name}</span>
      </nav>

      {/* Header Info */}
      <div className="border-b border-slate-800/80 pb-8 mb-8 font-sans">
        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#8FBF3F] mb-2 font-mono">
          Category Directory
        </span>
        <h1 className="font-serif text-3xl font-medium tracking-tight text-white sm:text-4xl">
          {category.name}
        </h1>
        <p className="text-slate-400 text-base mt-3 max-w-2xl leading-relaxed font-sans">
          {category.description}
        </p>
      </div>

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
          <label htmlFor="category-sort-select" className="text-[#8FBF3F] font-bold">
            &gt; sort_by:
          </label>
          <div className="relative">
            <select
              id="category-sort-select"
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
      {tools.length === 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col justify-between rounded-xl border border-[#212623] bg-[#131615]/40 backdrop-blur-md p-5 font-mono min-h-[200px]">
            <div>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-[#212623] bg-[#0D0F0E] text-[#8FBF3F] font-mono font-bold text-xs shadow-inner">
                    &gt;_
                  </div>
                  <div>
                    <h3 className="font-mono text-xs font-bold text-[#8FBF3F] tracking-wider uppercase">
                      &gt; awaiting_index
                    </h3>
                    <span className="font-mono text-[9px] tracking-wider text-slate-500 uppercase">
                      [status: queued_for_crawl]
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-4 font-sans">
                This category is queued for indexing. Check back soon.
              </p>
            </div>
            <div className="pt-3 border-t border-[#212623]/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>crawlers // indexer</span>
              <span className="text-[#8FBF3F]/70 animate-pulse">● active</span>
            </div>
          </div>
        </div>
      ) : sortedAndFilteredTools.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sortedAndFilteredTools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              categoryName={category.name}
              onRefresh={fetchCategoryData}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-[#212623] bg-[#131615]/40 p-8 text-center font-sans">
          <h3 className="text-sm font-bold text-white mb-1">No tools match filter</h3>
          <p className="text-slate-400 text-xs max-w-xs mx-auto mb-4 font-sans">
            No tools in this category match the active pricing filter ({activeFilter}).
          </p>
          <button
            onClick={() => setActiveFilter("all")}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-[#8FBF3F] px-4 text-xs font-semibold text-slate-950 hover:bg-[#7ba235] transition-colors cursor-pointer"
          >
            Show All Tools
          </button>
        </div>
      )}
    </div>
  );
}
