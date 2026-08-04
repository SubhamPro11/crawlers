import type { Metadata } from "next";
import { mockDb } from "@/data/mockDb";
import CollectionDetailPageClient from "./CollectionDetailPageClient";

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
        title: "Collection Not Found | Crawlers",
      };
    }

    const { collection } = await mockDb.getCollectionBySlug(slug);

    if (!collection) {
      return {
        title: "Collection Not Found | Crawlers",
        description: "The requested collection does not exist in the Crawlers directory.",
      };
    }

    const title = `${collection.title} — AI Tools Collection | Crawlers`;
    const description = collection.description;
    const canonicalUrl = `https://crawlers.dpdns.org/collections/${collection.slug}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        type: "website",
      },
      twitter: {
        card: "summary",
        title,
        description,
      },
      alternates: {
        canonical: canonicalUrl,
      },
    };
  } catch (err) {
    console.error("Error in generateMetadata for collection detail:", err);
    return {
      title: "Collection | Crawlers",
    };
  }
}

export async function generateStaticParams() {
  try {
    const collections = await mockDb.getCollections();
    return collections.map((col) => ({
      slug: col.slug,
    }));
  } catch (_err) {
    return [];
  }
}

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CollectionDetailPageClient slug={slug} />;
}
