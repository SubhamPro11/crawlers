"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { mockDb, Tool } from "@/data/mockDb";
import ToolCard from "@/components/ToolCard";
import { useVimNavigation } from "@/hooks/useVimNavigation";

interface SearchClientProps {
  initialQuery?: string;
  initialResults?: Tool[];
}

export default function SearchClient({
  initialQuery = "",
  initialResults = [],
}: SearchClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryFromUrl = searchParams.get("q") || initialQuery || "";
  
  const [searchInput, setSearchInput] = useState(queryFromUrl);
  const [results, setResults] = useState<Tool[]>(initialResults);

  const handleSelectTool = useCallback((index: number) => {
    const targetTool = results[index];
    if (targetTool) {
      if (targetTool.url) {
        window.open(targetTool.url, "_blank");
      } else {
        router.push(`/tool/${targetTool.id}`);
      }
    }
  }, [results, router]);

  const { selectedIndex } = useVimNavigation(results.length, handleSelectTool);

  const performSearch = useCallback(async (q: string) => {
    const searchResults = await mockDb.searchTools(q);
    setResults(searchResults);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchInput(queryFromUrl);
    if (!initialResults.length || queryFromUrl !== initialQuery) {
      performSearch(queryFromUrl);
    }
  }, [queryFromUrl, initialQuery, initialResults.length, performSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
  };

  const refreshSearch = async () => {
    performSearch(queryFromUrl);
  };

  return (
    <main role="main" className="mx-auto max-w-7xl w-full px-4 py-12 sm:px-6 lg:px-8 font-sans">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6 font-sans">
        <Link href="/" className="hover:text-white transition-colors font-sans">Home</Link>
        <span>/</span>
        <span className="text-slate-300 font-sans">Search Results</span>
      </nav>

      {/* Header */}
      <div className="border-b border-slate-800/80 pb-6 mb-8 font-sans">
        <h1 className="font-serif text-3xl font-medium tracking-tight text-white">
          {queryFromUrl ? `Search Results for "${queryFromUrl}"` : "Search Directory"}
        </h1>
        <p className="text-slate-400 text-sm mt-2 font-sans">
          Discover tools by typing what you need to do
        </p>
      </div>

      {/* Search Input Box */}
      <div className="mb-10 max-w-xl font-sans">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center rounded-xl bg-[#131615] border border-[#212623] p-2 focus-within:border-[#8FBF3F] transition-all">
          <input
            id="search-page-query-input"
            name="q"
            type="text"
            aria-label="Search directory by task"
            placeholder="Type your use case..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-transparent px-4 py-3 text-base text-white placeholder-slate-500 outline-none font-sans"
          />
          <button
            type="submit"
            className="shrink-0 flex items-center justify-center h-11 rounded-lg bg-[#8FBF3F] hover:bg-[#7ba235] text-slate-950 font-bold px-6 text-sm transition-colors duration-200 font-sans"
          >
            Find
          </button>
        </form>
      </div>

      {/* Results Grid */}
      {results.length > 0 ? (
        <div>
          <div className="mb-6 flex items-center justify-between text-xs text-slate-500 font-semibold font-sans">
            <span>Found {results.length} matching tools</span>
            <span className="hidden sm:inline font-mono text-[11px] text-slate-600">
              Press J/K to navigate, Enter to open
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 font-sans">
            {results.map((tool, idx) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                categoryName={tool.categories?.name}
                onRefresh={refreshSearch}
                isFocused={selectedIndex === idx}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-[#212623] bg-[#131615] p-12 text-center font-sans">
          <svg className="mx-auto h-12 w-12 text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-base font-bold text-white mb-1">
            {queryFromUrl ? `No tools found for "${queryFromUrl}"` : "Search our AI tools directory"}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
            Try searching by specific task (e.g., &quot;video editor&quot;, &quot;code completion&quot;, &quot;transcript&quot;).
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-[#8FBF3F] px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-[#7ba235] transition-colors"
          >
            &larr; Back to Category Index
          </Link>
        </div>
      )}
    </main>
  );
}
