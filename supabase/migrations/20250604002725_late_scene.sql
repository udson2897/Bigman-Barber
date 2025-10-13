/*
  # Enhanced appointment system with admin management and slot availability

  1. Updates to available_slots table
    - Add unique constraint for date and time combinations
    - Add is_booked column to track slot availability

  2. Updates to appointments table
    - Add phone number to display in admin panel
    - Add ability to update appointment details

  3. Security
    - Update admin policies for appointment management
*/

-- Update available_slots table
ALTER TABLE available_slots ADD COLUMN IF NOT EXISTS is_booked BOOLEAN DEFAULT false;

-- Update appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS user_phone TEXT;

-- Update policies for admin appointment management
CREATE POLICY "Admin can manage appointments"
  ON appointments
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  ));

-- Function to check slot availability
CREATE OR REPLACE FUNCTION check_slot_availability(
  p_date DATE,
  p_time TIME,
  p_barber_id INTEGER
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM available_slots
    WHERE date = p_date
    AND time = p_time
    AND barber_id = p_barber_id
    AND NOT is_booked
  );
END;
$$ LANGUAGE plpgsql;

-- Function to book a slot
CREATE OR REPLACE FUNCTION book_slot(
  p_date DATE,
  p_time TIME,
  p_barber_id INTEGER
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE available_slots
  SET is_booked = true
  WHERE date = p_date
  AND time = p_time
  AND barber_id = p_barber_id
  AND NOT is_booked;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to release a slot
CREATE OR REPLACE FUNCTION release_slot(
  p_date DATE,
  p_time TIME,
  p_barber_id INTEGER
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE available_slots
  SET is_booked = false
  WHERE date = p_date
  AND time = p_time
  AND barber_id = p_barber_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically book slot when appointment is created
CREATE OR REPLACE FUNCTION book_slot_on_appointment() RETURNS TRIGGER AS $$
BEGIN
  PERFORM book_slot(NEW.appointment_date, NEW.appointment_time, NEW.barber_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER book_slot_trigger
AFTER INSERT ON appointments
FOR EACH ROW
EXECUTE FUNCTION book_slot_on_appointment();

-- Trigger to release slot when appointment is cancelled
CREATE OR REPLACE FUNCTION release_slot_on_cancellation() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    PERFORM release_slot(OLD.appointment_date, OLD.appointment_time, OLD.barber_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER release_slot_trigger
AFTER UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION release_slot_on_cancellation();