-- ============================================
-- Zakatukum Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================

-- 1. User Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  country TEXT DEFAULT 'GLOBAL',
  currency TEXT DEFAULT 'USD',
  madhab TEXT DEFAULT 'hanafi',
  lang TEXT DEFAULT 'en',
  reminders JSONB DEFAULT '{"reminder_30d": false, "reminder_7d": true, "reminder_due": true, "reminder_monthly": false}'::jsonb,
  zakat_year_end DATE,
  last_reminder_sent JSONB DEFAULT '{}'::jsonb,
  unsubscribe_token UUID DEFAULT gen_random_uuid(),
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Zakat Calculations (one row per user per Hijri year)
CREATE TABLE IF NOT EXISTS public.zakat_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hijri_year INTEGER NOT NULL,
  greg_year INTEGER NOT NULL,

  -- Cash & Savings
  cash NUMERIC DEFAULT 0,
  savings NUMERIC DEFAULT 0,
  checking NUMERIC DEFAULT 0,

  -- Gold & Silver (in grams)
  gold_grams NUMERIC DEFAULT 0,
  gold_value NUMERIC DEFAULT 0,
  silver_grams NUMERIC DEFAULT 0,
  silver_value NUMERIC DEFAULT 0,
  jewelry_value NUMERIC DEFAULT 0,

  -- Investments
  investments JSONB DEFAULT '[]'::jsonb,

  -- Business
  business_inventory NUMERIC DEFAULT 0,
  business_receivables NUMERIC DEFAULT 0,
  business_cash NUMERIC DEFAULT 0,

  -- Real Estate (rental)
  rental JSONB DEFAULT '{"monthlyIncome": 0, "expenses": 0, "months": 12}'::jsonb,

  -- Agriculture
  agriculture JSONB DEFAULT '{"irrigated": 0, "rainfed": 0}'::jsonb,

  -- Livestock
  livestock JSONB DEFAULT '{"camels": 0, "cattle": 0, "sheep": 0}'::jsonb,

  -- Mining / Minerals
  mining_value NUMERIC DEFAULT 0,

  -- Debts & Liabilities
  debts_owed NUMERIC DEFAULT 0,
  debts_receivable NUMERIC DEFAULT 0,

  -- Calculated totals
  total_assets NUMERIC DEFAULT 0,
  total_zakat NUMERIC DEFAULT 0,
  nisab_met BOOLEAN DEFAULT false,

  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One entry per user per year
  UNIQUE(user_id, hijri_year)
);

-- 3. Zakat Payments (track what user has paid)
CREATE TABLE IF NOT EXISTS public.zakat_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  zakat_year_id UUID REFERENCES public.zakat_years(id) ON DELETE SET NULL,
  hijri_year INTEGER NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  recipient TEXT,
  organization TEXT,
  method TEXT,
  notes TEXT,
  paid_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zakat_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zakat_payments ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only read/write their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Zakat Years: users can only read/write their own data
CREATE POLICY "Users can view own zakat years"
  ON public.zakat_years FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own zakat years"
  ON public.zakat_years FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own zakat years"
  ON public.zakat_years FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own zakat years"
  ON public.zakat_years FOR DELETE
  USING (auth.uid() = user_id);

-- Zakat Payments: users can only read/write their own payments
CREATE POLICY "Users can view own payments"
  ON public.zakat_payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments"
  ON public.zakat_payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payments"
  ON public.zakat_payments FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- Auto-create profile on signup (trigger)
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: auto-create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Updated_at auto-update triggers
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER zakat_years_updated_at
  BEFORE UPDATE ON public.zakat_years
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- Indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_zakat_years_user_id ON public.zakat_years(user_id);
CREATE INDEX IF NOT EXISTS idx_zakat_years_user_year ON public.zakat_years(user_id, hijri_year);
CREATE INDEX IF NOT EXISTS idx_zakat_payments_user_id ON public.zakat_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_zakat_payments_year ON public.zakat_payments(hijri_year);
