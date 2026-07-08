"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#1E293B] bg-[#0B0F17]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#10B981] to-[#06B6D4] text-white font-bold text-lg shadow-lg shadow-[#10B981]/20">
              ⚡
            </div>
            <span className="text-xl font-bold tracking-tight text-white bg-clip-text">
              Crawlers
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/" 
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Explore
            </Link>
            <Link 
              href="/search" 
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Search
            </Link>
          </nav>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          {/* Quick Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 lg:w-64 rounded-full border border-slate-800 bg-[#131B2E] py-1.5 pl-4 pr-10 text-xs text-white placeholder-slate-400 outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all"
            />
            <button
              type="submit"
              className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          {/* Search Toggle Mobile */}
          <button 
            onClick={() => setSearchOpen(!searchOpen)} 
            className="sm:hidden text-slate-300 hover:text-white p-1"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Submit Link */}
          <Link
            href="/submit"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-[#10B981] px-4 text-xs font-semibold text-slate-950 hover:bg-[#059669] transition-all duration-200 shadow-md shadow-[#10B981]/10"
          >
            Submit Bot
          </Link>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {searchOpen && (
        <div className="sm:hidden border-t border-slate-800 bg-[#0B0F17] px-4 py-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="What do you want to do?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-[#131B2E] py-2 pl-4 pr-10 text-sm text-white placeholder-slate-400 outline-none focus:border-[#10B981] transition-all"
              autoFocus
            />
            <button
              type="submit"
              className="absolute right-3 top-3 text-slate-400"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
