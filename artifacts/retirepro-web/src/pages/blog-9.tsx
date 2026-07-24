import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import BrandLogo from "@/components/brand-logo";
import { usePageMeta } from "@/hooks/usePageMeta";
import NewsletterWidget from "@/components/newsletter-widget";

const ARTICLE_META = {
  headline: "NPS Withdrawal Rules 2026: The New 80:20 Rule, Exit at 15 Years, and Staying Invested Till 85 — Fully Explained",
  description: "PFRDA has overhauled NPS exits. Understand the new 80% lump sum rule, corpus slabs, 15-year exit, SLW, staying invested till 85, premature exit rules and the tax fine print — explained simply.",
  datePublished: "2026-07-22",
  dateModified: "2026-07-22",
  slug: "nps-withdrawal-rules-2026",
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

const CORPUS_SLABS = [
  { corpus: "Up to ₹8 lakh", option: "100% lump sum — no annuity forced", raised: "Raised from earlier ₹5 lakh threshold" },
  { corpus: "₹8–12 lakh", option: "Up to ₹6 lakh / up to 80% as lump sum; balance via annuity or phased payout", raised: "" },
  { corpus: "Above ₹12 lakh", option: "Standard 80:20 rule applies", raised: "Up from 60:40" },
];

export default function Blog9() {
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
      <div style={{ background: "linear-gradient(135deg, #451A03 0%, #78350F 40%, #0F172A 100%)" }} className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block bg-amber-300/20 text-amber-200 text-sm font-semibold px-3 py-1 rounded-full mb-6 border border-amber-300/30">
              NPS Guide · {ARTICLE_META.readTime}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6 text-white">
              NPS Withdrawal Rules 2026: The New 80:20 Rule Explained
            </h1>
            <p className="text-amber-100/90 text-lg leading-relaxed mb-6">
              PFRDA has overhauled NPS exits so substantially that it's almost a different product in 2026. If you last read about NPS a couple of years ago, forget most of what you knew.
            </p>
            <div className="flex items-center gap-3 text-sm text-amber-300">
              <span>RetirePro Editorial</span>
              <span>·</span>
              <time dateTime={ARTICLE_META.datePublished}>22 Jul 2026</time>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="bg-slate-900 py-8 px-4">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-4">
          <StatBox number="80%" label="Maximum lump sum you can now withdraw at normal exit (up from 60%)" />
          <StatBox number="₹8L" label="New small-corpus threshold — full withdrawal, no annuity forced" />
          <StatBox number="85" label="Age up to which you can stay invested before mandatory withdrawal" />
        </div>
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }}>

          <p className="text-slate-600 text-sm italic mb-8 border-l-4 border-amber-400 pl-4">
            Rules described are as reported for non-government/All-Citizens subscribers as of mid-2026; government-sector rules differ in places, and tax treatment of the newest provisions may evolve. Verify specifics with NPS Trust/your POP before acting.
          </p>

          <ArticleSection title="60-Second Refresher: How NPS Exit Works">
            <p className="text-slate-700 leading-relaxed mb-4">
              NPS is a retirement account you fill during your working years. At exit, your accumulated pension wealth is split two ways:
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-1.5">Lump sum</h4>
                <p className="text-sm text-slate-600">You take in hand (fully or in instalments). Rules below are mostly about how much and when.</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-1.5">Annuity</h4>
                <p className="text-sm text-slate-600">A mandatory portion used to buy an insurance product that pays you monthly pension for life.</p>
              </div>
            </div>
          </ArticleSection>

          <ArticleSection title="Change 1: The Headline — 80% Lump Sum, Only 20% Annuity">
            <div className="grid sm:grid-cols-2 gap-4 my-4">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <h4 className="font-semibold text-red-700 text-sm mb-2">Old rule</h4>
                <p className="text-slate-700 text-sm">At normal exit, max <strong>60% lump sum</strong>; 40% had to buy an annuity.</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <h4 className="font-semibold text-emerald-700 text-sm mb-2">New rule</h4>
                <p className="text-slate-700 text-sm">Non-government subscribers can now withdraw <strong>up to 80% as lump sum</strong>, with only 20% going to the mandatory annuity.</p>
              </div>
            </div>
            <p className="text-slate-700 leading-relaxed mb-4">
              The 40% annuity mandate was NPS's most criticised feature — it forced a large chunk of your life savings into low-yield annuities at whatever rates prevailed on your retirement day. Cutting the mandate to 20% hands you back discretion over a much larger share of your own money.
            </p>
            <Callout type="warning">
              <strong>⚠️ The tax fine print nobody puts in the headline:</strong> Under current income-tax law, the exemption under Section 10(12A) covers <strong>60%</strong> of the corpus. Until the tax law is explicitly amended, the additional 20% you withdraw under the new 80% option may be <strong>taxable</strong>. Annuity income has always been taxable as ordinary income. Plan conservatively and check the latest position before exiting.
            </Callout>
          </ArticleSection>

          <ArticleSection title="Change 2: Corpus Slabs — Small Corpuses Get Even More Freedom">
            <div className="overflow-x-auto rounded-2xl border border-slate-200 my-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="text-left px-4 py-3 font-semibold">Accumulated Corpus at Exit</th>
                    <th className="text-left px-4 py-3 font-semibold">What You Can Do</th>
                    <th className="text-left px-4 py-3 font-semibold text-amber-300">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {CORPUS_SLABS.map((row, i) => (
                    <tr key={row.corpus} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="px-4 py-3 font-medium text-slate-700">{row.corpus}</td>
                      <td className="px-4 py-3 text-slate-600">{row.option}</td>
                      <td className="px-4 py-3 text-amber-700 text-xs">{row.raised}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-slate-700 leading-relaxed text-sm">
              The logic: forcing a ₹6-lakh corpus into a 20% annuity would buy a pension of a few hundred rupees a month — pointless. Small savers now get clean, full payouts.
            </p>
          </ArticleSection>

          <ArticleSection title="Change 3: Exit After 15 Years — No More Waiting for 60">
            <p className="text-slate-700 leading-relaxed mb-4">
              <strong className="text-slate-900">Old rule:</strong> Normal exit required reaching age 60 or superannuation (government employees) — participation length was secondary.
            </p>
            <p className="text-slate-700 leading-relaxed mb-4">
              <strong className="text-slate-900">New rule:</strong> Normal exit is now available after <strong>15 years of participation or at age 60/superannuation, whichever comes first</strong> — with the full favourable lump-sum rules applying.
            </p>
            <Callout type="info">
              This matters most for those who joined NPS early (say, at 30) and have 15 years by 45 — they now have the option to exit with the same lump-sum flexibility rather than being locked until 60 regardless of participation length.
            </Callout>
          </ArticleSection>

          <ArticleSection title="Change 4: Stay Invested Until 85">
            <p className="text-slate-700 leading-relaxed mb-4">
              You can now remain invested and defer withdrawal/annuity purchase <strong className="text-slate-900">up to age 85</strong>, letting the corpus continue compounding.
            </p>
            <p className="text-slate-700 leading-relaxed mb-4">
              This is powerful for those who have other income streams in their 60s (rental income, NPS corpus from another account, pension, business). Letting the NPS corpus compound for an additional 10–20 years — while you spend down other assets first — can dramatically increase both the eventual lump sum and annuity quantum.
            </p>
          </ArticleSection>

          <ArticleSection title="Change 5: Systematic Lump Sum Withdrawal (SLW)">
            <p className="text-slate-700 leading-relaxed mb-4">
              Instead of taking your eligible lump sum at once, <strong className="text-slate-900">SLW</strong> pays it out in periodic instalments (like a reverse SIP) while the remaining balance stays invested. This addresses a genuine risk: a large lump sum in the hands of someone unfamiliar with investing can be lost to poor decisions, inflation erosion in a savings account, or family pressure.
            </p>
            <Callout type="success">
              <strong>SLW is one of the most underused features in NPS.</strong> It gives you cash flow without forcing a full exit — the undrawn balance keeps compounding inside NPS's low-cost structure.
            </Callout>
          </ArticleSection>

          <ArticleSection title="What Should You Actually Do With These Rules?">
            <div className="space-y-4 mb-4">
              {[
                { n: 1, title: "Don't reflexively take the maximum lump sum", body: "80% available doesn't mean 80% advisable — especially while the tax treatment of the extra 20% is unsettled. The annuity, for all its flaws, is longevity insurance: it pays even if you live to 100." },
                { n: 2, title: "Use deferral as sequencing power", body: "If other income covers your 60s, letting the corpus compound to 70+ can dramatically increase both your lump sum and your eventual annuity." },
                { n: 3, title: "Use SLW instead of a savings-account dump", body: "Phased withdrawal keeps the unwithdrawn balance working." },
                { n: 4, title: "Match the choice to your corpus slab", body: "Below ₹8 lakh, take the clean exit and redeploy deliberately. Above ₹12 lakh, the 80:20 split plus SLW plus deferral gives you a genuine toolkit — use it as one." },
                { n: 5, title: "Decide using your full retirement picture — not NPS in isolation", body: "Whether to annuitise 20% or 40%, exit at 60 or defer to 70, take lump sum or SLW — none of these questions can be answered without knowing your total required corpus, expenses, inflation outlook, and life expectancy." },
              ].map(item => (
                <div key={item.n} className="flex gap-4 bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs">{item.n}</span>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm mb-0.5">{item.title}</h4>
                    <p className="text-slate-700 text-sm leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </ArticleSection>

          <ArticleSection title="The Bigger Point: Flexible Rules Don't Fix an Uncalculated Retirement">
            <p className="text-slate-700 leading-relaxed mb-4">
              More flexibility means more decisions, and more decisions made on gut feel mean more ways to go wrong. An 80% lump sum in the hands of someone who has never calculated their 30-year requirement is not freedom — it's rope.
            </p>
            <p className="text-slate-700 leading-relaxed mb-4">
              The order of operations for a smart retiree is: <strong className="text-slate-900">first know your number, then choose your withdrawal strategy.</strong> How much do you need per month, inflated to your retirement date? For how many years? What must your corpus be, and what will NPS + EPF + investments actually deliver?
            </p>
          </ArticleSection>

          {/* FAQ */}
          <ArticleSection title="FAQ">
            <div className="space-y-5">
              {[
                { q: "What is the new 80:20 rule in NPS?", a: "Non-government subscribers with a corpus above ₹12 lakh can now take up to 80% of their NPS corpus as a lump sum at normal exit, with a minimum of 20% used to purchase an annuity — versus the earlier 60:40 split." },
                { q: "Is the 80% NPS lump sum fully tax-free?", a: "Not yet clearly. The existing income-tax exemption covers 60% of the corpus; the additional 20% permitted by the new PFRDA rules may be taxable until the tax law is amended. Plan conservatively and check the latest position before exiting." },
                { q: "Can I withdraw my full NPS corpus?", a: "Yes, if your accumulated corpus at normal exit is within the small-corpus threshold (raised to ₹8 lakh), you can withdraw 100% with no annuity requirement. Premature exits with corpus ≤ ₹5 lakh can also be taken in full." },
                { q: "Can I stay invested in NPS after 60?", a: "Yes — you can now remain invested and defer withdrawal/annuity purchase up to age 85, letting the corpus continue compounding." },
                { q: "What is Systematic Lump Sum Withdrawal (SLW) in NPS?", a: "Instead of taking your eligible lump sum at once, SLW pays it out in periodic instalments (like a reverse SIP) while the remaining balance stays invested." },
                { q: "When can I exit NPS without penalty?", a: "Normal exit is now available after 15 years of participation or at age 60/superannuation, whichever comes first — with the full favourable lump-sum rules." },
              ].map(item => (
                <div key={item.q} className="border-b border-slate-200 pb-5 last:border-0 last:pb-0">
                  <h3 className="font-semibold text-slate-900 mb-2">{item.q}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </ArticleSection>

          <NewsletterWidget source="blog-nps-withdrawal-rules-2026" />

          {/* CTA */}
          <div className="bg-gradient-to-r from-amber-800 to-slate-900 rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-3">The New NPS Rules Give You the Steering Wheel. Get the Map.</h2>
            <p className="text-amber-100 mb-2">Model your NPS corpus as part of the whole picture, see year-wise projections, and test scenarios.</p>
            <p className="text-amber-200 text-sm mb-6">Free. No login required. Every assumption is yours to see, edit and save.</p>
            <Link href="/free-plan" className="inline-block bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-8 py-3 rounded-full transition-colors">
              Calculate My Retirement Number →
            </Link>
          </div>

          {/* Related Articles */}
          <div className="mt-12 pt-10 border-t border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-5">Related Articles</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { slug: "nps-vs-ups-vs-ops-which-is-better", title: "NPS vs UPS vs OPS: Which Pension Scheme Is Actually Better?", tag: "Government Pension", tagColor: "text-slate-600", gradient: "from-slate-700 to-slate-900" },
                { slug: "nps-vs-ppf-vs-sip", title: "NPS vs PPF vs Mutual Fund SIP: Which Builds the Biggest Corpus?", tag: "Investment Guide", tagColor: "text-emerald-600", gradient: "from-emerald-600 to-teal-700" },
                { slug: "how-much-money-to-retire-in-india", title: "How Much Money Do I Need to Retire in India?", tag: "Retirement Basics", tagColor: "text-orange-600", gradient: "from-orange-500 to-red-600" },
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
