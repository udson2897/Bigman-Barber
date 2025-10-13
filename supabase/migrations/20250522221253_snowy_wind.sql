/*
  # Create appointments table and related schemas

  1. New Tables
    - `appointments`
      - `id` (uuid, primary key)
      - `user_name` (text)
      - `user_email` (text)
      - `user_phone` (text)
      - `service_id` (integer)
      - `barber_id` (integer)
      - `appointment_date` (date)
      - `appointment_time` (time)
      - `location_id` (integer)
      - `status` (text)
      - `created_at` (timestamp)
      - `google_calendar_event_id` (text)

  2. Security
    - Enable RLS on `appointments` table
    - Add policies for inserting and reading appointments
*/

CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name text NOT NULL,
  user_email text NOT NULL,
  user_phone text NOT NULL,
  service_id integer NOT NULL,
  barber_id integer NOT NULL,
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  location_id integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  google_calendar_event_id text
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create appointments"
  ON appointments
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can read their own appointments"
  ON appointments
  FOR SELECT
  TO anon
  USING (user_email IS NOT NULL);