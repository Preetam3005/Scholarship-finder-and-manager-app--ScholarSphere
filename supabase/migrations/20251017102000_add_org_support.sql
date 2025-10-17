-- Add organisation support: profiles.is_org and scholarships.owner_id

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_org BOOLEAN NOT NULL DEFAULT FALSE;

-- Add owner_id to scholarships so organisations can own scholarships
ALTER TABLE public.scholarships
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Drop broad policy that allowed any authenticated user to manage scholarships
DROP POLICY IF EXISTS "Only authenticated users can manage scholarships" ON public.scholarships;

-- Allow anyone to view scholarships (keep public read)
DROP POLICY IF EXISTS "Anyone can view scholarships" ON public.scholarships;
CREATE POLICY "Anyone can view scholarships"
  ON public.scholarships FOR SELECT
  USING (true);

-- Organisations can insert scholarships where they are owner
CREATE POLICY "Orgs can insert their own scholarships"
  ON public.scholarships FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Organisations can update/delete scholarships they own
CREATE POLICY "Orgs can update their scholarships"
  ON public.scholarships FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Orgs can delete their scholarships"
  ON public.scholarships FOR DELETE
  USING (auth.uid() = owner_id);

-- Applications: allow organisations to view/update applications for scholarships they own
DROP POLICY IF EXISTS "Users can view their own applications" ON public.applications;
CREATE POLICY "Users can view their own applications"
  ON public.applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Orgs can view applications for their scholarships"
  ON public.applications FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.scholarships s WHERE s.id = public.applications.scholarship_id AND s.owner_id = auth.uid()));

-- Allow orgs to update application status for their scholarships
DROP POLICY IF EXISTS "Users can update their own applications" ON public.applications;
CREATE POLICY "Users can update their own applications"
  ON public.applications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Orgs can update applications for their scholarships"
  ON public.applications FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.scholarships s WHERE s.id = public.applications.scholarship_id AND s.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.scholarships s WHERE s.id = public.applications.scholarship_id AND s.owner_id = auth.uid()));
