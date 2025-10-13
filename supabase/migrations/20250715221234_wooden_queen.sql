/*
  # Fix appointments access policies

  1. Security
    - Drop existing conflicting policies
    - Create clear policies for user access
    - Ensure admins can manage all appointments
    - Ensure users can only see their own appointments
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read their own appointments by email" ON appointments;
DROP POLICY IF EXISTS "Anonymous users can read appointments by email" ON appointments;
DROP POLICY IF EXISTS "Anyone can read their own appointments" ON appointments;

-- Create clear policy for authenticated users to read their own appointments
CREATE POLICY "Authenticated users can read own appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (user_email = auth.email());

-- Ensure admin policy exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'appointments' 
    AND policyname = 'Admin can view all appointments'
  ) THEN
    CREATE POLICY "Admin can view all appointments"
      ON appointments
      FOR SELECT
      TO authenticated
      USING (EXISTS (
        SELECT 1 FROM admin_users 
        WHERE admin_users.id = auth.uid()
      ));
  END IF;
END $$;

-- Ensure admin management policy exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'appointments' 
    AND policyname = 'Admin can manage appointments'
  ) THEN
    CREATE POLICY "Admin can manage appointments"
      ON appointments
      FOR ALL
      TO authenticated
      USING (EXISTS (
        SELECT 1 FROM admin_users 
        WHERE admin_users.id = auth.uid()
      ));
  END IF;
END $$;