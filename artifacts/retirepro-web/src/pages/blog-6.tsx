import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import BrandLogo from "@/components/brand-logo";
import { usePageMeta } from "@/hooks/usePageMeta";
import NewsletterWidget from "@/components/newsletter-widget";

const ARTICLE_META = {
  headline: "NPS vs UPS vs OPS: Which Pension Scheme Is Actually Better for You? (2026 Deep Dive)",
  description: "UPS is live since April 2025. Compare NPS vs UPS vs OPS on pension amount, contributions, lump sum, family pension, inflation protection & taxes — with clear guidance on who should choose what.",
  datePublished: "2026-07-22",
  dateModified: "2026-07-22",
  slug: "nps-vs-ups-vs-ops-which-is-better",
  readTime: "13 min read",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: ARTICLE_META.headline,
  description: ARTICLE_META.description,
  author: { "@type": "Organization", name: "RetirePro Editorial", url: "https://retirepro.in" },
  publisher: {
    "@type": "Organization",
    name: "RetirePro",
    url: "https://retirepro.in",
    logo: { "@type": "ImageObject", url: "https://retirepro.in/og-image.jpg" },
  },
  datePublished: ARTICLE_META.datePublished,
  dateModified: ARTICLE_META.dateModified,
  mainEntityOfPage: { "@type": "WebPage", "@id": `https://retirepro.in/blog/${ARTICLE_META.slug}` },
  image: "https://retirepro.in/og-image.jpg",
};

function ArticleSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold text-slate-900 mb-4">{title}</h2>
      {children}
    </section>
  );
}

function Callout({ type, children }: { type: "warning" | "success" | "info"; children: React.ReactNode }) {
  const config = {
    warning: { bg: "bg-amber-50 border-amber-300", icon: <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" /> },
    success: { bg: "bg-emerald-50 border-emerald-300", icon: <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" /> },
    info: { bg: "bg-blue-50 border-blue-300", icon: <TrendingUp className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" /> },
  };
  const { bg, icon } = config[type];
  return (
    <div className={`flex gap-3 border rounded-xl p-4 my-6 ${bg}`}>
      {icon}
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

function StatBox({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center p-6 bg-slate-900 rounded-2xl text-white">
      <div className="text-3xl font-bold text-amber-400 mb-1">{number}</div>
      <div className="text-sm text-slate-300">{label}</div>
    </div>
  );
}

const COMPARISON_ROWS = [
  { feature: "Type", ops: "Defined benefit", nps: "Defined contribution", ups: "Hybrid (assured benefit, funded)" },
  { feature: "Employee contribution", ops: "Nil", nps: "10% of Basic+DA", ups: "10% of Basic+DA" },
  { feature: "Govt contribution", ops: "N/A (pay-as-you-go)", nps: "14%", ups: "18.5%" },
  { feature: "Pension amount", ops: "50% of last basic pay, guaranteed", nps: "Market-dependent, not guaranteed", ups: "50% of avg last-12-month basic (25 yrs), guaranteed" },
  { feature: "Minimum pension", ops: "Yes", nps: "No", ups: "₹10,000/month (10+ yrs service)" },
  { feature: "Inflation protection", ops: "Yes (DA + Pay Commissions)", nps: "No (unless annuity type provides)", ups: "Yes (dearness relief)" },
  { feature: "Family pension", ops: "50%", nps: "Depends on annuity chosen", ups: "60%" },
  { feature: "Lump sum at exit", ops: "Gratuity", nps: "Up to 80% of corpus (new rules)", ups: "Lump sum + gratuity" },
  { feature: "Market risk", ops: "None", nps: "Entirely yours", ups: "Largely absorbed" },
  { feature: "Corpus inheritance", ops: "No corpus", nps: "Yes — remaining wealth is yours", ups: "Limited" },
  { feature: "Open to private sector?", ops: "No", nps: "Yes", ups: "No" },
  { feature: "Availability today", ops: "Closed", nps: "Open to all", ups: "Central govt employees (opt-in)" },
];

export default function Blog6() {
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
          <Link href="/" className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1">
            Free Calculator <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E293B 40%, #451A03 100%)" }} className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block bg-amber-400/20 text-amber-300 text-sm font-semibold px-3 py-1 rounded-full mb-6 border border-amber-400/30">
              Government Pension · {ARTICLE_META.readTime}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6 text-white">
              NPS vs UPS vs OPS: Which Pension Scheme Is Actually Better for You?
            </h1>
            <p className="text-amber-100/90 text-lg leading-relaxed mb-6">
              UPS went live in April 2025 — and lakhs of government employees now face an irreversible choice. This deep dive cuts through the noise with plain facts and situation-specific guidance.
            </p>
            <div className="flex items-center gap-3 text-sm text-amber-400/80">
              <span>RetirePro Editorial</span>
              <span>·</span>
              <time dateTime={ARTICLE_META.datePublished}>22 Jul 2026</time>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Visual: Govt Contribution Chart */}
      <div className="bg-slate-50 border-b border-slate-200 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Government contribution per employee</p>
          <div className="space-y-3">
            {[
              { label: "OPS", sub: "Old Pension Scheme", pct: 0, color: "#94A3B8", text: "Pay-as-you-go — no funded corpus", badge: "Closed" },
              { label: "NPS", sub: "National Pension System", pct: 56, color: "#3B82F6", text: "14% of Basic + DA", badge: "Open to all" },
              { label: "UPS", sub: "Unified Pension Scheme", pct: 100, color: "#E8940A", text: "18.5% of Basic + DA (highest)", badge: "Govt employees" },
            ].map(row => (
              <div key={row.label} className="flex items-center gap-4">
                <div className="w-24 flex-shrink-0">
                  <div className="font-bold text-slate-900 text-sm">{row.label}</div>
                  <div className="text-xs text-slate-400">{row.sub}</div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-7 rounded-md transition-all" style={{ width: row.pct === 0 ? "4px" : `${row.pct}%`, background: row.color, minWidth: row.pct === 0 ? "4px" : undefined }} />
                    <span className="text-sm font-semibold text-slate-700">{row.text}</span>
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full border flex-shrink-0" style={{ color: row.color, borderColor: row.color + "60", background: row.color + "15" }}>{row.badge}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-3">Higher govt contribution = bigger corpus built = better retirement security</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="bg-slate-900 py-8 px-4">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-4">
          <StatBox number="2004" label="Year OPS was closed for new central govt employees" />
          <StatBox number="18.5%" label="Government's UPS contribution — higher than NPS's 14%" />
          <StatBox number="60%" label="Family pension under UPS — better than OPS's 50%" />
        </div>
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }}>

          <p className="text-lg text-slate-700 leading-relaxed mb-8 italic border-l-4 border-amber-500 pl-4">
            Since the Unified Pension Scheme (UPS) went live in 2025, lakhs of central government employees have faced a genuinely difficult, largely <strong>irreversible</strong> choice: stay with the market-linked NPS or switch to the assured-pension UPS. Meanwhile, the political demand to bring back OPS refuses to die.
          </p>

          <ArticleSection title="The Story in One Paragraph: How India Got Three Pension Schemes">
            <p className="text-slate-700 leading-relaxed mb-4">
              Before 2004, government employees retired into the <strong className="text-slate-900">OPS</strong>: a guaranteed, lifelong pension of 50% of last drawn basic pay, plus Dearness Relief that rose with inflation — with <strong className="text-slate-900">zero contribution</strong> from the employee. Generous, but unfunded: there was no invested corpus behind it; every year's pensions were paid straight from that year's taxes.
            </p>
            <p className="text-slate-700 leading-relaxed mb-4">
              As lifespans rose, this became a fiscal time bomb, so from 1 January 2004 the government replaced it with the <strong className="text-slate-900">NPS</strong> — a contributory, market-linked system where your pension depends on how your invested corpus performs. Employees disliked the loss of certainty, protests grew, several states threatened reversion to OPS — and in August 2024 the Centre announced the <strong className="text-slate-900">UPS</strong>, effective 1 April 2025, as a middle path: contributory like NPS, but with an assured pension like OPS.
            </p>
          </ArticleSection>

          <ArticleSection title="Scheme 1: OPS — The Gold Standard That Became Unaffordable">
            <p className="text-slate-700 leading-relaxed mb-4">
              <strong className="text-slate-900">How it works:</strong> Retire after qualifying service and receive 50% of your last drawn basic pay as pension, every month, for life — revised upward with Dearness Relief (DA) and with every Pay Commission. On your death, your spouse receives a family pension. You contribute nothing during service (only GPF, which is your own savings).
            </p>
            <Callout type="success">
              <strong>Why employees love it:</strong> Zero market risk, zero contribution, inflation-protected, and Pay Commission revisions mean even <em>retired</em> employees get pension hikes. Total certainty.
            </Callout>
            <Callout type="warning">
              <strong>Why it was discontinued:</strong> It's a pay-as-you-go promise with no corpus behind it. Pension liabilities of several states now consume a huge share of their revenue — money that can't build schools, hospitals or roads. OPS closed for central employees joining on or after 1 January 2004, and it is <strong>not available to anyone joining today</strong>, however loud the political demand.
            </Callout>
          </ArticleSection>

          <ArticleSection title="Scheme 2: NPS — Market-Linked, Flexible, Uncertain">
            <p className="text-slate-700 leading-relaxed mb-4">
              <strong className="text-slate-900">How it works:</strong> A defined-contribution scheme. You contribute 10% of Basic + DA; the government adds 14% (for government employees). The money is invested by pension fund managers across equity, corporate bonds and government securities, growing into a corpus over your career. At retirement, you take part of the corpus as a lump sum and use the rest to buy an <strong className="text-slate-900">annuity</strong> — an insurance product that pays a monthly pension for life.
            </p>
            <p className="text-slate-700 leading-relaxed mb-4">
              Recent PFRDA reforms have made withdrawals far more flexible — the new 80:20 rule lets you take up to 80% as lump sum. See our{" "}
              <Link href="/blog/nps-withdrawal-rules-2026" className="text-amber-600 hover:text-amber-700 underline">
                NPS Withdrawal Rules 2026 guide
              </Link>{" "}
              for details.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 my-6">
              {[
                { label: "Wealth creation potential", body: "Long-run equity exposure means the corpus can grow well beyond what a fixed formula would give — a 30-year career of contributions at market returns can build a very large corpus." },
                { label: "Portability & transparency", body: "Your money is in your account, visible, portable across jobs — and NPS is open to private-sector employees and the self-employed too." },
                { label: "No guarantee", body: "Your pension depends on market performance and annuity rates at the moment you retire. Retire into a market crash, and your pension is permanently smaller." },
                { label: "Annuity mediocrity", body: "Annuity rates in India are modest and annuity income is taxable. For many, replacing a guaranteed pension with a fluctuating NAV replaced peace of mind with anxiety." },
              ].map((item, i) => (
                <div key={item.label} className={`rounded-xl p-4 border ${i < 2 ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
                  <h4 className={`font-semibold text-sm mb-1.5 ${i < 2 ? "text-emerald-800" : "text-red-800"}`}>{i < 2 ? "✓ " : "✗ "}{item.label}</h4>
                  <p className="text-xs leading-relaxed text-slate-700">{item.body}</p>
                </div>
              ))}
            </div>
          </ArticleSection>

          <ArticleSection title="Scheme 3: UPS — The Hybrid Middle Path">
            <p className="text-slate-700 leading-relaxed mb-4">
              <strong className="text-slate-900">How it works:</strong> You contribute 10% of Basic + DA (like NPS), and the government contributes 18.5% (higher than NPS's 14%). In exchange, you receive an <strong className="text-slate-900">assured pension</strong>:
            </p>
            <div className="space-y-3 mb-6">
              {[
                { icon: "🏛️", text: "50% of your average basic pay over the last 12 months before retirement — after 25 years of qualifying service." },
                { icon: "📊", text: "Proportionate pension for 10–25 years of service." },
                { icon: "💰", text: "Minimum ₹10,000/month after at least 10 years of service." },
                { icon: "👨‍👩‍👧", text: "60% family pension to spouse on death — notably higher than the 50% under OPS." },
                { icon: "📈", text: "Inflation relief: pension indexed via dearness relief, protecting purchasing power." },
              ].map(item => (
                <div key={item.icon} className="flex items-start gap-3 bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  <p className="text-sm text-slate-700 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
            <Callout type="warning">
              <strong>The fine print that matters:</strong> UPS is <strong>optional and one-way</strong> — existing NPS-covered central employees could opt in, but the switch is irrevocable. Also, pension generally starts at 60, which is a real disadvantage for paramilitary and other early-retiring personnel. Uptake has been strikingly low so far, partly due to the irreversibility of the choice.
            </Callout>
          </ArticleSection>

          {/* Comparison Table */}
          <ArticleSection title="Head-to-Head Comparison Table">
            <div className="overflow-x-auto rounded-2xl border border-slate-200 my-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="text-left px-4 py-3 font-semibold min-w-[160px]">Feature</th>
                    <th className="text-left px-4 py-3 font-semibold">OPS</th>
                    <th className="text-left px-4 py-3 font-semibold text-amber-300">NPS</th>
                    <th className="text-left px-4 py-3 font-semibold text-emerald-300">UPS</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, i) => (
                    <tr key={row.feature} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="px-4 py-3 font-medium text-slate-700">{row.feature}</td>
                      <td className="px-4 py-3 text-slate-600">{row.ops}</td>
                      <td className="px-4 py-3 text-slate-600">{row.nps}</td>
                      <td className="px-4 py-3 text-slate-600">{row.ups}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ArticleSection>

          <ArticleSection title="So Which Is Better? (The Honest, Situation-Based Answer)">
            <div className="space-y-4 mb-6">
              {[
                {
                  headline: "If you value certainty above all — choose UPS",
                  body: "A guaranteed 50% pension with inflation indexing and a 60% family pension is a powerful floor. Best suited to risk-averse employees, those with 25+ years of service ahead, and anyone whose household depends heavily on their pension.",
                  color: "border-emerald-400 bg-emerald-50",
                  badge: "bg-emerald-100 text-emerald-700",
                  label: "Recommend UPS",
                },
                {
                  headline: "If you have long service left and can stomach market swings — consider staying with NPS",
                  body: "Over 20–30 years, equity-heavy NPS can plausibly build a corpus whose pension plus inheritable wealth beats the UPS formula. It rewards those who understand markets and won't panic in downturns. It's also the only option of the three for private-sector and self-employed Indians.",
                  color: "border-amber-400 bg-amber-50",
                  badge: "bg-amber-100 text-amber-700",
                  label: "Recommend NPS",
                },
                {
                  headline: "If you're hoping for OPS — plan as if it's not coming",
                  body: "It's closed, fiscally unsustainable, and no serious policy path reopens it for new central employees. Building your retirement on a political promise is not a plan.",
                  color: "border-red-300 bg-red-50",
                  badge: "bg-red-100 text-red-700",
                  label: "OPS unavailable",
                },
              ].map(item => (
                <div key={item.headline} className={`rounded-xl p-5 border-l-4 ${item.color}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.badge}`}>{item.label}</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1.5">{item.headline}</h3>
                  <p className="text-sm text-slate-700 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>

            <Callout type="warning">
              <strong>The uncomfortable truth for everyone:</strong> even the "guaranteed" options only guarantee a <em>formula</em> — not that the formula is <em>enough</em>. A ₹40,000/month assured pension sounds safe until you realise your household will need ₹1,50,000/month by then. And 50% of basic pay is exactly that — 50%, when your expenses won't politely halve on retirement day.
            </Callout>
          </ArticleSection>

          <ArticleSection title="The Step Nobody Takes: Convert the Scheme Into a Number">
            <p className="text-slate-700 leading-relaxed mb-4">
              Whether you pick NPS, UPS, or have neither, the question that actually determines your retirement is the same: <strong className="text-slate-900">will your total retirement income cover your inflated expenses for 25–35 years?</strong>
            </p>
            <p className="text-slate-700 leading-relaxed mb-4">
              That requires calculating your target corpus from your own expenses, inflation, life expectancy and retirement age — then checking what your pension scheme, EPF, and personal investments together will deliver, and measuring the gap. Most people — including government employees who feel "covered" — have never run this calculation once.
            </p>
            <div className="bg-gradient-to-br from-slate-900 to-amber-950 rounded-2xl p-8 text-white my-6">
              <h3 className="text-lg font-bold mb-2 text-amber-300">Don't assume you're covered. Know.</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-5">
                Model your pension as one income stream, add your other savings, and find out whether "assured" actually means "adequate" for your life. A five-minute exercise that most people postpone for decades.
              </p>
              <Link
                href="/free-plan"
                className="inline-block bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-6 py-2.5 rounded-full text-sm transition-colors"
              >
                Calculate My Retirement Number →
              </Link>
            </div>
          </ArticleSection>

          {/* FAQ */}
          <ArticleSection title="FAQ">
            <div className="space-y-5">
              {[
                {
                  q: "Is UPS better than NPS?",
                  a: "For risk-averse employees with long service ahead who prize a guaranteed, inflation-indexed pension, UPS is generally the safer pick. For those comfortable with market risk over 20+ years, NPS can produce a larger total outcome plus inheritable corpus. The right answer depends on your risk appetite, service length and family situation — and the switch is one-way, so model both before deciding.",
                },
                {
                  q: "Can private-sector employees join UPS or OPS?",
                  a: "No. Both are for government employees only. Private-sector and self-employed Indians can use NPS, EPF, PPF and mutual funds.",
                },
                {
                  q: "What is the minimum pension under UPS?",
                  a: "₹10,000 per month, after a minimum of 10 years of qualifying service.",
                },
                {
                  q: "Will OPS come back?",
                  a: "For central government employees, there is no indication of OPS returning. UPS was explicitly designed as the fiscally-sustainable answer to the OPS demand.",
                },
                {
                  q: "How do I know if my pension will be enough?",
                  a: "Project your expenses to retirement with inflation, estimate your pension income, and compute the gap over your full life expectancy — a calculator like RetirePro.in does this in minutes with fully editable assumptions.",
                },
              ].map(item => (
                <div key={item.q} className="border-b border-slate-200 pb-5 last:border-0 last:pb-0">
                  <h3 className="font-semibold text-slate-900 mb-2">{item.q}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </ArticleSection>

          <NewsletterWidget source="blog-nps-ups-ops" />

          {/* CTA */}
          <div className="bg-gradient-to-r from-slate-900 to-amber-900 rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-3">Is Your Pension Enough? Find Out in 5 Minutes.</h2>
            <p className="text-amber-100 mb-2">Whether you're on NPS or UPS, the question is the same: will your income stream cover 30 years of rising expenses?</p>
            <p className="text-amber-200 text-sm mb-6">Free. No login required. Every assumption is yours to set and see.</p>
            <Link href="/free-plan" className="inline-block bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-8 py-3 rounded-full transition-colors">
              Calculate My Retirement Number →
            </Link>
          </div>

          {/* Related Articles */}
          <div className="mt-12 pt-10 border-t border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-5">Related Articles</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { slug: "nps-withdrawal-rules-2026", title: "NPS Withdrawal Rules 2026: The New 80:20 Rule Explained", tag: "NPS Guide", tagColor: "text-amber-600", gradient: "from-amber-600 to-orange-700" },
                { slug: "how-much-money-to-retire-in-india", title: "How Much Money Do I Need to Retire in India?", tag: "Retirement Basics", tagColor: "text-orange-600", gradient: "from-orange-500 to-red-600" },
                { slug: "retirement-planning-self-employed-india", title: "Retirement Planning for Self-Employed Indians", tag: "Self-Employed", tagColor: "text-blue-600", gradient: "from-blue-600 to-indigo-700" },
              ].map(post => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="group block bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                  <div className={`h-20 bg-gradient-to-br ${post.gradient}`} />
                  <div className="p-4">
                    <span className={`text-xs font-semibold ${post.tagColor}`}>{post.tag}</span>
                    <p className="text-sm font-semibold text-slate-800 mt-1 leading-snug group-hover:text-amber-600 transition-colors">{post.title}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-8">
              <Link href="/blog" className="text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1 text-sm">
                ← Back to all articles
              </Link>
            </div>
          </div>
        </motion.div>
      </article>
    </div>
  );
}
