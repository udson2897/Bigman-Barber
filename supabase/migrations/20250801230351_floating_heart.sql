/*
  # Fix user appointments security - ensure users only see their own appointments

  1. Security Updates
    - Drop conflicting policies
    - Create clear policy for user access only
    - Ensure admin access is preserved
    - Add additional security checks

  2. Performance
    - Add index for user_email queries
    - Optimize policy conditions
*/

-- Drop all existing conflicting policies
DROP POLICY IF EXISTS "Users can read their own appointments by email" ON appointments;
DROP POLICY IF EXISTS "Anonymous users can read appointments by email" ON appointments;
DROP POLICY IF EXISTS "Anyone can read their own appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated users can read own appointments" ON appointments;

-- Create a single, clear policy for user access
CREATE POLICY "Users can only read their own appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (
    -- User can see their own appointments by email
    user_email = auth.email()
    OR
    -- Admin can see all appointments
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid()
    )
  );

-- Ensure users can only insert appointments with their own email
CREATE POLICY "Users can only create appointments with their email"
  ON appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_email = auth.email()
    OR
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid()
    )
  );

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_user_email_auth ON appointments(user_email);

-- Function to verify appointment ownership
CREATE OR REPLACE FUNCTION verify_appointment_ownership(appointment_email text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT appointment_email = auth.email() OR EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  );
$$;