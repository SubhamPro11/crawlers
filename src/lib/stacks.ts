import { supabase } from "@/lib/supabaseClient";
import { mockDb, Tool } from "@/data/mockDb";

export interface Stack {
  id: string;
  slug: string;
  title: string;
  description: string;
  published_at: string;
  items?: StackItemWithTool[];
}

export interface StackItem {
  stack_id: string;
  tool_id: string;
  role_label: string;
  sort_order: number;
}

export interface StackItemWithTool extends StackItem {
  tool?: Tool;
}

// Editorial Stacks Seed / Fallback with explicit Cryo TODO markers
export const PLACEHOLDER_EDITORIAL_STACKS: Stack[] = [
  {
    id: "stack-solo-founder",
    slug: "solo-indie-hacker-stack",
    title: "Solo Indie Hacker's AI Stack",
    description: "<!-- TODO: Cryo editorial blurb placeholder for Solo Indie Hacker Stack --> Full-stack AI tools for a solo builder managing code, product design, copywriting, and marketing without a team.",
    published_at: new Date("2026-08-01").toISOString()
  },
  {
    id: "stack-video-pipeline",
    slug: "video-production-pipeline",
    title: "AI Video Production Pipeline",
    description: "<!-- TODO: Cryo editorial blurb placeholder for Video Production Pipeline --> End-to-end editorial stack for automated video scripting, voice cloning, subtitling, and media generation.",
    published_at: new Date("2026-08-02").toISOString()
  },
  {
    id: "stack-dev-launchpad",
    slug: "developer-launchpad-stack",
    title: "Developer AI Launchpad",
    description: "<!-- TODO: Cryo editorial blurb placeholder for Developer AI Launchpad --> Curated code assistants, automated testing, and API tools for modern software development.",
    published_at: new Date("2026-08-03").toISOString()
  }
];

export async function fetchAllStacks(): Promise<Stack[]> {
  try {
    const { data, error } = await supabase
      .from("stacks")
      .select("*, stack_items(*)")
      .order("published_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn("Falling back to editorial placeholder stacks:", err);
  }

  return PLACEHOLDER_EDITORIAL_STACKS;
}

export async function fetchStackBySlug(slug: string): Promise<Stack | null> {
  const normalizedSlug = (slug || "").toLowerCase().trim();
  try {
    const { data: stackData, error: stackError } = await supabase
      .from("stacks")
      .select("*")
      .eq("slug", normalizedSlug)
      .single();

    if (!stackError && stackData) {
      // Fetch stack items
      const { data: itemsData } = await supabase
        .from("stack_items")
        .select("*")
        .eq("stack_id", stackData.id)
        .order("sort_order", { ascending: true });

      const allTools = await mockDb.getTools();
      const itemsWithTools: StackItemWithTool[] = (itemsData || []).map(item => ({
        ...item,
        tool: allTools.find(t => t.id === item.tool_id)
      }));

      return {
        ...stackData,
        items: itemsWithTools
      };
    }
  } catch (err) {
    console.warn("Error fetching stack by slug via Supabase:", err);
  }

  // Fallback match from editorial placeholder stacks
  const matchedStack = PLACEHOLDER_EDITORIAL_STACKS.find(s => s.slug === normalizedSlug);
  if (!matchedStack) return null;

  const allTools = await mockDb.getTools();
  let defaultTools: { toolId: string; role: string }[] = [];

  if (normalizedSlug === "solo-indie-hacker-stack") {
    defaultTools = [
      { toolId: allTools[0]?.id || "", role: "for general reasoning" },
      { toolId: allTools[1]?.id || "", role: "for coding & UI" },
      { toolId: allTools[2]?.id || "", role: "for research & search" }
    ];
  } else if (normalizedSlug === "video-production-pipeline") {
    defaultTools = [
      { toolId: allTools[3]?.id || allTools[0]?.id || "", role: "for media & video" },
      { toolId: allTools[2]?.id || "", role: "for script research" },
      { toolId: allTools[1]?.id || "", role: "for automated workflows" }
    ];
  } else {
    defaultTools = [
      { toolId: allTools[1]?.id || "", role: "for code completion" },
      { toolId: allTools[0]?.id || "", role: "for debugging & refactoring" },
      { toolId: allTools[4]?.id || allTools[2]?.id || "", role: "for extensions & plugins" }
    ];
  }

  const items: StackItemWithTool[] = defaultTools
    .filter(d => !!d.toolId)
    .map((d, index) => ({
      stack_id: matchedStack.id,
      tool_id: d.toolId,
      role_label: d.role,
      sort_order: index,
      tool: allTools.find(t => t.id === d.toolId)
    }));

  return {
    ...matchedStack,
    items
  };
}

export async function fetchStacksForTool(toolId: string): Promise<Stack[]> {
  try {
    const { data: itemRows, error } = await supabase
      .from("stack_items")
      .select("stack_id")
      .eq("tool_id", toolId);

    if (!error && itemRows && itemRows.length > 0) {
      const stackIds = itemRows.map(r => r.stack_id);
      const { data: stacksData } = await supabase
        .from("stacks")
        .select("*")
        .in("id", stackIds);

      if (stacksData) return stacksData;
    }
  } catch (err) {
    console.warn("Error fetching stacks for tool:", err);
  }

  // Fallback match from editorial placeholder stacks
  const allTools = await mockDb.getTools();
  const matchedStacks: Stack[] = [];

  for (const stack of PLACEHOLDER_EDITORIAL_STACKS) {
    const fullStack = await fetchStackBySlug(stack.slug);
    if (fullStack?.items?.some(i => i.tool_id === toolId)) {
      matchedStacks.push(stack);
    }
  }

  // If no specific match, attach to first placeholder stack for demonstration
  if (matchedStacks.length === 0 && allTools.length > 0) {
    const firstToolId = allTools[0]?.id;
    if (toolId === firstToolId) {
      matchedStacks.push(PLACEHOLDER_EDITORIAL_STACKS[0]);
    }
  }

  return matchedStacks;
}
