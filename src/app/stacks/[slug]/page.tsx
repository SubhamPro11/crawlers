import type { Metadata } from "next";
import { fetchStackBySlug, Stack } from "@/lib/stacks";
import StackDetailPageClient from "./StackDetailPageClient";

export const dynamic = "force-dynamic";

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
  let stack: Stack | null = null;

  if (slug) {
    try {
      stack = await fetchStackBySlug(slug);
    } catch (err) {
      console.error("Error fetching stack server-side:", err);
    }
  }

  return <StackDetailPageClient slug={slug} initialStack={stack} />;
}
