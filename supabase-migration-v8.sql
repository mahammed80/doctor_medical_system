-- Add public select so patients can read their own consultations
create policy "consultations_select_public"
  on consultations for select
  to anon, authenticated
  using (true);
