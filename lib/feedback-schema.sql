-- Feedback table for Zakatukum
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_email TEXT,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'bug', 'feature', 'ui', 'calculation', 'payment', 'other')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  message TEXT NOT NULL,
  admin_response TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'in_progress', 'resolved', 'wont_fix')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Users can insert their own feedback
CREATE POLICY "Users can insert own feedback"
  ON public.feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own feedback
CREATE POLICY "Users can read own feedback"
  ON public.feedback FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can read all feedback
CREATE POLICY "Admins can read all feedback"
  ON public.feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Admins can update feedback (for responses, status changes)
CREATE POLICY "Admins can update all feedback"
  ON public.feedback FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON public.feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);
