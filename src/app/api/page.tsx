"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { mockDb, Tool } from "@/data/mockDb";

interface ApiBot {
  id: string;
  name: string;
  url: string;
  short_description: string;
  provider: string;
  pricing_model: string;
  tags: string[];
  click_count: number;
}

// Highly detailed curated seed list of standard API providers to ensure completeness
const SEED_APIS: Omit<ApiBot, "id" | "click_count">[] = [
  {
    name: "OpenAI API",
    url: "https://platform.openai.com",
    short_description: "Access GPT-4o, GPT-4o-mini, o1, o3-mini, Embeddings, and DALL-E 3 via developer keys.",
    provider: "OpenAI",
    pricing_model: "paid",
    tags: ["llm", "embeddings", "image generation", "chat"]
  },
  {
    name: "Anthropic Console",
    url: "https://console.anthropic.com",
    short_description: "Developer API access to the Claude 3.5 model family (Sonnet, Haiku, Opus) for reasoning and coding.",
    provider: "Anthropic",
    pricing_model: "paid",
    tags: ["llm", "reasoning", "coding"]
  },
  {
    name: "Google AI Studio",
    url: "https://aistudio.google.com",
    short_description: "Fast, direct API access to Gemini 1.5 and 2.0 models with a class-leading 2M token context window.",
    provider: "Google",
    pricing_model: "freemium",
    tags: ["llm", "multimodal", "audio", "video"]
  },
  {
    name: "DeepSeek Platform",
    url: "https://platform.deepseek.com",
    short_description: "Ultra cost-efficient developer API hosting DeepSeek-V3 and the DeepSeek-R1 reasoning model.",
    provider: "DeepSeek",
    pricing_model: "paid",
    tags: ["reasoning", "llm", "math", "cheap-api"]
  },
  {
    name: "Mistral AI Console",
    url: "https://console.mistral.ai",
    short_description: "European open-weights AI APIs hosting Mistral Large 2, Codestral, and Pixtral vision models.",
    provider: "Mistral",
    pricing_model: "paid",
    tags: ["llm", "coding", "vision", "open-weights"]
  },
  {
    name: "Groq Cloud",
    url: "https://console.groq.com",
    short_description: "Ultra-fast LPU inference engine hosting open-source models like Llama 3.3 and Mixtral 8x22B.",
    provider: "Groq",
    pricing_model: "freemium",
    tags: ["inference", "llm", "ultra-fast"]
  },
  {
    name: "Cohere Dashboard",
    url: "https://dashboard.cohere.com",
    short_description: "Enterprise-focused APIs for Command R+, Rerank search boosters, and high-quality embeddings.",
    provider: "Cohere",
    pricing_model: "paid",
    tags: ["embeddings", "rerank", "enterprise", "llm"]
  },
  {
    name: "Replicate",
    url: "https://replicate.com",
    short_description: "Run open-source models like Flux, SDXL, and Whisper with serverless API key endpoints.",
    provider: "Replicate",
    pricing_model: "paid",
    tags: ["image generation", "audio", "video", "inference"]
  },
  {
    name: "OpenRouter",
    url: "https://openrouter.ai",
    short_description: "Unified API gateway enabling a single developer key to access 100+ different AI models.",
    provider: "Others",
    pricing_model: "paid",
    tags: ["api-proxy", "llm", "aggregate"]
  },
  {
    name: "Hugging Face Inference",
    url: "https://huggingface.co/api/inference",
    short_description: "Serverless and dedicated inference endpoints hosting over 100,000 community models.",
    provider: "Others",
    pricing_model: "freemium",
    tags: ["open-source", "inference", "models"]
  },
  {
    name: "Fireworks AI",
    url: "https://fireworks.ai",
    short_description: "High-performance inference API key server for running open-source LLMs and visual models.",
    provider: "Others",
    pricing_model: "paid",
    tags: ["inference", "llm", "fast"]
  },
  {
    name: "NVIDIA NIM APIs",
    url: "https://build.nvidia.com/explore/discover",
    short_description: "NVIDIA's centralized catalog of accelerated inference endpoints for foundation models and enterprise AI blueprints.",
    provider: "NVIDIA",
    pricing_model: "freemium",
    tags: ["inference", "llm", "agentic-ai", "gpu-accelerated"]
  },
  {
    name: "NVIDIA Nemotron OCR",
    url: "https://build.nvidia.com/nvidia/nemotron-ocr-v2",
    short_description: "State-of-the-art multilingual OCR model for text, document layout, and table extraction from complex images.",
    provider: "NVIDIA",
    pricing_model: "freemium",
    tags: ["ocr", "vision", "document-layout"]
  },
  {
    name: "NVIDIA Nemotron-3 Ultra (550B)",
    url: "https://build.nvidia.com/nvidia/nemotron-3-ultra-550b-a55b",
    short_description: "Hybrid Mamba-Transformer MoE model with 1M context, excelling in agentic reasoning, coding, and planning.",
    provider: "NVIDIA",
    pricing_model: "freemium",
    tags: ["reasoning", "llm", "moe"]
  },
  {
    name: "NVIDIA Cosmos Video & Reasoner",
    url: "https://build.nvidia.com/nvidia/cosmos3-nano-reasoner",
    short_description: "Physics-aware video generation and advanced vision-language understanding models for physical AI.",
    provider: "NVIDIA",
    pricing_model: "freemium",
    tags: ["vision", "video-generation", "physical-ai"]
  },
  {
    name: "NVIDIA Content Safety",
    url: "https://build.nvidia.com/nvidia/nemotron-3.5-content-safety",
    short_description: "Multilingual and multimodal moderation API for detecting toxic, unsafe, or harmful inputs.",
    provider: "NVIDIA",
    pricing_model: "freemium",
    tags: ["safety", "moderation", "multimodal"]
  },
  {
    name: "NVIDIA Reranking",
    url: "https://build.nvidia.com/nvidia/llama-nemotron-rerank-1b-v2",
    short_description: "GPU-accelerated RAG retrieval reranker providing search answer relevancy probabilities.",
    provider: "NVIDIA",
    pricing_model: "freemium",
    tags: ["rerank", "retrieval", "rag"]
  },
  {
    name: "NVIDIA Synthetic Video Detector",
    url: "https://build.nvidia.com/nvidia/synthetic-video-detector",
    short_description: "Deepfake and AI-generated video detection API designed for safety and verification flows.",
    provider: "NVIDIA",
    pricing_model: "freemium",
    tags: ["media-verification", "deepfake-detection"]
  },
  {
    name: "NVIDIA LipSync & Speaker Tracker",
    url: "https://build.nvidia.com/nvidia/lipsync",
    short_description: "Voice and audio-visual analytics API for automated dubbing, active speaker tracking, and lip syncing.",
    provider: "NVIDIA",
    pricing_model: "freemium",
    tags: ["lipsync", "audio-visual", "broadcast"]
  }
];

export default function ApiKeysDirectoryPage() {
  const [dbTools, setDbTools] = useState<Tool[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    mockDb.getTools()
      .then(tools => {
        setDbTools(tools);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error loading tools for API page:", err);
        setIsLoading(false);
      });
  }, []);

  // Classify a tool's provider based on name/description/tags
  const getProviderName = (tool: Tool): string => {
    const text = `${tool.name} ${tool.short_description} ${tool.tags.join(" ")}`.toLowerCase();
    if (text.includes("openai") || text.includes("gpt-") || text.includes("dall-e")) return "OpenAI";
    if (text.includes("anthropic") || text.includes("claude")) return "Anthropic";
    if (text.includes("google") || text.includes("gemini") || text.includes("vertex")) return "Google";
    if (text.includes("nvidia") || text.includes("nemotron") || text.includes("nim")) return "NVIDIA";
    if (text.includes("deepseek")) return "DeepSeek";
    if (text.includes("mistral") || text.includes("mixtral") || text.includes("codestral")) return "Mistral";
    if (text.includes("groq")) return "Groq";
    if (text.includes("cohere")) return "Cohere";
    if (text.includes("replicate")) return "Replicate";
    if (text.includes("amazon") || text.includes("aws") || text.includes("bedrock")) return "AWS";
    if (text.includes("azure") || text.includes("microsoft")) return "Microsoft";
    return "Others";
  };

  // Compile full list of API bots by merging database tools and seed data
  const apiBots = useMemo(() => {
    // 1. Filter tools from DB that match API characteristics
    const dbApiTools = dbTools.filter(tool => {
      const tagsString = tool.tags.join(" ").toLowerCase();
      const nameLower = tool.name.toLowerCase();
      const descLower = tool.short_description.toLowerCase();
      const catName = tool.categories?.name.toLowerCase() || "";

      return (
        tagsString.includes("api") ||
        tagsString.includes("model") ||
        tagsString.includes("inference") ||
        tagsString.includes("llm") ||
        nameLower.includes("api") ||
        descLower.includes("api key") ||
        descLower.includes("developer key") ||
        descLower.includes("inference endpoint") ||
        catName.includes("models") ||
        catName.includes("api tools")
      );
    });

    // 2. Map database tools to ApiBot structure
    const mappedDbTools: ApiBot[] = dbApiTools.map(t => ({
      id: t.id,
      name: t.name,
      url: t.url,
      short_description: t.short_description,
      provider: getProviderName(t),
      pricing_model: t.pricing_model,
      tags: t.tags,
      click_count: t.click_count
    }));

    // 3. Prepare static seed tools, replacing them if a matching DB tool exists
    const finalSeeds: ApiBot[] = SEED_APIS.map((seed, index) => {
      const match = mappedDbTools.find(t => t.name.toLowerCase() === seed.name.toLowerCase() || t.url.toLowerCase().replace(/\/$/, "") === seed.url.toLowerCase().replace(/\/$/, ""));
      if (match) return match;
      return {
        ...seed,
        id: `seed-api-${index}`,
        click_count: 0
      };
    });

    // 4. Combine all unique tools
    const combined = [...mappedDbTools];
    finalSeeds.forEach(seed => {
      const exists = combined.some(t => t.name.toLowerCase() === seed.name.toLowerCase() || t.url.toLowerCase().replace(/\/$/, "") === seed.url.toLowerCase().replace(/\/$/, ""));
      if (!exists) {
        combined.push(seed);
      }
    });

    return combined;
  }, [dbTools]);

  // Unique list of providers for tabs
  const providers = useMemo(() => {
    const list = new Set(apiBots.map(b => b.provider));
    // Sort logically with top providers first
    const ordered = ["OpenAI", "Anthropic", "Google", "NVIDIA", "DeepSeek", "Mistral", "Groq", "Cohere", "Replicate"];
    const final: string[] = [];
    ordered.forEach(p => {
      if (list.has(p)) {
        final.push(p);
        list.delete(p);
      }
    });
    // Add remaining
    Array.from(list).sort().forEach(p => final.push(p));
    return final;
  }, [apiBots]);

  // Filter and search
  const filteredBots = useMemo(() => {
    return apiBots.filter(bot => {
      const matchesProvider = selectedProvider === "all" || bot.provider === selectedProvider;
      const matchesQuery = !searchQuery.trim() || 
        bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bot.short_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bot.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesProvider && matchesQuery;
    }).sort((a, b) => b.click_count - a.click_count || a.name.localeCompare(b.name));
  }, [apiBots, selectedProvider, searchQuery]);

  const handleCardClick = (id: string, name: string) => {
    if (!id.startsWith("seed-api-")) {
      mockDb.incrementClickCount(id).catch(console.error);
    }
  };

  return (
    <div className="flex-1 mx-auto max-w-7xl w-full px-4 py-12 sm:px-6 lg:px-8 font-sans">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6 font-mono">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <span className="text-slate-300">Developer APIs</span>
      </nav>

      {/* Header */}
      <div className="border-b border-slate-800/80 pb-6 mb-8">
        <h1 className="font-serif text-3xl font-medium tracking-tight text-white flex items-center gap-3">
          <span className="text-[#8FBF3F] font-mono">&gt;</span> API Key & Inference Registry
        </h1>
        <p className="text-slate-400 text-sm mt-2">
          A curated directory of AI platforms, foundation models, and serverless inference endpoints offering developer API keys.
        </p>
      </div>

      {/* Toolbar (Search & Tabs) */}
      <div className="space-y-6 mb-10">
        {/* Search */}
        <div className="relative max-w-md font-mono">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#8FBF3F] pointer-events-none text-xs font-bold">
            &gt; search_api //
          </span>
          <input
            type="text"
            placeholder="Search keys, models, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[#212623] bg-[#0D0F0E] pl-36 pr-4 py-2.5 text-xs text-white placeholder-slate-700 outline-none focus:border-[#8FBF3F] transition-all font-mono"
          />
        </div>

        {/* Provider Tabs */}
        <div className="border-b border-slate-800/80 pb-1 flex flex-wrap gap-2 overflow-x-auto scrollbar-thin font-mono text-xs">
          <button
            onClick={() => setSelectedProvider("all")}
            className={`px-3 py-2 border-b-2 font-bold uppercase transition-all tracking-wider ${
              selectedProvider === "all"
                ? "border-[#8FBF3F] text-[#8FBF3F]"
                : "border-transparent text-[#8A8F87] hover:text-white"
            }`}
          >
            [All Providers]
          </button>
          {providers.map((provider) => (
            <button
              key={provider}
              onClick={() => setSelectedProvider(provider)}
              className={`px-3 py-2 border-b-2 font-bold uppercase transition-all tracking-wider ${
                selectedProvider === provider
                  ? "border-[#8FBF3F] text-[#8FBF3F]"
                  : "border-transparent text-[#8A8F87] hover:text-white"
              }`}
            >
              [{provider}]
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-[#8FBF3F]" />
        </div>
      ) : filteredBots.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-800 rounded-xl bg-[#0F1423]/30 font-mono">
          <p className="text-slate-500 text-xs">No developer APIs found matching search parameters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBots.map((bot) => (
            <div
              key={bot.id}
              className="flex flex-col rounded-xl border border-slate-800 bg-[#131B2E] p-6 shadow-lg shadow-black/25 hover:border-[#8FBF3F]/40 hover:-translate-y-0.5 transition-all duration-300 relative group"
            >
              {/* Header Details */}
              <div className="flex justify-between items-start gap-4 mb-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-white group-hover:text-[#8FBF3F] transition-colors leading-snug">
                    {bot.name}
                  </h3>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[#8A8F87] font-bold">
                    Provider: {bot.provider}
                  </span>
                </div>
                
                {/* Pricing Badge */}
                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[9px] font-bold font-mono uppercase border ${
                  bot.pricing_model === "free"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : bot.pricing_model === "freemium"
                    ? "bg-[#8FBF3F]/10 text-[#8FBF3F] border-[#8FBF3F]/20"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                }`}>
                  {bot.pricing_model}
                </span>
              </div>

              {/* Description */}
              <p className="text-slate-400 text-xs leading-relaxed mb-6 flex-1 font-sans">
                {bot.short_description}
              </p>

              {/* Tags list */}
              <div className="flex flex-wrap gap-1.5 mb-6 font-mono">
                {bot.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-900 text-slate-400 border border-slate-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Action Link */}
              <Link
                href={bot.url}
                target="_blank"
                onClick={() => handleCardClick(bot.id, bot.name)}
                className="w-full flex h-10 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 hover:bg-[#8FBF3F] hover:text-slate-950 hover:border-transparent transition-all duration-200 uppercase tracking-wider font-mono"
              >
                Get API Key &rarr;
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Developer API Sub-Notes */}
      <div className="mt-16 pt-8 border-t border-slate-800/60 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-slate-500">
        <p>Index check: {filteredBots.length} active api endpoints listed.</p>
        <div className="flex gap-4">
          <Link href="/api/v1/tools" target="_blank" className="hover:text-white transition-colors">
            [raw_tools_json]
          </Link>
          <span>|</span>
          <Link href="/api/v1/categories" target="_blank" className="hover:text-white transition-colors">
            [raw_categories_json]
          </Link>
        </div>
      </div>
    </div>
  );
}
