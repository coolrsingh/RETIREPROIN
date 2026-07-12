import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, AlertTriangle, CheckCircle, TrendingDown } from "lucide-react";
import BrandLogo from "@/components/brand-logo";
import {
  AreaChart, Area, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer, Cell,
} from "recharts";

const PUBLISH_DATE = "12 July 2026";

function ReadingProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setPct(total ? Math.min(100, (scrolled / total) * 100) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 z-[200] h-[3px] bg-slate-200/50">
      <div
        className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-[width] duration-75"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function ArticleSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-1 h-8 rounded-full bg-orange-500 flex-shrink-0 mt-1" />
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Callout({ type, children }: { type: "warning" | "success" | "info"; children: React.ReactNode }) {
  const config = {
    warning: { bg: "bg-amber-50 border-amber-300", icon: <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" /> },
    success: { bg: "bg-emerald-50 border-emerald-300", icon: <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" /> },
    info: { bg: "bg-blue-50 border-blue-300", icon: <TrendingDown className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" /> },
  };
  const { bg, icon } = config[type];
  return (
    <div className={`flex gap-3 border rounded-xl p-4 my-6 ${bg}`}>
      {icon}
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

function StatBox({ number, label, sub }: { number: string; label: string; sub?: string }) {
  return (
    <div className="text-center p-6 bg-slate-900 rounded-2xl text-white">
      <div className="text-3xl font-bold text-orange-400 mb-1">{number}</div>
      <div className="text-sm text-slate-200 font-medium">{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </div>
  );
}

const healthcareChartData = (() => {
  const data = [];
  for (let i = 0; i <= 20; i += 2) {
    data.push({
      year: String(2026 + i),
      "Medical cost\n(13% inflation)": Math.round(10 * Math.pow(1.13, i) * 10) / 10,
      "Same cost\n(6% inflation)": Math.round(10 * Math.pow(1.06, i) * 10) / 10,
      "Fixed ₹50L cover": 50,
    });
  }
  return data;
})();

const yieldData = [
  { asset: "Real Estate\n(Rental)", yield: 2.5 },
  { asset: "FD / RD", yield: 6.8 },
  { asset: "Debt MF", yield: 7.5 },
  { asset: "Balanced\nAdvantage", yield: 10.0 },
  { asset: "Equity MF\n(long-term)", yield: 12.5 },
];

const BAR_COLORS = ["#94a3b8", "#60a5fa", "#4ade80", "#fb923c", "#2563eb"];

function HealthcareChart() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 my-8 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900">
          A ₹10 Lakh Medical Procedure — What It Will Cost You
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Healthcare inflates at ~13% p.a. in India — your fixed health cover quietly runs out.
        </p>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={healthcareChartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="medGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.03} />
            </linearGradient>
            <linearGradient id="genGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="year" tick={{ fontSize: 12, fill: "#64748b" }} />
          <YAxis
            tick={{ fontSize: 12, fill: "#64748b" }}
            tickFormatter={v => `₹${v}L`}
          />
          <Tooltip
            formatter={(value: number, name: string) => [`₹${value} lakh`, name.replace("\n", " ")]}
            contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13 }}
          />
          <Legend
            formatter={(value) => <span style={{ fontSize: 12 }}>{value.replace("\n", " ")}</span>}
          />
          <Area
            type="monotone"
            dataKey={"Medical cost\n(13% inflation)"}
            stroke="#ef4444"
            strokeWidth={2.5}
            fill="url(#medGrad)"
            dot={false}
          />
          <Area
            type="monotone"
            dataKey={"Same cost\n(6% inflation)"}
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#genGrad)"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="Fixed ₹50L cover"
            stroke="#10b981"
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="text-xs text-slate-400 mt-3 text-center">
        After ~14 years your ₹50L policy no longer covers a procedure that cost ₹10L today.
      </p>
    </div>
  );
}

function YieldGapChart() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 my-8 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900">
          The Yield Gap — Why Real Estate Doesn't Fund Retirement
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Annual returns by asset type vs the ~7% withdrawal rate a comfortable retirement requires.
        </p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={yieldData} margin={{ top: 10, right: 16, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="asset"
            tick={{ fontSize: 11, fill: "#64748b" }}
            interval={0}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#64748b" }}
            tickFormatter={v => `${v}%`}
            domain={[0, 14]}
          />
          <Tooltip
            formatter={(value: number) => [`${value}% p.a.`, "Annual yield"]}
            contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13 }}
          />
          <ReferenceLine
            y={7}
            stroke="#F15A24"
            strokeWidth={2}
            strokeDasharray="6 4"
            label={{ value: "~7% withdrawal needed", position: "insideTopRight", fontSize: 11, fill: "#F15A24", dy: -6 }}
          />
          <Bar dataKey="yield" radius={[6, 6, 0, 0]}>
            {yieldData.map((_, i) => (
              <Cell key={i} fill={BAR_COLORS[i]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-slate-400 mt-3 text-center">
        Real estate rental yield of 2–3% falls far short of the 7%+ withdrawal rate a retirement corpus needs to generate.
      </p>
    </div>
  );
}

export default function Blog3() {
  return (
    <div className="bg-white">
      <ReadingProgress />
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <BrandLogo textClassName="text-slate-800" />
          <Link href="/free-plan" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1">
            Free Planner <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <div className="bg-gradient-to-br from-[#0B1628] via-slate-900 to-slate-800 py-20 px-4">
        <div className="max-w-[960px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block bg-white/10 text-orange-300 text-sm font-semibold px-3 py-1 rounded-full mb-6 border border-white/10">
              HNI Planning · 9 min read
            </span>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-white">
              The ₹40 Crore Illusion: Why India's Wealthiest Retirees Are the Most Exposed
            </h1>
            <p className="text-lg text-slate-300 mb-6">
              Most Indian HNIs believe their net worth guarantees a comfortable retirement. Here's the quiet arithmetic that says otherwise — and what to do about it.
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span>RetirePro Editorial</span>
              <span>·</span>
              <span>{PUBLISH_DATE}</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>

          <p className="text-lg leading-relaxed text-slate-700 mb-8">
            Picture a man in his late fifties. Two flats in Mumbai, a commercial unit he rents out in Thane, a plot
            back in his hometown he's been meaning to sell "when the price is right," a portfolio of mutual funds and FDs,
            and a net worth statement that reads ₹40 crore. On paper, he is not just comfortable. He is done.
          </p>

          <p className="text-lg leading-relaxed text-slate-700 mb-8">
            It isn't. And the reason has nothing to do with how much he's worth. It has to do with what that worth is{" "}
            <em>made of</em> — and what it will be asked to survive.
          </p>

          <div className="grid grid-cols-3 gap-4 my-10">
            <StatBox number="50%+" label="HNI wealth in real estate" sub="Industry surveys, India HNIs" />
            <StatBox number="2–3%" label="Rental yield vs market value" sub="vs 6–8% withdrawal rate needed" />
            <StatBox number="13%" label="Annual medical inflation" sub="vs 5–6% general CPI" />
          </div>

          <ArticleSection title="Blind Spot One: Being Rich on Paper, Poor on Cash">
            <p className="text-slate-700 leading-relaxed mb-4">
              Real estate isn't just a large slice of Indian HNI wealth — it's the dominant one. Industry surveys
              consistently find that somewhere between a third and half of total wealth sits in residential and commercial
              property. The reasons are rational: tangible, trusted, a hedge against inflation, socially weighty.
              None of that is wrong.
            </p>
            <p className="text-slate-700 leading-relaxed mb-4">
              What it isn't, is <strong>liquid</strong>. And liquidity is the one thing retirement actually runs on.
            </p>

            <YieldGapChart />

            <Callout type="warning">
              <strong>The arithmetic nobody puts on a slide:</strong> Indian residential real estate typically yields
              2–3% in annual rental income against its market value. A retirement corpus needs to throw off 6–8% a year
              to fund a genuinely high-consumption lifestyle. A ₹20 crore property empire generating ₹40–50 lakh a year
              in rent isn't generating retirement income — it's generating a cheque that barely covers property tax and
              maintenance.
            </Callout>

            <p className="text-slate-700 leading-relaxed mb-4">
              Selling a ₹5 crore flat at a fair price, without a haircut for urgency, routinely takes six months to
              over a year — and that's assuming the market isn't soft when the need arises, which it frequently is,
              precisely because emergencies rarely arrive on a convenient economic cycle.
            </p>

            <Callout type="info">
              <strong>The key insight:</strong> the net worth number and the spendable number are not the same number.
              For most Indian HNIs, the gap between them is enormous.
            </Callout>
          </ArticleSection>

          <ArticleSection title="Blind Spot Two: The Corpus Being Eaten Alive Quietly">
            <p className="text-slate-700 leading-relaxed mb-4">
              Every retirement projection assumes some rate of expense inflation. Most Indian retirement calculators —
              and most financial advisors — use a blended household inflation assumption of 5–6% and call it done.
              That's roughly right for groceries, fuel, and utilities.
            </p>
            <p className="text-slate-700 leading-relaxed mb-4">
              It is nowhere close to right for <strong>healthcare</strong>.
            </p>

            <HealthcareChart />

            <p className="text-slate-700 leading-relaxed mb-4">
              Medical inflation in India has been running at 12–14% annually. That's not a rounding difference —
              it's triple the general CPI rate. At that pace, healthcare costs don't just rise: they{" "}
              <strong>double roughly every five to six years</strong>. A procedure that costs ₹10 lakh today plausibly
              costs ₹20 lakh in five years and approaching ₹40 lakh in ten — well within a single retirement.
            </p>

            <Callout type="warning">
              <strong>The policy trap:</strong> A ₹50 lakh sum insured bought a decade ago felt generous. Measured
              against today's private hospital billing, that same ₹50 lakh now covers a shrinking fraction of what it
              used to — and wealthy families opt for exactly the tier of care that's inflating fastest.
            </Callout>

            <p className="text-slate-700 leading-relaxed mb-4">
              The instinct for HNIs is often "I'm wealthy enough to self-insure." That instinct is exactly backwards.
              The richer the lifestyle, the <em>higher</em> the effective medical inflation rate actually experienced.
            </p>
          </ArticleSection>

          <ArticleSection title="Where the Two Collide">
            <p className="text-slate-700 leading-relaxed mb-4">
              A family's retirement plan looks fine because the net worth number is large. Then a medical event
              arrives — and the bill, inflated at three times the rate anyone budgeted for, is far larger than expected.
              The liquid portion of the portfolio gets drawn down faster than planned. It isn't enough. So the family
              looks at the property.
            </p>
            <p className="text-slate-700 leading-relaxed mb-4">
              And now they're selling real estate under duress: a compressed timeline, often a soft market, for an
              asset that never generated meaningful income while it sat there. They lose on the sale price. They lose the
              "it'll appreciate eventually" years. And the healthcare bill that triggered it all was inflating the entire
              time the sale dragged on.
            </p>
            <p className="text-slate-700 leading-relaxed">
              This is not bad luck. This is two extremely common, well-documented, entirely foreseeable patterns in
              Indian HNI wealth meeting at exactly the wrong moment.
            </p>
          </ArticleSection>

          <ArticleSection title="What an Honest Plan Looks Like Instead">
            <div className="space-y-4">
              {[
                {
                  title: "Cap real estate as a share of investable net worth",
                  body: "A primary residence is a lifestyle asset, not a retirement asset — it shouldn't be counted toward the corpus that funds monthly expenses, because you can't spend a house you're living in.",
                },
                {
                  title: "Build a liquidity ladder, not a liquidity hope",
                  body: "Hold enough in genuinely liquid instruments — liquid within days, not a year if the market cooperates — to cover 12–24 months of expenses plus a dedicated medical contingency, separate from the general emergency fund.",
                },
                {
                  title: "Inflate the healthcare line item honestly",
                  body: "Not at 5–6%, but closer to 12–14%, compounded across the full retirement horizon. Review sum insured every 2–3 years — a policy bought a decade ago almost certainly doesn't do its job anymore.",
                },
                {
                  title: "Treat a property sale as a planned event, not an emergency lever",
                  body: "If part of the strategy is to unlock real estate value in retirement, that unwind should be scheduled and modelled years in advance — not discovered as the only option when a bill lands unexpectedly.",
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-5 bg-slate-50 rounded-xl border border-slate-200">
                  <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block mb-1">{item.title}</strong>
                    <p className="text-slate-600 text-sm leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <Callout type="success">
              <strong>The real test:</strong> If you needed ₹50 lakh in cash next month, where would it actually come
              from — and how would that answer change during a market downturn? That question, more than any single
              number on a net worth statement, tells you whether a retirement plan actually works.
            </Callout>
          </ArticleSection>

          <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-2xl p-8 text-center text-white mt-12">
            <h2 className="text-2xl font-bold mb-3 text-white">
              Stress-test your own retirement plan — free
            </h2>
            <p className="text-orange-100 mb-6 max-w-xl mx-auto">
              RetirePro models your real liquidity — not just your net worth — against the timelines that actually matter.
              No login required. Takes 60 seconds.
            </p>
            <Link href="/free-plan" className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold px-8 py-3 rounded-full hover:bg-orange-50 transition-colors">
              Explore Your Free Plan <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200 pb-16">
            <Link href="/blog" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 text-sm">
              ← Back to all articles
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
