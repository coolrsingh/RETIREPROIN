---
name: Retirepro web theme & lead capture
description: Durable conventions for the RetirePro landing theme and the "Talk to an Expert" lead-capture flow.
---

# Branding / logo convention
All page headers + footer render the brand via the shared `BrandLogo` component (`src/components/brand-logo.tsx`), which uses the transparent emblem at `src/assets/retirepro-logo.png`. On dark backgrounds (landing footer) wrap the emblem in a white circle for contrast. Favicon = same logo at `public/favicon.png`.

**Why:** founder wanted the uploaded logo beside "RetirePro" everywhere and as the favicon — one component keeps it consistent. Don't reintroduce the old `<ChartLine>` icon as the brand mark.

# Logged-in theme convention
Logged-in pages (home, plan-dashboard, plan-form, settings-crm, leads-admin) must share the landing's light look so the UI doesn't "revert to old format" after login: root `bg-gradient-to-b from-[#F4F9FF] to-white` (including loading/empty/error fallback states) + `bg-white/85 backdrop-blur-xl ... sticky top-0` headers.

**Why:** founder complained the post-login UI looked like an older, plainer theme; harmonizing backgrounds/headers makes it feel current and consistent with the marketing site.

# Landing theme convention
The RetirePro landing (`artifacts/retirepro-web/src/pages/landing.tsx`) is a LIGHT theme.
- Hero + Final CTA: light gradient `linear-gradient(135deg, #F4F9FF 0%, #FFFFFF 100%)`, dark slate text (#0F172A headings, #475569 body).
- Secondary CTAs are blue outline (#2563EB), primary CTAs stay orange (#F15A24).
- ONLY two sections stay dark: the stats bar (#0F172A) and the footer (#060E1A).

**Why:** founder brief asked to move away from the old all-dark hero to a lighter, trust-forward look while keeping orange as the action color. Keep new sections consistent with this — do not reintroduce dark hero/CTA backgrounds.

# Expert / lead-capture flow
"Talk to an Expert" card lives in `guest-plan-preview.tsx` (advisor contact details are hardcoded in that file — read them from source, do not duplicate here).
- Contact handlers must be **fire-and-forget**: call `void saveLead()` then immediately open WhatsApp/mailto. Never `await` the save before opening the channel — a slow `/api/lead` must not block the user.
- `saveLead()` POSTs `/api/lead` only when phone is present; email is optional.

**Why:** brief requires both direct contact AND lead persistence, but contact must never be blocked by the DB write.

# Schema note
`leads.email` is nullable (was `.notNull()`) so phone-only WhatsApp enquiries can be saved. After changing `lib/db` schema, restart the api-server workflow — `createInsertSchema` reads the table at import time, so the running server keeps the old (stricter) schema until restarted.
