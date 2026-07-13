import type { Metadata } from "next";
import ToolDetailPageClient from "./ToolDetailPageClient";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Tool Details | Crawlers",
  description: "View curated details and reviews for this AI tool in our directory.",
};

export default function ToolDetailPage() {
  return <ToolDetailPageClient />;
}
