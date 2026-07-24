"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { mockDb, Tool } from "@/data/mockDb";
import { TerminalLoader } from "@/components/TerminalLoader";
import ToolCard from "@/components/ToolCard";

export default function ChangelogClient() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchChangelogData = useCallback(async () => {
    const allTools = await mockDb.getTools();
    // Sort tools descending by created_at date
    const sorted = [...allTools].sort(
      (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );
    setTools(sorted);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchChangelogData();
  }, [fetchChangelogData]);

  const groupedChangelog = useMemo(() => {
    const groups: Record<string, Tool[]> = {};

    tools.forEach((tool) => {
      const dateObj = tool.created_at ? new Date(tool.created_at) : new Date();
      const dateLabel = isNaN(dateObj.getTime())
        ? "Recently Added"
        : dateObj.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
          });

      if (!groups[dateLabel]) {
        groups[dateLabel] = [];
      }
      groups[dateLabel].push(tool);
    });

    return Object.entries(groups).map(([dateLabel, tools]) => ({
      dateLabel,
      tools
    }));
  }, [tools]);

  if (isLoading) {
    return <TerminalLoader message="querying_changelog_history" />;
  }

  return (
    <div className="flex-1 mx-auto max-w-7xl w-full px-4 py-12 sm:px-6 lg:px-8 font-sans">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6 font-sans">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <span className="text-[#8FBF3F] font-mono">Changelog</span>
      </nav>

      {/* Header Info */}
      <div className="border-b border-slate-800/80 pb-8 mb-8 font-sans">
        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#8FBF3F] mb-2 font-mono">
          &gt; changelog // index_updates
        </span>
        <h1 className="font-serif text-3xl font-medium tracking-tight text-white sm:text-4xl">
          Directory Changelog
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-3 max-w-2xl leading-relaxed font-sans">
          Historical log of new AI tools, command utilities, and extensions verified and added to the Crawlers directory index.
        </p>
      </div>

      {/* Changelog Timeline / Date Groups */}
      <div className="space-y-12">
        {groupedChangelog.map((group) => (
          <div key={group.dateLabel} className="space-y-6">
            <div className="flex items-center gap-3 border-b border-[#212623] pb-3">
              <span className="h-2 w-2 rounded-full bg-[#8FBF3F]" />
              <h2 className="font-mono text-sm font-bold text-[#8FBF3F] tracking-wider uppercase">
                &gt; {group.dateLabel}
              </h2>
              <span className="font-mono text-xs text-slate-500">
                // {group.tools.length} tool{group.tools.length !== 1 ? "s" : ""} indexed
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {group.tools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  categoryName={tool.categories?.name}
                  onRefresh={fetchChangelogData}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
