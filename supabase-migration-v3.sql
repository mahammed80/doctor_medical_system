-- ============================================================
-- Migration v3 — Google Calendar Integration
-- Run AFTER supabase-migration-v2.sql in your Supabase SQL editor.
-- Idempotent (uses ADD COLUMN IF NOT EXISTS).
-- ============================================================

-- 1) Add calendar_tokens column to doctor_settings (for OAuth token storage)
alter table doctor_settings
  add column if not exists calendar_tokens jsonb;

-- 2) Add google_calendar_event_id to consultations (for two-way sync)
alter table consultations
  add column if not exists google_calendar_event_id text;

create index if not exists consultations_calendar_event_idx
  on consultations (google_calendar_event_id)
  where google_calendar_event_id is not null;
