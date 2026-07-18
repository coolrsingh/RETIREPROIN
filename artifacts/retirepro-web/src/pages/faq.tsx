import { Link } from "wouter";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, HelpCircle, ArrowRight } from "lucide-react";
import { useState } from "react";
import BrandLogo from "@/components/brand-logo";

const faqs = [
  {
    question: "How much money do I need to retire in India?",
    answer: "For a comfortable retirement in India, you typically need ₹1.5 crore to ₹5 crore depending on your city, lifestyle, and age. In Tier 1 cities like Mumbai or Bangalore with a moderate lifestyle, ₹5–7 crore is recommended. For Tier 2 cities, ₹3–4 crore may be sufficient. Use our free retirement calculator to get your exact, inflation-adjusted number.",
  },
  {
    question: "Is ₹1 crore enough to retire in India?",
    answer: "No, for most people. ₹1 crore generates only ₹30,000–40,000/month through a Systematic Withdrawal Plan (SWP). After inflation, this purchasing power erodes rapidly. ₹1 crore might work in Tier 3 cities with a frugal lifestyle, but it's risky for most Indians.",
  },
  {
    question: "How much monthly income do I need after retirement?",
    answer: "A good rule: 70–80% of your pre-retirement income. So if you earn ₹1 lakh/month now, plan for ₹70,000–80,000/month post-retirement. However, account for inflation — ₹70,000 today will need to be ₹2–3 lakhs in 25 years to maintain the same lifestyle.",
  },
  {
    question: "What is the best retirement plan in India?",
    answer: "There's no single 'best' plan. The optimal strategy combines EPF (employer-matched, tax-free), NPS (market-linked, extra ₹50K tax benefit under 80CCD(1B)), PPF (guaranteed returns, tax-free), Equity SIPs (growth engine at 12–14% CAGR), and comprehensive health insurance for protection.",
  },
  {
    question: "Can I retire at 45 in India?",
    answer: "Yes, but you need aggressive planning. The FIRE (Financial Independence, Retire Early) movement is growing in India. You'll need 25x your annual expenses invested, a low withdrawal rate (3–3.5%), and ideally a side income or passion project. Use our RetirePro calculator to check feasibility.",
  },
  {
    question: "What happens if I outlive my retirement corpus?",
    answer: "This is a real risk with increasing life expectancy (85+ years). Solutions: plan for 90+ years, keep 20% corpus in annuity plans, maintain part-time work options, consider reverse mortgage, or account for family support. RetirePro lets you model life expectancy up to 100 years.",
  },
  {
    question: "How do I generate monthly income after retirement?",
    answer: "Best options for Indians: (1) SWP from mutual funds (tax-efficient), (2) Senior Citizen Savings Scheme — SCSS at 8.2% quarterly, (3) Post Office Monthly Income Scheme — POMIS at 7.4% monthly, (4) Pradhan Mantri Vaya Vandana Yojana at 7.4% pension, (5) dividend stocks, and (6) rental income if you own property.",
  },
  {
    question: "Is RetirePro free to use?",
    answer: "Yes, RetirePro is completely free to use. No account creation, no email required, and no hidden charges. You can build a complete retirement plan with income projections, expense tracking, children's education goals, and visual charts without signing up.",
  },
  {
    question: "What makes RetirePro different from other retirement calculators?",
    answer: "RetirePro is built specifically for India with India-specific assumptions: 7% general inflation, 8% education inflation, EPF and NPS integration, children's education and marriage goals, home loan EMI impact, mini-retirement breaks, and joint retirement planning. Most calculators use global assumptions that don't apply to Indian conditions.",
  },
  {
    question: "Does RetirePro require login or signup?",
    answer: "No. RetirePro does not require any login, signup, or email address to use the full calculator. Your data is processed in your browser. You can optionally sign in to save your plan and access it later.",
  },
  {
    question: "How accurate is the RetirePro calculator?",
    answer: "RetirePro uses standard financial formulas with conservative, India-specific assumptions: 7% general inflation, 8% education inflation, 12% pre-retirement returns, and 8% post-retirement returns. You can customise all assumptions. While no calculator can predict the future, RetirePro provides a realistic baseline for planning.",
  },
  {
    question: "Can I plan for mini-retirements or sabbaticals?",
    answer: "Yes, RetirePro uniquely supports mini-retirement planning. You can add career breaks (e.g., a 1-year sabbatical at age 40) and see exactly how it affects your overall retirement corpus. This is especially useful for professionals in tech, consulting, or creative fields.",
  },
  {
    question: "What retirement instruments does RetirePro support?",
    answer: "RetirePro supports all major Indian retirement instruments: Employee Provident Fund (EPF), National Pension System (NPS), Public Provident Fund (PPF), Equity Linked Savings Scheme (ELSS), mutual fund SIPs, fixed deposits, and other investments. You can input your existing balances and monthly contributions for each.",
  },
  {
    question: "Is my data safe with RetirePro?",
    answer: "Absolutely. RetirePro processes all calculations in your browser. We do not store your personal financial data on our servers. We use SSL encryption and never sell or share your data with third parties. If you choose to sign in, only your profile data is saved securely.",
  },
];

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className="border border-slate-200 rounded-xl overflow-hidden"
    >
      <button
        className="w-full text-left flex items-center justify-between gap-4 px-6 py-5 bg-white hover:bg-orange-50 transition-colors"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="font-semibold text-slate-900 text-sm sm:text-base leading-snug">{question}</span>
        {open
          ? <ChevronUp className="h-5 w-5 text-orange-500 flex-shrink-0" />
          : <ChevronDown className="h-5 w-5 text-slate-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-6 pb-5 pt-1 bg-white border-t border-slate-100">
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">{answer}</p>
        </div>
      )}
    </motion.div>
  );
}

export default function FAQ() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-xl shadow-sm border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/">
            <BrandLogo textClassName="text-slate-900" />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/blog" className="hover:text-orange-600 transition-colors">Blog</Link>
            <Link href="/faq" className="text-orange-600">FAQ</Link>
            <Link href="/free-plan" className="hover:text-orange-600 transition-colors">Free Planner</Link>
          </nav>
          <Link href="/free-plan">
            <button className="bg-[#F15A24] hover:bg-[#d44d1e] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              Plan My Retirement
            </button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-orange-50 to-white py-14 px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <HelpCircle className="h-3.5 w-3.5" />
            Frequently Asked Questions
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
            Retirement Planning — <span className="text-[#F15A24]">Answered</span>
          </h1>
          <p className="text-slate-600 max-w-xl mx-auto text-base">
            Everything you need to know about planning retirement in India — corpus, SIP, EPF, NPS, and how RetirePro works.
          </p>
        </motion.div>
      </section>

      {/* FAQ List */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FAQItem key={i} question={faq.question} answer={faq.answer} index={i} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mt-14 text-center bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl px-6 py-10"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Still have questions?</h2>
          <p className="text-slate-600 mb-6 text-sm">
            Use our free calculator and see your exact retirement number — no signup required.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/free-plan">
              <button className="inline-flex items-center gap-2 bg-[#F15A24] hover:bg-[#d44d1e] text-white font-semibold px-6 py-3 rounded-xl transition-colors">
                Calculate My Corpus Free
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
            <a
              href={`https://wa.me/919819590598?text=${encodeURIComponent("Hi, I have a question about retirement planning in India.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0" style={{ fill: "#25D366" }} xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Ask on WhatsApp
            </a>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-8 py-8 text-center text-xs text-slate-500">
        <p>© 2026 RetirePro · <Link href="/privacy-policy" className="hover:underline">Privacy</Link> · <Link href="/disclaimer" className="hover:underline">Disclaimer</Link></p>
      </footer>
    </div>
  );
}
