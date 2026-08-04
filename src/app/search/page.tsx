"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { mockDb, Tool } from "@/data/mockDb";
import ToolCard from "@/components/ToolCard";
import { TerminalLoader } from "@/components/TerminalLoader";
import { useVimNavigation } from "@/hooks/useVimNavigation";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  
  const [searchInput, setSearchInput] = useState(query);
  const [results, setResults] = useState<Tool[]>([]);

  const handleSelectTool = (index: number) => {
    const targetTool = results[index];
    if (targetTool) {
      if (targetTool.url) {
        window.open(targetTool.url, "_blank");
      } else {
        router.push(`/tool/${targetTool.id}`);
      }
    }
  };

  const { selectedIndex } = useVimNavigation(results.length, handleSelectTool);

  useEffect(() => {
    let active = true;
    mockDb.searchTools(query).then((searchResults) => {
      if (active) {
        setSearchInput(query);
        setResults(searchResults);
      }
    });
    return () => {
      active = false;
    };
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
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
        <form onSubmit={handleSearchSubmit} className="relative flex items-center rounded-xl bg-[#131615] border border-[#212623] p-2 focus-within:border-[#8FBF3F] transition-all">
          <input
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
            <span className="hidden sm:inline-block font-mono text-[10px] text-[#8FBF3F] bg-[#8FBF3F]/10 border border-[#8FBF3F]/20 px-2 py-0.5 rounded">
              [j / k navigation active — press Enter to open]
            </span>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((tool, index) => (
              <ToolCard 
                key={tool.id} 
                tool={tool} 
                categoryName={tool.categories?.name}
                onRefresh={refreshSearch}
                isFocused={index === selectedIndex}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[#212623] bg-[#131615]/20 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-base font-bold text-white mb-2">No matching tools</h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto mb-6">
            We couldn&apos;t find any tools matching your query. Try searching for broader terms like &quot;image&quot;, &quot;code&quot;, or &quot;summarize&quot;.
          </p>
          <Link
            href="/submit"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[#8FBF3F] px-4 text-xs font-semibold text-slate-950 hover:bg-[#7ba235] transition-colors"
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
    <Suspense fallback={<TerminalLoader message="querying_index" />}>
      <SearchContent />
    </Suspense>
  );
}
