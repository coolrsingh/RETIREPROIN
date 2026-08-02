import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  BarChart3, ArrowRight, TrendingUp, Users, Clock,
  AlertTriangle, BookOpen, Shield, Brain, FileText, Sliders, Zap, Star, Quote, CheckCircle
} from "lucide-react";
import BrandLogo from "@/components/brand-logo";
import logoUrl from "@/assets/retirepro-logo.png";
import QuickPlanForm from "@/components/quick-plan-form";
import AdvisorSection from "@/components/advisor-section";

// ── Animated counter ─────────────────────────────────────────────────────────
function AnimatedNumber({ target, suffix = "", decimals = 0 }: { target: number; suffix?: string; decimals?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let v = 0;
        const step = target / 60;
        const id = setInterval(() => {
          v += step;
          if (v >= target) { setVal(target); clearInterval(id); }
          else setVal(Math.round(v * Math.pow(10, decimals)) / Math.pow(10, decimals));
        }, 16);
      }
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, decimals]);
  const fmt = decimals > 0 ? val.toFixed(decimals) : val.toLocaleString("en-IN");
  return <span ref={ref}>{fmt}{suffix}</span>;
}

// ── Typewriter ───────────────────────────────────────────────────────────────
const INSIGHTS = [
  "At your current savings rate, your corpus runs out by age 74.",
  "Starting 5 years earlier triples your retirement corpus.",
  "₹5,000/mo more in SIP closes 40% of your retirement gap.",
  "Your spouse's income gap needs a 6-year bridge plan.",
];
function TypewriterCycle() {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"typing" | "pause" | "erasing">("typing");
  useEffect(() => {
    const full = INSIGHTS[idx];
    let t: ReturnType<typeof setTimeout>;
    if (phase === "typing") {
      if (text.length < full.length) t = setTimeout(() => setText(full.slice(0, text.length + 1)), 30);
      else t = setTimeout(() => setPhase("pause"), 2200);
    } else if (phase === "pause") {
      t = setTimeout(() => setPhase("erasing"), 400);
    } else {
      if (text.length > 0) t = setTimeout(() => setText(text.slice(0, -1)), 14);
      else { setIdx((idx + 1) % INSIGHTS.length); setPhase("typing"); }
    }
    return () => clearTimeout(t);
  }, [text, phase, idx]);
  return (
    <span>
      {text}
      <span style={{ borderRight: "2px solid #E8940A", animation: "blink 1s step-end infinite", marginLeft: 1 }}>&nbsp;</span>
    </span>
  );
}

// ── Corpus SVG ───────────────────────────────────────────────────────────────
function CorpusCurve() {
  return (
    <svg viewBox="0 0 260 90" fill="none" style={{ width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="260" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#E8940A" />
        </linearGradient>
        <linearGradient id="fg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0 88 C30 82, 60 72, 85 60 C110 48, 125 40, 148 28 C168 18, 192 10, 220 5 C238 2, 252 1, 260 0"
        stroke="url(#cg)" strokeWidth="2.5" strokeLinecap="round" fill="none"
        style={{ strokeDasharray: 380, strokeDashoffset: 380, animation: "draw 2s ease-out forwards 0.3s" }} />
      <path d="M0 88 C30 82, 60 72, 85 60 C110 48, 125 40, 148 28 C168 18, 192 10, 220 5 C238 2, 252 1, 260 0 L260 90 L0 90 Z"
        fill="url(#fg)" style={{ opacity: 0, animation: "fadeIn 0.5s ease forwards 1.8s" }} />
      <circle cx="260" cy="0" r="4" fill="#E8940A" style={{ opacity: 0, animation: "fadeIn 0.3s ease forwards 2s" }} />
    </svg>
  );
}

// ── Planner form wrapper ──────────────────────────────────────────────────────
function LandingPlannerSection() {
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (data: any) => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/plan/try", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error((e as any).message || "Calculation failed."); }
      const result = await res.json();
      sessionStorage.setItem("guestCalcResult", JSON.stringify(result));
      sessionStorage.setItem("guestCalcForm", JSON.stringify({
        fullName: data.fullName, dob: data.dob,
        retirementAge: String(data.retirementAge),
        monthlyIncomeTotal: String(data.monthlyIncomeTotal),
        monthlyExpenseTotal: String(data.monthlyExpenseTotal),
        monthlySavings: String(data.monthlySavings),
        assetsLumpSum: String(data.assetsLumpSum ?? 0),
        returnPre: String(data.assumptions?.returnPre ?? 12),
        inflationRate: String(data.assumptions?.inflationHeadline ?? 7),
      }));
      navigate("/plan/preview");
    } catch (e: any) { setError(e.message ?? "Something went wrong."); }
    finally { setLoading(false); }
  };
  return (
    <div className="max-w-4xl mx-auto">
      {error && (
        <div className="mb-4 text-sm text-red-600 flex items-center gap-2 bg-red-50 rounded-xl px-4 py-3 border border-red-200">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" /> {error}
        </div>
      )}
      <QuickPlanForm onSubmit={handleSubmit} isLoading={loading} />
    </div>
  );
}

// ── Ticker ───────────────────────────────────────────────────────────────────
const TICKERS = [
  { l: "NIFTY 50", v: "▲ 24,850", up: true }, { l: "SENSEX", v: "▲ 81,200", up: true },
  { l: "INFLATION", v: "6.8%", up: false }, { l: "SIP CAGR", v: "15.2%", up: true },
  { l: "EPF RATE", v: "8.25%", up: true }, { l: "LIFE EXP.", v: "85 yrs", up: false },
  { l: "CORPUS TARGET", v: "₹3.8 Cr", up: false }, { l: "NPS RETURNS", v: "10.4%", up: true },
  { l: "NIFTY 50", v: "▲ 24,850", up: true }, { l: "SENSEX", v: "▲ 81,200", up: true },
  { l: "INFLATION", v: "6.8%", up: false }, { l: "SIP CAGR", v: "15.2%", up: true },
  { l: "EPF RATE", v: "8.25%", up: true }, { l: "LIFE EXP.", v: "85 yrs", up: false },
  { l: "CORPUS TARGET", v: "₹3.8 Cr", up: false }, { l: "NPS RETURNS", v: "10.4%", up: true },
];

export default function Landing() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;0,9..144,900;1,9..144,600;1,9..144,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        :root {
          --navy:    #0F2952;
          --navy-md: #1E3A5F;
          --navy-lt: #2D5282;
          --saffron: #E8940A;
          --orange:  #F15A24;
          --blue:    #2563EB;
          --blue-lt: #EFF6FF;
          --slate:   #475569;
          --border:  #E2E8F0;
          --bg:      #FFFFFF;
          --bg-alt:  #F8FAFC;
          --font-serif: 'Fraunces', Georgia, serif;
          --font-sans:  'Inter', system-ui, sans-serif;
          --font-mono:  'JetBrains Mono', monospace;
        }

        * { box-sizing: border-box; }
        body { font-family: var(--font-sans); background: var(--bg); }
        h1, h2, h3 { font-family: var(--font-serif); }

        @keyframes draw    { to { stroke-dashoffset: 0; } }
        @keyframes fadeIn  { to { opacity: 1; } }
        @keyframes blink   { 50% { opacity: 0; } }
        @keyframes ticker  { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes pulse   { 0%,100% { box-shadow: 0 0 0 0 rgba(241,90,36,.4); } 50% { box-shadow: 0 0 0 14px rgba(241,90,36,0); } }
        @keyframes float   { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes orbit1  { from { transform: rotate(0deg) translateX(100px) rotate(0deg); } to { transform: rotate(360deg) translateX(100px) rotate(-360deg); } }
        @keyframes orbit2  { from { transform: rotate(120deg) translateX(70px) rotate(-120deg); } to { transform: rotate(480deg) translateX(70px) rotate(-480deg); } }
        @keyframes orbit3  { from { transform: rotate(240deg) translateX(100px) rotate(-240deg); } to { transform: rotate(600deg) translateX(100px) rotate(-600deg); } }

        html { scroll-behavior: smooth; }

        .lp-section { width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 24px; }

        .lp-label {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 700; letter-spacing: .12em;
          text-transform: uppercase; padding: 5px 14px; border-radius: 100px;
          font-family: var(--font-mono);
        }

        .card-hover { transition: transform .22s ease, box-shadow .22s ease; }
        .card-hover:hover { transform: translateY(-3px); box-shadow: 0 16px 48px rgba(15,41,82,.12) !important; }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; }
        }

        @media (max-width: 640px) {
          .hero-h { font-size: 36px !important; }
          .hero-cta { flex-direction: column !important; }
          .hero-cta button, .hero-cta a { width: 100% !important; justify-content: center !important; }
          .hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; padding-top: 48px !important; padding-bottom: 60px !important; }
          .hero-card { max-width: 100% !important; }
        }

        @media (max-width: 479px) {
          .ai-card-outer { padding: 24px 20px !important; gap: 20px !important; }
          .header-nav-link { display: none !important; }
          .header-sign-in { padding: 8px 16px !important; font-size: 13px !important; }
        }

        .divider { width: 100%; height: 1px; background: var(--border); }
      `}</style>

      <div style={{ background: "var(--bg)", color: "var(--navy)" }}>

        {/* ── HEADER ───────────────────────────────────────────────────────── */}
        <header style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
          background: "rgba(255,255,255,0.92)", backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
        }}>
          <div className="lp-section" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, maxWidth: 1200 }}>
            <BrandLogo href={null} textClassName="text-slate-900" />
            <nav style={{ display: "flex", alignItems: "center", gap: 32 }}>
              <Link href="/blog" className="header-nav-link" style={{ fontSize: 14, fontWeight: 500, color: "var(--slate)", textDecoration: "none" }}>Blog</Link>
              <a href="#planner" className="header-nav-link" style={{ fontSize: 14, fontWeight: 500, color: "var(--slate)", textDecoration: "none" }}>Free Planner</a>
            </nav>
            <button
              onClick={() => { window.location.href = "/api/login"; }}
              className="header-sign-in"
              style={{
                background: "var(--orange)", color: "#fff", border: "none", cursor: "pointer",
                fontWeight: 700, fontSize: 14, padding: "10px 24px", borderRadius: 100,
                fontFamily: "var(--font-sans)",
                transition: "opacity .15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = ".88")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              data-testid="button-login"
            >
              Sign In
            </button>
          </div>
        </header>

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section style={{ paddingTop: 64, background: "var(--bg)", overflow: "hidden" }}>
          {/* Top urgency bar */}
          <div style={{
            background: "var(--navy)", padding: "10px 24px", textAlign: "center",
            fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.9)",
            letterSpacing: ".01em",
          }}>
            <span style={{ color: "#FCD34D", marginRight: 8 }}>⚠</span>
            76% of Indians have zero retirement savings — calculate where you stand in 60 seconds.
            <span style={{ color: "#FCD34D", marginLeft: 8 }}>⚠</span>
          </div>

          <div className="lp-section hero-grid" style={{
            maxWidth: 1200,
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80,
            alignItems: "center", paddingTop: 96, paddingBottom: 100,
          }}>
            {/* Left */}
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }}>
              <div className="lp-label" style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE", marginBottom: 28 }}>
                Free · No login · India-specific
              </div>

              <h1 className="hero-h" style={{
                fontSize: "clamp(40px, 4.5vw, 66px)", fontWeight: 900, lineHeight: 1.06,
                color: "var(--navy)", marginBottom: 24,
              }}>
                Find your exact<br />
                retirement number.<br />
                <span style={{ color: "var(--orange)", fontStyle: "italic" }}>Free. In 60 seconds.</span>
              </h1>

              <p style={{ fontSize: 18, lineHeight: 1.75, color: "var(--slate)", marginBottom: 36, maxWidth: 480 }}>
                India's most detailed retirement planner — income, expenses, children's education, loans, EPF, NPS, SIP — all in one calculation. No account needed.
              </p>

              <div className="hero-cta" style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 40 }}>
                <button
                  onClick={() => document.getElementById("planner")?.scrollIntoView({ behavior: "smooth" })}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "var(--orange)", color: "#fff", border: "none",
                    fontWeight: 700, fontSize: 16, padding: "14px 32px", borderRadius: 100,
                    cursor: "pointer", fontFamily: "var(--font-sans)",
                    animation: "pulse 2.5s ease-in-out infinite",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.animation = "none"; e.currentTarget.style.transform = "scale(1.03)"; }}
                  onMouseLeave={e => { e.currentTarget.style.animation = "pulse 2.5s ease-in-out infinite"; e.currentTarget.style.transform = ""; }}
                  data-testid="button-get-started"
                >
                  Calculate My Retirement Gap <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => { window.location.href = "/api/login"; }}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "transparent", color: "var(--navy)",
                    border: "1.5px solid var(--border)",
                    fontWeight: 600, fontSize: 15, padding: "14px 28px", borderRadius: 100,
                    cursor: "pointer", fontFamily: "var(--font-sans)",
                    transition: "border-color .15s, background .15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--navy)"; e.currentTarget.style.background = "var(--bg-alt)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "transparent"; }}
                  data-testid="button-sign-in"
                >
                  Sign in to save <ArrowRight size={16} />
                </button>
              </div>

              {/* Trust badges */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px", fontSize: 12, color: "#94A3B8" }}>
                {["🔒 256-bit SSL", "🇮🇳 EPF · NPS · SIP built-in", "✅ AMFI-Registered", "🛡️ Data never sold"].map(t => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </motion.div>

            {/* Right — Plan card */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .8, delay: .2 }}
              style={{ display: "flex", justifyContent: "center", minWidth: 0 }}>
              <div className="hero-card rounded-2xl sm:rounded-3xl" style={{
                width: "100%", maxWidth: 420,
                background: "#fff",
                padding: 28,
                boxShadow: "0 4px 6px rgba(15,41,82,.04), 0 24px 60px rgba(15,41,82,.13)",
                border: "1px solid var(--border)",
                animation: "float 7s ease-in-out infinite",
              }}>
                {/* Card header */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--navy)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <TrendingUp size={18} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)" }}>Priya's Retirement Plan</div>
                    <div style={{ fontSize: 12, color: "#94A3B8" }}>Retiring at 60 · Projected to 85</div>
                  </div>
                  <div style={{ marginLeft: "auto" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, background: "#DCFCE7", color: "#15803D", padding: "3px 8px", borderRadius: 100 }}>ON TRACK ✓</span>
                  </div>
                </div>

                {/* Chart */}
                <div style={{ height: 90, background: "var(--bg-alt)", borderRadius: 12, padding: "10px 10px 6px", marginBottom: 16, border: "1px solid var(--border)" }}>
                  <CorpusCurve />
                </div>

                {/* Stat chips */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                  {[
                    { l: "Projected", v: "₹3.2 Cr", bg: "#F0FDF4", color: "#15803D", border: "#BBF7D0" },
                    { l: "Required", v: "₹4.5 Cr", bg: "var(--bg-alt)", color: "var(--navy)", border: "var(--border)" },
                    { l: "Gap", v: "₹1.3 Cr", bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" },
                  ].map(c => (
                    <div key={c.l} style={{ textAlign: "center", background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10, padding: "10px 6px" }}>
                      <div style={{ fontSize: 10, color: c.color, opacity: .7, marginBottom: 2 }}>{c.l}</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: c.color, fontFamily: "var(--font-mono)" }}>{c.v}</div>
                    </div>
                  ))}
                </div>

                {/* SIP pill */}
                <div style={{ background: "var(--navy)", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,.6)", fontWeight: 500 }}>Monthly SIP to close gap</span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "#FCD34D", fontFamily: "var(--font-mono)" }}>₹12,400/mo</span>
                </div>

                {/* Social proof */}
                <div style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <div style={{ display: "flex" }}>
                    {["#2563EB","#E8940A","#16A34A","#7C3AED"].map(c => (
                      <div key={c} style={{ width: 22, height: 22, borderRadius: "50%", background: c, border: "2px solid #fff", marginLeft: -6 }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 12, color: "#94A3B8" }}>18,000+ Indians have found their number</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── TICKER ───────────────────────────────────────────────────────── */}
        <div style={{ overflow: "hidden", background: "var(--navy)", padding: "10px 0", borderTop: "1px solid rgba(255,255,255,.08)" }} aria-hidden>
          <div style={{ display: "flex", gap: 40, whiteSpace: "nowrap", animation: "ticker 36s linear infinite", fontFamily: "var(--font-mono)", fontSize: 11 }}>
            {TICKERS.map((t, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <span style={{ color: "rgba(255,255,255,.4)" }}>{t.l}</span>
                <span style={{ color: t.up ? "#4ADE80" : "#FCD34D", fontWeight: 600 }}>{t.v}</span>
                <span style={{ color: "rgba(255,255,255,.15)" }}>|</span>
              </span>
            ))}
          </div>
        </div>

        {/* ── STATS ────────────────────────────────────────────────────────── */}
        <section style={{ background: "var(--navy)", padding: "88px 24px" }}>
          <div className="lp-section" style={{ maxWidth: 1200 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 56 }}>
              <div className="lp-label" style={{ background: "rgba(232,148,10,.15)", color: "#FCD34D", border: "1px solid rgba(232,148,10,.25)", marginBottom: 20 }}>
                Data-backed reality
              </div>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 800, color: "#F8FAFC", lineHeight: 1.15, marginBottom: 12 }}>
                The uncomfortable math
              </h2>
              <p style={{ fontSize: 17, color: "rgba(255,255,255,.5)", maxWidth: 500, margin: "0 auto" }}>
                Most Indians know they should plan. Almost none have run the numbers.
              </p>
            </motion.div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
              {[
                { n: 75.5, d: 1, s: "%", label: "of Indians have no retirement corpus", src: "PFRDA Annual Report 2023–24", accent: "#FCD34D" },
                { n: 3.6, d: 1, s: "×", label: "more corpus needed if you start at 40 vs 30", src: "Compounding at 12% CAGR", accent: "#F87171" },
                { n: 59, d: 0, s: "%", label: "of retirees depend on family for money", src: "HSBC Future of Retirement India", accent: "#93C5FD" },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .1 }}>
                  <div style={{
                    background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)",
                    borderTop: `3px solid ${item.accent}`, borderRadius: 20, padding: "36px 28px",
                  }}>
                    <div style={{ fontSize: "clamp(52px, 7vw, 72px)", fontWeight: 900, color: item.accent, lineHeight: 1, marginBottom: 14, fontFamily: "var(--font-mono)" }}>
                      <AnimatedNumber target={item.n} suffix={item.s} decimals={item.d} />
                    </div>
                    <p style={{ fontSize: 16, color: "#E2E8F0", fontWeight: 600, lineHeight: 1.5, marginBottom: 14 }}>{item.label}</p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>Source: {item.src}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────────────────────────── */}
        <section style={{ background: "var(--bg-alt)", padding: "88px 24px" }}>
          <div className="lp-section" style={{ maxWidth: 1200 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 56 }}>
              <div className="lp-label" style={{ background: "var(--blue-lt)", color: "var(--blue)", border: "1px solid #BFDBFE", marginBottom: 20 }}>
                Why RetirePro
              </div>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 800, color: "var(--navy)", lineHeight: 1.15, marginBottom: 12 }}>
                Built for India. Designed for clarity.
              </h2>
              <p style={{ fontSize: 17, color: "var(--slate)", maxWidth: 480, margin: "0 auto" }}>
                The only planner that accounts for EPF, NPS, SIP, Indian inflation, joint spouses, children's education, and career breaks — all at once.
              </p>
            </motion.div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 16 }}>
              {[
                { icon: <BarChart3 size={22} />, ic: "var(--orange)", ib: "#FFF7ED", title: "Year-by-Year Projections", desc: "Every year from now to age 90 — when your corpus peaks, when it runs out, and the exact gap size." },
                { icon: <Users size={22} />, ic: "#15803D", ib: "#F0FDF4", title: "Joint Spouse Planning", desc: "Model both partners independently — different retirement ages, incomes, and timelines, one unified plan." },
                { icon: <BookOpen size={22} />, ic: "var(--blue)", ib: "var(--blue-lt)", title: "Children's Goals", desc: "Education, marriage, and lump-sum goals — inflation-adjusted to the exact year they're needed." },
                { icon: <Sliders size={22} />, ic: "#7C3AED", ib: "#F5F3FF", title: "India-Specific", desc: "EPF, NPS tiers, ELSS, Indian inflation, post-retirement returns — not US-default assumptions." },
                { icon: <Shield size={22} />, ic: "#0F766E", ib: "#F0FDFA", title: "Loans & Sabbaticals", desc: "Model EMIs that end mid-plan and career breaks where savings pause but corpus keeps growing." },
                { icon: <FileText size={22} />, ic: "#92660A", ib: "#FFFBEB", title: "PDF & Excel Export", desc: "Download your full plan as a professional report or spreadsheet to share with your advisor." },
              ].map((f, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .06 }}>
                  <div className="card-hover" style={{
                    background: "#fff", border: "1px solid var(--border)", borderRadius: 18,
                    padding: "28px", height: "100%",
                    boxShadow: "0 1px 4px rgba(15,41,82,.05)",
                  }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: f.ib, display: "flex", alignItems: "center", justifyContent: "center", color: f.ic, marginBottom: 18 }}>
                      {f.icon}
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", marginBottom: 8, fontFamily: "var(--font-sans)" }}>{f.title}</h3>
                    <p style={{ fontSize: 14, color: "var(--slate)", lineHeight: 1.65 }}>{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* AI card */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="ai-card-outer" style={{
                background: "var(--navy)", borderRadius: 20, padding: "36px 40px",
                display: "flex", flexWrap: "wrap", gap: 32, alignItems: "center",
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="lp-label" style={{ background: "rgba(163,230,53,.12)", color: "#A3E635", border: "1px solid rgba(163,230,53,.2)", marginBottom: 16 }}>
                    <Brain size={12} /> AI Advisor — Coming Soon
                  </div>
                  <h3 style={{ fontSize: "clamp(20px, 2.5vw, 28px)", fontWeight: 700, color: "#F8FAFC", marginBottom: 10, fontFamily: "var(--font-serif)" }}>
                    Your plan, explained in plain language.
                  </h3>
                  <p style={{ fontSize: 15, color: "rgba(255,255,255,.5)", lineHeight: 1.7, maxWidth: 400 }}>
                    Not generic advice — specific insights about your numbers, surfacing the one move that matters most.
                  </p>
                </div>
                <div style={{
                  flex: "0 0 auto", width: "100%", maxWidth: 440,
                  background: "#060E1A", borderRadius: 14, padding: "20px 24px",
                  border: "1px solid rgba(163,230,53,.15)",
                  overflow: "hidden",
                  minWidth: 0,
                }}>
                  <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                    {["#FF5F56","#FFBD2E","#27C93F"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
                    <span style={{ marginLeft: 6, fontSize: 11, color: "#4B5563", fontFamily: "var(--font-mono)" }}>advisor.insight</span>
                  </div>
                  <div style={{
                    fontSize: 13, lineHeight: 1.7, minHeight: 60,
                    fontFamily: "var(--font-mono)", color: "#A3E635",
                    overflowWrap: "break-word", wordBreak: "break-word",
                  }}>
                    <span style={{ color: "#4B5563" }}>&gt; </span>
                    <TypewriterCycle />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
        <section style={{ background: "var(--bg)", padding: "88px 24px" }}>
          <div className="lp-section" style={{ maxWidth: 1200 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 56 }}>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 800, color: "var(--navy)", lineHeight: 1.15, marginBottom: 12 }}>
                From zero to full plan <em style={{ color: "var(--orange)", fontStyle: "italic" }}>in 60 seconds.</em>
              </h2>
            </motion.div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 0, position: "relative" }}>
              {[
                { n: "01", icon: <Users size={26} />, title: "Tell it your life", desc: "Age, income, expenses, savings, children, loans — the full picture.", color: "var(--blue)" },
                { n: "02", icon: <BarChart3 size={26} />, title: "See your gap", desc: "Year-by-year corpus projection — when it peaks, when it runs out, how big the gap is.", color: "var(--orange)" },
                { n: "03", icon: <Zap size={26} />, title: "Act on it", desc: "Tweak inputs in real-time and watch how small changes close the gap dramatically.", color: "#16A34A" },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .15 }}>
                  <div style={{ textAlign: "center", padding: "20px 32px 40px", position: "relative" }}>
                    {i < 2 && (
                      <div style={{ position: "absolute", top: 36, left: "calc(50% + 48px)", right: 0, borderTop: "2px dashed var(--border)" }} className="hidden md:block" />
                    )}
                    <div style={{ width: 72, height: 72, borderRadius: "50%", background: s.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", margin: "0 auto 20px", boxShadow: `0 8px 24px ${s.color}44` }}>
                      {s.icon}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: s.color, letterSpacing: ".12em", fontFamily: "var(--font-mono)", marginBottom: 10 }}>STEP {s.n}</div>
                    <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--navy)", marginBottom: 10, fontFamily: "var(--font-sans)" }}>{s.title}</h3>
                    <p style={{ fontSize: 14, color: "var(--slate)", lineHeight: 1.7, maxWidth: 260, margin: "0 auto" }}>{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PLANNER ──────────────────────────────────────────────────────── */}
        <section id="planner" style={{ background: "var(--bg-alt)", padding: "88px 24px", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
          <div className="lp-section" style={{ maxWidth: 1200 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 40 }}>
              <div className="lp-label" style={{ background: "#FFF7ED", color: "var(--orange)", border: "1px solid #FED7AA", marginBottom: 20 }}>
                Free · No Account Required
              </div>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 800, color: "var(--navy)", lineHeight: 1.15, marginBottom: 12 }}>
                Build Your Complete Retirement Plan
              </h2>
              <p style={{ fontSize: 16, color: "var(--slate)", maxWidth: 500, margin: "0 auto 28px" }}>
                EPF · NPS · SIP · Joint spouse · Children's education · Loans — all in one calculation. Takes 60 seconds.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px 20px", fontSize: 12, color: "#94A3B8" }}>
                {["🔒 256-bit SSL Secured", "🇮🇳 India-Specific", "✅ AMFI-Registered Partner", "🛡️ Data never sold"].map(t => <span key={t}>{t}</span>)}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: .1 }}>
              <LandingPlannerSection />
            </motion.div>
          </div>
        </section>

        {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
        <section style={{ background: "var(--bg)", padding: "88px 24px" }}>
          <div className="lp-section" style={{ maxWidth: 1200 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 52 }}>
              <div className="lp-label" style={{ background: "#FFFBEB", color: "#92660A", border: "1px solid #FDE68A", marginBottom: 20 }}>
                From real users across India
              </div>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 800, color: "var(--navy)", lineHeight: 1.15 }}>
                What changed after they saw <em style={{ color: "var(--orange)", fontStyle: "italic" }}>their number.</em>
              </h2>
            </motion.div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
              {[
                { q: "I had three SIPs and thought I was set. RetirePro showed my corpus runs out at 72. I added ₹8,000/month that week. That one calculation changed everything.", name: "Arjun Mehta, 34", role: "Software Engineer, Bangalore", init: "AM", color: "var(--blue)" },
                { q: "My husband and I argued endlessly about how much was 'enough'. We plugged in our numbers — gap was ₹1.8 Cr. We stopped arguing and started planning.", name: "Priyanka Sharma, 41", role: "Marketing Director, Mumbai", init: "PS", color: "var(--orange)" },
                { q: "I'm self-employed — no EPF, no corporate NPS. This was the first planner that handled irregular income properly. My target retirement moved from 65 to 60.", name: "Karthik Iyer, 38", role: "Architect & Consultant, Chennai", init: "KI", color: "#16A34A" },
              ].map((t, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .1 }}>
                  <div className="card-hover" style={{
                    background: "#fff", border: "1px solid var(--border)", borderRadius: 20,
                    padding: "28px", height: "100%", display: "flex", flexDirection: "column",
                    boxShadow: "0 1px 4px rgba(15,41,82,.05)",
                    borderTop: `3px solid ${t.color}`,
                  }}>
                    <Quote size={24} style={{ color: t.color, opacity: .5, marginBottom: 16, flexShrink: 0 }} />
                    <p style={{ fontSize: 15, color: "#334155", lineHeight: 1.75, flex: 1, marginBottom: 24 }}>"{t.q}"</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: t.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{t.init}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)" }}>{t.name}</div>
                        <div style={{ fontSize: 12, color: "#94A3B8" }}>{t.role}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: .3 }} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 40 }}>
              <div style={{ display: "flex", gap: 2 }}>
                {[1,2,3,4,5].map(s => <Star key={s} size={18} style={{ fill: "var(--saffron)", color: "var(--saffron)" }} />)}
              </div>
              <span style={{ fontSize: 14, color: "var(--slate)" }}>Trusted by planners from Pune · Delhi · Hyderabad · Kolkata · Ahmedabad</span>
            </motion.div>
          </div>
        </section>

        {/* ── BLOG ─────────────────────────────────────────────────────────── */}
        <section style={{ background: "var(--bg-alt)", padding: "88px 24px", borderTop: "1px solid var(--border)" }}>
          <div className="lp-section" style={{ maxWidth: 1200 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
              <div>
                <div className="lp-label" style={{ background: "var(--blue-lt)", color: "var(--blue)", border: "1px solid #BFDBFE", marginBottom: 16 }}>Read &amp; Learn</div>
                <h2 style={{ fontSize: "clamp(24px, 3.5vw, 38px)", fontWeight: 800, color: "var(--navy)" }}>India-specific retirement guides</h2>
                <p style={{ fontSize: 16, color: "var(--slate)", marginTop: 6 }}>Written in plain language, grounded in real numbers.</p>
              </div>
              <Link href="/blog" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: "var(--orange)", textDecoration: "none" }}>
                All articles <ArrowRight size={16} />
              </Link>
            </motion.div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
              {[
                { href: "/blog/retirement-corpus-calculator-india-serious-planners", tag: "Serious Planning", label: "New", title: "Why Serious Planners Are Ditching Quick Google Calculators", excerpt: "76% of Indians will retire without a plan. That two-box calculator number? Almost certainly wrong.", time: "11 min", bg: "linear-gradient(135deg, #0F2952 0%, #1E3A5F 100%)" },
                { href: "/blog/real-estate-rich-retirement-illusion", tag: "HNI Planning", title: "The ₹40 Crore Illusion: Why India's Wealthiest Retirees Are the Most Exposed", excerpt: "Most HNIs believe their net worth guarantees comfort. Here's the arithmetic that says otherwise.", time: "9 min", bg: "linear-gradient(135deg, #1E3A5F 0%, #2D5282 100%)" },
                { href: "/blog/why-indians-fail-retirement", tag: "Basics", title: "Why Most Indians Fail at Retirement Planning — and How One Habit Changes Everything", excerpt: "93% of Indians over 50 regret not planning sooner. Here's what goes wrong.", time: "8 min", bg: "linear-gradient(135deg, #92400E 0%, #B45309 100%)" },
              ].map((p, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .1 }}>
                  <Link href={p.href} style={{ display: "block", textDecoration: "none" }}>
                    <div className="card-hover" style={{
                      background: "#fff", borderRadius: 18, overflow: "hidden",
                      border: "1px solid var(--border)", boxShadow: "0 1px 4px rgba(15,41,82,.05)",
                    }}>
                      <div style={{ height: 160, background: p.bg, display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "16px 20px" }}>
                        <span style={{ fontSize: 12, fontWeight: 700, background: "rgba(255,255,255,.18)", color: "#fff", padding: "4px 12px", borderRadius: 100, backdropFilter: "blur(6px)" }}>{p.tag}</span>
                        {(p as any).label && <span style={{ fontSize: 11, fontWeight: 700, background: "var(--orange)", color: "#fff", padding: "4px 10px", borderRadius: 100, textTransform: "uppercase", letterSpacing: ".06em" }}>{(p as any).label}</span>}
                      </div>
                      <div style={{ padding: "20px 22px 22px" }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", marginBottom: 8, lineHeight: 1.45, fontFamily: "var(--font-sans)" }}>{p.title}</h3>
                        <p style={{ fontSize: 13, color: "var(--slate)", lineHeight: 1.65, marginBottom: 16 }}>{p.excerpt}</p>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 12, color: "#94A3B8", display: "flex", alignItems: "center", gap: 4 }}><Clock size={12} /> {p.time} read</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--orange)", display: "flex", alignItems: "center", gap: 4 }}>Read <ArrowRight size={13} /></span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PERSONA SECTION ───────────────────────────────────────────────── */}
        <section style={{ background: "var(--navy)", padding: "88px 24px" }}>
          <div className="lp-section" style={{ maxWidth: 1200 }}>
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .7 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
                <div style={{ width: 4, height: 36, background: "var(--saffron)", borderRadius: 4 }} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--saffron)", fontFamily: "var(--font-mono)" }}>Does this sound like you?</span>
              </div>
              <h2 style={{ fontSize: "clamp(28px, 4.5vw, 52px)", fontWeight: 900, color: "#F8FAFC", lineHeight: 1.1, maxWidth: 700, marginBottom: 20 }}>
                76% of Indians will retire <span style={{ color: "var(--saffron)" }}>without a plan.</span>
              </h2>
              <p style={{ fontSize: 18, color: "rgba(255,255,255,.5)", maxWidth: 560, marginBottom: 52, lineHeight: 1.7 }}>
                Not because they didn't earn enough — because they never sat down with the real numbers.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 52 }}>
                {[
                  { age: "34", profile: "Has an SIP running. Never checked if it adds up.", note: "26 years left. Still very fixable — but compounding won't wait.", color: "#93C5FD" },
                  { age: "42", profile: "EPF, NPS, mutual funds all in different places. Never seen the full picture.", note: "18 years left. Every year of drift costs multiples.", color: "var(--saffron)" },
                  { age: "48", profile: "Realised retirement is 12 years away, not 'sometime in the future'.", note: "The gap is still closable — if you start now.", color: "#6EE7B7" },
                ].map((p) => (
                  <div key={p.age} style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", borderTop: `3px solid ${p.color}`, borderRadius: 18, padding: "28px 24px" }}>
                    <div style={{ fontSize: 52, fontWeight: 900, color: p.color, lineHeight: 1, marginBottom: 14, fontFamily: "var(--font-serif)" }}>{p.age}</div>
                    <p style={{ fontSize: 15, color: "#E2E8F0", fontWeight: 600, marginBottom: 10 }}>{p.profile}</p>
                    <div style={{ background: "rgba(255,255,255,.04)", borderRadius: 8, padding: "10px 14px" }}>
                      <p style={{ fontSize: 12, color: p.color, fontWeight: 600 }}>{p.note}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 24, paddingTop: 36, borderTop: "1px solid rgba(255,255,255,.08)" }}>
                <div>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,.4)", marginBottom: 12 }}>Free. No login. Your data stays yours.</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 24px" }}>
                    {[["🎛️", "No hidden assumptions"], ["📈", "Year-by-year projections"], ["🇮🇳", "EPF · NPS · SIP built-in"]].map(([ic, t]) => (
                      <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#CBD5E1" }}>
                        <span>{ic}</span><span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Link href="/free-plan">
                  <button style={{
                    background: "var(--saffron)", color: "#080C12", fontWeight: 800, fontSize: 15,
                    padding: "14px 32px", borderRadius: 100, border: "none", cursor: "pointer",
                    fontFamily: "var(--font-sans)", whiteSpace: "nowrap",
                    transition: "opacity .15s",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = ".88")}
                    onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                  >
                    Find My Real Retirement Number →
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── ADVISOR ──────────────────────────────────────────────────────── */}
        <AdvisorSection />

        {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
        <section style={{ background: "var(--bg)", padding: "100px 24px", textAlign: "center", borderTop: "1px solid var(--border)" }}>
          <div className="lp-section" style={{ maxWidth: 720 }}>
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#FFF7ED", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px" }}>
                <TrendingUp size={28} color="var(--orange)" />
              </div>
              <h2 style={{ fontSize: "clamp(30px, 5vw, 52px)", fontWeight: 900, color: "var(--navy)", lineHeight: 1.12, marginBottom: 18 }}>
                Your 65-year-old self<br />
                <em style={{ color: "var(--orange)", fontStyle: "italic" }}>is counting on today's you.</em>
              </h2>
              <p style={{ fontSize: 18, color: "var(--slate)", marginBottom: 36 }}>
                Build a complete retirement plan — free, no account, no commitment.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginBottom: 32 }}>
                <button
                  onClick={() => document.getElementById("planner")?.scrollIntoView({ behavior: "smooth" })}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "var(--orange)", color: "#fff", border: "none",
                    fontWeight: 700, fontSize: 16, padding: "16px 36px", borderRadius: 100,
                    cursor: "pointer", fontFamily: "var(--font-sans)",
                    animation: "pulse 2.5s ease-in-out infinite",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.animation = "none"; e.currentTarget.style.transform = "scale(1.03)"; }}
                  onMouseLeave={e => { e.currentTarget.style.animation = "pulse 2.5s ease-in-out infinite"; e.currentTarget.style.transform = ""; }}
                  data-testid="button-start-planning"
                >
                  <ArrowRight size={18} /> Start My Free Plan
                </button>
                <button
                  onClick={() => { window.location.href = "/api/login"; }}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "transparent", color: "var(--navy)",
                    border: "1.5px solid var(--border)",
                    fontWeight: 600, fontSize: 15, padding: "16px 32px", borderRadius: 100,
                    cursor: "pointer", fontFamily: "var(--font-sans)",
                    transition: "border-color .15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--navy)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; }}
                >
                  Sign In to Save &amp; Track
                </button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px 18px", fontSize: 12, color: "#94A3B8" }}>
                {[<><CheckCircle size={12} style={{ display: "inline", verticalAlign: "middle" }} /> Free forever</>, <><CheckCircle size={12} style={{ display: "inline", verticalAlign: "middle" }} /> No credit card</>, <><CheckCircle size={12} style={{ display: "inline", verticalAlign: "middle" }} /> India-specific</>].map((t, i) => <span key={i}>{t}</span>)}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────────────── */}
        <footer style={{ background: "var(--navy)", padding: "40px 24px", borderTop: "1px solid rgba(255,255,255,.06)" }}>
          <div className="lp-section" style={{ maxWidth: 1200, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src={logoUrl} alt="RetirePro" style={{ width: 22, height: 22, objectFit: "contain" }} />
              </div>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>RetirePro</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px 24px" }}>
              {[["Blog", "/blog"], ["Privacy Policy", "/privacy-policy"], ["Disclaimer", "/disclaimer"], ["Refund Policy", "/refund-policy"], ["Terms", "/terms-and-conditions"]].map(([l, h]) => (
                <Link key={l} href={h} style={{ fontSize: 13, color: "rgba(255,255,255,.4)", textDecoration: "none", transition: "color .15s" }}
                  onMouseEnter={(e: any) => e.currentTarget.style.color = "#fff"}
                  onMouseLeave={(e: any) => e.currentTarget.style.color = "rgba(255,255,255,.4)"}
                >{l}</Link>
              ))}
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.25)" }}>© 2025 RetirePro · Free retirement planning for India</p>
          </div>
        </footer>
      </div>
    </>
  );
}
