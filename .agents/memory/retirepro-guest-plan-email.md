---
name: RetirePro guest plan email delivery
description: Guest plan summaries are sent through Resend without sign-in; optional marketing consent is stored locally and is not synced to an external marketing provider.
---

## Rule
Use the existing Resend connector for guest plan-summary emails. A guest can receive a compact PDF without an account, while marketing consent remains unchecked by default and is recorded in RetirePro's database only.

**Why:** Brevo was not configured in this workspace, and the product decision was to replace its requested use with the already-connected Resend service rather than introduce another email provider.

**How to apply:** Keep transactional delivery independent from marketing opt-in. Do not imply that checked consent adds a contact to an external list unless a marketing integration is explicitly connected and implemented.