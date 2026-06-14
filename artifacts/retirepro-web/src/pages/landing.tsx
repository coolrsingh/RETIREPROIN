import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChartLine, Zap, Shield, BarChart3, ArrowRight, TrendingUp, Users, Clock,
  CheckCircle, AlertTriangle, BookOpen, Star, Lock
} from "lucide-react";

// ─── Animated counter ────────────────────────────────────────────────────────
function AnimatedNumber({ target, prefix = "", suffix = "" }: { target: number; prefix?: string; suffix?: string }) {
  const [displayed, setDisplayed] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const step = target / 60;
        const id = setInterval(() => {
          start += step;
          if (start >= target) { setDisplayed(target); clearInterval(id); }
          else setDisplayed(Math.round(start));
        }, 16);
      }
    }, { threshold: 0.4 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{prefix}{displayed.toLocaleString("en-IN")}{suffix}</span>;
}

// ─── Floating 3D card ────────────────────────────────────────────────────────
function FloatingCard() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-8, 8]);
  const springX = useSpring(rotateX, { stiffness: 80, damping: 15 });
  const springY = useSpring(rotateY, { stiffness: 80, damping: 15 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      style={{ perspective: 800 }}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      className="cursor-pointer"
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.div
        style={{ rotateX: springX, rotateY: springY }}
        className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl w-72"
      >
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <span className="text-white/80 text-sm font-medium">Priya's Retirement Plan</span>
        </div>
        <div className="mb-4">
          <div className="text-white/60 text-xs mb-0.5">Projected corpus at 60</div>
          <div className="text-3xl font-black text-white">₹3.2 Cr</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-3">
            <div className="text-white/50 text-xs">Required</div>
            <div className="text-white font-bold">₹4.5 Cr</div>
          </div>
          <div className="bg-amber-500/20 rounded-xl p-3">
            <div className="text-amber-300 text-xs">Gap</div>
            <div className="text-amber-300 font-bold">₹1.3 Cr</div>
          </div>
        </div>
        <div className="mt-4 bg-blue-500/20 rounded-xl p-3 border border-blue-400/30">
          <div className="text-blue-300 text-xs mb-0.5">Monthly SIP needed</div>
          <div className="text-blue-200 font-bold text-lg">₹12,400/mo</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Guest Calculator ─────────────────────────────────────────────────────────
interface CalcResult {
  corpusRequired: number;
  projectedCorpus: number;
  gap: number;
  sipRequired: number;
  isSurplus: boolean;
}

function fmt(val: number) {
  if (Math.abs(val) >= 1_00_00_000) return `₹${(val / 1_00_00_000).toFixed(2)} Cr`;
  if (Math.abs(val) >= 1_00_000) return `₹${(val / 1_00_000).toFixed(1)}L`;
  return `₹${Math.round(val).toLocaleString("en-IN")}`;
}

function GuestCalculator() {
  const [form, setForm] = useState({
    fullName: "",
    dob: "",
    retirementAge: "60",
    monthlyIncomeTotal: "",
    monthlyExpenseTotal: "",
    monthlySavings: "",
    assetsLumpSum: "0",
    returnPre: "12",
    inflationRate: "6",
  });
  const [result, setResult] = useState<CalcResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.fullName || !form.dob || !form.monthlyIncomeTotal) {
      setError("Please fill in name, date of birth, and monthly income.");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.dob)) {
      setError("Date of birth must be in YYYY-MM-DD format (e.g. 1988-06-15).");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/plan/try", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          dob: form.dob,
          retirementAge: Number(form.retirementAge) || 60,
          monthlyIncomeTotal: Number(form.monthlyIncomeTotal) || 0,
          monthlyExpenseTotal: Number(form.monthlyExpenseTotal) || Number(form.monthlyIncomeTotal) * 0.6,
          monthlySavings: Number(form.monthlySavings) || 0,
          assetsLumpSum: Number(form.assetsLumpSum) || 0,
          assumptions: {
            returnPre: Number(form.returnPre) || 12,
            returnPost: 8,
            inflationHeadline: Number(form.inflationRate) || 6,
          },
        }),
      });
      if (!res.ok) throw new Error("Calculation failed. Please check your inputs.");
      const data = await res.json();
      const gap = (data.summary?.gap ?? data.gap ?? 0);
      setResult({
        corpusRequired: data.summary?.requiredCorpusAtRetirement ?? data.corpusRequired ?? 0,
        projectedCorpus: data.summary?.projectedCorpusAtRetirement ?? data.corpusBuildupAtRetirement ?? 0,
        gap: Math.abs(gap),
        sipRequired: data.summary?.sipRequired ?? data.sipRequired ?? 0,
        isSurplus: gap < 0,
      });
      document.getElementById("calc-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (e: any) {
      setError(e.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
          <h3 className="text-xl font-bold text-white mb-1">Free Retirement Calculator</h3>
          <p className="text-blue-200 text-sm">No login required · Instant results · Takes 60 seconds</p>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-slate-600 mb-1.5 block">Full Name</Label>
              <Input placeholder="Rahul Sharma" value={form.fullName} onChange={e => set("fullName", e.target.value)} className="h-11" />
            </div>
            <div>
              <Label className="text-xs text-slate-600 mb-1.5 block">Date of Birth</Label>
              <Input placeholder="1985-06-15" value={form.dob} onChange={e => set("dob", e.target.value)} className="h-11" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-slate-600 mb-1.5 block">Retirement Age</Label>
            <Input type="number" placeholder="60" value={form.retirementAge} onChange={e => set("retirementAge", e.target.value)} className="h-11" />
          </div>
          <div>
            <Label className="text-xs text-slate-600 mb-1.5 block">Monthly Income (₹)</Label>
            <Input type="number" placeholder="75,000" value={form.monthlyIncomeTotal} onChange={e => set("monthlyIncomeTotal", e.target.value)} className="h-11" />
          </div>
          <div>
            <Label className="text-xs text-slate-600 mb-1.5 block">Monthly Expenses (₹)</Label>
            <Input type="number" placeholder="45,000" value={form.monthlyExpenseTotal} onChange={e => set("monthlyExpenseTotal", e.target.value)} className="h-11" />
          </div>
          <div>
            <Label className="text-xs text-slate-600 mb-1.5 block">Monthly Savings / SIP (₹)</Label>
            <Input type="number" placeholder="15,000" value={form.monthlySavings} onChange={e => set("monthlySavings", e.target.value)} className="h-11" />
          </div>
          <div>
            <Label className="text-xs text-slate-600 mb-1.5 block">Existing Investments (₹)</Label>
            <Input type="number" placeholder="5,00,000" value={form.assetsLumpSum} onChange={e => set("assetsLumpSum", e.target.value)} className="h-11" />
          </div>
          <div>
            <Label className="text-xs text-slate-600 mb-1.5 block">Expected Return (% p.a.)</Label>
            <Input type="number" placeholder="12" value={form.returnPre} onChange={e => set("returnPre", e.target.value)} className="h-11" />
          </div>
          {error && (
            <div className="sm:col-span-2 text-sm text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" /> {error}
            </div>
          )}
          <div className="sm:col-span-2">
            <Button type="submit" className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700 rounded-xl" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Calculating…</span>
              ) : (
                <span className="flex items-center gap-2"><Zap className="h-4 w-4" /> Calculate My Retirement Number →</span>
              )}
            </Button>
          </div>
        </div>
      </form>

      <AnimatePresence>
        {result && (
          <motion.div
            id="calc-result"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-6"
          >
            <div className={`rounded-3xl overflow-hidden border-2 ${result.isSurplus ? "border-emerald-400" : "border-amber-400"}`}>
              <div className={`px-6 py-4 ${result.isSurplus ? "bg-emerald-600" : "bg-amber-600"} text-white flex items-center gap-2`}>
                {result.isSurplus ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                <span className="font-bold">{result.isSurplus ? "Great news — you're on track!" : "You have a funding gap to close"}</span>
              </div>
              <div className="bg-white p-6 grid grid-cols-2 md:grid-cols-4 gap-4 mb-0">
                {[
                  { label: "Corpus Required", value: fmt(result.corpusRequired), color: "text-slate-900" },
                  { label: "Projected Corpus", value: fmt(result.projectedCorpus), color: "text-blue-700" },
                  { label: result.isSurplus ? "Surplus" : "Funding Gap", value: fmt(result.gap), color: result.isSurplus ? "text-emerald-700" : "text-red-600" },
                  { label: "Monthly SIP Needed", value: result.isSurplus ? "₹0" : fmt(result.sipRequired), color: result.isSurplus ? "text-emerald-700" : "text-amber-700" },
                ].map(k => (
                  <div key={k.label} className="text-center p-3 bg-slate-50 rounded-xl">
                    <div className="text-xs text-slate-500 mb-1">{k.label}</div>
                    <div className={`text-xl font-black ${k.color}`}>{k.value}</div>
                  </div>
                ))}
              </div>
              <div className="bg-slate-900 p-5 text-center">
                <p className="text-slate-300 text-sm mb-3">
                  <Lock className="h-3.5 w-3.5 inline mr-1" />
                  Sign in to save your plan, see year-by-year projections, and download your full report.
                </p>
                <Button onClick={() => { window.location.href = "/api/login"; }} className="bg-white text-slate-900 hover:bg-slate-100 rounded-full px-8 font-bold">
                  Create Free Account to Save →
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────
export default function Landing() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <ChartLine className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">RetirePro</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/blog" className="text-sm text-slate-600 hover:text-slate-900 font-medium">Blog</Link>
            <a href="#calculator" className="text-sm text-slate-600 hover:text-slate-900 font-medium">Calculator</a>
          </nav>
          <Button onClick={() => { window.location.href = "/api/login"; }} className="bg-blue-600 hover:bg-blue-700 rounded-full px-5 h-9 text-sm" data-testid="button-login">
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 pt-16 flex items-center overflow-hidden">
        {/* Animated orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div animate={{ x: [0, 40, 0], y: [0, -30, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
          <motion.div animate={{ x: [0, -30, 0], y: [0, 40, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl" />
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-600/15 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm font-medium px-4 py-2 rounded-full mb-6">
              <Star className="h-3.5 w-3.5 fill-blue-400 text-blue-400" />
              Free. No login required. 60 seconds.
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-none mb-6">
              Plan Your
              <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
                Retirement
              </span>
              Free.
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed mb-8 max-w-lg">
              Calculate your retirement corpus in 60 seconds. See your funding gap. Know exactly what SIP you need. India-specific. No login required.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 rounded-full px-8 h-13 text-base font-bold shadow-lg shadow-white/10"
                onClick={() => document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" })}
                data-testid="button-get-started">
                <Zap className="mr-2 h-5 w-5 text-blue-600" />
                Try Free Calculator
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-full px-8 h-13 text-base"
                onClick={() => { window.location.href = "/api/login"; }}
                data-testid="button-sign-in">
                Sign In to Save
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center">
            <FloatingCard />
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-slate-900 py-10 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: 93, suffix: "%", label: "Indians over 50 regret not planning sooner", prefix: "" },
            { value: 8, suffix: " Cr", label: "Typical corpus needed for urban retirement", prefix: "₹" },
            { value: 60, suffix: " sec", label: "To get your retirement number free", prefix: "" },
            { value: 52, suffix: "L+", label: "EPF final settlement claims in 2024–25", prefix: "" },
          ].map(stat => (
            <div key={stat.label} className="text-white">
              <div className="text-3xl md:text-4xl font-black text-blue-400 mb-1">
                <AnimatedNumber target={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
              </div>
              <div className="text-xs text-slate-400 leading-snug">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Calculator */}
      <section id="calculator" className="bg-gradient-to-b from-slate-50 to-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <span className="inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full mb-4">
              Free · No Login · Instant
            </span>
            <h2 className="text-4xl font-black text-slate-900 mb-4">Calculate Your Retirement Number</h2>
            <p className="text-lg text-slate-600">
              Enter your details below. See your corpus projection, funding gap, and the exact SIP you need — right here, no account required.
            </p>
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
          <GuestCalculator />
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl font-black text-slate-900 mb-4">Why RetirePro?</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Built for India. Designed for clarity.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Zap className="h-8 w-8" />, color: "text-blue-600 bg-blue-50", title: "60-Second Quick Plan", desc: "Answer a few questions. Get a full retirement projection with year-by-year corpus growth, income, and expense breakdown." },
              { icon: <BarChart3 className="h-8 w-8" />, color: "text-emerald-600 bg-emerald-50", title: "Visual Projections", desc: "Interactive charts show your net worth trajectory, cashflow analysis, and exactly when (and if) your corpus runs out." },
              { icon: <Shield className="h-8 w-8" />, color: "text-purple-600 bg-purple-50", title: "India-Specific Planning", desc: "Indian inflation rates, EPF, NPS, ELSS. Supports joint retirement, children's education goals, home loans, and mini-retirements." },
            ].map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}>
                <div className="group bg-white rounded-2xl p-8 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 h-full">
                  <div className={`inline-flex p-3 rounded-2xl mb-5 ${f.color}`}>{f.icon}</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog */}
      <section className="py-20 bg-slate-50 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Learn Before You Plan</h2>
              <p className="text-slate-600">India-specific retirement guides, written in plain language.</p>
            </div>
            <Link href="/blog" className="hidden md:flex items-center gap-1 text-blue-600 font-semibold hover:underline">
              All articles <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                href: "/blog/why-indians-fail-retirement",
                gradient: "from-blue-600 to-indigo-700",
                tag: "Retirement Basics",
                title: "Why Most Indians Fail to Plan for Retirement",
                excerpt: "93% of Indians over 50 regret not planning sooner. Here's what goes wrong and the one habit that changes everything.",
                time: "8 min read",
              },
              {
                href: "/blog/nps-vs-ppf-vs-sip",
                gradient: "from-emerald-600 to-teal-700",
                tag: "Investment Guide",
                title: "NPS vs PPF vs Mutual Fund SIP",
                excerpt: "Real numbers. No fluff. We compare all three so you can stop guessing and start investing.",
                time: "9 min read",
              },
            ].map((post, i) => (
              <motion.div key={post.href} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Link href={post.href} className="group block bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className={`h-40 bg-gradient-to-br ${post.gradient} flex items-end p-5`}>
                    <span className="text-sm font-semibold bg-white/20 text-white px-3 py-1 rounded-full backdrop-blur-sm">{post.tag}</span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{post.title}</h3>
                    <p className="text-slate-500 text-sm mb-3">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="h-3 w-3" />{post.time}</span>
                      <span className="text-sm font-semibold text-blue-600 flex items-center gap-1">Read <ArrowRight className="h-3.5 w-3.5" /></span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 overflow-hidden px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Your 65-year-old self<br />is counting on today's you.
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Calculate your retirement number free — no login, no email, no commitment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 rounded-full px-10 h-14 text-base font-bold"
              onClick={() => document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" })}
              data-testid="button-start-planning">
              <Zap className="mr-2 h-5 w-5 text-blue-600" />
              Calculate Free — No Login
            </Button>
            <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-full px-10 h-14 text-base"
              onClick={() => { window.location.href = "/api/login"; }}>
              Sign In to Save & Track
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <ChartLine className="h-4 w-4 text-white" />
            </div>
            <span className="text-white font-bold">RetirePro</span>
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <Link href="/blog/why-indians-fail-retirement" className="hover:text-white transition-colors">Why Indians Fail</Link>
            <Link href="/blog/nps-vs-ppf-vs-sip" className="hover:text-white transition-colors">NPS vs PPF vs SIP</Link>
          </div>
          <p className="text-sm">© 2025 RetirePro. Free retirement planning for India.</p>
        </div>
      </footer>
    </div>
  );
}
