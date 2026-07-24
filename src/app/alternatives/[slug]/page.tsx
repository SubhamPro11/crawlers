import type { Metadata } from "next";
import { mockDb, slugify } from "@/data/mockDb";
import AlternativesPageClient from "./AlternativesPageClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    if (!slug) {
      return {
        title: "Alternatives | Crawlers",
      };
    }

    const { targetTool, categoryName, alternatives, totalCategoryCount } =
      await mockDb.getAlternativesForTool(slug);

    if (!targetTool || totalCategoryCount < 3 || alternatives.length === 0) {
      return {
        title: "Alternatives Unavailable | Crawlers",
        description: "Alternatives pages are only generated for tools in categories with 3 or more indexed tools.",
      };
    }

    const title = `Best ${targetTool.name} Alternatives & Competitors | Crawlers`;
    const description = `Looking for alternatives to ${targetTool.name}? Discover ${alternatives.length} other top ${categoryName} tools indexed on Crawlers.`;
    const canonicalUrl = `https://crawlers.dpdns.org/alternatives/${slugify(targetTool.name)}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        type: "website",
      },
      twitter: {
        card: "summary",
        title,
        description,
      },
      alternates: {
        canonical: canonicalUrl,
      },
    };
  } catch (err) {
    console.error("Error in generateMetadata for alternatives:", err);
    return {
      title: "Alternatives | Crawlers",
    };
  }
}

export async function generateStaticParams() {
  try {
    const allTools = await mockDb.getTools();
    const qualify = allTools.filter((t) => {
      const catTools = allTools.filter((ct) => ct.category_id === t.category_id);
      return catTools.length >= 3;
    });

    return qualify.map((tool) => ({
      slug: slugify(tool.name),
    }));
  } catch (err) {
    return [];
  }
}

export default async function AlternativesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <AlternativesPageClient slug={slug} />;
}
