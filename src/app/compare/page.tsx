import type { Metadata } from "next";
import CompareClient from "./CompareClient";

export const metadata: Metadata = {
  title: "Compare AI Tools Side-by-Side | Crawlers",
  description: "Compare features, pricing, pros, cons, and platform availability of ChatGPT, Claude, Gemini, and other top AI tools.",
  alternates: {
    canonical: "https://crawlers.dpdns.org/compare",
  },
};

export default function ComparePage() {
  return <CompareClient />;
}
