import type { Metadata } from "next";
import { mockDb } from "@/data/mockDb";
import TagPageClient from "./TagPageClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const { tagName } = await mockDb.getToolsByTagSlug(slug);

    return {
      title: `AI Tools tagged [${tagName}] | Crawlers`,
      description: `Browse all curated AI platforms and bots tagged under [${tagName}] in our monospace directory.`,
      openGraph: {
        title: `AI Tools Tagged [${tagName}] | Crawlers`,
        description: `Browse all curated AI platforms and bots tagged under [${tagName}] in our monospace directory.`,
        url: `https://crawlers.dpdns.org/tags/${slug}`,
        type: "website",
      },
      twitter: {
        card: "summary",
        title: `AI Tools Tagged [${tagName}] | Crawlers`,
        description: `Browse all curated AI platforms and bots tagged under [${tagName}] in our monospace directory.`,
      },
      alternates: {
        canonical: `https://crawlers.dpdns.org/tags/${slug}`,
      },
    };
  } catch (err) {
    console.error("Error in generateMetadata for tag slug:", err);
    return {
      title: "Tag | Crawlers",
    };
  }
}

export default async function TagSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  let slug = "";
  try {
    const resolvedParams = await params;
    slug = resolvedParams.slug || "";
  } catch (err) {
    console.error("Error in TagSlugPage server component:", err);
  }

  return <TagPageClient slug={slug} />;
}
