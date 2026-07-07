-- ============================================================
-- Migration v4 — Public access fixes for patient booking flow
-- Run AFTER supabase-migration-v3.sql in your Supabase SQL editor.
-- ============================================================

-- Allow public (anon) reads on doctor_settings.
-- Patients need to read working hours, slot duration, prices,
-- and googleCalendar.connected flag for the booking flow.
-- Writes remain restricted to authenticated doctors.
create policy "settings_select_public"
  on doctor_settings for select
  to anon, authenticated
  using (true);

-- Create the storage bucket if it doesn't exist yet
insert into storage.buckets (id, name, public)
values ('consultation-files', 'consultation-files', true)
on conflict (id) do nothing;
