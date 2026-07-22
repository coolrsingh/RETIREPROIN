import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import BrandLogo from "@/components/brand-logo";
import { usePageMeta } from "@/hooks/usePageMeta";
import NewsletterWidget from "@/components/newsletter-widget";

const ARTICLE_META = {
  headline: "Retirement Planning for Self-Employed Indians: The Complete Guide Nobody Wrote for You",
  description: "No EPF. No employer. No pension. Self-employed Indians must build retirement alone. Complete guide: NPS, PPF, APY, mutual funds, how much you need, and the corpus calculation most business owners never do.",
  datePublished: "2026-07-22",
  dateModified: "2026-07-22",
  slug: "retirement-planning-self-employed-india",
  readTime: "12 min read",
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

export default function Blog8() {
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
      <div className="bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block bg-white/15 text-blue-200 text-sm font-semibold px-3 py-1 rounded-full mb-6">
              Self-Employed · {ARTICLE_META.readTime}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
              Retirement Planning for Self-Employed Indians
            </h1>
            <p className="text-blue-100 text-lg leading-relaxed mb-6">
              No EPF. No employer contribution. No gratuity. No pension. Every rupee of your retirement must be consciously created by you — or it simply won't exist.
            </p>
            <div className="flex items-center gap-3 text-sm text-blue-300">
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
          <StatBox number="₹0" label="EPF, employer match, or gratuity available to you" />
          <StatBox number="8–9 Cr" label="APY enrolments — a signal of how many Indians work outside formal pensions" />
          <StatBox number="₹50K" label="Extra NPS tax deduction under 80CCD(1B) — unique to NPS" />
        </div>
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }}>

          <p className="text-lg text-slate-700 leading-relaxed mb-8 italic border-l-4 border-blue-500 pl-4">
            If you're a salaried employee in India, retirement savings happen to you automatically: EPF is deducted before you see your salary, your employer matches it, and gratuity accumulates silently. If you're self-employed — a shop owner, doctor, freelancer, consultant, trader, gig worker, or founder — <strong>none of that exists</strong>.
          </p>

          <ArticleSection title="Why Retirement Planning Is Harder — and More Urgent — When You're Self-Employed">
            <div className="space-y-4 mb-6">
              {[
                { emoji: "📈", title: "Irregular income breaks the standard advice", body: '"Invest ₹25,000 every month" assumes a salary. Your reality might be ₹3 lakh in a good month and ₹40,000 in a lean one. Discipline structures must be designed around volatility, not pretend it away.' },
                { emoji: "🏪", title: "The business feels like the retirement plan", body: '"My business/shop/practice is my pension" is the most dangerous sentence in self-employed finance. Businesses face competition, disruption, health-dependence and succession risk. A retirement plan that requires your business to thrive for 40 more years is a hope, not a plan.' },
                { emoji: "⏳", title: "No forced deadline", body: "Salaried people face mandatory retirement at 58–60, which forces planning. The self-employed tell themselves 'I'll just work longer' — until health, market shifts, or family circumstances decide otherwise. Studies consistently find many people stop working earlier than planned, involuntarily." },
                { emoji: "💰", title: "Money left in the business feels productive", body: "Every rupee pulled out for retirement feels like fuel taken from growth. So withdrawal for personal investing keeps getting postponed — for decades." },
              ].map(item => (
                <div key={item.title} className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                  <h3 className="font-bold text-slate-900 mb-2">{item.emoji} {item.title}</h3>
                  <p className="text-slate-700 text-sm leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </ArticleSection>

          <ArticleSection title="Your Retirement Toolbox: Every Instrument Available to Self-Employed Indians">
            <div className="space-y-5 mb-4">
              {[
                {
                  name: "NPS — the closest thing to a self-made EPF",
                  color: "border-amber-400 bg-amber-50",
                  content: "Open to any Indian citizen, including the self-employed. You invest at your own pace into a mix of equity, corporate bonds and government securities managed by professional fund managers at extremely low cost. Tax deduction up to ₹1.5 lakh under 80CCD(1) within the 80C limit, plus an exclusive additional ₹50,000 under 80CCD(1B) — a benefit unique to NPS. Money is locked till exit, which converts your inconsistent motivation into consistent behaviour.",
                },
                {
                  name: "PPF — the guaranteed-return anchor",
                  color: "border-emerald-400 bg-emerald-50",
                  content: "₹1.5 lakh/year maximum. 15-year lock-in (extendable). Returns currently around 7.1% p.a., government-guaranteed and exempt from income tax entirely — contribution, interest, and maturity are all tax-free. Its main value is as the safe, predictable layer in a multi-instrument strategy.",
                },
                {
                  name: "APY — a pension floor, not a plan",
                  color: "border-blue-300 bg-blue-50",
                  content: "Available to Indians aged 18–40 with a bank account. Guarantees a fixed pension of ₹1,000–₹5,000/month from age 60, depending on contribution amount and age at enrolment. Government co-contribution was available for five years from launch (now expired for most). APY is not a standalone plan — ₹5,000/month is a floor, not a livelihood.",
                },
                {
                  name: "Equity Mutual Fund SIPs — the growth engine",
                  color: "border-purple-300 bg-purple-50",
                  content: "For a 25–40 year investment horizon, equity mutual funds have historically delivered 12–15% CAGR — well above inflation. ELSS funds additionally provide 80C deduction. For a self-employed person, a SIP is disciplined savings forced by standing instruction, independent of your business performance.",
                },
                {
                  name: "Health Insurance — the non-negotiable foundation",
                  color: "border-red-300 bg-red-50",
                  content: "Medical costs in old age, at 10–14% annual inflation, are the biggest destroyer of retirement plans. A comprehensive family floater of ₹25–50 lakh, with a super-top-up for hospitalisation above the base, is not optional — it's the wall that protects your corpus from a single health event wiping out years of savings.",
                },
              ].map(item => (
                <div key={item.name} className={`rounded-xl p-5 border-l-4 ${item.color}`}>
                  <h3 className="font-bold text-slate-900 mb-2">{item.name}</h3>
                  <p className="text-sm text-slate-700 leading-relaxed">{item.content}</p>
                </div>
              ))}
            </div>
          </ArticleSection>

          <ArticleSection title="The Self-Employed Strategy Stack">
            <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-2xl p-8 text-white my-6">
              <h3 className="text-lg font-bold mb-5 text-blue-300">How to layer your instruments</h3>
              <div className="space-y-3">
                {[
                  { layer: "Floor", instrument: "APY (if eligible) + annuity portion of NPS", desc: "Guaranteed monthly income, regardless of market" },
                  { layer: "Core", instrument: "NPS (with ₹50K extra tax break)", desc: "Discipline + long-term growth + tax efficiency" },
                  { layer: "Safety", instrument: "PPF", desc: "Guaranteed returns, fully tax-free, 15-yr lock-in" },
                  { layer: "Growth", instrument: "Equity mutual fund SIPs", desc: "Beat inflation significantly over 20–30 years" },
                  { layer: "Protection", instrument: "Comprehensive health insurance", desc: "Prevent one hospitalisation from wiping out the corpus" },
                ].map(item => (
                  <div key={item.layer} className="flex gap-4 border-b border-white/10 pb-3 last:border-0 last:pb-0">
                    <span className="flex-shrink-0 text-xs font-bold text-blue-300 w-16 pt-0.5 uppercase tracking-wide">{item.layer}</span>
                    <div>
                      <p className="font-semibold text-white text-sm">{item.instrument}</p>
                      <p className="text-slate-300 text-xs">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Callout type="warning">
              <strong>Separate business and personal wealth ruthlessly.</strong> Money that stays in the business is business risk. Retirement money must live outside it, in your name, in liquid instruments. This is the discipline most self-employed people struggle with most — and it determines whether they retire wealthy or dependent.
            </Callout>
          </ArticleSection>

          <ArticleSection title="The Calculation That Decides Everything">
            <p className="text-slate-700 leading-relaxed mb-4">
              Without an employer's pension statement arriving annually, the self-employed have <strong className="text-slate-900">no external mirror</strong> showing whether they're on track. So most operate on a vague feeling — "the business is doing well, I'm fine" — that has never been tested against arithmetic.
            </p>
            <p className="text-slate-700 leading-relaxed mb-4">
              The arithmetic is unforgiving. Spend ₹75,000/month today at age 35? At 6% inflation, that lifestyle costs about ₹3.2 lakh/month at 60, and funding it to age 90 needs a corpus in the region of <strong className="text-slate-900">₹10–12 crore</strong> — of which your business sale, property, and APY will realistically cover only a slice. The gap must come from deliberate, invested savings, and every year of delay raises the required monthly amount steeply.
            </p>
            <Callout type="info">
              <strong>Being self-employed means nobody is coming to plan your retirement for you.</strong> The owners who retire wealthy aren't the ones who earned the most; they're the ones who calculated early, knew their number, and paid their future self like a non-negotiable vendor.
            </Callout>
          </ArticleSection>

          {/* FAQ */}
          <ArticleSection title="FAQ">
            <div className="space-y-5">
              {[
                { q: "Can self-employed people open NPS in India?", a: "Yes — NPS is open to all Indian citizens including the self-employed, with an exclusive extra ₹50,000 tax deduction under Section 80CCD(1B) beyond the 80C limit." },
                { q: "Is APY enough for retirement?", a: "No. APY guarantees at most ₹5,000/month from 60 — a useful floor for low-income unorganised workers, but decades of inflation make it far too small as a standalone retirement plan." },
                { q: "How much should a self-employed person save for retirement?", a: "As a starting discipline, 15–25% of every payment received — but the correct answer comes from calculating your target corpus from your own expenses, inflation and life expectancy, then working backwards." },
                { q: "What is the best retirement scheme without EPF?", a: "There's no single scheme — the effective approach layers NPS (discipline + tax), PPF (safety), equity mutual fund SIPs (growth), and robust health insurance (protection), sized against a properly calculated corpus target." },
                { q: "Should I count my business as my retirement fund?", a: "Treat any future sale value as a bonus, not the plan. Businesses carry succession, market and health risks — your core retirement corpus should be liquid, diversified and outside the business." },
              ].map(item => (
                <div key={item.q} className="border-b border-slate-200 pb-5 last:border-0 last:pb-0">
                  <h3 className="font-semibold text-slate-900 mb-2">{item.q}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </ArticleSection>

          <NewsletterWidget source="blog-self-employed-retirement" />

          {/* CTA */}
          <div className="bg-gradient-to-r from-blue-800 to-slate-900 rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-3">Calculate the Gap — Before It's Too Late to Fix</h2>
            <p className="text-blue-100 mb-2">Know your target corpus, your current trajectory, and the monthly savings needed to close the gap.</p>
            <p className="text-blue-200 text-sm mb-6">Free. No login required. Every assumption is yours to set.</p>
            <Link href="/free-plan" className="inline-block bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-8 py-3 rounded-full transition-colors">
              Start My Retirement Plan →
            </Link>
          </div>

          {/* Related Articles */}
          <div className="mt-12 pt-10 border-t border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-5">Related Articles</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { slug: "how-much-money-to-retire-in-india", title: "How Much Money Do I Need to Retire in India?", tag: "Retirement Basics", tagColor: "text-orange-600", gradient: "from-orange-500 to-red-600" },
                { slug: "nps-vs-ppf-vs-sip", title: "NPS vs PPF vs Mutual Fund SIP: Which Builds the Biggest Corpus?", tag: "Investment Guide", tagColor: "text-emerald-600", gradient: "from-emerald-600 to-teal-700" },
                { slug: "why-indians-fail-retirement", title: "Why Most Indians Fail to Plan for Retirement", tag: "Retirement Basics", tagColor: "text-blue-600", gradient: "from-blue-600 to-indigo-700" },
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
