-- ============================================================
-- Migration v13 — RPC to resolve a consultation's UUID from
-- Paymob's own order id.
-- Run this in your Supabase SQL editor.
-- ============================================================
--
-- Paymob's transaction callbacks identify orders by Paymob's own numeric
-- order id (returned as `paymentId` when the checkout link is created and
-- stored in the `payment_id` column) — not by our consultation UUID. This
-- lookup lets the payment webhook translate Paymob's order id back to our
-- primary key before calling admin_update_consultation.

CREATE OR REPLACE FUNCTION get_consultation_id_by_payment_id(
  p_payment_id text
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  result uuid;
BEGIN
  SELECT id INTO result
  FROM consultations
  WHERE payment_id = p_payment_id
  ORDER BY created_at DESC
  LIMIT 1;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_consultation_id_by_payment_id TO anon, authenticated;
