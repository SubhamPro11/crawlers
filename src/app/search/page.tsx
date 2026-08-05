import type { Metadata } from "next";
import { Suspense } from "react";
import { mockDb, Tool } from "@/data/mockDb";
import SearchClient from "./SearchClient";
import { TerminalLoader } from "@/components/TerminalLoader";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  const queryText = q?.trim() || "";
  const title = queryText ? `Search Results for "${queryText}"` : "Search Directory";
  const description = queryText
    ? `Explore AI tools and bots matching "${queryText}" in the Crawlers directory.`
    : "Search 1,400+ AI tools and bots by specific use case, task, or capability.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://crawlers.dpdns.org/search${queryText ? `?q=${encodeURIComponent(queryText)}` : ""}`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    alternates: {
      canonical: "https://crawlers.dpdns.org/search",
    },
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() || "";
  let initialResults: Tool[] = [];

  try {
    initialResults = await mockDb.searchTools(query);
  } catch (err) {
    console.error("Error pre-fetching search results server-side:", err);
  }

  return (
    <Suspense fallback={<TerminalLoader message="querying_index" />}>
      <SearchClient initialQuery={query} initialResults={initialResults} />
    </Suspense>
  );
}
