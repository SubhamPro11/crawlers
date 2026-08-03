-- Migration: Create user_collections and user_collection_items tables with RLS
-- Section 1: Personal Collections

-- 1. Create user_collections table
CREATE TABLE IF NOT EXISTS public.user_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create user_collection_items junction table
CREATE TABLE IF NOT EXISTS public.user_collection_items (
  collection_id UUID NOT NULL REFERENCES public.user_collections(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (collection_id, tool_id)
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.user_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_collection_items ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for user_collections
CREATE POLICY "Users can view their own collections"
  ON public.user_collections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own collections"
  ON public.user_collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections"
  ON public.user_collections FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections"
  ON public.user_collections FOR DELETE
  USING (auth.uid() = user_id);

-- 5. RLS Policies for user_collection_items
CREATE POLICY "Users can view items in their own collections"
  ON public.user_collection_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_collections uc
      WHERE uc.id = user_collection_items.collection_id
      AND uc.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add items to their own collections"
  ON public.user_collection_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_collections uc
      WHERE uc.id = user_collection_items.collection_id
      AND uc.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove items from their own collections"
  ON public.user_collection_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_collections uc
      WHERE uc.id = user_collection_items.collection_id
      AND uc.user_id = auth.uid()
    )
  );
