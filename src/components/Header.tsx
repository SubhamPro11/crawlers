"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { mockDb, Category, CATEGORY_GROUPS } from "@/data/mockDb";

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Category Jump Dropdown state
  const [exploreOpen, setExploreOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catFilter, setCatFilter] = useState("");
  const exploreRef = useRef<HTMLDivElement>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Fetch categories for instant jump menu
    mockDb.getCategories().then(cats => setCategories(cats));

    // Get active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      
      // Dispatch toast notifications on state changes
      if (event === "SIGNED_IN" && session) {
        window.dispatchEvent(
          new CustomEvent("toast", {
            detail: { message: `Logged in as ${session.user.email}`, type: "success" }
          })
        );
      } else if (event === "SIGNED_OUT") {
        window.dispatchEvent(
          new CustomEvent("toast", {
            detail: { message: "Signed out successfully", type: "info" }
          })
        );
      }
    });

    // Handle clicks outside of dropdowns
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (exploreRef.current && !exploreRef.current.contains(e.target as Node)) {
        setExploreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredCategories = useMemo(() => {
    if (!catFilter.trim()) return categories;
    const q = catFilter.toLowerCase();
    return categories.filter(c => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q));
  }, [categories, catFilter]);

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
          redirectTo: typeof window !== "undefined" ? window.location.href : undefined,
        },
      });
      if (error) throw error;
    } catch (err) {
      console.error("Authentication error:", (err as Error).message);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setDropdownOpen(false);
      router.refresh();
    } catch (err) {
      console.error("Sign out error:", (err as Error).message);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-[#212623] bg-[#0D0F0E]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-1.5 font-mono text-sm font-bold tracking-tight text-white group">
            <span className="text-[#8FBF3F] group-hover:translate-x-0.5 transition-transform duration-200">&gt;</span>
            <span>crawlers //</span>
            <span className="h-3 w-1.5 bg-[#8FBF3F] cursor-blink inline-block" />
          </Link>
          <nav className="hidden xl:flex items-center gap-6">
            {/* Interactive Category Jump Dropdown */}
            <div className="relative" ref={exploreRef}>
              <button
                type="button"
                onClick={() => setExploreOpen(!exploreOpen)}
                className={`flex items-center gap-1.5 text-xs font-sans font-semibold tracking-wide transition-colors ${
                  exploreOpen ? "text-[#8FBF3F]" : "text-[#8A8F87] hover:text-[#8FBF3F]"
                }`}
              >
                <span>Explore</span>
                <svg 
                  className={`h-3 w-3 text-[#8A8F87] transition-transform duration-200 ${exploreOpen ? "rotate-180 text-[#8FBF3F]" : ""}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {exploreOpen && (
                <div className="absolute left-0 top-full mt-3 w-[440px] rounded-xl border border-[#212623] bg-[#0E100F]/95 backdrop-blur-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#212623]">
                    <span className="font-mono text-[10px] uppercase font-bold text-[#8FBF3F] tracking-wider">
                      &gt; category_jump_index //
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">
                      {categories.length} categories
                    </span>
                  </div>

                  {/* Filter Search Input */}
                  <div className="relative mb-3">
                    <input
                      type="text"
                      placeholder="Type to filter categories..."
                      value={catFilter}
                      onChange={(e) => setCatFilter(e.target.value)}
                      className="w-full rounded-md border border-[#212623] bg-[#131615] px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-[#8FBF3F] font-sans"
                    />
                    {catFilter && (
                      <button
                        type="button"
                        onClick={() => setCatFilter("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs font-sans"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Top Directory Sections */}
                  {!catFilter && (
                    <div className="mb-3">
                      <div className="text-[9px] font-mono uppercase text-slate-500 tracking-wider mb-2">
                        Directory Sections
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <Link
                          href="/category/ai-extensions"
                          onClick={() => setExploreOpen(false)}
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-md border border-[#8FBF3F]/30 bg-[#8FBF3F]/10 text-[#8FBF3F] hover:bg-[#8FBF3F]/20 text-xs font-mono font-bold transition-colors"
                        >
                          <span>AI Extensions</span>
                          <span className="text-[9px] bg-[#8FBF3F] text-slate-950 px-1 rounded font-sans">NEW</span>
                        </Link>
                        {CATEGORY_GROUPS.map((group) => (
                          <button
                            type="button"
                            key={group.id}
                            onClick={() => {
                              setExploreOpen(false);
                              if (typeof window !== "undefined" && window.location.pathname === "/") {
                                const el = document.getElementById(`group-${group.id}`);
                                if (el) {
                                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                                  return;
                                }
                              }
                              router.push(`/#group-${group.id}`);
                            }}
                            className="text-left px-2.5 py-1.5 rounded-md border border-[#212623] bg-[#131615]/60 hover:bg-[#1a1f1d] hover:border-[#8FBF3F]/40 text-[#EDEEEA] hover:text-[#8FBF3F] text-[11px] font-sans transition-colors truncate"
                          >
                            {group.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All Categories Index */}
                  <div className="text-[9px] font-mono uppercase text-slate-500 tracking-wider mb-1.5">
                    {catFilter ? "Matching Categories" : "All Categories Index"}
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {filteredCategories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/category/${cat.slug}`}
                        onClick={() => setExploreOpen(false)}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-[#1a1f1d] text-xs text-slate-300 hover:text-white transition-colors group"
                      >
                        <span className="group-hover:text-[#8FBF3F] font-sans truncate">{cat.name}</span>
                        <span className="font-mono text-[10px] text-slate-600 group-hover:text-slate-400">
                          &gt; {cat.slug}
                        </span>
                      </Link>
                    ))}
                    {filteredCategories.length === 0 && (
                      <div className="text-center py-4 text-xs text-slate-500 font-sans">
                        No category found matching &quot;{catFilter}&quot;
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link 
              href="/category/ai-extensions" 
              className="text-xs font-sans font-semibold tracking-wide text-[#8A8F87] hover:text-[#8FBF3F] transition-colors"
            >
              AI Extensions
            </Link>
            <Link 
              href="/stacks" 
              className="text-xs font-sans font-semibold tracking-wide text-[#8A8F87] hover:text-[#8FBF3F] transition-colors"
            >
              Stacks
            </Link>
            <Link 
              href="/search" 
              className="text-xs font-sans font-semibold tracking-wide text-[#8A8F87] hover:text-[#8FBF3F] transition-colors"
            >
              Search
            </Link>
            <Link 
              href="/compare" 
              className="text-xs font-sans font-semibold tracking-wide text-[#8A8F87] hover:text-[#8FBF3F] transition-colors"
            >
              Compare
            </Link>
          </nav>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Search Input (Desktop xl+) */}
          <div 
            onClick={() => window.dispatchEvent(new CustomEvent("toggle-command-palette"))}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent("toggle-command-palette"));
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Open command palette"
            className="relative hidden xl:block cursor-pointer shrink-0"
          >
            <input
              type="text"
              placeholder="Search index... (Ctrl + K)"
              readOnly
              aria-label="Search index"
              className="w-48 lg:w-56 cursor-pointer rounded-md border border-[#212623] bg-[#131615] py-1.5 pl-3 pr-14 text-xs font-sans text-[#EDEEEA] placeholder-slate-600 outline-none hover:border-[#8FBF3F]/60 transition-all"
            />
            <div className="absolute right-8 top-1.5 pointer-events-none flex items-center gap-0.5 rounded border border-[#212623] bg-[#0D0F0E] px-1.5 py-0.5 text-[9px] font-mono text-slate-500">
              <span>⌘</span><span>K</span>
            </div>
            <div className="absolute right-2.5 top-2.5 text-[#8A8F87]">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Quick Search Icon Button (< xl) */}
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent("toggle-command-palette"))} 
            className="xl:hidden flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-md border border-[#212623] bg-[#131615] text-[#8A8F87] hover:text-[#8FBF3F] hover:border-[#8FBF3F]/60 transition-colors shrink-0"
            aria-label="Search index"
            title="Search index (Ctrl + K)"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Auth section & Submit Link - Always visible at all screen widths */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center justify-center h-8 w-8 rounded-full overflow-hidden bg-gradient-to-br from-[#8FBF3F] to-[#7ba235] text-[#0D0F0E] font-bold text-xs shadow-md border border-[#8FBF3F]/35 hover:scale-105 transition-transform"
                  title={user.email}
                  aria-label="User account dropdown"
                >
                  {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
                    <img 
                      src={user.user_metadata.avatar_url || user.user_metadata.picture} 
                      alt="Profile" 
                      referrerPolicy="no-referrer"
                      width={32}
                      height={32}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    user.email?.charAt(0).toUpperCase()
                  )}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md border border-[#212623] bg-[#131615] py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="px-4 py-2 border-b border-[#212623]/80 text-[10px] text-slate-500 truncate max-w-full font-mono">
                      {user.email}
                    </div>
                    <Link
                      href="/my/collections"
                      onClick={() => setDropdownOpen(false)}
                      className="flex w-full px-4 py-2 text-xs text-slate-300 hover:bg-[#8FBF3F]/10 hover:text-white transition-colors font-sans font-semibold border-b border-[#212623]/50"
                    >
                      My Collections
                    </Link>
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
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#212623] bg-[#131615] px-2.5 sm:px-3 text-xs font-sans font-semibold text-slate-300 hover:text-white hover:border-[#8FBF3F]/60 transition-all duration-200 shrink-0"
              >
                <svg className="h-3.5 w-3.5 text-[#8FBF3F]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-6.887 4.114-4.68 0-8.473-3.882-8.473-8.514 0-4.632 3.793-8.515 8.473-8.515 2.502 0 4.263.957 5.372 2.036l3.12-3.12C18.665.926 15.69 0 12.24 0 5.58 0 0 5.58 0 12.24s5.58 12.24 12.24 12.24c6.96 0 11.52-4.896 11.52-11.724 0-.785-.078-1.547-.22-2.22H12.24z"/>
                </svg>
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            <Link
              href="/submit"
              className="inline-flex h-8 items-center justify-center rounded-md bg-[#8FBF3F] px-2.5 sm:px-3.5 text-xs font-sans font-bold text-[#0D0F0E] hover:bg-[#7ba235] active:bg-[#6c9130] transition-colors duration-[100ms] shrink-0 whitespace-nowrap"
            >
              Submit Bot
            </Link>
          </div>

          {/* Hamburger Menu Toggle (< xl) */}
          <button
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              setSearchOpen(false);
            }}
            className="xl:hidden flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 text-[#8A8F87] hover:text-[#8FBF3F] transition-colors shrink-0"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
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

      {/* Mobile Menu Dropdown Overlay */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-[#212623] bg-[#0D0F0E] px-4 py-4 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Mobile Navigation Links */}
          <div className="flex flex-col space-y-2 font-mono text-xs">
            <Link 
              href="/" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center h-11 px-3 text-[#EDEEEA] hover:text-[#8FBF3F] hover:border-[#8FBF3F]/40 transition-colors border border-[#212623] bg-[#131615] rounded-lg"
            >
              &gt; explore_directory
            </Link>
            <Link 
              href="/category/ai-extensions" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center h-11 px-3 text-[#EDEEEA] hover:text-[#8FBF3F] hover:border-[#8FBF3F]/40 transition-colors border border-[#212623] bg-[#131615] rounded-lg"
            >
              &gt; ai_extensions
            </Link>
            <Link 
              href="/stacks" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center h-11 px-3 text-[#EDEEEA] hover:text-[#8FBF3F] hover:border-[#8FBF3F]/40 transition-colors border border-[#212623] bg-[#131615] rounded-lg"
            >
              &gt; workflow_stacks
            </Link>
            <Link 
              href="/search" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center h-11 px-3 text-[#EDEEEA] hover:text-[#8FBF3F] hover:border-[#8FBF3F]/40 transition-colors border border-[#212623] bg-[#131615] rounded-lg"
            >
              &gt; search_index
            </Link>
            <Link 
              href="/compare" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center h-11 px-3 text-[#EDEEEA] hover:text-[#8FBF3F] hover:border-[#8FBF3F]/40 transition-colors border border-[#212623] bg-[#131615] rounded-lg"
            >
              &gt; compare_tools
            </Link>
          </div>

          {/* Mobile Auth & Submit */}
          <div className="pt-3 border-t border-[#212623]/60 flex flex-col space-y-3">
            {user ? (
              <div className="flex flex-col space-y-2">
                <div className="px-3 py-1 flex items-center gap-2 font-mono text-[10px] text-slate-500">
                  {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
                    <img 
                      src={user.user_metadata.avatar_url || user.user_metadata.picture} 
                      alt="Profile" 
                      referrerPolicy="no-referrer"
                      width={20}
                      height={20}
                      loading="lazy"
                      decoding="async"
                      className="h-5 w-5 rounded-full object-cover border border-[#8FBF3F]/30"
                    />
                  ) : (
                    <div className="h-5 w-5 rounded-full bg-gradient-to-br from-[#8FBF3F] to-[#7ba235] text-[#0D0F0E] font-bold flex items-center justify-center text-[9px]">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="truncate max-w-[180px]">{user.email}</span>
                </div>
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center h-11 w-full rounded-md border border-[#212623] bg-[#131615] px-4 text-xs font-sans font-semibold text-red-400 hover:text-red-300 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  handleSignIn();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center h-11 w-full gap-2 rounded-md border border-[#212623] bg-[#131615] px-4 text-xs font-sans font-semibold text-slate-300 hover:text-white transition-all"
              >
                <svg className="h-4 w-4 text-[#8FBF3F]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-6.887 4.114-4.68 0-8.473-3.882-8.473-8.514 0-4.632 3.793-8.515 8.473-8.515 2.502 0 4.263.957 5.372 2.036l3.12-3.12C18.665.926 15.69 0 12.24 0 5.58 0 0 5.58 0 12.24s5.58 12.24 12.24 12.24c6.96 0 11.52-4.896 11.52-11.724 0-.785-.078-1.547-.22-2.22H12.24z"/>
                </svg>
                <span>Sign In with Google</span>
              </button>
            )}

            <Link
              href="/submit"
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-11 items-center justify-center rounded-md bg-[#8FBF3F] px-4 text-xs font-sans font-bold text-[#0D0F0E] hover:bg-[#7ba235] active:bg-[#6c9130] transition-colors duration-[100ms]"
            >
              Submit Bot
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
