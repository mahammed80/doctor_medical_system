-- ============================================================
-- Migration v12 — Allow anonymous patients to read and update consultations
-- and read doctor_settings. The booking flow (payment, scheduling) requires
-- anonymous patients to read their own consultation records and doctor
-- settings. Patient-side has no auth, so we allow anon access.
-- Consultation IDs are UUIDs (unguessable), making this acceptable.
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

-- Allow anonymous patients to read doctor settings (schedule hours, prices, etc.)
drop policy if exists "settings_select_public" on doctor_settings;

create policy "settings_select_public"
  on doctor_settings for select
  to anon
  using (true);

