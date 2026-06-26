-- Run this in your Supabase SQL editor

create table consultations (
  id uuid primary key default gen_random_uuid(),
  patient_name text not null,
  patient_phone text not null,
  patient_age integer not null,
  chief_complaint text not null,
  medical_history text,
  current_medications text,
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'pending_booking', 'booked')),
  pain_duration text,
  pain_type text,
  joint_swelling_stiffness text,
  payment_id text,
  calendly_event_url text,
  created_at timestamptz default now()
);

create table consultation_files (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid references consultations(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  file_type text,
  created_at timestamptz default now()
);

-- Storage bucket
insert into storage.buckets (id, name, public)
values ('consultation-files', 'consultation-files', true);

-- Allow public uploads
create policy "allow uploads" on storage.objects
  for insert with check (bucket_id = 'consultation-files');

create policy "allow reads" on storage.objects
  for select using (bucket_id = 'consultation-files');

-- Allow public reads on tables (for MVP — add auth later)
alter table consultations enable row level security;
alter table consultation_files enable row level security;

create policy "allow all consultations" on consultations for all using (true) with check (true);
create policy "allow all files" on consultation_files for all using (true) with check (true);
