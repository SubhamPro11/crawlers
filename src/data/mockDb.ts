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
  why_indexed?: string;
  starting_price?: string;
  pricing_url?: string;
  last_checked_at?: string;
  categories?: {
    name: string;
    slug: string;
  };
}

export interface CategoryGroup {
  id: string;
  name: string;
  slugs: string[];
  keywords: string[];
}

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: "text-writing",
    name: "Text & Writing",
    slugs: ["writing-assistants", "copywriting", "storytelling", "transcription", "translator", "localization", "resume-tools", "document-ai", "documentation", "note-taking-apps", "newsletters", "ai-newsletters"],
    keywords: ["writing", "copywrite", "transcribe", "translate", "localiz", "resume", "document", "note", "letter", "summariz"]
  },
  {
    id: "audio-video",
    name: "Audio, Video & Media",
    slugs: ["video", "video-editor", "video-generator", "video-enhancer", "video-subtitling", "talking-avatar-generator", "animation", "music-generation", "audio", "voice-cloning", "podcast", "dubbing", "text-to-speech"],
    keywords: ["video", "avatar", "animat", "music", "audio", "voice", "podcast", "dub"]
  },
  {
    id: "design-creative",
    name: "Design & 3D Creative",
    slugs: ["image-generation", "image-editing", "background-remover", "logo-generator", "character-design", "infographics", "graphic-design", "fashion", "architecture", "ar-vr", "3d", "3d-printing", "meme-generator", "creative-media"],
    keywords: ["image", "design", "creative", "logo", "graphic", "fashion", "architecture", "vr", "3d", "meme", "remover"]
  },
  {
    id: "productivity-business",
    name: "Productivity & Business",
    slugs: ["productivity", "project-management", "calendar-scheduling", "meeting-assistants", "crm", "hr", "recruiting", "compliance", "tax-accounting", "contract-management", "business-tools", "email-assistants", "spreadsheets", "mind-mapping", "automation", "workflow-automation", "diagramming", "events", "nonprofit", "presentation", "finance", "fintech", "knowledge-management"],
    keywords: ["productiv", "project", "calendar", "schedul", "meeting", "crm", "hr", "recruit", "complian", "tax", "account", "contract", "business", "email", "spreadsheet", "mind"]
  },
  {
    id: "dev-tech",
    name: "Developer & Tech Tools",
    slugs: ["developer-tools", "devtools", "code-assistant", "software-testing", "no-code", "app-builders", "website-builders", "cloud-management", "debugging", "web3", "robotics", "iot", "prompt-tools", "api-tools", "ai-extensions", "extensions-chatgpt"],
    keywords: ["dev", "code", "software", "test", "build", "cloud", "debug", "web3", "robot", "iot", "extension"]
  },
  {
    id: "data-security",
    name: "Data, Models & Security",
    slugs: ["database-tools", "observability", "cybersecurity", "privacy", "identity", "synthetic-data", "data-labeling", "data", "models", "leaderboards-benchmarks", "computer-vision", "content-moderation"],
    keywords: ["data", "db", "security", "privacy", "identity", "model", "vision", "observab"]
  },
  {
    id: "marketing-sales",
    name: "Marketing, Sales & SEO",
    slugs: ["marketing", "sales-tools", "lead-generation", "seo", "social-media-tools", "ad-generator", "e-commerce", "market-research"],
    keywords: ["market", "sale", "lead", "seo", "social", "ad-"]
  },
  {
    id: "search-agents",
    name: "Search, Chat & AI Agents",
    slugs: ["search-research", "search-engines", "local-search-engines", "ai-directories", "chatbot-builders", "chatbots", "ai-agents", "personal-assistants", "ai-companion", "customer-support", "general-reasoning", "sentiment-analysis", "research-tools"],
    keywords: ["search", "engine", "directory", "chat", "agent", "assist", "companion", "support", "reasoning", "sentiment"]
  },
  {
    id: "education-lifestyle",
    name: "Education & Lifestyle",
    slugs: ["academia", "learning-tools", "language-learning", "reading", "parenting", "dating", "wellness", "fitness", "sports-analytics", "pets", "travel", "others", "accessibility", "food", "gaming", "job-tools", "nutrition", "mental-health"],
    keywords: ["academia", "learn", "read", "parent", "date", "well", "fit", "sport", "pet", "travel", "other"]
  },
  {
    id: "science-industry",
    name: "Science, Health & Industry",
    slugs: ["farming", "construction", "manufacturing", "real-estate", "home-design", "insurance", "government", "healthcare", "telemedicine", "medical-imaging", "drug-discovery", "biotech", "cleantech", "energy", "climate", "weather", "space-tech", "legal-assistants", "patent-tools", "fleet-management", "supply-chain", "geospatial"],
    keywords: ["farm", "construct", "manufactur", "estate", "house", "insurance", "govern", "health", "medic", "drug", "bio", "clean", "energy", "climate", "weather", "space", "legal", "patent", "fleet", "chain", "geo"]
  }
];

export const getCategoryGroup = (cat: Category): CategoryGroup => {
  if (!cat || !cat.slug) {
    return CATEGORY_GROUPS[8]; // Default fallback: Education & Lifestyle
  }
  const slug = cat.slug.toLowerCase();
  
  // 1. Direct Slug Match
  for (const group of CATEGORY_GROUPS) {
    if (group.slugs.includes(slug)) {
      return group;
    }
  }
  
  // 2. Keyword Match
  for (const group of CATEGORY_GROUPS) {
    for (const kw of group.keywords) {
      if (slug.includes(kw)) {
        return group;
      }
    }
  }
  
  // Default fallback: Education & Lifestyle
  return CATEGORY_GROUPS[8];
};

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
  },
  {
    id: "fe1ee758-4faf-4b9f-873a-bb95a5939552",
    name: "AI Extensions",
    slug: "ai-extensions",
    description: "Browser extensions, ChatGPT extensions, and AI plugins for Chrome, Firefox, and web workflows."
  }
];

class MockDb {
  async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching categories:", error.message);
        return CATEGORIES;
      }
      return data && data.length > 0 ? data : CATEGORIES;
    } catch (err) {
      console.error("Uncaught exception in getCategories:", err);
      return CATEGORIES;
    }
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    try {
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
    } catch (err) {
      console.error("Uncaught exception in getCategoryBySlug:", err);
      return undefined;
    }
  }

  async getTools(): Promise<Tool[]> {
    try {
      let allTools: Tool[] = [];
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        const { data, error } = await supabase
          .from("tools")
          .select("*, categories(name, slug)")
          .eq("status", "active")
          .range(from, to);

        if (error) {
          console.error("Error fetching tools chunk:", error.message);
          break;
        }

        if (data && data.length > 0) {
          allTools = allTools.concat(data as Tool[]);
          if (data.length < pageSize) {
            hasMore = false;
          } else {
            page++;
          }
        } else {
          hasMore = false;
        }
      }

      return allTools;
    } catch (err) {
      console.error("Uncaught exception in getTools:", err);
      return [];
    }
  }

  async getToolsByCategory(categoryId: string): Promise<Tool[]> {
    try {
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
    } catch (err) {
      console.error("Uncaught exception in getToolsByCategory:", err);
      return [];
    }
  }

  async getToolById(id: string): Promise<Tool | undefined> {
    try {
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
    } catch (err) {
      console.error("Uncaught exception in getToolById:", err);
      return undefined;
    }
  }

  async getActiveToolById(id: string): Promise<Tool | undefined> {
    try {
      const { data, error } = await supabase
        .from("tools")
        .select("*, categories(name, slug)")
        .eq("id", id)
        .eq("status", "active")
        .single();

      if (error) {
        console.error("Error fetching active tool by ID:", error.message);
        return undefined;
      }
      return data || undefined;
    } catch (err) {
      console.error("Uncaught exception in getActiveToolById:", err);
      return undefined;
    }
  }

  async getToolByIdForAdmin(id: string): Promise<Tool | undefined> {
    return this.getToolById(id);
  }

  async searchTools(query: string): Promise<Tool[]> {
    try {
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
    } catch (err) {
      console.error("Uncaught exception in searchTools:", err);
      return [];
    }
  }

  async incrementClickCount(id: string): Promise<boolean> {
    try {
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
    } catch (err) {
      console.error("Uncaught exception in incrementClickCount:", err);
      return false;
    }
  }

  async submitTool(tool: Omit<Tool, 'id' | 'click_count' | 'status' | 'last_crawled_at' | 'created_at' | 'source' | 'categories'>): Promise<Tool | null> {
    try {
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
    } catch (err) {
      console.error("Uncaught exception in submitTool:", err);
      return null;
    }
  }

  async checkDuplicate(name: string, url: string): Promise<boolean> {
    try {
      const cleanName = name.trim().toLowerCase();
      const cleanUrl = url.trim().toLowerCase().replace(/\/$/, "");

      const { data: allTools, error } = await supabase
        .from("tools")
        .select("name, url");

      if (error || !allTools) {
        console.error("Error checking duplicate:", error?.message);
        return false;
      }

      return allTools.some(t => {
        const dbName = t.name.trim().toLowerCase();
        const dbUrl = t.url.trim().toLowerCase().replace(/\/$/, "");
        return dbName === cleanName || dbUrl === cleanUrl || dbUrl.includes(cleanUrl) || cleanUrl.includes(dbUrl);
      });
    } catch (err) {
      console.error("Uncaught exception in checkDuplicate:", err);
      return false;
    }
  }

  async adminInsertTool(tool: Omit<Tool, 'id' | 'click_count' | 'status' | 'last_crawled_at' | 'created_at' | 'source' | 'categories'>): Promise<Tool | null> {
    try {
      const newTool = {
        ...tool,
        click_count: 0,
        status: 'active',
        source: 'admin_bulk_upload',
        last_crawled_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from("tools")
        .insert(newTool)
        .select()
        .single();

      if (error) {
        console.error("Error admin inserting tool:", error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.error("Uncaught exception in adminInsertTool:", err);
      return null;
    }
  }

  async getPendingTools(): Promise<Tool[]> {
    try {
      const { data, error } = await supabase
        .from("tools")
        .select("*, categories(name, slug)")
        .eq("status", "needs_review");

      if (error) {
        console.error("Error fetching pending tools:", error.message);
        return [];
      }
      return data || [];
    } catch (err) {
      console.error("Uncaught exception in getPendingTools:", err);
      return [];
    }
  }

  async approveTool(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("tools")
        .update({ status: "active" })
        .eq("id", id);

      if (error) {
        console.error("Error approving tool:", error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error("Uncaught exception in approveTool:", err);
      return false;
    }
  }

  async rejectTool(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("tools")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error rejecting tool:", error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error("Uncaught exception in rejectTool:", err);
      return false;
    }
  }

  async getToolsByTag(tag: string): Promise<Tool[]> {
    try {
      const { data, error } = await supabase
        .from("tools")
        .select("*, categories(name, slug)")
        .contains("tags", [tag])
        .eq("status", "active")
        .order("name");

      if (error) {
        console.error("Error fetching tools by tag:", error.message);
        return [];
      }
      return data || [];
    } catch (err) {
      console.error("Uncaught exception in getToolsByTag:", err);
      return [];
    }
  }

  async getSimilarTools(currentToolId: string, categoryId: string, tags: string[]): Promise<Tool[]> {
    try {
      let results: Tool[] = [];

      // 1. Same category first
      if (categoryId) {
        const { data: catTools, error: catError } = await supabase
          .from("tools")
          .select("*, categories(name, slug)")
          .eq("category_id", categoryId)
          .eq("status", "active");

        if (catError) {
          console.error("Error fetching similar tools by category:", catError.message);
        } else if (catTools) {
          results = catTools.filter((item) => item.id !== currentToolId);
        }
      }

      // 2. If fewer than 3 results, backfill with tools sharing at least one overlapping tag
      if (results.length < 3 && tags && tags.length > 0) {
        const { data: tagTools, error: tagError } = await supabase
          .from("tools")
          .select("*, categories(name, slug)")
          .overlaps("tags", tags)
          .eq("status", "active");

        if (tagError) {
          console.error("Error fetching similar tools by tags:", tagError.message);
        } else if (tagTools) {
          const existingIds = new Set(results.map((r) => r.id));
          const tagFiltered = tagTools.filter(
            (item) => item.id !== currentToolId && !existingIds.has(item.id)
          );
          results = [...results, ...tagFiltered];
        }
      }

      return results;
    } catch (err) {
      console.error("Uncaught exception in getSimilarTools:", err);
      return [];
    }
  }

  async getPopularQueries(): Promise<string[]> {
    try {
      // Future-proofing: this will pull from a query logging table.
      // For now, it returns the seed list of top searches.
      return [
        "generate an image",
        "summarize a video",
        "code assistant",
        "transcribe audio",
        "translate text"
      ];
    } catch (err) {
      console.error("Error in getPopularQueries:", err);
      return [];
    }
  }

  async getToolsByTagSlug(slug: string): Promise<{ tools: Tool[]; tagName: string }> {
    try {
      const allTools = await this.getTools();
      const uniqueTags = new Set<string>();
      allTools.forEach((t) => {
        if (t.tags) {
          t.tags.forEach((tag) => uniqueTags.add(tag.trim()));
        }
      });

      let matchedTagName = "";
      for (const tag of uniqueTags) {
        if (slugify(tag) === slug) {
          matchedTagName = tag;
          break;
        }
      }

      if (!matchedTagName) {
        matchedTagName = slug.replace(/-/g, " ");
      }

      const matchedTools = allTools.filter((t) =>
        t.tags && t.tags.some((tag) => tag.trim().toLowerCase() === matchedTagName.toLowerCase())
      );

      return {
        tools: matchedTools,
        tagName: matchedTagName
      };
    } catch (err) {
      console.error("Error in getToolsByTagSlug:", err);
      return { tools: [], tagName: slug.replace(/-/g, " ") };
    }
  }
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export const mockDb = new MockDb();
