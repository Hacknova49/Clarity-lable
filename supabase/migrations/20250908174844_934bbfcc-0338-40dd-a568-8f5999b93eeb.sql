-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('admin', 'annotator', 'reviewer');

-- Create annotation types enum  
CREATE TYPE public.annotation_type AS ENUM ('bounding_box', 'polygon', 'keypoint', 'classification', 'mask');

-- Create project status enum
CREATE TYPE public.project_status AS ENUM ('active', 'completed', 'paused');

-- Create image status enum
CREATE TYPE public.image_status AS ENUM ('pending', 'in_progress', 'completed', 'reviewed', 'rejected');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'annotator',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status project_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create project members table
CREATE TABLE public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'annotator',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Enable RLS on project members
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- Create labels table
CREATE TABLE public.labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  annotation_type annotation_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, name)
);

-- Enable RLS on labels
ALTER TABLE public.labels ENABLE ROW LEVEL SECURITY;

-- Create images table
CREATE TABLE public.images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  status image_status NOT NULL DEFAULT 'pending',
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on images
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

-- Create annotations table
CREATE TABLE public.annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_id UUID NOT NULL REFERENCES public.images(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES public.labels(id) ON DELETE CASCADE,
  annotation_data JSONB NOT NULL, -- Stores coordinates, points, etc.
  annotation_type annotation_type NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_approved BOOLEAN DEFAULT NULL, -- NULL = pending, TRUE = approved, FALSE = rejected
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on annotations
ALTER TABLE public.annotations ENABLE ROW LEVEL SECURITY;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_images_updated_at
  BEFORE UPDATE ON public.images
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_annotations_updated_at
  BEFORE UPDATE ON public.annotations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for projects
CREATE POLICY "Admins can view all projects"
  ON public.projects FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Members can view assigned projects"
  ON public.projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_id = projects.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can create projects"
  ON public.projects FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update projects"
  ON public.projects FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for project members
CREATE POLICY "Admins can manage project members"
  ON public.project_members FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their project memberships"
  ON public.project_members FOR SELECT
  USING (user_id = auth.uid());

-- RLS Policies for labels
CREATE POLICY "Project members can view labels"
  ON public.labels FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_id = labels.project_id AND user_id = auth.uid()
    ) OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can manage labels"
  ON public.labels FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for images
CREATE POLICY "Project members can view images"
  ON public.images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_id = images.project_id AND user_id = auth.uid()
    ) OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can manage images"
  ON public.images FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for annotations
CREATE POLICY "Project members can view annotations"
  ON public.annotations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      JOIN public.images i ON i.project_id = pm.project_id
      WHERE i.id = annotations.image_id AND pm.user_id = auth.uid()
    ) OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Annotators can create annotations"
  ON public.annotations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      JOIN public.images i ON i.project_id = pm.project_id
      WHERE i.id = annotations.image_id AND pm.user_id = auth.uid()
    ) AND created_by = auth.uid()
  );

CREATE POLICY "Users can update own annotations"
  ON public.annotations FOR UPDATE
  USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'reviewer') OR public.has_role(auth.uid(), 'admin'));