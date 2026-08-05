import type { Metadata } from "next";
import { fetchAllStacks, fetchStackBySlug, Stack } from "@/lib/stacks";
import StacksIndexClient from "./StacksIndexClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI Workflow Stacks — Curated Tool Combinations",
  description: "Editorial multi-tool AI stacks designed for specific outcomes: indie hackers, video production, coding, and productivity.",
  openGraph: {
    title: "AI Workflow Stacks — Curated Tool Combinations",
    description: "Editorial multi-tool AI stacks designed for specific outcomes: indie hackers, video production, coding, and productivity.",
    url: "https://crawlers.dpdns.org/stacks",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "AI Workflow Stacks — Curated Tool Combinations",
    description: "Editorial multi-tool AI stacks designed for specific outcomes: indie hackers, video production, coding, and productivity.",
  },
  alternates: {
    canonical: "https://crawlers.dpdns.org/stacks",
  },
};

export default async function StacksPage() {
  let stacks: Stack[] = [];
  try {
    const list = await fetchAllStacks();
    const detailed = await Promise.all(
      list.map(async (s) => {
        const full = await fetchStackBySlug(s.slug);
        return full || s;
      })
    );
    stacks = detailed;
  } catch (err) {
    console.error("Error pre-fetching stacks server-side:", err);
  }

  return <StacksIndexClient initialStacks={stacks} />;
}
