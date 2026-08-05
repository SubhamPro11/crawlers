import type { Metadata } from "next";
import { mockDb, Collection } from "@/data/mockDb";
import CollectionsIndexClient from "./CollectionsIndexClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Curated AI Collections & Stacks",
  description: "Explore curated AI tool collections, founder stacks, and workflow pipelines organized across categories.",
  openGraph: {
    title: "Curated AI Collections & Stacks",
    description: "Explore curated AI tool collections, founder stacks, and workflow pipelines organized across categories.",
    url: "https://crawlers.dpdns.org/collections",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Curated AI Collections & Stacks",
    description: "Explore curated AI tool collections, founder stacks, and workflow pipelines organized across categories.",
  },
  alternates: {
    canonical: "https://crawlers.dpdns.org/collections",
  },
};

export default async function CollectionsPage() {
  let collections: Collection[] = [];
  try {
    collections = await mockDb.getCollections();
  } catch (err) {
    console.error("Error pre-fetching collections server-side:", err);
  }

  return <CollectionsIndexClient initialCollections={collections} />;
}
