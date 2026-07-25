import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  ChartLine, Zap, Shield, BarChart3, ArrowRight, TrendingUp, Users, Clock,
  AlertTriangle, BookOpen, Star, Lock, Brain, FileText, Sliders, CheckCircle2,
  Quote
} from "lucide-react";
import BrandLogo from "@/components/brand-logo";
import logoUrl from "@/assets/retirepro-logo.png";
import QuickPlanForm from "@/components/quick-plan-form";
import AdvisorSection from "@/components/advisor-section";

// ─── Animated counter (integers) ─────────────────────────────────────────────
function AnimatedNumber({ target, prefix = "", suffix = "", decimals = 0 }: { target: number; prefix?: string; suffix?: string; decimals?: number }) {
  const [displayed, setDisplayed] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = target / 60;
        const id = setInterval(() => {
          start += step;
          if (start >= target) { setDisplayed(target); clearInterval(id); }
          else setDisplayed(Math.round(start * Math.pow(10, decimals)) / Math.pow(10, decimals));
        }, 16);
      }
    }, { threshold: 0.4 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, decimals]);
  const formatted = decimals > 0 ? displayed.toFixed(decimals) : displayed.toLocaleString("en-IN");
  return <span ref={ref}>{prefix}{formatted}{suffix}</span>;
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
    card.style.transform = `perspective(600px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.02)`;
  };
  const handleLeave = () => {
    const card = ref.current;
    if (!card) return;
    card.style.transition = "transform 0.4s ease";
    card.style.transform = "perspective(600px) rotateY(0deg) rotateX(0deg) scale(1)";
  };
  return (
    <div ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave} className={className}
      style={{ willChange: "transform", transformStyle: "preserve-3d" }}>
      {children}
    </div>
  );
}

// ─── Typewriter cycling component ────────────────────────────────────────────
const ADVISOR_INSIGHTS = [
  "At your current savings rate, your corpus runs out by age 74. You need ₹8,400 more/mo.",
  "Your education goal for Ananya overlaps with peak EMI years — consider prepaying 20% now.",
  "Switching ₹5,000/mo from FD to ELSS could close 40% of your retirement gap by 60.",
  "Your spouse's income stops at 55 — plan a 6-year income bridge to cover the gap.",
];

function TypewriterCycle() {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"typing" | "pause" | "erasing">("typing");
  useEffect(() => {
    const full = ADVISOR_INSIGHTS[idx];
    let timeout: ReturnType<typeof setTimeout>;
    if (phase === "typing") {
      if (text.length < full.length) {
        timeout = setTimeout(() => setText(full.slice(0, text.length + 1)), 28);
      } else {
        timeout = setTimeout(() => setPhase("pause"), 2000);
      }
    } else if (phase === "pause") {
      timeout = setTimeout(() => setPhase("erasing"), 400);
    } else {
      if (text.length > 0) {
        timeout = setTimeout(() => setText(text.slice(0, -1)), 14);
      } else {
        setIdx((idx + 1) % ADVISOR_INSIGHTS.length);
        setPhase("typing");
      }
    }
    return () => clearTimeout(timeout);
  }, [text, phase, idx]);
  return (
    <span style={{ fontFamily: "var(--font-mono)", color: "#A3E635" }}>
      {text}<span style={{ borderRight: "2px solid #A3E635", animation: "cursorBlink 1s step-end infinite" }}>&nbsp;</span>
    </span>
  );
}

// ─── Landing Planner — full form, no auth required ───────────────────────────
function LandingPlannerSection() {
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/plan/try", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).message || "Calculation failed. Please check your inputs.");
      }
      const result = await res.json();
      sessionStorage.setItem("guestCalcResult", JSON.stringify(result));
      sessionStorage.setItem("guestCalcForm", JSON.stringify({
        fullName: data.fullName,
        dob: data.dob,
        retirementAge: String(data.retirementAge),
        monthlyIncomeTotal: String(data.monthlyIncomeTotal),
        monthlyExpenseTotal: String(data.monthlyExpenseTotal),
        monthlySavings: String(data.monthlySavings),
        assetsLumpSum: String(data.assetsLumpSum ?? 0),
        returnPre: String(data.assumptions?.returnPre ?? 12),
        inflationRate: String(data.assumptions?.inflationHeadline ?? 7),
      }));
      navigate("/plan/preview");
    } catch (e: any) {
      setError(e.message ?? "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {error && (
        <div className="mb-4 text-sm text-red-600 flex items-center gap-2 bg-red-50 rounded-xl px-4 py-3 border border-red-200">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" /> {error}
        </div>
      )}
      <QuickPlanForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}

// ─── Ticker ───────────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  { label: "NIFTY 50", value: "▲ 24,850", up: true },
  { label: "SENSEX", value: "▲ 81,200", up: true },
  { label: "INFLATION", value: "6.8%", up: false },
  { label: "AVG RETURN", value: "12.4%", up: true },
  { label: "RETIREMENT AGE", value: "60", up: false },
  { label: "LIFE EXPECTANCY", value: "85 yrs", up: false },
  { label: "CORPUS TARGET", value: "₹3.8 Cr", up: false },
  { label: "EPF WITHDRAWAL", value: "52L+", up: true },
  { label: "SIP GROWTH", value: "15%", up: true },
  { label: "NIFTY 50", value: "▲ 24,850", up: true },
  { label: "SENSEX", value: "▲ 81,200", up: true },
  { label: "INFLATION", value: "6.8%", up: false },
  { label: "AVG RETURN", value: "12.4%", up: true },
  { label: "RETIREMENT AGE", value: "60", up: false },
  { label: "LIFE EXPECTANCY", value: "85 yrs", up: false },
  { label: "CORPUS TARGET", value: "₹3.8 Cr", up: false },
  { label: "EPF WITHDRAWAL", value: "52L+", up: true },
  { label: "SIP GROWTH", value: "15%", up: true },
];

function DataTicker() {
  return (
    <div
      className="overflow-hidden border-t border-b"
      style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)", padding: "10px 0" }}
      aria-hidden="true"
    >
      <div className="flex gap-10 whitespace-nowrap" style={{ animation: "tickerScroll 38s linear infinite", fontFamily: "var(--font-mono)", fontSize: "11px" }}>
        {TICKER_ITEMS.map((item, i) => (
          <span key={i} className="flex-shrink-0 flex items-center gap-1.5">
            <span style={{ color: "rgba(255,255,255,0.4)" }}>{item.label}</span>
            <span style={{ color: item.up ? "#4ADE80" : "#FCD34D", fontWeight: 600 }}>{item.value}</span>
            <span style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Animated SVG Corpus Curve ────────────────────────────────────────────────
function CorpusCurve() {
  return (
    <svg viewBox="0 0 260 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="curveGrad" x1="0" y1="0" x2="260" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#F15A24" />
        </linearGradient>
        <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 95 C30 90, 60 80, 80 68 C100 56, 110 50, 130 38 C150 26, 170 18, 200 10 C220 4, 240 2, 260 1"
        stroke="url(#curveGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        style={{
          strokeDasharray: 380,
          strokeDashoffset: 380,
          animation: "drawCurve 2s ease-out forwards 0.4s",
        }}
      />
      <path
        d="M0 95 C30 90, 60 80, 80 68 C100 56, 110 50, 130 38 C150 26, 170 18, 200 10 C220 4, 240 2, 260 1 L260 100 L0 100 Z"
        fill="url(#fillGrad)"
        style={{ opacity: 0, animation: "fadeIn 0.5s ease-out forwards 1.8s" }}
      />
      <circle cx="260" cy="1" r="4" fill="#F15A24" style={{ opacity: 0, animation: "fadeIn 0.3s ease-out forwards 2s" }} />
    </svg>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────
export default function Landing() {
  return (
    <>
      {/* ── Google Fonts + Global CSS ───────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;0,9..144,900;1,9..144,400;1,9..144,600;1,9..144,700&family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        :root {
          --ivory: #FBF8F2;
          --ink: #1A1208;
          --saffron: #E8940A;
          --saffron-light: #F59E0B;
          --orange: #F15A24;
          --leaf: #16A34A;
          --slate-mid: #475569;
          --hero-bg: #080E1A;
          --font-serif: 'Fraunces', Georgia, serif;
          --font-sans: 'Instrument Sans', system-ui, sans-serif;
          --font-mono: 'JetBrains Mono', monospace;
        }

        body { font-family: var(--font-sans); }

        h1, h2 { font-family: var(--font-serif); }

        .landing-num { font-family: var(--font-mono); }

        @keyframes orangePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(241,90,36,0.4); }
          50%       { box-shadow: 0 0 0 14px rgba(241,90,36,0); }
        }
        @keyframes saffronPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(232,148,10,0.5); }
          50%       { box-shadow: 0 0 0 16px rgba(232,148,10,0); }
        }
        @keyframes tickerScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes blobDrift1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(30px, -20px) scale(1.08); }
        }
        @keyframes blobDrift2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(-20px, 30px) scale(1.05); }
        }
        @keyframes drawCurve {
          to { stroke-dashoffset: 0; }
        }
        @keyframes fadeIn {
          to { opacity: 1; }
        }
        @keyframes cursorBlink {
          50% { opacity: 0; }
        }
        @keyframes orbitA {
          from { transform: rotate(0deg) translateX(90px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(90px) rotate(-360deg); }
        }
        @keyframes orbitB {
          from { transform: rotate(180deg) translateX(60px) rotate(-180deg); }
          to   { transform: rotate(540deg) translateX(60px) rotate(-540deg); }
        }
        @keyframes orbitC {
          from { transform: rotate(90deg) translateX(90px) rotate(-90deg); }
          to   { transform: rotate(450deg) translateX(90px) rotate(-450deg); }
        }
        @keyframes orbitD {
          from { transform: rotate(270deg) translateX(60px) rotate(-270deg); }
          to   { transform: rotate(630deg) translateX(60px) rotate(-630deg); }
        }
        @keyframes heroGlow {
          0%, 100% { opacity: 0.6; }
          50%       { opacity: 1; }
        }
        @keyframes floatUp {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-6px); }
        }

        html { scroll-behavior: smooth; }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* ── Section layout ──────────────────────────────────────── */
        .section-inner {
          width: 100%;
          max-width: 1280px;
          margin-left: auto;
          margin-right: auto;
        }

        @media (min-width: 1920px) {
          .section-inner { max-width: 1600px; }
          .header-inner { max-width: 1600px; }
          .cta-orbit-wrap { width: 380px !important; height: 380px !important; }
        }
        @media (min-width: 2560px) {
          .section-inner { max-width: 1920px; }
          .header-inner { max-width: 1920px; }
          .cta-orbit-wrap { width: 540px !important; height: 540px !important; }
        }

        .section-dot-grid-left,
        .section-dot-grid-right {
          display: none;
          position: absolute;
          top: 0; bottom: 0;
          width: 200px;
          pointer-events: none;
          opacity: 0.35;
          background-image: radial-gradient(circle, rgba(26,18,8,0.12) 1px, transparent 1px);
          background-size: 22px 22px;
        }
        .section-dot-grid-left  { left: 0; mask-image: linear-gradient(to right, rgba(0,0,0,0.6) 0%, transparent 100%); }
        .section-dot-grid-right { right: 0; mask-image: linear-gradient(to left, rgba(0,0,0,0.6) 0%, transparent 100%); }

        @media (min-width: 1920px) {
          .section-dot-grid-left, .section-dot-grid-right { display: block; }
        }

        /* Mobile hero fixes */
        @media (max-width: 359px) {
          .hero-heading { font-size: 30px !important; }
          .hero-subtext { font-size: 15px !important; }
          .hero-cta-row { flex-direction: column !important; }
          .hero-cta-btn-primary { width: 100%; justify-content: center; }
          .hero-cta-btn-secondary { width: 100%; justify-content: center; }
          .hero-plan-card { padding: 18px 14px !important; }
          .hero-sip-pill { flex-direction: column !important; gap: 2px !important; padding: 10px 12px !important; }
          .stat-dark-card { padding: 22px 18px !important; }
          .feature-card { padding: 16px !important; }
          .ai-advisor-chip { white-space: normal !important; text-align: left !important; line-height: 1.4 !important; }
          .ai-terminal-text { word-break: break-word !important; overflow-wrap: anywhere !important; }
          .blog-header-row { flex-direction: column !important; align-items: flex-start !important; }
          .cta-orbit-wrap { width: 180px !important; height: 180px !important; }
        }

        .trust-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 8px 16px;
          margin-bottom: 24px;
          font-size: 13px;
          color: #64748B;
        }
        .trust-badge { white-space: nowrap; }
        .trust-divider { color: #CBD5E1; }

        /* Hero noise grain */
        .hero-grain::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          opacity: 0.4;
        }
      `}</style>

      <div className="min-h-screen overflow-x-hidden" style={{ background: "var(--hero-bg)", fontFamily: "var(--font-sans)" }}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header className="fixed top-0 left-0 right-0 z-50 border-b" style={{ background: "rgba(8,14,26,0.85)", backdropFilter: "blur(20px)", borderColor: "rgba(255,255,255,0.07)" }}>
          <div className="header-inner mx-auto px-6 flex items-center justify-between h-16" style={{ maxWidth: 1280 }}>
            <BrandLogo href={null} textClassName="text-white" />
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/blog" className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>Blog</Link>
              <a href="#planner" className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>Free Planner</a>
            </nav>
            <Button
              onClick={() => { window.location.href = "/api/login"; }}
              className="rounded-full px-5 h-9 text-sm font-semibold"
              style={{ background: "var(--orange)", color: "#fff" }}
              data-testid="button-login"
            >
              Sign In
            </Button>
          </div>
        </header>

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <section
          className="hero-grain relative min-h-screen pt-16 flex items-center overflow-hidden"
          style={{ background: "linear-gradient(135deg, #080E1A 0%, #0D1628 40%, #111827 100%)" }}
        >
          {/* Saffron glow top-left */}
          <div className="absolute pointer-events-none" style={{
            top: -160, left: -160, width: 640, height: 640,
            background: "radial-gradient(circle, rgba(232,148,10,0.22) 0%, transparent 60%)",
            animation: "blobDrift1 16s ease-in-out infinite",
          }} />
          {/* Orange glow bottom-right */}
          <div className="absolute pointer-events-none" style={{
            bottom: -100, right: -100, width: 500, height: 500,
            background: "radial-gradient(circle, rgba(241,90,36,0.16) 0%, transparent 60%)",
            animation: "blobDrift2 20s ease-in-out infinite",
          }} />
          {/* Subtle blue accent mid */}
          <div className="absolute pointer-events-none" style={{
            top: "40%", right: "15%",
            width: 300, height: 300,
            background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 65%)",
          }} />

          {/* Grid overlay */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }} />

          <div className="relative max-w-[1400px] mx-auto px-8 lg:px-16 pt-24 pb-32 lg:pt-32 lg:pb-44 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
            {/* Left: copy */}
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>

              {/* Urgency pill */}
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full mb-8"
                style={{ background: "rgba(241,90,36,0.15)", border: "1px solid rgba(241,90,36,0.35)", color: "#FB923C" }}
              >
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#FB923C", display: "inline-block", animation: "orangePulse 2s ease-in-out infinite" }} />
                76% of Indians have no retirement corpus — are you in the other 24%?
              </motion.div>

              <h1 className="hero-heading" style={{ fontSize: "clamp(40px, 5.2vw, 76px)", fontWeight: 900, lineHeight: 1.04, color: "#FFFFFF", marginBottom: "10px", fontFamily: "var(--font-serif)" }}>
                Your retirement gap
              </h1>
              <h1 className="hero-heading" style={{ fontSize: "clamp(40px, 5.2vw, 76px)", fontWeight: 900, lineHeight: 1.04, marginBottom: "28px", fontFamily: "var(--font-serif)" }}>
                <em style={{ color: "var(--saffron)", fontStyle: "italic" }}>is already costing you.</em>
              </h1>

              <p className="hero-subtext" style={{ fontSize: "19px", lineHeight: 1.75, color: "rgba(255,255,255,0.62)", marginBottom: "36px", maxWidth: "500px" }}>
                Build a complete, personalised retirement plan in 60 seconds — income, expenses, children's education, loans, mini-retirement breaks. <strong style={{ color: "rgba(255,255,255,0.9)" }}>Free. No login required.</strong>
              </p>

              {/* CTA row */}
              <div className="hero-cta-row flex flex-wrap gap-3 mb-10">
                <button
                  className="hero-cta-btn-primary flex items-center gap-2 rounded-full text-white font-bold text-base"
                  style={{ background: "var(--orange)", height: "54px", padding: "0 36px", animation: "orangePulse 2.5s ease-in-out infinite", fontSize: 16 }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.animation = "none";
                    (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.04)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 28px rgba(241,90,36,0.55)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.animation = "orangePulse 2.5s ease-in-out infinite";
                    (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "";
                  }}
                  onClick={() => document.getElementById("planner")?.scrollIntoView({ behavior: "smooth" })}
                  data-testid="button-get-started"
                >
                  Calculate My Retirement Gap
                  <ArrowRight className="h-5 w-5" />
                </button>

                <button
                  className="hero-cta-btn-secondary flex items-center gap-2 rounded-full font-semibold text-base"
                  style={{ height: "54px", padding: "0 28px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.85)", transition: "all 0.2s ease" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.12)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)"; }}
                  onClick={() => { window.location.href = "/api/login"; }}
                  data-testid="button-sign-in"
                >
                  Sign In to Save
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* Trust micro-row */}
              <div className="flex flex-wrap gap-x-5 gap-y-2" style={{ fontSize: "12px", color: "rgba(255,255,255,0.38)" }}>
                {["🔒 256-bit SSL", "🇮🇳 India-specific (EPF, NPS, SIP)", "✅ AMFI-registered", "🛡️ Data never sold"].map(t => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </motion.div>

            {/* Right: animated plan card */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.25 }}
              className="flex items-center justify-center"
            >
              <div
                className="hero-plan-card w-full rounded-2xl sm:rounded-3xl"
                style={{
                  maxWidth: 420,
                  background: "rgba(255,255,255,0.04)",
                  padding: "28px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 40px 80px -16px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)",
                  backdropFilter: "blur(12px)",
                  animation: "floatUp 6s ease-in-out infinite",
                }}
              >
                {/* Card header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "var(--orange)" }}>
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: "#F1F5F9" }}>Priya's Retirement Plan</div>
                    <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Retiring at 60 · Projected to 85</div>
                  </div>
                </div>

                {/* SVG corpus curve */}
                <div style={{ height: 100, marginBottom: 20, borderRadius: 12, overflow: "hidden", background: "rgba(255,255,255,0.04)", padding: "8px 8px 4px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <CorpusCurve />
                </div>

                {/* Stat chips */}
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-3">
                  {[
                    { label: "Projected", value: "₹3.2 Cr", bg: "rgba(22,163,74,0.12)", color: "#4ADE80", border: "rgba(22,163,74,0.2)" },
                    { label: "Required", value: "₹4.5 Cr", bg: "rgba(255,255,255,0.05)", color: "#94A3B8", border: "rgba(255,255,255,0.08)" },
                    { label: "Gap", value: "₹1.3 Cr", bg: "rgba(241,90,36,0.12)", color: "#FB923C", border: "rgba(241,90,36,0.25)" },
                  ].map(chip => (
                    <div key={chip.label} className="rounded-xl p-2 sm:p-3 text-center" style={{ background: chip.bg, border: `1px solid ${chip.border}` }}>
                      <div className="text-[9px] sm:text-[10px] mb-0.5" style={{ color: chip.color, opacity: 0.7 }}>{chip.label}</div>
                      <div className="text-xs sm:text-sm font-bold landing-num" style={{ color: chip.color }}>{chip.value}</div>
                    </div>
                  ))}
                </div>

                {/* SIP pill */}
                <div className="hero-sip-pill rounded-xl px-4 py-3 flex items-center justify-between" style={{ background: "rgba(232,148,10,0.15)", border: "1px solid rgba(232,148,10,0.3)" }}>
                  <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>Monthly SIP needed to close gap</span>
                  <span className="font-bold landing-num" style={{ color: "var(--saffron-light)", fontSize: "15px" }}>₹12,400/mo</span>
                </div>

                {/* Social proof count */}
                <div className="mt-4 flex items-center justify-center gap-2" style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
                  <div className="flex -space-x-1.5">
                    {["#E8940A","#F15A24","#60A5FA","#34D399"].map(c => (
                      <div key={c} style={{ width: 20, height: 20, borderRadius: "50%", background: c, border: "2px solid rgba(8,14,26,0.8)" }} />
                    ))}
                  </div>
                  <span>18,000+ Indians have found their number</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Ticker ──────────────────────────────────────────────────────── */}
        <DataTicker />

        {/* ── The Uncomfortable Math ──────────────────────────────────────── */}
        <section style={{ background: "#060C17", padding: "90px 24px", overflowX: "hidden", position: "relative" }}>
          <div className="absolute pointer-events-none" style={{ top: "10%", left: "3%", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,148,10,0.1) 0%, transparent 65%)" }} />
          <div className="absolute pointer-events-none" style={{ bottom: "10%", right: "3%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(96,165,250,0.08) 0%, transparent 65%)" }} />
          <div className="section-inner">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
              <div className="inline-block text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5" style={{ background: "rgba(232,148,10,0.15)", color: "var(--saffron-light)", border: "1px solid rgba(232,148,10,0.25)" }}>
                Data-backed reality
              </div>
              <h2 style={{ fontSize: "clamp(32px, 4.5vw, 52px)", fontWeight: 700, color: "#F9FAFB", lineHeight: 1.15, marginBottom: 12, fontFamily: "var(--font-serif)" }}>
                The uncomfortable math
              </h2>
              <p style={{ color: "#9CA3AF", fontSize: "17px", maxWidth: 520, margin: "0 auto" }}>
                Most Indians know they should plan. Almost none have done the actual calculation.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  stat: 75.5, decimals: 1, suffix: "%",
                  label: "of Indians have no retirement corpus whatsoever",
                  source: "PFRDA Annual Report 2023–24",
                  accent: "var(--saffron-light)",
                },
                {
                  stat: 3.6, decimals: 1, suffix: "×",
                  label: "the corpus you need if you start at 40 vs 30",
                  source: "Compounding math at 12% p.a. CAGR",
                  accent: "#F87171",
                },
                {
                  stat: 59, decimals: 0, suffix: "%",
                  label: "of retirees depend on family for financial support",
                  source: "HSBC Future of Retirement India Study",
                  accent: "#60A5FA",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.5 }}
                  className="stat-dark-card rounded-2xl sm:rounded-[20px]"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    padding: "36px 32px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 3, background: item.accent, opacity: 0.8, borderRadius: "20px 20px 0 0" }} />
                  <div className="landing-num" style={{ fontSize: "clamp(52px, 6vw, 72px)", fontWeight: 700, color: item.accent, lineHeight: 1, marginBottom: 12 }}>
                    <AnimatedNumber target={item.stat} suffix={item.suffix} decimals={item.decimals} />
                  </div>
                  <p style={{ color: "#E5E7EB", fontSize: "16px", lineHeight: 1.5, marginBottom: 16, fontWeight: 500 }}>{item.label}</p>
                  <p style={{ color: "#6B7280", fontSize: "11px" }}>Source: {item.source}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why RetirePro — 6-card grid + AI advisor ────────────────────── */}
        <section style={{ padding: "90px 24px", background: "var(--ivory)", overflowX: "hidden", position: "relative" }}>
          <div className="section-dot-grid-left" />
          <div className="section-dot-grid-right" />
          <div className="section-inner">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
              <h2 style={{ fontSize: "clamp(32px, 4.5vw, 48px)", fontWeight: 700, color: "var(--ink)", lineHeight: 1.15, marginBottom: 12, fontFamily: "var(--font-serif)" }}>
                Why RetirePro?
              </h2>
              <p style={{ fontSize: "18px", color: "var(--slate-mid)", maxWidth: 520, margin: "0 auto" }}>
                Built for India. Designed for clarity. Free forever.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
              {[
                {
                  icon: <BarChart3 className="h-6 w-6" />,
                  iconBg: "rgba(241,90,36,0.1)", iconColor: "#C2410C",
                  title: "Year-by-Year Projections",
                  desc: "Get a complete cashflow and corpus projection for every year from now until 90 — not just a single number.",
                },
                {
                  icon: <Users className="h-6 w-6" />,
                  iconBg: "rgba(22,163,74,0.1)", iconColor: "#15803D",
                  title: "Joint Retirement Planning",
                  desc: "Model both spouses with independent retirement ages, income timelines, and expenses in one unified plan.",
                },
                {
                  icon: <BookOpen className="h-6 w-6" />,
                  iconBg: "rgba(59,130,246,0.1)", iconColor: "#1D4ED8",
                  title: "Children's Goals Built-in",
                  desc: "Factor in education costs, marriage expenses, and the exact years they hit — inflation-adjusted automatically.",
                },
                {
                  icon: <Sliders className="h-6 w-6" />,
                  iconBg: "rgba(139,92,246,0.1)", iconColor: "#7C3AED",
                  title: "India-Specific Assumptions",
                  desc: "EPF, NPS, ELSS, Indian inflation rates, and realistic post-retirement return assumptions — not US or global defaults.",
                },
                {
                  icon: <Shield className="h-6 w-6" />,
                  iconBg: "rgba(20,184,166,0.1)", iconColor: "#0F766E",
                  title: "Loans & Mini-Retirements",
                  desc: "Model existing EMIs that end mid-plan and career sabbaticals where savings pause but corpus grows.",
                },
                {
                  icon: <FileText className="h-6 w-6" />,
                  iconBg: "rgba(232,148,10,0.1)", iconColor: "#92660A",
                  title: "PDF & Excel Export",
                  desc: "Download your full plan as a professional report or spreadsheet — yours to keep, share, or show an advisor.",
                },
              ].map((f, i) => (
                <motion.div key={f.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.45 }}>
                  <TiltCard className="h-full">
                    <div
                      className="feature-card h-full rounded-2xl p-7"
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid rgba(0,0,0,0.07)",
                        transition: "box-shadow 0.3s ease",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 16px 48px rgba(0,0,0,0.1), 0 0 0 1px rgba(232,148,10,0.15)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; }}
                    >
                      <div className="inline-flex p-2.5 rounded-xl mb-4" style={{ background: f.iconBg, color: f.iconColor }}>
                        {f.icon}
                      </div>
                      <h3 className="font-bold mb-2" style={{ fontSize: "16px", color: "var(--ink)" }}>{f.title}</h3>
                      <p style={{ fontSize: "14px", color: "#64748B", lineHeight: 1.6 }}>{f.desc}</p>
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </div>

            {/* 7th card — AI Cashflow Advisor full-width */}
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <div
                className="rounded-2xl p-5 sm:p-8 md:p-10"
                style={{
                  background: "#0D1117",
                  border: "1px solid rgba(255,255,255,0.07)",
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: 32,
                }}
              >
                <div className="md:flex md:items-start md:gap-10" style={{ flexWrap: "nowrap" }}>
                  <div className="flex-1 mb-6 md:mb-0">
                    <div className="ai-advisor-chip inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5" style={{ background: "rgba(163,230,53,0.12)", color: "#A3E635", border: "1px solid rgba(163,230,53,0.2)" }}>
                      <Brain className="h-3 w-3 flex-shrink-0" />
                      AI Cashflow Advisor — Coming Soon
                    </div>
                    <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 700, color: "#F9FAFB", lineHeight: 1.2, marginBottom: 12 }}>
                      Your plan, explained in plain language.
                    </h3>
                    <p style={{ color: "#9CA3AF", fontSize: "15px", lineHeight: 1.7, maxWidth: 440 }}>
                      The AI advisor reads your numbers and surfaces the one move that matters most — not generic advice, but specific insight about your plan.
                    </p>
                  </div>

                  <div
                    className="flex-shrink-0 w-full md:w-auto rounded-2xl"
                    style={{
                      background: "#0A0F1A",
                      border: "1px solid rgba(163,230,53,0.15)",
                      padding: "20px 24px",
                      minHeight: 100,
                      maxWidth: 480,
                    }}
                  >
                    <div className="flex items-center gap-1.5 mb-4">
                      {["#FF5F56", "#FFBD2E", "#27C93F"].map(c => (
                        <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
                      ))}
                      <span className="ml-2 text-xs" style={{ color: "#4B5563", fontFamily: "var(--font-mono)" }}>advisor.insight</span>
                    </div>
                    <div className="ai-terminal-text" style={{ fontSize: "14px", lineHeight: 1.65, minHeight: 72, fontFamily: "var(--font-mono)" }}>
                      <span style={{ color: "#6B7280" }}>{">"} </span>
                      <TypewriterCycle />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── How it works ────────────────────────────────────────────────── */}
        <section style={{ background: "#FFFFFF", padding: "90px 24px", overflowX: "hidden", position: "relative" }}>
          <div className="section-dot-grid-left" />
          <div className="section-dot-grid-right" />
          <div className="section-inner">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
              <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, color: "var(--ink)", lineHeight: 1.15, marginBottom: 10, fontFamily: "var(--font-serif)" }}>
                From blank page to full plan<br /><em style={{ color: "var(--saffron)" }}>in 60 seconds.</em>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 relative">
              {[
                {
                  step: "01",
                  icon: <Users className="h-7 w-7" />,
                  title: "Tell it your life",
                  desc: "Enter your age, income, expenses, existing savings, and any children, loans, or planned career breaks.",
                  accent: "var(--saffron)",
                },
                {
                  step: "02",
                  icon: <BarChart3 className="h-7 w-7" />,
                  title: "See your gap",
                  desc: "Get a year-by-year projection — when your corpus peaks, when it runs out, and exactly how large the gap is.",
                  accent: "var(--orange)",
                },
                {
                  step: "03",
                  icon: <Zap className="h-7 w-7" />,
                  title: "Act on the insights",
                  desc: "Adjust inputs in real-time to see how small changes — more savings, earlier start — close the gap dramatically.",
                  accent: "#22C55E",
                },
              ].map((s, i) => (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="relative"
                >
                  <div className="hidden md:flex flex-col items-center text-center px-8 py-10">
                    {i < 2 && (
                      <div className="absolute top-[72px] left-[calc(50%+52px)] right-0 z-0"
                        style={{ borderTop: "2px dashed rgba(0,0,0,0.12)", transform: "translateY(-50%)" }}
                      />
                    )}
                    <div className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ background: s.accent, color: "#fff", boxShadow: `0 8px 24px ${s.accent}44` }}>
                      {s.icon}
                    </div>
                    <div className="landing-num text-xs font-bold mb-3" style={{ color: s.accent, letterSpacing: "0.12em" }}>STEP {s.step}</div>
                    <h3 className="font-bold mb-3" style={{ fontSize: "19px", color: "var(--ink)", fontFamily: "var(--font-serif)" }}>{s.title}</h3>
                    <p style={{ fontSize: "14px", color: "#64748B", lineHeight: 1.65, maxWidth: 260 }}>{s.desc}</p>
                  </div>

                  <div className="flex md:hidden items-start gap-4 px-4 py-5">
                    <div className="flex flex-col items-center flex-shrink-0" style={{ width: 48 }}>
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: s.accent, color: "#fff", boxShadow: `0 6px 18px ${s.accent}44` }}>
                        {s.icon}
                      </div>
                      {i < 2 && (
                        <div style={{ width: 2, flex: 1, minHeight: 40, marginTop: 8, background: "rgba(0,0,0,0.09)", borderRadius: 2 }} />
                      )}
                    </div>
                    <div className="pt-1 pb-6">
                      <div className="landing-num text-[10px] font-bold mb-1.5" style={{ color: s.accent, letterSpacing: "0.12em" }}>STEP {s.step}</div>
                      <h3 className="font-bold mb-1.5" style={{ fontSize: "17px", color: "var(--ink)", fontFamily: "var(--font-serif)" }}>{s.title}</h3>
                      <p style={{ fontSize: "14px", color: "#64748B", lineHeight: 1.65 }}>{s.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Planner ─────────────────────────────────────────────────────── */}
        <section id="planner" style={{ background: "linear-gradient(180deg, var(--ivory) 0%, #FFF 100%)", padding: "90px 24px", overflowX: "hidden", position: "relative" }}>
          <div className="section-dot-grid-left" style={{ opacity: 0.25 }} />
          <div className="section-dot-grid-right" style={{ opacity: 0.25 }} />
          <div className="section-inner">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-12">
              <span className="inline-block text-sm font-semibold px-4 py-1.5 rounded-full mb-4" style={{ background: "rgba(241,90,36,0.1)", color: "var(--orange)" }}>
                Free · No Account Required · Full Planner
              </span>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, color: "var(--ink)", lineHeight: 1.15, marginBottom: 12, fontFamily: "var(--font-serif)" }}>
                Build Your Complete Retirement Plan
                <span className="block" style={{ fontSize: "22px", fontWeight: 500, color: "#94A3B8", fontFamily: "var(--font-sans)" }}>No account required.</span>
              </h2>
              <p style={{ fontSize: "17px", color: "var(--slate-mid)", maxWidth: 520, margin: "0 auto" }}>
                Answer all the key questions — children's education, loans, mini-retirements — and get a detailed year-by-year plan with corpus projections and funding gap analysis.
              </p>
            </motion.div>

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
              <LandingPlannerSection />
            </motion.div>
          </div>
        </section>

        {/* ── Testimonials ────────────────────────────────────────────────── */}
        <section style={{ background: "#060C17", padding: "90px 24px", position: "relative", overflowX: "hidden" }}>
          <div className="absolute pointer-events-none" style={{ top: "20%", left: "5%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,148,10,0.07) 0%, transparent 65%)" }} />
          <div className="section-inner">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <div className="inline-block text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5" style={{ background: "rgba(232,148,10,0.12)", color: "var(--saffron-light)", border: "1px solid rgba(232,148,10,0.2)" }}>
                From real users across India
              </div>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700, color: "#F9FAFB", lineHeight: 1.2, fontFamily: "var(--font-serif)" }}>
                What changed after they saw<br />
                <em style={{ color: "var(--saffron)" }}>their real number.</em>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  quote: "I had three SIPs running and thought I was set. RetirePro showed me my corpus runs out at 72. I added ₹8,000/month that week. That calculation changed how I think about money.",
                  name: "Arjun Mehta",
                  role: "Software Engineer, Bangalore",
                  age: "34",
                  accentColor: "#60A5FA",
                  initials: "AM",
                },
                {
                  quote: "My husband and I always argued about how much was 'enough'. We plugged in our numbers together — the gap was ₹1.8 Cr. We stopped arguing and started planning. Brilliant tool.",
                  name: "Priyanka Sharma",
                  role: "Marketing Director, Mumbai",
                  age: "41",
                  accentColor: "#E8940A",
                  initials: "PS",
                },
                {
                  quote: "I'm self-employed — no EPF, no corporate NPS. This was the first planner that actually modelled irregular income. My retirement date moved from 65 to 60 after I understood the numbers.",
                  name: "Karthik Iyer",
                  role: "Architect & Consultant, Chennai",
                  age: "38",
                  accentColor: "#34D399",
                  initials: "KI",
                },
              ].map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.5 }}
                >
                  <div
                    className="h-full rounded-2xl p-7 flex flex-col"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderTop: `3px solid ${t.accentColor}`,
                    }}
                  >
                    <Quote className="h-6 w-6 mb-5 flex-shrink-0" style={{ color: t.accentColor, opacity: 0.6 }} />
                    <p style={{ color: "#CBD5E1", fontSize: "15px", lineHeight: 1.75, marginBottom: "auto", paddingBottom: 24 }}>
                      "{t.quote}"
                    </p>
                    <div className="flex items-center gap-3 pt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
                        style={{ background: t.accentColor, color: "#080C12" }}
                      >
                        {t.initials}
                      </div>
                      <div>
                        <div style={{ color: "#F1F5F9", fontWeight: 600, fontSize: 14 }}>{t.name}, {t.age}</div>
                        <div style={{ color: "rgba(255,255,255,0.38)", fontSize: 12 }}>{t.role}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Star row */}
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="flex items-center justify-center gap-3 mt-10">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => <Star key={s} className="h-5 w-5" style={{ fill: "#E8940A", color: "#E8940A" }} />)}
              </div>
              <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 14 }}>Trusted by planners from Pune, Delhi, Hyderabad, Kolkata &amp; beyond</span>
            </motion.div>
          </div>
        </section>

        {/* ── Blog ────────────────────────────────────────────────────────── */}
        <section style={{ background: "var(--ivory)", padding: "90px 24px", overflowX: "hidden", position: "relative" }}>
          <div className="section-dot-grid-left" />
          <div className="section-dot-grid-right" />
          <div className="section-inner">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="blog-header-row flex items-end justify-between mb-10 flex-wrap gap-4">
              <div>
                <h2 className="font-bold text-slate-900 mb-2" style={{ fontSize: "clamp(24px, 3.5vw, 38px)", fontFamily: "var(--font-serif)" }}>Learn Before You Plan</h2>
                <p className="text-lg text-slate-600">India-specific retirement guides, written in plain language.</p>
              </div>
              <Link href="/blog" className="hidden md:flex items-center gap-1 font-semibold hover:underline" style={{ color: "var(--orange)" }}>
                All articles <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  href: "/blog/retirement-corpus-calculator-india-serious-planners",
                  gradient: "from-slate-900 via-amber-950 to-orange-900",
                  tag: "Serious Planning · New",
                  title: "Why Serious Planners Are Ditching Quick Google Calculators for RetirePro",
                  excerpt: "76% of Indians will retire without a plan. That number you got from a two-box calculator? Almost certainly wrong. Here's what changes when you plan seriously.",
                  time: "11 min read",
                  isNew: true,
                },
                {
                  href: "/blog/real-estate-rich-retirement-illusion",
                  gradient: "from-[#0B1628] to-slate-800",
                  tag: "HNI Planning",
                  title: "The ₹40 Crore Illusion: Why India's Wealthiest Retirees Are the Most Exposed",
                  excerpt: "Most HNIs believe their net worth guarantees comfort. Here's the quiet arithmetic that says otherwise — and what to do about it.",
                  time: "9 min read",
                  isNew: false,
                },
                {
                  href: "/blog/why-indians-fail-retirement",
                  gradient: "from-[#0A1628] to-[#1e3a5f]",
                  tag: "Retirement Basics",
                  title: "Why Most Indians Fail to Plan for Retirement — And How One Small Habit Can Change Everything",
                  excerpt: "93% of Indians over 50 regret not planning sooner. Here's what goes wrong and the one habit that changes everything.",
                  time: "8 min read",
                  isNew: false,
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
                    <div className={`h-44 bg-gradient-to-br ${post.gradient} flex items-end justify-between p-5`}>
                      <span className="text-sm font-semibold bg-white/20 text-white px-3 py-1 rounded-full backdrop-blur-sm">{post.tag}</span>
                      {(post as any).isNew && (
                        <span className="text-xs font-bold bg-orange-500 text-white px-2.5 py-1 rounded-full uppercase tracking-wide">New</span>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-slate-900 mb-2 text-lg group-hover:text-[#F15A24] transition-colors">{post.title}</h3>
                      <p className="text-slate-500 text-sm mb-4">{post.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="h-3 w-3" />{post.time}</span>
                        <span className="text-sm font-semibold flex items-center gap-1" style={{ color: "var(--orange)" }}>Read article <ArrowRight className="h-3.5 w-3.5" /></span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Serious Planner Manifesto ────────────────────────────────── */}
        <section style={{ background: "#080C12", padding: "96px 24px", position: "relative" }}>
          <div className="section-inner">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>

              <div className="flex items-center gap-3 mb-8">
                <div style={{ width: 3, height: 32, background: "#E8940A", borderRadius: 2 }} />
                <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "#E8940A" }}>For the serious retirement enthusiast</span>
              </div>

              <div className="max-w-3xl mb-12">
                <h2 style={{ fontSize: "clamp(32px, 5vw, 60px)", fontWeight: 800, lineHeight: 1.1, color: "#F8F4EE", fontFamily: "var(--font-serif)", marginBottom: 24 }}>
                  76% of Indians will retire<br />
                  <span style={{ color: "#E8940A" }}>without a plan.</span>
                </h2>
                <p style={{ fontSize: "clamp(16px, 2vw, 20px)", color: "#94A3B8", lineHeight: 1.7, maxWidth: 600 }}>
                  Not because they didn't earn enough. Because they never sat down with the real numbers. RetirePro is built for the other 24% — and the people who want to join them.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
                {[
                  {
                    age: "34",
                    profile: "Has an SIP running. Never checked if it adds up.",
                    gap: "Knows the instrument. Doesn't know the number.",
                    urgency: "26 years to retirement. Still fixable — but compounding doesn't wait.",
                    accentColor: "#60A5FA",
                  },
                  {
                    age: "42",
                    profile: "EPF, NPS, mutual funds in three different places.",
                    gap: "Has the pieces. Has never seen the full picture.",
                    urgency: "18 years to retirement. Every year of drift costs multiples.",
                    accentColor: "#E8940A",
                  },
                  {
                    age: "48",
                    profile: "Realised retirement is 12 years away, not distant.",
                    gap: "Needs the honest number, not reassurance.",
                    urgency: "The gap is still closable — if you start now.",
                    accentColor: "#34D399",
                  },
                ].map((persona) => (
                  <div
                    key={persona.age}
                    className="rounded-2xl"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: `1px solid rgba(255,255,255,0.08)`,
                      borderTop: `3px solid ${persona.accentColor}`,
                      padding: "28px 24px",
                    }}
                  >
                    <div style={{ fontSize: 48, fontWeight: 900, color: persona.accentColor, lineHeight: 1, marginBottom: 12, fontFamily: "var(--font-serif)" }}>
                      {persona.age}
                    </div>
                    <p style={{ color: "#E2E8F0", fontWeight: 600, marginBottom: 8, fontSize: 15 }}>{persona.profile}</p>
                    <p style={{ color: "#64748B", fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>{persona.gap}</p>
                    <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "10px 14px" }}>
                      <p style={{ color: persona.accentColor, fontSize: 12, fontWeight: 600 }}>{persona.urgency}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-10" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <div>
                  <p style={{ color: "#94A3B8", fontSize: 14, marginBottom: 8 }}>Used by planners across India. Free. No login. Your data stays yours.</p>
                  <div className="flex flex-wrap gap-6">
                    {[
                      { stat: "No hidden assumptions", icon: "🎛️" },
                      { stat: "Year-by-year projections", icon: "📈" },
                      { stat: "India-specific (EPF, NPS, SIP)", icon: "🇮🇳" },
                    ].map(item => (
                      <div key={item.stat} className="flex items-center gap-2">
                        <span style={{ fontSize: 16 }}>{item.icon}</span>
                        <span style={{ color: "#CBD5E1", fontSize: 13, fontWeight: 500 }}>{item.stat}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Link href="/free-plan">
                  <button
                    className="rounded-full"
                    style={{
                      background: "#E8940A",
                      color: "#080C12",
                      fontWeight: 800,
                      fontSize: 15,
                      padding: "14px 32px",
                      border: "none",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#F5A623")}
                    onMouseLeave={e => (e.currentTarget.style.background = "#E8940A")}
                  >
                    Find My Real Retirement Number →
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Advisor / AMFI ──────────────────────────────────────────────── */}
        <AdvisorSection />

        {/* ── Final CTA ───────────────────────────────────────────────────── */}
        <section
          className="relative py-28 overflow-hidden px-6 text-center"
          style={{ background: "linear-gradient(160deg, #080E1A 0%, #0D1628 50%, #111827 100%)" }}
        >
          {/* Saffron glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div style={{ width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,148,10,0.12) 0%, transparent 65%)", animation: "heroGlow 5s ease-in-out infinite" }} />
          </div>

          {/* Orbiting dots */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
            <div className="cta-orbit-wrap" style={{ position: "relative", width: 240, height: 240 }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px dashed rgba(232,148,10,0.2)" }} />
              <div style={{ position: "absolute", inset: 40, borderRadius: "50%", border: "1px dashed rgba(241,90,36,0.15)" }} />
              <div style={{ position: "absolute", top: "50%", left: "50%", width: 10, height: 10, marginTop: -5, marginLeft: -5, animation: "orbitA 8s linear infinite" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--saffron-light)", boxShadow: "0 0 8px var(--saffron-light)" }} />
              </div>
              <div style={{ position: "absolute", top: "50%", left: "50%", width: 8, height: 8, marginTop: -4, marginLeft: -4, animation: "orbitB 6s linear infinite" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--orange)", boxShadow: "0 0 6px var(--orange)" }} />
              </div>
              <div style={{ position: "absolute", top: "50%", left: "50%", width: 7, height: 7, marginTop: -3.5, marginLeft: -3.5, animation: "orbitC 10s linear infinite" }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ADE80", boxShadow: "0 0 6px #4ADE80" }} />
              </div>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative max-w-3xl mx-auto">
            <h2 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 700, lineHeight: 1.15, color: "#FFFFFF", marginBottom: 20, fontFamily: "var(--font-serif)" }}>
              Your 65-year-old self<br />
              <em style={{ color: "var(--saffron)" }}>is counting on today's you.</em>
            </h2>
            <p style={{ fontSize: "19px", color: "rgba(255,255,255,0.55)", marginBottom: 36 }}>
              Build a complete retirement plan free — no login, no email, no commitment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                className="flex items-center justify-center gap-2 rounded-full font-bold text-base text-white"
                style={{ background: "var(--orange)", padding: "16px 40px", animation: "orangePulse 2.5s ease-in-out infinite" }}
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
                onClick={() => document.getElementById("planner")?.scrollIntoView({ behavior: "smooth" })}
                data-testid="button-start-planning"
              >
                <ArrowRight className="h-5 w-5" />
                Start My Free Plan
              </button>
              <button
                className="flex items-center justify-center gap-2 rounded-full font-semibold text-base"
                style={{ padding: "16px 40px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.85)", transition: "background 0.2s ease" }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.14)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)"; }}
                onClick={() => { window.location.href = "/api/login"; }}
              >
                Sign In to Save &amp; Track
              </button>
            </div>
          </motion.div>
        </section>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <footer className="py-10 px-6" style={{ background: "#040810", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="section-inner flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <img src={logoUrl} alt="RetirePro logo" className="w-6 h-6 object-contain" />
              </div>
              <span className="text-white font-bold">RetirePro</span>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
              <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
              <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link>
              <Link href="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link>
              <Link href="/terms-and-conditions" className="hover:text-white transition-colors">Terms &amp; Conditions</Link>
            </div>
            <p className="text-sm text-slate-600">© 2025 RetirePro. Free retirement planning for India.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
