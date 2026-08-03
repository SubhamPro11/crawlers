import { MetadataRoute } from "next";
import { mockDb, slugify } from "@/data/mockDb";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://crawlers.dpdns.org";

  const categories = await mockDb.getCategories();
  const tools = await mockDb.getTools();

  // Collect unique tags across all tools
  const tagSet = new Set<string>();
  tools.forEach((tool) => {
    if (tool.tags && Array.isArray(tool.tags)) {
      tool.tags.forEach((tag) => {
        if (tag && tag.trim()) {
          tagSet.add(tag.trim());
        }
      });
    }
  });

  const categoryUrls = categories.map((cat) => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const toolUrls = tools.map((tool) => ({
    url: `${baseUrl}/tool/${tool.id}`,
    lastModified: new Date(tool.created_at || Date.now()),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const tagUrls = Array.from(tagSet).map((tag) => ({
    url: `${baseUrl}/tags/${slugify(tag)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.4,
  }));

  // Collect categories with 3+ tools for alternatives pages
  const categoryCounts: Record<string, number> = {};
  tools.forEach((tool) => {
    categoryCounts[tool.category_id] = (categoryCounts[tool.category_id] || 0) + 1;
  });

  const alternativeUrls = tools
    .filter((tool) => (categoryCounts[tool.category_id] || 0) >= 3)
    .map((tool) => ({
      url: `${baseUrl}/alternatives/${slugify(tool.name)}`,
      lastModified: new Date(tool.created_at || Date.now()),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }));

  const collections = await mockDb.getCollections();
  const collectionUrls = collections.map((col) => ({
    url: `${baseUrl}/collections/${col.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/api`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/changelog`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/submit`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
    ...categoryUrls,
    ...toolUrls,
    ...tagUrls,
    ...alternativeUrls,
    ...collectionUrls,
  ];
}
