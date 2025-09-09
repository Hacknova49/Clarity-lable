/*
  # Allow project creators to add themselves as members

  1. Security Changes
    - Add RLS policy to allow project creators to insert themselves as members
    - This enables non-admin users to create projects and automatically become members
    
  2. Policy Details
    - Users can insert themselves into project_members table
    - Only for projects they created (created_by = auth.uid())
    - Only adding themselves (user_id = auth.uid())
*/

CREATE POLICY "Project creator can add themselves as member" 
ON public.project_members 
FOR INSERT 
WITH CHECK (
  project_id IN (
    SELECT id FROM public.projects WHERE created_by = auth.uid()
  ) 
  AND user_id = auth.uid()
);