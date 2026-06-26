# RetirePro.in — Developer Brief
## 4 Priority Changes · Deliver Before Any Other Work

**Site:** RetirePro.in (Replit project)
**Briefed by:** Rahul (Founder)
**Status:** These 4 changes must go live before any new feature work begins.

---

## CHANGE 1 — Switch to Light Theme

The current dark background must be replaced with a clean, light, institutional look. Finance users do not trust dark-themed sites with their personal data.

### Exact colour replacements:

| Element | Current | New |
|---|---|---|
| Page / hero background | `#0F172A` (near-black) | Hero: `linear-gradient(135deg, #F4F9FF 0%, #FFFFFF 100%)` · All other sections: `#FFFFFF` or `#F8FAFC` alternating |
| Primary headings | White text | `#0F172A` (Deep Slate) |
| Body / subtitle text | Light grey on dark | `#475569` (Cool Grey) |
| Stats bar background | Dark navy | `#0F172A` — **keep this section dark only**, it works as a contrast band |
| Card backgrounds | Dark card | `#FFFFFF` with `box-shadow: 0 20px 40px -15px rgba(37,99,235,0.08)` and `border-radius: 16px` |
| Primary CTA buttons | Orange `#E8613A` | **Keep as-is** — orange CTAs work well |
| Secondary CTA buttons | Dark outline | `border: 1px solid #2563EB`, `color: #2563EB`, transparent background, `border-radius: 9999px` |
| Nav background | Dark | White, `border-bottom: 1px solid #E2E8F0` |
| Sign In button in nav | Orange | Keep orange |

### Typography (add Google Fonts if not already present):
```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```
- **All H1, H2, H3 headings** → `font-family: 'Playfair Display', serif`
- **All body text, labels, buttons** → `font-family: 'Inter', sans-serif`
- **Hero H1** → Use Playfair Display, italicise 1 key word. Example: `Plan Your <em>Retirement</em> Free.`

---

## CHANGE 2 — Trust Badges Row Above the Calculator Form

Directly above the calculator card (the form with Full Name, Date of Birth etc.), add a horizontal trust row.

### HTML to add:
```html
<div class="trust-row">
  <span class="trust-badge">🔒 256-bit Encrypted</span>
  <span class="trust-divider">·</span>
  <span class="trust-badge">🇮🇳 India-Specific</span>
  <span class="trust-divider">·</span>
  <span class="trust-badge">✅ AMFI-Registered Partner</span>
  <span class="trust-divider">·</span>
  <span class="trust-badge">🛡️ Your data is never sold or shared</span>
</div>
```

### CSS for trust row:
```css
.trust-row {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px 16px;
  margin-bottom: 20px;
  padding: 12px 20px;
  background: #EFF6FF;
  border: 1px solid #BFDBFE;
  border-radius: 12px;
  max-width: 860px;
  margin-left: auto;
  margin-right: auto;
}
.trust-badge {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #1E40AF;
}
.trust-divider {
  color: #93C5FD;
  font-size: 13px;
}
```

**Placement:** This trust row goes ABOVE the calculator card, BELOW the "See Your Retirement Future in 30 Seconds" heading.

---

## CHANGE 3 — DPDP Consent Checkbox in Calculator Form

Inside the calculator form, add a consent checkbox ABOVE the submit button.

### HTML to add (inside the form, just above the submit button):
```html
<div class="consent-block">
  <label class="consent-label">
    <input type="checkbox" id="dpdp-consent" required />
    <span class="consent-text">
      I consent to RetirePro collecting and storing my retirement data as described in the 
      <a href="/privacy-policy" target="_blank">Privacy Policy</a>. 
      My data will not be sold or shared with third parties without my permission.
    </span>
  </label>
  <p class="consent-note">Required under the Digital Personal Data Protection Act, 2023 (India)</p>
</div>
```

### CSS:
```css
.consent-block {
  margin: 20px 0 16px;
  padding: 16px;
  background: #F0FDF4;
  border: 1px solid #BBF7D0;
  border-radius: 10px;
}
.consent-label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
}
.consent-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  margin-top: 2px;
  flex-shrink: 0;
  accent-color: #2563EB;
  cursor: pointer;
}
.consent-text {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: #374151;
  line-height: 1.6;
}
.consent-text a {
  color: #2563EB;
  text-decoration: underline;
}
.consent-note {
  font-size: 11px;
  color: #6B7280;
  margin-top: 8px;
  padding-left: 30px;
}
```

### Validation:
```javascript
// Add this validation before the form submits
const consentCheckbox = document.getElementById('dpdp-consent');
if (!consentCheckbox.checked) {
  alert('Please provide consent to proceed. This is required under Indian data protection law.');
  return false;
}
```

---

## CHANGE 4 — "Talk to an Expert" Card Below Calculator Results

After the calculator shows results (corpus projection, funding gap, SIP needed), add this card below the results section.

### HTML to add:
```html
<div class="expert-card">
  <div class="expert-card-inner">
    <div class="expert-left">
      <span class="expert-badge">FREE · No obligation</span>
      <h3 class="expert-title">Want a personalised retirement plan?</h3>
      <p class="expert-desc">
        Our AMFI-registered advisor (Nidesh Financial, est. 2016) will review your numbers 
        and suggest the right SIP, NPS, and EPF strategy for your specific situation — in a 
        free 30-minute call.
      </p>
      <div class="expert-stats">
        <span>✅ 200+ families guided</span>
        <span>✅ Kalyan · Thane · Mumbai</span>
        <span>✅ AMFI Registered</span>
      </div>
    </div>
    <div class="expert-right">
      <a href="https://wa.me/919819590598?text=Hi%2C%20I%20used%20the%20RetirePro%20calculator%20and%20would%20like%20a%20free%20retirement%20review." 
         target="_blank" 
         class="expert-cta-primary">
        📱 Book Free Call on WhatsApp
      </a>
      <a href="mailto:investments.nidesh@outlook.com?subject=Free%20Retirement%20Review%20Request&body=Hi%2C%20I%20used%20the%20RetirePro%20calculator%20and%20would%20like%20a%20free%20retirement%20review." 
         class="expert-cta-secondary">
        ✉️ Or Email Us
      </a>
      <p class="expert-disclaimer">
        * Advisory services by Nidesh Financial. AMFI-registered MFD. 
        Mutual fund investments are subject to market risks.
      </p>
    </div>
  </div>
</div>
```

### CSS:
```css
.expert-card {
  margin: 32px auto;
  max-width: 860px;
  background: linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 100%);
  border: 1px solid #BFDBFE;
  border-radius: 20px;
  padding: 2px;
}
.expert-card-inner {
  background: #FFFFFF;
  border-radius: 18px;
  padding: 32px;
  display: flex;
  gap: 32px;
  align-items: flex-start;
  flex-wrap: wrap;
}
.expert-left {
  flex: 1;
  min-width: 260px;
}
.expert-badge {
  display: inline-block;
  background: #DCFCE7;
  color: #166534;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 4px 12px;
  border-radius: 9999px;
  margin-bottom: 12px;
}
.expert-title {
  font-family: 'Playfair Display', serif;
  font-size: 22px;
  color: #0F172A;
  margin-bottom: 10px;
  line-height: 1.3;
}
.expert-desc {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #475569;
  line-height: 1.7;
  margin-bottom: 16px;
}
.expert-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
  font-size: 13px;
  color: #1E40AF;
  font-weight: 500;
}
.expert-right {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 220px;
  align-items: stretch;
}
.expert-cta-primary {
  display: block;
  background: #25D366;
  color: #FFFFFF;
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  font-weight: 600;
  text-align: center;
  padding: 14px 24px;
  border-radius: 9999px;
  text-decoration: none;
  transition: background 0.2s;
}
.expert-cta-primary:hover { background: #20B558; }
.expert-cta-secondary {
  display: block;
  background: transparent;
  color: #2563EB;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  padding: 12px 24px;
  border-radius: 9999px;
  border: 1px solid #2563EB;
  text-decoration: none;
  transition: background 0.2s;
}
.expert-cta-secondary:hover { background: #EFF6FF; }
.expert-disclaimer {
  font-size: 10px;
  color: #9CA3AF;
  line-height: 1.5;
  text-align: center;
}
```

### Placement:
- Show this card **after** the results section renders
- Do NOT show it before the user submits the form
- On mobile, stack left and right sections vertically

---

## Footer Updates

Add these 4 links to the footer (you'll receive the HTML files for these pages):

```html
<footer-links>
  <a href="/privacy-policy">Privacy Policy</a>
  <a href="/disclaimer">Disclaimer</a>
  <a href="/refund-policy">Refund Policy</a>
  <a href="/terms-and-conditions">Terms & Conditions</a>
</footer-links>
```

---

## Do NOT change:
- Mobile CSS, breakpoints, or media queries (leave all `@media` rules untouched)
- The calculator logic / JavaScript
- The stats ticker bar
- Blog section structure
- Any routing logic

---

*All 4 compliance page HTML files are attached separately. Place them as static routes: `/privacy-policy`, `/disclaimer`, `/refund-policy`, `/terms-and-conditions`.*
