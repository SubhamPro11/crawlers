"use client";

import { useState } from "react";
import Link from "next/link";

export default function ApiDocsPage() {
  const [activeTab, setActiveTab] = useState<"tools" | "categories">("tools");
  const [copiedText, setCopiedText] = useState("");

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(""), 2000);
  };

  const sampleCategoriesJson = `[
  {
    "id": "b40b8087-c227-43f5-93d5-a468e6ca80f3",
    "name": "Productivity",
    "slug": "productivity",
    "description": "AI productivity tools to help you focus, manage tasks, and get more done.",
    "created_at": "2026-07-08T16:40:46.682Z"
  },
  {
    "id": "f0db9ac8-f301-435f-9542-9bbc1639f69f",
    "name": "Chatbots",
    "slug": "chatbots",
    "description": "AI chatbots for automating conversations and answering questions.",
    "created_at": "2026-07-08T16:40:46.682Z"
  }
]`;

  const sampleToolsJson = `[
  {
    "id": "a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6",
    "name": "ChatGPT",
    "url": "https://chat.openai.com",
    "short_description": "Advanced conversational assistant by OpenAI.",
    "category_id": "f0db9ac8-f301-435f-9542-9bbc1639f69f",
    "pricing_model": "freemium",
    "tags": ["chatbots", "reasoning", "writing"],
    "click_count": 42,
    "last_crawled_at": "2026-07-13T08:52:16Z",
    "created_at": "2026-07-08T16:40:46.682Z"
  },
  {
    "id": "f5e4d3c2-b1a0-9f8e-7d6c-5b4a3f2e1d0c",
    "name": "Asana",
    "url": "https://asana.com",
    "short_description": "Work management platform to organize and track team work.",
    "category_id": "b40b8087-c227-43f5-93d5-a468e6ca80f3",
    "pricing_model": "freemium",
    "tags": ["productivity", "project-management"],
    "click_count": 15,
    "last_crawled_at": "2026-07-13T08:52:16Z",
    "created_at": "2026-07-12T16:20:00Z"
  }
]`;

  return (
    <div className="flex-1 mx-auto max-w-4xl w-full px-4 py-12 sm:px-6 lg:px-8 font-mono">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <span className="text-slate-300">API Documentation</span>
      </nav>

      {/* Page Header */}
      <div className="border-b border-slate-800/80 pb-6 mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <span className="text-[#8FBF3F]">&gt;</span> crawlers // api
        </h1>
        <p className="text-slate-400 text-sm mt-2">
          Access the directory programmatically. We expose simple JSON endpoints containing all indexed categories and verified tools.
        </p>
      </div>

      {/* Setup Details */}
      <div className="mb-10 space-y-6">
        <h2 className="text-lg font-bold text-white border-l-2 border-[#8FBF3F] pl-3">1. Protocol Specs</h2>
        <div className="rounded-lg border border-slate-800 bg-[#131B2E] p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
            <span className="font-bold text-slate-400 sm:w-28 uppercase">Base URL:</span>
            <span className="bg-[#0D0F0E] px-3 py-1.5 rounded text-white select-all border border-[#212623] w-full sm:w-auto font-semibold">
              https://crawlers.dpdns.org
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
            <span className="font-bold text-slate-400 sm:w-28 uppercase">Format:</span>
            <span className="text-slate-300">application/json</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
            <span className="font-bold text-slate-400 sm:w-28 uppercase">CORS:</span>
            <span className="text-slate-300">Enabled (Access-Control-Allow-Origin: *)</span>
          </div>
        </div>
      </div>

      {/* Endpoints */}
      <div className="mb-10 space-y-8">
        <h2 className="text-lg font-bold text-white border-l-2 border-[#8FBF3F] pl-3">2. API Endpoints</h2>

        {/* Categories Endpoint */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-[#8FBF3F]/15 text-[#8FBF3F] border border-[#8FBF3F]/20">
              GET
            </span>
            <span className="text-sm font-bold text-white">/api/v1/categories</span>
            <span className="text-xs text-slate-500">— Retrieve use-case categories</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Returns a list of all 150+ use-case categories with descriptions and canonical slugs.
          </p>

          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Example Request</span>
            <div className="flex-1 h-px bg-slate-800/80"></div>
          </div>
          
          <div className="relative group">
            <pre className="bg-[#0D0F0E] border border-[#212623] rounded-lg p-4 text-xs text-slate-300 overflow-x-auto select-all">
              curl https://crawlers.dpdns.org/api/v1/categories
            </pre>
            <button
              onClick={() => copyToClipboard("curl https://crawlers.dpdns.org/api/v1/categories", "categories_curl")}
              className="absolute right-3 top-3 px-2 py-1 text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded border border-slate-800 transition-colors"
            >
              {copiedText === "categories_curl" ? "Copied!" : "Copy"}
            </button>
          </div>
          
          <div className="flex justify-end pt-1">
            <Link
              href="/api/v1/categories"
              target="_blank"
              className="text-[10px] text-[#8FBF3F] hover:underline flex items-center gap-1 font-bold"
            >
              Execute Request Live ↗
            </Link>
          </div>
        </div>

        {/* Tools Endpoint */}
        <div className="space-y-3 pt-4 border-t border-slate-800/60">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-[#8FBF3F]/15 text-[#8FBF3F] border border-[#8FBF3F]/20">
              GET
            </span>
            <span className="text-sm font-bold text-white">/api/v1/tools</span>
            <span className="text-xs text-slate-500">— Retrieve active AI tools</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Returns all active/reviewed AI bots, platforms, and command utilities. Includes category details, tags, pricing model, and click metrics.
          </p>

          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Example Request</span>
            <div className="flex-1 h-px bg-slate-800/80"></div>
          </div>
          
          <div className="relative group">
            <pre className="bg-[#0D0F0E] border border-[#212623] rounded-lg p-4 text-xs text-slate-300 overflow-x-auto select-all">
              curl https://crawlers.dpdns.org/api/v1/tools
            </pre>
            <button
              onClick={() => copyToClipboard("curl https://crawlers.dpdns.org/api/v1/tools", "tools_curl")}
              className="absolute right-3 top-3 px-2 py-1 text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded border border-slate-800 transition-colors"
            >
              {copiedText === "tools_curl" ? "Copied!" : "Copy"}
            </button>
          </div>
          
          <div className="flex justify-end pt-1">
            <Link
              href="/api/v1/tools"
              target="_blank"
              className="text-[10px] text-[#8FBF3F] hover:underline flex items-center gap-1 font-bold"
            >
              Execute Request Live ↗
            </Link>
          </div>
        </div>
      </div>

      {/* JSON Payload Explorer */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-white border-l-2 border-[#8FBF3F] pl-3">3. Payload Schema Details</h2>
        
        <div className="border border-slate-800 rounded-xl overflow-hidden shadow-xl shadow-black/25">
          {/* Tabs */}
          <div className="flex border-b border-slate-800 bg-[#131B2E] px-4">
            <button
              onClick={() => setActiveTab("tools")}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
                activeTab === "tools" 
                  ? "border-[#8FBF3F] text-[#8FBF3F]" 
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              [tools.json]
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
                activeTab === "categories" 
                  ? "border-[#8FBF3F] text-[#8FBF3F]" 
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              [categories.json]
            </button>
          </div>

          {/* Code Body */}
          <div className="relative">
            <pre className="bg-[#0D0F0E] p-6 text-xs text-[#8FBF3F]/90 overflow-x-auto leading-relaxed max-h-[350px]">
              <code>{activeTab === "tools" ? sampleToolsJson : sampleCategoriesJson}</code>
            </pre>
            <button
              onClick={() => copyToClipboard(activeTab === "tools" ? sampleToolsJson : sampleCategoriesJson, "payload")}
              className="absolute right-4 top-4 px-2 py-1 text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded border border-slate-800 transition-colors"
            >
              {copiedText === "payload" ? "Copied Payload" : "Copy Schema"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
