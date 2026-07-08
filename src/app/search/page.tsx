"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { mockDb, Tool, CATEGORIES } from "@/data/mockDb";
import ToolCard from "@/components/ToolCard";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  
  const [searchInput, setSearchInput] = useState(query);
  const [results, setResults] = useState<Tool[]>([]);

  useEffect(() => {
    setSearchInput(query);
    const performSearch = async () => {
      const searchResults = await mockDb.searchTools(query);
      setResults(searchResults);
    };
    performSearch();
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
  };

  const getCategoryName = (catId: string) => {
    return CATEGORIES.find(c => c.id === catId)?.name || "";
  };

  const refreshSearch = async () => {
    const searchResults = await mockDb.searchTools(query);
    setResults(searchResults);
  };

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6 font-sans">
        <Link href="/" className="hover:text-white transition-colors font-sans">Home</Link>
        <span>/</span>
        <span className="text-slate-300 font-sans">Search Results</span>
      </nav>

      {/* Header */}
      <div className="border-b border-slate-800/80 pb-6 mb-8 font-sans">
        <h1 className="font-serif text-3xl font-medium tracking-tight text-white">
          {query ? `Search Results for "${query}"` : "Search Directory"}
        </h1>
        <p className="text-slate-400 text-sm mt-2 font-sans">
          Discover tools by typing what you need to do
        </p>
      </div>

      {/* Search Input Box */}
      <div className="mb-10 max-w-xl font-sans">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center rounded-xl bg-[#131B2E] border border-slate-800 p-1.5 focus-within:border-[#10B981] transition-all">
          <input
            type="text"
            placeholder="Type your use case..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-transparent px-4 py-2 text-sm text-white placeholder-slate-500 outline-none font-sans"
          />
          <button
            type="submit"
            className="rounded-lg bg-[#10B981] hover:bg-[#059669] text-slate-950 font-bold px-4 py-2 text-xs transition-colors duration-200 font-sans"
          >
            Find
          </button>
        </form>
      </div>

      {/* Results Grid */}
      {results.length > 0 ? (
        <div>
          <div className="mb-6 text-xs text-slate-500 font-semibold font-sans">
            Found {results.length} matching tools
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((tool) => (
              <ToolCard 
                key={tool.id} 
                tool={tool} 
                categoryName={getCategoryName(tool.category_id)}
                onRefresh={refreshSearch}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-800 bg-[#131B2E]/20 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-base font-bold text-white mb-2">No matching tools</h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto mb-6">
            We couldn't find any tools matching your query. Try searching for broader terms like "image", "code", or "summarize".
          </p>
          <Link
            href="/submit"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-[#10B981] px-4 text-xs font-semibold text-slate-950 hover:bg-[#059669] transition-colors"
          >
            Submit a New Bot
          </Link>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-[#10B981]" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
