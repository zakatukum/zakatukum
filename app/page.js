'use client';

import { useState, useEffect } from 'react';
import { getSupabase } from '@/lib/supabase';
import ZakatukumApp from '@/components/ZakatukumApp';
import LandingPage from '@/components/LandingPage';

export default function Home() {
  const [showApp, setShowApp] = useState(false);
  const [checking, setChecking] = useState(true);
  const [initialAuthMode, setInitialAuthMode] = useState(null);

  useEffect(() => {
    // Check if user already has an active session
    const checkSession = async () => {
      try {
        const supabase = getSupabase();
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setShowApp(true);
        }
      } catch (e) {
        // No session — show landing page
      }
      setChecking(false);
    };

    // Also check for password recovery hash in URL
    if (typeof window !== 'undefined' && window.location.hash.includes('type=recovery')) {
      setShowApp(true);
      setChecking(false);
      return;
    }

    checkSession();
  }, []);

  // Show nothing while checking session (prevents flash)
  if (checking) {
    return (
      <main style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1B5E20, #2E7D32)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: 'rgba(255,255,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 24, fontWeight: 800,
          animation: 'pulse 1.5s ease-in-out infinite',
        }}>Z</div>
        <style>{`@keyframes pulse { 0%, 100% { opacity: 0.6; transform: scale(1); } 50% { opacity: 1; transform: scale(1.05); } }`}</style>
      </main>
    );
  }

  // User is logged in or clicked "Get Started" / "Sign In"
  if (showApp) {
    return (
      <main>
        <ZakatukumApp initialAuthMode={initialAuthMode} />
      </main>
    );
  }

  // Show landing page for new / unauthenticated visitors
  return (
    <main>
      <LandingPage
        onGetStarted={() => {
          setInitialAuthMode('signup');
          setShowApp(true);
        }}
        onSignIn={() => {
          setInitialAuthMode('login');
          setShowApp(true);
        }}
      />
    </main>
  );
}
