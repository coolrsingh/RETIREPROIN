import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import BrandLogo from "@/components/brand-logo";
import { usePageMeta } from "@/hooks/usePageMeta";
import NewsletterWidget from "@/components/newsletter-widget";

const ARTICLE_META = {
  headline: "How Much Money Do I Need to Retire in India? (The Honest Answer Nobody Gives You)",
  description: "₹1 crore? ₹5 crore? ₹10 crore? Learn how to calculate your actual retirement corpus in India — with the formula, real examples, common mistakes, and why generic numbers mislead you.",
  datePublished: "2026-07-22",
  dateModified: "2026-07-22",
  slug: "how-much-money-to-retire-in-india",
  readTime: "11 min read",
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

const CORPUS_TABLE = [
  { expense: "₹30,000", lifestyle: "Minimalist", corpus: "₹4.5–5.5 Cr" },
  { expense: "₹50,000", lifestyle: "Basic", corpus: "₹7.5–9 Cr" },
  { expense: "₹75,000", lifestyle: "Comfortable", corpus: "₹11–13 Cr" },
  { expense: "₹1,00,000", lifestyle: "Premium", corpus: "₹15–18 Cr" },
  { expense: "₹2,00,000", lifestyle: "Luxurious", corpus: "₹30–35 Cr" },
];

export default function Blog7() {
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
      <div style={{ background: "linear-gradient(135deg, #7C2D12 0%, #9A3412 40%, #0F172A 100%)" }} className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block bg-orange-300/20 text-orange-200 text-sm font-semibold px-3 py-1 rounded-full mb-6 border border-orange-300/30">
              Retirement Basics · {ARTICLE_META.readTime}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6 text-white">
              How Much Money Do I Need to Retire in India?
            </h1>
            <p className="text-orange-100/90 text-lg leading-relaxed mb-6">
              ₹1 crore? ₹5 crore? ₹10 crore? The honest answer is: there is no universal number. Your corpus depends on your expenses, city, retirement age, and life expectancy. Here's how to calculate yours.
            </p>
            <div className="flex items-center gap-3 text-sm text-orange-300">
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
          <StatBox number="2×" label="Prices roughly double every 12 years at 6% inflation" />
          <StatBox number="30 yrs" label="Retirement you must fund if you retire at 60 and live to 90" />
          <StatBox number="40–50%" label="How much you understate corpus when planning to 75 instead of 90" />
        </div>
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }}>

          <p className="text-lg text-slate-700 leading-relaxed mb-8 italic border-l-4 border-amber-500 pl-4">
            Ask ten people "how much money do I need to retire in India?" and you'll get ten confident answers: "₹1 crore is enough." "You need at least ₹5 crore." "In a metro? Nothing less than ₹10 crore." All ten are wrong — not because the numbers are too high or too low, but because <strong>there is no universal retirement number</strong>.
          </p>

          <ArticleSection title="First, Understand What a 'Retirement Corpus' Actually Is">
            <p className="text-slate-700 leading-relaxed mb-4">
              Your retirement corpus is the total amount of money you must have on the day you stop working, so that it can pay your expenses for <strong className="text-slate-900">every remaining year of your life</strong> — with no salary coming in.
            </p>
            <p className="text-slate-700 leading-relaxed mb-4">
              Think of it as a water tank. While you work, you're filling the tank. The day you retire, the tap of income closes, and the tank must supply water (money) every single month until the end. If the tank runs dry at 80 and you live to 90, those last ten years are a crisis. That's the entire problem retirement planning solves.
            </p>
          </ArticleSection>

          <ArticleSection title="The Three Forces That Decide Your Number">
            <div className="space-y-5 mb-6">
              {[
                {
                  number: "1",
                  title: "Your monthly expenses today",
                  body: "Not your salary — your spending. A family spending ₹60,000/month needs a very different corpus than one spending ₹1,50,000/month. Count everything: groceries, rent or society maintenance, utilities, fuel, insurance premiums, medicines, travel, festivals, family support. Most people underestimate this by 20–30% because they forget annual and irregular costs.",
                },
                {
                  number: "2",
                  title: "Inflation — the silent multiplier",
                  body: "Inflation means the same lifestyle costs more every year. At 6% inflation, prices roughly double every 12 years. So if you're 32 and spend ₹60,000/month today, the same lifestyle at age 60 will cost around ₹3,00,000/month. Medical inflation runs even higher — often 10–14% — and healthcare is exactly the expense that grows as you age.",
                },
                {
                  number: "3",
                  title: "How long retirement lasts — life expectancy",
                  body: "If you retire at 60 and live to 90 — increasingly common with modern healthcare — you must fund 30 years of life with zero salary. Planning to age 75 instead of 90 can understate your corpus by 40–50%. When in doubt, plan longer: running out of money at 82 is not an acceptable failure mode.",
                },
              ].map(item => (
                <div key={item.number} className="flex gap-4 bg-slate-50 rounded-xl p-5 border border-slate-200">
                  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-sm">
                    {item.number}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1.5">{item.title}</h3>
                    <p className="text-sm text-slate-700 leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </ArticleSection>

          <ArticleSection title="The Simple Framework">
            <div className="bg-gradient-to-br from-slate-900 to-amber-950 rounded-2xl p-8 text-white my-6">
              <h3 className="text-lg font-bold mb-5 text-amber-300">Step-by-step (example: age 32, ₹60,000/month, retiring at 60)</h3>
              <div className="space-y-4">
                {[
                  { step: "Step 1", title: "Project expenses to retirement day", detail: "₹60,000 × (1.06)²⁸ ≈ ₹3,06,000/month at retirement" },
                  { step: "Step 2", title: "Estimate annual expense in retirement", detail: "₹3,06,000 × 12 ≈ ₹36.8 lakh/year in year 1" },
                  { step: "Step 3", title: "Fund all retirement years", detail: "Account for post-retirement returns and rising costs — this is where a calculator beats a back-of-envelope" },
                ].map(item => (
                  <div key={item.step} className="flex gap-4">
                    <span className="flex-shrink-0 text-amber-400 font-bold text-sm w-14">{item.step}</span>
                    <div>
                      <p className="font-semibold text-white text-sm">{item.title}</p>
                      <p className="text-slate-300 text-sm">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ArticleSection>

          <ArticleSection title="Rough Corpus Reference by Lifestyle">
            <p className="text-slate-700 leading-relaxed mb-4 text-sm italic">
              Assuming ~28 years to retirement, 6% inflation, 8% post-retirement return. Your actual number will differ — which is exactly why you must calculate, not copy.
            </p>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="text-left px-4 py-3 font-semibold">Today's Monthly Expense</th>
                    <th className="text-left px-4 py-3 font-semibold">Lifestyle</th>
                    <th className="text-left px-4 py-3 font-semibold text-amber-300">Approx. Corpus Needed at 60</th>
                  </tr>
                </thead>
                <tbody>
                  {CORPUS_TABLE.map((row, i) => (
                    <tr key={row.expense} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="px-4 py-3 font-medium text-slate-700">{row.expense}</td>
                      <td className="px-4 py-3 text-slate-600">{row.lifestyle}</td>
                      <td className="px-4 py-3 font-bold text-amber-700">{row.corpus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Callout type="warning">
              <strong>There is no table on the internet that contains your answer.</strong> Every combination of age, expense, city, and timeline is different. The table above is a starting orientation — your real number requires calculation with your own inputs.
            </Callout>
          </ArticleSection>

          <ArticleSection title="The 5 Mistakes That Quietly Destroy Retirement Plans">
            <div className="space-y-3 mb-6">
              {[
                { n: 1, title: "Using today's expenses as retirement expenses", body: "Ignoring inflation is the #1 error — it understates the target by 3–5x." },
                { n: 2, title: "Planning to a low life expectancy", body: "Your grandfather's 72 is not your 90. Longevity rises every decade." },
                { n: 3, title: "Counting the house you live in as retirement money", body: "You can't sell 10% of your bedroom to buy groceries. Only liquid, investable assets count." },
                { n: 4, title: "Ignoring medical costs", body: "Health expenses don't just continue in old age — they accelerate, at a higher inflation rate than everything else." },
                { n: 5, title: "Assuming 'I'm on track' without ever checking", body: "Having an SIP is not the same as having enough SIP. Most people have never once compared their projected corpus against their required corpus." },
              ].map(item => (
                <div key={item.n} className="flex gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-xs">{item.n}</span>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm mb-0.5">{item.title}</h4>
                    <p className="text-slate-700 text-sm leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </ArticleSection>

          <ArticleSection title="Why You Must Calculate — Not Assume — Your Number">
            <p className="text-slate-700 leading-relaxed mb-4">
              When you actually calculate, one of two things happens. Either you discover you're on track — and gain genuine peace of mind that no amount of guessing can give. Or you discover a gap — say, you need ₹6.9 Cr and you're headed for ₹4.5 Cr. That ₹2.4 Cr gap, discovered at 32, is <strong className="text-slate-900">easily fixable</strong>: a step-up SIP, a small expense adjustment, one extra working year. The same gap discovered at 55 is a life-altering crisis.
            </p>
            <Callout type="info">
              <strong>The difference between those two outcomes isn't income or luck.</strong> It's simply whether you calculated early or assumed for too long.
            </Callout>
          </ArticleSection>

          {/* FAQ */}
          <ArticleSection title="FAQ">
            <div className="space-y-5">
              {[
                { q: "Is ₹1 crore enough to retire in India?", a: "For most urban households, no. ₹1 crore generates roughly ₹50,000–65,000/month at conservative withdrawal rates today — and inflation halves that purchasing power every 12 years. It may work only for very frugal lifestyles in low-cost towns, or alongside pension income." },
                { q: "Is ₹5 crore enough to retire at 60?", a: "It depends entirely on your expenses and lifespan. ₹5 crore can support roughly ₹1.2–1.5 lakh/month of retirement-day expenses over 30 years — enough for some families, insufficient for others. Calculate with your own numbers." },
                { q: "What is the 30x rule of retirement?", a: "A thumb rule: you need roughly 30 times your expected annual expenses at retirement as corpus. Useful as a sanity check, but it ignores your specific inflation, returns, and lifespan — use a full calculator for your real number." },
                { q: "How much should I invest monthly to retire comfortably?", a: "Work backwards from your target corpus. As a reference frame for a ₹5 Cr target by 60: roughly ₹15K/month starting at 25, ₹24K at 30, ₹40K at 35, and ₹95K at 45 — delay is expensive." },
                { q: "Which retirement calculator is best for India?", a: "Use one built for Indian conditions (rupee inflation, EPF/NPS/SIP context) that lets you edit every assumption rather than hiding them — RetirePro.in is free, needs no login, and shows year-wise projections." },
              ].map(item => (
                <div key={item.q} className="border-b border-slate-200 pb-5 last:border-0 last:pb-0">
                  <h3 className="font-semibold text-slate-900 mb-2">{item.q}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </ArticleSection>

          <NewsletterWidget source="blog-how-much-retire-india" />

          {/* CTA */}
          <div className="bg-gradient-to-r from-orange-700 to-slate-900 rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-3">Calculate Your Actual Retirement Number</h2>
            <p className="text-orange-100 mb-2">No guessing. No generic tables. Your expenses, your inflation, your life expectancy.</p>
            <p className="text-orange-200 text-sm mb-6">Free. No login required. See your year-wise projection in 5 minutes.</p>
            <Link href="/free-plan" className="inline-block bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-8 py-3 rounded-full transition-colors">
              Find My Number Now →
            </Link>
          </div>

          {/* Related Articles */}
          <div className="mt-12 pt-10 border-t border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-5">Related Articles</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { slug: "why-indians-fail-retirement", title: "Why Most Indians Fail to Plan for Retirement", tag: "Retirement Basics", tagColor: "text-blue-600", gradient: "from-blue-600 to-indigo-700" },
                { slug: "nps-vs-ups-vs-ops-which-is-better", title: "NPS vs UPS vs OPS: Which Pension Scheme Is Better?", tag: "Government Pension", tagColor: "text-slate-600", gradient: "from-slate-700 to-slate-900" },
                { slug: "nps-vs-ppf-vs-sip", title: "NPS vs PPF vs Mutual Fund SIP: Which Builds the Biggest Corpus?", tag: "Investment Guide", tagColor: "text-emerald-600", gradient: "from-emerald-600 to-teal-700" },
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
