/*
  # Add user_id column to appointments table

  1. Changes
    - Add `user_id` column to `appointments` table
    - Set as nullable UUID type
    - Add foreign key constraint to auth.users table
    - Update RLS policies to work with the new column

  2. Security
    - Maintain existing RLS policies
    - Ensure proper user association for authenticated users
*/

-- Add user_id column to appointments table
ALTER TABLE appointments 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);

-- Update RLS policies to handle the new user_id column
DROP POLICY IF EXISTS "Users can only create appointments with their email" ON appointments;
DROP POLICY IF EXISTS "Users can only read their own appointments" ON appointments;

-- Recreate policies with user_id support
CREATE POLICY "Users can create appointments" 
  ON appointments 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    (user_id = auth.uid()) OR 
    (user_email = auth.email()) OR 
    (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()))
  );

CREATE POLICY "Users can read their appointments" 
  ON appointments 
  FOR SELECT 
  TO authenticated 
  USING (
    (user_id = auth.uid()) OR 
    (user_email = auth.email()) OR 
    (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()))
  );