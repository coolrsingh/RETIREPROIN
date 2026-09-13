---
name: RetirePro account deletion
description: Scope and product boundary for self-service account-data deletion.
---

Self-service deletion permanently removes all RetirePro-held personal data associated with the signed-in person, including their profile, saved plans and dependent financial records, linked contact records, marketing subscription, guest email-plan records, and active app sessions.

**Why:** RetirePro uses Replit OIDC for authentication. The application does not own or administer the separate Replit identity, so it can only delete data it controls. The interface must make that boundary explicit rather than suggesting it can delete a Replit account.

**How to apply:** Keep deletion authenticated, irreversible only after explicit confirmation, and transactional. Signing in again later should create a new RetirePro profile rather than restore erased data.