-- Add is_org_approved flag to profiles to support organisation approval workflow
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_org_approved BOOLEAN NOT NULL DEFAULT FALSE;

-- Optionally, create an index to speed up queries for pending approvals
CREATE INDEX IF NOT EXISTS idx_profiles_is_org_pending ON public.profiles (is_org, is_org_approved);
