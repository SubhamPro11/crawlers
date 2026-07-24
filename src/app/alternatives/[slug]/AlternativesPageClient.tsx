"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { mockDb, Tool, slugify } from "@/data/mockDb";
import ToolCard from "@/components/ToolCard";
import { TerminalLoader } from "@/components/TerminalLoader";

export default function AlternativesPageClient({ slug }: { slug: string }) {
  const [targetTool, setTargetTool] = useState<Tool | null>(null);
  const [categoryName, setCategoryName] = useState<string>("");
  const [categorySlug, setCategorySlug] = useState<string>("");
  const [alternatives, setAlternatives] = useState<Tool[]>([]);
  const [totalCategoryCount, setTotalCategoryCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    if (!slug) {
      setIsLoading(false);
      return;
    }

    const res = await mockDb.getAlternativesForTool(slug);
    setTargetTool(res.targetTool);
    setCategoryName(res.categoryName);
    setCategorySlug(res.targetTool?.categories?.slug || "");
    setAlternatives(res.alternatives);
    setTotalCategoryCount(res.totalCategoryCount);
    setIsLoading(false);
  }, [slug]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return <TerminalLoader message="querying_alternatives_index" />;
  }

  // Do NOT render page content if tool is not found, category has < 3 tools, or 0 alternatives exist
  if (!targetTool || totalCategoryCount < 3 || alternatives.length === 0) {
    return (
      <div className="flex-1 mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 text-center font-sans">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-[#212623] bg-[#0D0F0E] text-[#8FBF3F] font-mono text-sm font-bold mb-4">
          &gt;_
        </div>
        <h1 className="text-2xl font-bold text-white mb-2 font-serif">
          Alternatives Page Unavailable
        </h1>
        <p className="text-slate-400 text-xs max-w-md mx-auto mb-8 font-sans leading-relaxed">
          Alternatives pages are only generated for tools in categories with 3 or more indexed tools.
          {targetTool ? ` "${targetTool.name}" belongs to a category with fewer than 3 tools.` : " The specified tool was not found in the directory."}
        </p>
        <Link 
          href="/" 
          className="inline-flex h-11 items-center justify-center rounded-lg bg-[#8FBF3F] px-5 text-xs font-semibold text-slate-950 hover:bg-[#7ba235] transition-colors font-sans"
        >
          Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 mx-auto max-w-7xl w-full px-4 py-12 sm:px-6 lg:px-8 font-sans">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6 font-sans">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        {categorySlug && (
          <>
            <Link href={`/category/${categorySlug}`} className="hover:text-white transition-colors capitalize">
              {categoryName}
            </Link>
            <span>/</span>
          </>
        )}
        <Link href={`/tool/${targetTool.id}`} className="hover:text-white transition-colors">
          {targetTool.name}
        </Link>
        <span>/</span>
        <span className="text-[#8FBF3F] font-mono">Alternatives</span>
      </nav>

      {/* Header Info */}
      <div className="border-b border-slate-800/80 pb-8 mb-8 font-sans">
        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#8FBF3F] mb-2 font-mono">
          &gt; alternatives // {slugify(targetTool.name)}
        </span>
        <h1 className="font-serif text-3xl font-medium tracking-tight text-white sm:text-4xl">
          Alternatives to {targetTool.name}
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-3 max-w-2xl leading-relaxed font-sans">
          Looking for alternatives to <span className="text-white font-medium">{targetTool.name}</span>? Here are {alternatives.length} other <span className="text-white font-medium">{categoryName}</span> tools indexed on Crawlers.
        </p>
      </div>

      {/* Alternatives Tool Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {alternatives.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            categoryName={categoryName}
            onRefresh={loadData}
          />
        ))}
      </div>
    </div>
  );
}
