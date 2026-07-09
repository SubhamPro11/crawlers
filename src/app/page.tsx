"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mockDb, Category, Tool } from "@/data/mockDb";
import ToolCard from "@/components/ToolCard";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentTools, setRecentTools] = useState<Tool[]>([]);
  const [toolCounts, setToolCounts] = useState<Record<string, number>>({});
  const router = useRouter();

  const [selectedLetter, setSelectedLetter] = useState<string>("All");
  const [categorySearchQuery, setCategorySearchQuery] = useState<string>("");

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const lettersWithCategories = useMemo(() => {
    const letters = new Set<string>();
    categories.forEach(cat => {
      const firstChar = cat.name.charAt(0).toUpperCase();
      if (/[A-Z]/.test(firstChar)) {
        letters.add(firstChar);
      }
    });
    return Array.from(letters).sort();
  }, [categories]);

  const filteredCategories = useMemo(() => {
    return categories.filter(cat => {
      const matchesSearch = cat.name.toLowerCase().includes(categorySearchQuery.toLowerCase()) ||
                            (cat.description && cat.description.toLowerCase().includes(categorySearchQuery.toLowerCase()));
      
      const firstChar = cat.name.charAt(0).toUpperCase();
      const matchesLetter = selectedLetter === "All" || firstChar === selectedLetter;
      
      return matchesSearch && matchesLetter;
    });
  }, [categories, selectedLetter, categorySearchQuery]);

  useEffect(() => {
    const loadData = async () => {
      const [allTools, dbCategories] = await Promise.all([
        mockDb.getTools(),
        mockDb.getCategories()
      ]);
      
      setCategories(dbCategories);

      // Calculate counts in memory
      const counts: Record<string, number> = {};
      allTools.forEach(tool => {
        counts[tool.category_id] = (counts[tool.category_id] || 0) + 1;
      });
      setToolCounts(counts);

      const sorted = [...allTools]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 6);
      setRecentTools(sorted);
    };
    loadData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const refreshRecent = async () => {
    const allTools = await mockDb.getTools();
    const sorted = [...allTools]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 6);
    setRecentTools(sorted);
  };

  // Get icon for categories
  const getCategoryIcon = (slug: string) => {
    const baseClass = "h-6 w-6 text-[#10B981] group-hover:text-white transition-colors duration-300";
    switch (slug) {
      case "image-generation":
        return (
          <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case "text-extraction-ocr":
        return (
          <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4a2 2 0 002-2v-4a2 2 0 00-2-2h-4v8zM4 8h4a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2V10a2 2 0 012-2z" />
          </svg>
        );
      case "text-summarization":
        return (
          <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        );
      case "chatbots-conversational-ai":
        return (
          <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case "video-generation-editing":
        return (
          <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case "audio-voice-music":
        return (
          <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        );
      case "code-generation-dev-tools":
        return (
          <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        );
      case "writing-copywriting":
        return (
          <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        );
      case "data-analysis":
        return (
          <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case "productivity-automation":
        return (
          <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "research-search":
        return (
          <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case "translation":
        return (
          <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5c-1.043 2.56-2.547 4.9-4.43 6.868M9.078 12.012A11.21 11.21 0 013 9.488" />
          </svg>
        );
      case "design-ui-tools":
        return (
          <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-3" />
          </svg>
        );
      default:
        return (
          <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
    }
  };

  return (
    <div className="flex flex-col flex-1">
      {/* Hero Section */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8 text-center overflow-hidden border-b border-[#1E293B] bg-gradient-to-b from-[#0e1627] to-[#0B0F17]">
        {/* Subtle decorative glow */}
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-[#10B981]/5 blur-3xl" />

        <div className="relative mx-auto max-w-3xl">
          <h1 className="font-serif text-4xl font-normal tracking-tight text-white sm:text-5xl lg:text-6xl mb-6">
            Find the exact <span className="italic text-[#10B981]">AI tool</span> for the job
          </h1>
          
          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
            A curated index of AI tools categorized by what they do, rather than by brand. Search by task to find the right tool instantly.
          </p>

          {/* Large Use-case Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mx-auto max-w-2xl relative">
            <div className="relative flex items-center rounded-xl bg-[#131B2E] border border-slate-800 p-2 focus-within:border-[#10B981] focus-within:ring-1 focus-within:ring-[#10B981] shadow-xl shadow-black/30 transition-all duration-300">
              <div className="pl-3 text-slate-500">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="What do you want to do? (e.g., generate an image, summarize a video, write python code)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent px-4 py-3 text-base text-white placeholder-slate-500 outline-none font-sans"
              />
              <button
                type="submit"
                className="rounded-lg bg-[#10B981] hover:bg-[#059669] text-slate-950 font-bold px-6 py-3 transition-colors duration-200 font-sans"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Featured / Trending Section */}
      {recentTools.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8 font-sans">
            <div>
              <h2 className="font-serif text-xl font-medium tracking-tight text-white sm:text-2xl">
                Recently Indexed
              </h2>
              <p className="text-slate-400 text-xs mt-1 font-sans">
                Latest verified additions to the directory
              </p>
            </div>
            <div className="h-[1px] flex-1 bg-slate-800/80 mx-6 hidden sm:block" />
            <Link 
              href="/search" 
              className="text-[#10B981] hover:text-[#059669] text-sm font-semibold transition-colors"
            >
              Browse All Tools &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recentTools.map((tool) => (
              <ToolCard 
                key={tool.id} 
                tool={tool} 
                categoryName={categories.find(c => c.id === tool.category_id)?.name}
                onRefresh={refreshRecent}
              />
            ))}
          </div>
        </section>
      )}

      {/* Category Indexing Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t border-slate-900">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 font-sans">
          <div>
            <h2 className="font-serif text-2xl font-medium tracking-tight text-white sm:text-3xl">
              Browse Directory Index
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Filter by letter or search to discover use-case collections
            </p>
          </div>
          
          {/* Category Quick Filter */}
          <div className="relative max-w-xs w-full">
            <input
              type="text"
              placeholder="Search 143 categories..."
              value={categorySearchQuery}
              onChange={(e) => {
                setCategorySearchQuery(e.target.value);
                setSelectedLetter("All"); // Reset letter filter when searching
              }}
              className="w-full rounded-lg border border-slate-800 bg-[#0B0F17] pl-10 pr-8 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-[#10B981] transition-all font-sans"
            />
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {categorySearchQuery && (
              <button
                onClick={() => setCategorySearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs font-sans"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Alphabet Navigation Bar */}
        <div className="flex flex-wrap gap-1 items-center mb-8 border-b border-slate-900 pb-6 font-mono text-[10px]">
          <button
            onClick={() => { setSelectedLetter("All"); setCategorySearchQuery(""); }}
            className={`px-3 py-1.5 rounded-lg font-sans font-bold transition-all ${
              selectedLetter === "All"
                ? "bg-[#10B981] text-slate-950"
                : "bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            All Categories
          </button>
          <div className="h-4 w-[1px] bg-slate-800 mx-2 hidden sm:block" />
          {alphabet.map((letter) => {
            const hasCategories = lettersWithCategories.includes(letter);
            return (
              <button
                key={letter}
                disabled={!hasCategories}
                onClick={() => { setSelectedLetter(letter); setCategorySearchQuery(""); }}
                className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all font-bold ${
                  selectedLetter === letter
                    ? "bg-[#10B981] text-slate-950"
                    : hasCategories
                    ? "bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-[#10B981] hover:border-[#10B981]/40"
                    : "bg-slate-950/20 text-slate-700 cursor-not-allowed border border-slate-900/40"
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>

        {/* Active Filters Display */}
        {(selectedLetter !== "All" || categorySearchQuery) && (
          <div className="flex items-center justify-between text-xs text-slate-400 mb-6 font-mono bg-slate-900/30 border border-slate-900 px-4 py-2.5 rounded-lg">
            <div>
              Active Index filter: <span className="text-[#10B981] font-sans font-bold">{selectedLetter !== "All" ? `Letter "${selectedLetter}"` : `Search "${categorySearchQuery}"`}</span>
              <span className="text-slate-600 mx-2">|</span>
              Found {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'}
            </div>
            <button
              onClick={() => { setSelectedLetter("All"); setCategorySearchQuery(""); }}
              className="text-xs text-rose-400 hover:text-rose-300 font-sans font-semibold transition-colors"
            >
              Clear filter
            </button>
          </div>
        )}

        {/* Categories Grid */}
        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCategories.map((cat) => {
              const count = toolCounts[cat.id] || 0;
              return (
                <Link 
                  key={cat.id} 
                  href={`/category/${cat.slug}`}
                  className="group relative flex flex-col justify-between rounded-xl border border-slate-800 bg-[#131B2E]/50 p-6 hover:bg-[#131B2E] hover:border-slate-700 transition-all duration-300"
                >
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-800/85 mb-4 group-hover:bg-[#10B981]/10 border border-slate-800 transition-all duration-300">
                      {getCategoryIcon(cat.slug)}
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-[#10B981] transition-colors duration-300 line-clamp-1">
                      {cat.name}
                    </h3>
                    <p className="text-slate-400 text-xs mt-2 leading-normal line-clamp-2">
                      {cat.description || "Browse curated tools for this domain."}
                    </p>
                  </div>
                  <div className="mt-5 flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>{count} {count === 1 ? 'tool' : 'tools'} available</span>
                    <span className="text-[#10B981] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Explore &rarr;
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#131B2E]/20 border border-slate-900 rounded-2xl font-sans">
            <svg className="mx-auto h-10 w-10 text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <h3 className="text-sm font-semibold text-white">No categories found</h3>
            <p className="text-xs text-slate-500 mt-1">Try clearing your filters or typing a different search query</p>
            <button
              onClick={() => { setSelectedLetter("All"); setCategorySearchQuery(""); }}
              className="mt-4 rounded-lg bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-white transition-colors duration-200"
            >
              Reset Search Filter
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
