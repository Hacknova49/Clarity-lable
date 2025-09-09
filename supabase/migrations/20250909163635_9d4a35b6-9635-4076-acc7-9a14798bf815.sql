-- Update RLS policy to allow users to create their own projects
DROP POLICY IF EXISTS "Admins can create projects" ON projects;

-- Allow users to create projects where they are the creator
CREATE POLICY "Users can create projects" 
ON projects 
FOR INSERT 
WITH CHECK (created_by = auth.uid());

-- Allow project creators to update their own projects (in addition to admins)
DROP POLICY IF EXISTS "Admins can update projects" ON projects;

CREATE POLICY "Creators and admins can update projects" 
ON projects 
FOR UPDATE 
USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::user_role));