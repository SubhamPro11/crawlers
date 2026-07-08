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
}

export const CATEGORIES: Category[] = [
  {
    id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    name: "Image Generation",
    slug: "image-generation",
    description: "Create art, photorealistic photos, and graphics using text descriptions."
  },
  {
    id: "b2c3d4e5-f67a-8b9c-0d1e-2f3a4b5c6d7e",
    name: "Text Extraction / OCR",
    slug: "text-extraction-ocr",
    description: "Extract text, tables, and structured data from images, PDFs, and scanned documents."
  },
  {
    id: "c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f",
    name: "Text Summarization",
    slug: "text-summarization",
    description: "Condense long articles, PDFs, meetings, or videos into key bullet points and summaries."
  },
  {
    id: "d4e5f67a-8b9c-0d1e-2f3a-4b5c6d7e8f9a",
    name: "Chatbots / Conversational AI",
    slug: "chatbots-conversational-ai",
    description: "General-purpose chat assistants, companion bots, and custom conversational agents."
  },
  {
    id: "e5f67a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
    name: "Video Generation & Editing",
    slug: "video-generation-editing",
    description: "Create videos from text prompts, auto-edit clips, or generate avatars."
  },
  {
    id: "f67a8b9c-0d1e-2f3a-4b5c-6d7e8f9a0b1c",
    name: "Audio / Voice / Music Generation",
    slug: "audio-voice-music",
    description: "Text-to-speech, voice cloning, music generation, and audio cleanup."
  },
  {
    id: "7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
    name: "Code Generation & Dev Tools",
    slug: "code-generation-dev-tools",
    description: "Write code, debug errors, explain code bases, and automate software development."
  },
  {
    id: "8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e",
    name: "Writing & Copywriting",
    slug: "writing-copywriting",
    description: "Write blog posts, marketing copies, essays, emails, and landing page content."
  },
  {
    id: "9c0d1e2f-3a4b-5c6d-7e8f-9a0b1c2d3e4f",
    name: "Data Analysis",
    slug: "data-analysis",
    description: "Analyze datasets, build charts, clean data, and run statistical formulas using natural language."
  },
  {
    id: "0d1e2f3a-4b5c-6d7e-8f9a-0b1c2d3e4f5a",
    name: "Productivity / Automation",
    slug: "productivity-automation",
    description: "Automate calendar workflows, generate spreadsheets, and build custom automated agents."
  },
  {
    id: "1e2f3a4b-5c6d-7e8f-9a0b-1c2d3e4f5a6b",
    name: "Research & Search",
    slug: "research-search",
    description: "Scientific paper search, citation mapping, and web searching with detailed source reporting."
  },
  {
    id: "2f3a4b5c-6d7e-8f9a-0b1c-2d3e4f5a6b7c",
    name: "Translation",
    slug: "translation",
    description: "Translate documents, audio, and live speech with high context accuracy."
  },
  {
    id: "3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d",
    name: "Design & UI Tools",
    slug: "design-ui-tools",
    description: "Generate UI designs, remove backgrounds, edit vector graphics, and create design mockups."
  }
];

class MockDb {
  getCategories(): Category[] {
    return CATEGORIES;
  }

  getCategoryBySlug(slug: string): Category | undefined {
    return CATEGORIES.find(c => c.slug === slug);
  }

  async getTools(): Promise<Tool[]> {
    const { data, error } = await supabase
      .from("tools")
      .select("*")
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
      .select("*")
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
      .select("*")
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

    // Use full-text search style or custom text filter
    const { data, error } = await supabase
      .from("tools")
      .select("*")
      .eq("status", "active")
      .or(`name.ilike.%${lc}%,short_description.ilike.%${lc}%`);

    if (error) {
      console.error("Error searching tools:", error.message);
      return [];
    }
    return data || [];
  }

  async incrementClickCount(id: string): Promise<boolean> {
    // Increment count using rpc or fetch-update
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

  async submitTool(tool: Omit<Tool, 'id' | 'click_count' | 'status' | 'last_crawled_at' | 'created_at' | 'source'>): Promise<Tool | null> {
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
