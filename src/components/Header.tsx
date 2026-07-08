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
    <header className="sticky top-0 z-50 w-full border-b border-[#212623] bg-[#0D0F0E]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-1.5 font-mono text-sm font-bold tracking-tight text-[#EDEEEA] group">
            <span className="text-[#8FBF3F] group-hover:translate-x-0.5 transition-transform duration-200">&gt;</span>
            <span className="text-white">crawlers //</span>
            <span className="h-3 w-1.5 bg-[#8FBF3F] cursor-blink inline-block" />
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/" 
              className="text-xs font-mono font-medium text-[#8A8F87] hover:text-[#8FBF3F] transition-colors"
            >
              /explore
            </Link>
            <Link 
              href="/search" 
              className="text-xs font-mono font-medium text-[#8A8F87] hover:text-[#8FBF3F] transition-colors"
            >
              /search
            </Link>
          </nav>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          {/* Quick Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
            <input
              type="text"
              placeholder="Query index..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 lg:w-56 rounded-md border border-[#212623] bg-[#131615] py-1.5 pl-3 pr-8 text-xs font-mono text-[#EDEEEA] placeholder-slate-600 outline-none focus:border-[#8FBF3F] focus:ring-1 focus:ring-[#8FBF3F] transition-all"
            />
            <button
              type="submit"
              className="absolute right-2.5 top-2 text-[#8A8F87] hover:text-[#8FBF3F]"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          {/* Search Toggle Mobile */}
          <button 
            onClick={() => setSearchOpen(!searchOpen)} 
            className="sm:hidden text-[#8A8F87] hover:text-[#8FBF3F] p-1"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Submit Link */}
          <Link
            href="/submit"
            className="inline-flex h-8 items-center justify-center rounded-md bg-[#8FBF3F] px-4 text-xs font-mono font-bold text-[#0D0F0E] hover:bg-[#7ba235] transition-all duration-200"
          >
            submit_bot
          </Link>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {searchOpen && (
        <div className="sm:hidden border-t border-[#212623] bg-[#0D0F0E] px-4 py-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Query index..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-[#212623] bg-[#131615] py-2 pl-3 pr-8 text-xs font-mono text-[#EDEEEA] placeholder-slate-600 outline-none focus:border-[#8FBF3F] transition-all"
              autoFocus
            />
            <button
              type="submit"
              className="absolute right-3 top-2.5 text-[#8A8F87]"
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
