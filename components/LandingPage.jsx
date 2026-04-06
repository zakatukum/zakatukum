"use client";

import { useState, useEffect } from "react";

// ─── Zakatukum Landing Page ───
// Design System: DESIGN.md (based on awesome-design-md / Stripe fintech pattern)
// Colors: Forest Green #0d3f14 (heading), Islamic Green #1B5E20 (brand), #2E7D32 (secondary)
// Shadows: Green-tinted rgba(27,94,32,0.15) — botanical chromatic depth
// Typography: Inter 800 (display), 700 (sub), 400 (body), tight tracking at display sizes

export default function LandingPage({ onGetStarted, onSignIn }) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const headerOpaque = scrollY > 40;

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Global hover animations via style tag */}
      <style>{`
        .z-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .z-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(27,94,32,0.12), 0 2px 4px rgba(0,0,0,0.06) !important; }
        .z-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 28px rgba(0,0,0,0.2) !important; }
        .z-btn-ghost:hover { background: rgba(255,255,255,0.18) !important; }
        .z-btn-green:hover { transform: translateY(-1px); box-shadow: 0 6px 28px rgba(27,94,32,0.4) !important; }
        .z-tag:hover { background: #e8f5e9 !important; border-color: #a5d6a7 !important; }
        .z-nav-link:hover { opacity: 1 !important; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .z-fade { animation: fadeInUp 0.6s ease-out both; }
        .z-fade-d1 { animation-delay: 0.1s; }
        .z-fade-d2 { animation-delay: 0.2s; }
        .z-fade-d3 { animation-delay: 0.3s; }
      `}</style>

      {/* ═══ NAVBAR ═══ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: headerOpaque ? "rgba(255,255,255,0.97)" : "transparent",
        backdropFilter: headerOpaque ? "blur(12px)" : "none",
        WebkitBackdropFilter: headerOpaque ? "blur(12px)" : "none",
        borderBottom: headerOpaque ? "1px solid #e0e0e0" : "1px solid transparent",
        transition: "all 0.3s ease",
        padding: "0 24px",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #1B5E20, #2E7D32)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 18, fontWeight: 800,
              boxShadow: "0 2px 8px rgba(27,94,32,0.3)",
            }}>Z</div>
            <span style={{ fontSize: 20, fontWeight: 800, color: headerOpaque ? "#0d3f14" : "#fff", transition: "color 0.3s", letterSpacing: "-0.01em" }}>
              Zakatukum <span style={{ fontFamily: "'Noto Naskh Arabic', serif", fontWeight: 400, opacity: 0.7 }}>زكاتكم</span>
            </span>
          </div>

          {/* Desktop nav links */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {[
              { href: "#features", label: "Features" },
              { href: "#how-it-works", label: "How It Works" },
              { href: "#languages", label: "Languages" },
            ].map((link) => (
              <a key={link.href} href={link.href} className="z-nav-link" style={{
                textDecoration: "none", fontSize: 14, fontWeight: 500,
                padding: "6px 14px", borderRadius: 6, transition: "all 0.2s",
                color: headerOpaque ? "#333" : "rgba(255,255,255,0.85)",
                opacity: 0.9,
              }}>{link.label}</a>
            ))}
            <button onClick={onSignIn} style={{
              background: "transparent",
              border: "1px solid " + (headerOpaque ? "#1B5E20" : "rgba(255,255,255,0.4)"),
              color: headerOpaque ? "#1B5E20" : "#fff",
              padding: "8px 20px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer",
              transition: "all 0.2s", marginLeft: 8,
            }}>Sign In</button>
            <button onClick={onGetStarted} className="z-btn-green" style={{
              background: headerOpaque ? "linear-gradient(135deg, #1B5E20, #2E7D32)" : "rgba(255,255,255,0.12)",
              backdropFilter: headerOpaque ? "none" : "blur(8px)",
              border: headerOpaque ? "none" : "1px solid rgba(255,255,255,0.25)",
              color: "#fff", padding: "8px 20px", borderRadius: 8,
              fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
              boxShadow: headerOpaque ? "0 2px 12px rgba(27,94,32,0.3)" : "none",
            }}>Get Started Free</button>
          </div>
        </div>
      </nav>

      {/* ═══ HERO SECTION ═══ */}
      <section style={{
        background: "linear-gradient(135deg, #0d3f14 0%, #1B5E20 30%, #2E7D32 70%, #388E3C 100%)",
        padding: "140px 24px 100px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Islamic geometric pattern overlay */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.035,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 0L80 40L40 80L0 40Z' fill='none' stroke='white' stroke-width='0.5'/%3E%3Cpath d='M40 10L70 40L40 70L10 40Z' fill='none' stroke='white' stroke-width='0.3'/%3E%3Ccircle cx='40' cy='40' r='15' fill='none' stroke='white' stroke-width='0.3'/%3E%3C/svg%3E")`,
          backgroundSize: "80px 80px",
        }} />
        {/* Radial glow */}
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: "120%", height: "120%",
          background: "radial-gradient(ellipse at center, rgba(165,214,167,0.08) 0%, transparent 70%)",
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto" }}>
          {/* Trust badge */}
          <div className="z-fade" style={{
            display: "inline-block", background: "rgba(255,255,255,0.1)", borderRadius: 100,
            padding: "6px 18px", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.9)",
            marginBottom: 28, backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}>
            Trusted by Muslims worldwide
          </div>

          <h1 className="z-fade z-fade-d1" style={{
            fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 800, color: "#fff",
            lineHeight: 1.1, margin: "0 0 20px",
            letterSpacing: "-0.02em",
          }}>
            Calculate Your Zakat<br />
            <span style={{ color: "#a5d6a7" }}>With Confidence</span>
          </h1>

          <p className="z-fade z-fade-d2" style={{
            fontSize: "clamp(16px, 2.5vw, 20px)", color: "rgba(255,255,255,0.8)",
            lineHeight: 1.6, margin: "0 auto 36px", maxWidth: 600, fontWeight: 400,
          }}>
            The most comprehensive zakat calculator supporting all asset types, five madhabs,
            and 40 currencies. Know exactly what you owe — and fulfill your obligation with ease.
          </p>

          <div className="z-fade z-fade-d3" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={onGetStarted} className="z-btn-primary" style={{
              background: "#fff", color: "#1B5E20",
              padding: "14px 36px", borderRadius: 12, border: "none",
              fontSize: 16, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}>
              Start Calculating — It's Free
            </button>
            <a href="#how-it-works" className="z-btn-ghost" style={{
              background: "rgba(255,255,255,0.08)", color: "#fff",
              padding: "14px 36px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.2)",
              fontSize: 16, fontWeight: 600, cursor: "pointer", textDecoration: "none",
              backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
              display: "inline-flex", alignItems: "center",
              transition: "all 0.2s ease",
            }}>
              See How It Works
            </a>
          </div>

          {/* Trust indicators */}
          <div style={{
            display: "flex", gap: 40, justifyContent: "center", marginTop: 56,
            flexWrap: "wrap",
          }}>
            {[
              { num: "8+", label: "Asset Categories" },
              { num: "5", label: "Madhabs Supported" },
              { num: "40", label: "Currencies" },
              { num: "10", label: "Languages" },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>{item.num}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES SECTION ═══ */}
      <section id="features" style={{ padding: "80px 24px", background: "#f8faf8" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#2E7D32", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>Comprehensive Coverage</p>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: "#0d3f14", margin: "0 0 12px", letterSpacing: "-0.01em" }}>
              Everything You Need for Zakat
            </h2>
            <p style={{ fontSize: 17, color: "#555", maxWidth: 550, margin: "0 auto", lineHeight: 1.6 }}>
              From gold and cash to livestock and agriculture — calculate every type of zakat obligation accurately.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 24,
          }}>
            {[
              { icon: "💰", title: "Wealth & Investments", desc: "Cash, savings, stocks, business inventory, retirement accounts — all calculated with real-time nisab thresholds." },
              { icon: "🥇", title: "Gold & Silver", desc: "Live gold price fetching with automatic nisab calculation. Supports both weight-based and value-based entry." },
              { icon: "🐪", title: "Livestock Zakat", desc: "Complete nisab tables for camels, cattle, and sheep/goats following classical fiqh rulings with madhab-specific rules." },
              { icon: "🌾", title: "Agricultural Produce", desc: "Irrigated (5%) vs rain-fed (10%) calculation. Supports mixed irrigation with proportional rates." },
              { icon: "🏢", title: "Rental & Business Income", desc: "Rental income tracking with expense deductions. Business inventory and receivables calculation." },
              { icon: "⛏️", title: "Mining & Rikaz", desc: "Mineral extraction at 2.5% and buried treasure (rikaz) at 20% khums — both supported with clear explanations." },
            ].map((f, i) => (
              <div key={i} className="z-card" style={{
                background: "#fff", borderRadius: 16, padding: "28px 24px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
                border: "1px solid #e8efe8",
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24, marginBottom: 16,
                }}>{f.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0d3f14", margin: "0 0 8px" }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "#555", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ MADHAB SECTION ═══ */}
      <section style={{ padding: "72px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#2E7D32", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>Fiqh-Aware</p>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: "#0d3f14", margin: "0 0 12px", letterSpacing: "-0.01em" }}>
            Respects Your School of Thought
          </h2>
          <p style={{ fontSize: 17, color: "#555", maxWidth: 600, margin: "0 auto 40px", lineHeight: 1.6 }}>
            Zakat rules vary across madhabs. Zakatukum applies the correct rulings for your chosen school —
            from jewelry exemptions to agricultural thresholds.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
            {[
              { name: "Hanafi", ar: "حنفي" },
              { name: "Maliki", ar: "مالكي" },
              { name: "Shafi'i", ar: "شافعي" },
              { name: "Hanbali", ar: "حنبلي" },
              { name: "Ja'fari", ar: "جعفري" },
            ].map((m, i) => (
              <div key={i} className="z-tag" style={{
                background: "#f0f7f0", borderRadius: 12, padding: "14px 28px",
                border: "1px solid #c8e6c9", transition: "all 0.2s ease",
              }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: "#1B5E20" }}>{m.name}</span>
                <span style={{ fontFamily: "'Noto Naskh Arabic', serif", fontSize: 14, color: "#2E7D32", marginLeft: 8, opacity: 0.7 }}>{m.ar}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" style={{ padding: "80px 24px", background: "#f8faf8" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#2E7D32", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>Simple Process</p>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: "#0d3f14", margin: "0 0 12px", letterSpacing: "-0.01em" }}>
              How It Works
            </h2>
            <p style={{ fontSize: 17, color: "#555", maxWidth: 500, margin: "0 auto", lineHeight: 1.6 }}>
              Three simple steps to fulfill your zakat obligation with certainty.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
            {[
              { step: "1", title: "Enter Your Assets", desc: "Add your cash, gold, silver, investments, business inventory, rental income, livestock, and agricultural produce. Our calculator handles the complexity — you just enter the numbers." },
              { step: "2", title: "Review Your Calculation", desc: "See a clear breakdown of your zakat obligation across every asset category. Nisab thresholds are automatically checked using live gold prices. Madhab-specific rules are applied transparently." },
              { step: "3", title: "Track & Pay", desc: "Track your payments across the Hijri year. Choose from 11 payment methods including card, PayPal, Apple Pay, and bank transfer. Fee transparency ensures your zakat arrives in full." },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 16, flexShrink: 0,
                  background: "linear-gradient(135deg, #1B5E20, #2E7D32)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 22, fontWeight: 800,
                  boxShadow: "0 4px 12px rgba(27,94,32,0.3)",
                }}>
                  {s.step}
                </div>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: "#0d3f14", margin: "0 0 6px" }}>{s.title}</h3>
                  <p style={{ fontSize: 15, color: "#555", lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ LANGUAGES & CURRENCIES ═══ */}
      <section id="languages" style={{ padding: "72px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#2E7D32", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>Global Reach</p>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: "#0d3f14", margin: "0 0 12px", letterSpacing: "-0.01em" }}>
            Built for a Global Ummah
          </h2>
          <p style={{ fontSize: 17, color: "#555", maxWidth: 550, margin: "0 auto 40px", lineHeight: 1.6 }}>
            Available in 10 languages with full RTL support, and 40 currencies across every major Muslim-majority country.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10, marginBottom: 32 }}>
            {[
              "English", "العربية", "اردو", "Türkçe", "Bahasa Melayu",
              "Bahasa Indonesia", "Français", "Español", "Deutsch", "বাংলা"
            ].map((lang, i) => (
              <span key={i} className="z-tag" style={{
                background: "#f0f7f0", borderRadius: 8, padding: "8px 16px",
                fontSize: 14, fontWeight: 500, color: "#2E7D32", border: "1px solid #c8e6c9",
                transition: "all 0.2s ease", cursor: "default",
              }}>
                {lang}
              </span>
            ))}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
            {["🇺🇸","🇬🇧","🇸🇦","🇦🇪","🇶🇦","🇰🇼","🇧🇭","🇴🇲","🇵🇰","🇮🇳","🇧🇩","🇮🇩","🇲🇾","🇹🇷","🇪🇬","🇲🇦","🇳🇬","🇿🇦","🇯🇵","🇸🇬","🇦🇺","🇨🇦","🇧🇷","🇪🇺"].map((flag, i) => (
              <span key={i} style={{ fontSize: 22 }}>{flag}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PAYMENT METHODS ═══ */}
      <section style={{ padding: "72px 24px", background: "#f8faf8" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#2E7D32", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>Flexible Payments</p>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: "#0d3f14", margin: "0 0 12px", letterSpacing: "-0.01em" }}>
            11 Payment Methods
          </h2>
          <p style={{ fontSize: 17, color: "#555", maxWidth: 550, margin: "0 auto 36px", lineHeight: 1.6 }}>
            Pay your zakat however works best for you. Every method shows its fees upfront —
            because your zakat must arrive in full.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
            {[
              "Credit/Debit Card", "PayPal", "Apple Pay", "Google Pay",
              "Venmo", "Zelle", "Cash App", "ACH Transfer",
              "Wire Transfer", "Crypto", "Direct/In-Person"
            ].map((method, i) => (
              <div key={i} style={{
                background: "#fff", borderRadius: 10, padding: "10px 18px",
                border: "1px solid #e0e0e0", fontSize: 14, fontWeight: 500, color: "#333",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              }}>
                {method}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HIJRI CALENDAR ═══ */}
      <section style={{ padding: "72px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#2E7D32", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>Smart Calendar</p>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: "#0d3f14", margin: "0 0 12px", letterSpacing: "-0.01em" }}>
            Hijri Year Tracking
          </h2>
          <p style={{ fontSize: 17, color: "#555", maxWidth: 550, margin: "0 auto 24px", lineHeight: 1.6 }}>
            Your zakat year follows the Hijri calendar. Zakatukum automatically converts between Hijri and
            Gregorian dates, tracks multiple years, and sends you reminders before your zakat is due.
          </p>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 12,
            background: "#f0f7f0", borderRadius: 12, padding: "16px 28px",
            border: "1px solid #c8e6c9", boxShadow: "0 1px 3px rgba(27,94,32,0.08)",
          }}>
            <span style={{ fontSize: 22 }}>📅</span>
            <span style={{ fontSize: 15, fontWeight: 600, color: "#1B5E20" }}>
              Automatic Hijri ↔ Gregorian Conversion
            </span>
          </div>
        </div>
      </section>

      {/* ═══ CTA SECTION ═══ */}
      <section style={{
        padding: "80px 24px",
        background: "linear-gradient(135deg, #0d3f14 0%, #1B5E20 40%, #2E7D32 100%)",
        textAlign: "center",
        position: "relative", overflow: "hidden",
      }}>
        {/* Subtle pattern */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z' fill='none' stroke='white' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: "60px 60px",
        }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 800, color: "#fff", margin: "0 0 16px", letterSpacing: "-0.01em" }}>
            Fulfill Your Obligation Today
          </h2>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.8)", lineHeight: 1.6, margin: "0 0 32px" }}>
            Join Muslims around the world who trust Zakatukum to calculate and track their zakat.
            Free to use — always.
          </p>
          <button onClick={onGetStarted} className="z-btn-primary" style={{
            background: "#fff", color: "#1B5E20",
            padding: "16px 44px", borderRadius: 12, border: "none",
            fontSize: 17, fontWeight: 700, cursor: "pointer",
            boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}>
            Create Free Account
          </button>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{
        padding: "40px 24px", background: "#071a0a", textAlign: "center",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: "linear-gradient(135deg, #1B5E20, #2E7D32)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 14, fontWeight: 800,
            }}>Z</div>
            <span style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.75)" }}>
              Zakatukum <span style={{ fontFamily: "'Noto Naskh Arabic', serif", fontWeight: 400, opacity: 0.5 }}>زكاتكم</span>
            </span>
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", margin: "0 0 8px", lineHeight: 1.5 }}>
            A zakat calculator tool. This is not a fatwa service — please consult your local scholar for specific rulings.
          </p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", margin: 0 }}>
            © {new Date().getFullYear()} Zakatukum. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
