import type { Metadata } from "next";
import { mockDb, Category, Tool } from "@/data/mockDb";
import CategoryPageClient from "./CategoryPageClient";

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

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  let slug = "";
  let category: Category | null = null;
  let tools: Tool[] = [];
  let jsonLd = null;

  try {
    const resolvedParams = await params;
    slug = resolvedParams.slug;
    if (slug) {
      const cat = await mockDb.getCategoryBySlug(slug);
      if (cat) {
        category = cat;
        tools = await mockDb.getToolsByCategory(cat.id);

        const collectionSchema = {
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

        const breadcrumbSchema = {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://crawlers.dpdns.org"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Categories",
              "item": "https://crawlers.dpdns.org/category"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": category.name,
              "item": `https://crawlers.dpdns.org/category/${slug}`
            }
          ]
        };

        jsonLd = [collectionSchema, breadcrumbSchema];
      }
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
      <CategoryPageClient
        slug={slug}
        initialCategory={category}
        initialTools={tools}
      />
    </>
  );
}
