-- Functions for server-side consultation admin operations
-- These run with SECURITY DEFINER to bypass RLS, callable via anon key

CREATE OR REPLACE FUNCTION admin_update_consultation(
  p_id uuid,
  p_updates jsonb
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  UPDATE consultations
  SET 
    status = COALESCE(p_updates->>'status', status),
    payment_id = COALESCE(p_updates->>'payment_id', payment_id),
    reviewed_at = COALESCE((p_updates->>'reviewed_at')::timestamptz, reviewed_at),
    approved_at = COALESCE((p_updates->>'approved_at')::timestamptz, approved_at),
    cancelled_at = COALESCE((p_updates->>'cancelled_at')::timestamptz, cancelled_at),
    completed_at = COALESCE((p_updates->>'completed_at')::timestamptz, completed_at),
    appointment_date = COALESCE((p_updates->>'appointment_date')::date, appointment_date),
    appointment_time = COALESCE((p_updates->>'appointment_time')::time, appointment_time),
    google_calendar_event_id = COALESCE(p_updates->>'google_calendar_event_id', google_calendar_event_id),
    cancellation_reason = COALESCE(p_updates->>'cancellation_reason', cancellation_reason),
    doctor_notes = COALESCE(p_updates->>'doctor_notes', doctor_notes)
  WHERE id = p_id
  RETURNING to_jsonb(consultations.*) INTO result;
  
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_update_consultation TO anon, authenticated;