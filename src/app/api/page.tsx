"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { mockDb, Tool } from "@/data/mockDb";
import { TerminalLoader } from "@/components/TerminalLoader";

interface ApiBot {
  id: string;
  name: string;
  url: string;
  short_description: string;
  provider: string;
  pricing_model: string;
  tags: string[];
  click_count: number;
  creator: string;
}

// Highly detailed curated seed list of standard API providers and NVIDIA NIM hosted models
const SEED_APIS: Omit<ApiBot, "id" | "click_count">[] = [
  // Core Foundation Providers
  {
    name: "OpenAI API",
    url: "https://platform.openai.com",
    short_description: "Access GPT-4o, GPT-4o-mini, o1, o3-mini, Embeddings, and DALL-E 3 via developer keys.",
    provider: "OpenAI",
    pricing_model: "paid",
    tags: ["llm", "embeddings", "image generation", "chat"],
    creator: "OpenAI"
  },
  {
    name: "Anthropic Console",
    url: "https://console.anthropic.com",
    short_description: "Developer API access to the Claude 3.5 model family (Sonnet, Haiku, Opus) for reasoning and coding.",
    provider: "Anthropic",
    pricing_model: "paid",
    tags: ["llm", "reasoning", "coding"],
    creator: "Anthropic"
  },
  {
    name: "Google AI Studio",
    url: "https://aistudio.google.com",
    short_description: "Fast, direct API access to Gemini 1.5 and 2.0 models with a class-leading 2M token context window.",
    provider: "Google",
    pricing_model: "freemium",
    tags: ["llm", "multimodal", "audio", "video"],
    creator: "Google"
  },
  {
    name: "DeepSeek Platform",
    url: "https://platform.deepseek.com",
    short_description: "Ultra cost-efficient developer API hosting DeepSeek-V3 and the DeepSeek-R1 reasoning model.",
    provider: "DeepSeek",
    pricing_model: "paid",
    tags: ["reasoning", "llm", "math", "cheap-api"],
    creator: "DeepSeek"
  },
  {
    name: "Mistral AI Console",
    url: "https://console.mistral.ai",
    short_description: "European open-weights AI APIs hosting Mistral Large 2, Codestral, and Pixtral vision models.",
    provider: "Mistral",
    pricing_model: "paid",
    tags: ["llm", "coding", "vision", "open-weights"],
    creator: "Mistral AI"
  },
  {
    name: "Groq Cloud",
    url: "https://console.groq.com",
    short_description: "Ultra-fast LPU inference engine hosting open-source models like Llama 3.3 and Mixtral 8x22B.",
    provider: "Groq",
    pricing_model: "freemium",
    tags: ["inference", "llm", "ultra-fast"],
    creator: "Groq"
  },
  {
    name: "Cohere Dashboard",
    url: "https://dashboard.cohere.com",
    short_description: "Enterprise-focused APIs for Command R+, Rerank search boosters, and high-quality embeddings.",
    provider: "Cohere",
    pricing_model: "paid",
    tags: ["embeddings", "rerank", "enterprise", "llm"],
    creator: "Cohere"
  },
  {
    name: "Replicate",
    url: "https://replicate.com",
    short_description: "Run open-source models like Flux, SDXL, and Whisper with serverless API key endpoints.",
    provider: "Replicate",
    pricing_model: "paid",
    tags: ["image generation", "audio", "video", "inference"],
    creator: "Replicate"
  },

  // Meta models hosted on NVIDIA NIM
  {
    name: "Llama 3.3 70B Instruct (NIM)",
    url: "https://build.nvidia.com/meta/llama-3.3-70b-instruct",
    short_description: "Meta's flagship open LLM, optimized by NVIDIA with NIM runtime for low latency agentic workflows.",
    provider: "NVIDIA",
    pricing_model: "freemium",
    tags: ["llm", "chat", "agents", "NVIDIA", "NIM"],
    creator: "Meta"
  },
  {
    name: "Llama 3.1 405B Instruct (NIM)",
    url: "https://build.nvidia.com/meta/llama-3.1-405b-instruct",
    short_description: "Meta's massive open foundation model, hosted via serverless GPU APIs for complex logic.",
    provider: "NVIDIA",
    pricing_model: "freemium",
    tags: ["llm", "reasoning", "synthetic-data", "NVIDIA", "NIM"],
    creator: "Meta"
  },
  {
    name: "Llama 3.2 3B Instruct (NIM)",
    url: "https://build.nvidia.com/meta/llama-3.2-3b-instruct",
    short_description: "Lightweight, highly optimized edge reasoning model hosted via serverless endpoints.",
    provider: "NVIDIA",
    pricing_model: "freemium",
    tags: ["llm", "edge", "mobile", "NVIDIA", "NIM"],
    creator: "Meta"
  },
  {
    name: "CodeLlama 70B Instruct (NIM)",
    url: "https://build.nvidia.com/meta/codellama-70b-instruct",
    short_description: "Meta's specialized developer model for code generation, bug fixing, and docstring refactoring.",
    provider: "NVIDIA",
    pricing_model: "freemium",
    tags: ["coding", "llm", "autocomplete", "NVIDIA", "NIM"],
    creator: "Meta"
  },

  // Microsoft models hosted on NVIDIA NIM
  {
    name: "Phi-4 (NIM)",
    url: "https://build.nvidia.com/microsoft/phi-4",
    short_description: "Microsoft's 14B parameter reasoning model, delivering state-of-the-art logic and math via NIM.",
    provider: "NVIDIA",
    pricing_model: "freemium",
    tags: ["reasoning", "llm", "logic", "NVIDIA", "NIM"],
    creator: "Microsoft"
  },
  {
    name: "Phi-3.5 MoE (NIM)",
    url: "https://build.nvidia.com/microsoft/phi-3.5-moe",
    short_description: "Microsoft's sparse Mixture of Experts model, serving efficient and multilingual reasoning.",
    provider: "NVIDIA",
    pricing_model: "freemium",
    tags: ["moe", "llm", "multilingual", "NVIDIA", "NIM"],
    creator: "Microsoft"
  },
  {
    name: "Phi-3.5 Vision (NIM)",
    url: "https://build.nvidia.com/microsoft/phi-3.5-vision-instruct",
    short_description: "Multimodal vision-text lightweight model for OCR, charts, and spatial understanding.",
    provider: "NVIDIA",
    pricing_model: "freemium",
    tags: ["vision", "multimodal", "ocr", "NVIDIA", "NIM"],
    creator: "Microsoft"
  },

  // Google models hosted on NVIDIA NIM
  {
    name: "Gemma 2 27B IT (NIM)",
    url: "https://build.nvidia.com/google/gemma-2-27b-it",
    short_description: "Google's high-efficiency open weights model, optimized by NVIDIA for extreme compute throughput.",
    provider: "NVIDIA",
    pricing_model: "freemium",
    tags: ["llm", "chat", "agents", "NVIDIA", "NIM"],
    creator: "Google"
  },
  {
    name: "Gemma 2 9B IT (NIM)",
    url: "https://build.nvidia.com/google/gemma-2-9b-it",
    short_description: "Google's lightweight 9B model, perfect for summarization, entity extraction, and fast generation.",
    provider: "NVIDIA",
    pricing_model: "freemium",
    tags: ["llm", "chat", "fast", "NVIDIA", "NIM"],
    creator: "Google"
  },
  {
    name: "Gemma 2 2B IT (NIM)",
    url: "https://build.nvidia.com/google/gemma-2-2b-it",
    short_description: "Google's ultra-portable model hosting fast conversational text processing.",
    provider: "NVIDIA",
    pricing_model: "freemium",
    tags: ["llm", "edge", "conversational", "NVIDIA", "NIM"],
    creator: "Google"
  },

  // Mistral AI models hosted on NVIDIA NIM
  {
    name: "Mistral Large 2 (NIM)",
    url: "https://build.nvidia.com/mistralai/mistral-large-2-instruct",
    short_description: "Mistral AI's flagship model hosted via GPU-accelerated endpoints for advanced reasoning.",
    provider: "NVIDIA",
    pricing_model: "freemium",
    tags: ["llm", "reasoning", "multilingual", "NVIDIA", "NIM"],
    creator: "Mistral AI"
  },
  {
    name: "Mixtral 8x22B Instruct (NIM)",
    url: "https://build.nvidia.com/mistralai/mixtral-8x22b-instruct-v0.1",
    short_description: "High-performance sparse Mixture-of-Experts model, delivering outstanding multilingual reasoning.",
    provider: "NVIDIA",
    pricing_model: "freemium",
    tags: ["moe", "llm", "coding", "NVIDIA", "NIM"],
    creator: "Mistral AI"
  },
  {
    name: "Codestral 22B (NIM)",
    url: "https://build.nvidia.com/mistralai/codestral-22b-instruct",
    short_description: "Mistral's open-weights model designed specifically for code generation and multi-language software development.",
    provider: "NVIDIA",
    pricing_model: "freemium",
    tags: ["coding", "llm", "autocomplete", "NVIDIA", "NIM"],
    creator: "Mistral AI"
  },

  // DeepSeek models hosted on NVIDIA NIM
  {
    name: "DeepSeek-R1 (NIM)",
    url: "https://build.nvidia.com/deepseek-ai/deepseek-r1",
    short_description: "DeepSeek's frontier reasoning model hosted on NIM with low latency, excelling in math and logic.",
    provider: "NVIDIA",
    pricing_model: "freemium",
    tags: ["reasoning", "llm", "math", "NVIDIA", "NIM"],
    creator: "DeepSeek"
  },
  {
    name: "DeepSeek-V3 (NIM)",
    url: "https://build.nvidia.com/deepseek-ai/deepseek-v3",
    short_description: "Highly efficient sparse MoE model for fast general-purpose reasoning and conversational AI.",
    provider: "NVIDIA",
    pricing_model: "freemium",
    tags: ["llm", "moe", "chat", "NVIDIA", "NIM"],
    creator: "DeepSeek"
  },

  // Zhipu / Moonshot models hosted on NVIDIA NIM
  {
    name: "Kimi-K2.6 MoE (NIM)",
    url: "https://build.nvidia.com/moonshotai/kimi-k2.6",
    short_description: "Moonshot AI's Mixture of Experts model offering extremely long context capabilities via serverless endpoints.",
    provider: "NVIDIA",
    pricing_model: "freemium",
    tags: ["moe", "llm", "long-context", "NVIDIA", "NIM"],
    creator: "Moonshot AI"
  },
  {
    name: "GLM-5.1 (NIM)",
    url: "https://build.nvidia.com/z-ai/glm-5.1",
    short_description: "Zhipu AI's agentic model optimized for task-solving and automation workflows.",
    provider: "NVIDIA",
    pricing_model: "freemium",
    tags: ["agentic-ai", "llm", "automation", "NVIDIA", "NIM"],
    creator: "Zhipu AI"
  },

  // NVIDIA Native Models
  {
    name: "NVIDIA Nemotron-3 Ultra (550B)",
    url: "https://build.nvidia.com/nvidia/nemotron-3-ultra-550b-a55b",
    short_description: "Hybrid Mamba-Transformer MoE model with 1M context, excelling in agentic reasoning and planning.",
    provider: "NVIDIA",
    pricing_model: "freemium",
    tags: ["reasoning", "llm", "moe", "NVIDIA", "NIM"],
    creator: "NVIDIA Native"
  },
  {
    name: "NVIDIA Nemotron OCR",
    url: "https://build.nvidia.com/nvidia/nemotron-ocr-v2",
    short_description: "State-of-the-art multilingual OCR model for text, document layout, and table extraction from complex images.",
    provider: "NVIDIA",
    pricing_model: "freemium",
    tags: ["ocr", "vision", "document-layout", "NVIDIA", "NIM"],
    creator: "NVIDIA Native"
  },
  {
    name: "NVIDIA Cosmos Video & Reasoner",
    url: "https://build.nvidia.com/nvidia/cosmos3-nano-reasoner",
    short_description: "Physics-aware video generation and advanced vision-language understanding models for physical AI.",
    provider: "NVIDIA",
    pricing_model: "freemium",
    tags: ["vision", "video-generation", "physical-ai", "NVIDIA", "NIM"],
    creator: "NVIDIA Native"
  },
  {
    name: "NVIDIA Content Safety",
    url: "https://build.nvidia.com/nvidia/nemotron-3.5-content-safety",
    short_description: "Multilingual and multimodal moderation API for detecting toxic, unsafe, or harmful inputs.",
    provider: "NVIDIA",
    pricing_model: "freemium",
    tags: ["safety", "moderation", "multimodal", "NVIDIA", "NIM"],
    creator: "NVIDIA Native"
  },
  {
    name: "NVIDIA Reranking",
    url: "https://build.nvidia.com/nvidia/llama-nemotron-rerank-1b-v2",
    short_description: "GPU-accelerated RAG retrieval reranker providing search answer relevancy probabilities.",
    provider: "NVIDIA",
    pricing_model: "freemium",
    tags: ["rerank", "retrieval", "rag", "NVIDIA", "NIM"],
    creator: "NVIDIA Native"
  },
  {
    name: "NVIDIA Synthetic Video Detector",
    url: "https://build.nvidia.com/nvidia/synthetic-video-detector",
    short_description: "Deepfake and AI-generated video detection API designed for safety and verification flows.",
    provider: "NVIDIA",
    pricing_model: "freemium",
    tags: ["media-verification", "deepfake-detection", "NVIDIA", "NIM"],
    creator: "NVIDIA Native"
  },
  {
    name: "NVIDIA LipSync & Speaker Tracker",
    url: "https://build.nvidia.com/nvidia/lipsync",
    short_description: "Voice and audio-visual analytics API for automated dubbing, active speaker tracking, and lip syncing.",
    provider: "NVIDIA",
    pricing_model: "freemium",
    tags: ["lipsync", "audio-visual", "broadcast", "NVIDIA", "NIM"],
    creator: "NVIDIA Native"
  },

  // Others
  {
    name: "OpenRouter",
    url: "https://openrouter.ai",
    short_description: "Unified API gateway enabling a single developer key to access 100+ different AI models.",
    provider: "Others",
    pricing_model: "paid",
    tags: ["api-proxy", "llm", "aggregate"],
    creator: "OpenRouter"
  },
  {
    name: "Hugging Face Inference",
    url: "https://huggingface.co/api/inference",
    short_description: "Serverless and dedicated inference endpoints hosting over 100,000 community models.",
    provider: "Others",
    pricing_model: "freemium",
    tags: ["open-source", "inference", "models"],
    creator: "Hugging Face"
  },
  {
    name: "Fireworks AI",
    url: "https://fireworks.ai",
    short_description: "High-performance inference API key server for running open-source LLMs and visual models.",
    provider: "Others",
    pricing_model: "paid",
    tags: ["inference", "llm", "fast"],
    creator: "Fireworks AI"
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

  // Classify a tool's creator/company
  const getCreatorName = (tool: Tool): string => {
    const text = `${tool.name} ${tool.short_description} ${tool.tags.join(" ")}`.toLowerCase();
    if (text.includes("openai") || text.includes("gpt-") || text.includes("dall-e")) return "OpenAI";
    if (text.includes("anthropic") || text.includes("claude")) return "Anthropic";
    if (text.includes("google") || text.includes("gemini") || text.includes("vertex") || text.includes("gemma")) return "Google";
    if (text.includes("meta") || text.includes("llama") || text.includes("codellama")) return "Meta";
    if (text.includes("microsoft") || text.includes("phi")) return "Microsoft";
    if (text.includes("deepseek")) return "DeepSeek";
    if (text.includes("mistral") || text.includes("mixtral") || text.includes("codestral")) return "Mistral AI";
    if (text.includes("groq")) return "Groq";
    if (text.includes("cohere")) return "Cohere";
    if (text.includes("replicate")) return "Replicate";
    if (text.includes("moonshot") || text.includes("kimi")) return "Moonshot AI";
    if (text.includes("zhipu") || text.includes("z-ai") || text.includes("glm")) return "Zhipu AI";
    if (text.includes("nvidia") || text.includes("nemotron") || text.includes("nim")) return "NVIDIA Native";
    return "Others";
  };

  // Classify a tool's provider based on name/description/tags
  const getProviderName = (tool: Tool): string => {
    const text = `${tool.name} ${tool.short_description} ${tool.tags.join(" ")}`.toLowerCase();
    
    // Check if hosted on NVIDIA NIM
    if (
      text.includes("nim)") ||
      text.includes("nvidia nim") ||
      tool.url.includes("build.nvidia.com") ||
      text.includes("nemotron") ||
      text.includes("cosmos3")
    ) {
      return "NVIDIA";
    }

    if (text.includes("openai") || text.includes("gpt-") || text.includes("dall-e")) return "OpenAI";
    if (text.includes("anthropic") || text.includes("claude")) return "Anthropic";
    if (text.includes("google") || text.includes("gemini") || text.includes("vertex")) return "Google";
    if (text.includes("nvidia") || text.includes("nim")) return "NVIDIA";
    if (text.includes("deepseek")) return "DeepSeek";
    if (text.includes("mistral") || text.includes("mixtral") || text.includes("codestral")) return "Mistral";
    if (text.includes("groq")) return "Groq";
    if (text.includes("cohere")) return "Cohere";
    if (text.includes("replicate")) return "Replicate";
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
    const mappedDbTools: ApiBot[] = dbApiTools.map(t => {
      const provider = getProviderName(t);
      const creator = getCreatorName(t);
      
      // Ensure NVIDIA tag is present on all NVIDIA NIM-hosted models
      const finalTags = [...t.tags];
      if (provider === "NVIDIA" && !finalTags.some(tag => tag.toLowerCase() === "nvidia")) {
        finalTags.push("NVIDIA");
      }

      return {
        id: t.id,
        name: t.name,
        url: t.url,
        short_description: t.short_description,
        provider,
        pricing_model: t.pricing_model,
        tags: finalTags,
        click_count: t.click_count,
        creator
      };
    });

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
    const ordered = ["OpenAI", "Anthropic", "Google", "NVIDIA", "DeepSeek", "Mistral", "Groq", "Cohere", "Replicate"];
    const final: string[] = [];
    ordered.forEach(p => {
      if (list.has(p)) {
        final.push(p);
        list.delete(p);
      }
    });
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

  // Group models by Creator Company specifically for the NVIDIA tab
  const groupedNvidiaBots = useMemo(() => {
    if (selectedProvider !== "NVIDIA") return null;
    const groups: Record<string, ApiBot[]> = {};
    filteredBots.forEach(bot => {
      const creator = bot.creator || "Others";
      if (!groups[creator]) groups[creator] = [];
      groups[creator].push(bot);
    });
    return groups;
  }, [filteredBots, selectedProvider]);

  const handleCardClick = (id: string) => {
    if (!id.startsWith("seed-api-")) {
      mockDb.incrementClickCount(id).catch(console.error);
    }
  };

  const renderCard = (bot: ApiBot) => (
    <div
      key={bot.id}
      className="flex flex-col rounded-xl border border-slate-800 bg-[#131B2E] p-6 hover:border-[#8FBF3F]/40 transition-colors duration-[120ms] relative group"
    >
      {/* Header Details */}
      <div className="flex justify-between items-start gap-4 mb-4">
        <div>
          <h3 className="font-serif text-lg font-bold text-white group-hover:text-[#8FBF3F] transition-colors leading-snug">
            {bot.name}
          </h3>
          <span className="font-mono text-[9px] uppercase tracking-wider text-[#8A8F87] font-bold">
            Creator: {bot.creator}
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
        onClick={() => handleCardClick(bot.id)}
        className="w-full flex h-10 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 hover:bg-[#8FBF3F] hover:text-slate-950 hover:border-transparent transition-all duration-200 uppercase tracking-wider font-mono"
      >
        {bot.tags.map(t => t.toLowerCase()).includes("nim") || bot.url.includes("nvidia.com") ? "run_bot \u2192" : "Get API Key \u2192"}
      </Link>
    </div>
  );

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
        <div className="relative w-full max-w-md font-mono group">
          {/* Desktop prefix */}
          <span className="hidden sm:flex absolute inset-y-0 left-3 items-center text-[#8FBF3F] pointer-events-none text-xs font-bold select-none">
            &gt; search_api //
          </span>
          {/* Mobile prefix */}
          <span className="flex sm:hidden absolute inset-y-0 left-3 items-center text-[#8FBF3F] pointer-events-none text-xs font-bold select-none">
            &gt;
          </span>
          <input
            type="text"
            placeholder="Search keys, models, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[#212623] bg-[#0D0F0E] pl-8 sm:pl-36 pr-10 py-2.5 text-xs text-white placeholder-slate-700 outline-none focus:border-[#8FBF3F] focus:shadow-[0_0_12px_rgba(143,191,63,0.15)] hover:border-slate-800 transition-all font-mono"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-white transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-700">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          )}
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

      {/* Content Rendering */}
      {isLoading ? (
        <TerminalLoader message="loading_api_index" />
      ) : filteredBots.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-800 rounded-xl bg-[#0F1423]/30 font-mono">
          <p className="text-slate-500 text-xs">No developer APIs found matching search parameters.</p>
        </div>
      ) : selectedProvider === "NVIDIA" && groupedNvidiaBots ? (
        /* Categorized Group View specifically for NVIDIA NIM Catalog */
        <div className="space-y-12">
          {Object.entries(groupedNvidiaBots).sort(([a], [b]) => {
            // Sort Native models first, others alphabetically
            if (a === "NVIDIA Native") return -1;
            if (b === "NVIDIA Native") return 1;
            return a.localeCompare(b);
          }).map(([company, bots]) => (
            <div key={company} className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-800/60 pb-2">
                <span className="text-[#8FBF3F] font-mono text-sm font-bold">&gt;&gt;</span>
                <h2 className="text-sm font-bold font-mono tracking-wider uppercase text-white">
                  {company} Models
                </h2>
                <span className="text-[10px] text-slate-500 font-mono">
                  ({bots.length} model{bots.length > 1 ? "s" : ""} on NIM)
                </span>
                <div className="flex-1 h-px bg-slate-800/40"></div>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {bots.map(renderCard)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Flat Grid View for Individual Foundation Providers */
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBots.map(renderCard)}
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
