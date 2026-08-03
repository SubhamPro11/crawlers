"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { fetchStackBySlug, Stack } from "@/lib/stacks";
import ToolCard from "@/components/ToolCard";
import { TerminalLoader } from "@/components/TerminalLoader";

export default function StackDetailPageClient({ slug }: { slug: string }) {
  const [stack, setStack] = useState<Stack | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStack = useCallback(async () => {
    if (!slug) {
      setIsLoading(false);
      return;
    }
    const res = await fetchStackBySlug(slug);
    setStack(res);
    setIsLoading(false);
  }, [slug]);

  useEffect(() => {
    loadStack();
  }, [loadStack]);

  if (isLoading) {
    return <TerminalLoader message="loading_workflow_stack" />;
  }

  if (!stack) {
    return (
      <div className="flex-1 mx-auto max-w-7xl px-4 py-24 text-center font-sans">
        <h1 className="text-3xl font-bold text-white mb-4">Stack Not Found</h1>
        <p className="text-slate-400 mb-8">The workflow stack you are looking for does not exist.</p>
        <Link
          href="/stacks"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-[#8FBF3F] px-5 text-sm font-semibold text-slate-950 hover:bg-[#7ba235] transition-colors"
        >
          Browse All Stacks
        </Link>
      </div>
    );
  }

  const cleanDescription = stack.description.replace(/<!--[\s\S]*?-->/g, "").trim();
  const hasPlaceholder = stack.description.includes("TODO:");

  return (
    <div className="flex-1 mx-auto max-w-7xl w-full px-4 py-12 sm:px-6 lg:px-8 font-sans">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <Link href="/stacks" className="hover:text-white transition-colors">Stacks</Link>
        <span>/</span>
        <span className="text-slate-300">{stack.title}</span>
      </nav>

      {/* Header Info */}
      <div className="border-b border-[#212623] pb-8 mb-10">
        <div className="flex items-center gap-2 mb-3 font-mono text-xs font-bold text-[#8FBF3F]">
          <span>&gt; editorial_stack //</span>
          <span className="text-slate-500 font-normal">[{stack.items?.length || 0} tools]</span>
        </div>
        <h1 className="font-serif text-3xl font-medium tracking-tight text-white sm:text-4xl">
          {stack.title}
        </h1>
        <p className="text-slate-300 text-base sm:text-lg mt-4 max-w-3xl leading-relaxed">
          {cleanDescription}
        </p>

        {/* TODO Marker for Cryo Editorial Copy */}
        {hasPlaceholder && (
          <div className="mt-4 inline-flex items-center gap-2 rounded border border-[#E8A33D]/30 bg-[#E8A33D]/10 px-3 py-1.5 text-xs font-mono text-[#E8A33D]">
            <span>⚠ TODO: Cryo editorial blurb placeholder — content to be written by Cryo</span>
          </div>
        )}
      </div>

      {/* Stack Items Section */}
      <div className="space-y-10">
        <h2 className="font-serif text-2xl font-medium text-white flex items-center gap-2">
          <span>Tools in this Stack</span>
        </h2>

        {stack.items && stack.items.length > 0 ? (
          <div className="space-y-8">
            {stack.items.map((item, idx) => (
              <div
                key={item.tool_id || idx}
                className="rounded-2xl border border-[#212623] bg-[#131615] p-6 sm:p-8 space-y-6"
              >
                {/* Role Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#212623]/80 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#8FBF3F]/30 bg-[#8FBF3F]/10 text-[#8FBF3F] font-mono text-xs font-bold">
                      0{idx + 1}
                    </span>
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#8FBF3F] bg-[#8FBF3F]/10 border border-[#8FBF3F]/20 px-2.5 py-1 rounded">
                      [{item.role_label}]
                    </span>
                  </div>
                  {item.tool && (
                    <Link
                      href={`/tool/${item.tool.id}`}
                      className="text-xs font-mono text-slate-400 hover:text-[#8FBF3F] transition-colors self-start sm:self-auto"
                    >
                      View Tool Detail &rarr;
                    </Link>
                  )}
                </div>

                {/* Tool Details / Card */}
                {item.tool ? (
                  <div className="max-w-xl">
                    <ToolCard tool={item.tool} categoryName={item.tool.categories?.name} />
                  </div>
                ) : (
                  <div className="text-xs font-mono text-slate-500 py-4">
                    Tool item pending linkage [ID: {item.tool_id}]
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-[#131615] border border-[#212623] rounded-xl text-slate-500 text-xs font-mono">
            no_items_in_stack
          </div>
        )}
      </div>
    </div>
  );
}
