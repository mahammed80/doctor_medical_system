-- ============================================================
-- Migration v7 — Allow patients to update their own consultations
-- Patient booking flow updates status/fields via the anon key.
-- ============================================================

-- Add public update policy on consultations so the patient
-- booking flow can update status, appointment, etc.
-- The consultation UUID acts as a capability key (secret URL).
create policy "consultations_update_public"
  on consultations for update
  to anon, authenticated
  using (true)
  with check (true);

-- Also allow public deletes (for idempotent retries)
create policy "consultations_delete_public"
  on consultations for delete
  to anon, authenticated
  using (true);
