"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mockDb, Category, Tool, CATEGORY_GROUPS, getCategoryGroup } from "@/data/mockDb";
import ToolCard from "@/components/ToolCard";
import { FeaturedCollections, WhyCrawlers, AINews } from "@/components/HomepageExtensions";
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
  Type, Inbox, BarChart3, Notebook, Library, PawPrint, Utensils, Command, Plug, Network, Lock, Trophy
} from "lucide-react";



export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentTools, setRecentTools] = useState<Tool[]>([]);
  const [toolCounts, setToolCounts] = useState<Record<string, number>>({});
  
  const [favoriteTools, setFavoriteTools] = useState<Tool[]>([]);
  const [recentToolsList, setRecentToolsList] = useState<Tool[]>([]);
  const [trendingTools, setTrendingTools] = useState<Tool[]>([]);
  const [totalToolsCount, setTotalToolsCount] = useState<number>(0);
  
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
  const [showRightFade, setShowRightFade] = useState(false);

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

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll, filteredCategories]);

  // Load from local storage cache instantly on mount
  useEffect(() => {
    try {
      const cachedTools = localStorage.getItem("crawlers_cached_tools");
      const cachedCats = localStorage.getItem("crawlers_cached_categories");
      if (cachedTools && cachedCats) {
        const tools = JSON.parse(cachedTools) as Tool[];
        const cats = JSON.parse(cachedCats) as Category[];
        
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCategories(cats);
        setTotalToolsCount(tools.length);

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
  }, []);

  const loadData = useCallback(async () => {
    const [allTools, dbCategories] = await Promise.all([
      mockDb.getTools(),
      mockDb.getCategories()
    ]);
    
    setCategories(dbCategories);
    setTotalToolsCount(allTools.length);

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
  }, []);

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
          <h1 className="font-serif text-4xl font-normal tracking-tight text-white sm:text-5xl lg:text-6xl mb-4 sm:mb-6">
            Find the exact <span className="italic text-[#8FBF3F]">AI tool</span> by use case
          </h1>
          
          <p className="text-slate-400 text-sm sm:text-lg max-w-2xl mx-auto mb-6 sm:mb-10 leading-relaxed font-sans">
            A curated AI tools directory of platforms and bots categorized by what they do. Search by use case or task to find the exact tool for your workflow.
          </p>

          {/* Large Use-case Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mx-auto max-w-2xl relative">
            <div className="relative flex items-center rounded-xl bg-[#131615] border border-[#212623] p-2 focus-within:border-[#8FBF3F] focus-within:ring-1 focus-within:ring-[#8FBF3F] shadow-xl shadow-black/30 transition-all duration-300">
              <div className="pl-3 text-slate-500">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                aria-label="Search directory by task"
                placeholder={isMobile ? "Search by task..." : "What do you want to do? (e.g., generate an image, summarize a video, write python code)"}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent px-4 py-3 text-base text-white placeholder-slate-500 outline-none font-sans"
              />
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-[#8FBF3F] hover:bg-[#7ba235] text-slate-950 font-bold px-6 py-3 transition-colors duration-200 font-sans"
              >
                Search
              </button>
            </div>
          </form>
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

      <FeaturedCollections />

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
                  {tool.short_description}
                </p>
                <div className="flex items-center justify-between border-t border-[#212623]/60 pt-3 text-[10px] font-mono">
                  <span className="text-[#8A8F87] uppercase tracking-wider truncate max-w-[150px]">
                    {categories.find(c => c.id === tool.category_id)?.name || "bot"}
                  </span>
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#8FBF3F] font-bold hover:underline"
                  >
                    run_bot &rarr;
                  </a>
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

      <AINews />

      <WhyCrawlers totalTools={totalToolsCount || 150} totalCategories={categories.length || 140} />

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
        <div className="sticky top-[73px] z-30 -mx-4 px-4 sm:mx-0 sm:px-0 bg-[#0B0F17]/90 backdrop-blur-md border-b border-slate-900/60 relative overflow-hidden">
          {showLeftFade && (
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#0B0F17] via-[#0B0F17]/85 to-transparent z-45" />
          )}
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex flex-nowrap items-center gap-2 overflow-x-auto py-4 scrollbar-none snap-x snap-mandatory scroll-smooth"
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
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#0B0F17] via-[#0B0F17]/85 to-transparent z-45" />
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
                <div key={group.id} id={`group-${group.id}`} className="scroll-mt-28">
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
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {sortedGroupCategories.map((cat) => {
                      const count = toolCounts[cat.id] || 0;
                      const isZero = count === 0;
                      return (
                        <Link 
                          key={cat.id} 
                          href={`/category/${cat.slug}`}
                          className={`group relative flex flex-col justify-between rounded-lg border border-[#212623] bg-[#131615]/50 p-5 sm:p-6 hover:-translate-y-1 hover:bg-[#131615] hover:border-[#8FBF3F]/40 hover:shadow-lg hover:shadow-black/50 transition-all duration-300 ${
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
