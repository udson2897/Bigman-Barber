/*
  # Create barbers management table

  1. New Tables
    - `barbers`
      - `id` (integer, primary key)
      - `name` (text)
      - `image_url` (text)
      - `workstation_number` (integer)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `barbers` table
    - Add policies for admin management and public viewing
*/

CREATE TABLE IF NOT EXISTS barbers (
  id SERIAL PRIMARY KEY,
  name text NOT NULL,
  image_url text,
  workstation_number integer UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;

-- Anyone can view active barbers
CREATE POLICY "Anyone can view active barbers"
  ON barbers
  FOR SELECT
  USING (is_active = true);

-- Admin can manage all barbers
CREATE POLICY "Admin can manage barbers"
  ON barbers
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  ));

-- Insert default barbers
INSERT INTO barbers (id, name, image_url, workstation_number) VALUES
(1, 'PW Barber', 'https://imagizer.imageshack.com/v2/640x480q70/924/yoCw8H.jpg', 1),
(2, 'Nilde Santos', 'https://imagizer.imageshack.com/v2/640x480q70/923/Nh00KJ.jpg', 2),
(3, 'Regis Barber', 'https://imagizer.imageshack.com/v2/640x480q70/924/MV30EK.jpg', 3),
(4, 'Ruan C. Barber', 'https://imagizer.imageshack.com/v2/640x480q70/924/3390wD.jpg', 4)
ON CONFLICT (id) DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_barbers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update the updated_at column
CREATE TRIGGER update_barbers_updated_at
  BEFORE UPDATE ON barbers
  FOR EACH ROW
  EXECUTE FUNCTION update_barbers_updated_at();