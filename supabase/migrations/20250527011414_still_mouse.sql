/*
  # Enhanced appointment system with admin management

  1. New Tables
    - `admin_users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `created_at` (timestamp)
      - Links to Supabase auth.users
    
    - `available_slots`
      - `id` (uuid, primary key)
      - `barber_id` (integer)
      - `date` (date)
      - `time` (time)
      - `is_available` (boolean)
      - `created_at` (timestamp)

  2. Updates to appointments table
    - Add status enum type
    - Add status column with enum values

  3. Security
    - Enable RLS on new tables
    - Add policies for admin access
*/

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create available_slots table
CREATE TABLE IF NOT EXISTS available_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id integer NOT NULL,
  date date NOT NULL,
  time time NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(barber_id, date, time)
);

-- Create appointment status enum
DO $$ BEGIN
  CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add status column to appointments if it doesn't exist
DO $$ BEGIN
  ALTER TABLE appointments ADD COLUMN status appointment_status DEFAULT 'pending';
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE available_slots ENABLE ROW LEVEL SECURITY;

-- Policies for admin_users
CREATE POLICY "Admin users can view their own data"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policies for available_slots
CREATE POLICY "Anyone can view available slots"
  ON available_slots
  FOR SELECT
  TO anon
  USING (is_available = true);

CREATE POLICY "Admin can manage available slots"
  ON available_slots
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  ));

-- Update appointments policies
CREATE POLICY "Admin can view all appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  ));

CREATE POLICY "Admin can update appointments"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  ));