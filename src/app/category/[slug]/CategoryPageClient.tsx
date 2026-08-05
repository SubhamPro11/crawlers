"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { mockDb, Category, Tool, getCategoryGroup } from "@/data/mockDb";
import ToolCard from "@/components/ToolCard";
import { TerminalLoader } from "@/components/TerminalLoader";
import { useVimNavigation } from "@/hooks/useVimNavigation";
import { useRouter } from "next/navigation";

interface CategoryPageClientProps {
  slug: string;
  initialCategory?: Category | null;
  initialTools?: Tool[];
}

export default function CategoryPageClient({
  slug,
  initialCategory = null,
  initialTools = [],
}: CategoryPageClientProps) {
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(initialCategory);
  const [tools, setTools] = useState<Tool[]>(initialTools);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "recent">("name");
  const [isLoading, setIsLoading] = useState(!initialCategory);

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

  const handleSelectTool = useCallback((index: number) => {
    const targetTool = sortedAndFilteredTools[index];
    if (targetTool) {
      if (targetTool.url) {
        window.open(targetTool.url, "_blank");
      } else {
        router.push(`/tool/${targetTool.id}`);
      }
    }
  }, [sortedAndFilteredTools, router]);

  const { selectedIndex } = useVimNavigation(sortedAndFilteredTools.length, handleSelectTool);

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
    if (!initialCategory) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchCategoryData();
    } else {
      // Log Recently Viewed Category even on initial server render
      const items = JSON.parse(localStorage.getItem("crawlers_recent_items") || "[]");
      const filtered = items.filter((i: { id: string }) => i.id !== initialCategory.id);
      const updated = [
        { id: initialCategory.id, name: initialCategory.name, type: "category", slugOrUrl: initialCategory.slug, timestamp: Date.now() },
        ...filtered
      ].slice(0, 10);
      localStorage.setItem("crawlers_recent_items", JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("recent-items-updated"));
    }
  }, [initialCategory, fetchCategoryData]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <TerminalLoader message="fetching_category_index" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 text-center font-mono">
        <div className="inline-block rounded-xl border border-[#212623] bg-[#131615] p-8 max-w-md">
          <div className="text-rose-400 text-sm font-bold mb-2">404 // CATEGORY_NOT_FOUND</div>
          <p className="text-slate-400 text-xs mb-6">
            The category slug <code className="text-[#8FBF3F]">{slug}</code> does not exist in our index.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-[#8FBF3F] px-4 py-2 text-xs font-bold text-slate-950 hover:bg-[#7ba235] transition-colors"
          >
            &larr; Return to Index
          </Link>
        </div>
      </div>
    );
  }

  const group = getCategoryGroup(category);

  return (
    <main role="main" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 font-sans">
      {/* Breadcrumb Header */}
      <div className="mb-6 flex flex-wrap items-center gap-2 font-mono text-xs text-[#8A8F87]">
        <Link href="/" className="hover:text-white transition-colors">
          index
        </Link>
        <span>/</span>
        <Link href={`/#group-${group.id}`} className="hover:text-[#8FBF3F] transition-colors">
          {group.name.toLowerCase()}
        </Link>
        <span>/</span>
        <span className="text-white font-bold">{category.name.toLowerCase()}</span>
      </div>

      {/* Category Main Header */}
      <div className="mb-8 border-b border-[#212623] pb-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl font-mono text-[#8FBF3F]">&gt;_</span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
                {category.name}
              </h1>
            </div>
            {category.description && (
              <p className="text-sm text-slate-400 max-w-2xl font-sans mt-2">
                {category.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 font-mono text-xs text-slate-400 bg-[#131615] border border-[#212623] px-3.5 py-2 rounded-lg shrink-0">
            <span className="text-[#8FBF3F] font-bold">{tools.length}</span>
            <span>{tools.length === 1 ? 'bot' : 'bots'} in index</span>
          </div>
        </div>
      </div>

      {/* Filter and Sort Bar */}
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0D0F0E] border border-[#212623] p-4 rounded-xl font-mono text-xs">
        {/* Pricing Model Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-500 uppercase font-bold text-[10px] mr-1">pricing:</span>
          {["all", "free", "freemium", "paid"].map((filter) => (
            <button
              type="button"
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

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="sort-by-select" className="text-slate-500 uppercase font-bold text-[10px]">sort:</label>
          <select
            id="sort-by-select"
            name="sort_by"
            aria-label="Sort tools by"
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
          {sortedAndFilteredTools.map((tool, idx) => (
            <ToolCard 
              key={tool.id} 
              tool={tool} 
              categoryName={category.name}
              onRefresh={fetchCategoryData}
              isFocused={selectedIndex === idx}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center border border-[#212623] rounded-xl bg-[#131615] font-mono">
          <div className="text-slate-500 text-xs mb-2">&gt; no_tools_matched_filter</div>
          <p className="text-slate-400 text-sm mb-4">
            No tools in <span className="text-white font-bold">{category.name}</span> match the selected filter <code className="text-[#8FBF3F]">{activeFilter}</code>.
          </p>
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className="rounded-lg bg-[#131615] border border-[#212623] px-4 py-2 text-xs font-bold text-[#8FBF3F] hover:border-[#8FBF3F] transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </main>
  );
}
