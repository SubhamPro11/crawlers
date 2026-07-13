import type { Metadata } from "next";
import CategoryPageClient from "./CategoryPageClient";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Category Directory | Crawlers",
  description: "Browse curated AI tools by category in our monospace directory.",
};

export default function CategoryPage() {
  return <CategoryPageClient />;
}
