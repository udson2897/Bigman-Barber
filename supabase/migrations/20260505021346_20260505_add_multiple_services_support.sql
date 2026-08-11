/*
  # Add Multiple Services Support to Appointments

  1. Changes
    - Add `services_data` column to store multiple services as JSONB
    - Column stores array of objects: [{ id, name, price }]
    - Maintains backward compatibility with existing single-service columns
    - All appointments can have multiple services for complete information tracking

  2. Schema
    - `services_data` (jsonb): Array of service objects with id, name, and price
    - Replaces reliance on singular service_name/service_price for multi-service appointments

  3. Notes
    - Existing appointments will have NULL in services_data until updated
    - Dashboard will fall back to service_name/service_price if services_data is not available
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'services_data'
  ) THEN
    ALTER TABLE appointments ADD COLUMN services_data jsonb DEFAULT NULL;
  END IF;
END $$;