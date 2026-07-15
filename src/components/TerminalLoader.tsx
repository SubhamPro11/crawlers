"use client";

import { useState, useEffect } from "react";

interface TerminalLoaderProps {
  message?: string;
}

export function TerminalLoader({ message = "loading_index_data" }: TerminalLoaderProps) {
  const [frame, setFrame] = useState(0);
  const frames = ["[ ▖ ]", "[ ▘ ]", "[ ▝ ]", "[ ▗ ]"];

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % frames.length);
    }, 150);
    return () => clearInterval(interval);
  }, [frames.length]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20 font-mono text-xs text-[#8FBF3F]">
      <div className="flex items-center gap-2 border border-[#212623] bg-[#131615]/80 px-4 py-3 rounded-lg shadow-xl shadow-black/40 select-none">
        <span>&gt; {message}</span>
        <span className="text-[#8FBF3F] font-bold">{frames[frame]}</span>
      </div>
    </div>
  );
}
