"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { mockDb, Category, Tool, getCategoryGroup } from "@/data/mockDb";
import ToolCard from "@/components/ToolCard";
import { TerminalLoader } from "@/components/TerminalLoader";

export default function CategoryPageClient() {
  const [slug] = useState(() => {
    if (typeof window !== "undefined") {
      return window.location.pathname.split("/").pop() || "";
    }
    return "";
  });
  const [category, setCategory] = useState<Category | null>(null);
  const [tools, setTools] = useState<Tool[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "recent">("name");
  const [isLoading, setIsLoading] = useState(true);

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
    { label: "Paid", value: "paid" }
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
          <div className="flex flex-wrap gap-2">
            {pricingFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`rounded-full px-4 py-2.5 text-xs font-bold transition-colors duration-[100ms] font-sans cursor-pointer ${
                  activeFilter === filter.value
                    ? "bg-[#8FBF3F] text-slate-950 active:bg-[#7ba235]"
                    : "bg-[#131615] text-slate-400 border border-[#212623] hover:text-white hover:border-[#8FBF3F]/30 active:bg-[#0c0d0c] active:border-[#8FBF3F]/50"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 font-mono">
          <span>SORT BY:</span>
          <button
            onClick={() => setSortBy("name")}
            className={`transition-colors duration-[100ms] active:text-[#7ba235] cursor-pointer ${sortBy === "name" ? "text-[#8FBF3F]" : "hover:text-white"}`}
          >
            A-Z
          </button>
          <span>|</span>
          <button
            onClick={() => setSortBy("recent")}
            className={`transition-colors duration-[100ms] active:text-[#7ba235] cursor-pointer ${sortBy === "recent" ? "text-[#8FBF3F]" : "hover:text-white"}`}
          >
            NEWEST
          </button>
        </div>
      </div>

      {/* Tools Grid */}
      {sortedAndFilteredTools.length > 0 ? (
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
        <div className="rounded-xl border border-dashed border-[#212623] bg-[#131615]/20 p-12 text-center font-sans">
          <h3 className="text-base font-bold text-white mb-2">No tools found</h3>
          <p className="text-slate-400 text-xs max-w-xs mx-auto mb-6">
            There are no tools listed under this category matching the active filter.
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
