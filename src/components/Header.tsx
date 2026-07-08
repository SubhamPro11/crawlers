"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Get active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Handle clicks outside of dropdown
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  const handleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("Authentication error:", err.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setDropdownOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error("Sign out error:", err.message);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#212623] bg-[#0D0F0E]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-1.5 font-mono text-sm font-bold tracking-tight text-white group">
            <span className="text-[#8FBF3F] group-hover:translate-x-0.5 transition-transform duration-200">&gt;</span>
            <span>crawlers //</span>
            <span className="h-3 w-1.5 bg-[#8FBF3F] cursor-blink inline-block" />
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/" 
              className="text-xs font-sans font-semibold tracking-wide text-[#8A8F87] hover:text-[#8FBF3F] transition-colors"
            >
              Explore
            </Link>
            <Link 
              href="/search" 
              className="text-xs font-sans font-semibold tracking-wide text-[#8A8F87] hover:text-[#8FBF3F] transition-colors"
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
              placeholder="Query index..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 lg:w-56 rounded-md border border-[#212623] bg-[#131615] py-1.5 pl-3 pr-8 text-xs font-sans text-[#EDEEEA] placeholder-slate-600 outline-none focus:border-[#8FBF3F] focus:ring-1 focus:ring-[#8FBF3F] transition-all"
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

          {/* Authentication Section */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-[#8FBF3F] to-[#7ba235] text-[#0D0F0E] font-bold text-xs shadow-md border border-[#8FBF3F]/35 hover:scale-105 transition-transform"
                title={user.email}
              >
                {user.email?.charAt(0).toUpperCase()}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md border border-[#212623] bg-[#131615] py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="px-4 py-2 border-b border-[#212623]/80 text-[10px] text-slate-500 truncate max-w-full font-mono">
                    {user.email}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full px-4 py-2 text-xs text-left text-slate-300 hover:bg-[#8FBF3F]/10 hover:text-white transition-colors font-sans font-semibold"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#212623] bg-[#131615] px-3 text-xs font-sans font-semibold text-slate-300 hover:text-white hover:border-[#8FBF3F]/60 transition-all duration-200"
            >
              <svg className="h-3.5 w-3.5 text-[#8FBF3F]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-6.887 4.114-4.68 0-8.473-3.882-8.473-8.514 0-4.632 3.793-8.515 8.473-8.515 2.502 0 4.263.957 5.372 2.036l3.12-3.12C18.665.926 15.69 0 12.24 0 5.58 0 0 5.58 0 12.24s5.58 12.24 12.24 12.24c6.96 0 11.52-4.896 11.52-11.724 0-.785-.078-1.547-.22-2.22H12.24z"/>
              </svg>
              <span>Sign In</span>
            </button>
          )}

          {/* Submit Link */}
          <Link
            href="/submit"
            className="inline-flex h-8 items-center justify-center rounded-md bg-[#8FBF3F] px-4 text-xs font-sans font-bold text-[#0D0F0E] hover:bg-[#7ba235] transition-all duration-200"
          >
            Submit Bot
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
              className="w-full rounded-md border border-[#212623] bg-[#131615] py-2 pl-3 pr-8 text-xs font-sans text-[#EDEEEA] placeholder-slate-600 outline-none focus:border-[#8FBF3F] transition-all"
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
