"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Tool, Category } from "@/data/mockDb";

interface HomepageExtensionsProps {
  totalTools: number;
  totalCategories: number;
  lastUpdated?: string;
}

export function WhyCrawlers({ totalTools, totalCategories, lastUpdated }: HomepageExtensionsProps) {
  const [displayTools, setDisplayTools] = useState(totalTools);
  const [displayCategories, setDisplayCategories] = useState(totalCategories);
  const [hasTriggered, setHasTriggered] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDisplayTools(totalTools);
    setDisplayCategories(totalCategories);
    setHasTriggered(true);
  }, [totalTools, totalCategories]);

  useEffect(() => {
    if (hasTriggered) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        // Start count-up animation
        let startTimestamp: number | null = null;
        const duration = 800; // 800ms

        const step = (timestamp: number) => {
          if (!startTimestamp) startTimestamp = timestamp;
          const elapsed = timestamp - startTimestamp;
          const progress = Math.min(elapsed / duration, 1);

          // Ease-out cubic: f(t) = 1 - (1-t)^3
          const easeOut = 1 - Math.pow(1 - progress, 3);

          setDisplayTools(Math.floor(easeOut * totalTools));
          setDisplayCategories(Math.floor(easeOut * totalCategories));

          if (progress < 1) {
            window.requestAnimationFrame(step);
          } else {
            setDisplayTools(totalTools);
            setDisplayCategories(totalCategories);
            setHasTriggered(true);
          }
        };

        window.requestAnimationFrame(step);
        observer.disconnect();
      }
    }, { threshold: 0.1 });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [hasTriggered, totalTools, totalCategories]);

  const stats = [
    { 
      value: hasTriggered ? (displayTools > 0 ? displayTools.toLocaleString() : "...") : "0", 
      label: "AI tools listed",
      isNumeric: true
    },
    { 
      value: hasTriggered ? (displayCategories > 0 ? displayCategories.toLocaleString() : "...") : "0", 
      label: "Use-case categories",
      isNumeric: true
    },
    { value: "Direct Link", label: "No embeds or iframes", isNumeric: false },
    { value: lastUpdated || "today", label: "Last updated", isDate: true, isNumeric: false }
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 border-b border-slate-900 font-sans">
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <h2 className="font-serif text-2xl font-medium tracking-tight text-white">
          Why Crawlers?
        </h2>
        <p className="text-slate-400 text-sm mt-2">
          An AI tools directory organized by **use case**, not by brand. Monospace style, curated listings, link-out only.
        </p>
      </div>

      {/* Trust Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="border border-[#212623] border-l-2 border-l-[#8FBF3F] bg-[#131615]/30 rounded-xl p-6">
          <div className="text-[#8FBF3F] font-mono text-xs uppercase mb-2">&gt; curated_listings</div>
          <h3 className="text-white font-bold text-base mb-2 font-serif">Original Paraphrasing</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Crawlers checks robots.txt, and paraphrases marketing copy in original words to avoid copyright issues. We index tools by tasks, not by brand logos.
          </p>
        </div>

        <div className="border border-[#212623] border-l-2 border-l-[#8FBF3F] bg-[#131615]/30 rounded-xl p-6">
          <div className="text-[#8FBF3F] font-mono text-xs uppercase mb-2">&gt; direct_connection</div>
          <h3 className="text-white font-bold text-base mb-2 font-serif">No Embeds or Iframes</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            We prioritize user speed and security. No annoying trackers, iframe embeds, or proxies. Click-out only, leading you directly to the original bot.
          </p>
        </div>

        <div className="border border-[#212623] border-l-2 border-l-[#8FBF3F] bg-[#131615]/30 rounded-xl p-6">
          <div className="text-[#8FBF3F] font-mono text-xs uppercase mb-2">&gt; free_index</div>
          <h3 className="text-white font-bold text-base mb-2 font-serif">Completely Free</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            No registration or paywall required to browse lists. Save favorites locally and submit new discoveries directly to the queue.
          </p>
        </div>
      </div>

      {/* Statistics Counters */}
      <div 
        ref={containerRef}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 rounded-xl border border-[#212623]/80 bg-[#131615]/40 text-center"
      >
        {stats.map((s, idx) => (
          <div 
            key={idx} 
            className={`space-y-1 transition-opacity duration-500 flex flex-col justify-center items-center py-2 ${
              !s.isNumeric && !hasTriggered ? "opacity-0" : "opacity-100"
            }`}
          >
            <div className={`text-xl xs:text-2xl sm:text-3xl font-bold font-serif ${s.isDate ? "text-white/80 text-base sm:text-2xl" : "text-[#8FBF3F]"}`}>
              {s.value}
            </div>
            <div className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-slate-500">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
