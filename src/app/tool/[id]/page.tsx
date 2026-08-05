import type { Metadata } from "next";
import { mockDb, Tool } from "@/data/mockDb";
import ToolDetailPageClient from "./ToolDetailPageClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  try {
    const { id } = await params;
    if (!id) {
      return {
        title: "Tool Not Found",
        description: "The requested tool is not registered in the Crawlers directory.",
      };
    }

    const tool = await mockDb.getActiveToolById(id);

    if (!tool) {
      return {
        title: "Tool Not Found",
        description: "The requested tool is not registered in the Crawlers directory.",
      };
    }

    const categoryName = tool.categories?.name || "AI Tools";

    return {
      title: `${tool.name} — AI Tool Review & Use Case`,
      description: tool.short_description,
      openGraph: {
        title: `${tool.name} — ${categoryName} | Crawlers`,
        description: tool.short_description,
        url: `https://crawlers.dpdns.org/tool/${id}`,
        type: "website",
      },
      twitter: {
        card: "summary",
        title: `${tool.name} — ${categoryName} | Crawlers`,
        description: tool.short_description,
      },
      alternates: {
        canonical: `https://crawlers.dpdns.org/tool/${id}`,
      },
    };
  } catch (err) {
    console.error("Error in generateMetadata for tool:", err);
    return {
      title: "Tool",
    };
  }
}

export default async function ToolDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  let id = "";
  let tool: Tool | null = null;
  let similarTools: Tool[] = [];
  let jsonLd = null;

  try {
    const resolvedParams = await params;
    id = resolvedParams.id;
    if (id) {
      const t = await mockDb.getActiveToolById(id);
      if (t) {
        tool = t;
        similarTools = await mockDb.getRelatedTools(t.id, t.category_id, t.tags);

        const categoryName = tool.categories?.name || "AI Tools";
        const categorySlug = tool.categories?.slug || "";

        const appSchema = {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": tool.name,
          "description": tool.short_description,
          "applicationCategory": categoryName,
          "operatingSystem": "All",
          "offers": {
            "@type": "Offer",
            "price": tool.pricing_model === "free" ? "0" : undefined,
            "priceCurrency": tool.pricing_model === "free" ? "USD" : undefined,
            "category": tool.pricing_model,
          },
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
            ...(categorySlug ? [{
              "@type": "ListItem",
              "position": 2,
              "name": categoryName,
              "item": `https://crawlers.dpdns.org/category/${categorySlug}`
            }] : []),
            {
              "@type": "ListItem",
              "position": categorySlug ? 3 : 2,
              "name": tool.name,
              "item": `https://crawlers.dpdns.org/tool/${id}`
            }
          ]
        };

        jsonLd = [appSchema, breadcrumbSchema];
      }
    }
  } catch (err) {
    console.error("Error in ToolDetailPage server component:", err);
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ToolDetailPageClient
        id={id}
        initialTool={tool}
        initialSimilarTools={similarTools}
      />
    </>
  );
}
