import type { Metadata } from "next";
import { fetchStackBySlug } from "@/lib/stacks";
import StackDetailPageClient from "./StackDetailPageClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const stack = await fetchStackBySlug(slug);

  if (!stack) {
    return {
      title: "Stack Not Found | Crawlers",
    };
  }

  const cleanDesc = stack.description.replace(/<!--[\s\S]*?-->/g, "").trim();

  return {
    title: `${stack.title} — AI Workflow Stack`,
    description: cleanDesc,
    openGraph: {
      title: `${stack.title} | Crawlers`,
      description: cleanDesc,
      url: `https://crawlers.dpdns.org/stacks/${slug}`,
    },
  };
}

export default async function StackDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <StackDetailPageClient slug={slug} />;
}
