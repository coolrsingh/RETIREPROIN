import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, AlertTriangle, CheckCircle, HeartPulse, TrendingUp } from "lucide-react";
import BrandLogo from "@/components/brand-logo";
import { usePageMeta } from "@/hooks/usePageMeta";
import NewsletterWidget from "@/components/newsletter-widget";
import BlogShare from "@/components/blog-share";

const ARTICLE_META = {
  headline: "Retirement Planning in India: 7 Smart Ways to Make Your Money Last",
  description:
    "A practical guide to retirement planning in India: estimate future expenses, build the right asset allocation, use mutual funds and SWP thoughtfully, plan healthcare, and protect your retirement income.",
  datePublished: "2026-08-26",
  dateModified: "2026-08-26",
  slug: "retirement-planning-in-india-7-smart-ways-to-make-your-money-last",
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

function Callout({
  type,
  children,
}: {
  type: "warning" | "success" | "info";
  children: React.ReactNode;
}) {
  const config = {
    warning: {
      bg: "bg-amber-50 border-amber-300",
      icon: <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />,
    },
    success: {
      bg: "bg-emerald-50 border-emerald-300",
      icon: <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />,
    },
    info: {
      bg: "bg-blue-50 border-blue-300",
      icon: <TrendingUp className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />,
    },
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
          <tr className="bg-slate-900 text-white">
            {headers.map(header => (
              <th key={header} className="text-left px-4 py-3 font-semibold whitespace-nowrap">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50"}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3 text-slate-600">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatBox({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center p-5 bg-slate-900 rounded-2xl text-white">
      <div className="text-2xl sm:text-3xl font-bold text-blue-400 mb-1">{number}</div>
      <div className="text-xs sm:text-sm text-slate-300 leading-snug">{label}</div>
    </div>
  );
}

const RELATED = [
  {
    slug: "how-much-money-to-retire-in-india",
    title: "How Much Money Do I Need to Retire in India? The Honest Answer",
    tag: "Retirement Basics",
    tagColor: "text-orange-600",
    gradient: "from-red-900 via-orange-800 to-slate-900",
  },
  {
    slug: "nps-vs-ppf-vs-sip",
    title: "NPS vs PPF vs Mutual Fund SIP: Which Builds the Biggest Corpus?",
    tag: "Investment Guide",
    tagColor: "text-emerald-600",
    gradient: "from-emerald-600 to-teal-700",
  },
  {
    slug: "best-retirement-planning-tool-india",
    title: "The Single Best Tool to Fix India's Looming Retirement Crisis",
    tag: "Retirement Planning",
    tagColor: "text-blue-600",
    gradient: "from-slate-900 via-blue-950 to-indigo-900",
  },
];

export default function Blog14() {
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <BrandLogo textClassName="text-slate-800" />
          <Link
            href="/free-plan"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1"
          >
            Free Calculator <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <div
        style={{ background: "linear-gradient(135deg, #1D4ED8 0%, #3730A3 48%, #0F172A 100%)" }}
        className="py-16 px-4"
      >
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block bg-blue-300/20 text-blue-100 text-sm font-semibold px-3 py-1 rounded-full mb-6 border border-blue-200/30">
              Retirement Planning · {ARTICLE_META.readTime}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6 text-white">
              {ARTICLE_META.headline}
            </h1>
            <p className="text-blue-100/90 text-lg leading-relaxed mb-6">
              Retirement is not just the day your salary stops. It is the 25 or 30 years
              after that — when inflation, healthcare and changing family needs still have
              to be paid for. Here is a practical way to make your money last.
            </p>
            <div className="flex items-center gap-3 text-sm text-blue-200">
              <span>RetirePro Editorial</span>
              <span>·</span>
              <time dateTime={ARTICLE_META.datePublished}>26 Aug 2026</time>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="bg-slate-900 py-8 px-4">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-3 sm:gap-4">
          <StatBox number="25–30 yrs" label="A retirement can last after you stop working" />
          <StatBox number="6%" label="Illustrative inflation rate used in our examples" />
          <StatBox number="₹1 Cr" label="Example corpus used to explain retirement income" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 lg:grid lg:grid-cols-[1fr_260px] lg:items-start lg:gap-12">
        <article className="max-w-3xl">
          <BlogShare title={ARTICLE_META.headline} slug={ARTICLE_META.slug} className="mb-8 lg:hidden" />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <p className="text-lg text-slate-700 leading-relaxed mb-8 italic border-l-4 border-blue-500 pl-4">
              Most people think retirement planning means finding a large enough number:
              ₹1 crore, ₹3 crore, maybe ₹5 crore. But a corpus is not a trophy you reach.
              It is the money that has to buy your groceries, medicines, electricity and
              small joys for the rest of your life.
            </p>

            <Callout type="success">
              <strong>Quick answer:</strong> A durable retirement plan does three jobs:
              it builds a retirement corpus, creates regular retirement income, and
              protects your purchasing power against inflation. Use our{" "}
              <Link href="/free-plan" className="underline font-semibold">
                free retirement calculator for India
              </Link>{" "}
              to see your own numbers before choosing an investment product.
            </Callout>

            <ArticleSection title="1. Calculate Future Expenses, Not Today's Expenses">
              <p className="text-slate-700 leading-relaxed mb-4">
                Suppose your household spends <strong>₹60,000 per month</strong> today.
                That is ₹7.2 lakh a year, but it is not the amount you should use for
                retirement if you are still 10, 15 or 20 years away.
              </p>
              <p className="text-slate-700 leading-relaxed mb-4">
                At an illustrative 6% annual inflation, the same lifestyle could cost
                approximately this much:
              </p>
              <DataTable
                headers={["Years from today", "Estimated monthly expense"]}
                rows={[
                  ["Today", "₹60,000"],
                  ["5 years", "₹80,000"],
                  ["10 years", "₹1.07 lakh"],
                  ["15 years", "₹1.44 lakh"],
                  ["20 years", "₹1.92 lakh"],
                  ["25 years", "₹2.58 lakh"],
                ]}
              />
              <p className="text-slate-700 leading-relaxed">
                This is why a retirement corpus calculator should begin with your
                expenses and retirement date, not your salary alone. Add the annual
                expenses people often forget: insurance premiums, travel, gifts,
                repairs, festivals and support for family.
              </p>
              <Callout type="warning">
                <strong>The uncomfortable truth:</strong> if you plan with today's
                ₹60,000 expense instead of your retirement-day expense, your target
                corpus can look reassuringly small — right up until you need it.
              </Callout>
            </ArticleSection>

            <ArticleSection title="2. Give Every Part of Your Retirement Portfolio a Job">
              <p className="text-slate-700 leading-relaxed mb-5">
                After retirement, there is no prize for owning the most products. Your
                investments should be organised around when you will need the money.
              </p>
              <div className="space-y-4">
                {[
                  {
                    title: "Short-term money: the next 2–3 years",
                    body: "Keep near-term expenses liquid and stable. This bucket is there so a bad market month does not force you to sell growth assets at the wrong time.",
                    tone: "bg-blue-50 border-blue-200",
                  },
                  {
                    title: "Medium-term money: the following several years",
                    body: "Use an appropriate mix of fixed income and hybrid investments based on your withdrawal needs and risk tolerance. The aim is dependable cash flow, not the highest possible return.",
                    tone: "bg-slate-50 border-slate-200",
                  },
                  {
                    title: "Long-term money: 10 years and beyond",
                    body: "Money you will not need for a decade may need some diversified equity exposure to keep up with inflation. The right allocation depends on your age, pension, corpus and capacity for risk.",
                    tone: "bg-emerald-50 border-emerald-200",
                  },
                ].map(bucket => (
                  <div key={bucket.title} className={`border rounded-xl p-5 ${bucket.tone}`}>
                    <h3 className="font-bold text-slate-900 mb-1.5">{bucket.title}</h3>
                    <p className="text-sm text-slate-700 leading-relaxed">{bucket.body}</p>
                  </div>
                ))}
              </div>
              <p className="text-slate-700 leading-relaxed mt-5">
                Think of this as asset allocation for retirement: equity mutual funds
                for long-term growth, debt or fixed income for stability, and liquid
                reserves for the years immediately ahead.
              </p>
            </ArticleSection>

            <ArticleSection title="3. Build Retirement Income, Not Just a Retirement Corpus">
              <p className="text-slate-700 leading-relaxed mb-4">
                Reaching a corpus target is only half the job. The next question is
                practical: how will that money reach your bank account every month?
              </p>
              <p className="text-slate-700 leading-relaxed mb-4">
                A <strong>Systematic Withdrawal Plan (SWP)</strong> can help you redeem
                mutual fund units periodically to meet your cash-flow needs. For
                example, a ₹1 crore corpus with a ₹50,000 monthly withdrawal means:
              </p>
              <DataTable
                headers={["Calculation", "Amount"]}
                rows={[
                  ["Monthly withdrawal", "₹50,000"],
                  ["Annual withdrawal", "₹6 lakh"],
                  ["Initial withdrawal rate", "6% of ₹1 crore"],
                ]}
              />
              <Callout type="info">
                <strong>Important:</strong> an SWP is not interest. The cash comes from
                redeeming mutual fund units. Whether the income lasts depends on
                portfolio returns, withdrawals, inflation, taxes and market conditions.
              </Callout>
              <p className="text-slate-700 leading-relaxed">
                This is also why the “best mutual fund for retirement” is not a useful
                question in isolation. The better question is whether your investment
                mix, withdrawal rate and time horizon can work together.
              </p>
            </ArticleSection>

            <ArticleSection title="4. Understand What a ₹1 Crore Retirement Corpus Can — and Cannot — Do">
              <p className="text-slate-700 leading-relaxed mb-4">
                ₹1 crore sounds like a finish line until you map the expenses it must
                fund. If retirement expenses start at ₹6 lakh a year and rise by 6%
                annually, the cash requirement can look like this:
              </p>
              <DataTable
                headers={["Retirement year", "Illustrative annual expense"]}
                rows={[
                  ["1", "₹6.0 lakh"],
                  ["5", "₹7.6 lakh"],
                  ["10", "₹10.1 lakh"],
                  ["15", "₹13.6 lakh"],
                  ["20", "₹18.3 lakh"],
                  ["25", "₹24.3 lakh"],
                ]}
              />
              <p className="text-slate-700 leading-relaxed mb-4">
                You begin by withdrawing ₹6 lakh. Twenty-five years later, you may
                need more than ₹24 lakh a year to maintain a similar lifestyle. That
                is the retirement income challenge in one table.
              </p>
              <p className="text-slate-700 leading-relaxed">
                Do not treat ₹1 crore, ₹5 crore or any other round number as a universal
                answer. Your actual retirement corpus depends on current expenses,
                inflation, retirement age, life expectancy, returns, pension income,
                healthcare and the lifestyle you want.
              </p>
            </ArticleSection>

            <ArticleSection title="5. Keep Healthcare Out of the “We'll Manage” Category">
              <p className="text-slate-700 leading-relaxed mb-4">
                Regular expenses are usually predictable. A hospitalisation is not.
                One large medical bill can turn an apparently comfortable retirement
                plan into a stressful one, especially when the portfolio is already
                being used for monthly withdrawals.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mb-5">
                <div className="flex gap-3 bg-rose-50 border border-rose-200 rounded-xl p-4">
                  <HeartPulse className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Protect first</h3>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      Review health insurance, waiting periods, room-rent limits and
                      coverage for both partners before retirement.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <CheckCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Reserve separately</h3>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      Maintain an emergency fund and a healthcare reserve rather than
                      assuming your monthly SWP will cover every surprise.
                    </p>
                  </div>
                </div>
              </div>
              <Callout type="warning">
                <strong>Retirement planning is incomplete without healthcare
                planning.</strong> Medical inflation may move faster than general
                inflation, so review this part of your plan every year.
              </Callout>
            </ArticleSection>

            <ArticleSection title="6. Reduce Risk Without Removing Growth Completely">
              <p className="text-slate-700 leading-relaxed mb-4">
                “I am retired, so I should have zero equity” sounds safe. But a
                60-year-old may still have a 30-year investment horizon. Keeping every
                rupee in low-growth assets for three decades can quietly reduce
                purchasing power.
              </p>
              <p className="text-slate-700 leading-relaxed mb-4">
                The opposite extreme — putting the entire retirement corpus into
                equity — can make monthly income vulnerable to a market fall. A
                diversified retirement portfolio may combine:
              </p>
              <ul className="space-y-2 mb-5">
                {[
                  "Equity mutual funds for long-term growth",
                  "Debt and fixed-income investments for stability",
                  "Hybrid funds where they fit your risk profile",
                  "Liquid reserves for near-term expenses",
                ].map(item => (
                  <li key={item} className="flex items-start gap-2 text-slate-700 leading-relaxed">
                    <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Callout type="info">
                Asset allocation should be personal. Someone with a ₹5 crore corpus
                and ₹50,000 monthly expenses has very different risk capacity from
                someone with ₹1 crore and ₹1 lakh monthly expenses.
              </Callout>
            </ArticleSection>

            <ArticleSection title="7. Review Your Retirement Plan Every Year">
              <p className="text-slate-700 leading-relaxed mb-4">
                Retirement planning in India is not a one-time form you fill at age 60.
                Your expenses, investments, family goals and health can all change.
                A short annual review is easier than a major correction later.
              </p>
              <div className="space-y-2">
                {[
                  ["Expenses", "Have they grown faster than expected?"],
                  ["Withdrawals", "Are you taking more from the portfolio than planned?"],
                  ["Portfolio", "Has your equity allocation moved too high or too low?"],
                  ["Emergency fund", "Would it still cover the next unexpected bill?"],
                  ["Healthcare", "Have premiums, coverage or medical needs changed?"],
                  ["Goals", "Do you now want to travel, help your children or leave an inheritance?"],
                ].map(([label, question]) => (
                  <div key={label} className="flex gap-3 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                    <strong className="text-slate-900 min-w-28">{label}</strong>
                    <span className="text-sm text-slate-600">{question}</span>
                  </div>
                ))}
              </div>
            </ArticleSection>

            <ArticleSection title="So, How Much Money Do You Really Need to Retire?">
              <p className="text-slate-700 leading-relaxed mb-4">
                There is no universal retirement number. Someone spending ₹50,000 per
                month needs a different corpus from someone spending ₹2 lakh per month.
                Start with these seven inputs:
              </p>
              <div className="grid sm:grid-cols-2 gap-3 mb-5">
                {[
                  "Current monthly expenses",
                  "Expected retirement expenses",
                  "Retirement age",
                  "Life expectancy",
                  "Inflation and expected returns",
                  "Pension and other income",
                  "Healthcare and lifestyle goals",
                ].map((item, index) => (
                  <div key={item} className="flex items-center gap-3 border border-slate-200 rounded-lg p-3">
                    <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <span className="text-sm text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-slate-700 leading-relaxed">
                For example, ₹1 lakh of monthly spending today could become roughly
                ₹1.79 lakh after 10 years, ₹3.21 lakh after 20 years and ₹4.29 lakh
                after 25 years at 6% inflation. The first-year number is never the
                whole story.
              </p>
            </ArticleSection>

            <ArticleSection title="The Simple Retirement Planning Formula">
              <p className="text-slate-700 leading-relaxed mb-5">
                Before choosing an SIP, NPS, PPF or mutual fund, write down these five
                numbers. Investment selection should come after retirement planning,
                not before it.
              </p>
              <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-2xl p-6 sm:p-8 text-white">
                <div className="space-y-4">
                  {[
                    ["01", "Current monthly expenses", "₹ ________"],
                    ["02", "Expected monthly expenses at retirement", "₹ ________"],
                    ["03", "Guaranteed monthly income", "₹ ________"],
                    ["04", "Monthly income required from investments", "₹ ________"],
                    ["05", "Retirement corpus at retirement", "₹ ________"],
                  ].map(([number, label, value]) => (
                    <div key={number} className="flex items-center gap-4 border-b border-white/10 pb-3 last:border-0 last:pb-0">
                      <span className="text-blue-300 font-bold text-sm">{number}</span>
                      <span className="font-medium text-sm flex-1">{label}</span>
                      <span className="text-slate-300 text-sm">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ArticleSection>

            <ArticleSection title="Frequently Asked Questions">
              <div className="space-y-5">
                {[
                  {
                    q: "Is ₹1 crore enough to retire in India?",
                    a: "It depends on your expenses, retirement age, city, other income and lifespan. For many urban households, ₹1 crore by itself may not generate enough inflation-adjusted income for a 25–30 year retirement.",
                  },
                  {
                    q: "What is the best investment for retirement in India?",
                    a: "There is no single best investment. A good plan may combine EPF, NPS, PPF, mutual fund SIPs, fixed income and emergency reserves, with the mix changing as your retirement date gets closer.",
                  },
                  {
                    q: "How much should I withdraw from my retirement corpus every month?",
                    a: "There is no safe number for everyone. Your withdrawal rate must account for inflation, portfolio returns, taxes, healthcare and how long the money needs to last. Model the full cash flow before setting an SWP.",
                  },
                  {
                    q: "Should I keep equity after retirement?",
                    a: "Many retirees need some growth assets because retirement can last 25–30 years. The right allocation depends on your expenses, guaranteed income, corpus and ability to tolerate market volatility.",
                  },
                  {
                    q: "How can I calculate my retirement corpus in India?",
                    a: "Use your future expenses, inflation, retirement age, life expectancy, expected returns, guaranteed income and healthcare needs. RetirePro's free retirement calculator brings these inputs into one year-by-year projection.",
                  },
                ].map(item => (
                  <div key={item.q} className="border-b border-slate-200 pb-5 last:border-0 last:pb-0">
                    <h3 className="font-semibold text-slate-900 mb-2">{item.q}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </ArticleSection>

            <NewsletterWidget source="blog-retirement-planning-india-7-ways" />

            <div className="bg-gradient-to-r from-blue-700 to-indigo-900 rounded-2xl p-8 text-center text-white">
              <h2 className="text-2xl font-bold mb-3">Find Your Real Retirement Number</h2>
              <p className="text-blue-100 mb-2">
                See your future expenses, income gap and year-by-year corpus projection.
              </p>
              <p className="text-blue-200 text-sm mb-6">Free. No login required. Built for India.</p>
              <Link
                href="/free-plan"
                className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-3 rounded-full hover:bg-blue-50 transition-colors"
              >
                Calculate My Retirement Corpus <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-12 pt-10 border-t border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-5">Related Articles</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                {RELATED.map(post => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group block bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className={`h-20 bg-gradient-to-br ${post.gradient}`} />
                    <div className="p-4">
                      <span className={`text-xs font-semibold ${post.tagColor}`}>{post.tag}</span>
                      <p className="text-sm font-semibold text-slate-800 mt-1 leading-snug group-hover:text-blue-600 transition-colors">
                        {post.title}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-8">
                <Link href="/blog" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 text-sm">
                  ← Back to all articles
                </Link>
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-10 pb-16 leading-relaxed">
              Disclaimer: Mutual fund investments are subject to market risks. Read all
              scheme-related documents carefully before investing. The calculations and
              examples in this article are illustrative. Actual returns, inflation,
              taxation and investment outcomes may differ. This article is for
              educational purposes and is not personalised investment advice.
            </p>
          </motion.div>
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <BlogShare title={ARTICLE_META.headline} slug={ARTICLE_META.slug} />
          </div>
        </aside>
      </div>
    </div>
  );
}