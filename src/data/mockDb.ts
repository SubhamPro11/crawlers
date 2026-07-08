import { supabase } from "@/lib/supabaseClient";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface Tool {
  id: string;
  name: string;
  url: string;
  short_description: string;
  category_id: string;
  tags: string[];
  pricing_model: 'free' | 'freemium' | 'paid' | 'unknown';
  logo_url?: string;
  source: string;
  status: 'active' | 'broken_link' | 'needs_review';
  click_count: number;
  last_crawled_at: string;
  created_at: string;
  categories?: {
    name: string;
    slug: string;
  };
}

export const CATEGORIES: Category[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "General Reasoning",
    slug: "general-reasoning",
    description: "Multi-step advanced reasoning, data analysis, custom memory, and everyday productivity tasks."
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    name: "Developer Tools",
    slug: "developer-tools",
    description: "AI-first code editors, browser sandboxes, and UI generation utilities."
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    name: "Search & Research",
    slug: "search-research",
    description: "Conversational search engines and document grounding workspaces."
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    name: "Creative & Media",
    slug: "creative-media",
    description: "Image generation, audio, music, and stylistic media utilities."
  }
];

class MockDb {
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error.message);
      return CATEGORIES;
    }
    return data || [];
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      console.error("Error fetching category by slug:", error.message);
      return undefined;
    }
    return data || undefined;
  }

  async getTools(): Promise<Tool[]> {
    const { data, error } = await supabase
      .from("tools")
      .select("*, categories(name, slug)")
      .eq("status", "active");

    if (error) {
      console.error("Error fetching tools:", error.message);
      return [];
    }
    return data || [];
  }

  async getToolsByCategory(categoryId: string): Promise<Tool[]> {
    const { data, error } = await supabase
      .from("tools")
      .select("*, categories(name, slug)")
      .eq("category_id", categoryId)
      .eq("status", "active");

    if (error) {
      console.error("Error fetching tools by category:", error.message);
      return [];
    }
    return data || [];
  }

  async getToolById(id: string): Promise<Tool | undefined> {
    const { data, error } = await supabase
      .from("tools")
      .select("*, categories(name, slug)")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching tool by ID:", error.message);
      return undefined;
    }
    return data || undefined;
  }

  async searchTools(query: string): Promise<Tool[]> {
    const lc = query.toLowerCase().trim();
    if (!lc) return this.getTools();

    const { data, error } = await supabase
      .from("tools")
      .select("*, categories(name, slug)")
      .eq("status", "active")
      .or(`name.ilike.%${lc}%,short_description.ilike.%${lc}%`);

    if (error) {
      console.error("Error searching tools:", error.message);
      return [];
    }
    return data || [];
  }

  async incrementClickCount(id: string): Promise<boolean> {
    const { data: tool, error: fetchError } = await supabase
      .from("tools")
      .select("click_count")
      .eq("id", id)
      .single();

    if (fetchError || !tool) {
      console.error("Error fetching tool for click:", fetchError?.message);
      return false;
    }

    const { error: updateError } = await supabase
      .from("tools")
      .update({ click_count: (tool.click_count || 0) + 1 })
      .eq("id", id);

    if (updateError) {
      console.error("Error updating click count:", updateError.message);
      return false;
    }
    return true;
  }

  async submitTool(tool: Omit<Tool, 'id' | 'click_count' | 'status' | 'last_crawled_at' | 'created_at' | 'source' | 'categories'>): Promise<Tool | null> {
    const newTool = {
      ...tool,
      click_count: 0,
      status: 'needs_review',
      source: 'manual_submission',
      last_crawled_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("tools")
      .insert(newTool)
      .select()
      .single();

    if (error) {
      console.error("Error submitting tool:", error.message);
      return null;
    }
    return data;
  }
}

export const mockDb = new MockDb();
