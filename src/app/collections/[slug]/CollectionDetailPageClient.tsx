"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { mockDb, Collection, Tool } from "@/data/mockDb";
import ToolCard from "@/components/ToolCard";
import { TerminalLoader } from "@/components/TerminalLoader";

export default function CollectionDetailPageClient({ slug }: { slug: string }) {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(slug));

  const fetchCollectionData = useCallback(async () => {
    if (!slug) return;
    const res = await mockDb.getCollectionBySlug(slug);
    setCollection(res.collection);
    setTools(res.tools);
    setIsLoading(false);
  }, [slug]);

  useEffect(() => {
    let active = true;
    if (!slug) return;
    Promise.resolve().then(() => {
      if (active) {
        fetchCollectionData();
      }
    });
    return () => {
      active = false;
    };
  }, [slug, fetchCollectionData]);

  if (isLoading) {
    return <TerminalLoader message="querying_collection_index" />;
  }

  if (!collection) {
    return (
      <div className="flex-1 mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 text-center font-sans">
        <h1 className="text-2xl font-bold text-white mb-2 font-serif">Collection Not Found</h1>
        <p className="text-slate-400 text-xs max-w-md mx-auto mb-8 font-sans">
          The requested collection does not exist in our directory.
        </p>
        <Link 
          href="/collections" 
          className="inline-flex h-11 items-center justify-center rounded-lg bg-[#8FBF3F] px-5 text-xs font-semibold text-slate-950 hover:bg-[#7ba235] transition-colors"
        >
          View All Collections
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
        <Link href="/collections" className="hover:text-white transition-colors">Collections</Link>
        <span>/</span>
        <span className="text-[#8FBF3F] font-mono">{collection.title}</span>
      </nav>

      {/* Header Info */}
      <div className="border-b border-slate-800/80 pb-8 mb-8 font-sans">
        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#8FBF3F] mb-2 font-mono">
          &gt; collection // {collection.slug}
        </span>
        <h1 className="font-serif text-3xl font-medium tracking-tight text-white sm:text-4xl">
          {collection.title}
        </h1>
        <p className="text-slate-400 text-base mt-3 max-w-2xl leading-relaxed font-sans">
          {collection.description}
        </p>
      </div>

      {/* Tools Grid / Awaiting Curation State */}
      {tools.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              categoryName={tool.categories?.name}
              onRefresh={fetchCollectionData}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col justify-between rounded-xl border border-[#212623] bg-[#131615] p-5 font-mono min-h-[200px]">
            <div>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-[#212623] bg-[#0D0F0E] text-[#8FBF3F] font-mono font-bold text-xs shadow-inner">
                    &gt;_
                  </div>
                  <div>
                    <h3 className="font-mono text-xs font-bold text-[#8FBF3F] tracking-wider uppercase">
                      &gt; awaiting_curation
                    </h3>
                    <span className="font-mono text-[9px] tracking-wider text-slate-500 uppercase">
                      [status: pending_tool_list]
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-4 font-sans">
                Tool entries for this collection will be updated soon. Check back shortly!
              </p>
            </div>
            <div className="pt-3 border-t border-[#212623]/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>crawlers // editorial</span>
              <span className="text-[#8FBF3F]/70 animate-pulse">● active</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
