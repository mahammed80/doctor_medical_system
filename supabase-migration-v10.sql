-- RPC function to upsert doctor settings (bypasses RLS)
CREATE OR REPLACE FUNCTION upsert_doctor_settings(
  p_doctor_id text,
  p_settings jsonb
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO doctor_settings (doctor_id, settings, updated_at)
  VALUES (p_doctor_id, p_settings, now())
  ON CONFLICT (doctor_id)
  DO UPDATE SET settings = p_settings, updated_at = now();
END;
$$;

GRANT EXECUTE ON FUNCTION upsert_doctor_settings TO anon, authenticated;
