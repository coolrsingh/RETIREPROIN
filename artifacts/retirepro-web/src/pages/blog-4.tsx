import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import BrandLogo from "@/components/brand-logo";
import { usePageMeta } from "@/hooks/usePageMeta";

const ARTICLE_META = {
  headline: "How Much Money Do You Need to Retire in India? [2026 Complete Guide]",
  description: "For a comfortable retirement in India, you need ₹1.5 crore to ₹5 crore — depending on your city, lifestyle, and age. Here's the exact formula, city-wise breakdown, and the inflation trap most Indians fall into.",
  datePublished: "2026-07-18",
  dateModified: "2026-07-18",
  slug: "how-much-to-retire-india",
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
    slug: "why-indians-fail-retirement",
    title: "Why Most Indians Fail to Plan for Retirement",
    tag: "Retirement Basics",
    tagColor: "text-blue-600",
    gradient: "from-blue-600 to-indigo-700",
  },
  {
    slug: "nps-vs-ppf-vs-sip",
    title: "NPS vs PPF vs Mutual Fund SIP: Which Builds the Biggest Corpus?",
    tag: "Investment Guide",
    tagColor: "text-emerald-600",
    gradient: "from-emerald-600 to-teal-700",
  },
  {
    slug: "real-estate-rich-retirement-illusion",
    title: "The ₹40 Crore Illusion: Why India's Wealthiest Retirees Are Most Exposed",
    tag: "HNI Planning",
    tagColor: "text-orange-600",
    gradient: "from-slate-700 to-slate-900",
  },
];

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-10">{children}</h2>;
}

function Callout({ type, children }: { type: "warning" | "success" | "info"; children: React.ReactNode }) {
  const config = {
    warning: { bg: "bg-amber-50 border-amber-300", icon: <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" /> },
    success: { bg: "bg-emerald-50 border-emerald-300", icon: <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" /> },
    info: { bg: "bg-orange-50 border-orange-300", icon: <TrendingUp className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" /> },
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

export default function Blog4() {
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
      <div className="bg-gradient-to-br from-orange-600 to-red-700 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block bg-white/15 text-orange-100 text-sm font-semibold px-3 py-1 rounded-full mb-6">
              Retirement Basics · {ARTICLE_META.readTime}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
              How Much Money Do You Need to Retire in India? [2026 Complete Guide]
            </h1>
            <p className="text-orange-100 text-lg leading-relaxed mb-6">
              For a comfortable retirement in India, you need ₹1.5 crore to ₹5 crore — depending on your city, lifestyle, and age. Here's the exact formula, city-wise breakdown, and the inflation trap most Indians fall into.
            </p>
            <div className="flex items-center gap-4 text-sm text-orange-200">
              <span>RetirePro Editorial</span>
              <span>·</span>
              <time dateTime={ARTICLE_META.datePublished}>18 Jul 2026</time>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>

          {/* Quick Answer */}
          <Callout type="success">
            <strong>Quick Answer:</strong> For a comfortable retirement in India, you need <strong>₹1.5 crore to ₹5 crore</strong> depending on your city, lifestyle, and age. Use our <Link href="/free-plan" className="underline font-semibold">free retirement calculator</Link> to get your exact number in 5 minutes — no signup needed.
          </Callout>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 my-8">
            <StatBox number="₹5–7 Cr" label="Tier 1 city moderate retirement" />
            <StatBox number="6–7%" label="India's annual inflation rate" />
            <StatBox number="4.3x" label="Inflation multiplier in 25 years" />
          </div>

          {/* Section 1 */}
          <SectionHeading>The Retirement Corpus Formula for India</SectionHeading>
          <p className="text-slate-700 leading-relaxed mb-4">
            The 4% rule — popular in the US — doesn't work well in India. Here's why:
          </p>
          <ul className="list-disc list-inside text-slate-700 space-y-1 mb-6 text-sm leading-relaxed">
            <li><strong>US inflation:</strong> ~3% annually vs <strong>India inflation:</strong> ~6–7% historically</li>
            <li><strong>US healthcare:</strong> mostly covered by Medicare vs <strong>India healthcare:</strong> out-of-pocket (rising 10–15%/year)</li>
          </ul>
          <div className="bg-slate-900 text-green-300 font-mono text-sm rounded-xl p-5 my-6 overflow-x-auto">
            <div className="text-slate-400 mb-2"># India-specific formula</div>
            <div>Required Corpus = (Monthly Expenses × 12) × 25 × Inflation Multiplier</div>
          </div>

          <DataTable
            headers={["Years to Retirement", "Multiplier", "Meaning"]}
            rows={[
              ["10 years", "1.8x", "₹1 today = ₹1.80 in 10 years"],
              ["20 years", "3.2x", "₹1 today = ₹3.20 in 20 years"],
              ["30 years", "5.7x", "₹1 today = ₹5.70 in 30 years"],
            ]}
          />

          <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 my-6">
            <p className="text-sm font-semibold text-slate-800 mb-2">Example — 25 years to retirement, ₹50,000/month expenses:</p>
            <p className="text-sm text-slate-700">₹50,000 × 12 = ₹6,00,000/year → × 25 = ₹1.5 crore (base) → × 4.3 inflation multiplier = <strong>₹6.45 crore</strong></p>
            <p className="text-xs text-slate-500 mt-2">Most calculators tell you ₹1.5 crore. That's why this matters.</p>
          </div>

          {/* Section 2 */}
          <SectionHeading>City-Wise Breakdown: How Much You Need Where You Live</SectionHeading>

          <h3 className="text-lg font-bold text-slate-800 mb-3">Tier 1 Cities (Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Pune)</h3>
          <DataTable
            headers={["Lifestyle", "Monthly Expenses (Today)", "Required Corpus"]}
            rows={[
              ["Frugal", "₹40,000", "₹3.5 – ₹4.5 crore"],
              ["Moderate", "₹60,000", "₹5.5 – ₹7 crore"],
              ["Comfortable", "₹80,000", "₹7.5 – ₹9 crore"],
              ["Luxury", "₹1,20,000+", "₹12 – ₹15 crore"],
            ]}
          />

          <h3 className="text-lg font-bold text-slate-800 mb-3 mt-6">Tier 2 Cities (Jaipur, Lucknow, Indore, Nagpur, Kochi, Coimbatore)</h3>
          <DataTable
            headers={["Lifestyle", "Monthly Expenses (Today)", "Required Corpus"]}
            rows={[
              ["Frugal", "₹25,000", "₹2 – ₹2.5 crore"],
              ["Moderate", "₹40,000", "₹3.5 – ₹4.5 crore"],
              ["Comfortable", "₹55,000", "₹5 – ₹6 crore"],
              ["Luxury", "₹80,000+", "₹7 – ₹9 crore"],
            ]}
          />

          <h3 className="text-lg font-bold text-slate-800 mb-3 mt-6">Tier 3 Cities &amp; Towns</h3>
          <DataTable
            headers={["Lifestyle", "Monthly Expenses (Today)", "Required Corpus"]}
            rows={[
              ["Frugal", "₹18,000", "₹1.5 – ₹2 crore"],
              ["Moderate", "₹30,000", "₹2.5 – ₹3.5 crore"],
              ["Comfortable", "₹40,000", "₹3.5 – ₹4.5 crore"],
            ]}
          />

          <Callout type="info">
            <strong>Pro Tip:</strong> Many retirees move from Tier 1 to Tier 2 after retirement. This "geo-arbitrage" can reduce your required corpus by 40–50%.
          </Callout>

          {/* Section 3 */}
          <SectionHeading>Lifestyle-Based Retirement Corpus</SectionHeading>
          <div className="grid sm:grid-cols-2 gap-4 my-6">
            {[
              { title: "Frugal Retiree", corpus: "₹1.5 – ₹2.5 crore", points: ["Lives in own home (no rent)", "Minimal travel", "Home-cooked meals", "Public healthcare"] },
              { title: "Moderate Retiree", corpus: "₹3 – ₹5 crore", points: ["1–2 trips/year", "Mix of home & outside food", "Private healthcare for major issues", "Small car or cab usage"] },
              { title: "Comfortable Retiree", corpus: "₹5 – ₹8 crore", points: ["3–4 trips/year", "Dining out weekly", "Comprehensive health insurance", "Own car with driver"] },
              { title: "Luxury Retiree", corpus: "₹10 crore+", points: ["International travel", "Fine dining", "Premium healthcare", "Multiple properties"] },
            ].map(c => (
              <div key={c.title} className="border border-slate-200 rounded-xl p-5">
                <h4 className="font-bold text-slate-900 mb-1">{c.title}</h4>
                <p className="text-[#F15A24] font-bold text-sm mb-3">{c.corpus}</p>
                <ul className="text-sm text-slate-600 space-y-1">
                  {c.points.map(p => <li key={p} className="flex items-start gap-2"><CheckCircle className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />{p}</li>)}
                </ul>
              </div>
            ))}
          </div>

          {/* Section 4 */}
          <SectionHeading>The Inflation Trap: Why Most Indians Get It Wrong</SectionHeading>
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 my-6">
            <h3 className="font-bold text-slate-900 mb-3">Meet Rajesh — The ₹2 Crore Mistake</h3>
            <p className="text-sm text-slate-700 mb-3">Rajesh, 35, from Mumbai. Monthly expenses: ₹50,000. He calculates ₹2 crore and feels set.</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-600">His corpus target:</span><span className="font-semibold text-slate-900">₹2 crore</span></div>
              <div className="flex justify-between"><span className="text-slate-600">What he actually needs at 60:</span><span className="font-semibold text-red-600">₹6.45 crore</span></div>
              <div className="flex justify-between"><span className="text-slate-600">His corpus runs out:</span><span className="font-semibold text-red-600">By age 70</span></div>
            </div>
            <p className="text-xs text-slate-500 mt-3">This is not hypothetical. This is happening to millions of Indians right now.</p>
          </div>

          <h3 className="text-lg font-bold text-slate-800 mb-3">The Healthcare Bomb</h3>
          <p className="text-slate-600 text-sm mb-4">Healthcare inflation in India runs at <strong>12–15% annually</strong>. Most retirement plans ignore this completely.</p>
          <DataTable
            headers={["Age", "Likely Medical Expenses (Annual)"]}
            rows={[
              ["60–65", "₹1 – ₹2 lakhs"],
              ["65–70", "₹2 – ₹4 lakhs"],
              ["70–75", "₹4 – ₹8 lakhs"],
              ["75–80", "₹8 – ₹15 lakhs"],
              ["80+", "₹15+ lakhs (with major illness)"],
            ]}
          />
          <Callout type="warning">
            One cardiac surgery at 70: ₹3–5 lakhs. Cancer treatment: ₹10–25 lakhs. Without a healthcare buffer, a single event can wipe out years of savings.
          </Callout>

          {/* Section 5 */}
          <SectionHeading>How to Calculate Your Exact Number</SectionHeading>
          <div className="space-y-4">
            {[
              { step: "1", title: "Calculate current monthly expenses", desc: "Add up housing, food, utilities, transport, healthcare, insurance, entertainment, clothing, and miscellaneous." },
              { step: "2", title: "Adjust for post-retirement changes", desc: "Remove work-related costs (commute, work clothes, office lunch). Add increased healthcare (+200%) and leisure (+50%)." },
              { step: "3", title: "Apply inflation (6% for 25 years = 4.3x multiplier)", desc: "Future Monthly Expense = Current Expense × (1.06)^years. E.g., ₹45,000 × 4.29 = ₹1,93,050/month at 60." },
              { step: "4", title: "Calculate corpus (25x annual)", desc: "Corpus = ₹1,93,050 × 12 × 25 = ₹5.79 crore" },
              { step: "5", title: "Add 20% healthcare buffer", desc: "₹5.79 crore × 1.20 = ₹6.95 crore. This is your real target." },
            ].map(item => (
              <div key={item.step} className="flex gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="text-3xl font-black text-orange-200 w-10 flex-shrink-0">{item.step}</div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Section 6 */}
          <SectionHeading>Building Your Corpus: EPF, NPS, SIP &amp; More</SectionHeading>
          <DataTable
            headers={["Pillar", "Expected Return", "Tax Benefit", "Risk"]}
            rows={[
              ["EPF", "8.15%", "EEE (fully exempt)", "Very Low"],
              ["NPS", "10–12%", "₹50K extra under 80CCD(1B)", "Low"],
              ["PPF", "7.1%", "EEE (fully exempt)", "Very Low"],
              ["Equity SIP", "12–14%", "ELSS under 80C", "Medium"],
            ]}
          />
          <h3 className="text-lg font-bold text-slate-800 mb-3 mt-6">Monthly SIP Required — Target ₹5 Crore at Age 60</h3>
          <DataTable
            headers={["Starting Age", "Monthly SIP", "Total Invested"]}
            rows={[
              ["25", "₹8,500", "₹35.7 lakhs"],
              ["30", "₹15,000", "₹54 lakhs"],
              ["35", "₹26,000", "₹78 lakhs"],
              ["40", "₹48,000", "₹1.15 crore"],
              ["45", "₹95,000", "₹1.71 crore"],
              ["50", "₹2,10,000", "₹2.52 crore"],
            ]}
          />
          <Callout type="warning">
            Starting at 40 instead of 25 means investing <strong>6x more per month</strong>. The cost of waiting is brutal.
          </Callout>

          {/* Section 7 */}
          <SectionHeading>7 Common Mistakes That Derail Retirement Plans</SectionHeading>
          <div className="space-y-4">
            {[
              { n: "1", title: "Ignoring Inflation", impact: "Underestimates corpus by 60–70%", fix: "Use an inflation-adjusted calculator" },
              { n: "2", title: "Overestimating EPF", impact: "EPF covers only 20–30% of actual needs", fix: "Track your EPF passbook, fill the gap with SIP" },
              { n: "3", title: "Starting Too Late", impact: "3x–6x higher monthly investment needed", fix: "Start today, even with ₹1,000/month" },
              { n: "4", title: "No Healthcare Buffer", impact: "Medical emergency wipes out 30–50% of corpus", fix: "Add 20% buffer + comprehensive health insurance" },
              { n: "5", title: "Ignoring Taxes Post-Retirement", impact: "FD interest taxed at slab rate (up to 30%)", fix: "Use tax-efficient instruments (SWP, SCSS, POMIS)" },
              { n: "6", title: "Not Reviewing the Plan", impact: "Plan becomes irrelevant as life changes", fix: "Annual review on your birthday" },
              { n: "7", title: "Withdrawing EPF on Job Change", impact: "Lose compounding, restart from zero", fix: "Always transfer EPF — never withdraw" },
            ].map(m => (
              <div key={m.n} className="border border-slate-200 rounded-xl p-4">
                <h4 className="font-bold text-slate-900 text-sm mb-2">Mistake #{m.n}: {m.title}</h4>
                <p className="text-xs text-red-600 mb-1"><strong>Impact:</strong> {m.impact}</p>
                <p className="text-xs text-emerald-700"><strong>Fix:</strong> {m.fix}</p>
              </div>
            ))}
          </div>

          {/* Section 8 */}
          <SectionHeading>Action Steps by Age Group</SectionHeading>
          <div className="space-y-4">
            {[
              { age: "In Your 20s (25–30)", color: "bg-blue-50 border-blue-200", steps: ["Start SIP of ₹5,000–10,000/month", "Ensure EPF contribution is maximised", "Open PPF account (15-year lock-in starts early)", "Get term insurance (₹1 crore+, cheap at this age)"] },
              { age: "In Your 30s (30–40)", color: "bg-emerald-50 border-emerald-200", steps: ["Increase SIP to ₹15,000–25,000/month", "Open NPS Tier 1 (extra ₹50K tax benefit)", "Start separate education fund for children", "Calculate exact gap using our calculator"] },
              { age: "In Your 40s (40–50)", color: "bg-amber-50 border-amber-200", steps: ["Aggressive SIP: ₹30,000–50,000/month", "Use VPF (Voluntary Provident Fund) for catch-up", "Reduce equity exposure gradually", "Consider delaying retirement 2–3 years if gap is large"] },
              { age: "In Your 50s (50–60)", color: "bg-red-50 border-red-200", steps: ["Maximise all retirement contributions", "Shift 50% corpus to safer instruments", "Buy comprehensive health insurance NOW", "Plan post-retirement income stream"] },
            ].map(a => (
              <div key={a.age} className={`border rounded-xl p-5 ${a.color}`}>
                <h4 className="font-bold text-slate-900 mb-3">{a.age}</h4>
                <ul className="space-y-1.5">
                  {a.steps.map(s => <li key={s} className="text-sm text-slate-700 flex items-start gap-2"><CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />{s}</li>)}
                </ul>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <SectionHeading>Frequently Asked Questions</SectionHeading>
          <div className="space-y-5 bg-slate-50 rounded-2xl p-6">
            {[
              { q: "How much money is enough to retire in India?", a: "For a moderate lifestyle in a Tier 1 city, you need ₹5–7 crore at age 60. For Tier 2 cities, ₹3–4 crore is sufficient. Use an inflation-adjusted calculator for your exact number." },
              { q: "Is ₹1 crore enough to retire in India?", a: "No, for most people. ₹1 crore generates ₹30,000–40,000/month via SWP. After inflation, this purchasing power erodes rapidly. ₹1 crore might work in Tier 3 cities with a frugal lifestyle, but it's risky." },
              { q: "What is the 4% rule in India?", a: "The US 4% rule doesn't work well in India due to higher inflation (6–7%) and out-of-pocket healthcare costs. Indians should use a 3–3.5% withdrawal rate and account for medical expenses separately." },
              { q: "Can I retire at 45 in India (FIRE)?", a: "Yes, but you need aggressive planning. You'll need 25x your annual expenses, a low withdrawal rate (3–3.5%), a frugal lifestyle, and ideally a side income. Use RetirePro's calculator to check your FIRE number." },
              { q: "How do I generate monthly income after retirement?", a: "Best options: SWP from mutual funds (tax-efficient), SCSS at 8.2% quarterly, POMIS at 7.4% monthly, Pradhan Mantri Vaya Vandana Yojana, dividend stocks, and rental income if you have property." },
            ].map(item => (
              <div key={item.q} className="border-b border-slate-200 pb-5 last:border-0 last:pb-0">
                <h3 className="font-semibold text-slate-900 mb-2 text-sm">{item.q}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-8 text-center text-white mt-10">
            <h2 className="text-2xl font-bold mb-3">Calculate Your Exact Retirement Corpus</h2>
            <p className="text-orange-100 mb-6">India-specific assumptions. Inflation-adjusted projections. Free — no login required.</p>
            <Link href="/free-plan" className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold px-8 py-3 rounded-full hover:bg-orange-50 transition-colors">
              Find My Retirement Number <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Related Articles */}
          <RelatedArticles />

          {/* Back */}
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
