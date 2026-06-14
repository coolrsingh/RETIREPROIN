# RetirePro (retirepro.in) — Web App Feedback for Developer
**Prepared by:** RetirePro Owner  
**Date:** June 14, 2026  
**Reference URLs:** https://retirepro.in | Replit dev build

---

## ⚠️ GLOBAL CONSTRAINT — DO NOT TOUCH
**Mobile responsiveness must NOT be changed at this stage.** All feedback below applies to the **desktop web experience only**. Do not alter any mobile breakpoints, media queries, or mobile-specific CSS.

---

## CORRECT PAGE ORDER (Landing Page)

```
1. Hero Section
2. Why RetirePro Section   ← stays ABOVE calculator
3. Calculator Section
4. Blog / Articles Section
5. Footer
```

---

## ISSUE #1 — Excessive Side Whitespace + Add More Hero Preview Images

**Problem:**
The landing page has too much empty/wasted horizontal space on both sides. The floating "Priya's Retirement Plan" card in the hero is great — keep it. But we should add more floating preview snapshots of the inside dashboard experience.

**What to do:**
- Reduce horizontal padding on the main content wrapper. Use full available viewport width. Target `max-width: 1280px` with `padding: 0 24px` on the sides — not the current narrow layout.
- In the Hero section, add **2–3 additional floating preview card images** of the logged-in dashboard experience — e.g., a "Net Worth Projection graph card" and a "Cashflow Analysis card". Position these on the right half of the hero, staggered at slight angles using CSS `rotate: -3deg`, `rotate: 2deg` etc. so they look natural and layered, not stacked.
- These images can be static screenshots (`<img>` tags) of the existing dashboard. No live data needed.

---

## ISSUE #2 — "Sign In to Save" CTA Button Is Invisible

**Problem:**
The **"Sign In to Save"** button that appears beside "Try Free Calculator" is invisible — its text color is white, making it unreadable against a light background.

**Fix:**
- Text color: `#F15A24` (brand orange)
- Border: `1.5px solid #F15A24`
- Background: transparent (keeps it as a secondary CTA)
- Button hierarchy should be:
  - **Primary:** Filled orange button → "Try Free Calculator"
  - **Secondary:** Outlined orange button → "Sign In to Save"

---

## ISSUE #3 — Calculator Section: Expand Layout + Update Copy

**Problem:**
The calculator section is too narrow and small. It doesn't use the available space and the headline copy is weak.

**What to do:**

### Headline (replace existing):
```
See Your Retirement Future in 30 Seconds. No account required.
```

### Subheadline (add below headline):
```
Enter a few details below and instantly see your projected corpus,
funding gap, and net worth projection.
```

### Layout fixes:
- Make the calculator section full-width (`max-width: 1280px; margin: 0 auto; padding: 80px 24px`)
- Arrange input fields in a **2-column grid** on desktop, not a single narrow column
- Input labels: minimum `16px` font size
- Submit/Calculate button: full-width within the form, filled `#F15A24` orange, large (`padding: 16px`, `font-size: 18px`)
- Section headline: `36px–40px`, `font-weight: 700`

---

## ISSUE #4 — After Calculator: Open Full Dashboard on New Page

**Problem:**
Currently, after the user enters data in the calculator and submits, they only see a small inline summary line with a final corpus number (or similar minimal output) on the same page. This is not enough — the user has no sense of the full value.

**What to do:**
- After the user submits calculator data, **open a new page/route** (e.g. `/results` or `/plan/preview`). Do NOT show results inline on the landing page.
- On this new results page, show the **complete dashboard** that a logged-in user sees, including:
  - ✅ Summary stat cards (Required Corpus, Projected Corpus, Funding Gap, Years to Retirement)
  - ✅ Net Worth Projection chart (with 10Y / 25Y / Life toggles)
  - ✅ Active Assumptions panel
  - ✅ Cashflow Analysis chart (with Yearly/Monthly and Line/Bar toggles)
- **Only hide these two things** for guest (not logged in) users:
  - ❌ Download Excel button
  - ❌ Export Chart button
- Everything else should be fully visible and interactive for the guest user
- At the top of the results page, show a soft CTA banner:
  > *"You're viewing a preview plan. Sign in to save your plan and unlock Excel export."*  
  Use `#F15A24` orange for the "Sign in" link text within this banner.

**Developer note:** Reuse existing dashboard components — just conditionally hide/remove the two export buttons when the user session is a guest. No need to rebuild the dashboard.

---

## ISSUE #5 — Section Order: "Why RetirePro" ABOVE Calculator ✅ (keep as is, or move back up if changed)

**Clarification:**
"Why RetirePro" section should remain **above** the calculator section — this is the correct order. If it was moved or is currently below the calculator, move it back above.

Correct order:
```
Hero → Why RetirePro → Calculator → Blog → Footer
```

---

## ISSUE #6 — Blog & Section Headlines Too Small

**Problem:**
Section headlines (e.g. "Latest Articles", "Why RetirePro") are too small and don't command attention. Sections are also not using full horizontal space.

**Fix:**
- All section headlines: minimum `36px`, ideally `40px`, `font-weight: 700`
- Each section: `padding: 80px 24px` vertically, `max-width: 1280px; margin: 0 auto` for inner content
- Blog card grid: **3 columns on desktop** with proper card sizing and spacing
- Blog card hover: `transform: translateY(-4px)` with subtle shadow and `transition: 0.25s ease`

---

## ISSUE #7 — Add Scroll Animations, Motion & Futuristic 3D Design

**Overview:**
The site currently feels static. To match the fintech/data product aesthetic and compete with modern tools, the site needs deliberate motion, depth, and a futuristic visual language. The goal is to feel like a Bloomberg terminal meets a modern SaaS product — authoritative, data-driven, and alive.

**Color direction (for dark sections):**
Use the deep navy/dark blue (`#0D1B2A` or `#0A1628`) that Replit uses in its own dashboard — it reads as premium and data-forward. This can be used for:
- The hero section background
- The "Why RetirePro" section background
- The footer
Combined with the brand orange `#F15A24` as the accent, this creates a high-contrast, trustworthy fintech aesthetic.

---

### A. Scroll-Triggered Section Reveal Animations
Every section and its children should animate in as the user scrolls down.

**Implementation (Intersection Observer API — no library needed):**

```javascript
// Add this to your main JS file
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.style.transitionDelay = `${i * 0.08}s`;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
```

**CSS to add globally:**
```css
.reveal {
  opacity: 0;
  transform: translateY(32px);
  transition: opacity 0.65s ease, transform 0.65s ease;
}
.reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}
```

Add the class `reveal` to: section wrappers, feature cards, blog cards, stat cards, headings.
Stagger children with `transition-delay: 0.1s, 0.2s, 0.3s` etc. on sibling elements.

---

### B. Hero Section — Dark Gradient Background with Grid Overlay

Replace the current plain hero background with a deep navy dark background. This creates immediate visual impact and makes the orange accent pop.

```css
.hero {
  background: linear-gradient(135deg, #0A1628 0%, #0D1B2A 60%, #111827 100%);
  position: relative;
  overflow: hidden;
}

/* Subtle grid overlay — gives a data/fintech "blueprint" feel */
.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 48px 48px;
  pointer-events: none;
}

/* Glowing orange orb — top left accent, subtle */
.hero::after {
  content: '';
  position: absolute;
  top: -80px;
  left: -80px;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(241,90,36,0.12) 0%, transparent 70%);
  pointer-events: none;
}
```

---

### C. Floating Hero Preview Cards — Float + Parallax

The floating dashboard preview card screenshots should feel weightless and alive.

```css
@keyframes floatA {
  0%, 100% { transform: translateY(0px) rotate(-3deg); }
  50%       { transform: translateY(-14px) rotate(-3deg); }
}
@keyframes floatB {
  0%, 100% { transform: translateY(0px) rotate(2deg); }
  50%       { transform: translateY(-10px) rotate(2deg); }
}
@keyframes floatC {
  0%, 100% { transform: translateY(0px) rotate(-1deg); }
  50%       { transform: translateY(-18px) rotate(-1deg); }
}

.preview-card-1 { animation: floatA 5s ease-in-out infinite; }
.preview-card-2 { animation: floatB 6s ease-in-out infinite; animation-delay: 1.5s; }
.preview-card-3 { animation: floatC 4.5s ease-in-out infinite; animation-delay: 3s; }

/* Add a glassy look to each preview card */
.preview-card {
  border-radius: 12px;
  box-shadow:
    0 24px 64px rgba(0,0,0,0.4),
    0 0 0 1px rgba(255,255,255,0.06);
  backdrop-filter: blur(4px);
}
```

For a subtle parallax as user scrolls (makes cards feel 3D in space):
```javascript
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  document.querySelectorAll('.preview-card').forEach((card, i) => {
    const speed = 0.05 + i * 0.03;
    card.style.transform += ` translateY(${scrollY * speed}px)`;
  });
});
```
*(Note: combine with the float animation using a CSS custom property for Y offset to avoid conflicts)*

---

### D. Number Counter Animation on Stat Cards (Results Page & Any Stats)

When corpus/number stat cards scroll into view, animate the number counting up from 0.

```javascript
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const duration = 1500;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = (target * eased).toFixed(1) + ' Cr';
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// Trigger on scroll-in
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
});
document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));
```

Add `data-target="38.2"` (the final value) to each number element.

---

### E. Feature/Why RetirePro Cards — 3D Tilt on Hover

This gives feature cards a premium 3D depth effect on mouse hover, making the page feel interactive and futuristic.

```javascript
document.querySelectorAll('.feature-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;  // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `
      perspective(600px)
      rotateY(${x * 12}deg)
      rotateX(${-y * 12}deg)
      scale(1.03)
    `;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(600px) rotateY(0) rotateX(0) scale(1)';
    card.style.transition = 'transform 0.4s ease';
  });
  card.addEventListener('mouseenter', () => {
    card.style.transition = 'none';
  });
});
```

CSS for feature cards:
```css
.feature-card {
  will-change: transform;
  transition: transform 0.4s ease, box-shadow 0.4s ease;
  transform-style: preserve-3d;
}
.feature-card:hover {
  box-shadow: 0 20px 60px rgba(0,0,0,0.2), 0 0 0 1px rgba(241,90,36,0.2);
}
```

---

### F. Chart Draw-In Animation (Results Page)

When the Net Worth Projection and Cashflow Analysis charts appear on the results page, the lines should draw in from left to right — this feels alive and data-forward.

**For Recharts:**
```jsx
// On the LineChart component, add:
<LineChart data={data} margin={...}>
  <Line
    type="monotone"
    dataKey="netWorth"
    isAnimationActive={true}
    animationDuration={1800}
    animationEasing="ease-out"
  />
</LineChart>
```

**For Chart.js:**
```javascript
const chart = new Chart(ctx, {
  type: 'line',
  data: { ... },
  options: {
    animation: {
      duration: 1800,
      easing: 'easeInOutQuart',
      x: { type: 'number', easing: 'linear', duration: 1800, from: 0 }
    }
  }
});
```

---

### G. CTA Buttons — Pulse Glow on Primary Button

The main "Try Free Calculator" orange CTA button should have a subtle pulsing glow to draw the eye:

```css
@keyframes orangePulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(241, 90, 36, 0.4); }
  50%       { box-shadow: 0 0 0 10px rgba(241, 90, 36, 0); }
}

.btn-primary {
  background: #F15A24;
  color: #fff;
  border: none;
  animation: orangePulse 2.5s ease-in-out infinite;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.btn-primary:hover {
  transform: scale(1.04);
  animation: none;
  box-shadow: 0 8px 24px rgba(241,90,36,0.45);
}
```

---

### H. Smooth Page Scroll

Add smooth scrolling globally:
```css
html {
  scroll-behavior: smooth;
}
```

And for anchor links between sections, use a small JS scroll offset to account for any sticky header:
```javascript
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    const offset = 80; // height of sticky header
    window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
  });
});
```

---

### I. "Data Ticker" Ambient Element in Hero (Optional — High Impact)

If you want one truly futuristic ambient element in the hero background, add a horizontal scrolling data ticker showing financial metrics — like Bloomberg-style. This runs behind the main hero content at low opacity.

```html
<div class="ticker-wrap" aria-hidden="true">
  <div class="ticker">
    <span>NIFTY 50 &nbsp;▲ 24,850</span>
    <span>SENSEX &nbsp;▲ 81,200</span>
    <span>INFLATION &nbsp;6.8%</span>
    <span>AVG RETURN &nbsp;12.4%</span>
    <span>RETIREMENT AGE &nbsp;60</span>
    <span>LIFE EXPECTANCY &nbsp;85 yrs</span>
    <span>CORPUS TARGET &nbsp;₹3.8 Cr</span>
    <!-- repeat items for seamless loop -->
  </div>
</div>
```

```css
.ticker-wrap {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  overflow: hidden;
  opacity: 0.18;
  font-size: 12px;
  font-family: monospace;
  color: #fff;
  padding: 8px 0;
  border-top: 1px solid rgba(255,255,255,0.06);
}
.ticker {
  display: flex;
  gap: 48px;
  white-space: nowrap;
  animation: ticker-scroll 30s linear infinite;
}
.ticker span { flex-shrink: 0; }
@keyframes ticker-scroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
```

---

## SUMMARY TABLE

| # | Issue | Priority | Section | Status |
|---|-------|----------|---------|--------|
| 1 | Wasted side whitespace + add more floating preview images in hero | High | Hero | Fix needed |
| 2 | "Sign In to Save" button invisible (white on white bg) | **Critical** | Hero CTAs | Fix needed |
| 3 | Calculator: use headline "See Your Retirement Future in 30 Seconds. No account required." + expand layout | High | Calculator | Fix needed |
| 4 | After data entry: open new `/results` page with full dashboard, hide only Excel/Export buttons | **Critical** | Results Flow | Fix needed |
| 5 | Why RetirePro stays ABOVE calculator — reorder only if currently wrong | Medium | Page Order | Confirm order |
| 6 | Blog & section headlines too small (target 36–40px), sections not full-width | Medium | Blog + Global | Fix needed |
| 7 | Add scroll animations, 3D tilt, float, counter, pulse, dark hero background, ticker | High | Site-wide | Implement |

---

## QUICK REFERENCE — BRAND COLORS

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Orange | `#F15A24` | CTAs, links, accents, highlights |
| Deep Navy (Hero/Footer) | `#0A1628` | Dark section backgrounds |
| Mid Navy | `#0D1B2A` | Dark section gradient |
| Pure White | `#FFFFFF` | Main background |
| Light Grey | `#F8F9FA` | Alternating section backgrounds |
| Deep Slate | `#1A1A24` | Original dark header/footer fallback |

---

## DEVELOPER NOTES

- **Desktop only** — do not touch mobile CSS, breakpoints, or media queries.
- For Issue #4 results page: reuse existing dashboard components entirely. Just conditionally render (hide) the "Download Excel" and "Export Chart" buttons based on whether `user.isLoggedIn` is true/false.
- Floating preview images in Issue #1 are static `<img>` screenshots — no live data rendering needed in hero.
- For all animation code above: no external animation libraries needed. Everything uses native CSS keyframes, Intersection Observer, and vanilla JS `requestAnimationFrame`.
- Test all animations with `prefers-reduced-motion` media query:
  ```css
  @media (prefers-reduced-motion: reduce) {
    .reveal, .preview-card, .btn-primary, .feature-card {
      animation: none !important;
      transition: none !important;
    }
  }
  ```
- The dark navy hero (`#0A1628`) pairs with `color: #FFFFFF` for all text in that section. Ensure contrast ratios pass WCAG AA (white on `#0A1628` passes comfortably).
