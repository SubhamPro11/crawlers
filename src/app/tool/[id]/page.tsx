import type { Metadata } from "next";
import { mockDb } from "@/data/mockDb";
import ToolDetailPageClient from "./ToolDetailPageClient";

export const runtime = "edge";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
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
}

export default async function ToolDetailPage({ params }: PageProps) {
  const { id } = await params;
  const tool = await mockDb.getToolById(id);

  if (!tool) {
    return <ToolDetailPageClient id={id} />;
  }

  // Schema.org SoftwareApplication JSON-LD Structured Data
  const jsonLd = {
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ToolDetailPageClient id={id} />
    </>
  );
}
