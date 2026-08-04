"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { Sparkles, Bookmark, Cpu, ShieldCheck, ArrowRight, X } from "lucide-react";

export default function MacSignInModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const handleClose = useCallback(() => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsOpen(false);
      sessionStorage.setItem("crawlers_mac_signin_dismissed", "true");
    }, 200);
  }, []);

  useEffect(() => {
    // 1. Fetch user session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setIsOpen(false);
        setIsAnimating(false);
      }
    });

    // 2. Auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const activeUser = session?.user ?? null;
      setUser(activeUser);
      if (activeUser) {
        setIsOpen(false);
        setIsAnimating(false);
      }
    });

    // 3. Custom event trigger
    const handleOpen = () => {
      if (user) return;
      setIsOpen(true);
      setTimeout(() => setIsAnimating(true), 10);
    };

    window.addEventListener("open-signin-modal", handleOpen);

    // Auto-prompt after 12 seconds if not previously dismissed in session
    const timer = setTimeout(() => {
      const dismissed = sessionStorage.getItem("crawlers_mac_signin_dismissed");
      const hasToken = document.cookie.includes("sb-") || localStorage.getItem("crawlers_favorites");
      
      // Only auto-show if not dismissed this session
      if (!dismissed && !hasToken && !user) {
        setIsOpen(true);
        setTimeout(() => setIsAnimating(true), 10);
      }
    }, 12000);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("open-signin-modal", handleOpen);
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
    };
  }, [user, handleClose]);

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: typeof window !== "undefined" ? `${window.location.origin}/` : undefined,
        },
      });
      if (error) {
        console.error("Sign-in error:", error.message);
      }
    } catch (err) {
      console.error("Uncaught sign-in error:", err);
    }
  };

  // Strictly return null if user is logged in or modal is closed
  if (!isOpen || user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Frosted Glass Backdrop */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-200 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* macOS Window Dialog */}
      <div
        className={`relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#161917]/85 backdrop-blur-2xl shadow-2xl shadow-black/80 transition-all duration-200 ${
          isAnimating ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-2"
        }`}
      >
        {/* macOS Window Header Chrome */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#1A1E1C]/90 px-4 py-3 select-none">
          {/* macOS Traffic Lights */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              className="group flex h-3 w-3 items-center justify-center rounded-full bg-[#FF5F56] hover:bg-[#E0443E] active:bg-[#C0322C] transition-colors"
              aria-label="Close window"
            >
              <X className="h-2 w-2 opacity-0 group-hover:opacity-100 text-black/70 stroke-[3]" />
            </button>
            <button
              onClick={handleClose}
              className="h-3 w-3 rounded-full bg-[#FFBD2E] hover:bg-[#DEA123] transition-colors"
              aria-label="Minimize window"
            />
            <button
              className="h-3 w-3 rounded-full bg-[#27C93F] hover:bg-[#1AAB29] transition-colors"
              aria-label="Expand window"
            />
          </div>

          <div className="text-[11px] font-mono font-medium text-slate-400 tracking-tight">
            crawlers // authentication
          </div>

          <div className="w-12" />
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 text-center">
          {/* macOS Glowing App Icon */}
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#8FBF3F]/40 bg-[#8FBF3F]/10 shadow-lg shadow-[#8FBF3F]/10">
            <Sparkles className="h-7 w-7 text-[#8FBF3F]" />
          </div>

          <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
            Unlock Full Access
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm font-sans mb-6 leading-relaxed">
            Sign in to personalize your AI directory, sync bookmarks across devices, and access advanced features.
          </p>

          {/* Feature List */}
          <div className="mb-6 space-y-3 text-left font-sans">
            <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.03] p-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#8FBF3F]/15 text-[#8FBF3F]">
                <Bookmark className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Cloud Bookmarks & Favorites</div>
                <div className="text-[11px] text-slate-400">Save and organize AI tools to your personal stack</div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.03] p-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#8FBF3F]/15 text-[#8FBF3F]">
                <Cpu className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">AI Assistant Workspace</div>
                <div className="text-[11px] text-slate-400">Natural language search & intelligent recommendations</div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.03] p-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#8FBF3F]/15 text-[#8FBF3F]">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Priority Tool Submissions</div>
                <div className="text-[11px] text-slate-400">Submit and manage custom tools in the catalog</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            <button
              onClick={handleGoogleSignIn}
              className="group relative flex w-full items-center justify-center gap-2.5 rounded-xl border border-[#8FBF3F]/40 bg-[#8FBF3F] py-3 text-xs sm:text-sm font-bold text-slate-950 shadow-lg shadow-[#8FBF3F]/20 hover:bg-[#7ba235] active:scale-[0.99] transition-all duration-150 font-sans"
            >
              <svg className="h-4 w-4 text-slate-950" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-6.887 4.114-4.68 0-8.473-3.882-8.473-8.514 0-4.632 3.793-8.515 8.473-8.515 2.502 0 4.263.957 5.372 2.036l3.12-3.12C18.665.926 15.69 0 12.24 0 5.58 0 0 5.58 0 12.24s5.58 12.24 12.24 12.24c6.96 0 11.52-4.896 11.52-11.724 0-.785-.078-1.547-.22-2.22H12.24z"/>
              </svg>
              <span>Continue with Google</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>

            <button
              onClick={handleClose}
              className="w-full py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors font-sans"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
