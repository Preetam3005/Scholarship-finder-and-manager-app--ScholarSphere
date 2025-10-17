-- Add org_logo_url column to profiles and create org-logos storage bucket
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_org BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_org_approved BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS org_name TEXT,
  ADD COLUMN IF NOT EXISTS org_website TEXT,
  ADD COLUMN IF NOT EXISTS org_logo_url TEXT;

-- Storage bucket for org logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('org-logos', 'org-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for org logos
CREATE POLICY IF NOT EXISTS "Anyone can view org logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'org-logos');

CREATE POLICY IF NOT EXISTS "Orgs can upload their own logo"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'org-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY IF NOT EXISTS "Orgs can update their own logo"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'org-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY IF NOT EXISTS "Orgs can delete their own logo"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'org-logos' AND auth.uid()::text = (storage.foldername(name))[1]);
