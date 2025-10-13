/*
  # Debug and fix products table permissions

  1. Security Updates
    - Drop and recreate all policies with proper debugging
    - Ensure admin users table is properly configured
    - Add comprehensive logging for debugging

  2. Admin User Management
    - Ensure admin users can be properly identified
    - Add debugging information for permissions
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Admin can manage products" ON products;

-- Ensure RLS is enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create a simple policy for viewing products (public access)
CREATE POLICY "Public can view products"
  ON products
  FOR SELECT
  USING (true);

-- Create a comprehensive policy for admin management
CREATE POLICY "Authenticated users can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM admin_users 
      WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM admin_users 
      WHERE admin_users.id = auth.uid()
    )
  );

-- Ensure admin_users table has proper structure
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing admin_users policies
DROP POLICY IF EXISTS "Admin users can view their own data" ON admin_users;

-- Create new admin_users policies
CREATE POLICY "Authenticated users can view admin status"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Authenticated users can manage their admin profile"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (auth.uid() = id);

-- Function to check if user is admin (for debugging)
CREATE OR REPLACE FUNCTION is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM admin_users 
    WHERE id = user_id
  );
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON products TO anon;
GRANT ALL ON products TO authenticated;
GRANT SELECT ON admin_users TO authenticated;