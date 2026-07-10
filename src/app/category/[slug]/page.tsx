"use client";

import { use, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { mockDb, Category, Tool, getCategoryGroup } from "@/data/mockDb";
import ToolCard from "@/components/ToolCard";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function CategoryPage({ params }: PageProps) {
  const { slug } = use(params);
  const [category, setCategory] = useState<Category | null>(null);
  const [tools, setTools] = useState<Tool[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "recent">("name");
  const [isLoading, setIsLoading] = useState(true);

  // Filter and sort tools based on active pricing model and sorting mode
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

  useEffect(() => {
    let active = true;
    const fetchCategoryData = async () => {
      const cat = await mockDb.getCategoryBySlug(slug);
      if (cat && active) {
        setCategory(cat);
        const categoryTools = await mockDb.getToolsByCategory(cat.id);
        if (active) {
          setTools(categoryTools);
          setIsLoading(false);
        }
      } else if (active) {
        setIsLoading(false);
      }
    };
    fetchCategoryData();
    return () => {
      active = false;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-[#8FBF3F]" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex-1 mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Category Not Found</h1>
        <p className="text-slate-450 mb-8">The category you are looking for does not exist in our directory.</p>
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
                className={`rounded-full px-4 py-2.5 text-xs font-bold transition-all duration-200 font-sans ${
                  activeFilter === filter.value
                    ? "bg-[#8FBF3F] text-slate-950 shadow-md shadow-[#8FBF3F]/15"
                    : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider font-mono">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "name" | "recent")}
              className="rounded-lg bg-slate-900 border border-slate-800 text-slate-300 px-3 py-2 text-xs font-bold outline-none focus:border-[#8FBF3F] transition-all font-sans cursor-pointer"
            >
              <option value="name">Name (A-Z)</option>
              <option value="recent">Recently Indexed</option>
            </select>
          </div>
        </div>

        <span className="text-xs text-slate-500 font-medium font-sans">
          Showing {sortedAndFilteredTools.length} of {tools.length} platforms
        </span>
      </div>

      {/* Cards Grid */}
      {sortedAndFilteredTools.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sortedAndFilteredTools.map((tool) => (
              <ToolCard 
                key={tool.id} 
                tool={tool} 
                onRefresh={fetchCategoryData}
              />
            ))}
          </div>
          {sortedAndFilteredTools.length < 3 && (
            <div className="mt-12 rounded-xl border border-dashed border-[#212623] bg-[#131615]/20 p-8 text-center font-sans">
              <p className="text-slate-400 text-xs mb-3">
                Know a tool that belongs in {category.name}?
              </p>
              <Link
                href="/submit"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-[#8FBF3F] px-5 text-xs font-bold text-slate-950 hover:bg-[#7ba235] transition-colors"
              >
                Submit Entry &rarr;
              </Link>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-800 bg-[#131B2E]/20 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-base font-bold text-white mb-2">No tools found</h3>
          <p className="text-slate-400 text-xs max-w-xs mx-auto mb-6">
            There are currently no {activeFilter !== "all" ? `${activeFilter} ` : ""}tools indexed in this category.
          </p>
          <Link
            href="/submit"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[#8FBF3F] px-4 text-xs font-semibold text-slate-950 hover:bg-[#7ba235] transition-colors"
          >
            Submit Bot
          </Link>
        </div>
      )}
    </div>
  );
}
