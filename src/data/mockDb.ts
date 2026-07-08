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
    id: "cat-1",
    name: "Image Generation",
    slug: "image-generation",
    description: "Create art, photorealistic photos, and graphics using text descriptions."
  },
  {
    id: "cat-2",
    name: "Text Extraction / OCR",
    slug: "text-extraction-ocr",
    description: "Extract text, tables, and structured data from images, PDFs, and scanned documents."
  },
  {
    id: "cat-3",
    name: "Text Summarization",
    slug: "text-summarization",
    description: "Condense long articles, PDFs, meetings, or videos into key bullet points and summaries."
  },
  {
    id: "cat-4",
    name: "Chatbots / Conversational AI",
    slug: "chatbots-conversational-ai",
    description: "General-purpose chat assistants, companion bots, and custom conversational agents."
  },
  {
    id: "cat-5",
    name: "Video Generation & Editing",
    slug: "video-generation-editing",
    description: "Create videos from text prompts, auto-edit clips, or generate avatars."
  },
  {
    id: "cat-6",
    name: "Audio / Voice / Music Generation",
    slug: "audio-voice-music",
    description: "Text-to-speech, voice cloning, music generation, and audio cleanup."
  },
  {
    id: "cat-7",
    name: "Code Generation & Dev Tools",
    slug: "code-generation-dev-tools",
    description: "Write code, debug errors, explain code bases, and automate software development."
  },
  {
    id: "cat-8",
    name: "Writing & Copywriting",
    slug: "writing-copywriting",
    description: "Write blog posts, marketing copies, essays, emails, and landing page content."
  },
  {
    id: "cat-9",
    name: "Data Analysis",
    slug: "data-analysis",
    description: "Analyze datasets, build charts, clean data, and run statistical formulas using natural language."
  },
  {
    id: "cat-10",
    name: "Productivity / Automation",
    slug: "productivity-automation",
    description: "Automate calendar workflows, generate spreadsheets, and build custom automated agents."
  },
  {
    id: "cat-11",
    name: "Research & Search",
    slug: "research-search",
    description: "Scientific paper search, citation mapping, and web searching with detailed source reporting."
  },
  {
    id: "cat-12",
    name: "Translation",
    slug: "translation",
    description: "Translate documents, audio, and live speech with high context accuracy."
  },
  {
    id: "cat-13",
    name: "Design & UI Tools",
    slug: "design-ui-tools",
    description: "Generate UI designs, remove backgrounds, edit vector graphics, and create design mockups."
  }
];

const INITIAL_TOOLS: Tool[] = [
  // Image Generation
  {
    id: "tool-1",
    name: "Midjourney",
    url: "https://www.midjourney.com",
    short_description: "Generates highly artistic, photorealistic images from textual prompts via Discord.",
    category_id: "cat-1",
    tags: ["art", "ai-art", "photorealistic", "discord"],
    pricing_model: "paid",
    source: "seed",
    status: "active",
    click_count: 342,
    last_crawled_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: "tool-2",
    name: "DALL-E 3",
    url: "https://openai.com/dall-e-3",
    short_description: "OpenAI's state-of-the-art text-to-image generator with superior prompt adherence, built into ChatGPT.",
    category_id: "cat-1",
    tags: ["image-generator", "openai", "chatgpt"],
    pricing_model: "freemium",
    source: "seed",
    status: "active",
    click_count: 289,
    last_crawled_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: "tool-3",
    name: "Stable Diffusion Web",
    url: "https://stablediffusionweb.com",
    short_description: "Open-source text-to-image AI generator that runs without restrictions and allows local deployment.",
    category_id: "cat-1",
    tags: ["open-source", "stable-diffusion", "free-art"],
    pricing_model: "free",
    source: "seed",
    status: "active",
    click_count: 198,
    last_crawled_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  // Text Extraction / OCR
  {
    id: "tool-4",
    name: "Tesseract OCR CLI",
    url: "https://github.com/tesseract-ocr/tesseract",
    short_description: "Popular open-source OCR engine to extract text from layout configurations and images offline.",
    category_id: "cat-2",
    tags: ["open-source", "ocr", "cli", "offline"],
    pricing_model: "free",
    source: "seed",
    status: "active",
    click_count: 87,
    last_crawled_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: "tool-5",
    name: "Extractor.io",
    url: "https://extractor.io",
    short_description: "Extract structured data, tables, and raw text from complex invoices and PDF files dynamically.",
    category_id: "cat-2",
    tags: ["pdf-extraction", "tables", "invoice-processing"],
    pricing_model: "freemium",
    source: "seed",
    status: "active",
    click_count: 112,
    last_crawled_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  // Text Summarization
  {
    id: "tool-6",
    name: "TLDR This",
    url: "https://www.tldrthis.com",
    short_description: "Summarizes any article, web page, or news piece into concise bullet points, removing ad clutter.",
    category_id: "cat-3",
    tags: ["article-summarizer", "tldr", "chrome-extension"],
    pricing_model: "freemium",
    source: "seed",
    status: "active",
    click_count: 201,
    last_crawled_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: "tool-7",
    name: "Eightify",
    url: "https://eightify.app",
    short_description: "Quickly condenses long YouTube videos into summarized text, extracting key insights in seconds.",
    category_id: "cat-3",
    tags: ["youtube", "video-summarizer", "chrome-extension"],
    pricing_model: "freemium",
    source: "seed",
    status: "active",
    click_count: 165,
    last_crawled_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  // Chatbots / Conversational AI
  {
    id: "tool-8",
    name: "ChatGPT",
    url: "https://chat.openai.com",
    short_description: "OpenAI's flagship conversational assistant capable of coding, writing, research, and analysis.",
    category_id: "cat-4",
    tags: ["general-assistant", "openai", "gpt-4"],
    pricing_model: "freemium",
    source: "seed",
    status: "active",
    click_count: 512,
    last_crawled_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: "tool-9",
    name: "Claude AI",
    url: "https://claude.ai",
    short_description: "Anthropic's helpful chatbot designed with a safety-first focus, offering large context window reading.",
    category_id: "cat-4",
    tags: ["conversational-ai", "anthropic", "long-context"],
    pricing_model: "freemium",
    source: "seed",
    status: "active",
    click_count: 489,
    last_crawled_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: "tool-10",
    name: "Perplexity AI",
    url: "https://www.perplexity.ai",
    short_description: "An answer engine delivering direct answers with reliable citations, combining search and conversational LLMs.",
    category_id: "cat-4",
    tags: ["search-engine", "citations", "qa-bot"],
    pricing_model: "freemium",
    source: "seed",
    status: "active",
    click_count: 420,
    last_crawled_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  // Video Generation
  {
    id: "tool-11",
    name: "Runway Gen-2",
    url: "https://runwayml.com",
    short_description: "Generates cinematic quality videos from text descriptions, reference images, or existing raw video clips.",
    category_id: "cat-5",
    tags: ["text-to-video", "generative-video", "effects"],
    pricing_model: "freemium",
    source: "seed",
    status: "active",
    click_count: 278,
    last_crawled_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: "tool-12",
    name: "HeyGen",
    url: "https://www.heygen.com",
    short_description: "Creates realistic talking avatar videos with synchronized voiceovers for marketing and training.",
    category_id: "cat-5",
    tags: ["avatar", "talking-head", "marketing-video"],
    pricing_model: "freemium",
    source: "seed",
    status: "active",
    click_count: 194,
    last_crawled_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  // Audio / Voice / Music
  {
    id: "tool-13",
    name: "ElevenLabs",
    url: "https://elevenlabs.io",
    short_description: "Hyper-realistic text-to-speech voice generator capable of instant voice cloning and emotional tone mapping.",
    category_id: "cat-6",
    tags: ["text-to-speech", "voice-cloning", "dubbing"],
    pricing_model: "freemium",
    source: "seed",
    status: "active",
    click_count: 310,
    last_crawled_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: "tool-14",
    name: "Suno AI",
    url: "https://suno.com",
    short_description: "Generates full-length vocal songs, instrumental tracks, and complete lyrics from simple descriptions.",
    category_id: "cat-6",
    tags: ["music-generator", "vocal-tracks", "songwriting"],
    pricing_model: "freemium",
    source: "seed",
    status: "active",
    click_count: 264,
    last_crawled_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  // Code Generation
  {
    id: "tool-15",
    name: "Cursor",
    url: "https://www.cursor.com",
    short_description: "An AI-first code editor fork of VS Code designed to edit files, write code, and chat directly in context.",
    category_id: "cat-7",
    tags: ["code-editor", "autocomplete", "refactoring"],
    pricing_model: "freemium",
    source: "seed",
    status: "active",
    click_count: 456,
    last_crawled_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: "tool-16",
    name: "v0 by Vercel",
    url: "https://v0.dev",
    short_description: "Generative UI system by Vercel that creates production-ready React and Tailwind code based on mockups.",
    category_id: "cat-7",
    tags: ["react", "ui-generation", "tailwindcss"],
    pricing_model: "freemium",
    source: "seed",
    status: "active",
    click_count: 398,
    last_crawled_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  // Writing / Copywriting
  {
    id: "tool-17",
    name: "Jasper AI",
    url: "https://www.jasper.ai",
    short_description: "Enterprise copywriting tool designed for blogs, social media posts, and marketing campaigns.",
    category_id: "cat-8",
    tags: ["copywriting", "marketing", "blog-writing"],
    pricing_model: "paid",
    source: "seed",
    status: "active",
    click_count: 143,
    last_crawled_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: "tool-18",
    name: "Copy.ai",
    url: "https://www.copy.ai",
    short_description: "Writing assistant that generates sales copies, email subject lines, and blogs in multiple brand voices.",
    category_id: "cat-8",
    tags: ["content-writer", "sales-copy", "automation"],
    pricing_model: "freemium",
    source: "seed",
    status: "active",
    click_count: 155,
    last_crawled_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  // Data Analysis
  {
    id: "tool-19",
    name: "Julius AI",
    url: "https://julius.ai",
    short_description: "AI data analyst that cleans datasets, runs complex python scripts, and outputs custom regression models.",
    category_id: "cat-9",
    tags: ["data-cleaning", "data-visualization", "python"],
    pricing_model: "freemium",
    source: "seed",
    status: "active",
    click_count: 220,
    last_crawled_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  // Productivity / Automation
  {
    id: "tool-20",
    name: "Zapier Central",
    url: "https://zapier.com/central",
    short_description: "Build custom bots that listen to commands, trigger integrations, and handle multi-step actions instantly.",
    category_id: "cat-10",
    tags: ["workflow-automation", "integrations", "chat-bots"],
    pricing_model: "freemium",
    source: "seed",
    status: "active",
    click_count: 178,
    last_crawled_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  // Research & Search
  {
    id: "tool-21",
    name: "Consensus",
    url: "https://consensus.app",
    short_description: "Search engine for scientific research that compiles evidence-based claims from peer-reviewed literature.",
    category_id: "cat-11",
    tags: ["science", "research", "evidence-based"],
    pricing_model: "freemium",
    source: "seed",
    status: "active",
    click_count: 245,
    last_crawled_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  // Translation
  {
    id: "tool-22",
    name: "DeepL Translate",
    url: "https://www.deepl.com",
    short_description: "Neural network-based translation tool delivering precise nuances across global languages.",
    category_id: "cat-12",
    tags: ["translator", "multilingual", "dictionary"],
    pricing_model: "freemium",
    source: "seed",
    status: "active",
    click_count: 290,
    last_crawled_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  // Design & UI
  {
    id: "tool-23",
    name: "Photoroom",
    url: "https://www.photoroom.com",
    short_description: "Object detection background remover that edits studio-quality product photos in seconds.",
    category_id: "cat-13",
    tags: ["photo-editing", "background-remover", "product-shots"],
    pricing_model: "freemium",
    source: "seed",
    status: "active",
    click_count: 185,
    last_crawled_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  }
];

class MockDb {
  private tools: Tool[] = [];
  private initialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') {
      this.tools = [...INITIAL_TOOLS];
      return;
    }
    const stored = localStorage.getItem('ai_tools_db');
    if (stored) {
      try {
        this.tools = JSON.parse(stored);
        this.initialized = true;
      } catch (e) {
        this.tools = [...INITIAL_TOOLS];
      }
    } else {
      this.tools = [...INITIAL_TOOLS];
      this.save();
      this.initialized = true;
    }
  }

  private save() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ai_tools_db', JSON.stringify(this.tools));
    }
  }

  getCategories(): Category[] {
    return CATEGORIES;
  }

  getCategoryBySlug(slug: string): Category | undefined {
    return CATEGORIES.find(c => c.slug === slug);
  }

  getTools(): Tool[] {
    this.init();
    return this.tools.filter(t => t.status === 'active');
  }

  getToolsByCategory(categoryId: string): Tool[] {
    this.init();
    return this.tools.filter(t => t.category_id === categoryId && t.status === 'active');
  }

  getToolById(id: string): Tool | undefined {
    this.init();
    return this.tools.find(t => t.id === id);
  }

  searchTools(query: string): Tool[] {
    this.init();
    const lc = query.toLowerCase().trim();
    if (!lc) return this.getTools();
    return this.tools.filter(t => 
      t.status === 'active' && 
      (t.name.toLowerCase().includes(lc) || 
       t.short_description.toLowerCase().includes(lc) ||
       t.tags.some(tag => tag.toLowerCase().includes(lc)))
    );
  }

  incrementClickCount(id: string): boolean {
    this.init();
    const index = this.tools.findIndex(t => t.id === id);
    if (index !== -1) {
      this.tools[index].click_count += 1;
      this.save();
      return true;
    }
    return false;
  }

  submitTool(tool: Omit<Tool, 'id' | 'click_count' | 'status' | 'last_crawled_at' | 'created_at' | 'source'>): Tool {
    this.init();
    const newTool: Tool = {
      ...tool,
      id: `tool-${Date.now()}`,
      click_count: 0,
      status: 'needs_review',
      source: 'manual_submission',
      last_crawled_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    this.tools.push(newTool);
    this.save();
    return newTool;
  }

  // Admin access to review items
  getPendingTools(): Tool[] {
    this.init();
    return this.tools.filter(t => t.status === 'needs_review');
  }

  approveTool(id: string): boolean {
    this.init();
    const index = this.tools.findIndex(t => t.id === id);
    if (index !== -1) {
      this.tools[index].status = 'active';
      this.save();
      return true;
    }
    return false;
  }
}

export const mockDb = new MockDb();
