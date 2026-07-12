import type { Metadata } from "next";
import TagPageClient from "./TagPageClient";

export const runtime = "edge";

interface PageProps {
  params: Promise<{ name: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const resolvedParams = params ? await params : null;
    const name = resolvedParams?.name || "";
    const tag = name ? decodeURIComponent(name) : "";

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
  } catch (err) {
    console.error("Error in generateMetadata for tag:", err);
    return {
      title: "Tag | Crawlers",
    };
  }
}

export default async function TagPage({ params }: PageProps) {
  let name = "";
  try {
    const resolvedParams = params ? await params : null;
    name = resolvedParams?.name || "";
  } catch (err) {
    console.error("Error in TagPage server component:", err);
  }

  return <TagPageClient name={name} />;
}
