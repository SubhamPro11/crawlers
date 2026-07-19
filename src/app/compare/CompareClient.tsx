"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { mockDb, Tool } from "@/data/mockDb";

interface ComparisonData {
  id: string;
  name: string;
  pricing: string;
  freePlan: string;
  api: string;
  platforms: string[];
  features: string[];
  pros: string[];
  cons: string[];
  rating: number;
}

// Rich pre-populated comparison profiles for popular bots
const POPULAR_PROFILES: Record<string, Partial<ComparisonData>> = {
  chatgpt: {
    pricing: "Free / Plus ($20/mo)",
    freePlan: "GPT-4o mini, basic voice, web & mobile access",
    api: "Yes (Paid usage tiers)",
    platforms: ["Web", "macOS", "Windows", "iOS", "Android"],
    features: [
      "Multimodal GPT-4o model access",
      "Advanced voice mode & conversational audio",
      "Custom GPTs creation & store",
      "DALL-E 3 image generation",
      "Advanced data analysis & code execution"
    ],
    pros: [
      "Industry-leading general knowledge and coding",
      "Fast response speed with newer models",
      "Excellent mobile apps with voice integration"
    ],
    cons: [
      "Hourly message caps on advanced models",
      "Can hallucinate on highly specialized domains",
      "Plus subscription is relatively expensive"
    ],
    rating: 4.8
  },
  claude: {
    pricing: "Free / Pro ($20/mo)",
    freePlan: "Claude 3.5 Sonnet access (with strict usage caps)",
    api: "Yes (Anthropic Console API)",
    platforms: ["Web", "macOS", "iOS", "Android"],
    features: [
      "Artifacts UI for real-time code/design rendering",
      "Projects feature for workspace context sharing",
      "Industry-leading 200k token context window",
      "Advanced system prompts and instruction adhering",
      "Multimodal image/document reading"
    ],
    pros: [
      "Superb writing voice and natural style",
      "Best-in-class coding logic and debugging capabilities",
      "Artifacts provide visual feedback for code"
    ],
    cons: [
      "Highly restrictive message caps on free plan",
      "No native desktop app for Windows yet",
      "No built-in web search capabilities"
    ],
    rating: 4.9
  },
  gemini: {
    pricing: "Free / Advanced ($20/mo)",
    freePlan: "Gemini 1.5 Flash with 1M token context",
    api: "Yes (Google AI Studio API)",
    platforms: ["Web", "Android", "iOS"],
    features: [
      "Massive 2 million token context window",
      "Native Google Workspace integrations (Docs, Gmail, Drive)",
      "Excellent video and audio multimodal understanding",
      "Live double-check search verification",
      "Python-powered sandbox coding runner"
    ],
    pros: [
      "Unmatched context size for uploading huge codebases",
      "Deep integration with Google ecosystem",
      "Excellent image comprehension and OCR"
    ],
    cons: [
      "Interface can feel slow or laggy occasionally",
      "Coding answers sometimes require prompt tuning",
      "Free version has lower reasoning capability"
    ],
    rating: 4.7
  },
  cursor: {
    pricing: "Free / Pro ($20/mo)",
    freePlan: "50 fast premium requests, unlimited slow requests",
    api: "Yes (Allows custom OpenAI/Anthropic API keys)",
    platforms: ["macOS", "Windows", "Linux"],
    features: [
      "Direct code editing with Cmd+K inline prompts",
      "Composer mode (Cmd+I) to write edits across files",
      "Automated terminal command writing and executing",
      "Deep workspace indexing for full project context",
      "Direct imports of VS Code extensions & settings"
    ],
    pros: [
      "Unbelievable developer productivity booster",
      "Smooth migration from VS Code (built on VS Code fork)",
      "Supports local API keys to keep costs low"
    ],
    cons: [
      "Steep learning curve for advanced multi-file prompts",
      "Occasional sync/indexing issues on massive projects",
      "Not suitable for non-developers"
    ],
    rating: 4.9
  },
  perplexity: {
    pricing: "Free / Pro ($20/mo)",
    freePlan: "Standard copilot search queries",
    api: "Yes (Perplexity Llama models API)",
    platforms: ["Web", "macOS", "iOS", "Android"],
    features: [
      "Real-time search querying across web directories",
      "Pro search with step-by-step reasoning steps",
      "Multiple AI model selectors (Claude, GPT, Gemini)",
      "Collections workspace with custom instructions",
      "File uploads for search-context refinement"
    ],
    pros: [
      "Excellent citations showing sources directly",
      "Great replacement for standard search engines",
      "Lets you toggle different top-tier models"
    ],
    cons: [
      "Occasionally synthesizes incorrect summary facts",
      "Pro Search has a daily speed query quota limit",
      "Writing quality varies depending on the backend model"
    ],
    rating: 4.8
  }
};

export default function CompareClient() {
  const [allTools, setAllTools] = useState<Tool[]>([]);
  const [toolA, setToolA] = useState<Tool | null>(null);
  const [toolB, setToolB] = useState<Tool | null>(null);
  
  const [searchA, setSearchA] = useState("");
  const [searchB, setSearchB] = useState("");
  const [showDropdownA, setShowDropdownA] = useState(false);
  const [showDropdownB, setShowDropdownB] = useState(false);

  const containerRefA = useRef<HTMLDivElement>(null);
  const containerRefB = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadTools = async () => {
      const toolsList = await mockDb.getTools();
      
      // Deduplicate tools list by name (case-insensitive)
      const uniqueToolsMap = new Map<string, Tool>();
      toolsList.forEach((t) => {
        const nameKey = t.name.toLowerCase().trim();
        const existing = uniqueToolsMap.get(nameKey);
        // Keep the one with higher click_count if there's a duplicate
        if (!existing || (t.click_count || 0) > (existing.click_count || 0)) {
          uniqueToolsMap.set(nameKey, t);
        }
      });
      const uniqueTools = Array.from(uniqueToolsMap.values());

      // Sort by popularity (click count descending) and alphabetically by name as secondary
      const sortedTools = uniqueTools.sort((a, b) => {
        const clicksDiff = (b.click_count || 0) - (a.click_count || 0);
        if (clicksDiff !== 0) return clicksDiff;
        return a.name.localeCompare(b.name);
      });

      setAllTools(sortedTools);
      
      // Default selections: ChatGPT & Claude
      const defaultA = sortedTools.find(t => t.name.toLowerCase().includes("chatgpt")) || sortedTools.find(t => t.id === "1") || null;
      const defaultB = sortedTools.find(t => t.name.toLowerCase().includes("claude")) || sortedTools.find(t => t.id === "2") || null;
      
      setToolA(defaultA);
      setToolB(defaultB);
      if (defaultA) setSearchA(defaultA.name);
      if (defaultB) setSearchB(defaultB.name);
    };
    loadTools();
  }, []);

  // Click outside and Escape key to close dropdowns and sync input values
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRefA.current && !containerRefA.current.contains(event.target as Node)) {
        setShowDropdownA(false);
        setSearchA(toolA?.name || "");
      }
      if (containerRefB.current && !containerRefB.current.contains(event.target as Node)) {
        setShowDropdownB(false);
        setSearchB(toolB?.name || "");
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowDropdownA(false);
        setSearchA(toolA?.name || "");
        setShowDropdownB(false);
        setSearchB(toolB?.name || "");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [toolA, toolB]);

  const getProfile = (tool: Tool | null): ComparisonData | null => {
    if (!tool) return null;
    const key = tool.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    
    // Look for preset key match
    let preset: Partial<ComparisonData> = {};
    if (key.includes("chatgpt")) preset = POPULAR_PROFILES.chatgpt;
    else if (key.includes("claude")) preset = POPULAR_PROFILES.claude;
    else if (key.includes("gemini")) preset = POPULAR_PROFILES.gemini;
    else if (key.includes("cursor")) preset = POPULAR_PROFILES.cursor;
    else if (key.includes("perplexity")) preset = POPULAR_PROFILES.perplexity;

    return {
      id: tool.id,
      name: tool.name,
      pricing: preset.pricing || (tool.pricing_model === "free" ? "Free" : "Paid"),
      freePlan: preset.freePlan || (tool.pricing_model === "free" ? "Fully Free" : "Limited Trial / None"),
      api: preset.api || "Unknown / Contact Sales",
      platforms: preset.platforms || ["Web"],
      features: preset.features || [
        tool.short_description,
        `Indexed on Crawlers since ${new Date(tool.created_at).toLocaleDateString()}`,
        `Categorized under ${tool.categories?.name || "General AI"}`
      ],
      pros: preset.pros || ["Fast access", "Easy integration", "Direct URL connection"],
      cons: preset.cons || ["Requires active internet", "Third-party dependency"],
      rating: preset.rating || 4.5
    };
  };

  const profileA = getProfile(toolA);
  const profileB = getProfile(toolB);

  const filteredA = allTools.filter(t => t.name.toLowerCase().includes(searchA.toLowerCase())).slice(0, 5);
  const filteredB = allTools.filter(t => t.name.toLowerCase().includes(searchB.toLowerCase())).slice(0, 5);

  const renderStars = (rating: number) => {
    const stars = [];
    const floor = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      if (i <= floor) {
        stars.push(<span key={i} className="text-[#8FBF3F]">★</span>);
      } else if (i - 0.5 <= rating) {
        stars.push(<span key={i} className="text-[#8FBF3F] opacity-70">★</span>);
      } else {
        stars.push(<span key={i} className="text-slate-700">★</span>);
      }
    }
    return <div className="flex gap-0.5 text-sm">{stars}</div>;
  };

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-12 sm:px-6 lg:px-8 font-sans min-h-screen text-[#EDEEEA]">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <span className="text-slate-300">Compare Tools</span>
      </nav>

      {/* Header */}
      <div className="border-b border-slate-800/80 pb-6 mb-8">
        <h1 className="font-serif text-3xl font-medium tracking-tight text-white flex items-center gap-2">
          <span>Compare AI Tools</span>
          <span className="text-xs px-2 py-0.5 rounded-full border border-[#8FBF3F]/30 bg-[#8FBF3F]/10 text-[#8FBF3F] font-mono uppercase tracking-widest">
            beta
          </span>
        </h1>
        <p className="text-slate-400 text-sm mt-2">
          Compare side-by-side comparison tables including pricing models, APIs, and key features.
        </p>
      </div>

      {/* Selectors grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Selector A */}
        <div className="relative">
          <label className="block text-xs font-mono uppercase text-[#8A8F87] tracking-wider mb-2">First Tool</label>
          <div ref={containerRefA} className="relative">
            <input
              type="text"
              value={searchA}
              onChange={(e) => {
                setSearchA(e.target.value);
                setShowDropdownA(true);
              }}
              onFocus={() => {
                setShowDropdownA(true);
                if (searchA === toolA?.name) {
                  setSearchA("");
                }
              }}
              placeholder="Search first tool..."
              className="w-full rounded-lg border border-[#212623] bg-[#131615] px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-[#8FBF3F] transition-all"
            />
            {showDropdownA && (
              <div className="absolute left-0 right-0 mt-2 z-10 rounded-lg border border-[#212623] bg-[#131615] shadow-2xl p-1 max-h-60 overflow-y-auto">
                {filteredA.length > 0 ? (
                  filteredA.map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setToolA(t);
                        setSearchA(t.name);
                        setShowDropdownA(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs rounded hover:bg-[#8FBF3F]/10 hover:text-white transition-colors"
                    >
                      {t.name}
                    </button>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 p-3 text-center">No matching tools</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Selector B */}
        <div className="relative">
          <label className="block text-xs font-mono uppercase text-[#8A8F87] tracking-wider mb-2">Second Tool</label>
          <div ref={containerRefB} className="relative">
            <input
              type="text"
              value={searchB}
              onChange={(e) => {
                setSearchB(e.target.value);
                setShowDropdownB(true);
              }}
              onFocus={() => {
                setShowDropdownB(true);
                if (searchB === toolB?.name) {
                  setSearchB("");
                }
              }}
              placeholder="Search second tool..."
              className="w-full rounded-lg border border-[#212623] bg-[#131615] px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-[#8FBF3F] transition-all"
            />
            {showDropdownB && (
              <div className="absolute left-0 right-0 mt-2 z-10 rounded-lg border border-[#212623] bg-[#131615] shadow-2xl p-1 max-h-60 overflow-y-auto">
                {filteredB.length > 0 ? (
                  filteredB.map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setToolB(t);
                        setSearchB(t.name);
                        setShowDropdownB(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs rounded hover:bg-[#8FBF3F]/10 hover:text-white transition-colors"
                    >
                      {t.name}
                    </button>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 p-3 text-center">No matching tools</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comparison table */}
      {profileA && profileB ? (
        <div className="border border-[#212623] rounded-xl bg-[#131615]/30 backdrop-blur-md overflow-hidden shadow-2xl">
          {/* Desktop Table */}
          <div className="hidden md:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[#212623] bg-[#131615]/80">
                  <th className="p-4 w-1/4 text-xs font-mono uppercase tracking-wider text-[#8A8F87]">feature matrix</th>
                  <th className="p-4 w-3/8 text-sm font-bold text-white border-l border-[#212623]">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-[#8FBF3F]/10 flex items-center justify-center border border-[#8FBF3F]/20 text-[#8FBF3F] font-mono text-xs font-bold">
                        {profileA.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div>{profileA.name}</div>
                        {renderStars(profileA.rating)}
                      </div>
                    </div>
                  </th>
                  <th className="p-4 w-3/8 text-sm font-bold text-white border-l border-[#212623]">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-[#8FBF3F]/10 flex items-center justify-center border border-[#8FBF3F]/20 text-[#8FBF3F] font-mono text-xs font-bold">
                        {profileB.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div>{profileB.name}</div>
                        {renderStars(profileB.rating)}
                      </div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#212623]/60">
                {/* Pricing Model */}
                <tr>
                  <td className="p-4 text-xs font-mono uppercase tracking-wider text-[#8A8F87] bg-[#131615]/20">Pricing model</td>
                  <td className="p-4 text-sm text-slate-300 border-l border-[#212623]">{profileA.pricing}</td>
                  <td className="p-4 text-sm text-slate-300 border-l border-[#212623]">{profileB.pricing}</td>
                </tr>

                {/* Free Plan */}
                <tr>
                  <td className="p-4 text-xs font-mono uppercase tracking-wider text-[#8A8F87] bg-[#131615]/20">Free Tier Limit</td>
                  <td className="p-4 text-sm text-slate-300 border-l border-[#212623]">{profileA.freePlan}</td>
                  <td className="p-4 text-sm text-slate-300 border-l border-[#212623]">{profileB.freePlan}</td>
                </tr>

                {/* API Availability */}
                <tr>
                  <td className="p-4 text-xs font-mono uppercase tracking-wider text-[#8A8F87] bg-[#131615]/20">API Available</td>
                  <td className="p-4 text-sm text-slate-300 border-l border-[#212623]">{profileA.api}</td>
                  <td className="p-4 text-sm text-slate-300 border-l border-[#212623]">{profileB.api}</td>
                </tr>

                {/* Platforms */}
                <tr>
                  <td className="p-4 text-xs font-mono uppercase tracking-wider text-[#8A8F87] bg-[#131615]/20">platforms</td>
                  <td className="p-4 border-l border-[#212623]">
                    <div className="flex flex-wrap gap-1.5">
                      {profileA.platforms.map(p => (
                        <span key={p} className="text-[10px] font-mono px-2 py-0.5 rounded border border-[#212623] bg-[#131615] text-[#EDEEEA]">{p}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 border-l border-[#212623]">
                    <div className="flex flex-wrap gap-1.5">
                      {profileB.platforms.map(p => (
                        <span key={p} className="text-[10px] font-mono px-2 py-0.5 rounded border border-[#212623] bg-[#131615] text-[#EDEEEA]">{p}</span>
                      ))}
                    </div>
                  </td>
                </tr>

                {/* Key Features */}
                <tr>
                  <td className="p-4 text-xs font-mono uppercase tracking-wider text-[#8A8F87] bg-[#131615]/20">Key Features</td>
                  <td className="p-4 text-sm text-slate-300 border-l border-[#212623] align-top">
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      {profileA.features.map((f, i) => (
                        <li key={i} className="leading-relaxed">{f}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="p-4 text-sm text-slate-300 border-l border-[#212623] align-top">
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      {profileB.features.map((f, i) => (
                        <li key={i} className="leading-relaxed">{f}</li>
                      ))}
                    </ul>
                  </td>
                </tr>

                {/* Pros */}
                <tr>
                  <td className="p-4 text-xs font-mono uppercase tracking-wider text-green-500 bg-[#131615]/20">Pros</td>
                  <td className="p-4 text-sm text-slate-300 border-l border-[#212623] align-top">
                    <ul className="space-y-1.5 text-xs">
                      {profileA.pros.map((p, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-green-500 font-bold">✓</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="p-4 text-sm text-slate-300 border-l border-[#212623] align-top">
                    <ul className="space-y-1.5 text-xs">
                      {profileB.pros.map((p, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-green-500 font-bold">✓</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>

                {/* Cons */}
                <tr>
                  <td className="p-4 text-xs font-mono uppercase tracking-wider text-red-400 bg-[#131615]/20">Cons</td>
                  <td className="p-4 text-sm text-slate-300 border-l border-[#212623] align-top">
                    <ul className="space-y-1.5 text-xs">
                      {profileA.cons.map((c, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-red-400 font-bold">✗</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="p-4 text-sm text-slate-300 border-l border-[#212623] align-top">
                    <ul className="space-y-1.5 text-xs">
                      {profileB.cons.map((c, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-red-400 font-bold">✗</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>

                {/* Visit action */}
                <tr>
                  <td className="p-4 text-xs font-mono uppercase tracking-wider text-[#8A8F87] bg-[#131615]/20">Access Bot</td>
                  <td className="p-4 border-l border-[#212623]">
                    {toolA && (
                      <Link
                        href={`/tool/${toolA.id}`}
                        className="inline-flex h-9 items-center justify-center px-4 rounded-md border border-[#212623] hover:border-[#8FBF3F] hover:bg-[#8FBF3F]/10 hover:text-white text-xs font-semibold font-sans tracking-wide transition-all duration-200"
                      >
                        Visit Detail Page
                      </Link>
                    )}
                  </td>
                  <td className="p-4 border-l border-[#212623]">
                    {toolB && (
                      <Link
                        href={`/tool/${toolB.id}`}
                        className="inline-flex h-9 items-center justify-center px-4 rounded-md border border-[#212623] hover:border-[#8FBF3F] hover:bg-[#8FBF3F]/10 hover:text-white text-xs font-semibold font-sans tracking-wide transition-all duration-200"
                      >
                        Visit Detail Page
                      </Link>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Mobile Layout (Vertical stack comparison cards) */}
          <div className="block md:hidden p-4 space-y-6">
            {/* Card A */}
            <div className="border border-[#212623] rounded-lg bg-[#131615] p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-[#8FBF3F]/10 flex items-center justify-center border border-[#8FBF3F]/20 text-[#8FBF3F] font-mono text-xs font-bold">
                  {profileA.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{profileA.name}</h3>
                  {renderStars(profileA.rating)}
                </div>
              </div>
              
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-mono text-[#8A8F87] uppercase text-[10px] tracking-wider block">Pricing</span>
                  <span className="text-slate-300">{profileA.pricing}</span>
                </div>
                <div>
                  <span className="font-mono text-[#8A8F87] uppercase text-[10px] tracking-wider block">Free Plan</span>
                  <span className="text-slate-300">{profileA.freePlan}</span>
                </div>
                <div>
                  <span className="font-mono text-[#8A8F87] uppercase text-[10px] tracking-wider block">API</span>
                  <span className="text-slate-300">{profileA.api}</span>
                </div>
                <div>
                  <span className="font-mono text-[#8A8F87] uppercase text-[10px] tracking-wider block">Platforms</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profileA.platforms.map(p => (
                      <span key={p} className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-[#212623] bg-[#0D0F0E] text-[#EDEEEA]">{p}</span>
                    ))}
                  </div>
                </div>
              </div>

              {toolA && (
                <Link
                  href={`/tool/${toolA.id}`}
                  className="flex h-11 items-center justify-center w-full rounded-md border border-[#212623] text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Visit Detail Page
                </Link>
              )}
            </div>

            {/* Card B */}
            <div className="border border-[#212623] rounded-lg bg-[#131615] p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-[#8FBF3F]/10 flex items-center justify-center border border-[#8FBF3F]/20 text-[#8FBF3F] font-mono text-xs font-bold">
                  {profileB.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{profileB.name}</h3>
                  {renderStars(profileB.rating)}
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-mono text-[#8A8F87] uppercase text-[10px] tracking-wider block">Pricing</span>
                  <span className="text-slate-300">{profileB.pricing}</span>
                </div>
                <div>
                  <span className="font-mono text-[#8A8F87] uppercase text-[10px] tracking-wider block">Free Plan</span>
                  <span className="text-slate-300">{profileB.freePlan}</span>
                </div>
                <div>
                  <span className="font-mono text-[#8A8F87] uppercase text-[10px] tracking-wider block">API</span>
                  <span className="text-slate-300">{profileB.api}</span>
                </div>
                <div>
                  <span className="font-mono text-[#8A8F87] uppercase text-[10px] tracking-wider block">Platforms</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profileB.platforms.map(p => (
                      <span key={p} className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-[#212623] bg-[#0D0F0E] text-[#EDEEEA]">{p}</span>
                    ))}
                  </div>
                </div>
              </div>

              {toolB && (
                <Link
                  href={`/tool/${toolB.id}`}
                  className="flex h-11 items-center justify-center w-full rounded-md border border-[#212623] text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Visit Detail Page
                </Link>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-[#212623] rounded-xl bg-[#131615]/10">
          <p className="text-slate-500 text-sm">Please select tools to compare</p>
        </div>
      )}
    </div>
  );
}
