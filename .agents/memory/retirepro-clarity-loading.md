---
name: RetirePro Clarity loading
description: Constraint for Microsoft Clarity scripts in the RetirePro SPA.
---

Microsoft Clarity supports one tracking tag per page. RetirePro's route-specific loader must not be paired with a static Clarity snippet in the HTML shell, and it must skip injecting another tag when navigation changes routes within the same SPA session.

**Why:** Multiple Clarity tags produced a third-party warning and an uncaught non-Error runtime report in the browser, which surfaced as a RetirePro artifact crash.

**How to apply:** Keep Clarity injection in one place, guard against any existing `clarity.ms/tag/` script, and validate a fresh article preview plus browser logs after analytics changes.