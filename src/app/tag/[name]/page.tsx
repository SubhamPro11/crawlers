import type { Metadata } from "next";
import TagPageClient from "./TagPageClient";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  try {
    const { name } = await params;
    const decodedName = name || "";
    const tag = decodedName ? decodeURIComponent(decodedName) : "";

    return {
      title: `AI Tools tagged [${tag}] | Crawlers`,
      description: `Browse all curated AI platforms and bots tagged under [${tag}] in our monospace directory.`,
      openGraph: {
        title: `AI Tools Tagged [${tag}] | Crawlers`,
        description: `Browse all curated AI platforms and bots tagged under [${tag}] in our monospace directory.`,
        url: `https://crawlers.dpdns.org/tag/${decodedName}`,
        type: "website",
      },
      twitter: {
        card: "summary",
        title: `AI Tools Tagged [${tag}] | Crawlers`,
        description: `Browse all curated AI platforms and bots tagged under [${tag}] in our monospace directory.`,
      },
      alternates: {
        canonical: `https://crawlers.dpdns.org/tag/${decodedName}`,
      },
    };
  } catch (err) {
    console.error("Error in generateMetadata for tag:", err);
    return {
      title: "Tag | Crawlers",
    };
  }
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  let name = "";
  try {
    const resolvedParams = await params;
    name = resolvedParams.name || "";
  } catch (err) {
    console.error("Error in TagPage server component:", err);
  }

  return <TagPageClient name={name} />;
}
