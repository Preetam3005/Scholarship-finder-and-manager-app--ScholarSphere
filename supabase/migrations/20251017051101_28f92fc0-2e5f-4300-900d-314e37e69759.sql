-- Create role enum
CREATE TYPE public.app_role AS ENUM ('student', 'organization');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policy for user_roles: users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Add created_by column to scholarships to track which organization created them
ALTER TABLE public.scholarships
ADD COLUMN created_by UUID REFERENCES auth.users(id);

-- Update scholarships RLS policies
DROP POLICY IF EXISTS "Only authenticated users can manage scholarships" ON public.scholarships;

CREATE POLICY "Organizations can insert scholarships"
ON public.scholarships
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'organization'));

CREATE POLICY "Organizations can update their own scholarships"
ON public.scholarships
FOR UPDATE
USING (created_by = auth.uid() AND public.has_role(auth.uid(), 'organization'));

CREATE POLICY "Organizations can delete their own scholarships"
ON public.scholarships
FOR DELETE
USING (created_by = auth.uid() AND public.has_role(auth.uid(), 'organization'));

-- Update applications RLS policies to allow organizations to view applications for their scholarships
CREATE POLICY "Organizations can view applications for their scholarships"
ON public.applications
FOR SELECT
USING (
  public.has_role(auth.uid(), 'organization') AND
  EXISTS (
    SELECT 1 FROM public.scholarships
    WHERE scholarships.id = applications.scholarship_id
    AND scholarships.created_by = auth.uid()
  )
);

CREATE POLICY "Organizations can update applications for their scholarships"
ON public.applications
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'organization') AND
  EXISTS (
    SELECT 1 FROM public.scholarships
    WHERE scholarships.id = applications.scholarship_id
    AND scholarships.created_by = auth.uid()
  )
);

-- Trigger to automatically assign role during profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Get role from profile and insert into user_roles
  IF NEW.category = 'Organization' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'organization');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'student');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_role();