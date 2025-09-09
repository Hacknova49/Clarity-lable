/*
  # Simplify RLS policies for better user experience

  1. Security Changes
    - Simplify project RLS policies to allow users to manage their own projects
    - Remove complex member-based policies that were causing issues
    - Keep essential security while improving usability

  2. Changes Made
    - Drop existing problematic policies
    - Create simple, user-focused policies
    - Ensure users can create, read, update, and delete their own projects
    - Allow users to manage images and labels for their projects
*/

-- Drop existing policies that are causing issues
DROP POLICY IF EXISTS "Authenticated users can create projects" ON projects;
DROP POLICY IF EXISTS "Members can view assigned projects" ON projects;
DROP POLICY IF EXISTS "Creators and admins can update projects" ON projects;
DROP POLICY IF EXISTS "Admins can view all projects" ON projects;

-- Create simple, user-focused policies for projects
CREATE POLICY "Users can manage their own projects"
  ON projects
  FOR ALL
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Simplify image policies
DROP POLICY IF EXISTS "Project members can view images" ON images;
DROP POLICY IF EXISTS "Admins can manage images" ON images;

CREATE POLICY "Users can manage images in their projects"
  ON images
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = images.project_id 
      AND projects.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = images.project_id 
      AND projects.created_by = auth.uid()
    )
  );

-- Simplify label policies
DROP POLICY IF EXISTS "Project members can view labels" ON labels;
DROP POLICY IF EXISTS "Admins can manage labels" ON labels;

CREATE POLICY "Users can manage labels in their projects"
  ON labels
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = labels.project_id 
      AND projects.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = labels.project_id 
      AND projects.created_by = auth.uid()
    )
  );

-- Simplify annotation policies
DROP POLICY IF EXISTS "Project members can view annotations" ON annotations;
DROP POLICY IF EXISTS "Annotators can create annotations" ON annotations;
DROP POLICY IF EXISTS "Users can update own annotations" ON annotations;

CREATE POLICY "Users can manage annotations in their projects"
  ON annotations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM images 
      JOIN projects ON projects.id = images.project_id
      WHERE images.id = annotations.image_id 
      AND projects.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM images 
      JOIN projects ON projects.id = images.project_id
      WHERE images.id = annotations.image_id 
      AND projects.created_by = auth.uid()
    ) AND created_by = auth.uid()
  );