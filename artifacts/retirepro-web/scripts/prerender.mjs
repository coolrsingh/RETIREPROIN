/**
 * Build-time prerender script for RetirePro public routes.
 *
 * Runs after both Vite builds:
 *   1. vite build --config vite.config.ts      → dist/public/  (client bundle)
 *   2. vite build --config vite.ssr.config.ts  → dist/server/  (server bundle)
 *
 * For each public route, renders the React component tree via renderToString
 * (using the server bundle), injects the HTML into the Vite template, replaces
 * the <head> metadata, and writes dist/public/<route>/index.html.
 *
 * New blog posts are picked up automatically via the BLOG_POSTS export from
 * the server bundle — no manual list to maintain.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const distDir = join(rootDir, "dist", "public");
const serverBundleDir = join(rootDir, "dist", "server");
const legalSrcDir = join(rootDir, "src", "legal");

// ---------------------------------------------------------------------------
// Load the SSR server bundle
// ---------------------------------------------------------------------------

const serverBundle = join(serverBundleDir, "entry-server.js");
if (!existsSync(serverBundle)) {
  console.error(`ERROR: SSR bundle not found at ${serverBundle}`);
  console.error("Run: vite build --config vite.ssr.config.ts");
  process.exit(1);
}

const { render, BLOG_POSTS } = await import(serverBundle);

if (!BLOG_POSTS || BLOG_POSTS.length === 0) {
  console.error("ERROR: BLOG_POSTS is empty — check src/data/blog-posts.ts");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Template helpers
// ---------------------------------------------------------------------------

const baseHtml = readFileSync(join(distDir, "index.html"), "utf-8");

function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Build a route-specific HTML page:
 *   1. Replace <head> metadata (title, description, canonical, OG, Twitter)
 *   2. Optionally inject JSON-LD before </head>
 *   3. Inject the rendered React body into <div id="root">
 *   4. Optionally add a robots noindex tag
 */
function buildHtml({ title, description, canonical, ogUrl, ogType = "website", ogImage, jsonLd, bodyHtml, noindex = false }) {
  const img = ogImage || "https://retirepro.in/opengraph.jpg";
  let html = baseHtml;

  // <title>
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);

  // meta description
  html = html.replace(
    /(<meta\s+name="description"\s+content=")[^"]*(")/,
    `$1${esc(description)}$2`,
  );

  // canonical
  html = html.replace(
    /(<link\s+rel="canonical"\s+href=")[^"]*(")/,
    `$1${esc(canonical)}$2`,
  );

  // og:type / og:url / og:title / og:description / og:image
  html = html.replace(/(<meta\s+property="og:type"\s+content=")[^"]*(")/,        `$1${ogType}$2`);
  html = html.replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/,         `$1${esc(ogUrl)}$2`);
  html = html.replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/,       `$1${esc(title)}$2`);
  html = html.replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/,`$1${esc(description)}$2`);
  html = html.replace(/(<meta\s+property="og:image"\s+content=")[^"]*(")/,       `$1${esc(img)}$2`);

  // twitter:url / title / description / image
  html = html.replace(/(<meta\s+name="twitter:url"\s+content=")[^"]*(")/,        `$1${esc(ogUrl)}$2`);
  html = html.replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/,      `$1${esc(title)}$2`);
  html = html.replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/,`$1${esc(description)}$2`);
  html = html.replace(/(<meta\s+name="twitter:image"\s+content=")[^"]*(")/,      `$1${esc(img)}$2`);

  // noindex
  if (noindex) {
    html = html.replace(
      /(<meta\s+name="robots"\s+content=")[^"]*(")/,
      `$1noindex,nofollow$2`,
    );
  }

  // JSON-LD before </head>
  if (jsonLd) {
    const tag = `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
    html = html.replace("</head>", `${tag}\n</head>`);
  }

  // Rendered React body
  if (bodyHtml) {
    html = html.replace(
      '<div id="root"></div>',
      `<div id="root">${bodyHtml}</div>`,
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
}

/**
 * Render a route with the SSR bundle, catching any errors.
 * Returns the rendered HTML string, or empty string on failure.
 */
function safeRender(url) {
  try {
    return render(url);
  } catch (err) {
    console.warn(`  ⚠ render("${url}") threw: ${err.message} — writing head-only`);
    return "";
  }
}

/**
 * Enrich a standalone legal HTML file with OG / Twitter / canonical tags.
 */
function writeLegal(slug, srcFile, { title, description, canonical, ogUrl }) {
  let html = readFileSync(join(legalSrcDir, srcFile), "utf-8");

  const ogBlock = `
  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${ogUrl}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:image" content="https://retirepro.in/opengraph.jpg" />
  <meta property="og:site_name" content="RetirePro" />
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${ogUrl}" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  <meta name="twitter:image" content="https://retirepro.in/opengraph.jpg" />
  <!-- Canonical -->
  <link rel="canonical" href="${canonical}" />
  <meta name="robots" content="index, follow" />`;

  html = html.replace("</head>", `${ogBlock}\n</head>`);

  const dir = join(distDir, slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html, "utf-8");
  console.log(`  ✓ /${slug} (standalone legal)`);
}

// ---------------------------------------------------------------------------
// Site constant
// ---------------------------------------------------------------------------

const SITE = "https://retirepro.in";

// ---------------------------------------------------------------------------
// Render all routes
// ---------------------------------------------------------------------------

console.log(`Prerendering ${BLOG_POSTS.length} blog posts + core routes…\n`);

// ── / (root landing page) ──────────────────────────────────────────────────
{
  const bodyHtml = safeRender("/");
  const html = buildHtml({
    title: "RetirePro — Free India Retirement Calculator | No Login Required",
    description:
      "Plan your retirement in India for free. Calculate corpus, SIP, EPF, NPS & more. No account needed. Visual projections, cashflow analysis & India-specific assumptions.",
    canonical: SITE,
    ogUrl: SITE,
    ogType: "website",
    bodyHtml,
  });
  // Root → dist/public/index.html (overwrite the Vite shell with rendered version)
  writeFileSync(join(distDir, "index.html"), html, "utf-8");
  console.log("  ✓ / (root)");
}

// ── /faq ───────────────────────────────────────────────────────────────────
{
  const FAQS = [
    { q: "How much money do I need to retire in India?", a: "For a comfortable retirement in India, you typically need ₹1.5 crore to ₹5 crore depending on your city, lifestyle, and age. Use our free retirement calculator to get your exact, inflation-adjusted number." },
    { q: "Is ₹1 crore enough to retire in India?", a: "No, for most people. ₹1 crore generates only ₹30,000–40,000/month through an SWP. After inflation, this erodes rapidly. It might work in Tier 3 cities with a frugal lifestyle, but it's risky for most Indians." },
    { q: "How much monthly income do I need after retirement?", a: "A good rule: 70–80% of your pre-retirement income, adjusted for inflation. RetirePro calculates this automatically based on your current expenses." },
    { q: "What is the best retirement plan in India?", a: "The optimal strategy combines EPF, NPS (market-linked, extra ₹50K tax benefit under 80CCD(1B)), PPF (guaranteed returns, tax-free), Equity SIPs (12–14% CAGR historically), and comprehensive health insurance." },
    { q: "Can I retire at 45 in India?", a: "Yes, but you need aggressive planning. FIRE requires 25x your annual expenses invested, a low withdrawal rate (3–3.5%), and ideally side income. Use RetirePro to check feasibility." },
    { q: "Is RetirePro free to use?", a: "Yes, completely free. No account creation, no email required, no hidden charges. Build a complete retirement plan with income projections, expense tracking, children's education goals, and visual charts without signing up." },
    { q: "What makes RetirePro different from other retirement calculators?", a: "RetirePro is built for India: 7% general inflation, 8% education inflation, EPF and NPS integration, children's education and marriage goals, home loan EMI impact, mini-retirement breaks, and joint retirement planning." },
    { q: "Does RetirePro require login or signup?", a: "No. RetirePro does not require any login, signup, or email address to use the full calculator. Your data is processed in your browser. You can optionally sign in to save your plan." },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map(f => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const bodyHtml = safeRender("/faq");
  write("faq", buildHtml({
    title: "Retirement Planning FAQ — India | RetirePro",
    description: "Answers to the most common questions about retirement planning in India — corpus size, SIP, EPF, NPS, and how RetirePro works.",
    canonical: `${SITE}/faq`,
    ogUrl: `${SITE}/faq`,
    ogType: "website",
    jsonLd: faqJsonLd,
    bodyHtml,
  }));
  console.log("  ✓ /faq");
}

// ── /free-plan ─────────────────────────────────────────────────────────────
{
  const bodyHtml = safeRender("/free-plan");
  write("free-plan", buildHtml({
    title: "Free Retirement Calculator India — No Login | RetirePro",
    description: "Calculate your retirement corpus for free. India-specific assumptions — EPF, NPS, SIP, inflation. Takes 60 seconds. No account needed.",
    canonical: `${SITE}/free-plan`,
    ogUrl: `${SITE}/free-plan`,
    ogType: "website",
    bodyHtml,
  }));
  console.log("  ✓ /free-plan");
}

// ── /go ────────────────────────────────────────────────────────────────────
{
  const bodyHtml = safeRender("/go");
  write("go", buildHtml({
    title: "Get Your Free Retirement Plan — India | RetirePro",
    description: "Get a personalised retirement plan from India's top retirement advisors. Free consultation, no commitment. Calculate your corpus in 60 seconds.",
    canonical: `${SITE}/go`,
    ogUrl: `${SITE}/go`,
    ogType: "website",
    bodyHtml,
  }));
  console.log("  ✓ /go");
}

// ── /blog (index) ──────────────────────────────────────────────────────────
{
  const blogListJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "RetirePro — Retirement Planning Blog",
    url: `${SITE}/blog`,
    description: "Expert articles on retirement planning in India.",
    blogPost: BLOG_POSTS.map(p => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${SITE}/blog/${p.slug}`,
      datePublished: p.datePublished,
    })),
  };

  const bodyHtml = safeRender("/blog");
  write("blog", buildHtml({
    title: "Retirement Planning Blog — India | RetirePro",
    description: "Expert articles on retirement planning in India — corpus targets, NPS vs PPF vs SIP, FIRE, HNI strategies, and more. No login required.",
    canonical: `${SITE}/blog`,
    ogUrl: `${SITE}/blog`,
    ogType: "website",
    jsonLd: blogListJsonLd,
    bodyHtml,
  }));
  console.log("  ✓ /blog");
}

// ── Individual blog posts (derived from BLOG_POSTS — no manual list) ───────
console.log(`\n  Rendering ${BLOG_POSTS.length} blog articles:`);
for (const post of BLOG_POSTS) {
  const url = `/blog/${post.slug}`;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    author: { "@type": "Organization", name: "RetirePro Editorial", url: SITE },
    publisher: {
      "@type": "Organization",
      name: "RetirePro",
      url: SITE,
      logo: { "@type": "ImageObject", url: `${SITE}/favicon.png` },
    },
    datePublished: post.datePublished,
    dateModified: post.datePublished,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE}${url}` },
    image: `${SITE}/opengraph.jpg`,
  };

  const bodyHtml = safeRender(url);
  write(`blog/${post.slug}`, buildHtml({
    title: `${post.title} | RetirePro`,
    description: post.description,
    canonical: `${SITE}${url}`,
    ogUrl: `${SITE}${url}`,
    ogType: "article",
    jsonLd: articleJsonLd,
    bodyHtml,
  }));
  console.log(`    ✓ ${url}`);
}

// ── Legal pages (standalone HTML, enriched with OG/canonical) ──────────────
console.log();
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
  description: "Refund and cancellation policy for RetirePro Pro subscriptions.",
  canonical: `${SITE}/refund-policy`,
  ogUrl: `${SITE}/refund-policy`,
});
writeLegal("terms-and-conditions", "terms-and-conditions.html", {
  title: "Terms & Conditions — RetirePro.in",
  description: "Terms and Conditions for using RetirePro.in — the free India-specific retirement planning calculator.",
  canonical: `${SITE}/terms-and-conditions`,
  ogUrl: `${SITE}/terms-and-conditions`,
});

// ── /plan/preview — noindex shell, NOT in sitemap ─────────────────────────
{
  write("plan/preview", buildHtml({
    title: "Retirement Plan Preview | RetirePro",
    description: "Your personalised retirement corpus projection.",
    canonical: `${SITE}/plan/preview`,
    ogUrl: `${SITE}/plan/preview`,
    noindex: true,
    bodyHtml: "",   // intentionally empty — app shell rendered client-side
  }));
  console.log("  ✓ /plan/preview (noindex shell)");
}

// ---------------------------------------------------------------------------
// Verification: fail loudly if any route in sitemap has no prerendered file
// ---------------------------------------------------------------------------
const sitemapRoutes = BLOG_POSTS.map(p => `blog/${p.slug}`).concat([
  "",        // root → index.html
  "blog",
  "faq",
  "free-plan",
  "go",
]);

let failed = 0;
for (const route of sitemapRoutes) {
  const file = route === ""
    ? join(distDir, "index.html")
    : join(distDir, route, "index.html");
  if (!existsSync(file)) {
    console.error(`MISSING prerendered file for /${route}`);
    failed++;
  }
}
if (failed > 0) {
  console.error(`\n${failed} route(s) missing — build incomplete.`);
  process.exit(1);
}

console.log("\nPrerender complete. All routes verified ✓");
