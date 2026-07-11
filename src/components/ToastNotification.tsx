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
    <div className="fixed bottom-20 sm:bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center justify-between rounded-lg border px-4 py-3 text-xs font-mono shadow-xl transition-all duration-300 pointer-events-auto bg-[#0E100F] ${
            toast.type === "success"
              ? "border-[#8FBF3F]/30 text-[#8FBF3F] shadow-[#8FBF3F]/5"
              : toast.type === "error"
              ? "border-red-500/30 text-red-400 shadow-red-500/5"
              : "border-slate-800 text-slate-300 shadow-black/40"
          }`}
        >
          <span>{toast.message}</span>
          <button
            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            className="ml-3 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
