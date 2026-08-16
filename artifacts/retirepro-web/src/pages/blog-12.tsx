import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, AlertTriangle, CheckCircle, TrendingUp, Heart } from "lucide-react";
import BrandLogo from "@/components/brand-logo";
import { usePageMeta } from "@/hooks/usePageMeta";
import NewsletterWidget from "@/components/newsletter-widget";

const ARTICLE_META = {
  headline: "Joint Retirement Planning for Couples in India: How Much Corpus Do You Really Need?",
  description:
    "Learn how couples in India can plan retirement together, calculate future expenses, account for inflation, and estimate how much they may need to invest — with real numbers and a practical step-by-step formula.",
  datePublished: "2026-08-16",
  dateModified: "2026-08-16",
  slug: "joint-retirement-planning-for-couples",
  readTime: "12 min read",
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
    slug: "how-much-money-to-retire-in-india",
    title: "How Much Money Do I Need to Retire in India?",
    tag: "Retirement Basics",
    tagColor: "text-orange-600",
    gradient: "from-orange-500 to-red-600",
  },
  {
    slug: "how-much-to-retire-india",
    title: "How Much Money Do You Need to Retire in India? [2026 Guide]",
    tag: "Retirement Basics",
    tagColor: "text-orange-600",
    gradient: "from-orange-500 to-red-600",
  },
  {
    slug: "nps-vs-ppf-vs-sip",
    title: "NPS vs PPF vs Mutual Fund SIP: Which Builds the Biggest Corpus?",
    tag: "Investment Guide",
    tagColor: "text-emerald-600",
    gradient: "from-emerald-600 to-teal-700",
  },
];

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-10">{children}</h2>;
}

function Callout({ type, children }: { type: "warning" | "success" | "info"; children: React.ReactNode }) {
  const config = {
    warning: { bg: "bg-amber-50 border-amber-300", icon: <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" /> },
    success: { bg: "bg-emerald-50 border-emerald-300", icon: <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" /> },
    info: { bg: "bg-rose-50 border-rose-300", icon: <TrendingUp className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" /> },
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

export default function Blog12() {
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
      <div className="bg-gradient-to-br from-rose-600 to-pink-700 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block bg-white/15 text-rose-100 text-sm font-semibold px-3 py-1 rounded-full mb-6">
              Couples Planning · {ARTICLE_META.readTime}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
              Joint Retirement Planning for Couples in India: How Much Corpus Do You Really Need?
            </h1>
            <p className="text-rose-100 text-lg leading-relaxed mb-6">
              A couple spending ₹70,000/month today might assume ₹1–2 crore is enough. If retirement is 20 years away, inflation alone can completely change that number. Here's how to plan it together, the right way.
            </p>
            <div className="flex items-center gap-4 text-sm text-rose-200">
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
            <strong>Quick Answer:</strong> Joint retirement planning means calculating both partners' needs together — combined expenses, ages, retirement dates, and shared costs — rather than as two separate plans. Use our <Link href="/free-plan" className="underline font-semibold">free retirement calculator</Link> to model your household's exact number in 5 minutes.
          </Callout>

          <div className="grid grid-cols-3 gap-4 my-8">
            <StatBox number="₹70k → ₹3L" label="A couple's monthly expense after 25 yrs of 6% inflation" />
            <StatBox number="25–35 yrs" label="How long a joint corpus may need to last" />
            <StatBox number="40–50%" label="Corpus reduction possible via staggered retirement" />
          </div>

          <SectionHeading>What Is Joint Retirement Planning?</SectionHeading>
          <p className="text-slate-700 leading-relaxed mb-4">
            Retirement is usually discussed as an individual exercise — how much should I save, when can I retire, how much SIP do I need. But for a married couple, retirement is rarely an individual decision. You may retire together, or 5–10 years apart. One partner may keep working while the other retires. Joint retirement planning means calculating both partners' needs <strong>together</strong>, considering:
          </p>
          <ul className="list-disc list-inside text-slate-700 space-y-1 mb-6 text-sm leading-relaxed">
            <li>Both partners' current ages and retirement ages</li>
            <li>Combined monthly expenses and existing investments</li>
            <li>Inflation, expected returns, and healthcare costs</li>
            <li>Pension or other income and desired retirement lifestyle</li>
          </ul>
          <p className="text-slate-700 leading-relaxed mb-4">
            The objective: find out how much the household may need at retirement, and how much to invest today to get there.
          </p>

          <SectionHeading>Why Couples Should Plan Retirement Together</SectionHeading>
          <p className="text-slate-700 leading-relaxed mb-4">
            Consider a household spending ₹70,000/month today, with retirement 25 years away. At 6% inflation, ₹70,000 × (1.06)^25 ≈ <strong>₹3 lakh/month</strong> at retirement. The same lifestyle that costs ₹70,000 today could require roughly ₹3 lakh a month, in the future. Most people underestimate this because they calculate using today's expenses instead of future expenses.
          </p>
          <DataTable
            headers={["Years From Today", "Approx. Monthly Expense (from ₹1L today)"]}
            rows={[
              ["Today", "₹1.00 lakh"],
              ["5 years", "₹1.34 lakh"],
              ["10 years", "₹1.79 lakh"],
              ["15 years", "₹2.40 lakh"],
              ["20 years", "₹3.21 lakh"],
              ["25 years", "₹4.29 lakh"],
            ]}
          />

          <SectionHeading>But Will We Really Spend This Much After Retirement?</SectionHeading>
          <p className="text-slate-700 leading-relaxed mb-4">
            Not necessarily. Your current expenses may include children's school fees, home loan EMI, work travel, and office lunches — many of which disappear by retirement. Instead of inflating your entire current spend, split it into categories first.
          </p>
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 my-6">
            <p className="text-sm font-semibold text-slate-800 mb-2">Example — a couple spending ₹1,00,000/month today:</p>
            <p className="text-sm text-slate-700">Household ₹50,000 · Children ₹20,000 · Loan EMI ₹15,000 · Lifestyle ₹10,000 · Other ₹5,000</p>
            <p className="text-xs text-slate-500 mt-2">By retirement, children's costs and loan EMI are often gone — the real retirement expense may start closer to ₹65,000–75,000/month in today's money, not the full ₹1 lakh.</p>
          </div>

          <SectionHeading>The Biggest Advantage: Shared Household Expenses</SectionHeading>
          <p className="text-slate-700 leading-relaxed mb-4">
            A couple doesn't need two independent corpuses — "husband's corpus + wife's corpus" as separate numbers. Rent, appliances, internet, domestic help, and many insurance and utility costs are shared. This means retirement can be more efficiently planned at a <strong>household level</strong>.
          </p>

          <Callout type="info">
            <strong>Practical example:</strong> Husband 35, Wife 33, retiring at 60, current household retirement expense ₹80,000/month, inflation 6%. At retirement, that becomes roughly <strong>₹3.43 lakh/month</strong> — the real starting point for calculating the required corpus, not the ₹80,000 figure.
          </Callout>

          <SectionHeading>The 25X Rule: Is It Enough for Couples?</SectionHeading>
          <p className="text-slate-700 leading-relaxed mb-4">
            You may have heard: <em>retirement corpus ≈ 25 × annual retirement expenses</em>. At ₹40 lakh/year, that's ₹10 crore. It's a useful shortcut, but not a personalised plan — it doesn't fully account for retirement age, life expectancy, inflation, healthcare costs, sequence-of-returns risk, or other income. For a couple, these variables matter even more.
          </p>

          <SectionHeading>What If One Partner Retires Earlier?</SectionHeading>
          <p className="text-slate-700 leading-relaxed mb-4">
            Suppose the husband retires at 60 but the wife continues working until 65. That's a real advantage: for those five years, one income continues, the corpus doesn't need to fund the entire household, investments keep growing, and healthcare planning can be coordinated. Don't assume both partners must retire on the same date — <strong>staggered retirement can meaningfully reduce the required corpus</strong>.
          </p>

          <SectionHeading>Retire Together, Invest Separately</SectionHeading>
          <p className="text-slate-700 leading-relaxed mb-4">
            Joint planning doesn't mean joint investing. A couple can share a combined retirement goal while keeping separate investments — say, ₹30,000/month SIP from the husband and ₹20,000/month from the wife, totalling ₹50,000/month. What matters isn't who invested how much, but whether both investments are collectively moving the household toward its goal. This also preserves individual financial independence.
          </p>

          <SectionHeading>The Power of Starting 10 Years Earlier</SectionHeading>
          <p className="text-slate-700 leading-relaxed mb-4">
            If a couple targets ₹5 crore and starts investing 25 years before retirement instead of 15, the required monthly investment drops dramatically — because of compounding. The first 10 years may feel slow, but the later years produce a far larger share of the final corpus. Delaying by even 5 years doesn't just mean five fewer years of saving — it means five fewer years for existing money to compound.
          </p>

          <SectionHeading>Don't Forget Healthcare</SectionHeading>
          <p className="text-slate-700 leading-relaxed mb-4">
            Regular living expenses might be manageable, but one major medical event can significantly dent a retirement corpus. Plan for health insurance, an emergency fund, medical inflation, and senior-citizen healthcare costs separately — insurance is not a substitute for your retirement corpus; the two serve different purposes.
          </p>

          <SectionHeading>Should Couples Have One Retirement Corpus or Two?</SectionHeading>
          <p className="text-slate-700 leading-relaxed mb-4">
            There's no single right answer. A useful framework is to separate a <strong>household retirement corpus</strong> (one combined target based on both partners' needs) from <strong>individual financial assets</strong> (separate investments each spouse owns). This gives you both household-level planning and individual financial independence — often better than combining everything into one account.
          </p>

          <SectionHeading>A Simple Joint Retirement Planning Formula</SectionHeading>
          <div className="space-y-3">
            {[
              { step: "1", title: "Calculate today's retirement expenses", desc: "Add up combined household spending across all categories." },
              { step: "2", title: "Remove expenses likely to disappear", desc: "Children's costs, loan EMIs, and work-related expenses often fall away by retirement." },
              { step: "3", title: "Adjust the remainder for inflation", desc: "Project forward using a realistic inflation rate (6% is a common India assumption)." },
              { step: "4", title: "Estimate how long the corpus must last", desc: "Typically 25–35 years post-retirement, depending on life expectancy." },
              { step: "5", title: "Account for existing investments and other income", desc: "Existing corpus, pension, and rental income all reduce the gap to be filled." },
              { step: "6", title: "Calculate the monthly investment required", desc: "Bridge the gap between what you have and what you'll need." },
              { step: "7", title: "Review the plan every year", desc: "Income, expenses, investments, and retirement age all change — so should the plan." },
            ].map(item => (
              <div key={item.step} className="flex gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="text-3xl font-black text-rose-200 w-10 flex-shrink-0">{item.step}</div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <SectionHeading>The Most Important Retirement Conversation for Couples</SectionHeading>
          <p className="text-slate-700 leading-relaxed mb-3">
            Don't just ask "how much money do you want after retirement?" Ask these together:
          </p>
          <ul className="list-disc list-inside text-slate-700 space-y-1 mb-6 text-sm leading-relaxed">
            <li>Where do we want to live — same city, a smaller city, or travel between both?</li>
            <li>What lifestyle do we want — simple, frequent travel, helping children, a second home?</li>
            <li>When do we want to stop working — both at 60, or one earlier?</li>
            <li>What happens if one of us lives much longer, or needs expensive healthcare?</li>
          </ul>

          <Callout type="warning">
            <span className="inline-flex items-center gap-1"><Heart className="h-4 w-4" /></span> A couple in Mumbai spending ₹1.2 lakh/month cannot use the same retirement number as a couple in a smaller city spending ₹50,000. <strong>Your retirement number depends on your life</strong> — not a number you copied from someone else.
          </Callout>

          {/* FAQ */}
          <SectionHeading>Frequently Asked Questions</SectionHeading>
          <div className="space-y-5 bg-slate-50 rounded-2xl p-6">
            {[
              { q: "What is joint retirement planning?", a: "The process of calculating the retirement requirements of both spouses together — combined household expenses, both partners' ages, retirement dates, existing investments, inflation, expected returns, and other income sources." },
              { q: "Should husband and wife have separate retirement plans?", a: "Not necessarily. Couples can maintain separate investments while sharing a combined retirement goal — this preserves individual financial independence while ensuring the household requirement is properly calculated." },
              { q: "How much retirement corpus does a couple need in India?", a: "There's no fixed amount. It depends on current expenses, retirement age, inflation, lifestyle, investment returns, healthcare needs, and how long the money needs to last." },
              { q: "Is ₹5 crore enough for a couple to retire?", a: "It depends on when you retire and how much you spend. A couple retiring at 45 with ₹5 crore is in a very different position from one retiring at 60 with the same corpus. Calculate your own number instead of anchoring to a round figure." },
              { q: "What happens if one spouse retires before the other?", a: "It can make planning easier — the working spouse's income can help fund household expenses, reducing withdrawals from the retirement corpus during those years." },
              { q: "Should couples invest in the same mutual funds for retirement?", a: "Not necessarily. The goal should be an appropriate combined asset allocation, not identical holdings. Each spouse can invest differently based on their own risk profile and goals." },
              { q: "How does inflation affect a couple's retirement planning?", a: "Significantly, over long periods. ₹1 lakh/month today at 6% inflation becomes roughly ₹3.21 lakh/month after 20 years — which is why plans should use future expenses, not today's." },
              { q: "When should a couple start retirement planning?", a: "As early as possible — starting early gives investments more time to compound and lowers the monthly investment needed. If you haven't started, the best time to calculate your number is now." },
            ].map(item => (
              <div key={item.q} className="border-b border-slate-200 pb-5 last:border-0 last:pb-0">
                <h3 className="font-semibold text-slate-900 mb-2 text-sm">{item.q}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>

          <NewsletterWidget source="blog-joint-retirement-planning" />

          {/* CTA */}
          <div className="bg-gradient-to-r from-rose-600 to-pink-700 rounded-2xl p-8 text-center text-white mt-10">
            <h2 className="text-2xl font-bold mb-3">Calculate Your Household's Retirement Number</h2>
            <p className="text-rose-100 mb-6">India-specific assumptions. Model both partners together. Free — no login required.</p>
            <Link href="/free-plan" className="inline-flex items-center gap-2 bg-white text-rose-700 font-bold px-8 py-3 rounded-full hover:bg-rose-50 transition-colors">
              Plan Our Retirement <ArrowRight className="h-4 w-4" />
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
