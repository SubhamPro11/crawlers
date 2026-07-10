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
  return <CategoryPageClient slug={slug} />;
}
