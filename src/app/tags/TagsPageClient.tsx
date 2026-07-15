"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { mockDb, Tool, slugify } from "@/data/mockDb";
import TagPageClient from "./[slug]/TagPageClient";

export default function TagsPageClient() {
  const [slug, setSlug] = useState<string>("");
  const [allTags, setAllTags] = useState<string[]>([]);
  const [tagCounts, setTagCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const parts = window.location.pathname.split("/").filter(Boolean);
      // If path is /tags/[slug]
      if (parts.length > 1 && parts[0] === "tags") {
        setSlug(parts[1]);
      } else {
        setSlug("");
      }
    }
  }, []);

  useEffect(() => {
    // Load all tools to compile tag counts and tags list for the index page
    const fetchTagsData = async () => {
      try {
        const tools = await mockDb.getTools();
        const counts: Record<string, number> = {};
        const tagsSet = new Set<string>();

        tools.forEach((tool) => {
          if (tool.tags) {
            tool.tags.forEach((tag) => {
              const trimmed = tag.trim();
              if (trimmed) {
                counts[trimmed] = (counts[trimmed] || 0) + 1;
                tagsSet.add(trimmed);
              }
            });
          }
        });

        const sortedTags = Array.from(tagsSet).sort((a, b) => a.localeCompare(b));
        setAllTags(sortedTags);
        setTagCounts(counts);
      } catch (err) {
        console.error("Error loading tags index:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTagsData();
  }, []);

  // If we resolved a slug from the URL, render the TagPageClient for this slug
  if (slug) {
    return <TagPageClient slug={slug} />;
  }

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
        <span className="text-[#8FBF3F] font-mono">tags</span>
      </nav>

      {/* Header */}
      <div className="border-b border-slate-800/80 pb-8 mb-8 font-sans">
        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#8FBF3F] mb-2 font-mono">
          &gt; tag_index
        </span>
        <h1 className="font-serif text-3xl font-medium tracking-tight text-white sm:text-4xl">
          Tags Directory
        </h1>
        <p className="text-slate-400 text-base mt-3 max-w-2xl leading-relaxed">
          Explore {allTags.length} unique tags and topics index across all curated AI tools.
        </p>
      </div>

      {/* Tags List */}
      <div className="flex flex-wrap gap-3 font-mono text-xs">
        {allTags.map((tag) => {
          const count = tagCounts[tag] || 0;
          return (
            <Link
              key={tag}
              href={`/tags/${slugify(tag)}`}
              className="rounded-lg bg-[#131615] border border-[#212623] hover:border-[#8FBF3F]/35 hover:text-[#8FBF3F] px-4 py-2.5 transition-all flex items-center gap-2 group"
            >
              <span className="text-slate-300 group-hover:text-[#8FBF3F]">[{tag}]</span>
              <span className="text-[10px] text-slate-500 font-bold bg-[#0D0F0E] px-1.5 py-0.5 rounded border border-[#212623]/60 group-hover:border-[#8FBF3F]/25 group-hover:text-[#8FBF3F]/80">
                {count}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
