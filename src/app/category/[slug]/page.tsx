import type { Metadata } from "next";
import { mockDb } from "@/data/mockDb";
import CategoryPageClient from "./CategoryPageClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await mockDb.getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Category Not Found",
      description: "The requested category does not exist in the Crawlers directory.",
    };
  }

  const tools = await mockDb.getToolsByCategory(category.id);
  const toolCount = tools.length;

  return {
    title: `${category.name} — ${toolCount} AI Tool${toolCount !== 1 ? "s" : ""} Indexed`,
    description: category.description,
    openGraph: {
      title: `${category.name} — AI Tools Directory | Crawlers`,
      description: category.description,
      url: `https://crawlers.dpdns.org/category/${slug}`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${category.name} — AI Tools | Crawlers`,
      description: category.description,
    },
    alternates: {
      canonical: `https://crawlers.dpdns.org/category/${slug}`,
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await mockDb.getCategoryBySlug(slug);
  let jsonLd = null;

  if (category) {
    const tools = await mockDb.getToolsByCategory(category.id);
    jsonLd = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": category.name,
      "description": category.description,
      "url": `https://crawlers.dpdns.org/category/${slug}`,
      "mainEntity": {
        "@type": "ItemList",
        "numberOfItems": tools.length,
        "itemListElement": tools.map((tool, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "url": `https://crawlers.dpdns.org/tool/${tool.id}`,
          "name": tool.name
        }))
      }
    };
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <CategoryPageClient slug={slug} />
    </>
  );
}
