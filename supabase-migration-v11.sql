-- ============================================================
-- Migration v11 — Add patient_national_id column
-- Run this in your Supabase SQL editor.
-- ============================================================

ALTER TABLE consultations ADD COLUMN IF NOT EXISTS patient_national_id text;
CREATE INDEX IF NOT EXISTS consultations_patient_national_id_idx ON consultations (patient_national_id);
