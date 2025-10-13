/*
  # Create Commission Settings Table

  1. New Tables
    - `commission_settings`
      - `id` (integer, primary key) - Always 1 to ensure single row
      - `barber_percentage` (numeric) - Percentage that barbers receive (0-100)
      - `admin_percentage` (numeric) - Percentage that admin receives (0-100)
      - `updated_at` (timestamptz) - Last update timestamp
      - `updated_by` (uuid) - Admin user who made the last update
  
  2. Security
    - Enable RLS on `commission_settings` table
    - Add policy for authenticated admins to read settings
    - Add policy for authenticated admins to update settings
  
  3. Default Values
    - Set default commission split: 50% barber / 50% admin
*/

CREATE TABLE IF NOT EXISTS commission_settings (
  id integer PRIMARY KEY DEFAULT 1,
  barber_percentage numeric NOT NULL DEFAULT 50 CHECK (barber_percentage >= 0 AND barber_percentage <= 100),
  admin_percentage numeric NOT NULL DEFAULT 50 CHECK (admin_percentage >= 0 AND admin_percentage <= 100),
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id),
  CONSTRAINT single_row CHECK (id = 1),
  CONSTRAINT percentages_sum CHECK (barber_percentage + admin_percentage = 100)
);

ALTER TABLE commission_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read commission settings"
  ON commission_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can update commission settings"
  ON commission_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert commission settings"
  ON commission_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

INSERT INTO commission_settings (id, barber_percentage, admin_percentage)
VALUES (1, 50, 50)
ON CONFLICT (id) DO NOTHING;
