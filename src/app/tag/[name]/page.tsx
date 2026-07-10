import type { Metadata } from "next";
import TagPageClient from "./TagPageClient";

interface PageProps {
  params: Promise<{ name: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { name } = await params;
  const tag = decodeURIComponent(name);

  return {
    title: `AI Tools tagged [${tag}] | Crawlers`,
    description: `Browse all curated AI platforms and bots tagged under [${tag}] in our monospace directory.`,
    openGraph: {
      title: `AI Tools Tagged [${tag}] | Crawlers`,
      description: `Browse all curated AI platforms and bots tagged under [${tag}] in our monospace directory.`,
      url: `https://crawlers.dpdns.org/tag/${name}`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `AI Tools Tagged [${tag}] | Crawlers`,
      description: `Browse all curated AI platforms and bots tagged under [${tag}] in our monospace directory.`,
    },
    alternates: {
      canonical: `https://crawlers.dpdns.org/tag/${name}`,
    },
  };
}

export default async function TagPage({ params }: PageProps) {
  const { name } = await params;
  return <TagPageClient name={name} />;
}
