"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mockDb, Category, Tool, CATEGORY_GROUPS, getCategoryGroup } from "@/data/mockDb";
import ToolCard, { cleanDescription } from "@/components/ToolCard";
import { WhyCrawlers, AINews } from "@/components/HomepageExtensions";
import {
  Sparkles, Code, Search, Image as ImageIcon, AudioLines, FileText, Bot, 
  Workflow, Database, Languages, Settings, Layout, Apple, Scale, 
  Sprout, GraduationCap, Gamepad2, Landmark, Heart, 
  MessageSquare, UserCheck, PenTool, Cloud, Cpu, Compass, 
  Globe, Film, BookOpen, Eye, Music, Smile, HelpCircle, 
  Users, Activity, Laptop, Scissors, Mic, 
  TrendingUp, Mail, Calendar, Briefcase, FileSearch, Book, StickyNote,
  Clapperboard, Wand2, Captions, Tv, Volume2, Waves, Podcast, Mic2,
  Paintbrush, Eraser, Shapes, User, PieChart, Palette, Shirt, Glasses,
  Box, Printer, Laugh, Layers, Timer, ListTodo, HeartHandshake, UserPlus,
  UserSearch, Calculator, FileSignature, Send, Table, GitFork, Ticket,
  Presentation, Terminal, BugPlay, Blocks, Smartphone, Bug, Coins, Wifi,
  Wrench, EyeOff, Fingerprint, Copy, Tag, Folder, Brain, ShieldAlert,
  Megaphone, DollarSign, Magnet, Share2, Award, ShoppingBag, MapPin,
  FolderOpen, LifeBuoy, Gauge, Leaf, Dumbbell, Hammer, Factory,
  Home as HomeIcon, ShieldCheck, Building, Stethoscope, HeartPulse, Pill, Dna,
  Recycle, CloudLightning, CloudSun, Rocket, Truck, Package, Zap, GitBranch,
  Type, Inbox, BarChart3, Notebook, Library, PawPrint, Utensils, Command, Plug, Network, Lock, Trophy, Puzzle
} from "lucide-react";

const SUB_GROUPS: Record<string, Array<{ name: string; slugs: string[] }>> = {
  "education-lifestyle": [
    {
      name: "Education & Career",
      slugs: ["academia", "learning-tools", "language-learning", "reading", "accessibility", "job-tools"]
    },
    {
      name: "Lifestyle, Health & Recreation",
      slugs: ["parenting", "dating", "wellness", "fitness", "sports-analytics", "pets", "travel", "food", "gaming", "nutrition", "mental-health", "others"]
    }
  ],
  "productivity-business": [
    {
      name: "Productivity & Workflow",
      slugs: ["productivity", "project-management", "calendar-scheduling", "meeting-assistants", "email-assistants", "spreadsheets", "mind-mapping", "automation", "workflow-automation", "diagramming", "presentation", "knowledge-management"]
    },
    {
      name: "Business, Finance & Operations",
      slugs: ["crm", "hr", "recruiting", "compliance", "tax-accounting", "contract-management", "business-tools", "events", "nonprofit", "finance", "fintech"]
    }
  ]
};

interface CategoryGroupSectionProps {
  group: { id: string; name: string };
  groupCategories: Category[];
  sortedGroupCategories: Category[];
  toolCounts: Record<string, number>;
  getCategoryIcon: (slug: string) => React.ReactNode;
}

function CategoryGroupSection({
  group,
  groupCategories,
  sortedGroupCategories,
  toolCounts,
  getCategoryIcon
}: CategoryGroupSectionProps) {
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || isVisible) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.05 });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [isVisible]);

  return (
    <div
      ref={containerRef}
      id={`group-${group.id}`}
      className={`scroll-mt-28 transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex items-center justify-between mb-6 border-b border-slate-800/80 pb-3 font-sans">
        <div className="flex items-center gap-3">
          <h2 className="font-serif text-lg font-medium text-white sm:text-xl">
            {group.name}
          </h2>
          <span className="rounded-full bg-slate-900/80 border border-slate-800 px-2.5 py-0.5 text-xs text-slate-400 font-mono font-bold">
            {groupCategories.length}
          </span>
        </div>
      </div>
      {SUB_GROUPS[group.id] ? (
        <div className="space-y-8">
          {SUB_GROUPS[group.id].map((subGroup) => {
            const subGroupCats = sortedGroupCategories.filter(cat => subGroup.slugs.includes(cat.slug));
            if (subGroupCats.length === 0) return null;
            return (
              <div key={subGroup.name} className="space-y-4">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <span>&gt;</span>
                  <span>{subGroup.name.toLowerCase().replace(/ & /g, "_and_").replace(/, /g, "_").replace(/ /g, "_")} // {subGroupCats.length} categories</span>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {subGroupCats.map((cat) => {
                    const count = toolCounts[cat.id] || 0;
                    const isZero = count === 0;
                    return (
                      <Link
                        key={cat.id}
                        href={`/category/${cat.slug}`}
                        className={`group relative flex flex-col justify-between rounded-lg border border-[#212623] bg-[#131615]/50 p-5 sm:p-6 hover:bg-[#131615] hover:border-[#8FBF3F]/40 transition-colors duration-[120ms] ${
                          isZero ? "opacity-50 hover:opacity-85" : ""
                        }`}
                      >
                        <div>
                          <div className="flex h-12 w-12 items-center justify-center rounded border border-[#212623] bg-[#0D0F0E] mb-4 group-hover:bg-[#8FBF3F]/10 transition-all duration-300">
                            {getCategoryIcon(cat.slug)}
                          </div>
                          <h3 className="text-base font-bold text-white group-hover:text-[#8FBF3F] transition-colors duration-300 line-clamp-1 font-serif">
                            {cat.name}
                          </h3>
                          <p className="text-slate-400 text-xs mt-2 leading-normal line-clamp-2 font-sans">
                            {cat.description || "Browse curated tools for this domain."}
                          </p>
                        </div>
                        <div className="mt-5 flex items-center justify-between text-xs font-medium font-sans">
                          <span className={isZero ? "text-slate-500/70" : "text-slate-500"}>
                            {isZero ? "Coming soon" : `${count} ${count === 1 ? 'tool' : 'tools'} available`}
                          </span>
                          {!isZero && (
                            <span className="text-[#8FBF3F] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              Explore &rarr;
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedGroupCategories.map((cat) => {
            const count = toolCounts[cat.id] || 0;
            const isZero = count === 0;
            return (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className={`group relative flex flex-col justify-between rounded-lg border border-[#212623] bg-[#131615]/50 p-5 sm:p-6 hover:bg-[#131615] hover:border-[#8FBF3F]/40 transition-colors duration-[120ms] ${
                  isZero ? "opacity-50 hover:opacity-85" : ""
                }`}
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded border border-[#212623] bg-[#0D0F0E] mb-4 group-hover:bg-[#8FBF3F]/10 transition-all duration-300">
                    {getCategoryIcon(cat.slug)}
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-[#8FBF3F] transition-colors duration-300 line-clamp-1 font-serif">
                    {cat.name}
                  </h3>
                  <p className="text-slate-400 text-xs mt-2 leading-normal line-clamp-2 font-sans">
                    {cat.description || "Browse curated tools for this domain."}
                  </p>
                </div>
                <div className="mt-5 flex items-center justify-between text-xs font-medium font-sans">
                  <span className={isZero ? "text-slate-500/70" : "text-slate-500"}>
                    {isZero ? "Coming soon" : `${count} ${count === 1 ? 'tool' : 'tools'} available`}
                  </span>
                  {!isZero && (
                    <span className="text-[#8FBF3F] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Explore &rarr;
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentTools, setRecentTools] = useState<Tool[]>([]);
  const [toolCounts, setToolCounts] = useState<Record<string, number>>({});
  
  const [favoriteTools, setFavoriteTools] = useState<Tool[]>([]);
  const [recentToolsList, setRecentToolsList] = useState<Tool[]>([]);
  const [trendingTools, setTrendingTools] = useState<Tool[]>([]);
  const [totalToolsCount, setTotalToolsCount] = useState<number>(0);
  const [lastUpdatedStr, setLastUpdatedStr] = useState<string>("today");

  const [tools, setTools] = useState<Tool[]>([]);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [popularQueries, setPopularQueries] = useState<string[]>([]);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchFormRef = useRef<HTMLFormElement>(null);

  // Hero headline typing animation state
  const textPart1 = "Find the exact ";
  const textPart2 = "AI tool";
  const textPart3 = " by use case";
  const totalLength = textPart1.length + textPart2.length + textPart3.length;
  
  const [visibleChars, setVisibleChars] = useState(totalLength);
  const [isTypingComplete, setIsTypingComplete] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setPrefersReducedMotion(prefersReduced);
    setVisibleChars(totalLength);
    setIsTypingComplete(true);
  }, [totalLength]);

  const renderTypedHeading = () => {
    if (isTypingComplete) {
      return (
        <>
          Find the exact <span className="italic text-[#8FBF3F]">AI tool</span> by use case
          {!prefersReducedMotion && (
            <span className="text-[#8FBF3F] terminal-cursor select-none ml-1">▍</span>
          )}
        </>
      );
    }

    // Still typing
    if (visibleChars <= textPart1.length) {
      return (
        <>
          {textPart1.substring(0, visibleChars)}
          <span className="text-[#8FBF3F] select-none">▍</span>
        </>
      );
    } else if (visibleChars <= textPart1.length + textPart2.length) {
      return (
        <>
          {textPart1}
          <span className="italic text-[#8FBF3F]">{textPart2.substring(0, visibleChars - textPart1.length)}</span>
          <span className="text-[#8FBF3F] select-none">▍</span>
        </>
      );
    } else {
      return (
        <>
          {textPart1}
          <span className="italic text-[#8FBF3F]">{textPart2}</span>
          {textPart3.substring(0, visibleChars - textPart1.length - textPart2.length)}
          <span className="text-[#8FBF3F] select-none">▍</span>
        </>
      );
    }
  };

  const updateLastUpdatedDate = useCallback((toolsList: Tool[]) => {
    if (!toolsList || toolsList.length === 0) return;
    const dates = toolsList
      .map(t => t.created_at ? new Date(t.created_at).getTime() : 0)
      .filter(t => !isNaN(t) && t > 0);
    if (dates.length > 0) {
      const maxTime = Math.max(...dates);
      const maxDate = new Date(maxTime);
      const diffDays = Math.floor((Date.now() - maxTime) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) {
        setLastUpdatedStr("today");
      } else if (diffDays === 1) {
        setLastUpdatedStr("yesterday");
      } else if (diffDays < 7) {
        setLastUpdatedStr(`${diffDays} days ago`);
      } else {
        setLastUpdatedStr(maxDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }));
      }
    }
  }, []);
  
  const router = useRouter();

  const [isMobile, setIsMobile] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<string>("All");
  const [categorySearchQuery, setCategorySearchQuery] = useState<string>("");

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredCategories = useMemo(() => {
    return categories.filter(cat => {
      const matchesSearch = cat.name.toLowerCase().includes(categorySearchQuery.toLowerCase()) ||
                            (cat.description && cat.description.toLowerCase().includes(categorySearchQuery.toLowerCase()));
      
      const firstChar = cat.name.charAt(0).toUpperCase();
      const matchesLetter = selectedLetter === "All" || firstChar === selectedLetter;
      
      return matchesSearch && matchesLetter;
    });
  }, [categories, selectedLetter, categorySearchQuery]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (el) {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setShowLeftFade(scrollLeft > 2);
      setShowRightFade(scrollLeft < scrollWidth - clientWidth - 2);
    }
  }, []);

  const handleScroll = () => {
    checkScroll();
  };

  const handleScrollClick = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (el) {
      const scrollAmount = 240;
      el.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    checkScroll();
    const timer = setTimeout(checkScroll, 100);
    window.addEventListener("resize", checkScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, filteredCategories]);

  // Load from local storage cache instantly on mount
  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        const cachedTools = localStorage.getItem("crawlers_cached_tools");
        const cachedCats = localStorage.getItem("crawlers_cached_categories");
        if (cachedTools && cachedCats) {
          const tools = JSON.parse(cachedTools) as Tool[];
          const cats = JSON.parse(cachedCats) as Category[];
          
          setTools(tools);
          setCategories(cats);
          setTotalToolsCount(tools.length);
          updateLastUpdatedDate(tools);

          const counts: Record<string, number> = {};
          tools.forEach(tool => {
            counts[tool.category_id] = (counts[tool.category_id] || 0) + 1;
          });
          setToolCounts(counts);

          const sorted = [...tools]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 6);
          setRecentTools(sorted);

          // TODO: reinstate real view-count sort once analytics tracking is wired up
          const trending = [...tools]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 8);
          setTrendingTools(trending);

          const favIds: string[] = JSON.parse(localStorage.getItem("crawlers_favorites") || "[]");
          const recItems: Array<{ id: string; type: string }> = JSON.parse(localStorage.getItem("crawlers_recent_items") || "[]");

          const favTools = tools.filter(t => favIds.includes(t.id));
          setFavoriteTools(favTools);

          const recentIds = recItems.filter(i => i.type === "tool").map(i => i.id);
          const recTools = recentIds
            .map(id => tools.find(t => t.id === id))
            .filter((t): t is Tool => !!t);
          setRecentToolsList(recTools);
        }
      } catch (e) {
        console.error("Error reading tools cache on mount:", e);
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, [updateLastUpdatedDate]);

  const loadData = useCallback(async () => {
    const [allTools, dbCategories, queries] = await Promise.all([
      mockDb.getTools(),
      mockDb.getCategories(),
      mockDb.getPopularQueries()
    ]);
    
    setTools(allTools);
    setCategories(dbCategories);
    setPopularQueries(queries);
    setTotalToolsCount(allTools.length);
    updateLastUpdatedDate(allTools);

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

    // TODO: reinstate real view-count sort once analytics tracking is wired up
    const trending = [...allTools]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 8);
    setTrendingTools(trending);

    // Load favorites and recently viewed from localStorage
    const favIds: string[] = JSON.parse(localStorage.getItem("crawlers_favorites") || "[]");
    const recItems: Array<{ id: string; type: string }> = JSON.parse(localStorage.getItem("crawlers_recent_items") || "[]");

    const favTools = allTools.filter(t => favIds.includes(t.id));
    setFavoriteTools(favTools);

    const recentIds = recItems.filter(i => i.type === "tool").map(i => i.id);
    const recTools = recentIds
      .map(id => allTools.find(t => t.id === id))
      .filter((t): t is Tool => !!t);
    setRecentToolsList(recTools);

    // Save to cache for instant load next time
    try {
      localStorage.setItem("crawlers_cached_tools", JSON.stringify(allTools));
      localStorage.setItem("crawlers_cached_categories", JSON.stringify(dbCategories));
    } catch (e) {
      console.error("Error saving tools cache:", e);
    }
  }, [updateLastUpdatedDate]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
    
    const handleFavoritesUpdate = () => {
      loadData();
    };
    window.addEventListener("favorites-updated", handleFavoritesUpdate);
    return () => window.removeEventListener("favorites-updated", handleFavoritesUpdate);
  }, [loadData]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const refreshRecent = async () => {
    loadData();
  };

  // Focus homepage search on Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsDropdownOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside to close suggestion dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchFormRef.current && !searchFormRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 150);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Autocomplete matching logic
  const suggestions = useMemo(() => {
    const query = debouncedQuery.trim().toLowerCase();
    if (!query) return [];

    interface SuggestionItem {
      id: string;
      name: string;
      type: "tool" | "category";
      slugOrUrl: string;
      description?: string;
      score: number;
    }

    const list: SuggestionItem[] = [];

    // 1. Categories matches
    categories.forEach(cat => {
      const name = cat.name.toLowerCase();
      const desc = cat.description?.toLowerCase() || "";
      if (name.startsWith(query)) {
        list.push({ id: cat.id, name: cat.name, type: "category", slugOrUrl: cat.slug, description: cat.description, score: 1 });
      } else if (name.includes(query)) {
        list.push({ id: cat.id, name: cat.name, type: "category", slugOrUrl: cat.slug, description: cat.description, score: 2 });
      } else if (desc.includes(query)) {
        list.push({ id: cat.id, name: cat.name, type: "category", slugOrUrl: cat.slug, description: cat.description, score: 3 });
      }
    });

    // 2. Tools matches
    tools.forEach(tool => {
      const name = tool.name.toLowerCase();
      const desc = tool.short_description.toLowerCase();
      const matchesTag = tool.tags?.some(t => t.toLowerCase().includes(query)) || false;

      if (name.startsWith(query)) {
        list.push({ id: tool.id, name: tool.name, type: "tool", slugOrUrl: tool.id, description: tool.short_description, score: 1 });
      } else if (name.includes(query)) {
        list.push({ id: tool.id, name: tool.name, type: "tool", slugOrUrl: tool.id, description: tool.short_description, score: 2 });
      } else if (desc.includes(query) || matchesTag) {
        list.push({ id: tool.id, name: tool.name, type: "tool", slugOrUrl: tool.id, description: tool.short_description, score: 3 });
      }
    });

    // Sort by relevance (prefix matches first, then substring, then description)
    list.sort((a, b) => {
      if (a.score !== b.score) return a.score - b.score;
      return a.name.localeCompare(b.name);
    });

    return list.slice(0, 5);
  }, [debouncedQuery, categories, tools]);

  // Explicit mapping of category slugs to unique, hand-picked Lucide icons
  const CATEGORY_ICON_MAP: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
    // Text & Writing
    "writing-assistants": PenTool,
    "copywriting": Type,
    "storytelling": BookOpen,
    "transcription": Mic,
    "translator": Languages,
    "localization": Globe,
    "resume-tools": Briefcase,
    "document-ai": FileSearch,
    "documentation": Book,
    "note-taking-apps": StickyNote,
    "newsletters": Mail,
    "ai-newsletters": Inbox,

    // Audio, Video & Media
    "video": Film,
    "video-editor": Scissors,
    "video-generator": Clapperboard,
    "video-enhancer": Wand2,
    "video-subtitling": Captions,
    "talking-avatar-generator": Tv,
    "animation": Sparkles,
    "music-generation": Music,
    "audio": Volume2,
    "voice-cloning": Waves,
    "podcast": Podcast,
    "dubbing": Mic2,
    "text-to-speech": AudioLines,

    // Design & 3D Creative
    "image-generation": ImageIcon,
    "image-editing": Paintbrush,
    "background-remover": Eraser,
    "logo-generator": Shapes,
    "character-design": User,
    "infographics": PieChart,
    "graphic-design": Palette,
    "fashion": Shirt,
    "architecture": Compass,
    "ar-vr": Glasses,
    "3d": Box,
    "3d-printing": Printer,
    "meme-generator": Laugh,
    "creative-media": Layers,

    // Productivity & Business
    "productivity": Timer,
    "project-management": ListTodo,
    "calendar-scheduling": Calendar,
    "meeting-assistants": Users,
    "crm": HeartHandshake,
    "hr": UserPlus,
    "recruiting": UserSearch,
    "compliance": Scale,
    "tax-accounting": Calculator,
    "contract-management": FileSignature,
    "business-tools": Briefcase,
    "email-assistants": Send,
    "spreadsheets": Table,
    "mind-mapping": Network,
    "automation": Zap,
    "workflow-automation": Workflow,
    "diagramming": GitFork,
    "events": Ticket,
    "nonprofit": Heart,
    "presentation": Presentation,
    "finance": Landmark,
    "fintech": Coins,
    "knowledge-management": FolderOpen,

    // Developer & Tech Tools
    "developer-tools": Terminal,
    "devtools": Command,
    "code-assistant": Code,
    "software-testing": BugPlay,
    "no-code": Blocks,
    "app-builders": Smartphone,
    "website-builders": Laptop,
    "cloud-management": Cloud,
    "debugging": Bug,
    "web3": Coins,
    "robotics": Cpu,
    "iot": Wifi,
    "prompt-tools": Wrench,
    "api-tools": Plug,
    "ai-extensions": Puzzle,
    "extensions-chatgpt": Puzzle,

    // Data, Models & Security
    "database-tools": Database,
    "observability": Activity,
    "cybersecurity": Lock,
    "privacy": EyeOff,
    "identity": Fingerprint,
    "synthetic-data": Copy,
    "data-labeling": Tag,
    "data": Folder,
    "models": GitBranch,
    "leaderboards-benchmarks": Trophy,
    "computer-vision": Eye,
    "content-moderation": ShieldAlert,

    // Marketing, Sales & SEO
    "marketing": Megaphone,
    "sales-tools": DollarSign,
    "lead-generation": Magnet,
    "seo": TrendingUp,
    "social-media-tools": Share2,
    "ad-generator": Award,
    "e-commerce": ShoppingBag,
    "market-research": BarChart3,

    // Search, Chat & AI Agents
    "search-research": Search,
    "search-engines": Globe,
    "local-search-engines": MapPin,
    "ai-directories": FolderOpen,
    "chatbot-builders": Settings,
    "chatbots": MessageSquare,
    "ai-agents": Bot,
    "personal-assistants": UserCheck,
    "ai-companion": Smile,
    "customer-support": LifeBuoy,
    "general-reasoning": Brain,
    "sentiment-analysis": Gauge,
    "research-tools": Notebook,

    // Education & Lifestyle
    "academia": GraduationCap,
    "learning-tools": Library,
    "language-learning": Languages,
    "reading": BookOpen,
    "parenting": Users,
    "dating": Heart,
    "wellness": Leaf,
    "fitness": Dumbbell,
    "sports-analytics": Activity,
    "pets": PawPrint,
    "travel": Compass,
    "others": HelpCircle,
    "accessibility": UserCheck,
    "food": Apple,
    "gaming": Gamepad2,
    "job-tools": Briefcase,
    "nutrition": Utensils,
    "mental-health": Brain,

    // Science, Health & Industry
    "farming": Sprout,
    "construction": Hammer,
    "manufacturing": Factory,
    "real-estate": HomeIcon,
    "home-design": Layout,
    "insurance": ShieldCheck,
    "government": Building,
    "healthcare": Stethoscope,
    "telemedicine": HeartPulse,
    "medical-imaging": Heart,
    "drug-discovery": Pill,
    "biotech": Dna,
    "cleantech": Recycle,
    "energy": Zap,
    "climate": CloudLightning,
    "weather": CloudSun,
    "space-tech": Rocket,
    "legal-assistants": Scale,
    "patent-tools": FileText,
    "fleet-management": Truck,
    "supply-chain": Package,
    "geospatial": Globe
  };

  // Get icon for categories
  const getCategoryIcon = (slug: string) => {
    const s = (slug || "").toLowerCase();
    const baseClass = "h-6 w-6 text-[#8FBF3F] group-hover:text-white transition-colors duration-300";

    const IconComponent = CATEGORY_ICON_MAP[s] || HelpCircle;
    return <IconComponent className={baseClass} strokeWidth={2} />;
  };

  return (
    <div className="flex flex-col flex-1">
      {/* Hero Section */}
      <section className="relative px-4 py-12 sm:py-20 sm:px-6 lg:px-8 text-center overflow-hidden border-b border-[#1E293B] bg-gradient-to-b from-[#0e1627] to-[#0B0F17]">
        {/* Subtle decorative glow */}
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-[#8FBF3F]/5 blur-3xl" />

        <div className="relative mx-auto max-w-3xl">
          <h1 className="font-serif text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-white mb-4 sm:mb-6 min-h-[1.2em]">
            {renderTypedHeading()}
          </h1>
          
          <div className={`transition-opacity duration-[200ms] ${
            isTypingComplete ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}>
            <p className="text-slate-400 text-xs sm:text-base lg:text-lg max-w-2xl mx-auto mb-6 sm:mb-10 leading-relaxed font-sans px-2">
              A curated AI tools directory of platforms and bots categorized by what they do. Search by use case or task to find the exact tool for your workflow.
            </p>

            {/* Large Use-case Search Bar */}
            <form ref={searchFormRef} onSubmit={handleSearchSubmit} className="mx-auto max-w-2xl relative">
              <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center rounded-xl bg-[#131615] border border-[#212623] p-2 focus-within:border-[#8FBF3F] focus-within:ring-1 focus-within:ring-[#8FBF3F] shadow-xl shadow-black/30 transition-all duration-300 gap-2 sm:gap-0">
                <div className="flex items-center flex-1 w-full">
                  <div className="pl-3 text-slate-500 shrink-0">
                    <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    ref={searchInputRef}
                    type="text"
                    aria-label="Search directory by task"
                    placeholder={isMobile ? "Search by task..." : "What do you want to do? (e.g., generate an image, summarize a video, write python code)"}
                    value={searchQuery}
                    onFocus={() => setIsDropdownOpen(true)}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    className="w-full bg-transparent px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white placeholder-slate-500 outline-none font-sans"
                  />

                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        searchInputRef.current?.focus();
                      }}
                      className="p-2 text-slate-500 hover:text-white transition-colors cursor-pointer mr-1 sm:mr-2 shrink-0"
                      aria-label="Clear search"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}

                  {!searchQuery && (
                    <span className="hidden sm:inline-block rounded border border-[#212623] bg-[#0D0F0E] px-1.5 py-0.5 text-[9px] text-slate-500 font-mono select-none mr-3 shrink-0">
                      Ctrl K
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto shrink-0 rounded-lg bg-[#8FBF3F] hover:bg-[#7ba235] active:bg-[#6c9130] text-slate-950 font-bold px-6 py-2.5 sm:py-3 text-sm sm:text-base transition-colors duration-[100ms] font-sans"
                >
                  Search
                </button>
              </div>

              {/* Suggestions Dropdown */}
              {isDropdownOpen && searchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 z-20 mt-2 rounded-xl border border-[#212623] bg-[#0D0F0E] shadow-2xl overflow-hidden font-mono text-left max-h-[60vh] overflow-y-auto">
                  {searchQuery.trim() !== debouncedQuery.trim() ? (
                    <div className="px-4 py-4 text-xs text-slate-500 font-mono flex items-center gap-1">
                      <span>querying_index</span>
                      <span className="terminal-dots text-[#8FBF3F]"></span>
                    </div>
                  ) : suggestions.length === 0 ? (
                    <div className="px-4 py-4 text-xs text-slate-500 flex flex-col gap-1.5">
                      <span>No matches found.</span>
                      <button
                        type="submit"
                        className="text-[#8FBF3F] hover:text-[#7ba235] text-[10px] text-left underline font-mono cursor-pointer"
                      >
                        Press Enter to search the full index &gt;_
                      </button>
                    </div>
                  ) : (
                    <div className="py-2 bg-[#0E100F]">
                      {suggestions.map((item, index) => {
                        const isTool = item.type === "tool";
                        return (
                          <div
                            key={`${item.type}-${item.id}`}
                            onClick={() => {
                              if (item.type === "category") {
                                router.push(`/category/${item.slugOrUrl}`);
                              } else {
                                router.push(`/tool/${item.slugOrUrl}`);
                              }
                            }}
                            className="suggestion-row flex items-center justify-between mx-2 my-1 px-3 py-2 text-xs text-[#EDEEEA] border border-transparent hover:border-[#8FBF3F]/35 hover:bg-[#8FBF3F]/5 rounded-lg cursor-pointer transition-colors duration-[100ms] group"
                            style={{ animationDelay: `${index * 20}ms` }}
                          >
                            <div className="flex items-center gap-2 truncate">
                              {isTool ? (
                                <span className="shrink-0 text-slate-500 group-hover:text-[#8FBF3F]">🤖</span>
                              ) : (
                                <span className="shrink-0 text-slate-500 group-hover:text-[#8FBF3F]">&gt;</span>
                              )}
                              <span className="font-semibold truncate">{item.name}</span>
                              {item.description && (
                                <span className="text-[10px] text-slate-500 truncate max-w-[200px] sm:max-w-xs group-hover:text-[#8A8F87]">
                                  — {item.description}
                                </span>
                              )}
                            </div>
                            <span className="shrink-0 rounded bg-[#131615] border border-[#212623] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#8A8F87] group-hover:border-[#8FBF3F]/30 group-hover:text-[#8FBF3F] font-mono">
                              {item.type}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </form>

            {/* Quick Filter Chips */}
            {popularQueries.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-5 font-mono text-[10px] text-[#8A8F87] px-2">
                <span className="text-[9px] uppercase font-bold text-slate-500 mr-1">popular:</span>
                {popularQueries.map((queryText, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSearchQuery(queryText);
                      setIsDropdownOpen(false);
                      router.push(`/search?q=${encodeURIComponent(queryText)}`);
                    }}
                    className="rounded-lg bg-[#131615] border border-[#212623] hover:border-[#8FBF3F]/35 hover:text-[#8FBF3F] active:bg-[#0e100f] active:border-[#8FBF3F]/50 px-2.5 py-1 transition-colors duration-[100ms] cursor-pointer"
                  >
                    {queryText}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Personalized Welcome, Continue Exploring & Favorite Tools */}
      {(recentToolsList.length > 0 || favoriteTools.length > 0) && (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 border-b border-slate-900">
          <div className="mb-6 font-sans">
            <h2 className="font-serif text-2xl font-medium text-white tracking-tight">
              Welcome back
            </h2>
            <p className="text-slate-500 text-xs mt-1 font-mono">
              &gt; personalized_explorer_panel
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recently Viewed */}
            {recentToolsList.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-[#8FBF3F]" />
                  continue_exploring (recently viewed)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recentToolsList.slice(0, 4).map((tool) => (
                    <ToolCard
                      key={`recent-${tool.id}`}
                      tool={tool}
                      categoryName={categories.find(c => c.id === tool.category_id)?.name}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {/* Favorite Tools */}
            {favoriteTools.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8FBF3F] fill-current" />
                  bookmarked_tools (favorites)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {favoriteTools.slice(0, 4).map((tool) => (
                    <ToolCard
                      key={`fav-home-${tool.id}`}
                      tool={tool}
                      categoryName={categories.find(c => c.id === tool.category_id)?.name}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      )}

      {/* Trending Carousel Section */}
      {trendingTools.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 border-b border-slate-900">
          <div className="mb-6 font-sans">
            <h2 className="font-serif text-xl font-medium tracking-tight text-white sm:text-2xl">
              Recently Verified
            </h2>
            <p className="text-[#8FBF3F] text-xs mt-1 font-mono">
              &gt; sorted_by_verification_date
            </p>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory scroll-smooth">
            {trendingTools.map((tool) => (
              <div 
                key={`trending-${tool.id}`} 
                className="snap-start flex-shrink-0 w-80 rounded-xl border border-[#212623] bg-gradient-to-br from-[#131615] to-[#0A0D0B] p-6 shadow-lg hover:border-[#8FBF3F]/35 hover:shadow-2xl hover:shadow-[#8FBF3F]/5 transition-all duration-300 group"
              >
                <div className="flex justify-between items-start gap-2 mb-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-[#212623] bg-[#0D0F0E] text-[#8FBF3F] font-mono font-bold text-xs">
                    {tool.name.substring(0, 2).toLowerCase()}
                  </div>
                </div>
                <Link href={`/tool/${tool.id}`} className="block mb-2">
                  <h4 className="font-serif text-base font-semibold text-white group-hover:text-[#8FBF3F] transition-colors leading-tight line-clamp-1">
                    {tool.name}
                  </h4>
                </Link>
                <p className="text-slate-400 text-xs leading-relaxed mb-4 line-clamp-2 h-8">
                  {cleanDescription(tool.short_description)}
                </p>
                <div className="flex items-center justify-between border-t border-[#212623]/60 pt-3 text-[10px] font-mono">
                  <span className="text-[#8A8F87] uppercase tracking-wider truncate max-w-[150px]">
                    {categories.find(c => c.id === tool.category_id)?.name || "bot"}
                  </span>
                  {(() => {
                    const catName = categories.find(c => c.id === tool.category_id)?.name;
                    const isExtension = catName?.toLowerCase().includes("extension") ||
                      tool.category_id === "fe1ee758-4faf-4b9f-873a-bb95a5939552" ||
                      tool.tags?.some(t => t.toLowerCase().includes("extension")) ||
                      tool.url?.includes("chromewebstore") ||
                      tool.url?.includes("chrome.google.com");
                    const label = isExtension ? "get_extension" : "run_bot";
                    return (
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#8FBF3F] font-bold hover:underline"
                      >
                        {label} &rarr;
                      </a>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured / Recently Indexed Section */}
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
              className="text-[#8FBF3F] hover:text-[#7ba235] text-sm font-semibold transition-colors"
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

      <AINews tools={recentTools} categories={categories} />

      <WhyCrawlers totalTools={totalToolsCount || 1417} totalCategories={categories.length || 170} lastUpdated={lastUpdatedStr} />

      {/* Category Indexing Section */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:py-16 sm:px-6 lg:px-8 border-t border-slate-900">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 font-sans">
          <div>
            <h2 className="font-serif text-2xl font-medium tracking-tight text-white sm:text-3xl">
              Browse Directory Index
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Filter by section or search to discover use-case collections
            </p>
          </div>
          
          {/* Category Quick Filter */}
          <div className="relative w-full md:max-w-xs">
            <input
              type="text"
              aria-label="Search categories"
              placeholder={categories.length > 0 ? `Search ${categories.length} categories...` : "Search categories..."}
              value={categorySearchQuery}
              onChange={(e) => {
                setCategorySearchQuery(e.target.value);
                setSelectedLetter("All"); // Reset letter filter when searching
              }}
              className="w-full rounded-lg border border-[#212623] bg-[#0D0F0E] pl-10 pr-8 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-[#8FBF3F] transition-all font-sans"
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

        {/* Sticky Group Jump Nav */}
        <div className="sticky top-[64px] z-30 -mx-4 px-4 sm:mx-0 sm:px-0 bg-[#0B0F17]/90 backdrop-blur-md border-b border-slate-900/60 relative">
          {showLeftFade && (
            <>
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#0B0F17] via-[#0B0F17]/85 to-transparent z-25" />
              <button
                type="button"
                onClick={() => handleScrollClick("left")}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-35 flex h-7 w-7 items-center justify-center rounded-full border border-[#212623] bg-[#0E100F]/90 text-[#8A8F87] hover:text-[#8FBF3F] hover:border-[#8FBF3F]/40 active:scale-95 transition-all shadow-md shadow-black/50 cursor-pointer"
                aria-label="Scroll Left"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </>
          )}
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex flex-nowrap items-center gap-2 overflow-x-auto py-4 scrollbar-none snap-x snap-mandatory scroll-smooth pr-10"
          >
            <button
              onClick={() => {
                setSelectedLetter("All");
                setCategorySearchQuery("");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`flex-shrink-0 snap-start px-4 py-2.5 rounded-lg text-xs font-semibold font-sans transition-all ${
                selectedLetter === "All" && !categorySearchQuery
                  ? "bg-[#8FBF3F] text-slate-950"
                  : "bg-slate-900/60 border border-[#212623] text-slate-300 hover:text-white"
              }`}
            >
              All Categories
            </button>
            
            <div className="h-5 w-[1px] bg-slate-850 flex-shrink-0 mx-1 snap-start" />
            
            {CATEGORY_GROUPS.map((group) => {
              const hasCategoriesInView = filteredCategories.some(cat => getCategoryGroup(cat).id === group.id);
              if (!hasCategoriesInView) return null;
              return (
                <button
                  key={group.id}
                  onClick={() => {
                    const element = document.getElementById(`group-${group.id}`);
                    if (element) {
                      element.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }}
                  className="flex-shrink-0 snap-start px-4 py-2.5 rounded-lg text-xs font-semibold bg-slate-900/60 border border-[#212623] text-slate-300 hover:text-[#8FBF3F] hover:border-[#8FBF3F]/40 transition-all font-sans"
                >
                  {group.name}
                </button>
              );
            })}
          </div>
          {showRightFade && (
            <>
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#0B0F17] via-[#0B0F17]/85 to-transparent z-25" />
              <button
                type="button"
                onClick={() => handleScrollClick("right")}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-35 flex h-7 w-7 items-center justify-center rounded-full border border-[#212623] bg-[#0E100F]/90 text-[#8A8F87] hover:text-[#8FBF3F] hover:border-[#8FBF3F]/40 active:scale-95 transition-all shadow-md shadow-black/50 cursor-pointer"
                aria-label="Scroll Right"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Active Filters Display */}
        {(selectedLetter !== "All" || categorySearchQuery) && (
          <div className="flex items-center justify-between text-xs text-slate-400 mb-6 font-mono bg-slate-900/30 border border-slate-900 px-4 py-2.5 rounded-lg">
            <div>
              Active Index filter: <span className="text-[#8FBF3F] font-sans font-bold">{selectedLetter !== "All" ? `Letter "${selectedLetter}"` : `Search "${categorySearchQuery}"`}</span>
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

        {/* Grouped Categories Grid */}
        {filteredCategories.length > 0 ? (
          <div className="space-y-12">
            {CATEGORY_GROUPS.map((group) => {
              const groupCategories = filteredCategories.filter(cat => getCategoryGroup(cat).id === group.id);
              if (groupCategories.length === 0) return null;
              
              // Sort categories so populated ones come first, empty ones go to bottom
              const sortedGroupCategories = [...groupCategories].sort((a, b) => {
                const countA = toolCounts[a.id] || 0;
                const countB = toolCounts[b.id] || 0;
                if (countA > 0 && countB === 0) return -1;
                if (countA === 0 && countB > 0) return 1;
                return a.name.localeCompare(b.name);
              });
              
              return (
                <CategoryGroupSection
                  key={group.id}
                  group={group}
                  groupCategories={groupCategories}
                  sortedGroupCategories={sortedGroupCategories}
                  toolCounts={toolCounts}
                  getCategoryIcon={getCategoryIcon}
                />
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
