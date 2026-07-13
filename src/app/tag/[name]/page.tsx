import type { Metadata } from "next";
import TagPageClient from "./TagPageClient";

export const runtime = "edge";
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Tag Directory | Crawlers",
  description: "Browse curated AI tools by tag in our monospace directory.",
};

export default function TagPage() {
  return <TagPageClient />;
}
