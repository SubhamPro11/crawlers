import type { Metadata } from "next";
import TagsPageClient from "./TagsPageClient";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Tags Directory | Crawlers",
  description: "Browse curated AI tools by tags in our monospace directory.",
};

export default function TagsPage() {
  return <TagsPageClient />;
}
