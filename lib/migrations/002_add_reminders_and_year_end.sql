-- ============================================
-- Migration 002: Add reminders + zakat_year_end to profiles
-- Run this in Supabase SQL Editor
-- ============================================

-- Reminder preferences (JSONB)
-- Structure: { "reminder_30d": bool, "reminder_7d": bool, "reminder_due": bool, "reminder_monthly": bool }
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS reminders JSONB DEFAULT '{"reminder_30d": false, "reminder_7d": true, "reminder_due": true, "reminder_monthly": false}'::jsonb;

-- Date when the user's zakat year ends (Gregorian)
-- Users set this in settings; cron job compares against it
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS zakat_year_end DATE;

-- Track when the last reminder was sent to avoid duplicates
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_reminder_sent JSONB DEFAULT '{}'::jsonb;

-- Admin flag (already referenced in code but missing from schema)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Index for cron job: find users with reminders enabled and a year-end date set
CREATE INDEX IF NOT EXISTS idx_profiles_zakat_year_end
  ON public.profiles(zakat_year_end)
  WHERE zakat_year_end IS NOT NULL;
