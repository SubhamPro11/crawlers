import type { Metadata } from "next";
import ApiDirectoryClient from "./ApiDirectoryClient";

export const metadata: Metadata = {
  title: "API Key & Inference Registry | Crawlers",
  description: "A curated directory of AI platforms, foundation models, and serverless inference endpoints offering developer API keys.",
  openGraph: {
    title: "API Key & Inference Registry | Crawlers",
    description: "A curated directory of AI platforms, foundation models, and serverless inference endpoints offering developer API keys.",
    url: "https://crawlers.dpdns.org/api",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "API Key & Inference Registry | Crawlers",
    description: "A curated directory of AI platforms, foundation models, and serverless inference endpoints offering developer API keys.",
  },
  alternates: {
    canonical: "https://crawlers.dpdns.org/api",
  },
};

export default function ApiKeysDirectoryPage() {
  return <ApiDirectoryClient />;
}
