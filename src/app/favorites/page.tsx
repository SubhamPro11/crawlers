"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { mockDb, Tool, Category } from "@/data/mockDb";
import ToolCard from "@/components/ToolCard";

export default function FavoritesPage() {
  const [favoriteTools, setFavoriteTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFavorites = async () => {
    try {
      const [allTools, allCats] = await Promise.all([
        mockDb.getTools(),
        mockDb.getCategories()
      ]);
      setCategories(allCats);

      const favIds: string[] = JSON.parse(localStorage.getItem("crawlers_favorites") || "[]");
      const matched = allTools.filter((t) => favIds.includes(t.id));
      setFavoriteTools(matched);
    } catch (err) {
      console.error("Error loading favorites:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadFavorites();

    const handleUpdate = () => {
      loadFavorites();
    };
    window.addEventListener("favorites-updated", handleUpdate);
    return () => window.removeEventListener("favorites-updated", handleUpdate);
  }, []);

  return (
    <div className="flex-1 mx-auto max-w-7xl w-full px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6 font-sans">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <span className="text-[#8FBF3F] font-mono">[bookmarks]</span>
      </nav>

      {/* Header */}
      <div className="border-b border-slate-800/80 pb-6 mb-8 font-sans">
        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#8FBF3F] mb-2 font-mono">
          &gt; run_bookmarks //
        </span>
        <h1 className="font-serif text-3xl font-medium tracking-tight text-white sm:text-4xl">
          Bookmarked AI Tools
        </h1>
        <p className="text-slate-400 text-sm mt-2 font-sans">
          Access your handpicked collection of AI bots offline via local index storage.
        </p>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border border-[#212623] bg-[#131615]/30 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded bg-slate-800" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-850 rounded w-2/3" />
                  <div className="h-3 bg-slate-850 rounded w-1/3" />
                </div>
              </div>
              <div className="h-16 bg-slate-850 rounded w-full" />
              <div className="h-4 bg-slate-850 rounded w-1/4 pt-2" />
            </div>
          ))}
        </div>
      ) : favoriteTools.length > 0 ? (
        <div>
          <div className="mb-6 text-xs text-slate-500 font-semibold font-mono">
            Found {favoriteTools.length} bookmark{favoriteTools.length !== 1 ? "s" : ""} on local node
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favoriteTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                categoryName={categories.find((c) => c.id === tool.category_id)?.name}
                onRefresh={loadFavorites}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Premium Empty State */
        <div className="rounded-xl border border-dashed border-[#212623] bg-[#131615]/10 p-16 text-center max-w-xl mx-auto mt-8">
          <svg className="mx-auto h-12 w-12 text-slate-650 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h3 className="font-serif text-lg font-medium text-white mb-2">No bookmarks loaded</h3>
          <p className="text-slate-400 text-xs mb-8 leading-relaxed max-w-sm mx-auto font-sans">
            Bookmark AI tools by clicking the heart button on any tool card while exploring the directory.
          </p>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[#8FBF3F] hover:bg-[#7ba235] px-6 text-xs font-mono font-bold text-slate-950 transition-colors"
          >
            discover_bots //
          </Link>
        </div>
      )}
    </div>
  );
}
