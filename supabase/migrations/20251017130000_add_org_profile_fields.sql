-- Add organisation-specific profile fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS org_name TEXT,
  ADD COLUMN IF NOT EXISTS org_website TEXT;
