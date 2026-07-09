"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mockDb, Category, Tool } from "@/data/mockDb";
import ToolCard from "@/components/ToolCard";
import {
  Sparkles, Code, Search, Image, AudioLines, Video, FileText, Bot, 
  Workflow, Database, Languages, Settings, Layout, Apple, Scale, 
  Sprout, GraduationCap, Gamepad2, Landmark, Heart, Shield,
  MessageSquare, UserCheck, BarChart2, PenTool, Cloud, Cpu, Compass, 
  Globe, Film, BookOpen, Eye, Music, Radio, Smile, HelpCircle, 
  Construction, Users, Activity, Laptop, Scissors, Mic, PenSquare,
  TrendingUp, Mail, Calendar
} from "lucide-react";

interface CategoryGroup {
  id: string;
  name: string;
  slugs: string[];
  keywords: string[];
}

const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: "text-writing",
    name: "Text & Writing",
    slugs: ["writing-assistants", "copywriting", "storytelling", "transcription", "translator", "localization", "resume-tools", "document-ai", "documentation", "note-taking-apps", "newsletters"],
    keywords: ["writing", "copywrite", "transcribe", "translate", "localiz", "resume", "document", "note", "letter", "summariz"]
  },
  {
    id: "audio-video",
    name: "Audio, Video & Media",
    slugs: ["video", "video-editor", "video-generator", "video-enhancer", "video-subtitling", "talking-avatar-generator", "animation", "music-generation", "audio", "voice-cloning", "podcast", "dubbing"],
    keywords: ["video", "avatar", "animat", "music", "audio", "voice", "podcast", "dub"]
  },
  {
    id: "design-creative",
    name: "Design & 3D Creative",
    slugs: ["image-generation", "image-editing", "background-remover", "logo-generator", "character-design", "infographics", "graphic-design", "fashion", "architecture", "ar-vr", "3d", "3d-printing", "meme-generator"],
    keywords: ["image", "design", "creative", "logo", "graphic", "fashion", "architecture", "vr", "3d", "meme", "remover"]
  },
  {
    id: "productivity-business",
    name: "Productivity & Business",
    slugs: ["productivity", "project-management", "calendar-scheduling", "meeting-assistants", "crm", "hr", "recruiting", "compliance", "tax-accounting", "contract-management", "business-tools", "email-assistants", "spreadsheets", "mind-mapping"],
    keywords: ["productiv", "project", "calendar", "schedul", "meeting", "crm", "hr", "recruit", "complian", "tax", "account", "contract", "business", "email", "spreadsheet", "mind"]
  },
  {
    id: "dev-tech",
    name: "Developer & Tech Tools",
    slugs: ["developer-tools", "devtools", "code-assistant", "software-testing", "no-code", "app-builders", "website-builders", "cloud-management", "debugging", "web3", "robotics", "iot"],
    keywords: ["dev", "code", "software", "test", "build", "cloud", "debug", "web3", "robot", "iot"]
  },
  {
    id: "data-security",
    name: "Data, Models & Security",
    slugs: ["database-tools", "observability", "cybersecurity", "privacy", "identity", "synthetic-data", "data-labeling", "data", "models", "computer-vision"],
    keywords: ["data", "db", "security", "privacy", "identity", "model", "vision", "observab"]
  },
  {
    id: "marketing-sales",
    name: "Marketing, Sales & SEO",
    slugs: ["marketing", "sales-tools", "lead-generation", "seo", "social-media-tools", "ad-generator"],
    keywords: ["market", "sale", "lead", "seo", "social", "ad-"]
  },
  {
    id: "search-agents",
    name: "Search, Chat & AI Agents",
    slugs: ["search-research", "search-engines", "local-search-engines", "ai-directories", "chatbot-builders", "chatbots", "ai-agents", "personal-assistants", "ai-companion", "customer-support", "general-reasoning", "sentiment-analysis"],
    keywords: ["search", "engine", "directory", "chat", "agent", "assist", "companion", "support", "reasoning", "sentiment"]
  },
  {
    id: "education-lifestyle",
    name: "Education & Lifestyle",
    slugs: ["academia", "learning-tools", "language-learning", "reading", "parenting", "dating", "wellness", "fitness", "sports-analytics", "pets", "travel", "others"],
    keywords: ["academia", "learn", "read", "parent", "date", "well", "fit", "sport", "pet", "travel", "other"]
  },
  {
    id: "science-industry",
    name: "Science, Health & Industry",
    slugs: ["farming", "construction", "manufacturing", "real-estate", "home-design", "insurance", "government", "healthcare", "telemedicine", "medical-imaging", "drug-discovery", "biotech", "cleantech", "energy", "climate", "weather", "space-tech", "legal-assistants", "patent-tools", "fleet-management", "supply-chain", "geospatial"],
    keywords: ["farm", "construct", "manufactur", "estate", "house", "insurance", "govern", "health", "medic", "drug", "bio", "clean", "energy", "climate", "weather", "space", "legal", "patent", "fleet", "chain", "geo"]
  }
];

const getCategoryGroup = (cat: Category): CategoryGroup => {
  const slug = cat.slug.toLowerCase();
  
  // 1. Direct Slug Match
  for (const group of CATEGORY_GROUPS) {
    if (group.slugs.includes(slug)) {
      return group;
    }
  }
  
  // 2. Keyword Match
  for (const group of CATEGORY_GROUPS) {
    for (const kw of group.keywords) {
      if (slug.includes(kw)) {
        return group;
      }
    }
  }
  
  // Default fallback: Education & Lifestyle
  return CATEGORY_GROUPS[8];
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentTools, setRecentTools] = useState<Tool[]>([]);
  const [toolCounts, setToolCounts] = useState<Record<string, number>>({});
  const router = useRouter();

  const [selectedLetter, setSelectedLetter] = useState<string>("All");
  const [categorySearchQuery, setCategorySearchQuery] = useState<string>("");

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const lettersWithCategories = useMemo(() => {
    const letters = new Set<string>();
    categories.forEach(cat => {
      const firstChar = cat.name.charAt(0).toUpperCase();
      if (/[A-Z]/.test(firstChar)) {
        letters.add(firstChar);
      }
    });
    return Array.from(letters).sort();
  }, [categories]);

  const filteredCategories = useMemo(() => {
    return categories.filter(cat => {
      const matchesSearch = cat.name.toLowerCase().includes(categorySearchQuery.toLowerCase()) ||
                            (cat.description && cat.description.toLowerCase().includes(categorySearchQuery.toLowerCase()));
      
      const firstChar = cat.name.charAt(0).toUpperCase();
      const matchesLetter = selectedLetter === "All" || firstChar === selectedLetter;
      
      return matchesSearch && matchesLetter;
    });
  }, [categories, selectedLetter, categorySearchQuery]);

  useEffect(() => {
    const loadData = async () => {
      const [allTools, dbCategories] = await Promise.all([
        mockDb.getTools(),
        mockDb.getCategories()
      ]);
      
      setCategories(dbCategories);

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
    };
    loadData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const refreshRecent = async () => {
    const allTools = await mockDb.getTools();
    const sorted = [...allTools]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 6);
    setRecentTools(sorted);
  };

  // Get icon for categories
  const getCategoryIcon = (slug: string) => {
    const s = slug.toLowerCase();
    const baseClass = "h-6 w-6 text-[#10B981] group-hover:text-white transition-colors duration-300";

    // 1. Precise Keyword Mapping
    if (s.includes("3d")) {
      return <Layout className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("accessibility")) {
      return <UserCheck className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("directories")) {
      return <FileText className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("newsletters")) {
      return <Mail className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("api-tools") || s.includes("api")) {
      return <Code className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("ar-vr") || s.includes("vr")) {
      return <Eye className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("architecture")) {
      return <Construction className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("developer-tools") || s.includes("devtools") || s.includes("code-assistant")) {
      return <Code className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("farming")) {
      return <Sprout className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("legal-assistants") || s.includes("contract-management") || s.includes("compliance")) {
      return <Scale className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("nutrition") || s.includes("food")) {
      return <Apple className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("video-editor") || s === "video") {
      return <Film className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("video-generator") || s.includes("avatar")) {
      return <Video className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("video-subtitling")) {
      return <AudioLines className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("academia") || s.includes("learning-tools") || s.includes("language-learning")) {
      return <GraduationCap className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("gaming")) {
      return <Gamepad2 className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("finance") || s.includes("fintech") || s.includes("accounting")) {
      return <Landmark className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("healthcare") || s.includes("telemedicine") || s.includes("medical-imaging")) {
      return <Heart className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("cybersecurity") || s.includes("privacy") || s.includes("identity")) {
      return <Shield className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("chatbot-builders") || s === "chatbots" || s.includes("customer-support")) {
      return <MessageSquare className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("hr") || s.includes("recruiting") || s.includes("job-tools")) {
      return <UserCheck className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("seo") || s.includes("lead-generation")) {
      return <TrendingUp className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("marketing") || s.includes("sales-tools") || s.includes("ad-generator")) {
      return <BarChart2 className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("image-generation")) {
      return <Image className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("graphic-design") || s.includes("writing-assistants") || s.includes("copywriting")) {
      return <PenTool className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("image-editing") || s.includes("video-enhancer") || s.includes("animation")) {
      return <Sparkles className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("app-builders") || s.includes("website-builders") || s.includes("no-code")) {
      return <Laptop className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("background-remover")) {
      return <Scissors className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("meme-generator")) {
      return <Smile className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("email")) {
      return <Mail className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("cloud")) {
      return <Cloud className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("robotics") || s.includes("iot")) {
      return <Cpu className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("geospatial") || s.includes("travel") || s.includes("market-research")) {
      return <Compass className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("web3") || s.includes("search-engines")) {
      return <Globe className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("music")) {
      return <Music className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("audio") || s.includes("podcast")) {
      return <Radio className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("translator") || s.includes("localization")) {
      return <Languages className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("transcription") || s.includes("dubbing")) {
      return <Mic className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("search") || s.includes("research")) {
      return <Search className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("storytelling") || s.includes("knowledge")) {
      return <BookOpen className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("note-taking") || s.includes("mind-mapping")) {
      return <PenSquare className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("document-ai") || s.includes("documentation") || s.includes("resume-tools")) {
      return <FileText className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("agents") || s.includes("personal-assistants") || s.includes("companion")) {
      return <Bot className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("workflow") || s.includes("automation")) {
      return <Workflow className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("database")) {
      return <Database className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("productivity") || s.includes("project-management") || s.includes("calendar")) {
      return <Calendar className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("construction")) {
      return <Construction className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("parenting")) {
      return <Users className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("sports")) {
      return <Activity className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("observability") || s.includes("sentiment")) {
      return <Eye className={baseClass} strokeWidth={2} />;
    }
    if (s.includes("logo") || s.includes("character")) {
      return <Layout className={baseClass} strokeWidth={2} />;
    }

    // Default fallback
    return <HelpCircle className={baseClass} strokeWidth={2} />;
  };

  return (
    <div className="flex flex-col flex-1">
      {/* Hero Section */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8 text-center overflow-hidden border-b border-[#1E293B] bg-gradient-to-b from-[#0e1627] to-[#0B0F17]">
        {/* Subtle decorative glow */}
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-[#10B981]/5 blur-3xl" />

        <div className="relative mx-auto max-w-3xl">
          <h1 className="font-serif text-4xl font-normal tracking-tight text-white sm:text-5xl lg:text-6xl mb-6">
            Find the exact <span className="italic text-[#10B981]">AI tool</span> for the job
          </h1>
          
          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
            A curated index of AI tools categorized by what they do, rather than by brand. Search by task to find the right tool instantly.
          </p>

          {/* Large Use-case Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mx-auto max-w-2xl relative">
            <div className="relative flex items-center rounded-xl bg-[#131B2E] border border-slate-800 p-2 focus-within:border-[#10B981] focus-within:ring-1 focus-within:ring-[#10B981] shadow-xl shadow-black/30 transition-all duration-300">
              <div className="pl-3 text-slate-500">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="What do you want to do? (e.g., generate an image, summarize a video, write python code)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent px-4 py-3 text-base text-white placeholder-slate-500 outline-none font-sans"
              />
              <button
                type="submit"
                className="rounded-lg bg-[#10B981] hover:bg-[#059669] text-slate-950 font-bold px-6 py-3 transition-colors duration-200 font-sans"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Featured / Trending Section */}
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
              className="text-[#10B981] hover:text-[#059669] text-sm font-semibold transition-colors"
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

      {/* Category Indexing Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t border-slate-900">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 font-sans">
          <div>
            <h2 className="font-serif text-2xl font-medium tracking-tight text-white sm:text-3xl">
              Browse Directory Index
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Filter by letter or search to discover use-case collections
            </p>
          </div>
          
          {/* Category Quick Filter */}
          <div className="relative max-w-xs w-full">
            <input
              type="text"
              placeholder="Search 143 categories..."
              value={categorySearchQuery}
              onChange={(e) => {
                setCategorySearchQuery(e.target.value);
                setSelectedLetter("All"); // Reset letter filter when searching
              }}
              className="w-full rounded-lg border border-slate-800 bg-[#0B0F17] pl-10 pr-8 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-[#10B981] transition-all font-sans"
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
        <div className="sticky top-[73px] z-30 flex flex-nowrap items-center gap-2 overflow-x-auto bg-[#0B0F17]/90 backdrop-blur-md border-b border-slate-900/60 py-4 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
          <button
            onClick={() => {
              setSelectedLetter("All");
              setCategorySearchQuery("");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-semibold font-sans transition-all ${
              selectedLetter === "All" && !categorySearchQuery
                ? "bg-[#10B981] text-slate-950"
                : "bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white"
            }`}
          >
            All Categories
          </button>
          
          <div className="h-5 w-[1px] bg-slate-850 flex-shrink-0 mx-1" />
          
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
                className="flex-shrink-0 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-[#10B981] hover:border-[#10B981]/40 transition-all font-sans"
              >
                {group.name}
              </button>
            );
          })}
        </div>

        {/* Active Filters Display */}
        {(selectedLetter !== "All" || categorySearchQuery) && (
          <div className="flex items-center justify-between text-xs text-slate-400 mb-6 font-mono bg-slate-900/30 border border-slate-900 px-4 py-2.5 rounded-lg">
            <div>
              Active Index filter: <span className="text-[#10B981] font-sans font-bold">{selectedLetter !== "All" ? `Letter "${selectedLetter}"` : `Search "${categorySearchQuery}"`}</span>
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
              
              return (
                <div key={group.id} id={`group-${group.id}`} className="scroll-mt-28">
                  <div className="flex items-center justify-between mb-6 border-b border-slate-800/80 pb-3 font-sans">
                    <div className="flex items-center gap-3">
                      <h3 className="font-serif text-lg font-medium text-white sm:text-xl">
                        {group.name}
                      </h3>
                      <span className="rounded-full bg-slate-900/80 border border-slate-800 px-2.5 py-0.5 text-xs text-slate-400 font-mono font-bold">
                        {groupCategories.length}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {groupCategories.map((cat) => {
                      const count = toolCounts[cat.id] || 0;
                      return (
                        <Link 
                          key={cat.id} 
                          href={`/category/${cat.slug}`}
                          className="group relative flex flex-col justify-between rounded-xl border border-slate-800 bg-[#131B2E]/50 p-6 hover:bg-[#131B2E] hover:border-slate-700 transition-all duration-300"
                        >
                          <div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-800/85 mb-4 group-hover:bg-[#10B981]/10 border border-slate-800 transition-all duration-300">
                              {getCategoryIcon(cat.slug)}
                            </div>
                            <h3 className="text-base font-bold text-white group-hover:text-[#10B981] transition-colors duration-300 line-clamp-1">
                              {cat.name}
                            </h3>
                            <p className="text-slate-400 text-xs mt-2 leading-normal line-clamp-2">
                              {cat.description || "Browse curated tools for this domain."}
                            </p>
                          </div>
                          <div className="mt-5 flex items-center justify-between text-xs text-slate-500 font-medium">
                            <span>{count} {count === 1 ? 'tool' : 'tools'} available</span>
                            <span className="text-[#10B981] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              Explore &rarr;
                            </span>
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
