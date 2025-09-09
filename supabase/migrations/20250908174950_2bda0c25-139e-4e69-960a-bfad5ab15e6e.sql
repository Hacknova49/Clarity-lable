-- Fix security warning: Set search_path for all functions to prevent SQL injection

-- Update the update_updated_at_column function with proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Update the handle_new_user function (already has search_path set correctly)
-- Update the has_role function (already has search_path set correctly)