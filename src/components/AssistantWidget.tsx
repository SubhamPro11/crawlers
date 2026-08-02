"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const suggestions = [
    { text: "Need a coding AI?", query: "coding assistant" },
    { text: "Looking for image generation?", query: "image generator" },
    { text: "Find LLM benchmarks?", query: "leaderboards" },
    { text: "AI translator utilities?", query: "translation" }
  ];

  const handleSuggestionClick = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent("toast", { detail: { message: `Searching for "${query}"`, type: "success" } }));
  };

  return (
    <div className="fixed bottom-24 md:bottom-6 right-6 z-40 font-mono">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-[#8FBF3F]/40 bg-[#0D0F0E] text-[#8FBF3F] shadow-lg shadow-[#8FBF3F]/10 hover:border-[#8FBF3F] hover:shadow-[#8FBF3F]/25 hover:scale-105 transition-all duration-300 relative group"
        aria-label="AI Assistant"
      >
        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#8FBF3F] shadow-[0_0_8px_rgba(143,191,63,0.8)]"></span>
        </span>
        <svg className="h-5 w-5 group-hover:rotate-6 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {/* Suggestion Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 overflow-hidden rounded-2xl border border-white/10 bg-[#161917]/90 backdrop-blur-2xl p-4 shadow-2xl shadow-black/80 animate-fade-in font-sans">
          {/* macOS Window Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-[#1A1E1C]/80 -mx-4 -mt-4 px-4 py-2 mb-3 select-none">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsOpen(false)}
                className="h-3 w-3 rounded-full bg-[#FF5F56] hover:opacity-80 transition-opacity"
                aria-label="Close assistant panel"
              />
              <span className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
              <span className="h-3 w-3 rounded-full bg-[#27C93F]" />
              <span className="ml-2 font-mono text-[10px] text-[#8FBF3F]">&gt; run_assistant //</span>
            </div>
            <span className="font-mono text-[10px] text-slate-500">v1.4</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            How can I help you find the right AI tool today? Try one of my quick filters below:
          </p>

          {/* Suggestion list */}
          <div className="flex flex-col gap-2">
            {suggestions.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(sug.query)}
                className="w-full text-left rounded-xl border border-white/5 hover:border-[#8FBF3F]/40 bg-white/[0.03] hover:bg-[#8FBF3F]/10 px-3.5 py-2.5 text-xs text-slate-200 hover:text-[#8FBF3F] transition-all duration-150"
              >
                {sug.text}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
