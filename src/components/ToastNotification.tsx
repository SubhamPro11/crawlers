"use client";

import { useEffect, useState } from "react";

interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "info" | "error";
}

export default function ToastNotification() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type?: "success" | "info" | "error" }>;
      if (!customEvent.detail || !customEvent.detail.message) return;
      const { message, type = "info" } = customEvent.detail;
      const newToast: ToastMessage = {
        id: Math.random().toString(36).substring(2, 9),
        message,
        type,
      };
      setToasts((prev) => [...prev, newToast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 3000);
    };

    window.addEventListener("toast", handleToast as EventListener);
    return () => window.removeEventListener("toast", handleToast as EventListener);
  }, []);

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-5 z-[9999] flex flex-col gap-3 pointer-events-none max-w-xs sm:max-w-sm w-full px-4 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto overflow-hidden rounded-xl border border-white/10 bg-[#161917]/90 backdrop-blur-2xl shadow-2xl shadow-black/80 transition-all duration-300 font-sans"
        >
          {/* macOS Banner Window Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-[#1A1E1C]/80 px-3 py-1.5 select-none">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="h-2.5 w-2.5 rounded-full bg-[#FF5F56] hover:opacity-80 transition-opacity"
                aria-label="Dismiss toast"
              />
              <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#27C93F]" />
              <span className="ml-1.5 font-mono text-[9px] text-slate-400">crawlers // notice</span>
            </div>
            <span className="font-mono text-[9px] text-slate-500">now</span>
          </div>

          {/* Toast Message Body */}
          <div className="flex items-center justify-between px-3.5 py-2.5">
            <span
              className={`text-xs font-medium leading-normal ${
                toast.type === "success"
                  ? "text-[#8FBF3F]"
                  : toast.type === "error"
                  ? "text-red-400"
                  : "text-slate-200"
              }`}
            >
              {toast.message}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
