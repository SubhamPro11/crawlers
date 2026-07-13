import type { Metadata } from "next";
import { mockDb } from "@/data/mockDb";
import ToolDetailPageClient from "./ToolDetailPageClient";

export const runtime = "edge";
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

    const tool = await mockDb.getToolById(id);

    if (!tool) {
      return {
        title: "Tool Not Found",
        description: "The requested tool is not registered in the Crawlers directory.",
      };
    }

    const categoryName = tool.categories?.name || "AI Tools";

    return {
      title: `${tool.name} — AI Tool Review & Use Case | Crawlers`,
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
      title: "Tool | Crawlers",
    };
  }
}

export default async function ToolDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  let id = "";
  let jsonLd = null;
  try {
    const resolvedParams = await params;
    id = resolvedParams.id;
    const tool = id ? await mockDb.getToolById(id) : undefined;

    if (tool) {
      // Schema.org SoftwareApplication JSON-LD Structured Data
      jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": tool.name,
        "description": tool.short_description,
        "applicationCategory": tool.categories?.name || "MultimediaApplication",
        "operatingSystem": "All",
        "offers": {
          "@type": "Offer",
          "price": tool.pricing_model === "free" ? "0" : undefined,
          "priceCurrency": tool.pricing_model === "free" ? "USD" : undefined,
          "category": tool.pricing_model,
        },
      };
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
      <ToolDetailPageClient id={id} />
    </>
  );
}
