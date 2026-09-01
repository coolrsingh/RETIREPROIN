---
name: RetirePro PDF browser runtime
description: Puppeteer report generation requires the Chromium system package and must resolve the browser executable from the runtime PATH.
---

## Rule
Keep Chromium available as a system dependency and resolve its executable from `PATH` before launching Puppeteer for any RetirePro PDF report.

**Why:** The Puppeteer package is installed without its bundled Chrome binary in this environment, so report generation otherwise fails before an email can be sent.

**How to apply:** Use the shared PDF-browser resolver for guest and signed-in report generators; do not rely on Puppeteer's download cache or a Nix store path.