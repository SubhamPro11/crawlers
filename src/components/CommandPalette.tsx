"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { mockDb, Category, Tool } from "@/data/mockDb";

interface RecentItem {
  id: string;
  name: string;
  type: "tool" | "category" | "search";
  slugOrUrl: string;
  timestamp: number;
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Toggle open/close on Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => {
          const next = !prev;
          if (next) {
            setSearchQuery("");
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
          }
          return next;
        });
      }
      
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleToggle = () => {
      setIsOpen((prev) => {
        const next = !prev;
        if (next) {
          setSearchQuery("");
          setSelectedIndex(0);
          setTimeout(() => inputRef.current?.focus(), 50);
        }
        return next;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("toggle-command-palette", handleToggle);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("toggle-command-palette", handleToggle);
    };
  }, []);

  // Fetch all categories and tools on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [cats, tls] = await Promise.all([
          mockDb.getCategories(),
          mockDb.getTools()
        ]);
        setCategories(cats);
        setTools(tls);
      } catch (err) {
        console.error("Error loading command palette data:", err);
      }
    };
    loadData();
  }, []);

  // Load localStorage data when opened
  useEffect(() => {
    if (isOpen) {
      const rec = JSON.parse(localStorage.getItem("crawlers_recent_items") || "[]");
      const favs = JSON.parse(localStorage.getItem("crawlers_favorites") || "[]");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRecentItems(rec);
      setFavoriteIds(favs);
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Search filter
  const filteredResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    
    // When no query is entered, show personalized suggestions
    if (!query) {
      // Find full tools for recently viewed and favorites
      const recentTools = recentItems
        .filter((item) => item.type === "tool")
        .map((item) => tools.find((t) => t.id === item.id))
        .filter((t): t is Tool => !!t)
        .slice(0, 3);

      const favoriteTools = favoriteIds
        .map((id) => tools.find((t) => t.id === id))
        .filter((t): t is Tool => !!t)
        .slice(0, 3);

      const recentCategories = recentItems
        .filter((item) => item.type === "category")
        .map((item) => categories.find((c) => c.slug === item.slugOrUrl))
        .filter((c): c is Category => !!c)
        .slice(0, 3);

      return {
        categories: recentCategories.length > 0 ? recentCategories : categories.slice(0, 3),
        tools: recentTools.length > 0 ? recentTools : tools.slice(0, 4),
        favorites: favoriteTools,
        isDefault: true
      };
    }

    const filteredCats = categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(query) ||
        (cat.description && cat.description.toLowerCase().includes(query))
    );

    const filteredTls = tools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(query) ||
        tool.short_description.toLowerCase().includes(query) ||
        tool.tags.some((t) => t.toLowerCase().includes(query))
    );

    return {
      categories: filteredCats.slice(0, 5),
      tools: filteredTls.slice(0, 10),
      favorites: [],
      isDefault: false
    };
  }, [searchQuery, categories, tools, recentItems, favoriteIds]);

  // Flattened results for keyboard navigation index mapping
  const flattenedResults = useMemo(() => {
    const list: Array<{ type: "category" | "tool" | "favorite"; id: string; name: string; slugOrUrl: string }> = [];
    
    filteredResults.categories.forEach((cat) => {
      list.push({ type: "category", id: cat.id, name: cat.name, slugOrUrl: cat.slug });
    });
    
    filteredResults.tools.forEach((tool) => {
      list.push({ type: "tool", id: tool.id, name: tool.name, slugOrUrl: tool.id });
    });

    filteredResults.favorites.forEach((tool) => {
      list.push({ type: "favorite", id: tool.id, name: tool.name, slugOrUrl: tool.id });
    });

    return list;
  }, [filteredResults]);

  const handleSelectResult = (item: { type: "category" | "tool" | "favorite"; slugOrUrl: string }) => {
    setIsOpen(false);
    if (item.type === "category") {
      router.push(`/category/${item.slugOrUrl}`);
    } else {
      router.push(`/tool/${item.slugOrUrl}`);
    }
  };

  // Keyboard navigation inside list
  const handleKeyDownList = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, flattenedResults.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + flattenedResults.length) % Math.max(1, flattenedResults.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flattenedResults[selectedIndex]) {
        handleSelectResult(flattenedResults[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-start justify-center pt-24 px-4">
      <div 
        ref={modalRef}
        className="w-full max-w-lg rounded-xl border border-[#212623] bg-[#0D0F0E] shadow-2xl overflow-hidden font-mono"
      >
        {/* Terminal Header Info */}
        <div className="flex items-center justify-between border-b border-[#212623]/80 bg-[#131615] px-4 py-2 text-[10px] text-[#8A8F87]">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="h-2 w-2 rounded-full bg-red-500/80" />
            <span className="h-2 w-2 rounded-full bg-yellow-500/80" />
            <span className="h-2 w-2 rounded-full bg-green-500/80" />
            <span className="ml-2">crawlers_shell.sh</span>
          </div>
          <div className="font-mono">ESC to close</div>
        </div>

        {/* Input prompt */}
        <div className="flex items-center border-b border-[#212623] px-3 bg-[#0D0F0E]">
          <span className="text-[#8FBF3F] font-mono text-sm shrink-0 select-none mr-2">&gt;_</span>
          <input
            ref={inputRef}
            type="text"
            aria-label="Search command palette"
            placeholder="Search categories, tools, tags..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDownList}
            className="w-full bg-transparent py-3.5 text-[#EDEEEA] placeholder-slate-650 outline-none text-xs font-mono"
          />
        </div>

        {/* Scrollable Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {flattenedResults.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-slate-500">
              No matching commands or tools found.
            </div>
          ) : (
            <div>
              {/* Favorites block (only when empty search) */}
              {filteredResults.isDefault && filteredResults.favorites.length > 0 && (
                <div>
                  <div className="px-4 py-1.5 text-[10px] font-bold text-[#8FBF3F] uppercase tracking-wider select-none bg-[#8FBF3F]/5 flex items-center gap-1.5">
                    <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Bookmarked Tools
                  </div>
                  {filteredResults.favorites.map((tool, idx) => {
                    // Favorites are rendered at the bottom of categories and tools in flattenedResults
                    const flatIdx = filteredResults.categories.length + filteredResults.tools.length + idx;
                    const isSelected = selectedIndex === flatIdx;
                    return (
                      <div
                        key={`fav-${tool.id}`}
                        onClick={() => handleSelectResult({ type: "favorite", slugOrUrl: tool.id })}
                        onMouseEnter={() => setSelectedIndex(flatIdx)}
                        className={`flex items-center justify-between px-4 py-2 text-xs cursor-pointer transition-colors duration-150 ${
                          isSelected 
                            ? "bg-[#8FBF3F]/10 text-[#8FBF3F] border-l-2 border-[#8FBF3F] pl-3.5" 
                            : "text-[#EDEEEA]"
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold">{tool.name}</span>
                          <span className="text-[10px] text-slate-500 truncate max-w-sm">
                            {tool.short_description}
                          </span>
                        </div>
                        <span className="font-mono text-[9px] text-[#8A8F87]/65 uppercase">
                          bookmark
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Categories block */}
              {filteredResults.categories.length > 0 && (
                <div className="mt-1">
                  <div className="px-4 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none bg-[#131615]/20">
                    {filteredResults.isDefault && recentItems.filter(i => i.type === "category").length > 0 ? "Recently Visited Categories" : "Categories"}
                  </div>
                  {filteredResults.categories.map((cat, idx) => {
                    const flatIdx = idx;
                    const isSelected = selectedIndex === flatIdx;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => handleSelectResult({ type: "category", slugOrUrl: cat.slug })}
                        onMouseEnter={() => setSelectedIndex(flatIdx)}
                        className={`flex items-center justify-between px-4 py-2 text-xs cursor-pointer transition-colors duration-150 ${
                          isSelected 
                            ? "bg-[#8FBF3F]/10 text-[#8FBF3F] border-l-2 border-[#8FBF3F] pl-3.5" 
                            : "text-[#EDEEEA]"
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold">{cat.name}</span>
                          {cat.description && (
                            <span className="text-[10px] text-slate-500 truncate max-w-sm">
                              {cat.description}
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[9px] text-[#8A8F87]/65 uppercase">
                          category
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tools block */}
              {filteredResults.tools.length > 0 && (
                <div className="mt-2">
                  <div className="px-4 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none bg-[#131615]/20">
                    {filteredResults.isDefault && recentItems.filter(i => i.type === "tool").length > 0 ? "Recently Viewed Tools" : "Tools"}
                  </div>
                  {filteredResults.tools.map((tool, idx) => {
                    const flatIdx = filteredResults.categories.length + idx;
                    const isSelected = selectedIndex === flatIdx;
                    return (
                      <div
                        key={tool.id}
                        onClick={() => handleSelectResult({ type: "tool", slugOrUrl: tool.id })}
                        onMouseEnter={() => setSelectedIndex(flatIdx)}
                        className={`flex items-center justify-between px-4 py-2 text-xs cursor-pointer transition-colors duration-150 ${
                          isSelected 
                            ? "bg-[#8FBF3F]/10 text-[#8FBF3F] border-l-2 border-[#8FBF3F] pl-3.5" 
                            : "text-[#EDEEEA]"
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold">{tool.name}</span>
                          <span className="text-[10px] text-slate-500 truncate max-w-sm">
                            {tool.short_description}
                          </span>
                        </div>
                        <span className="font-mono text-[9px] text-[#8A8F87]/65 uppercase">
                          tool
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
