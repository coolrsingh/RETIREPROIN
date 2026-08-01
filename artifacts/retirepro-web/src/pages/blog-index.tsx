import { Link } from "wouter";
import { motion } from "framer-motion";
import { ChartLine, ArrowRight, Clock, Tag } from "lucide-react";
import BrandLogo from "@/components/brand-logo";
import { usePageMeta } from "@/hooks/usePageMeta";

const POSTS = [
  {
    slug: "sabbatical-mini-retirement-startup-calculator",
    title: "The Mini-Retirement Test: How a Techie Can Take 3 Years Off to Build a Startup Without Wrecking Retirement",
    excerpt: "₹21.6 lakh of paused SIPs becomes ₹2.8 crore of missing corpus at 60. Here's the exact math on sabbaticals, runway, and how to model a career break without flying blind on retirement.",
    readTime: "11 min read",
    tag: "Mini Retirement",
    tagColor: "bg-indigo-100 text-indigo-800",
    gradient: "from-slate-800 via-indigo-950 to-slate-900",
    date: "1 Aug 2026",
    dateTime: "2026-08-01",
  },
  {
    slug: "best-retirement-planning-tool-india",
    title: "The Single Best Tool to Fix India's Looming Retirement Crisis",
    excerpt: "Most Indians are planning retirement with dangerously wrong numbers. Here's why generic two-box calculators fail — and how RetirePro gives you the honest, India-specific picture in 60 seconds.",
    readTime: "9 min read",
    tag: "Retirement Planning",
    tagColor: "bg-blue-100 text-blue-800",
    gradient: "from-slate-900 via-blue-950 to-indigo-900",
    date: "1 Aug 2026",
    dateTime: "2026-08-01",
  },
  {
    slug: "nps-vs-ups-vs-ops-which-is-better",
    title: "NPS vs UPS vs OPS: Which Pension Scheme Is Actually Better for You? (2026 Deep Dive)",
    excerpt: "UPS went live April 2025 — and lakhs of govt employees face an irreversible choice. Full comparison: pension amount, contributions, family pension, market risk, and who should pick what.",
    readTime: "13 min read",
    tag: "Government Pension",
    tagColor: "bg-amber-100 text-amber-800",
    gradient: "from-slate-900 via-slate-800 to-amber-900",
    date: "22 Jul 2026",
    dateTime: "2026-07-22",
  },
  {
    slug: "nps-withdrawal-rules-2026",
    title: "NPS Withdrawal Rules 2026: The New 80:20 Rule, Exit at 15 Years & Stay Invested Till 85",
    excerpt: "PFRDA has overhauled NPS exits. 80% lump sum, ₹8 lakh full-exit threshold, 15-year early exit, deferral to 85. Everything changed — and the tax fine print nobody mentions.",
    readTime: "13 min read",
    tag: "NPS Guide",
    tagColor: "bg-amber-100 text-amber-800",
    gradient: "from-amber-800 via-orange-900 to-slate-900",
    date: "22 Jul 2026",
    dateTime: "2026-07-22",
  },
  {
    slug: "how-much-money-to-retire-in-india",
    title: "How Much Money Do I Need to Retire in India? (The Honest Answer Nobody Gives You)",
    excerpt: "₹1 crore? ₹5 crore? ₹10 crore? There is no universal number — but there is a formula. Here's how to calculate yours from scratch, with real examples and the 5 mistakes that destroy most plans.",
    readTime: "11 min read",
    tag: "Retirement Basics",
    tagColor: "bg-orange-100 text-orange-800",
    gradient: "from-red-900 via-orange-800 to-slate-900",
    date: "22 Jul 2026",
    dateTime: "2026-07-22",
  },
  {
    slug: "retirement-planning-self-employed-india",
    title: "Retirement Planning for Self-Employed Indians: The Complete Guide Nobody Wrote for You",
    excerpt: "No EPF, no employer, no pension. Every rupee of your retirement must be consciously created by you — or it simply won't exist. NPS, PPF, APY, SIPs, and the corpus calculation most skip.",
    readTime: "12 min read",
    tag: "Self-Employed",
    tagColor: "bg-blue-100 text-blue-800",
    gradient: "from-indigo-900 via-blue-900 to-slate-900",
    date: "22 Jul 2026",
    dateTime: "2026-07-22",
  },
  {
    slug: "retirement-corpus-calculator-india-serious-planners",
    title: "Why Serious Retirement Planners in India Are Ditching Quick Google Calculators",
    excerpt: "That number you got from a two-box calculator is almost certainly wrong. Here's what actually changes your retirement corpus — and why 76% of Indians are flying blind.",
    readTime: "11 min read",
    tag: "Serious Planning",
    tagColor: "bg-amber-100 text-amber-700",
    gradient: "from-slate-900 via-amber-950 to-orange-900",
    date: "19 Jul 2026",
    dateTime: "2026-07-19",
  },
  {
    slug: "how-much-to-retire-india",
    title: "How Much Money Do You Need to Retire in India? [2026 Complete Guide]",
    excerpt: "₹1.5 crore or ₹6.5 crore? The answer depends on your city, lifestyle, and one number most calculators ignore: inflation. Here's the complete India-specific formula.",
    readTime: "10 min read",
    tag: "Retirement Basics",
    tagColor: "bg-orange-100 text-orange-700",
    gradient: "from-orange-500 to-red-600",
    date: "18 Jul 2026",
    dateTime: "2026-07-18",
  },
  {
    slug: "real-estate-rich-retirement-illusion",
    title: "The ₹40 Crore Illusion: Why India's Wealthiest Retirees Are the Most Exposed",
    excerpt: "Most Indian HNIs believe their net worth guarantees a comfortable retirement. Here's the quiet arithmetic that says otherwise — and what to do about it.",
    readTime: "9 min read",
    tag: "HNI Planning",
    tagColor: "bg-orange-100 text-orange-700",
    gradient: "from-slate-700 to-slate-900",
    date: "12 Jul 2026",
    dateTime: "2026-07-12",
  },
  {
    slug: "nps-vs-ppf-vs-sip",
    title: "NPS vs PPF vs Mutual Fund SIP: Which Builds the Biggest Retirement Corpus in India?",
    excerpt: "Real numbers, no fluff. We compare all three with India-specific context so you can stop guessing and start investing.",
    readTime: "9 min read",
    tag: "Investment Guide",
    tagColor: "bg-emerald-100 text-emerald-700",
    gradient: "from-emerald-600 to-teal-700",
    date: "11 Jul 2026",
    dateTime: "2026-07-11",
  },
  {
    slug: "why-indians-fail-retirement",
    title: "Why Most Indians Fail to Plan for Retirement — And How One Small Habit Can Change Everything",
    excerpt: "93% of Indians over 50 regret not starting retirement planning sooner. Here's what goes wrong and the one small shift that changes everything.",
    readTime: "8 min read",
    tag: "Retirement Basics",
    tagColor: "bg-blue-100 text-blue-700",
    gradient: "from-blue-600 to-indigo-700",
    date: "10 Jul 2026",
    dateTime: "2026-07-10",
  },
];

export default function BlogIndex() {
  usePageMeta({
    title: "Retirement Planning Blog — India | RetirePro",
    description: "Expert articles on retirement planning in India — corpus targets, NPS vs PPF vs SIP, FIRE, HNI strategies, and more. No login required.",
    canonical: "https://retirepro.in/blog",
    ogUrl: "https://retirepro.in/blog",
    ogType: "website",
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <BrandLogo href={null} textClassName="text-slate-800" />
          </Link>
          <Link href="/" className="text-sm font-medium text-blue-600 hover:text-blue-700">← Back to Calculator</Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-center mb-12">
            <span className="inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full mb-4">
              Retirement Planning Guides
            </span>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Learn Before You Plan</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              India-specific retirement planning guides written for working professionals who want clarity, not jargon.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {POSTS.map((post, i) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              >
                <Link href={`/blog/${post.slug}`} className="group block bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className={`h-48 bg-gradient-to-br ${post.gradient} flex items-end p-6`}>
                      <span className={`text-sm font-semibold px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm`}>
                        {post.tag}
                      </span>
                    </div>
                    <div className="p-6">
                      <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight">
                        {post.title}
                      </h2>
                      <p className="text-slate-600 text-sm leading-relaxed mb-4">{post.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{post.readTime}</span>
                          <span>·</span>
                          <time dateTime={post.dateTime} className="text-orange-500 font-medium">{post.date}</time>
                        </div>
                        <span className="flex items-center gap-1 text-sm font-semibold text-blue-600 group-hover:gap-2 transition-all">
                          Read article <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-3">Ready to Calculate Your Retirement Number?</h2>
            <p className="text-blue-100 mb-6">Free. No login required. Takes 60 seconds.</p>
            <Link href="/" className="inline-block bg-white text-blue-700 font-bold px-8 py-3 rounded-full hover:bg-blue-50 transition-colors">
              Try the Free Calculator →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
