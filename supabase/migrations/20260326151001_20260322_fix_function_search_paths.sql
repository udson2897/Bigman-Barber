/*
  # Fix Function Search Path Mutability

  This migration fixes mutable search_path settings in trigger functions
  to improve security and performance. Functions with role-mutable search_path
  can be vulnerable to privilege escalation attacks.

  Changes:
  - Drop and recreate all functions with SECURITY DEFINER and immutable search_path
  - Recreate all dependent triggers
  - Improves security posture

  Security Impact:
    - Prevents potential privilege escalation via search_path manipulation
    - Ensures deterministic function behavior across all roles
*/

DROP FUNCTION IF EXISTS is_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS check_slot_availability(integer, date, time) CASCADE;
DROP FUNCTION IF EXISTS verify_appointment_ownership(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS book_slot(integer, date, time) CASCADE;
DROP FUNCTION IF EXISTS release_slot(integer, date, time) CASCADE;
DROP FUNCTION IF EXISTS book_slot_on_appointment() CASCADE;
DROP FUNCTION IF EXISTS release_slot_on_cancellation() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_user_profiles_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_orders_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_barbers_updated_at() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE FUNCTION update_barbers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE FUNCTION is_admin(user_id uuid)
RETURNS boolean STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION check_slot_availability(p_barber_id integer, p_date date, p_time time)
RETURNS boolean STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM available_slots
    WHERE barber_id = p_barber_id
    AND date = p_date
    AND time = p_time
    AND is_available = true
  );
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION verify_appointment_ownership(p_appointment_id uuid, p_user_id uuid)
RETURNS boolean STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM appointments
    WHERE id = p_appointment_id
    AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION book_slot(p_barber_id integer, p_date date, p_time time)
RETURNS void
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE available_slots
  SET is_booked = true, is_available = false
  WHERE barber_id = p_barber_id
  AND date = p_date
  AND time = p_time;
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION release_slot(p_barber_id integer, p_date date, p_time time)
RETURNS void
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE available_slots
  SET is_booked = false, is_available = true
  WHERE barber_id = p_barber_id
  AND date = p_date
  AND time = p_time;
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION book_slot_on_appointment()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM book_slot(NEW.barber_id, NEW.appointment_date, NEW.appointment_time);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION release_slot_on_cancellation()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status != 'cancelled' AND NEW.status = 'cancelled' THEN
    PERFORM release_slot(OLD.barber_id, OLD.appointment_date, OLD.appointment_time);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_barbers_updated_at
  BEFORE UPDATE ON barbers
  FOR EACH ROW
  EXECUTE FUNCTION update_barbers_updated_at();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_orders_updated_at();

CREATE TRIGGER book_slot_trigger
  AFTER INSERT ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION book_slot_on_appointment();

CREATE TRIGGER release_slot_on_cancellation
  AFTER UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION release_slot_on_cancellation();

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
