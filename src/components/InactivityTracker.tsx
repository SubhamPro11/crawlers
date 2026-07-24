"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

const THREE_HOURS_MS = 3 * 60 * 60 * 1000; // 3 hours = 10,800,000 ms
const THROTTLE_MS = 30 * 1000; // Throttle activity updates to every 30s

export default function InactivityTracker() {
  const lastUpdatedRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Helper: Record meaningful user activity
    const updateActivity = () => {
      const now = Date.now();
      if (now - lastUpdatedRef.current > THROTTLE_MS) {
        lastUpdatedRef.current = now;
        localStorage.setItem("crawlers_last_activity", now.toString());
      }
    };

    // Initialize activity timestamp if not present
    if (!localStorage.getItem("crawlers_last_activity")) {
      localStorage.setItem("crawlers_last_activity", Date.now().toString());
    }

    // Event listeners for meaningful interaction
    const events = ["click", "keydown", "scroll", "pointerdown"];
    events.forEach((evt) => window.addEventListener(evt, updateActivity, { passive: true }));

    // Inactivity checker
    const checkInactivity = async () => {
      const lastActivityStr = localStorage.getItem("crawlers_last_activity");
      const lastActivity = lastActivityStr ? parseInt(lastActivityStr, 10) : Date.now();
      const elapsed = Date.now() - lastActivity;

      if (elapsed >= THREE_HOURS_MS) {
        try {
          const { data } = await supabase.auth.getSession();
          if (data && data.session) {
            localStorage.setItem("crawlers_inactivity_logout", "true");
            localStorage.setItem("crawlers_last_activity", Date.now().toString());
            await supabase.auth.signOut();
            window.dispatchEvent(
              new CustomEvent("toast", {
                detail: {
                  message: "You were signed out after 3 hours of inactivity, for your security.",
                  type: "warning",
                },
              })
            );
          }
        } catch (err) {
          console.error("Error during inactivity logout check:", err);
        }
      }
    };

    // Run check on mount and on visibility / focus change
    checkInactivity();

    const interval = setInterval(checkInactivity, 15000); // Check every 15s
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        checkInactivity();
      }
    };

    window.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", checkInactivity);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, updateActivity));
      clearInterval(interval);
      window.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", checkInactivity);
    };
  }, []);

  return null;
}
