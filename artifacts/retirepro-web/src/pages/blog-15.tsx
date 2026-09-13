import { Link } from "wouter";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, CheckCircle, Calculator, TrendingUp } from "lucide-react";
import BrandLogo from "@/components/brand-logo";
import { usePageMeta } from "@/hooks/usePageMeta";
import NewsletterWidget from "@/components/newsletter-widget";
import BlogShare from "@/components/blog-share";

const ARTICLE_META = {
  headline: "Why Your Retirement Number Is Wrong — And How Inflation & Late Starts Change Everything",
  description:
    "A ₹1 crore retirement target is rarely personal. Learn how inflation, retirement timing and a late start change your required corpus and monthly SIP in India.",
  datePublished: "2026-09-13",
  dateModified: "2026-09-13",
  slug: "why-your-retirement-number-is-wrong",
  readTime: "12 min read",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: ARTICLE_META.headline,
  description: ARTICLE_META.description,
  author: { "@type": "Organization", name: "RetirePro Editorial", url: "https://retirepro.in/" },
  publisher: {
    "@type": "Organization",
    name: "RetirePro",
    url: "https://retirepro.in/",
    logo: { "@type": "ImageObject", url: "https://retirepro.in/favicon.png" },
  },
  datePublished: ARTICLE_META.datePublished,
  dateModified: ARTICLE_META.dateModified,
  mainEntityOfPage: { "@type": "WebPage", "@id": `https://retirepro.in/blog/${ARTICLE_META.slug}/` },
  image: "https://retirepro.in/opengraph.jpg",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold text-slate-900 mb-4">{title}</h2>
      <div className="space-y-4 text-slate-700 leading-relaxed">{children}</div>
    </section>
  );
}

function Callout({
  tone = "blue",
  children,
}: {
  tone?: "blue" | "amber" | "green";
  children: React.ReactNode;
}) {
  const styles = {
    blue: "bg-blue-50 border-blue-200 text-blue-950",
    amber: "bg-amber-50 border-amber-300 text-amber-950",
    green: "bg-emerald-50 border-emerald-200 text-emerald-950",
  };
  const Icon = tone === "amber" ? AlertTriangle : tone === "green" ? CheckCircle : TrendingUp;
  return (
    <aside className={`flex gap-3 rounded-xl border p-4 ${styles[tone]}`}>
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="text-sm leading-relaxed">{children}</div>
    </aside>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-900 text-white">
            {headers.map((header) => <th key={header} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{header}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row[0]} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
              {row.map((cell) => <td key={cell} className="px-4 py-3">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const RELATED = [
  { slug: "how-much-money-to-retire-in-india", title: "How Much Money Do I Need to Retire in India?", gradient: "from-red-900 via-orange-800 to-slate-900" },
  { slug: "retirement-corpus-calculator-india-serious-planners", title: "Why Serious Retirement Planners Are Ditching Quick Calculators", gradient: "from-slate-900 via-amber-950 to-orange-900" },
  { slug: "sabbatical-mini-retirement-startup-calculator", title: "The Mini-Retirement Test for a Career Break", gradient: "from-slate-800 via-indigo-950 to-slate-900" },
];

export default function Blog15() {
  usePageMeta({
    title: `${ARTICLE_META.headline} | RetirePro`,
    description: ARTICLE_META.description,
    canonical: `https://retirepro.in/blog/${ARTICLE_META.slug}`,
    ogUrl: `https://retirepro.in/blog/${ARTICLE_META.slug}`,
    ogType: "article",
  });

  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <BrandLogo textClassName="text-slate-800" />
          <Link href="/free-plan" className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
            Free Calculator <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <section className="bg-gradient-to-br from-orange-600 via-rose-700 to-slate-950 px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="mb-6 inline-block rounded-full border border-orange-200/30 bg-orange-200/15 px-3 py-1 text-sm font-semibold text-orange-100">
              Retirement Basics · {ARTICLE_META.readTime}
            </span>
            <h1 className="mb-6 text-3xl font-bold leading-tight text-white md:text-5xl">{ARTICLE_META.headline}</h1>
            <p className="mb-6 text-lg leading-relaxed text-orange-100/90">
              A round-number target may sound reassuring. But inflation, your retirement date and the time you have left to invest can make it dangerously incomplete.
            </p>
            <div className="flex items-center gap-3 text-sm text-orange-200">
              <span>RetirePro Editorial</span><span>·</span><time dateTime={ARTICLE_META.datePublished}>13 Sep 2026</time>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-slate-900 px-4 py-8">
        <div className="mx-auto grid max-w-3xl grid-cols-3 gap-3 sm:gap-4">
          {[
            ["₹1 Cr", "A target that is rarely personal"],
            ["6%", "Illustrative annual inflation"],
            ["4×", "Possible late-starter SIP gap"],
          ].map(([number, label]) => (
            <div key={number} className="rounded-2xl bg-slate-800 p-4 text-center">
              <strong className="block text-2xl text-orange-300 sm:text-3xl">{number}</strong>
              <span className="mt-1 block text-xs leading-snug text-slate-300 sm:text-sm">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <main className="mx-auto grid max-w-6xl items-start gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_260px] lg:px-8">
        <article className="max-w-3xl">
          <BlogShare title={ARTICLE_META.headline} slug={ARTICLE_META.slug} className="mb-8 lg:hidden" />
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25, duration: 0.6 }}>
            <p className="mb-8 border-l-4 border-orange-500 pl-4 text-lg italic leading-relaxed text-slate-700">
              You may have heard that you need ₹1 crore for retirement. That number is almost certainly wrong for you—not because round numbers are always wrong, but because your retirement is not someone else’s life.
            </p>

            <Section title='The “₹1 Crore Problem”'>
              <p>Every Indian finance site, WhatsApp forward and dinner-table conversation starts with a round number: ₹1 crore, ₹1.5 crore or ₹2 crore. They are convenient, memorable and almost always incomplete.</p>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  ["Outdated math", "The old rule assumed lower inflation, a shorter retirement and a stable lifestyle."],
                  ["Generic advice", "One easy target can be repeated to everyone, even when their expenses and family income differ."],
                  ["Wrong variable", "A corpus in isolation says nothing about the life it must fund, when withdrawals begin or how long they last."],
                ].map(([title, body]) => (
                  <div key={title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <h3 className="mb-2 font-bold text-slate-900">{title}</h3><p className="text-sm">{body}</p>
                  </div>
                ))}
              </div>
              <p>Your real number depends on your retirement age, location, spending, spouse’s income, longevity, healthcare and the flexibility you have. A target borrowed from 2012 cannot capture that.</p>
            </Section>

            <Section title="The Inflation Factor: Why Your Spreadsheet Is Already Obsolete">
              <p>Suppose you spent ₹50,000 a month in 2020 and assumed that 300 months of retirement spending would need ₹1.5 crore. Between 2020 and 2026, inflation has already changed the purchasing power of that estimate.</p>
              <DataTable headers={["Point in time", "Monthly expense at 6% inflation"]} rows={[
                ["2020 starting expense", "₹50,000"],
                ["2026 purchasing power", "₹67,300"],
                ["2030 projected expense", "₹84,800"],
                ["25 years at the 2030 amount", "₹2.54 crore"],
              ]} />
              <Callout tone="amber"><strong>The gap compounds twice:</strong> inflation raises the lifestyle you need to fund and also erodes the real purchasing power of a corpus target that was calculated years ago.</Callout>
            </Section>

            <Section title="The Late-Starter Penalty: Why Starting at 45 Is Not the Same as Starting at 35">
              <p>Amit starts at 35 and has 25 years to invest. Neha starts at 45 and has 15 years. They may want the same retirement lifestyle, but their required monthly commitment is completely different.</p>
              <DataTable headers={["Planner", "Time to invest", "Illustrative monthly SIP"]} rows={[
                ["Amit, starting at 35", "25 years", "₹8,600 for a ₹1.8 crore target"],
                ["Neha, starting at 45", "15 years", "₹26,400 for the same target"],
                ["Neha's adjusted target", "15 years", "₹33,800 for an illustrative ₹2.3 crore target"],
              ]} />
              <p>The late-start penalty is not linear. Less time removes years of compounding, while the money must still support a long retirement. The practical answer is not panic; it is to model the trade-offs honestly.</p>
            </Section>

            <Section title="The Three Mistakes That Wreck Your Number">
              <h3 className="font-bold text-slate-900">1. Using today’s corpus target for tomorrow’s retirement</h3>
              <p>At 6% inflation, a ₹1 crore target becomes roughly ₹1.19 crore in three years, ₹1.43 crore in seven years and ₹1.76 crore in ten years. A fixed target can lose purchasing power before retirement even begins.</p>
              <h3 className="font-bold text-slate-900">2. Locking in a flat lifestyle</h3>
              <p>Spending may change across active retirement, a settled phase and later-life healthcare. A realistic plan accounts for that variability rather than assuming every year looks identical.</p>
              <h3 className="font-bold text-slate-900">3. Ignoring the timing mismatch</h3>
              <p>Your corpus depends on how long you have to accumulate, how long you need to draw from it and the return sequence in between. A compressed accumulation period needs a different plan, not a shorter version of an old one.</p>
            </Section>

            <Section title="How to Calculate Your Actual Retirement Number">
              <div className="space-y-4">
                {[
                  ["1. Calculate your inflation-adjusted lifestyle", "Start with today’s monthly spending, then project it to your retirement date. ₹X today is not ₹X at 60."],
                  ["2. Build a phased retirement cash flow", "Model active years, settled years and possible care years rather than using one flat monthly expense."],
                  ["3. Account for income and deductions", "Include spouse income, pension, rental income and taxes. Your corpus may not need to fund every rupee of household spending."],
                  ["4. Calculate backwards to your monthly SIP", "Use the target corpus, years to retirement and a realistic return assumption to find the monthly commitment needed now."],
                ].map(([title, body]) => (
                  <div key={title} className="flex gap-4 rounded-xl border border-slate-200 p-5">
                    <Calculator className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />
                    <div><h3 className="mb-1 font-bold text-slate-900">{title}</h3><p className="text-sm">{body}</p></div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="The Late-Starter Adjustment: The Numbers Get Uncomfortable">
              <p>If you are 48, want to retire at 60 and need ₹2 crore, an illustrative 12% return assumption can require roughly ₹39,800 a month. At 40, with 20 years to invest, the same target could require about ₹16,400 a month.</p>
              <p>If the higher amount is unrealistic, your levers are clear: retire a little later, reduce future spending, add spouse or part-time income, or use a more conservative return assumption and save more. A plan lets you see each trade-off before it becomes an emergency.</p>
              <Callout tone="blue"><strong>Returns are not guaranteed.</strong> A short investment window also makes sequence-of-returns risk more important. A market decline late in the accumulation phase can have an outsized effect on a plan.</Callout>
            </Section>

            <Section title="The Real Number: What RetirePro Actually Does">
              <p>A real retirement plan is not one number. It models inflation-adjusted spending, spouse income, EPF or NPS, taxes, market assumptions, your late-start gap and the choices available to you.</p>
              <p>That turns a vague target into useful decisions: “If I retire at 60, I need to invest ₹38,000 a month. If I retire at 62, it becomes ₹28,000. If I reduce active-retirement spending by 10%, it changes again.”</p>
            </Section>

            <Section title="The Path Forward">
              <p><strong>Stop thinking in numbers. Start thinking in plans.</strong></p>
              <ol className="list-decimal space-y-2 pl-5">
                <li>What will you actually spend in retirement after inflation and life changes?</li>
                <li>How much must you accumulate for that timeline?</li>
                <li>How much do you need to save now?</li>
                <li>What flexibility do you have if assumptions change?</li>
              </ol>
              <p>If you calculated your number five years ago, recalculate now. Your lifestyle has changed, your timeline is shorter and your asset allocation may need a review.</p>
            </Section>

            <NewsletterWidget source="blog-retirement-number-wrong" />

            <section className="rounded-2xl bg-gradient-to-r from-orange-600 to-rose-800 p-8 text-center text-white">
              <h2 className="mb-3 text-2xl font-bold">Calculate Your Real Number in 60 Seconds</h2>
              <p className="mb-2 text-orange-100">See your projected retirement corpus, monthly SIP and the impact of starting later.</p>
              <p className="mb-6 text-sm text-orange-200">Free. No login required. Built for India.</p>
              <Link href="/free-plan" className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 font-bold text-orange-700 transition-colors hover:bg-orange-50">
                Calculate My Retirement Plan <ArrowRight className="h-4 w-4" />
              </Link>
            </section>

            <section className="mt-12 border-t border-slate-200 pt-10">
              <h2 className="mb-5 text-lg font-bold text-slate-900">Related Articles</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {RELATED.map((post) => (
                  <Link key={post.slug} href={`/blog/${post.slug}/`} className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-md">
                    <div className={`h-20 bg-gradient-to-br ${post.gradient}`} />
                    <p className="p-4 text-sm font-semibold leading-snug text-slate-800 transition-colors group-hover:text-orange-600">{post.title}</p>
                  </Link>
                ))}
              </div>
              <Link href="/blog/" className="mt-8 flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">← Back to all articles</Link>
            </section>

            <p className="mt-10 pb-16 text-xs leading-relaxed text-slate-500">
              Disclaimer: Mutual fund investments are subject to market risks. The calculations and examples in this article are illustrative, not personalised investment advice. Actual returns, inflation, taxes and outcomes may differ.
            </p>
          </motion.div>
        </article>

        <aside className="sticky top-24 hidden lg:block">
          <BlogShare title={ARTICLE_META.headline} slug={ARTICLE_META.slug} />
        </aside>
      </main>
    </div>
  );
}