/*
  # Add service information to appointments table

  1. Updates to appointments table
    - Add service_name column to store the service name
    - Add service_price column to store the service price
    - Update existing records to have proper service information

  2. Security
    - Maintain existing RLS policies
*/

-- Add service_name column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'service_name'
  ) THEN
    ALTER TABLE appointments ADD COLUMN service_name text;
  END IF;
END $$;

-- Add service_price column if it doesn't exist  
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'service_price'
  ) THEN
    ALTER TABLE appointments ADD COLUMN service_price text;
  END IF;
END $$;

-- Update default status to pending for new appointments
ALTER TABLE appointments ALTER COLUMN status SET DEFAULT 'pending';