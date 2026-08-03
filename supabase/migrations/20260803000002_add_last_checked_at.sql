-- Migration: Add last_checked_at column to tools table if not present
-- Section 3: Per-Tool "Last Verified" Badge

ALTER TABLE public.tools 
ADD COLUMN IF NOT EXISTS last_checked_at TIMESTAMPTZ DEFAULT now();
