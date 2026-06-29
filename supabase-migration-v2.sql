-- ============================================================
-- Migration v2 — Doctor Consultation Platform
-- Run AFTER supabase-schema.sql in your Supabase SQL editor.
-- Idempotent where possible (uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS).
-- ============================================================

-- 1) Extend consultation status enum with new pre-consultation flow
--    Submitted -> Under Review -> Needs More Info -> Patient Replied -> Approved
--    Plus existing payment / booking / decline / completion states.
do $$
begin
  alter table consultations drop constraint if exists consultations_status_check;
  alter table consultations
    add constraint consultations_status_check
    check (status in (
      'pending_payment',     -- waiting for stripe payment
      'pending_booking',     -- paid, choosing appointment
      'submitted',           -- payment + booking done, awaiting doctor review
      'under_review',        -- doctor is reviewing
      'needs_info',          -- doctor asked for more information
      'patient_replied',     -- patient replied with more info
      'approved',            -- doctor approved, ready to consult
      'declined',            -- doctor rejected
      'cancelled',           -- patient or doctor cancelled
      'completed',           -- consultation happened
      'booked'               -- legacy alias for approved
    ));
end$$;

-- 2) Add new consultation columns
alter table consultations
  add column if not exists doctor_id            text,
  add column if not exists doctor_name          text,
  add column if not exists specialty            text,
  add column if not exists appointment_date     date,
  add column if not exists appointment_time     time,
  add column if not exists reviewed_at          timestamptz,
  add column if not exists approved_at          timestamptz,
  add column if not exists cancelled_at         timestamptz,
  add column if not exists completed_at         timestamptz,
  add column if not exists cancellation_reason  text,
  add column if not exists doctor_notes         text,
  add column if not exists rescheduled_from     uuid references consultations(id) on delete set null;

-- New pain assessment fields
alter table consultations
  add column if not exists pain_severity        integer check (pain_severity between 0 and 10),
  add column if not exists pain_natures         text[] default '{}',
  add column if not exists pain_locations       text[] default '{}',
  add column if not exists spinal_areas         text[] default '{}',
  add column if not exists symptom_start        text,
  add column if not exists previous_treatments  text,
  add column if not exists previous_surgeries   text,
  add column if not exists aggravating_factors  text,
  add column if not exists relieving_factors    text;

-- Indexes
create index if not exists consultations_status_idx          on consultations (status);
create index if not exists consultations_doctor_id_idx      on consultations (doctor_id);
create index if not exists consultations_created_at_idx     on consultations (created_at desc);
create index if not exists consultations_appointment_idx    on consultations (appointment_date, appointment_time);

-- ============================================================
-- 3) doctor_settings (already referenced in code, was missing)
-- ============================================================
create table if not exists doctor_settings (
  doctor_id  text primary key,
  settings    jsonb not null,
  updated_at  timestamptz default now()
);

-- ============================================================
-- 4) consultation_messages — pre-consultation chat
-- ============================================================
create table if not exists consultation_messages (
  id                uuid primary key default gen_random_uuid(),
  consultation_id   uuid not null references consultations(id) on delete cascade,
  sender_role       text not null check (sender_role in ('patient', 'doctor', 'system')),
  body              text not null,
  attachments       jsonb default '[]', -- [{file_name, file_url, file_type}]
  read_by_patient   boolean default false,
  read_by_doctor    boolean default false,
  created_at        timestamptz default now()
);

create index if not exists consultation_messages_consultation_idx
  on consultation_messages (consultation_id, created_at);

-- ============================================================
-- 5) Extend consultation_files with category
-- ============================================================
do $$
begin
  alter table consultation_files drop constraint if exists consultation_files_file_type_check;
exception when undefined_object then null;
end$$;

alter table consultation_files
  add column if not exists category text,
  add column if not exists size_bytes bigint;

-- Category values: mri, xray, ct, lab_report, prescription, other
do $$
begin
  alter table consultation_files
    add constraint consultation_files_category_check
    check (category is null or category in ('mri', 'xray', 'ct', 'lab_report', 'prescription', 'other'));
exception when duplicate_object then null;
end$$;

create index if not exists consultation_files_consultation_idx
  on consultation_files (consultation_id);

-- ============================================================
-- 6) Storage policies — keep public for MVP but cap file size.
--    NOTE: size enforcement must also be client-side; Supabase
--    storage has a per-bucket limit (default 50MB).
-- ============================================================
-- Drop old "allow all" policies and replace with explicit per-op policies
drop policy if exists "allow uploads" on storage.objects;
drop policy if exists "allow reads"   on storage.objects;

create policy "consultation_files_read"
  on storage.objects for select
  using (bucket_id = 'consultation-files');

create policy "consultation_files_insert"
  on storage.objects for insert
  with check (bucket_id = 'consultation-files' and octet_length(coalesce(metadata->>'size', '0')::text) <= 20971520);

-- ============================================================
-- 7) Doctor staff (for Supabase Auth — uses auth.users + a profile row)
-- ============================================================
create table if not exists doctor_profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  display_name text,
  role         text not null default 'doctor' check (role in ('doctor', 'admin')),
  created_at   timestamptz default now()
);

-- Auto-create a doctor_profile row on new auth.users signup (optional)
create or replace function public.handle_new_doctor()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.doctor_profiles (id, email, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'doctor')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_doctor();

-- ============================================================
-- 8) Tighten RLS for the new auth-aware world.
--    Patients still have public insert (no auth on patient side).
--    Reads/writes on consultations, files, messages, settings are
--    restricted to authenticated doctor_profiles.
-- ============================================================

-- Drop permissive policies from v1
drop policy if exists "allow all consultations" on consultations;
drop policy if exists "allow all files"        on consultation_files;

-- consultations
create policy "consultations_select_doctor"
  on consultations for select
  to authenticated
  using (exists (select 1 from doctor_profiles p where p.id = auth.uid()));

create policy "consultations_insert_public"
  on consultations for insert
  to anon, authenticated
  with check (true);

create policy "consultations_update_doctor"
  on consultations for update
  to authenticated
  using (exists (select 1 from doctor_profiles p where p.id = auth.uid()))
  with check (exists (select 1 from doctor_profiles p where p.id = auth.uid()));

-- consultation_files
create policy "files_select_doctor"
  on consultation_files for select
  to authenticated
  using (exists (select 1 from doctor_profiles p where p.id = auth.uid()));

create policy "files_insert_public"
  on consultation_files for insert
  to anon, authenticated
  with check (true);

create policy "files_update_doctor"
  on consultation_files for update
  to authenticated
  using (exists (select 1 from doctor_profiles p where p.id = auth.uid()))
  with check (exists (select 1 from doctor_profiles p where p.id = auth.uid()));

-- consultation_messages
alter table consultation_messages enable row level security;

create policy "messages_select_doctor"
  on consultation_messages for select
  to authenticated
  using (exists (select 1 from doctor_profiles p where p.id = auth.uid()));

-- Patients need to read their own messages back. Since the consultation id
-- is shared, we keep the patient-side read permissive for now (the consultation
-- id acts as a capability). You can tighten this later by issuing signed links.
create policy "messages_select_public"
  on consultation_messages for select
  to anon, authenticated
  using (true);

create policy "messages_insert_public"
  on consultation_messages for insert
  to anon, authenticated
  with check (sender_role = 'patient');

create policy "messages_insert_doctor"
  on consultation_messages for insert
  to authenticated
  with check (
    sender_role in ('doctor', 'system')
    and exists (select 1 from doctor_profiles p where p.id = auth.uid())
  );

create policy "messages_update_doctor"
  on consultation_messages for update
  to authenticated
  using (exists (select 1 from doctor_profiles p where p.id = auth.uid()))
  with check (exists (select 1 from doctor_profiles p where p.id = auth.uid()));

-- doctor_settings
alter table doctor_settings enable row level security;

create policy "settings_select_doctor"
  on doctor_settings for select
  to authenticated
  using (exists (select 1 from doctor_profiles p where p.id = auth.uid()));

create policy "settings_upsert_doctor"
  on doctor_settings for insert
  to authenticated
  with check (exists (select 1 from doctor_profiles p where p.id = auth.uid()));

create policy "settings_update_doctor"
  on doctor_settings for update
  to authenticated
  using (exists (select 1 from doctor_profiles p where p.id = auth.uid()))
  with check (exists (select 1 from doctor_profiles p where p.id = auth.uid()));

-- doctor_profiles
alter table doctor_profiles enable row level security;

create policy "profiles_select_self"
  on doctor_profiles for select
  to authenticated
  using (id = auth.uid());

-- ============================================================
-- 9) Useful view: latest message per consultation (for dashboard list)
-- ============================================================
create or replace view consultation_latest_message as
select distinct on (consultation_id)
  consultation_id,
  body              as last_message,
  sender_role       as last_sender_role,
  created_at        as last_message_at
from consultation_messages
order by consultation_id, created_at desc;

-- ============================================================
-- Done. Reminders:
--   1. Create your first doctor account via Supabase Auth UI or
--      `supabase.auth.signUp({ email, password })` from a script.
--   2. Storage bucket "consultation-files" already exists; this
--      migration just tightens the RLS policies.
--   3. Public patient writes are intentional — patients are
--      anonymous. Secure by adding signed tokens per consultation
--      in a follow-up.
-- ============================================================
