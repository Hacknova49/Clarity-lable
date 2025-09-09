/*
  # Fix projects table INSERT policy

  1. Security Changes
    - Drop the existing INSERT policy that may have issues
    - Create a new INSERT policy that properly allows authenticated users to create projects
    - Ensure the policy checks that created_by matches the authenticated user's ID

  2. Notes
    - This fixes the RLS violation error when creating projects
    - Users can only create projects where they set themselves as the creator
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can create projects" ON projects;

-- Create a new INSERT policy that allows authenticated users to create projects
CREATE POLICY "Authenticated users can create projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());