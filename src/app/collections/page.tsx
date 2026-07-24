import type { Metadata } from "next";
import CollectionsIndexClient from "./CollectionsIndexClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Curated AI Collections & Stacks | Crawlers",
  description: "Explore curated AI tool collections, founder stacks, and workflow pipelines organized across categories.",
  openGraph: {
    title: "Curated AI Collections & Stacks | Crawlers",
    description: "Explore curated AI tool collections, founder stacks, and workflow pipelines organized across categories.",
    url: "https://crawlers.dpdns.org/collections",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Curated AI Collections & Stacks | Crawlers",
    description: "Explore curated AI tool collections, founder stacks, and workflow pipelines organized across categories.",
  },
  alternates: {
    canonical: "https://crawlers.dpdns.org/collections",
  },
};

export default function CollectionsPage() {
  return <CollectionsIndexClient />;
}
