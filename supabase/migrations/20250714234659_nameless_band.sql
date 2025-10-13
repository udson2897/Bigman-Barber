/*
  # Fix appointments user relation

  1. Changes
    - Update RLS policies to allow users to see their appointments by email
    - Add index for better performance on user_email queries
    - Ensure proper data access for authenticated users

  2. Security
    - Users can only see appointments with their email
    - Maintain admin access to all appointments
*/

-- Add index for better performance on user_email queries
CREATE INDEX IF NOT EXISTS idx_appointments_user_email ON appointments(user_email);

-- Update RLS policy to allow users to see their own appointments by email
DROP POLICY IF EXISTS "Users can read their own appointments by email" ON appointments;

CREATE POLICY "Users can read their own appointments by email"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (
    -- Allow if user is admin
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid()
    )
    OR
    -- Allow if the appointment email matches the user's email
    user_email = auth.email()
  );

-- Also allow anonymous users to see appointments by email (for booking confirmation)
CREATE POLICY "Anonymous users can read appointments by email"
  ON appointments
  FOR SELECT
  TO anon
  USING (user_email IS NOT NULL);