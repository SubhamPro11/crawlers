import type { Metadata } from "next";
import { mockDb, Tool } from "@/data/mockDb";
import ApiDirectoryClient from "./ApiDirectoryClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "API Key & Inference Registry",
  description: "A curated directory of AI platforms, foundation models, and serverless inference endpoints offering developer API keys.",
  openGraph: {
    title: "API Key & Inference Registry",
    description: "A curated directory of AI platforms, foundation models, and serverless inference endpoints offering developer API keys.",
    url: "https://crawlers.dpdns.org/api",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "API Key & Inference Registry",
    description: "A curated directory of AI platforms, foundation models, and serverless inference endpoints offering developer API keys.",
  },
  alternates: {
    canonical: "https://crawlers.dpdns.org/api",
  },
};

export default async function ApiKeysDirectoryPage() {
  let tools: Tool[] = [];
  try {
    tools = await mockDb.getTools();
  } catch (err) {
    console.error("Error pre-fetching API directory tools server-side:", err);
  }

  return <ApiDirectoryClient initialTools={tools} />;
}
