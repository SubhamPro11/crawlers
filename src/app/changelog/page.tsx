import type { Metadata } from "next";
import ChangelogClient from "./ChangelogClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Directory Changelog",
  description: "View the historical log of newly indexed and verified AI tools added to the Crawlers directory.",
  openGraph: {
    title: "Directory Changelog | Crawlers",
    description: "View the historical log of newly indexed and verified AI tools added to the Crawlers directory.",
    url: "https://crawlers.dpdns.org/changelog",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Directory Changelog | Crawlers",
    description: "View the historical log of newly indexed and verified AI tools added to the Crawlers directory.",
  },
  alternates: {
    canonical: "https://crawlers.dpdns.org/changelog",
  },
};

export default function ChangelogPage() {
  return <ChangelogClient />;
}
