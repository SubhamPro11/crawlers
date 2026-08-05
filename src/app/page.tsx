import { mockDb, Category, Tool } from "@/data/mockDb";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let categories: Category[] = [];
  let toolCounts: Record<string, number> = {};
  let recentTools: Tool[] = [];
  let totalToolsCount = 0;
  let popularQueries: string[] = [];

  try {
    const [dbCategories, counts, recent, totalCount, queries] = await Promise.all([
      mockDb.getCategories(),
      mockDb.getCategoryToolCounts(),
      mockDb.getRecentTools(8),
      mockDb.getTotalToolsCount(),
      mockDb.getPopularQueries(),
    ]);

    categories = dbCategories || [];
    toolCounts = counts || {};
    recentTools = recent || [];
    totalToolsCount = totalCount || 0;
    popularQueries = queries || [];
  } catch (err) {
    console.error("Error pre-fetching homepage data:", err);
  }

  return (
    <HomeClient
      initialCategories={categories}
      initialToolCounts={toolCounts}
      initialRecentTools={recentTools}
      initialTotalToolsCount={totalToolsCount}
      initialPopularQueries={popularQueries}
    />
  );
}
