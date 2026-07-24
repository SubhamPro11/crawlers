"use client";

import dynamic from "next/dynamic";

const CommandPalette = dynamic(() => import("@/components/CommandPalette"), { ssr: false });
const ToastNotification = dynamic(() => import("@/components/ToastNotification"), { ssr: false });
const BottomNav = dynamic(() => import("@/components/BottomNav"), { ssr: false });
const AssistantWidget = dynamic(() => import("@/components/AssistantWidget"), { ssr: false });
const InactivityTracker = dynamic(() => import("@/components/InactivityTracker"), { ssr: false });

export default function ClientOverlays() {
  return (
    <>
      <CommandPalette />
      <ToastNotification />
      <BottomNav />
      <AssistantWidget />
      <InactivityTracker />
    </>
  );
}
