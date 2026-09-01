---
name: RetirePro Resend plan email
description: Delivery requirements for emailed private plan exports.
---

RetirePro plan-report emails use the connected Resend integration and require a verified `RETIREPRO_EMAIL_FROM` sender identity. Create a fresh connector client for each send so the integration can refresh its access automatically.

**Why:** Resend will reject or limit delivery from unverified sender identities, and connector authorization can expire between requests.

**How to apply:** Keep financial plan exports server-generated after authentication and ownership checks; never expose a sender credential or pre-generated private attachment to the browser.