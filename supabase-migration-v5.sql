-- Functions for server-side calendar token operations
-- These run with SECURITY DEFINER to bypass RLS, callable via anon key

-- Save OAuth tokens for a doctor
CREATE OR REPLACE FUNCTION save_calendar_tokens(
  p_doctor_id text,
  p_tokens jsonb
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO doctor_settings (doctor_id, calendar_tokens, updated_at)
  VALUES (p_doctor_id, p_tokens, now())
  ON CONFLICT (doctor_id)
  DO UPDATE SET calendar_tokens = p_tokens, updated_at = now();
END;
$$;

-- Get stored OAuth tokens for a doctor
CREATE OR REPLACE FUNCTION get_calendar_tokens(
  p_doctor_id text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT calendar_tokens INTO result
  FROM doctor_settings
  WHERE doctor_id = p_doctor_id;
  RETURN result;
END;
$$;

-- Clear OAuth tokens for a doctor
CREATE OR REPLACE FUNCTION clear_calendar_tokens(
  p_doctor_id text
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  UPDATE doctor_settings
  SET calendar_tokens = NULL, updated_at = now()
  WHERE doctor_id = p_doctor_id;
END;
$$;

-- Set calendar connection status in settings JSONB
CREATE OR REPLACE FUNCTION set_calendar_connection_status(
  p_doctor_id text,
  p_connected boolean,
  p_email text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  current_settings jsonb;
  new_settings jsonb;
BEGIN
  SELECT settings INTO current_settings
  FROM doctor_settings
  WHERE doctor_id = p_doctor_id;

  new_settings := COALESCE(current_settings, '{}'::jsonb) || 
    jsonb_build_object('googleCalendar', jsonb_build_object('connected', p_connected, 'email', p_email));

  INSERT INTO doctor_settings (doctor_id, settings, updated_at)
  VALUES (p_doctor_id, new_settings, now())
  ON CONFLICT (doctor_id)
  DO UPDATE SET settings = new_settings, updated_at = now();
END;
$$;

-- Allow anon and authenticated to call these functions
GRANT EXECUTE ON FUNCTION save_calendar_tokens TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_calendar_tokens TO anon, authenticated;
GRANT EXECUTE ON FUNCTION clear_calendar_tokens TO anon, authenticated;
GRANT EXECUTE ON FUNCTION set_calendar_connection_status TO anon, authenticated;
