"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { mockDb, Tool } from "@/data/mockDb";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ToolDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [tool, setTool] = useState<Tool | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchToolData = useCallback(async () => {
    const t = await mockDb.getToolById(id);
    if (t) {
      setTool(t);
      setCategoryName(t.categories?.name || "");
      setCategorySlug(t.categories?.slug || "");
    }
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    fetchToolData();
  }, [fetchToolData]);

  const handleVisit = async () => {
    if (tool) {
      await mockDb.incrementClickCount(tool.id);
      fetchToolData(); // Reload to update click count
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-[#8FBF3F]" />
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="flex-1 mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Tool Not Found</h1>
        <p className="text-slate-400 mb-8">The AI tool you are searching for is not registered in our database.</p>
        <Link 
          href="/" 
          className="inline-flex h-10 items-center justify-center rounded-lg bg-[#8FBF3F] px-5 text-sm font-semibold text-slate-950 hover:bg-[#7ba235] transition-colors"
        >
          Go Back Home
        </Link>
      </div>
    );
  }

  const pricingLabels = {
    free: "Free to Use",
    freemium: "Freemium (Free with paid tiers)",
    paid: "Paid / Subscription Only",
    unknown: "Pricing Unspecified"
  };

  const getPricingColor = (pricing: string) => {
    switch (pricing) {
      case "free": return "text-emerald-400 border-emerald-500/20 bg-emerald-500/10";
      case "freemium": return "text-amber-400 border-amber-500/20 bg-amber-500/10";
      case "paid": return "text-cyan-400 border-cyan-500/20 bg-cyan-500/10";
      default: return "text-slate-400 border-slate-500/20 bg-slate-500/10";
    }
  };

  // Generate unique gradient based on name
  const getGradient = (name: string) => {
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      "from-[#8FBF3F] to-[#06B6D4]",
      "from-[#3B82F6] to-[#8B5CF6]",
      "from-[#EC4899] to-[#F43F5E]",
      "from-[#F59E0B] to-[#EF4444]",
    ];
    return colors[hash % colors.length];
  };

  return (
    <div className="flex-1 mx-auto max-w-4xl w-full px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-8 font-sans">
        <Link href="/" className="hover:text-white transition-colors font-sans">Home</Link>
        <span>/</span>
        {categorySlug && (
          <>
            <Link href={`/category/${categorySlug}`} className="hover:text-white transition-colors capitalize font-sans">
              {categoryName}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-slate-300 font-sans">{tool.name}</span>
      </nav>

      {/* Main Detail Card */}
      <div className="rounded-2xl border border-[#212623] bg-[#131615] p-6 sm:p-10 shadow-2xl shadow-black/25 font-sans">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-800/80">
          
          {/* Logo & Basic Info */}
          <div className="flex items-center gap-4">
            <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${getGradient(tool.name)} text-white font-extrabold text-2xl shadow-lg`}>
              {tool.name.charAt(0)}
            </div>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-medium text-white tracking-tight">
                {tool.name}
              </h1>
              {categoryName && (
                <Link 
                  href={`/category/${categorySlug}`}
                  className="inline-block text-xs font-semibold text-[#8FBF3F] hover:underline uppercase tracking-wider mt-1 font-mono"
                >
                  {categoryName}
                </Link>
              )}
            </div>
          </div>

          {/* Visit CTA */}
          <div>
            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleVisit}
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#8FBF3F] hover:bg-[#7ba235] px-6 text-sm font-bold text-slate-950 transition-all duration-200 shadow-md shadow-[#8FBF3F]/15 group"
            >
              <span>Visit Official Website</span>
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
          {/* Left Column: Description & Tags */}
          <div className="md:col-span-2 space-y-6 font-sans">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                About the Platform
              </h3>
              <p className="text-slate-300 text-[16px] leading-relaxed">
                {tool.short_description}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Associated Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {tool.tags.map((tag, idx) => (
                  <span 
                    key={`${tag}-${idx}`} 
                    className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-slate-300 font-mono"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Meta Info Card */}
          <div className="rounded-xl bg-[#0b0f17] p-5 border border-slate-800/80 h-fit space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/60 pb-2">
              Metadata & Stats
            </h3>
            
            {/* Pricing */}
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Pricing Model</div>
              <span className={`inline-block rounded px-2.5 py-0.5 text-xs font-semibold border ${getPricingColor(tool.pricing_model)}`}>
                {pricingLabels[tool.pricing_model]}
              </span>
            </div>

            {/* Link Status */}
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Link Status</div>
              <div className="text-xs font-semibold text-white flex items-center gap-1.5 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-[#8FBF3F]" />
                <span>active_connection</span>
              </div>
            </div>

            {/* Discovery Source */}
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">Indexing Source</div>
              <span className="text-xs text-slate-300 capitalize">{tool.source.replace("_", " ")}</span>
            </div>

            {/* Last Crawled */}
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">Last Sync</div>
              <span className="text-xs text-slate-300">
                {new Date(tool.last_crawled_at).toLocaleDateString(undefined, { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Compliance Footer */}
        <div className="mt-8 border-t border-slate-800/80 pt-6 text-center">
          <p className="text-[10px] text-slate-500 leading-normal max-w-xl mx-auto font-sans">
            This entry was automatically aggregated and paraphrased to ensure Robots.txt compliance and copyright standards. Clicking &quot;Visit Official Website&quot; redirects you to the direct external platform in compliance with link-out conventions.
          </p>
        </div>
      </div>
    </div>
  );
}
