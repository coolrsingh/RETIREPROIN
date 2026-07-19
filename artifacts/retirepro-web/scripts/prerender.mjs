/**
 * Build-time prerender script for RetirePro public routes.
 *
 * Runs after `vite build`. For each public route it writes a route-specific
 * index.html into dist/public/<route>/index.html so the static file server
 * returns complete, crawlable HTML (correct head metadata + body content)
 * without relying on JavaScript execution.
 *
 * Legal pages are served as enriched standalone HTML (their full content is
 * already in src/legal/*.html).  All other routes get the Vite-built shell
 * with prerendered content injected into <div id="root">.
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const distDir = join(rootDir, "dist", "public");
const legalSrcDir = join(rootDir, "src", "legal");

// ---------------------------------------------------------------------------
// Template helpers
// ---------------------------------------------------------------------------

const baseHtml = readFileSync(join(distDir, "index.html"), "utf-8");

function escape(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Build route-specific HTML from the Vite index.html template.
 * Replaces head metadata and injects static body content.
 */
function buildHtml({ title, description, canonical, ogUrl, ogType = "website", ogImage, jsonLd, bodyContent }) {
  const img = ogImage || "https://retirepro.in/opengraph.jpg";
  let html = baseHtml;

  // title
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escape(title)}</title>`);

  // description
  html = html.replace(
    /(<meta\s+name="description"\s+content=")[^"]*(")/,
    `$1${escape(description)}$2`
  );

  // canonical
  html = html.replace(
    /(<link\s+rel="canonical"\s+href=")[^"]*(")/,
    `$1${escape(canonical)}$2`
  );

  // og:type
  html = html.replace(/(<meta\s+property="og:type"\s+content=")[^"]*(")/,   `$1${ogType}$2`);
  // og:url
  html = html.replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/,    `$1${escape(ogUrl)}$2`);
  // og:title
  html = html.replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/,  `$1${escape(title)}$2`);
  // og:description
  html = html.replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/,`$1${escape(description)}$2`);
  // og:image  (keep existing if img matches default)
  html = html.replace(/(<meta\s+property="og:image"\s+content=")[^"]*(")/,  `$1${escape(img)}$2`);

  // twitter:url
  html = html.replace(/(<meta\s+name="twitter:url"\s+content=")[^"]*(")/,         `$1${escape(ogUrl)}$2`);
  // twitter:title
  html = html.replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/,       `$1${escape(title)}$2`);
  // twitter:description
  html = html.replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/,`$1${escape(description)}$2`);
  // twitter:image
  html = html.replace(/(<meta\s+name="twitter:image"\s+content=")[^"]*(")/,       `$1${escape(img)}$2`);

  // inject JSON-LD before </head>
  if (jsonLd) {
    const tag = `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
    html = html.replace("</head>", `${tag}\n</head>`);
  }

  // inject prerendered body content into #root
  if (bodyContent) {
    html = html.replace(
      '<div id="root"></div>',
      `<div id="root">${bodyContent}</div>`
    );
  }

  return html;
}

/**
 * Write html to dist/public/<slug>/index.html, creating dirs as needed.
 */
function write(slug, html) {
  const dir = join(distDir, slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html, "utf-8");
  console.log(`  ✓ /${slug}`);
}

/**
 * Enrich a standalone legal HTML file with OG / Twitter / canonical tags
 * and write to dist.
 */
function writeLegal(slug, srcFile, { title, description, canonical, ogUrl }) {
  let html = readFileSync(join(legalSrcDir, srcFile), "utf-8");

  const ogBlock = `
  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${ogUrl}" />
  <meta property="og:title" content="${escape(title)}" />
  <meta property="og:description" content="${escape(description)}" />
  <meta property="og:image" content="https://retirepro.in/opengraph.jpg" />
  <meta property="og:site_name" content="RetirePro" />
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${ogUrl}" />
  <meta name="twitter:title" content="${escape(title)}" />
  <meta name="twitter:description" content="${escape(description)}" />
  <meta name="twitter:image" content="https://retirepro.in/opengraph.jpg" />
  <!-- Canonical -->
  <link rel="canonical" href="${canonical}" />
  <meta name="robots" content="index, follow" />`;

  // inject before </head>
  html = html.replace("</head>", `${ogBlock}\n</head>`);

  const dir = join(distDir, slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html, "utf-8");
  console.log(`  ✓ /${slug} (standalone)`);
}

// ---------------------------------------------------------------------------
// Route data
// ---------------------------------------------------------------------------

const SITE = "https://retirepro.in";

const FAQS = [
  {
    question: "How much money do I need to retire in India?",
    answer: "For a comfortable retirement in India, you typically need ₹1.5 crore to ₹5 crore depending on your city, lifestyle, and age. In Tier 1 cities like Mumbai or Bangalore with a moderate lifestyle, ₹5–7 crore is recommended. For Tier 2 cities, ₹3–4 crore may be sufficient. Use our free retirement calculator to get your exact, inflation-adjusted number.",
  },
  {
    question: "Is ₹1 crore enough to retire in India?",
    answer: "No, for most people. ₹1 crore generates only ₹30,000–40,000/month through a Systematic Withdrawal Plan (SWP). After inflation, this purchasing power erodes rapidly. ₹1 crore might work in Tier 3 cities with a frugal lifestyle, but it's risky for most Indians.",
  },
  {
    question: "How much monthly income do I need after retirement?",
    answer: "A good rule: 70–80% of your pre-retirement income. So if you earn ₹1 lakh/month now, plan for ₹70,000–80,000/month post-retirement. However, account for inflation — ₹70,000 today will need to be ₹2–3 lakhs in 25 years to maintain the same lifestyle.",
  },
  {
    question: "What is the best retirement plan in India?",
    answer: "There's no single 'best' plan. The optimal strategy combines EPF (employer-matched, tax-free), NPS (market-linked, extra ₹50K tax benefit under 80CCD(1B)), PPF (guaranteed returns, tax-free), Equity SIPs (growth engine at 12–14% CAGR), and comprehensive health insurance for protection.",
  },
  {
    question: "Can I retire at 45 in India?",
    answer: "Yes, but you need aggressive planning. The FIRE (Financial Independence, Retire Early) movement is growing in India. You'll need 25x your annual expenses invested, a low withdrawal rate (3–3.5%), and ideally a side income or passion project. Use our RetirePro calculator to check feasibility.",
  },
  {
    question: "What happens if I outlive my retirement corpus?",
    answer: "This is a real risk with increasing life expectancy (85+ years). Solutions: plan for 90+ years, keep 20% corpus in annuity plans, maintain part-time work options, consider reverse mortgage, or account for family support. RetirePro lets you model life expectancy up to 100 years.",
  },
  {
    question: "How do I generate monthly income after retirement?",
    answer: "Best options for Indians: (1) SWP from mutual funds (tax-efficient), (2) Senior Citizen Savings Scheme — SCSS at 8.2% quarterly, (3) Post Office Monthly Income Scheme — POMIS at 7.4% monthly, (4) Pradhan Mantri Vaya Vandana Yojana at 7.4% pension, (5) dividend stocks, and (6) rental income if you own property.",
  },
  {
    question: "Is RetirePro free to use?",
    answer: "Yes, RetirePro is completely free to use. No account creation, no email required, and no hidden charges. You can build a complete retirement plan with income projections, expense tracking, children's education goals, and visual charts without signing up.",
  },
  {
    question: "What makes RetirePro different from other retirement calculators?",
    answer: "RetirePro is built specifically for India with India-specific assumptions: 7% general inflation, 8% education inflation, EPF and NPS integration, children's education and marriage goals, home loan EMI impact, mini-retirement breaks, and joint retirement planning. Most calculators use global assumptions that don't apply to Indian conditions.",
  },
  {
    question: "Does RetirePro require login or signup?",
    answer: "No. RetirePro does not require any login, signup, or email address to use the full calculator. Your data is processed in your browser. You can optionally sign in to save your plan and access it later.",
  },
  {
    question: "How accurate is the RetirePro calculator?",
    answer: "RetirePro uses standard financial formulas with conservative, India-specific assumptions: 7% general inflation, 8% education inflation, 12% pre-retirement returns, and 8% post-retirement returns. You can customise all assumptions. While no calculator can predict the future, RetirePro provides a realistic baseline for planning.",
  },
  {
    question: "Can I plan for mini-retirements or sabbaticals?",
    answer: "Yes, RetirePro uniquely supports mini-retirement planning. You can add career breaks (e.g., a 1-year sabbatical at age 40) and see exactly how it affects your overall retirement corpus. This is especially useful for professionals in tech, consulting, or creative fields.",
  },
  {
    question: "What retirement instruments does RetirePro support?",
    answer: "RetirePro supports all major Indian retirement instruments: Employee Provident Fund (EPF), National Pension System (NPS), Public Provident Fund (PPF), Equity Linked Savings Scheme (ELSS), mutual fund SIPs, fixed deposits, and other investments. You can input your existing balances and monthly contributions for each.",
  },
  {
    question: "Is my data safe with RetirePro?",
    answer: "Absolutely. RetirePro processes all calculations in your browser. We do not store your personal financial data on our servers. We use SSL encryption and never sell or share your data with third parties. If you choose to sign in, only your profile data is saved securely.",
  },
];

const BLOG_POSTS = [
  {
    slug: "how-much-to-retire-india",
    headline: "How Much Money Do You Need to Retire in India? [2026 Complete Guide]",
    description:
      "For a comfortable retirement in India, you need ₹1.5 crore to ₹5 crore — depending on your city, lifestyle, and age. Here's the exact formula, city-wise breakdown, and the inflation trap most Indians fall into.",
    datePublished: "2026-07-18",
    readTime: "10 min read",
    tag: "Retirement Basics",
    excerpt: `
      <p>₹1.5 crore or ₹6.5 crore? The answer depends on your city, lifestyle, and one number most calculators ignore: inflation. This guide covers the India-specific formula for working out exactly how much you need to retire comfortably.</p>
      <h2>City-wise Retirement Corpus Estimates (2026)</h2>
      <ul>
        <li><strong>Mumbai / Delhi / Bangalore (Tier 1):</strong> ₹5–7 crore for a moderate lifestyle</li>
        <li><strong>Pune / Hyderabad / Chennai:</strong> ₹3.5–5 crore</li>
        <li><strong>Tier 2 cities (Nagpur, Jaipur, Lucknow):</strong> ₹2.5–4 crore</li>
        <li><strong>Tier 3 / rural:</strong> ₹1.5–2.5 crore</li>
      </ul>
      <h2>The Inflation Trap</h2>
      <p>At 7% annual inflation, ₹50,000/month today becomes ₹1.91 lakh/month in 20 years. Most people plan for today's expenses — not tomorrow's. RetirePro's calculator accounts for this automatically.</p>
      <h2>The Formula</h2>
      <p>Required corpus = (Annual post-retirement expenses × Inflation-adjusted multiplier) ÷ Safe withdrawal rate. For most Indians retiring at 60 and living to 85, a 4% withdrawal rate on a ₹3–5 crore corpus is the target.</p>
    `,
  },
  {
    slug: "real-estate-rich-retirement-illusion",
    headline: "The ₹40 Crore Illusion: Why India's Wealthiest Retirees Are the Most Exposed",
    description:
      "Most Indian HNIs believe their net worth guarantees a comfortable retirement. Here's the quiet arithmetic that says otherwise — and what to do about it.",
    datePublished: "2026-07-12",
    readTime: "9 min read",
    tag: "HNI Planning",
    excerpt: `
      <p>India's wealthiest families often hold 80–90% of their wealth in real estate. It looks impressive on paper but generates almost no monthly income for retirement. This is the ₹40 crore illusion.</p>
      <h2>The Liquidity Problem</h2>
      <p>A ₹40 crore property portfolio that generates ₹60,000/month in rent (1.8% yield) doesn't fund a ₹3–4 lakh/month retirement lifestyle for a couple in their 60s. Selling takes months; rents don't keep pace with lifestyle inflation.</p>
      <h2>The HNI Retirement Blind Spot</h2>
      <ul>
        <li>Net worth ≠ monthly income</li>
        <li>Rental yields in India average 2–3% — far below inflation</li>
        <li>Illiquid assets can't be systematically withdrawn like a corpus</li>
        <li>Health costs in India rise at 14–15% annually for seniors</li>
      </ul>
      <h2>The Fix</h2>
      <p>HNIs need to convert at least 30–40% of net worth into liquid, income-generating assets before retirement. Equity, debt funds, and senior citizen savings schemes provide monthly income. Property alone does not.</p>
    `,
  },
  {
    slug: "why-indians-fail-retirement",
    headline: "Why Most Indians Fail to Plan for Retirement — And How One Small Habit Can Change Everything",
    description:
      "93% of Indians over 50 regret not starting retirement planning sooner. Here's what goes wrong and the one small shift that changes everything.",
    datePublished: "2026-07-10",
    readTime: "8 min read",
    tag: "Retirement Basics",
    excerpt: `
      <p>A 2024 Max Life Insurance study found that 93% of Indians over 50 regret not starting retirement planning sooner. India's pension system was ranked in the bottom three globally (Mercer CFA 2024, score 43.8/100). Only 5.3% of Indians are covered by NPS or APY combined.</p>
      <h2>The Four Failure Patterns</h2>
      <ul>
        <li><strong>The "I'll Start Next Year" Trap:</strong> ₹5,000/month at 30 becomes ₹1.76 crore by 60 at 12%. Starting at 40, you get ₹50 lakh — a ₹1.25 crore penalty for waiting.</li>
        <li><strong>Lifestyle inflation:</strong> Every raise gets absorbed by a better car, flat, or school. Savings rate stays flat while expenses climb.</li>
        <li><strong>The EPF Illusion:</strong> EPF at current rates gives most earners ₹25–30K/month — not the ₹1–2 lakh needed in 25 years after inflation.</li>
        <li><strong>Children First:</strong> Parents sacrifice retirement savings for education and weddings. Your child can borrow for college. You cannot borrow for retirement.</li>
      </ul>
      <h2>The One Habit That Changes Everything</h2>
      <p>Automate ₹5,000–₹10,000/month into an equity SIP on the 1st of every month. Treat it as a non-negotiable bill. After 25–30 years at 12% CAGR, this single habit can build ₹1.5–3.5 crore — enough to change your retirement entirely.</p>
    `,
  },
  {
    slug: "nps-vs-ppf-vs-sip",
    headline: "NPS vs PPF vs Mutual Fund SIP: Which Builds the Biggest Retirement Corpus in India?",
    description:
      "Real numbers, no fluff. We compare NPS, PPF, and equity mutual fund SIPs with India-specific context so you can stop guessing and start investing.",
    datePublished: "2026-07-11",
    readTime: "9 min read",
    tag: "Investment Guide",
    excerpt: `
      <p>Three instruments dominate India's retirement conversation: NPS, PPF, and equity mutual fund SIPs. Here's how ₹10,000/month invested for 20 years (age 40 to 60) actually performs in each.</p>
      <h2>The Numbers (₹10,000/month for 20 years)</h2>
      <ul>
        <li><strong>PPF at 7.1%:</strong> ~₹33 lakh (capped at ₹1.5L/year, tax-free maturity)</li>
        <li><strong>NPS at 10% blended:</strong> ~₹76 lakh (+ ₹30K+/year in tax savings via 80CCD)</li>
        <li><strong>Equity SIP at 12%:</strong> ~₹99 lakh (no lock-in, LTCG tax applies above ₹1.25L)</li>
        <li><strong>Equity SIP at 15%:</strong> ~₹1.5 crore (best-case, top-performing large-cap funds historically)</li>
      </ul>
      <h2>The Verdict</h2>
      <p>Equity SIPs win on raw corpus. NPS wins on tax efficiency + forced discipline. PPF is the safest but slowest. The optimal strategy for most Indians: max NPS (for tax), add equity SIP for growth, keep PPF for debt allocation. Don't pick one — combine all three.</p>
    `,
  },
];

// ---------------------------------------------------------------------------
// Build FAQ page
// ---------------------------------------------------------------------------

console.log("Prerendering public routes...");

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map(f => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
};

const faqItemsHtml = FAQS.map(
  (f, i) => `
  <div class="faq-item">
    <h2 class="faq-question">${escape(f.question)}</h2>
    <p class="faq-answer">${escape(f.answer)}</p>
  </div>`
).join("\n");

const faqBodyHtml = `
<div style="font-family:Inter,system-ui,sans-serif;max-width:740px;margin:0 auto;padding:32px 16px">
  <h1 style="font-size:2rem;font-weight:700;color:#0f172a;margin-bottom:8px">Retirement Planning FAQ — India</h1>
  <p style="color:#64748b;margin-bottom:32px">Everything you need to know about planning retirement in India — corpus, SIP, EPF, NPS, and how RetirePro works.</p>
  ${faqItemsHtml}
  <p style="margin-top:40px"><a href="/free-plan" style="background:#F15A24;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Calculate My Corpus Free →</a></p>
</div>`;

write("faq", buildHtml({
  title: "Retirement Planning FAQ — India | RetirePro",
  description: "Answers to the most common questions about retirement planning in India — corpus size, SIP, EPF, NPS, and how RetirePro works. No login required.",
  canonical: `${SITE}/faq`,
  ogUrl: `${SITE}/faq`,
  ogType: "website",
  jsonLd: faqJsonLd,
  bodyContent: faqBodyHtml,
}));

// ---------------------------------------------------------------------------
// Build blog index
// ---------------------------------------------------------------------------

const blogIndexBodyHtml = `
<div style="font-family:Inter,system-ui,sans-serif;max-width:900px;margin:0 auto;padding:32px 16px">
  <h1 style="font-size:2rem;font-weight:700;color:#0f172a;margin-bottom:8px">Retirement Planning Blog — India</h1>
  <p style="color:#64748b;margin-bottom:32px">Expert guides on retirement planning in India — corpus targets, NPS vs PPF vs SIP, FIRE, and more. No login required.</p>
  <div>
    ${BLOG_POSTS.map(p => `
    <article style="border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin-bottom:20px">
      <p style="font-size:12px;color:#64748b;margin-bottom:8px">${escape(p.tag)} · ${escape(p.readTime)} · <time datetime="${p.datePublished}">${p.datePublished}</time></p>
      <h2 style="font-size:1.25rem;font-weight:700;color:#0f172a;margin-bottom:8px">
        <a href="/blog/${p.slug}" style="color:inherit;text-decoration:none">${escape(p.headline)}</a>
      </h2>
      <p style="color:#475569;font-size:0.95rem">${escape(p.description)}</p>
    </article>`).join("\n")}
  </div>
</div>`;

write("blog", buildHtml({
  title: "Retirement Planning Blog — India | RetirePro",
  description: "Expert articles on retirement planning in India — corpus targets, NPS vs PPF vs SIP, FIRE, HNI strategies, and more. No login required.",
  canonical: `${SITE}/blog`,
  ogUrl: `${SITE}/blog`,
  ogType: "website",
  bodyContent: blogIndexBodyHtml,
}));

// ---------------------------------------------------------------------------
// Build individual blog articles
// ---------------------------------------------------------------------------

for (const post of BLOG_POSTS) {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.headline,
    description: post.description,
    author: {
      "@type": "Organization",
      name: "RetirePro Editorial",
      url: SITE,
    },
    publisher: {
      "@type": "Organization",
      name: "RetirePro",
      url: SITE,
      logo: { "@type": "ImageObject", url: `${SITE}/favicon.png` },
    },
    datePublished: post.datePublished,
    dateModified: post.datePublished,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE}/blog/${post.slug}`,
    },
    image: `${SITE}/opengraph.jpg`,
  };

  const articleBodyHtml = `
<article style="font-family:Inter,system-ui,sans-serif;max-width:740px;margin:0 auto;padding:32px 16px">
  <p style="font-size:12px;color:#64748b;margin-bottom:12px">${escape(post.tag)} · ${escape(post.readTime)} · <time datetime="${post.datePublished}">${post.datePublished}</time></p>
  <h1 style="font-size:2rem;font-weight:700;color:#0f172a;margin-bottom:12px">${escape(post.headline)}</h1>
  <p style="font-size:1.1rem;color:#475569;margin-bottom:32px;line-height:1.7">${escape(post.description)}</p>
  <div style="color:#334155;line-height:1.8">
    ${post.excerpt}
  </div>
  <p style="margin-top:40px"><a href="/free-plan" style="background:#F15A24;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Calculate My Retirement Corpus →</a></p>
</article>`;

  write(`blog/${post.slug}`, buildHtml({
    title: `${post.headline} | RetirePro`,
    description: post.description,
    canonical: `${SITE}/blog/${post.slug}`,
    ogUrl: `${SITE}/blog/${post.slug}`,
    ogType: "article",
    jsonLd: articleJsonLd,
    bodyContent: articleBodyHtml,
  }));
}

// ---------------------------------------------------------------------------
// Build /free-plan
// ---------------------------------------------------------------------------

const freePlanBodyHtml = `
<div style="font-family:Inter,system-ui,sans-serif;max-width:680px;margin:0 auto;padding:48px 16px;text-align:center">
  <h1 style="font-size:2rem;font-weight:700;color:#0f172a;margin-bottom:12px">Free Retirement Calculator — India</h1>
  <p style="color:#475569;font-size:1.05rem;margin-bottom:24px;line-height:1.7">
    Calculate your exact retirement corpus in 60 seconds. No login required. India-specific assumptions — EPF, NPS, SIP, 7% inflation, 12% pre-retirement returns.
  </p>
  <ul style="text-align:left;max-width:440px;margin:0 auto 32px;color:#334155;line-height:2">
    <li>✓ Personalised corpus target based on your income and expenses</li>
    <li>✓ Year-by-year projection chart with inflation adjustment</li>
    <li>✓ EPF, NPS, SIP, and all major Indian instruments supported</li>
    <li>✓ Children's education and marriage goals included</li>
    <li>✓ No signup. No email. Completely free.</li>
  </ul>
  <a href="/free-plan" style="background:#F15A24;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:1rem">Start Free Calculation →</a>
</div>`;

write("free-plan", buildHtml({
  title: "Free Retirement Calculator India — No Login | RetirePro",
  description: "Calculate your retirement corpus for free. India-specific assumptions — EPF, NPS, SIP, inflation. Takes 60 seconds. No account needed.",
  canonical: `${SITE}/free-plan`,
  ogUrl: `${SITE}/free-plan`,
  ogType: "website",
  bodyContent: freePlanBodyHtml,
}));

// ---------------------------------------------------------------------------
// Build /go (ad landing)
// ---------------------------------------------------------------------------

const goBodyHtml = `
<div style="font-family:Inter,system-ui,sans-serif;max-width:680px;margin:0 auto;padding:48px 16px;text-align:center">
  <h1 style="font-size:2rem;font-weight:700;color:#0f172a;margin-bottom:12px">Get Your Free Personalised Retirement Plan</h1>
  <p style="color:#475569;font-size:1.05rem;margin-bottom:24px;line-height:1.7">
    Talk to India's retirement planning experts. Free consultation, no commitment. Backed by RetirePro's India-specific calculator and Nidesh Financial's AMFI-registered advisory team.
  </p>
  <ul style="text-align:left;max-width:440px;margin:0 auto 32px;color:#334155;line-height:2">
    <li>✓ Personalised retirement corpus target</li>
    <li>✓ SIP, NPS, EPF optimisation review</li>
    <li>✓ Free, no-obligation 30-minute consultation</li>
    <li>✓ AMFI-registered advisors, India-specific expertise</li>
  </ul>
  <a href="/go" style="background:#F15A24;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:1rem">Book Free Consultation →</a>
</div>`;

write("go", buildHtml({
  title: "Get Your Free Retirement Plan — India | RetirePro",
  description: "Get a personalised retirement plan from India's top retirement advisors. Free consultation, no commitment. Calculate your corpus in 60 seconds.",
  canonical: `${SITE}/go`,
  ogUrl: `${SITE}/go`,
  ogType: "website",
  bodyContent: goBodyHtml,
}));

// ---------------------------------------------------------------------------
// Legal pages — serve the full standalone HTML enriched with OG/Twitter/canonical
// ---------------------------------------------------------------------------

writeLegal("privacy-policy", "privacy-policy.html", {
  title: "Privacy Policy — RetirePro.in",
  description: "Privacy Policy for RetirePro.in — how we collect, use, and protect your personal data under the Digital Personal Data Protection Act, 2023.",
  canonical: `${SITE}/privacy-policy`,
  ogUrl: `${SITE}/privacy-policy`,
});

writeLegal("disclaimer", "disclaimer.html", {
  title: "Disclaimer — RetirePro.in",
  description: "Important disclaimer regarding RetirePro.in's retirement calculators and financial projections. Not investment advice.",
  canonical: `${SITE}/disclaimer`,
  ogUrl: `${SITE}/disclaimer`,
});

writeLegal("refund-policy", "refund-policy.html", {
  title: "Refund Policy — RetirePro.in",
  description: "Refund and cancellation policy for RetirePro Pro subscriptions. Clear, fair terms for all paid plans.",
  canonical: `${SITE}/refund-policy`,
  ogUrl: `${SITE}/refund-policy`,
});

writeLegal("terms-and-conditions", "terms-and-conditions.html", {
  title: "Terms & Conditions — RetirePro.in",
  description: "Terms and Conditions for using RetirePro.in — the free India-specific retirement planning calculator.",
  canonical: `${SITE}/terms-and-conditions`,
  ogUrl: `${SITE}/terms-and-conditions`,
});

// ---------------------------------------------------------------------------
// Build /plan/preview
// ---------------------------------------------------------------------------

write("plan/preview", buildHtml({
  title: "Your Retirement Plan Preview | RetirePro",
  description: "See your personalised retirement corpus projection — year-by-year chart, cashflow analysis, and funding gap. Free, no login required.",
  canonical: `${SITE}/plan/preview`,
  ogUrl: `${SITE}/plan/preview`,
  ogType: "website",
  bodyContent: `<div style="font-family:Inter,system-ui,sans-serif;max-width:680px;margin:0 auto;padding:48px 16px;text-align:center"><h1 style="font-size:1.75rem;font-weight:700;color:#0f172a">Your Retirement Plan Preview</h1><p style="color:#475569;margin-top:12px">View your personalised retirement corpus projection with year-by-year chart, cashflow analysis, and funding gap. <a href="/free-plan">Create your free plan →</a></p></div>`,
}));

console.log("Prerender complete.");
