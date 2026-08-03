import type { Metadata } from "next";
import StacksIndexClient from "./StacksIndexClient";

export const metadata: Metadata = {
  title: "AI Workflow Stacks — Curated Tool Combinations",
  description: "Editorial multi-tool AI stacks designed for specific outcomes: indie hackers, video production, coding, and productivity.",
};

export default function StacksPage() {
  return <StacksIndexClient />;
}
