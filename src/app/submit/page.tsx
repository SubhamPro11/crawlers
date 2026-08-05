import type { Metadata } from "next";
import { mockDb, Category } from "@/data/mockDb";
import SubmitClient from "./SubmitClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Submit an AI Platform",
  description: "Submit a new AI tool, bot, or developer utility to the Crawlers directory for indexing and community discovery.",
  openGraph: {
    title: "Submit an AI Platform",
    description: "Submit a new AI tool, bot, or developer utility to the Crawlers directory for indexing and community discovery.",
    url: "https://crawlers.dpdns.org/submit",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Submit an AI Platform",
    description: "Submit a new AI tool, bot, or developer utility to the Crawlers directory for indexing and community discovery.",
  },
  alternates: {
    canonical: "https://crawlers.dpdns.org/submit",
  },
};

export default async function SubmitPage() {
  let categories: Category[] = [];
  try {
    categories = await mockDb.getCategories();
  } catch (err) {
    console.error("Error pre-fetching categories for submit page server-side:", err);
  }

  return <SubmitClient initialCategories={categories} />;
}
