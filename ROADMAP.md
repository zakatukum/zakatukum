# Zakatukum (زكاتكم) — SaaS Roadmap

**Last Updated:** April 6, 2026
**Status:** MVP web app live on Vercel. Backend auth via Supabase. Landing page + feedback system live. Scaling to mobile.

---

## Architecture Overview

```
┌────────────────────────────────────────────────────┐
│                    CLIENTS                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │  Web App  │  │ iOS App  │  │  Android App     │  │
│  │ (Next.js) │  │ (Expo)   │  │  (Expo)          │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
└─────────────────────┬──────────────────────────────┘
                      │ REST API + WebSocket
┌─────────────────────▼──────────────────────────────┐
│                   BACKEND                           │
│  Supabase (Auth + PostgreSQL + Edge Functions)     │
│  ┌────────┐ ┌────────┐ ┌──────┐ ┌───────────────┐ │
│  │  Auth  │ │ Zakat  │ │Stripe│ │ Plaid / Wise  │ │
│  │(Supa.) │ │ CRUD   │ │ Pay  │ │  Bank Sync    │ │
│  └────────┘ └────────┘ └──────┘ └───────────────┘ │
└─────────────────────┬──────────────────────────────┘
                      │
┌─────────────────────▼──────────────────────────────┐
│               INFRASTRUCTURE                        │
│  PostgreSQL │ S3 (receipts) │ Push (Expo)          │
└────────────────────────────────────────────────────┘
```

---

## Completed Features ✓

### Core Calculator
- [x] Wealth zakat (gold, silver, cash, investments)
- [x] Livestock zakat (camels, cattle, sheep/goats with nisab tables)
- [x] Agricultural produce zakat (irrigated 5% vs rain-fed 10%)
- [x] Mining & minerals zakat (2.5% per extraction)
- [x] Rikaz/treasure zakat (20% khums)
- [x] Rental income zakat calculation
- [x] Business inventory zakat
- [x] Debt and liability handling

### Payment System (UI Complete)
- [x] 11 payment methods: Card, PayPal, Apple Pay, Google Pay, Venmo, Zelle, Cash App, ACH, Wire, Crypto, Direct
- [x] Fee transparency badges on each method
- [x] Stripe fee warning per Islamic ruling (zakat must arrive in full)
- [x] Method-specific checkout screens
- [x] Donor-absorbs-fees guidance

### Internationalization
- [x] 10 languages: English, Arabic, Urdu, Turkish, Malay, Indonesian, French, Spanish, German, Bengali
- [x] Full RTL support (Arabic, Urdu)
- [x] Localized number and date formats

### Calendar & Year Management
- [x] Hijri/Gregorian calendar conversion (Julian Day Number algorithm)
- [x] Hijri year calculation using Jan 1 reference date
- [x] Hijri range display (e.g., "1447–1448 AH")
- [x] Multi-year zakat tracking with year selector dropdown
- [x] Add Year modal with Quick Select buttons and Hijri range preview
- [x] Clean data model — users start empty, add their own years

### UI/UX
- [x] Dashboard with quick-glance summary cards
- [x] Responsive mobile sidebar (hamburger menu, isMobile state)
- [x] Toast notification system (success/error, 4s auto-dismiss)
- [x] Customizable Report view (year filter + section toggles)
- [x] Settings/Profile page
- [x] Admin dashboard (conditional on is_admin flag in DB)
- [x] Sidebar: current year display + Add Year button
- [x] **Landing page** — public marketing page with hero, features, madhab support, languages/currencies, payment methods, Hijri tracking, CTA sections
- [x] **Feedback system** — category selection (7 types), star rating, message form, user history view, admin view with all submissions

### Auth & Deployment
- [x] Supabase Auth (email/password signup + login)
- [x] Password reset flow (PASSWORD_RECOVERY event handling)
- [x] Deployed to Vercel (auto-deploy from GitHub)
- [x] GitHub repo: zakatukum/zakatukum

### Design System
- [x] **DESIGN.md** — full 9-section design system (awesome-design-md format) with green-tinted chromatic shadows, Inter typography hierarchy, component specs, responsive breakpoints

---

## Phase 1: MVP Web — 100% COMPLETE ✓

### Recently Completed (April 6, 2026)
- [x] **Persist zakat data to Supabase** — v2 JSONB format, full yearData stored in `investments` column with backward compat
- [x] **Auto gold price fetch** — client-side dual source (gold-api.com live + freegoldapi.com historical), auto-fetches on Lock Date selection
- [x] **Email reminder backend** — Resend API integration with branded HTML templates (4 reminder types), domain verified for zakatukum.com
- [x] **Resend DNS verification** — DKIM, MX, SPF records added to Cloudflare for zakatukum.com, domain fully verified
- [x] **Vercel env vars** — RESEND_API_KEY and RESEND_FROM_EMAIL configured for production
- [x] **Admin access** — database-driven `is_admin` boolean column in profiles table (replaced hardcoded email)
- [x] **Removed hardcoded emails** — all personal emails removed from codebase
- [x] **Fixed Vercel API routes** — removed `outputFileTracingRoot` from next.config.js that caused all API routes to 500
- [x] **Set is_admin flag** — added `is_admin` column to profiles table, set true for admin user via Supabase SQL Editor
- [x] **Landing page** — professional marketing page with Islamic geometric patterns, green-tinted shadows, section labels, CSS hover animations, fade-in effects, Noto Naskh Arabic for Arabic text
- [x] **Feedback system** — `/api/feedback` route (POST/GET), `feedback` table in Supabase with RLS policies, 7 categories, star rating, user feedback history, admin feedback dashboard
- [x] **DESIGN.md** — comprehensive design system based on awesome-design-md format (Stripe fintech pattern adapted for Islamic green branding)

### Database Tables
- `profiles` — id, email, name, country, currency, madhab, lang, is_admin, reminders, created_at, updated_at
- `zakat_years` — id, user_id, hijri_year, investments (JSONB v2 data), created_at, updated_at
- `zakat_payments` — id, user_id, hijri_year, amount, method, org, date, notes
- `feedback` — id, user_id, user_email, category, rating, message, admin_response, status, created_at, updated_at

---

## Phase 2: Mobile App (Expo Strategy)

**Timeline:** 4-6 weeks
**Approach:** Expo (React Native) — reuse existing React calculator logic

### Why Expo?
- Single codebase for iOS, Android, and web
- Simplified build process (no Xcode/Android Studio)
- OTA updates without app store review
- Expo Router for navigation
- EAS Build for app store submissions
- Great for solo developer workflow

### Core Mobile Setup
- [ ] Initialize Expo project with Expo Router
- [ ] Migrate calculator logic from web (reuse React components)
- [ ] Offline-first storage (AsyncStorage + SQLite)
- [ ] Push notifications (Expo Notifications API)
- [ ] Biometric auth (FaceID/TouchID/fingerprint)
- [ ] Deep linking for web-to-app handoff
- [ ] App icons and splash screens (all device sizes)

### iOS App Store
- [ ] Apple Developer Account ($99/year)
- [ ] App Store Connect setup
- [ ] Privacy Policy and Terms of Service
- [ ] Financial app review compliance (calculator transparency, fatwa disclaimers)
- [ ] Screenshots for all device sizes (6.7", 6.1", 5.5" phones + iPad)
- [ ] App Preview video (optional but recommended)
- [ ] ASO metadata: Arabic/Urdu keywords critical
- [ ] TestFlight beta testing

### Android Play Store
- [ ] Google Play Developer Account ($25 one-time)
- [ ] Play Console project setup
- [ ] Data Safety form
- [ ] Content rating questionnaire
- [ ] App signing (EAS handles automatically)
- [ ] Screenshots + feature graphic (1024x500px)
- [ ] Internal testing track for beta

### Mobile-Specific Features
- [ ] Zakat reminder notifications (Sha'ban/Ramadan alerts, configurable)
- [ ] Gold price widget (live market rates)
- [ ] Camera for gold weight entry (scale photo capture)
- [ ] Share zakat receipts (email, WhatsApp, PDF export)
- [ ] Dark mode support
- [ ] Quick calculation shortcuts

---

## Phase 3: Backend Enhancements

**Timeline:** 2-3 weeks

### User Management
- [ ] Family accounts (manage multiple household members)
- [ ] Data export and deletion (GDPR compliance)

### Email Reminders (Scheduled)
- [ ] Supabase Edge Function or Vercel Cron for scheduled emails
- [ ] Configurable reminder timing (Sha'ban, Ramadan, custom)
- [ ] Unsubscribe handling

### Bank Connection (Optional)
- [ ] Plaid Link integration (connect bank accounts)
- [ ] Auto-import balances for zakat calculation
- [ ] Recurring sync

---

## Phase 4: Payments (Live Processing)

**Timeline:** 2 weeks after backend is ready

### Stripe Integration
- [ ] Stripe Connect account setup (each org has own Stripe account)
- [ ] PaymentIntent integration (cards + ACH)
- [ ] Webhook handling (payment success/failure events)
- [ ] Payment receipts (email + PDF)
- [ ] Payment history and tracking

### International Transfers
- [ ] Wire instructions display (Phase 4A — user sends from their own bank)
- [ ] Exchange rate display (informational)
- [ ] Wise API integration (Phase 4B — programmatic transfers)

---

## Phase 5: Compliance & Security

**Timeline:** 3-4 weeks (can overlap with Phase 4)

### Legal
- [ ] Money transmitter license assessment (Stripe Connect may avoid this)
- [ ] Consult fintech lawyer (Neda Legal or Hudson Cook)
- [ ] KYC/AML for large transactions ($3,000+ wire threshold)
- [ ] Terms of Service and Privacy Policy
- [ ] Cookie policy and GDPR compliance

### Security
- [ ] Encrypt sensitive data at rest
- [ ] Rate limiting on all endpoints
- [ ] Input validation and SQL injection prevention
- [ ] HTTPS everywhere with HSTS headers
- [ ] CORS lockdown
- [ ] Security audit

---

## Phase 6: Growth & Monetization

**Timeline:** Ongoing

### Revenue Models
1. **Freemium SaaS** — Free calculator + premium ($5/mo or $40/yr) for direct payments, bank sync, PDF reports
2. **Transaction Fee** — 0.5-1% on payments (secondary)
3. **Organization Listing Fees** — Orgs pay to be featured/verified
4. **White-Label for Mosques** — Custom domain + branding for Islamic centers
5. **Sadaqah Model** — Donation button for sustainability

### Feature Expansions
- [ ] Advanced reporting (PDF, Excel export)
- [ ] Gold price alerts (real-time market data)
- [ ] Multi-currency support (USD, GBP, EUR, SAR, AED)
- [ ] AI-powered donation matching (suggest org based on values)
- [ ] Org admin dashboard
- [ ] Tax receipt generation (US 501(c)(3) letters)
- [ ] API for third-party integrations
- [ ] Unit/integration tests

### Marketing
- [ ] SEO (target: "zakat calculator", "nisab", "ramadan zakat")
- [ ] Content marketing (zakat guides, Islamic finance articles)
- [ ] Mosque and Islamic center partnerships
- [ ] Community building (Discord, WhatsApp groups)
- [ ] Email newsletter (Sha'ban/Ramadan campaigns)

---

## Estimated Costs

### One-Time (Startup)
| Item | Cost |
|------|------|
| Apple Developer Account | $99 |
| Google Play Developer Account | $25 |
| Domain (1 year) | $12 |
| **Total Upfront** | **~$136** |

### Monthly (Recurring)
| Item | Cost |
|------|------|
| Vercel (web hosting) | $0 (free tier) |
| Supabase (auth + database) | $0-25 |
| Expo EAS (build priority — optional) | $0-99 |
| Email service (Resend) | $0-20 |
| **Total Monthly** | **~$0-144** |

### Per-Transaction
| Vendor | Fee |
|--------|-----|
| Stripe | 2.9% + $0.30 (card) |
| Stripe | 1% + $0.30 (ACH) |
| Wise | ~0.5-1.5% (international wire) |

---

## Timeline Summary

| Phase | Duration | Status |
|-------|----------|--------|
| **Phase 1:** MVP Web | Weeks 1-4 | **100% COMPLETE** ✓ |
| **Phase 2:** Mobile App (Expo) | Weeks 5-10 | Not started |
| **Phase 3:** Backend Enhancements | Weeks 11-13 | Not started |
| **Phase 4:** Payments (Live) | Weeks 14-15 | Not started |
| **Phase 5:** Compliance & Security | Weeks 16-19 | Not started |
| **Phase 6:** Growth & Monetization | Week 20+ | Not started |

**Estimated Total:** 19-24 weeks

---

## Immediate Next Steps

1. [x] ~~Persist zakat data to Supabase~~ (DONE — v2 JSONB format)
2. [x] ~~Wire up email reminder backend~~ (DONE — Resend with verified domain)
3. [x] ~~Fix Vercel API routes 500 error~~ (DONE — removed outputFileTracingRoot)
4. [x] ~~Set is_admin flag in Supabase profiles~~ (DONE — added column + set for admin)
5. [x] ~~Landing page for new users~~ (DONE — professional marketing page with design system)
6. [x] ~~Feedback system~~ (DONE — form + API + Supabase table + admin view)
7. [x] ~~DESIGN.md~~ (DONE — awesome-design-md format, Stripe-inspired)
8. [ ] Initialize Expo project and migrate calculator
9. [ ] Open Apple Developer and Google Play accounts
10. [ ] Plan beta testing with Islamic communities
