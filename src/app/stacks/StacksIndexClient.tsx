"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchAllStacks, fetchStackBySlug, Stack } from "@/lib/stacks";
import { TerminalLoader } from "@/components/TerminalLoader";

export default function StacksIndexClient() {
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const list = await fetchAllStacks();
      const detailed = await Promise.all(
        list.map(async (s) => {
          const full = await fetchStackBySlug(s.slug);
          return full || s;
        })
      );
      setStacks(detailed);
      setIsLoading(false);
    }
    loadData();
  }, []);

  if (isLoading) {
    return <TerminalLoader message="loading_editorial_stacks" />;
  }

  return (
    <div className="flex-1 mx-auto max-w-7xl w-full px-4 py-12 sm:px-6 lg:px-8 font-sans">
      {/* Header */}
      <div className="border-b border-[#212623] pb-8 mb-10">
        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider text-[#8FBF3F] mb-2">
          &gt; editorial_stacks //
        </span>
        <h1 className="font-serif text-3xl font-medium tracking-tight text-white sm:text-4xl">
          Workflow Stacks
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-3 max-w-2xl leading-relaxed">
          Curated multi-tool combinations tailored for specific outcomes, roles, and developer workflows.
        </p>
      </div>

      {/* Stacks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stacks.map((stack) => (
          <Link
            key={stack.id}
            href={`/stacks/${stack.slug}`}
            className="group relative flex flex-col justify-between rounded-xl border border-[#212623] bg-[#131615] p-6 hover:border-[#8FBF3F]/40 transition-colors duration-200"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8FBF3F] bg-[#8FBF3F]/10 border border-[#8FBF3F]/20 px-2 py-0.5 rounded">
                  editorial_stack
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {stack.items?.length || 3} tools
                </span>
              </div>

              <h3 className="font-serif text-xl font-medium text-white group-hover:text-[#8FBF3F] transition-colors leading-snug mb-3">
                {stack.title}
              </h3>

              <p className="text-slate-400 text-xs leading-relaxed line-clamp-3 mb-4">
                {stack.description.replace(/<!--[\s\S]*?-->/g, "").trim()}
              </p>

              {/* Roles / Tools list tags */}
              {stack.items && stack.items.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-6 font-mono text-[10px]">
                  {stack.items.map((item, idx) => (
                    <span
                      key={idx}
                      className="rounded bg-[#0D0F0E] border border-[#212623] px-2 py-0.5 text-slate-300"
                    >
                      {item.role_label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-[#212623]/60 pt-4 mt-auto text-xs font-mono">
              <span className="text-slate-500">
                {stack.published_at ? new Date(stack.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "verified"}
              </span>
              <span className="text-[#8FBF3F] font-bold group-hover:translate-x-1 transition-transform">
                Explore Stack &rarr;
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
