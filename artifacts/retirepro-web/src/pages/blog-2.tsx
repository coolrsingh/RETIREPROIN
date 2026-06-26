import { Link } from "wouter";
import { motion } from "framer-motion";
import { ChartLine, ArrowRight, CheckCircle, XCircle } from "lucide-react";
import BrandLogo from "@/components/brand-logo";

function ComparisonTable() {
  const rows = [
    { feature: "Expected Returns", nps: "9–12% (market-linked)", ppf: "7.1% (fixed, govt.)", sip: "12–15% (market-linked)" },
    { feature: "Risk", nps: "Low-Medium", ppf: "Zero", sip: "Medium-High" },
    { feature: "Lock-in", nps: "Until age 60", ppf: "15 years", sip: "None (ELSS: 3 yrs)" },
    { feature: "Tax on Maturity", nps: "60% tax-free, 40% annuity", ppf: "Fully tax-free (EEE)", sip: "LTCG 12.5% above ₹1.25L" },
    { feature: "Max Investment", nps: "No limit", ppf: "₹1.5L/year", sip: "No limit" },
    { feature: "Tax Deduction", nps: "Up to ₹2L (80C + 80CCD1B)", ppf: "Up to ₹1.5L (80C)", sip: "Up to ₹1.5L (ELSS, 80C)" },
    { feature: "Flexibility", nps: "Very low", ppf: "Low", sip: "High" },
  ];
  return (
    <div className="overflow-x-auto my-6">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-900 text-white">
            <th className="text-left p-3 rounded-tl-lg font-medium">Feature</th>
            <th className="text-left p-3 font-medium text-blue-300">NPS</th>
            <th className="text-left p-3 font-medium text-emerald-300">PPF</th>
            <th className="text-left p-3 rounded-tr-lg font-medium text-purple-300">Equity SIP</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.feature} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
              <td className="p-3 font-medium text-slate-700 border-b border-slate-200">{row.feature}</td>
              <td className="p-3 text-slate-600 border-b border-slate-200">{row.nps}</td>
              <td className="p-3 text-slate-600 border-b border-slate-200">{row.ppf}</td>
              <td className="p-3 text-slate-600 border-b border-slate-200">{row.sip}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CorpusComparison() {
  const data = [
    { instrument: "PPF (7.1%)", corpus: "~₹33 lakh", bar: 22, color: "bg-emerald-400", note: "Capped at ₹1.5L/year, 15-yr lock-in" },
    { instrument: "NPS (10% blended)", corpus: "~₹76 lakh", bar: 51, color: "bg-blue-500", note: "+ ₹30K+/yr tax savings" },
    { instrument: "Equity SIP (12%)", corpus: "~₹99 lakh", bar: 66, color: "bg-indigo-500", note: "No lock-in, LTCG tax applies" },
    { instrument: "Equity SIP (15%)", corpus: "~₹1.5 crore", bar: 100, color: "bg-purple-600", note: "Best case, top funds historically" },
  ];
  return (
    <div className="bg-slate-50 rounded-2xl p-6 my-6 border border-slate-200">
      <h3 className="font-bold text-slate-900 mb-1">₹10,000/month for 20 years — who wins?</h3>
      <p className="text-xs text-slate-500 mb-5">(40-year-old investing until retirement at 60)</p>
      <div className="space-y-4">
        {data.map(item => (
          <div key={item.instrument}>
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-sm font-medium text-slate-700">{item.instrument}</span>
              <span className="font-bold text-slate-900">{item.corpus}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div className={`${item.color} h-3 rounded-full`} style={{ width: `${item.bar}%` }} />
            </div>
            <p className="text-xs text-slate-400 mt-1">{item.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Blog2() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <BrandLogo href={null} textClassName="text-slate-800" />
          </Link>
          <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1">
            Free Calculator <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <div className="bg-gradient-to-br from-emerald-900 to-teal-900 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block bg-white/15 text-emerald-200 text-sm font-semibold px-3 py-1 rounded-full mb-6">
              Investment Guide · 9 min read
            </span>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
              NPS vs PPF vs Mutual Fund SIP: Which Builds the Biggest Retirement Corpus in India?
            </h1>
            <p className="text-emerald-200 text-lg leading-relaxed">
              Real numbers. No fluff. India-specific context. We compare all three so you can stop guessing and start investing.
            </p>
          </motion.div>
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }}>
          <p className="text-lg text-slate-700 leading-relaxed mb-8">
            Your colleague swears by NPS for the tax benefits. Your dad thinks PPF is the only safe option. Every finance influencer on YouTube is screaming "SIP hai toh set hai." So who's right? Honestly? <strong>All of them — and none of them.</strong> Because the real answer depends on your stage of life, your tax situation, and how much risk you can actually stomach when markets fall 30%.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mb-4">The Quick Cheat Sheet</h2>
          <ComparisonTable />

          <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-10">NPS — The Government's Most Underrated Retirement Scheme</h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            NPS has a reputation problem. But if you're in a high income tax bracket, it might be the smartest thing you're not using.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-4">
            <h3 className="font-bold text-blue-900 mb-2">The tax advantage is real:</h3>
            <p className="text-blue-800 text-sm leading-relaxed">
              Under Section 80CCD(1B), you get an additional ₹50,000 deduction over and above the standard ₹1.5 lakh under 80C. If you're in the 30% tax bracket, that's <strong>₹15,000 saved on taxes every year</strong> — roughly ₹3 lakh over 20 years just from NPS.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
              <div className="flex items-center gap-2 mb-2"><CheckCircle className="h-4 w-4 text-emerald-600" /><span className="font-semibold text-emerald-900 text-sm">Best for</span></div>
              <p className="text-sm text-emerald-800">Salaried professionals in 20–30% tax bracket who want disciplined, forced long-term savings with meaningful tax savings.</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
              <div className="flex items-center gap-2 mb-2"><XCircle className="h-4 w-4 text-red-600" /><span className="font-semibold text-red-900 text-sm">The catch</span></div>
              <p className="text-sm text-red-800">You cannot touch this money easily until 60. The mandatory 40% annuity at retirement has modest rates (5–6%).</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-4">PPF — The Safe Harbour That Never Lets You Down</h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            Backed by the Government of India, PPF has never defaulted and gives you fully tax-free returns — EEE status (Exempt on investment, growth, and withdrawal).
          </p>
          <div className="bg-slate-900 rounded-xl p-6 text-white my-4">
            <div className="text-sm text-slate-400 mb-1">₹1.5 lakh/year (maximum) for 20 years at 7.1%</div>
            <div className="text-3xl font-bold text-emerald-400">~₹65 lakh</div>
            <div className="text-sm text-slate-400 mt-1">Entirely tax-free. But not enough on its own.</div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
              <div className="flex items-center gap-2 mb-2"><CheckCircle className="h-4 w-4 text-emerald-600" /><span className="font-semibold text-emerald-900 text-sm">Best for</span></div>
              <p className="text-sm text-emerald-800">Conservative investors, anyone within 10 years of retirement, and as the "safe floor" of any balanced portfolio.</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
              <div className="flex items-center gap-2 mb-2"><XCircle className="h-4 w-4 text-red-600" /><span className="font-semibold text-red-900 text-sm">The catch</span></div>
              <p className="text-sm text-red-800">With 5–6% inflation, a 7.1% return means ~1–2% real return. PPF preserves wealth. It doesn't create it dramatically.</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-4">Equity Mutual Fund SIP — The Growth Engine</h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            The most flexible, highest-potential retirement tool available — and the one that requires the most emotional discipline.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
            {[
              { label: "₹10K/month, 15 years, 12%", value: "~₹50 lakh" },
              { label: "₹10K/month, 20 years, 12%", value: "~₹99 lakh" },
              { label: "₹10K/month, 25 years, 12%", value: "~₹1.9 crore" },
            ].map(item => (
              <div key={item.label} className="bg-slate-50 rounded-xl p-4 text-center border border-slate-200">
                <div className="text-xs text-slate-500 mb-2">{item.label}</div>
                <div className="text-xl font-bold text-blue-600">{item.value}</div>
              </div>
            ))}
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
            <p className="text-amber-800 text-sm leading-relaxed">
              <strong>The double-edged sword:</strong> The same people who can exit anytime often do — right when markets have fallen and their instinct says "cut losses." Then markets recover, they've missed the gains, and they've defeated the purpose entirely.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-4">The Numbers That Actually Matter</h2>
          <CorpusComparison />

          <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-10">So Which One Should You Actually Use?</h2>
          <p className="text-slate-700 leading-relaxed mb-6">
            <strong>All three — in the right proportion.</strong> Each one solves a different problem.
          </p>
          <div className="bg-slate-900 rounded-2xl p-6 text-white my-6">
            <h3 className="font-bold text-blue-300 mb-4">Practical split for a 38-year-old earning ₹1 lakh/month:</h3>
            <div className="space-y-3 text-sm">
              {[
                { instrument: "NPS Tier 1", amount: "₹5,000/month", purpose: "Tax saving + moderate growth", color: "text-blue-400" },
                { instrument: "PPF", amount: "₹5,000/month", purpose: "Safe, tax-free base", color: "text-emerald-400" },
                { instrument: "Equity SIP (flexi-cap)", amount: "₹10,000/month", purpose: "Long-term wealth creation", color: "text-purple-400" },
              ].map(row => (
                <div key={row.instrument} className="flex justify-between items-center border-b border-white/10 pb-3">
                  <div><span className={`font-semibold ${row.color}`}>{row.instrument}</span><span className="text-slate-400 ml-2 text-xs">— {row.purpose}</span></div>
                  <span className="font-bold">{row.amount}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-1">
                <span className="font-bold text-white">Total</span>
                <span className="font-bold text-xl text-amber-400">₹20,000/month</span>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-4">The Age Factor</h2>
          <div className="space-y-4 mb-8">
            {[
              { age: "In your 30s", advice: "Go heavy on equity SIPs. Time is your biggest asset. You can afford volatility. NPS for the tax benefit, PPF for discipline, but equity SIP should be the bulk.", color: "border-l-blue-500" },
              { age: "In your 40s", advice: "Balance matters more now. Increase NPS and PPF proportion. Still keep equity SIPs running — you have 15–20 years, which is enough.", color: "border-l-amber-500" },
              { age: "In your 50s", advice: "Capital preservation starts mattering. Shift NPS allocation toward more bonds. Keep a smaller equity SIP running. Focus on maximising corpus while protecting what you have.", color: "border-l-red-500" },
            ].map(item => (
              <div key={item.age} className={`border-l-4 ${item.color} pl-4`}>
                <h3 className="font-bold text-slate-900 mb-1">{item.age}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.advice}</p>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="bg-slate-50 rounded-2xl p-8 mb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-5">
              {[
                { q: "Which is better — NPS or PPF for retirement?", a: "Both serve different purposes. PPF offers guaranteed, fully tax-free returns (currently 7.1%) with zero risk, while NPS offers market-linked returns of 9–12% with significant tax benefits. Using both together is more effective than choosing one." },
                { q: "Is SIP better than PPF for long-term retirement planning?", a: "For a 15+ year horizon, equity SIPs have historically delivered 1.5x or more returns compared to PPF. However, SIP returns are market-linked and not guaranteed, while PPF returns are fixed and risk-free. A combination works best." },
                { q: "Can NPS give 12% returns?", a: "NPS equity funds have historically delivered 9–12% CAGR over long periods, with some periods higher. For long-term planning, 10–11% is a reasonable assumption for an equity-heavy NPS portfolio." },
                { q: "What happens to NPS money at retirement?", a: "At 60, you can withdraw 60% of your NPS corpus as a tax-free lump sum. The remaining 40% must be used to purchase an annuity — a regular monthly income for the rest of your life." },
              ].map(item => (
                <div key={item.q} className="border-b border-slate-200 pb-5 last:border-0 last:pb-0">
                  <h3 className="font-semibold text-slate-900 mb-2">{item.q}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-3">See How NPS, PPF, and SIP Work Together For You</h2>
            <p className="text-emerald-100 mb-6">Use the free Retirement Calculator — no login required.</p>
            <Link href="/" className="inline-block bg-white text-emerald-700 font-bold px-8 py-3 rounded-full hover:bg-emerald-50 transition-colors">
              Calculate My Retirement Corpus →
            </Link>
          </div>
        </motion.div>
      </article>
    </div>
  );
}
