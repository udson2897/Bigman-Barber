/*
  # Fix products table RLS policies

  1. Security Updates
    - Drop existing policies and recreate them properly
    - Ensure admin users can manage products
    - Allow anonymous users to view products

  2. Admin User Setup
    - Add admin user if not exists
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Admin can manage products" ON products;

-- Recreate policies with proper permissions
CREATE POLICY "Anyone can view products"
  ON products
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Admin can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  ));

-- Ensure RLS is enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Add admin user senha column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_users' AND column_name = 'senha'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN senha varchar DEFAULT '';
  END IF;
END $$;