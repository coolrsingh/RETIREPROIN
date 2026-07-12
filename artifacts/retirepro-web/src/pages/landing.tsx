import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChartLine, Zap, Shield, BarChart3, ArrowRight, TrendingUp, Users, Clock,
  AlertTriangle, BookOpen, Star, Lock
} from "lucide-react";
import dashboardImg from "@assets/retirepro.in_plan_58390e0d-7ccd-4950-a3d7-52a04338c489_1781421890049.png";
import BrandLogo from "@/components/brand-logo";
import logoUrl from "@/assets/retirepro-logo.png";

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

// ─── Feature card with 3D tilt ───────────────────────────────────────────────
function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = ref.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transition = "none";
    card.style.transform = `perspective(600px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) scale(1.03)`;
  };
  const handleLeave = () => {
    const card = ref.current;
    if (!card) return;
    card.style.transition = "transform 0.4s ease, box-shadow 0.4s ease";
    card.style.transform = "perspective(600px) rotateY(0deg) rotateX(0deg) scale(1)";
  };
  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={className}
      style={{ willChange: "transform", transformStyle: "preserve-3d" }}
    >
      {children}
    </div>
  );
}

// ─── Guest Calculator ─────────────────────────────────────────────────────────
function GuestCalculator() {
  const [, navigate] = useLocation();
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [consent, setConsent] = useState(false);

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
    if (!consent) {
      setError("Please agree to the Privacy Policy and Disclaimer to continue.");
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
      sessionStorage.setItem("guestCalcResult", JSON.stringify(data));
      sessionStorage.setItem("guestCalcForm", JSON.stringify(form));
      navigate("/plan/preview");
    } catch (e: any) {
      setError(e.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const labelClass = "text-base font-medium text-slate-700 mb-2 block";
  const inputClass = "h-12 text-base border-slate-300 focus:border-[#F15A24] focus:ring-[#F15A24]/20";

  return (
    <div className="max-w-[1280px] mx-auto">
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
          <div>
            <Label className={labelClass}>Full Name</Label>
            <Input placeholder="Rahul Sharma" value={form.fullName} onChange={e => set("fullName", e.target.value)} className={inputClass} />
          </div>
          <div>
            <Label className={labelClass}>Date of Birth</Label>
            <Input placeholder="1985-06-15 (YYYY-MM-DD)" value={form.dob} onChange={e => set("dob", e.target.value)} className={inputClass} />
          </div>
          <div>
            <Label className={labelClass}>Retirement Age</Label>
            <Input type="number" placeholder="60" value={form.retirementAge} onChange={e => set("retirementAge", e.target.value)} className={inputClass} />
          </div>
          <div>
            <Label className={labelClass}>Monthly Income (₹)</Label>
            <Input type="number" placeholder="75,000" value={form.monthlyIncomeTotal} onChange={e => set("monthlyIncomeTotal", e.target.value)} className={inputClass} />
          </div>
          <div>
            <Label className={labelClass}>Monthly Expenses (₹)</Label>
            <Input type="number" placeholder="45,000" value={form.monthlyExpenseTotal} onChange={e => set("monthlyExpenseTotal", e.target.value)} className={inputClass} />
          </div>
          <div>
            <Label className={labelClass}>Monthly Savings / SIP (₹)</Label>
            <Input type="number" placeholder="15,000" value={form.monthlySavings} onChange={e => set("monthlySavings", e.target.value)} className={inputClass} />
          </div>
          <div>
            <Label className={labelClass}>Existing Investments (₹)</Label>
            <Input type="number" placeholder="5,00,000" value={form.assetsLumpSum} onChange={e => set("assetsLumpSum", e.target.value)} className={inputClass} />
          </div>
          <div>
            <Label className={labelClass}>Expected Return (% p.a.)</Label>
            <Input type="number" placeholder="12" value={form.returnPre} onChange={e => set("returnPre", e.target.value)} className={inputClass} />
          </div>
          <div className="sm:col-span-2 consent-block">
            <label className="consent-label">
              <input
                type="checkbox"
                checked={consent}
                onChange={e => setConsent(e.target.checked)}
                data-testid="checkbox-consent"
              />
              <span className="consent-text">
                I agree to RetirePro's{" "}
                <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>{" "}
                and{" "}
                <a href="/disclaimer" target="_blank" rel="noopener noreferrer">Disclaimer</a>, and consent to
                the processing of my personal data in accordance with the Digital Personal Data Protection Act, 2023.
              </span>
            </label>
            <p className="consent-note">
              This is a self-help calculator for educational purposes only — not investment advice. Your data is never sold.
            </p>
          </div>
          {error && (
            <div className="sm:col-span-2 text-sm text-red-600 flex items-center gap-2 bg-red-50 rounded-xl px-4 py-2.5">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" /> {error}
            </div>
          )}
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60"
              style={{
                background: "#F15A24",
                padding: "18px 24px",
                fontSize: "18px",
                animation: loading ? "none" : "orangePulse 2.5s ease-in-out infinite",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.animation = "none";
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.02)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 24px rgba(241,90,36,0.45)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.animation = "orangePulse 2.5s ease-in-out infinite";
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "";
              }}
            >
              {loading ? (
                <><span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> Calculating your retirement plan…</>
              ) : (
                <><Zap className="h-5 w-5" /> See My Retirement Future →</>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ─── Ticker ───────────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  "NIFTY 50 ▲ 24,850", "SENSEX ▲ 81,200", "INFLATION 6.8%",
  "AVG RETURN 12.4%", "RETIREMENT AGE 60", "LIFE EXPECTANCY 85 yrs",
  "CORPUS TARGET ₹3.8 Cr", "EPF WITHDRAWAL 52L+", "SIP GROWTH 15%",
  "NIFTY 50 ▲ 24,850", "SENSEX ▲ 81,200", "INFLATION 6.8%",
  "AVG RETURN 12.4%", "RETIREMENT AGE 60", "LIFE EXPECTANCY 85 yrs",
  "CORPUS TARGET ₹3.8 Cr", "EPF WITHDRAWAL 52L+", "SIP GROWTH 15%",
];

function DataTicker() {
  return (
    <div className="absolute bottom-0 left-0 right-0 overflow-hidden border-t border-slate-200"
      style={{ opacity: 0.55, fontFamily: "monospace", fontSize: "12px", color: "#64748B", padding: "6px 0" }}
      aria-hidden="true"
    >
      <div className="flex gap-12 whitespace-nowrap" style={{ animation: "tickerScroll 35s linear infinite" }}>
        {TICKER_ITEMS.map((item, i) => <span key={i} className="flex-shrink-0">{item}</span>)}
      </div>
    </div>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────
export default function Landing() {
  return (
    <>
      {/* Global CSS for animations */}
      <style>{`
        @keyframes orangePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(241, 90, 36, 0.4); }
          50%       { box-shadow: 0 0 0 12px rgba(241, 90, 36, 0); }
        }
        @keyframes tickerScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes floatA {
          0%, 100% { transform: translateY(0px) rotate(-3deg); }
          50%       { transform: translateY(-14px) rotate(-3deg); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0px) rotate(2.5deg); }
          50%       { transform: translateY(-10px) rotate(2.5deg); }
        }
        @keyframes floatC {
          0%, 100% { transform: translateY(0px) rotate(-1.5deg); }
          50%       { transform: translateY(-18px) rotate(-1.5deg); }
        }
        .preview-card-float-a { animation: floatA 5s ease-in-out infinite; }
        .preview-card-float-b { animation: floatB 6s ease-in-out infinite; animation-delay: 1.5s; }
        .preview-card-float-c { animation: floatC 4.5s ease-in-out infinite; animation-delay: 3s; }
        .preview-card-shadow {
          border-radius: 16px;
          box-shadow: 0 24px 50px -12px rgba(37,99,235,0.25), 0 0 0 1px rgba(15,23,42,0.05);
        }
        html { scroll-behavior: smooth; }
        @media (prefers-reduced-motion: reduce) {
          .preview-card-float-a, .preview-card-float-b, .preview-card-float-c { animation: none !important; }
        }
      `}</style>

      <div className="min-h-screen bg-white overflow-x-hidden">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-xl border-b border-slate-200/60">
          <div className="max-w-[1280px] mx-auto px-6 flex items-center justify-between h-16">
            <BrandLogo href={null} textClassName="text-slate-900" />
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/blog" className="text-sm text-slate-600 hover:text-slate-900 font-medium">Blog</Link>
              <a href="#calculator" className="text-sm text-slate-600 hover:text-slate-900 font-medium">Calculator</a>
            </nav>
            <Button
              onClick={() => { window.location.href = "/api/login"; }}
              className="bg-[#F15A24] hover:bg-[#d44d1e] text-white rounded-full px-5 h-9 text-sm font-semibold"
              data-testid="button-login"
            >
              Sign In
            </Button>
          </div>
        </header>

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section
          className="relative min-h-screen pt-16 flex items-center overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #F4F9FF 0%, #FFFFFF 100%)",
          }}
        >
          {/* Grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "linear-gradient(rgba(15,23,42,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.035) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          {/* Orange orb top-left */}
          <div
            className="absolute pointer-events-none"
            style={{ top: -80, left: -80, width: 400, height: 400, background: "radial-gradient(circle, rgba(241,90,36,0.13) 0%, transparent 70%)" }}
          />
          {/* Blue orb animated */}
          <motion.div
            animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/3 w-80 h-80 rounded-full pointer-events-none"
            style={{ background: "rgba(59,130,246,0.12)", filter: "blur(64px)" }}
          />
          <motion.div
            animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-1/4 right-1/3 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: "rgba(99,102,241,0.12)", filter: "blur(48px)" }}
          />

          <div className="relative max-w-[1280px] mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
            {/* Left: copy */}
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full mb-6"
                style={{ background: "rgba(241,90,36,0.1)", border: "1px solid rgba(241,90,36,0.25)", color: "#C2410C" }}
              >
                <Star className="h-3.5 w-3.5" style={{ fill: "#C2410C" }} />
                Free. No login required. 60 seconds.
              </motion.div>

              <h1 className="text-5xl md:text-7xl font-black leading-none mb-6" style={{ color: "#0F172A" }}>
                Plan Your
                <span className="block italic" style={{ background: "linear-gradient(90deg, #F15A24, #FF8C57, #FFA07A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Retirement
                </span>
                Free.
              </h1>

              <p className="text-xl leading-relaxed mb-8 max-w-lg" style={{ color: "#475569" }}>
                Calculate your retirement corpus in 60 seconds. See your funding gap. Know exactly what SIP you need. India-specific. No login required.
              </p>

              <div className="flex flex-wrap gap-3">
                {/* Primary CTA — orange filled with pulse */}
                <button
                  className="flex items-center gap-2 rounded-full px-8 text-white font-bold text-base"
                  style={{
                    background: "#F15A24",
                    height: "52px",
                    animation: "orangePulse 2.5s ease-in-out infinite",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.animation = "none";
                    (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.04)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 24px rgba(241,90,36,0.5)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.animation = "orangePulse 2.5s ease-in-out infinite";
                    (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "";
                  }}
                  onClick={() => { window.location.href = "/free-plan"; }}
                  data-testid="button-get-started"
                >
                  <Zap className="h-5 w-5" />
                  Try Full Free Planner
                </button>

                {/* Secondary CTA — outlined blue */}
                <button
                  className="flex items-center gap-2 rounded-full px-8 font-semibold text-base transition-all duration-200"
                  style={{
                    height: "52px",
                    background: "transparent",
                    border: "1.5px solid #2563EB",
                    color: "#2563EB",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(37,99,235,0.1)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  }}
                  onClick={() => { window.location.href = "/api/login"; }}
                  data-testid="button-sign-in"
                >
                  Sign In to Save
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>

            {/* Right: floating preview cards */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative h-[520px] flex items-center justify-center"
            >
              {/* Card 1 — interactive plan summary card (center, prominent) */}
              <div className="absolute z-30 preview-card-float-a" style={{ top: "10%", left: "5%" }}>
                <div
                  className="preview-card-shadow w-64 p-5"
                  style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 16 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-full bg-[#F15A24] flex items-center justify-center">
                      <TrendingUp className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-slate-700 text-xs font-medium">Priya's Retirement Plan</span>
                  </div>
                  <div className="mb-3">
                    <div className="text-slate-400 text-[10px] mb-0.5">Projected corpus at 60</div>
                    <div className="text-2xl font-black text-slate-900">₹3.2 Cr</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="rounded-lg p-2.5" style={{ background: "#F1F5F9" }}>
                      <div className="text-slate-500 text-[10px]">Required</div>
                      <div className="text-slate-900 text-sm font-bold">₹4.5 Cr</div>
                    </div>
                    <div className="rounded-lg p-2.5" style={{ background: "rgba(241,90,36,0.1)" }}>
                      <div className="text-[#C2410C] text-[10px]">Gap</div>
                      <div className="text-[#C2410C] text-sm font-bold">₹1.3 Cr</div>
                    </div>
                  </div>
                  <div className="rounded-lg p-2.5" style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.2)" }}>
                    <div className="text-blue-600 text-[10px] mb-0.5">Monthly SIP needed</div>
                    <div className="text-blue-700 font-bold">₹12,400/mo</div>
                  </div>
                </div>
              </div>

              {/* Card 2 — dashboard screenshot (top-right, Net Worth area) */}
              <div className="absolute z-20 preview-card-float-b" style={{ top: "-2%", right: "-2%" }}>
                <div className="preview-card-shadow overflow-hidden w-52 h-40 rounded-xl">
                  <img
                    src={dashboardImg}
                    alt="Net Worth Projection"
                    className="w-full h-auto"
                    style={{ objectFit: "cover", objectPosition: "0 18%", width: "100%", transform: "scale(1.1)" }}
                  />
                </div>
              </div>

              {/* Card 3 — dashboard screenshot (bottom-right, Cashflow area) */}
              <div className="absolute z-20 preview-card-float-c" style={{ bottom: "2%", right: "5%" }}>
                <div className="preview-card-shadow overflow-hidden w-56 h-36 rounded-xl">
                  <img
                    src={dashboardImg}
                    alt="Cashflow Analysis"
                    className="w-full h-auto"
                    style={{ objectFit: "cover", objectPosition: "0 75%", width: "100%", transform: "scale(1.1)" }}
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Data Ticker */}
          <DataTicker />
        </section>

        {/* ── Stats Bar ─────────────────────────────────────────────────────── */}
        <section className="py-10 border-b" style={{ background: "#0F172A", borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: 93, suffix: "%", label: "Indians over 50 regret not planning sooner", prefix: "" },
              { value: 8, suffix: " Cr", label: "Typical corpus needed for urban retirement", prefix: "₹" },
              { value: 60, suffix: " sec", label: "To get your retirement number free", prefix: "" },
              { value: 52, suffix: "L+", label: "EPF final settlement claims in 2024–25", prefix: "" },
            ].map(stat => (
              <div key={stat.label} className="text-white">
                <div className="text-3xl md:text-4xl font-black mb-1" style={{ color: "#F15A24" }}>
                  <AnimatedNumber target={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                </div>
                <div className="text-xs text-slate-400 leading-snug">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Why RetirePro (ABOVE calculator) ─────────────────────────────── */}
        <section className="py-20 bg-white px-6">
          <div className="max-w-[1280px] mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 className="font-bold text-slate-900 mb-4" style={{ fontSize: "40px", fontWeight: 700, lineHeight: 1.15 }}>Why RetirePro?</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">Built for India. Designed for clarity.</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: <Zap className="h-8 w-8" />, color: "text-[#F15A24] bg-orange-50", title: "60-Second Quick Plan", desc: "Answer a few questions. Get a full retirement projection with year-by-year corpus growth, income, and expense breakdown." },
                { icon: <BarChart3 className="h-8 w-8" />, color: "text-blue-600 bg-blue-50", title: "Visual Projections", desc: "Interactive charts show your net worth trajectory, cashflow analysis, and exactly when (and if) your corpus runs out." },
                { icon: <Shield className="h-8 w-8" />, color: "text-emerald-600 bg-emerald-50", title: "India-Specific Planning", desc: "Indian inflation rates, EPF, NPS, ELSS. Supports joint retirement, children's education goals, home loans, and mini-retirements." },
              ].map((f, i) => (
                <motion.div key={f.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}>
                  <TiltCard className="h-full">
                    <div
                      className="bg-white rounded-2xl p-8 border border-slate-200 h-full"
                      style={{ transition: "box-shadow 0.4s ease" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 20px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(241,90,36,0.15)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = ""; }}
                    >
                      <div className={`inline-flex p-3 rounded-2xl mb-5 ${f.color}`}>{f.icon}</div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                      <p className="text-slate-600 leading-relaxed">{f.desc}</p>
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Calculator (BELOW Why RetirePro) ─────────────────────────────── */}
        <section id="calculator" className="py-20 px-6" style={{ background: "linear-gradient(to bottom, #F8F9FA, #ffffff)" }}>
          <div className="max-w-[1280px] mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-12">
              <span className="inline-block text-sm font-semibold px-4 py-1.5 rounded-full mb-4" style={{ background: "rgba(241,90,36,0.1)", color: "#F15A24" }}>
                Free · No Login · Instant
              </span>
              <h2 className="font-bold text-slate-900 mb-4" style={{ fontSize: "40px", fontWeight: 700, lineHeight: 1.15 }}>
                See Your Retirement Future in 30 Seconds.
                <span className="block text-slate-500" style={{ fontSize: "28px", fontWeight: 600 }}>No account required.</span>
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Enter a few details below and instantly see your projected corpus, funding gap, and net worth projection.
              </p>
            </motion.div>

            {/* Trust badges */}
            <div className="trust-row" data-testid="trust-row">
              <span className="trust-badge">🔒 256-bit SSL Secured</span>
              <span className="trust-divider">•</span>
              <span className="trust-badge">🇮🇳 India-Specific</span>
              <span className="trust-divider">•</span>
              <span className="trust-badge">✅ AMFI-Registered Partner</span>
              <span className="trust-divider">•</span>
              <span className="trust-badge">🛡️ Your data is never sold</span>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
              <GuestCalculator />
            </motion.div>
          </div>
        </section>

        {/* ── Blog ─────────────────────────────────────────────────────────── */}
        <section className="py-20 px-6 bg-slate-50">
          <div className="max-w-[1280px] mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-end justify-between mb-10 flex-wrap gap-4">
              <div>
                <h2 className="font-bold text-slate-900 mb-2" style={{ fontSize: "40px", fontWeight: 700, lineHeight: 1.15 }}>Learn Before You Plan</h2>
                <p className="text-lg text-slate-600">India-specific retirement guides, written in plain language.</p>
              </div>
              <Link href="/blog" className="hidden md:flex items-center gap-1 font-semibold hover:underline" style={{ color: "#F15A24" }}>
                All articles <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  href: "/blog/why-indians-fail-retirement",
                  gradient: "from-[#0A1628] to-[#1e3a5f]",
                  tag: "Retirement Basics",
                  title: "Why Most Indians Fail to Plan for Retirement — And How One Small Habit Can Change Everything",
                  excerpt: "93% of Indians over 50 regret not planning sooner. Here's what goes wrong and the one habit that changes everything.",
                  time: "8 min read",
                },
                {
                  href: "/blog/nps-vs-ppf-vs-sip",
                  gradient: "from-emerald-800 to-teal-900",
                  tag: "Investment Guide",
                  title: "NPS vs PPF vs Mutual Fund SIP: Which Builds the Biggest Retirement Corpus in India?",
                  excerpt: "Real numbers. No fluff. We compare all three with India-specific context so you can stop guessing and start investing.",
                  time: "9 min read",
                },
              ].map((post, i) => (
                <motion.div key={post.href} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Link
                    href={post.href}
                    className="group block bg-white rounded-2xl overflow-hidden border border-slate-200"
                    style={{ transition: "transform 0.25s ease, box-shadow 0.25s ease" }}
                    onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                      (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-4px)";
                      (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 16px 48px rgba(0,0,0,0.12)";
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                      (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                      (e.currentTarget as HTMLAnchorElement).style.boxShadow = "";
                    }}
                  >
                    <div className={`h-44 bg-gradient-to-br ${post.gradient} flex items-end p-5`}>
                      <span className="text-sm font-semibold bg-white/20 text-white px-3 py-1 rounded-full backdrop-blur-sm">{post.tag}</span>
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-slate-900 mb-2 text-lg group-hover:text-[#F15A24] transition-colors">{post.title}</h3>
                      <p className="text-slate-500 text-sm mb-4">{post.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="h-3 w-3" />{post.time}</span>
                        <span className="text-sm font-semibold flex items-center gap-1" style={{ color: "#F15A24" }}>Read article <ArrowRight className="h-3.5 w-3.5" /></span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ─────────────────────────────────────────────────────── */}
        <section
          className="relative py-24 overflow-hidden px-6"
          style={{ background: "linear-gradient(135deg, #F4F9FF 0%, #FFFFFF 100%)" }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full"
              style={{ background: "rgba(241,90,36,0.06)", filter: "blur(64px)" }} />
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative max-w-3xl mx-auto text-center">
            <h2 className="font-bold mb-6" style={{ fontSize: "clamp(36px, 5vw, 52px)", fontWeight: 700, lineHeight: 1.15, color: "#0F172A" }}>
              Your 65-year-old self<br />is counting on today's you.
            </h2>
            <p className="text-xl mb-8" style={{ color: "#475569" }}>
              Calculate your retirement number free — no login, no email, no commitment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                className="flex items-center justify-center gap-2 rounded-full font-bold text-base text-white"
                style={{ background: "#F15A24", padding: "16px 40px", animation: "orangePulse 2.5s ease-in-out infinite" }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.animation = "none";
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.04)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 24px rgba(241,90,36,0.5)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.animation = "orangePulse 2.5s ease-in-out infinite";
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "";
                }}
                onClick={() => document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" })}
                data-testid="button-start-planning"
              >
                <Zap className="h-5 w-5" />
                Calculate Free — No Login
              </button>
              <button
                className="flex items-center justify-center gap-2 rounded-full font-semibold text-base"
                style={{ padding: "16px 40px", background: "transparent", border: "1.5px solid #2563EB", color: "#2563EB", transition: "background 0.2s ease" }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(37,99,235,0.1)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                onClick={() => { window.location.href = "/api/login"; }}
              >
                Sign In to Save &amp; Track
              </button>
            </div>
          </motion.div>
        </section>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <footer className="py-10 px-6" style={{ background: "#060E1A" }}>
          <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <img src={logoUrl} alt="RetirePro logo" className="w-6 h-6 object-contain" />
              </div>
              <span className="text-white font-bold">RetirePro</span>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
              <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
              <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link>
              <Link href="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link>
              <Link href="/terms-and-conditions" className="hover:text-white transition-colors">Terms &amp; Conditions</Link>
            </div>
            <p className="text-sm text-slate-500">© 2025 RetirePro. Free retirement planning for India.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
