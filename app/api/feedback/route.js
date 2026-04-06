import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

function getSupabase(request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );
}

// POST: Submit feedback
export async function POST(request) {
  try {
    const supabase = getSupabase(request);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { category, rating, message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('feedback')
      .insert({
        user_id: user.id,
        user_email: user.email,
        category: category || 'general',
        rating: rating || null,
        message: message.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error('Feedback insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, feedback: data });
  } catch (err) {
    console.error('Feedback API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET: Fetch feedback (admin only — all; regular users — their own)
export async function GET(request) {
  try {
    const supabase = getSupabase(request);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    let query = supabase.from('feedback').select('*').order('created_at', { ascending: false });

    // Non-admin users only see their own feedback
    if (!profile?.is_admin) {
      query = query.eq('user_id', user.id);
    }

    const { data, error } = await query.limit(100);

    if (error) {
      console.error('Feedback fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ feedback: data });
  } catch (err) {
    console.error('Feedback GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
