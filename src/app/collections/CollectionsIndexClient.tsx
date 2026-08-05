"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { mockDb, Collection } from "@/data/mockDb";
import { TerminalLoader } from "@/components/TerminalLoader";

interface CollectionsIndexClientProps {
  initialCollections?: Collection[];
}

export default function CollectionsIndexClient({ initialCollections = [] }: CollectionsIndexClientProps) {
  const [collections, setCollections] = useState<Collection[]>(initialCollections);
  const [isLoading, setIsLoading] = useState<boolean>(!initialCollections.length);

  useEffect(() => {
    if (!initialCollections.length) {
      let ignore = false;
      async function fetchData() {
        const data = await mockDb.getCollections();
        if (!ignore) {
          setCollections(data);
          setIsLoading(false);
        }
      }
      fetchData();
      return () => {
        ignore = true;
      };
    }
  }, [initialCollections.length]);

  if (isLoading) {
    return <TerminalLoader message="loading_curated_collections" />;
  }

  return (
    <div className="flex-1 mx-auto max-w-7xl w-full px-4 py-12 sm:px-6 lg:px-8 font-sans">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6 font-sans">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <span className="text-[#8FBF3F] font-mono">Collections</span>
      </nav>

      {/* Header Info */}
      <div className="border-b border-slate-800/80 pb-8 mb-8 font-sans">
        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#8FBF3F] mb-2 font-mono">
          &gt; curated_collections // editorial_index
        </span>
        <h1 className="font-serif text-3xl font-medium tracking-tight text-white sm:text-4xl">
          Curated AI Stacks & Pipelines
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-3 max-w-2xl leading-relaxed font-sans">
          Editorial collections grouping top-tier AI tools across categories for specific workflows, founder stacks, and creative pipelines.
        </p>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((col) => {
          const count = col.tool_ids ? col.tool_ids.length : 0;
          return (
            <Link
              key={col.id}
              href={`/collections/${col.slug}`}
              className="group relative flex flex-col justify-between rounded-xl border border-[#212623] bg-[#131615]/50 p-6 hover:bg-[#131615] hover:border-[#8FBF3F]/40 transition-colors duration-[120ms]"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded border border-[#212623] bg-[#0D0F0E] text-[#8FBF3F] font-mono font-bold text-xs mb-4 group-hover:border-[#8FBF3F]/40 transition-colors">
                  &gt;_
                </div>
                <h2 className="font-serif text-xl font-medium text-white group-hover:text-[#8FBF3F] transition-colors leading-tight mb-2">
                  {col.title}
                </h2>
                <p className="text-slate-400 text-xs leading-relaxed font-sans line-clamp-3 mb-4">
                  {col.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#212623]/60 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">
                  {count === 0 ? "[status: curated_queue]" : `${count} tools`}
                </span>
                <span className="text-[#8FBF3F] opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                  Explore &rarr;
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
