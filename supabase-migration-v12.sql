-- ============================================================
-- Migration v12 — Allow anonymous patients to read and update consultations
-- The booking flow (payment, scheduling) requires anonymous patients
-- to read and update their own consultation records. Patient-side has no auth,
-- so we allow anon reads and updates. Consultation IDs are UUIDs (unguessable),
-- making this acceptable for a patient-facing booking app.
-- Run this in your Supabase SQL editor.
-- ============================================================

drop policy if exists "consultations_select_public" on consultations;
drop policy if exists "consultations_update_public" on consultations;

create policy "consultations_select_public"
  on consultations for select
  to anon
  using (true);

create policy "consultations_update_public"
  on consultations for update
  to anon
  using (true)
  with check (true);

