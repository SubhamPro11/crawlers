"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchStackBySlug, Stack } from "@/lib/stacks";
import ToolCard from "@/components/ToolCard";
import { TerminalLoader } from "@/components/TerminalLoader";
import { Tool } from "@/data/mockDb";

interface StackDetailPageClientProps {
  slug: string;
  initialStack?: Stack | null;
}

export default function StackDetailPageClient({
  slug,
  initialStack = null,
}: StackDetailPageClientProps) {
  const [stack, setStack] = useState<Stack | null>(initialStack);
  const [isLoading, setIsLoading] = useState<boolean>(!initialStack && Boolean(slug));

  useEffect(() => {
    if (!initialStack && slug) {
      fetchStackBySlug(slug).then((res) => {
        setStack(res);
        setIsLoading(false);
      });
    }
  }, [slug, initialStack]);

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
  const tools: Tool[] = (stack.items || []).map(i => i.tool).filter((t): t is Tool => Boolean(t));

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
        <div className="flex flex-wrap items-center gap-2 mb-3 font-mono">
          <span className="rounded-full bg-[#8FBF3F]/10 border border-[#8FBF3F]/30 px-3 py-1 text-xs font-mono font-bold text-[#8FBF3F]">
            Workflow Stack
          </span>
          {hasPlaceholder && (
            <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-mono text-amber-400">
              Editorial Collection
            </span>
          )}
        </div>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {stack.title}
        </h1>
        <p className="text-slate-400 text-sm max-w-3xl leading-relaxed mt-3">
          {cleanDescription}
        </p>
      </div>

      {/* Tools in Stack */}
      <div className="space-y-6">
        <h2 className="font-serif text-xl font-bold text-white">
          Included Tools ({tools.length})
        </h2>
        {tools.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} categoryName={tool.categories?.name} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center border border-[#212623] rounded-xl bg-[#131615]">
            <p className="text-slate-400 text-sm font-mono">No tools indexed in this stack yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
