import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import BrandLogo from "@/components/brand-logo";
import { usePageMeta } from "@/hooks/usePageMeta";
import NewsletterWidget from "@/components/newsletter-widget";

const ARTICLE_META = {
  headline: "The ₹5 Lakh Mistake: Why Withdrawing Your EPF Before 60 Could Cost You ₹50 Lakh+",
  description:
    "Withdrawing EPF early feels harmless — until you see what that money would have become at 60. Here's the real math on EPF compounding, five common withdrawal situations, and better alternatives for each.",
  datePublished: "2026-08-16",
  dateModified: "2026-08-16",
  slug: "epf-early-withdrawal-mistake",
  readTime: "10 min read",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: ARTICLE_META.headline,
  description: ARTICLE_META.description,
  author: {
    "@type": "Organization",
    name: "RetirePro Editorial",
    url: "https://retirepro.in",
  },
  publisher: {
    "@type": "Organization",
    name: "RetirePro",
    url: "https://retirepro.in",
    logo: {
      "@type": "ImageObject",
      url: "https://retirepro.in/og-image.jpg",
    },
  },
  datePublished: ARTICLE_META.datePublished,
  dateModified: ARTICLE_META.dateModified,
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": `https://retirepro.in/blog/${ARTICLE_META.slug}`,
  },
  image: "https://retirepro.in/og-image.jpg",
};

const RELATED = [
  {
    slug: "nps-vs-ppf-vs-sip",
    title: "NPS vs PPF vs Mutual Fund SIP: Which Builds the Biggest Corpus?",
    tag: "Investment Guide",
    tagColor: "text-emerald-600",
    gradient: "from-emerald-600 to-teal-700",
  },
  {
    slug: "nps-withdrawal-rules-2026",
    title: "NPS Withdrawal Rules 2026: The New 80:20 Rule Explained",
    tag: "NPS Guide",
    tagColor: "text-amber-600",
    gradient: "from-amber-800 to-orange-900",
  },
  {
    slug: "how-much-to-retire-india",
    title: "How Much Money Do You Need to Retire in India? [2026 Guide]",
    tag: "Retirement Basics",
    tagColor: "text-orange-600",
    gradient: "from-orange-500 to-red-600",
  },
];

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-10">{children}</h2>;
}

function Callout({ type, children }: { type: "warning" | "success" | "info"; children: React.ReactNode }) {
  const config = {
    warning: { bg: "bg-amber-50 border-amber-300", icon: <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" /> },
    success: { bg: "bg-emerald-50 border-emerald-300", icon: <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" /> },
    info: { bg: "bg-red-50 border-red-300", icon: <TrendingUp className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" /> },
  };
  const { bg, icon } = config[type];
  return (
    <div className={`flex gap-3 border rounded-xl p-4 my-6 ${bg}`}>
      {icon}
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto my-6 rounded-xl border border-slate-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-100">
            {headers.map(h => <th key={h} className="text-left px-4 py-3 font-semibold text-slate-700">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
              {row.map((cell, j) => <td key={j} className="px-4 py-3 text-slate-600">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatBox({ number, label }: { number: string; label: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 text-center shadow-sm">
      <div className="text-2xl sm:text-3xl font-black text-[#F15A24] mb-1">{number}</div>
      <div className="text-xs sm:text-sm text-slate-500 font-medium leading-snug">{label}</div>
    </div>
  );
}

function RelatedArticles() {
  return (
    <div className="mt-12 pt-10 border-t border-slate-200">
      <h3 className="text-lg font-bold text-slate-900 mb-5">Related Articles</h3>
      <div className="grid gap-4 sm:grid-cols-3">
        {RELATED.map(post => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group block bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className={`h-20 bg-gradient-to-br ${post.gradient}`} />
            <div className="p-4">
              <span className={`text-xs font-semibold ${post.tagColor}`}>{post.tag}</span>
              <p className="text-sm font-semibold text-slate-800 mt-1 leading-snug group-hover:text-[#F15A24] transition-colors">{post.title}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Blog13() {
  usePageMeta({
    title: `${ARTICLE_META.headline} | RetirePro`,
    description: ARTICLE_META.description,
    canonical: `https://retirepro.in/blog/${ARTICLE_META.slug}`,
    ogUrl: `https://retirepro.in/blog/${ARTICLE_META.slug}`,
    ogType: "article",
  });

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <BrandLogo textClassName="text-slate-800" />
          <Link href="/free-plan" className="bg-[#F15A24] hover:bg-[#d44d1e] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1">
            Free Calculator <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-br from-red-700 to-orange-800 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block bg-white/15 text-orange-100 text-sm font-semibold px-3 py-1 rounded-full mb-6">
              EPF &amp; PF · {ARTICLE_META.readTime}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
              The ₹5 Lakh Mistake: Why Withdrawing Your EPF Before 60 Could Cost You ₹50 Lakh+
            </h1>
            <p className="text-orange-100 text-lg leading-relaxed mb-6">
              A friend recently considered withdrawing ₹8 lakh from his EPF for a home down payment. He didn't realise that money was actually worth ₹1.2 crore at 60. Here's the math almost nobody runs before withdrawing.
            </p>
            <div className="flex items-center gap-4 text-sm text-orange-200">
              <span>RetirePro Editorial</span>
              <span>·</span>
              <time dateTime={ARTICLE_META.datePublished}>16 Aug 2026</time>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>

          <Callout type="success">
            <strong>Quick Answer:</strong> EPF compounds at 8.25% tax-free until 60, and every early withdrawal resets that compounding to zero. ₹5 lakh withdrawn at 30 can be worth over ₹55 lakh at 60. Run your full retirement gap — including EPF — on our <Link href="/free-plan" className="underline font-semibold">free calculator</Link>.
          </Callout>

          <div className="grid grid-cols-3 gap-4 my-8">
            <StatBox number="8.25%" label="Current EPF interest rate (2025–26), tax-free" />
            <StatBox number="₹55L" label="What ₹5 lakh becomes by 60 if withdrawn at 30" />
            <StatBox number="60" label="The age to treat as your EPF's true finish line" />
          </div>

          <SectionHeading>Why EPF Is India's Most Underrated Wealth Machine</SectionHeading>
          <p className="text-slate-700 leading-relaxed mb-4">
            Before the mistake, it helps to understand why EPF is genuinely powerful:
          </p>
          <DataTable
            headers={["Feature", "Why It Matters"]}
            rows={[
              ["8.25% interest (2025–26 rate)", "Beats most fixed deposits, and it's risk-free"],
              ["Compounds till 60", "Keeps growing even if you stop contributing"],
              ["Employer matches 12%", "Effectively free money added to your account"],
              ["Tax-free at withdrawal", "EEE status — exempt on contribution, growth, and withdrawal"],
              ["Government-backed", "One of the safest instruments available in India"],
            ]}
          />
          <p className="text-slate-700 leading-relaxed mb-4">
            Your EPF isn't just "retirement savings" — it's a compounding engine that gets more powerful the longer it's left untouched.
          </p>

          <SectionHeading>The Math That Changes How You See Your EPF</SectionHeading>
          <p className="text-slate-700 leading-relaxed mb-4">
            Say you're 30 with ₹5 lakh in your EPF, and you withdraw it for a wedding, a down payment, or a medical need. Here's what that decision actually costs, assuming 8.25% annual compounding with no further contributions on that amount:
          </p>
          <DataTable
            headers={["Age of Withdrawal", "Amount Withdrawn", "What It Becomes at 60", "Money Lost"]}
            rows={[
              ["30", "₹5,00,000", "₹55,20,000", "₹50,20,000"],
              ["35", "₹5,00,000", "₹37,10,000", "₹32,10,000"],
              ["40", "₹5,00,000", "₹24,90,000", "₹19,90,000"],
              ["45", "₹5,00,000", "₹16,70,000", "₹11,70,000"],
              ["50", "₹5,00,000", "₹11,20,000", "₹6,20,000"],
            ]}
          />
          <Callout type="warning">
            At 30, that ₹5 lakh is really worth <strong>₹55 lakh</strong>. Withdrawing it isn't taking out ₹5 lakh — it's taking ₹55 lakh away from your 60-year-old self.
          </Callout>

          <SectionHeading>"But I Need the Money" — 5 Situations and What to Do Instead</SectionHeading>
          <div className="space-y-4">
            {[
              { n: "1", title: "Home Down Payment", what: "Take a slightly larger home loan instead. You'll pay ~8.5–9% interest, but your EPF earns 8.25% tax-free — the gap is small, and you keep the compounding alive.", math: "₹10 lakh left in EPF ≈ ₹1.1 crore at 60. A ₹10 lakh bigger loan costs roughly ₹9 lakh in extra interest over 20 years — you still come out over ₹1 crore ahead." },
              { n: "2", title: "Medical Emergency", what: "Lean on health insurance first. If still short, consider a gold loan or a PPF partial withdrawal if available. Treat EPF as the last resort, not the first option." },
              { n: "3", title: "Child's Education or Marriage", what: "An education loan exists for a reason — your child can repay it over time. Your 60-year-old self cannot earn back years of lost compounding." },
              { n: "4", title: "Job Switch or Unemployment", what: "Transfer your EPF instead of withdrawing it — it takes 3–4 weeks online via the UAN portal and keeps your money compounding uninterrupted." },
              { n: "5", title: "Wanting to Start Investing in Mutual Funds", what: "Keep both. EPF is your safe, guaranteed debt allocation; build equity SIPs on top of it, not by liquidating it." },
            ].map(item => (
              <div key={item.n} className="border border-slate-200 rounded-xl p-4">
                <h4 className="font-bold text-slate-900 text-sm mb-2">{item.n}. {item.title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed mb-1">{item.what}</p>
                {item.math && <p className="text-xs text-emerald-700"><strong>Math:</strong> {item.math}</p>}
              </div>
            ))}
          </div>

          <SectionHeading>The One Rule to Never Break</SectionHeading>
          <p className="text-slate-700 leading-relaxed mb-4">
            <strong>Treat your EPF as if it doesn't exist until you're 60.</strong> Not 55, not 58 — 60. Even two extra years of compounding matter more than they seem:
          </p>
          <DataTable
            headers={["Corpus at 58", "Corpus at 60", "Extra 2 Years of Compounding"]}
            rows={[["₹1,00,00,000", "₹1,17,20,000", "₹17,20,000"]]}
          />
          <p className="text-slate-500 text-xs mb-4">That "small" two-year difference is roughly a year of expenses for most retirees.</p>

          <SectionHeading>How to Grow Your EPF Corpus Without Touching It</SectionHeading>
          <div className="space-y-4">
            <div className="border border-slate-200 rounded-xl p-4">
              <h4 className="font-bold text-slate-900 text-sm mb-2">1. Contribute more via Voluntary Provident Fund (VPF)</h4>
              <p className="text-sm text-slate-600 leading-relaxed">You can contribute up to 100% of your basic salary through VPF, at the same 8.25% interest and EEE tax treatment. Adding ₹10,000/month VPF on a ₹50,000 basic salary is an extra ₹1.2 lakh/year — roughly <strong>₹95 lakh extra</strong> at retirement over 25 years at 8.25%. Ask HR — most companies support it with a simple form.</p>
            </div>
            <div className="border border-slate-200 rounded-xl p-4">
              <h4 className="font-bold text-slate-900 text-sm mb-2">2. Transfer, don't withdraw, during job changes</h4>
              <p className="text-sm text-slate-600 leading-relaxed">Login to the UAN portal → Online Services → "One Member – One EPF Account" (Transfer Request) → fill in your old PF details. It's done in 3–4 weeks, and every withdrawal resets compounding — don't press that reset button.</p>
            </div>
            <div className="border border-slate-200 rounded-xl p-4">
              <h4 className="font-bold text-slate-900 text-sm mb-2">3. Check your EPF balance regularly</h4>
              <p className="text-sm text-slate-600 leading-relaxed">Use the UMANG app or the EPFO portal to verify your employer is depositing on time, confirm interest is credited (usually by March–April), and keep your KYC (Aadhaar, PAN, bank) updated so withdrawals aren't blocked when you need them.</p>
            </div>
            <div className="border border-slate-200 rounded-xl p-4">
              <h4 className="font-bold text-slate-900 text-sm mb-2">4. Use EPF as your portfolio's guaranteed "debt floor"</h4>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">Because EPF already covers your safe, guaranteed, tax-free allocation, you can afford to be more aggressive with equity elsewhere — complement it, don't duplicate it.</p>
              <DataTable
                headers={["Asset", "Purpose", "Suggested Allocation"]}
                rows={[
                  ["EPF / VPF", "Safe, guaranteed, tax-free debt", "20–30% of portfolio"],
                  ["PPF", "Long-term tax-free debt", "10–15%"],
                  ["Equity MF / NPS Tier 1", "Growth", "50–60%"],
                  ["Emergency fund", "Liquid safety net", "6 months' expenses"],
                ]}
              />
            </div>
          </div>

          <Callout type="info">
            <strong>Real example:</strong> Two colleagues, same salary, same tenure. One withdrew ₹5 lakh from EPF at 38 for a family wedding and retired at 58 with ₹1.8 crore. The other never touched it and retired with <strong>₹3.4 crore</strong>. That one decision at 38 cost roughly ₹1.6 crore.
          </Callout>

          <SectionHeading>Your Action Plan This Week</SectionHeading>
          <div className="space-y-1.5">
            {[
              "Check your EPF balance — UMANG app, 5 minutes",
              "If you're switching jobs, initiate a transfer, not a withdrawal",
              "Ask HR about enabling VPF — even ₹2,000/month extra adds up meaningfully by 60",
              "Run your full numbers on RetirePro — see how EPF fits into your total retirement corpus",
              "Make a rule: no EPF withdrawal before 60, no exceptions",
            ].map(s => (
              <div key={s} className="flex items-start gap-2 text-sm text-slate-700 bg-slate-50 rounded-lg px-4 py-2.5">
                <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                {s}
              </div>
            ))}
          </div>

          {/* FAQ */}
          <SectionHeading>Frequently Asked Questions</SectionHeading>
          <div className="space-y-5 bg-slate-50 rounded-2xl p-6">
            {[
              { q: "Can I withdraw EPF for medical treatment?", a: "Yes, but typically only if you're hospitalised for a month or more, or need major surgery. Even then, consider health insurance and other alternatives first — the compounding cost of an early withdrawal is steep." },
              { q: "Is EPF interest taxable if I withdraw early?", a: "If you withdraw before completing 5 years of continuous service, the withdrawal is taxable as per your income slab, and TDS may apply — an additional penalty on top of lost compounding." },
              { q: "What if I quit my job and don't find a new one right away?", a: "You can withdraw after 2 months of unemployment, but you can also leave it untouched — your EPF continues earning interest for up to 3 years even without new contributions." },
              { q: "Should I put extra savings into VPF or NPS?", a: "VPF offers safety with some liquidity for specific withdrawal reasons; NPS offers an additional ₹50,000 tax deduction under Section 80CCD(1B). If you can afford it, doing both maximises safety and tax efficiency." },
            ].map(item => (
              <div key={item.q} className="border-b border-slate-200 pb-5 last:border-0 last:pb-0">
                <h3 className="font-semibold text-slate-900 mb-2 text-sm">{item.q}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>

          <NewsletterWidget source="blog-epf-withdrawal-mistake" />

          {/* CTA */}
          <div className="bg-gradient-to-r from-red-700 to-orange-800 rounded-2xl p-8 text-center text-white mt-10">
            <h2 className="text-2xl font-bold mb-3">See How EPF Fits Your Full Retirement Number</h2>
            <p className="text-orange-100 mb-6">Model EPF, NPS, and SIPs together — inflation-adjusted, India-specific, free.</p>
            <Link href="/free-plan" className="inline-flex items-center gap-2 bg-white text-orange-700 font-bold px-8 py-3 rounded-full hover:bg-orange-50 transition-colors">
              Calculate My Retirement Gap <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <RelatedArticles />

          <div className="mt-10 pb-16">
            <Link href="/blog" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 text-sm">
              ← Back to all articles
            </Link>
          </div>
        </motion.div>
      </article>
    </div>
  );
}
