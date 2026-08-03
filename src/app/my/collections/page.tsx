import type { Metadata } from "next";
import MyCollectionsClient from "./MyCollectionsClient";

export const metadata: Metadata = {
  title: "My Personal Collections",
  description: "Create and manage your custom private AI tool stacks and collections on Crawlers.",
};

export default function MyCollectionsPage() {
  return <MyCollectionsClient />;
}
