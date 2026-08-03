-- Migration: Create stacks and stack_items tables for editorial workflow stacks
-- Section 2: Stack / Workflow Pages

-- 1. Create stacks table
CREATE TABLE IF NOT EXISTS public.stacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create stack_items junction table
CREATE TABLE IF NOT EXISTS public.stack_items (
  stack_id UUID NOT NULL REFERENCES public.stacks(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  role_label TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (stack_id, tool_id)
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.stacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stack_items ENABLE ROW LEVEL SECURITY;

-- 4. Public Read RLS Policies
CREATE POLICY "Allow public read access for stacks"
  ON public.stacks FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access for stack_items"
  ON public.stack_items FOR SELECT
  USING (true);
