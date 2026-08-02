/**
 * Canonical blog post registry — single source of truth.
 *
 * Imported by:
 *   - src/pages/blog-index.tsx  (visual card data)
 *   - src/entry-server.tsx      (SSR render + route enumeration)
 *
 * New posts: add an entry here.  The prerender script picks them up
 * automatically via the SSR bundle.
 */

export interface BlogPost {
  slug: string;
  /** Display title used in blog-index cards and og:title */
  title: string;
  /** Short teaser shown on the index card */
  excerpt: string;
  /** Full SEO description used in meta description + og:description */
  description: string;
  readTime: string;
  tag: string;
  tagColor: string;
  gradient: string;
  /** Human-readable date, e.g. "1 Aug 2026" */
  date: string;
  /** ISO date for <time datetime="..."> */
  dateTime: string;
  /** ISO date for JSON-LD datePublished */
  datePublished: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "sabbatical-mini-retirement-startup-calculator",
    title:
      "The Mini-Retirement Test: How a Techie Can Take 3 Years Off to Build a Startup Without Wrecking Retirement",
    excerpt:
      "₹21.6 lakh of paused SIPs becomes ₹2.8 crore of missing corpus at 60. Here's the exact math on sabbaticals, runway, and how to model a career break without flying blind on retirement.",
    description:
      "Thinking of quitting your tech job to build something? Run the sabbatical as a mini-retirement first. Here's the math on runway, paused SIPs and child goals.",
    readTime: "11 min read",
    tag: "Mini Retirement",
    tagColor: "bg-indigo-100 text-indigo-800",
    gradient: "from-slate-800 via-indigo-950 to-slate-900",
    date: "1 Aug 2026",
    dateTime: "2026-08-01",
    datePublished: "2026-08-01",
  },
  {
    slug: "best-retirement-planning-tool-india",
    title: "The Single Best Tool to Fix India's Looming Retirement Crisis",
    excerpt:
      "Most Indians are planning retirement with dangerously wrong numbers. Here's why generic two-box calculators fail — and how RetirePro gives you the honest, India-specific picture in 60 seconds.",
    description:
      "Most Indians are planning retirement with dangerously wrong numbers. Here's why generic two-box calculators fail — and how RetirePro gives you the honest, India-specific picture in 60 seconds.",
    readTime: "9 min read",
    tag: "Retirement Planning",
    tagColor: "bg-blue-100 text-blue-800",
    gradient: "from-slate-900 via-blue-950 to-indigo-900",
    date: "1 Aug 2026",
    dateTime: "2026-08-01",
    datePublished: "2026-08-01",
  },
  {
    slug: "nps-vs-ups-vs-ops-which-is-better",
    title: "NPS vs UPS vs OPS: Which Pension Scheme Is Actually Better for You? (2026 Deep Dive)",
    excerpt:
      "UPS went live April 2025 — and lakhs of govt employees face an irreversible choice. Full comparison: pension amount, contributions, family pension, market risk, and who should pick what.",
    description:
      "UPS is live since April 2025. Compare NPS vs UPS vs OPS on pension amount, contributions, lump sum, family pension, inflation protection and taxes — with clear guidance on who should choose what.",
    readTime: "13 min read",
    tag: "Government Pension",
    tagColor: "bg-amber-100 text-amber-800",
    gradient: "from-slate-900 via-slate-800 to-amber-900",
    date: "22 Jul 2026",
    dateTime: "2026-07-22",
    datePublished: "2026-07-22",
  },
  {
    slug: "nps-withdrawal-rules-2026",
    title: "NPS Withdrawal Rules 2026: The New 80:20 Rule, Exit at 15 Years & Stay Invested Till 85",
    excerpt:
      "PFRDA has overhauled NPS exits. 80% lump sum, ₹8 lakh full-exit threshold, 15-year early exit, deferral to 85. Everything changed — and the tax fine print nobody mentions.",
    description:
      "PFRDA has overhauled NPS exits. Understand the new 80% lump sum rule, corpus slabs, 15-year exit, SLW, staying invested till 85, premature exit rules and the tax fine print — explained simply.",
    readTime: "13 min read",
    tag: "NPS Guide",
    tagColor: "bg-amber-100 text-amber-800",
    gradient: "from-amber-800 via-orange-900 to-slate-900",
    date: "22 Jul 2026",
    dateTime: "2026-07-22",
    datePublished: "2026-07-22",
  },
  {
    slug: "how-much-money-to-retire-in-india",
    title: "How Much Money Do I Need to Retire in India? (The Honest Answer Nobody Gives You)",
    excerpt:
      "₹1 crore? ₹5 crore? ₹10 crore? There is no universal number — but there is a formula. Here's how to calculate yours from scratch, with real examples and the 5 mistakes that destroy most plans.",
    description:
      "₹1 crore? ₹5 crore? ₹10 crore? Learn how to calculate your actual retirement corpus in India — with the formula, real examples, common mistakes, and why generic numbers mislead you.",
    readTime: "11 min read",
    tag: "Retirement Basics",
    tagColor: "bg-orange-100 text-orange-800",
    gradient: "from-red-900 via-orange-800 to-slate-900",
    date: "22 Jul 2026",
    dateTime: "2026-07-22",
    datePublished: "2026-07-22",
  },
  {
    slug: "retirement-planning-self-employed-india",
    title: "Retirement Planning for Self-Employed Indians: The Complete Guide Nobody Wrote for You",
    excerpt:
      "No EPF, no employer, no pension. Every rupee of your retirement must be consciously created by you — or it simply won't exist. NPS, PPF, APY, SIPs, and the corpus calculation most skip.",
    description:
      "No EPF. No employer. No pension. Self-employed Indians must build retirement alone. Complete guide: NPS, PPF, APY, mutual funds, how much you need, and the corpus calculation most business owners never do.",
    readTime: "12 min read",
    tag: "Self-Employed",
    tagColor: "bg-blue-100 text-blue-800",
    gradient: "from-indigo-900 via-blue-900 to-slate-900",
    date: "22 Jul 2026",
    dateTime: "2026-07-22",
    datePublished: "2026-07-22",
  },
  {
    slug: "retirement-corpus-calculator-india-serious-planners",
    title: "Why Serious Retirement Planners in India Are Ditching Quick Google Calculators",
    excerpt:
      "That number you got from a two-box calculator is almost certainly wrong. Here's what actually changes your retirement corpus — and why 76% of Indians are flying blind.",
    description:
      "Most Indians between 30–50 have no idea what their real retirement corpus should be. Learn why quick online calculators mislead you, and how RetirePro's assumption-transparent calculator helps you plan seriously.",
    readTime: "11 min read",
    tag: "Serious Planning",
    tagColor: "bg-amber-100 text-amber-700",
    gradient: "from-slate-900 via-amber-950 to-orange-900",
    date: "19 Jul 2026",
    dateTime: "2026-07-19",
    datePublished: "2026-07-19",
  },
  {
    slug: "how-much-to-retire-india",
    title: "How Much Money Do You Need to Retire in India? [2026 Complete Guide]",
    excerpt:
      "₹1.5 crore or ₹6.5 crore? The answer depends on your city, lifestyle, and one number most calculators ignore: inflation. Here's the complete India-specific formula.",
    description:
      "For a comfortable retirement in India, you need ₹1.5 crore to ₹5 crore depending on your city, lifestyle, and age. Here's the exact formula, city-wise breakdown, and the inflation trap most Indians fall into.",
    readTime: "10 min read",
    tag: "Retirement Basics",
    tagColor: "bg-orange-100 text-orange-700",
    gradient: "from-orange-500 to-red-600",
    date: "18 Jul 2026",
    dateTime: "2026-07-18",
    datePublished: "2026-07-18",
  },
  {
    slug: "real-estate-rich-retirement-illusion",
    title: "The ₹40 Crore Illusion: Why India's Wealthiest Retirees Are the Most Exposed",
    excerpt:
      "Most Indian HNIs believe their net worth guarantees a comfortable retirement. Here's the quiet arithmetic that says otherwise — and what to do about it.",
    description:
      "Most Indian HNIs believe their net worth guarantees a comfortable retirement. Here's the quiet arithmetic that says otherwise — and what to do about it.",
    readTime: "9 min read",
    tag: "HNI Planning",
    tagColor: "bg-orange-100 text-orange-700",
    gradient: "from-slate-700 to-slate-900",
    date: "12 Jul 2026",
    dateTime: "2026-07-12",
    datePublished: "2026-07-12",
  },
  {
    slug: "nps-vs-ppf-vs-sip",
    title: "NPS vs PPF vs Mutual Fund SIP: Which Builds the Biggest Retirement Corpus in India?",
    excerpt:
      "Real numbers, no fluff. We compare all three with India-specific context so you can stop guessing and start investing.",
    description:
      "Real numbers, no fluff. We compare NPS, PPF, and equity mutual fund SIPs with India-specific context so you can stop guessing and start investing.",
    readTime: "9 min read",
    tag: "Investment Guide",
    tagColor: "bg-emerald-100 text-emerald-700",
    gradient: "from-emerald-600 to-teal-700",
    date: "11 Jul 2026",
    dateTime: "2026-07-11",
    datePublished: "2026-07-11",
  },
  {
    slug: "why-indians-fail-retirement",
    title:
      "Why Most Indians Fail to Plan for Retirement — And How One Small Habit Can Change Everything",
    excerpt:
      "93% of Indians over 50 regret not starting retirement planning sooner. Here's what goes wrong and the one small shift that changes everything.",
    description:
      "93% of Indians over 50 regret not starting retirement planning sooner. Here's what goes wrong and the one small shift that changes everything.",
    readTime: "8 min read",
    tag: "Retirement Basics",
    tagColor: "bg-blue-100 text-blue-700",
    gradient: "from-blue-600 to-indigo-700",
    date: "10 Jul 2026",
    dateTime: "2026-07-10",
    datePublished: "2026-07-10",
  },
];
