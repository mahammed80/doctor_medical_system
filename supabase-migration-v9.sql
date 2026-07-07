-- Add public select on consultation_files so patients can see their uploads
create policy "files_select_public"
  on consultation_files for select
  to anon, authenticated
  using (true);

-- Add public update on consultation_files for completeness
create policy "files_update_public"
  on consultation_files for update
  to anon, authenticated
  using (true)
  with check (true);
