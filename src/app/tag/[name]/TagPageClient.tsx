"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { mockDb, Tool } from "@/data/mockDb";
import ToolCard from "@/components/ToolCard";

export default function TagPageClient() {
  const params = useParams();
  const name = (params?.name as string) || "";
  const tag = decodeURIComponent(name);
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchTools = async () => {
      const results = await mockDb.getToolsByTag(tag);
      if (active) {
        setTools(results);
        setIsLoading(false);
      }
    };
    fetchTools();
    return () => {
      active = false;
    };
  }, [tag]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-[#8FBF3F]" />
      </div>
    );
  }

  return (
    <div className="flex-1 mx-auto max-w-7xl w-full px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6 font-sans">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <span className="text-slate-300">Tag</span>
        <span>/</span>
        <span className="text-[#8FBF3F] font-mono">[{tag}]</span>
      </nav>

      {/* Header */}
      <div className="border-b border-slate-800/80 pb-8 mb-8">
        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#8FBF3F] mb-2 font-mono">
          Tag Index
        </span>
        <h1 className="font-serif text-3xl font-medium tracking-tight text-white sm:text-4xl">
          <span className="font-mono text-[#8FBF3F]">[</span>{tag}<span className="font-mono text-[#8FBF3F]">]</span>
        </h1>
        <p className="text-slate-400 text-base mt-3 max-w-2xl leading-relaxed font-sans">
          {tools.length} tool{tools.length !== 1 ? "s" : ""} indexed across all categories with the <span className="font-mono text-[#8FBF3F]">[{tag}]</span> tag.
        </p>
      </div>

      {/* Tools Grid */}
      {tools.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              categoryName={tool.categories?.name}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[#212623] bg-[#131615]/20 p-12 text-center">
          <h3 className="text-base font-bold text-white mb-2 font-sans">No tools found</h3>
          <p className="text-slate-400 text-xs max-w-xs mx-auto mb-6 font-sans">
            No tools are currently tagged with <span className="font-mono text-[#8FBF3F]">[{tag}]</span>.
          </p>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[#8FBF3F] px-5 text-xs font-semibold text-slate-950 hover:bg-[#7ba235] transition-colors"
          >
            Back to Index
          </Link>
        </div>
      )}
    </div>
  );
}
