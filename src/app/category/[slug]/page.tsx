import type { Metadata } from "next";
import { mockDb } from "@/data/mockDb";
import CategoryPageClient from "./CategoryPageClient";

export const runtime = "edge";
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const resolvedParams = params ? await params : null;
    const slug = resolvedParams?.slug;
    if (!slug) {
      return {
        title: "Category Not Found",
        description: "The requested category does not exist in the Crawlers directory.",
      };
    }

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
  } catch (err) {
    console.error("Error in generateMetadata for category:", err);
    return {
      title: "Category | Crawlers",
    };
  }
}

export default async function CategoryPage({ params }: PageProps) {
  let slug = "";
  let jsonLd = null;
  try {
    const resolvedParams = params ? await params : null;
    slug = resolvedParams?.slug || "";
    const category = slug ? await mockDb.getCategoryBySlug(slug) : undefined;

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
  } catch (err) {
    console.error("Error in CategoryPage server component:", err);
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
