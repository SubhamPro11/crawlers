-- Migration: Add description_long column to categories table for editorial category summary blurbs
-- Section 4: Category Summary Blurbs

ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS description_long TEXT;
