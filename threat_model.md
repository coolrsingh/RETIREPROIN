# Threat Model

## Project Overview

RetirePro is a retirement-planning application with a React/Vite web frontend, an Express API backend, PostgreSQL storage through Drizzle ORM, and Replit Auth for user login. The primary production deployment is public at `retirepro.in`; the browser client is untrusted and all meaningful security decisions must be enforced by the API. The repo also contains an Expo mobile app artifact and a mockup sandbox. The mockup sandbox is development-only and out of production scope unless a future deployment proves otherwise.

## Assets

- **User accounts and sessions** — Replit OIDC identities, server-side session records, refresh tokens, and role assignments. Compromise would allow account takeover or privilege abuse.
- **Retirement scenarios and financial profile data** — names, dates of birth, family composition, income, expenses, assets, liabilities, and retirement projections. This is sensitive personal and financial data.
- **Lead data** — public lead-capture names, phone numbers, optional emails, and UTM metadata. This is personally identifiable information and directly tied to sales workflows.
- **Admin CRM defaults and business analytics** — global planning assumptions, lead lists, user counts, plan counts, and premium conversion metrics. Exposure or tampering would affect both business operations and user-facing advice.
- **Application secrets and infrastructure access** — database credentials, session secret, OIDC configuration, and any network reachability from the backend runtime or headless PDF renderer.

## Trust Boundaries

- **Browser/mobile client to API** — all client input is attacker-controlled and must be validated and authorized server-side.
- **API to PostgreSQL** — the API has broad read/write access to sensitive data; broken access control at the route layer becomes direct database exposure.
- **Authenticated user to other authenticated users** — saved scenarios, profiles, exports, and lead attachments must stay scoped to the owning account.
- **Regular user to admin** — CRM defaults, lead visibility, and reporting endpoints require server-side role checks.
- **Backend to external/OIDC services** — the auth layer trusts Replit OIDC responses and stores refresh-capable session state.
- **Backend to headless browser/PDF renderer** — HTML assembled from application data is executed/rendered inside Chromium, creating a boundary where unescaped content can become active network-capable content.
- **Production vs dev-only artifacts** — `artifacts/mockup-sandbox/` is out of scope for production findings; mobile build scripts are dev/build tooling unless a user-controlled production path is shown.

## Scan Anchors

- Production backend entry points: `artifacts/api-server/src/index.ts`, `artifacts/api-server/src/app.ts`, `artifacts/api-server/src/routes/routes.ts`.
- Highest-risk code areas: auth/session handling in `artifacts/api-server/src/replitAuth.ts`, authorization and public routes in `artifacts/api-server/src/routes/routes.ts`, export generation in `artifacts/api-server/src/pdf.ts`, and schema/storage in `lib/db/src/schema/schema.ts` and `artifacts/api-server/src/storage.ts`.
- Public surfaces: `/api/login`, `/api/callback`, `/api/plan/try`, `/api/lead`, unauthenticated export/reporting endpoints, and public web landing/blog/legal routes.
- Authenticated surfaces: scenario CRUD, calculations, profile, share tracking, premium upgrade, and user-facing exports.
- Admin surfaces: CRM defaults and lead retrieval.
- Usually ignore as dev-only: `artifacts/mockup-sandbox/`, `.migration-backup/`, and mobile build tooling unless production reachability is demonstrated.

## Threat Categories

### Spoofing

RetirePro relies on Replit OIDC plus server-side sessions. Protected API endpoints must require a valid session on every request, refresh expired tokens safely, and never infer trust from frontend route gating alone. Role-sensitive actions must derive identity and role from the server-side user record, not from client-provided fields.

### Tampering

The application accepts complex financial inputs, lead-capture data, and profile updates from untrusted clients. Scenario creation, lead association, premium status changes, and CRM-default updates must validate structure and enforce ownership so one user cannot alter another user's records or bypass payment/business rules.

### Information Disclosure

Saved scenarios, exported reports, profile data, leads, and business analytics all contain information that should not be publicly enumerable. API responses and export endpoints must scope reads to the authenticated owner or admin, avoid leaking sensitive data through public endpoints, and avoid rendering attacker-controlled data into contexts that can access internal network resources.

### Denial of Service

Public calculation and export endpoints can trigger CPU- and memory-intensive work such as long-running retirement projections and headless PDF rendering. These endpoints need authentication or effective abuse controls so arbitrary internet clients cannot exhaust server resources.

### Elevation of Privilege

The most important privilege boundaries are regular user vs admin and one user vs another user's financial records. Premium entitlements must only be granted after a verified payment flow, and export/reporting features must not let attackers jump from ordinary access to broader data access, backend network access, or administrator-only functionality.
