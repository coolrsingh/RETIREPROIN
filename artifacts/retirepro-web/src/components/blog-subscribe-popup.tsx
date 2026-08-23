import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { X, Mail, CheckCircle2, ArrowRight, TrendingDown } from "lucide-react";

const STORAGE_KEY = "retirepro_newsletter_subscribed";
const LEGACY_STORAGE_KEY = "retirepro_blog_subscribed";
const SESSION_PROMPT_KEY = "retirepro_exit_newsletter_prompted";
const POPUP_DELAY_MS = 150_000; // 2.5 minutes

const HOOKS = [
  { stat: "76%", line: "of working Indians have never done a single retirement calculation.", cta: "Don't be that person." },
  { stat: "93%", line: "of Indians over 50 say they wish they had started planning sooner.", cta: "Start now — it costs nothing." },
  { stat: "₹2.4 Cr", line: "is the average gap between what Indians save and what they'll actually need.", cta: "Knowing yours is step one." },
];
const HOOK = HOOKS[Math.floor(Math.random() * HOOKS.length)];

export default function BlogSubscribePopup() {
  const [location] = useLocation();
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onBlogArticle = location.startsWith("/blog/");

  const hasSubscribed = () =>
    localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);

  const hasSeenPromptThisSession = () =>
    sessionStorage.getItem(SESSION_PROMPT_KEY);

  const openExitPrompt = () => {
    if (visible || hasSubscribed() || hasSeenPromptThisSession()) return;
    sessionStorage.setItem(SESSION_PROMPT_KEY, "shown");
    setVisible(true);
  };

  useEffect(() => {
    if (!onBlogArticle) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    if (hasSubscribed() || hasSeenPromptThisSession()) return;

    timerRef.current = setTimeout(() => {
      openExitPrompt();
    }, POPUP_DELAY_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onBlogArticle, location]);

  useEffect(() => {
    const handleMouseOut = (event: MouseEvent) => {
      // Exit-intent should only fire when the pointer leaves the browser window
      // through the top edge—not when the user simply moves between elements.
      if (event.relatedTarget === null && event.clientY <= 0) {
        openExitPrompt();
      }
    };

    document.addEventListener("mouseout", handleMouseOut);
    return () => document.removeEventListener("mouseout", handleMouseOut);
  }, [visible, location]);

  const dismiss = () => {
    setVisible(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setState("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: onBlogArticle ? "blog-exit-intent" : "site-exit-intent" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.message || "Something went wrong. Please try again.");
        setState("error");
      } else {
        setState("success");
        localStorage.setItem(STORAGE_KEY, "subscribed");
        setTimeout(() => setVisible(false), 3200);
      }
    } catch {
      setErrorMsg("Network error. Please check your connection.");
      setState("error");
    }
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(10,8,4,0.78)" }}
      onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
    >
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: "linear-gradient(160deg, #0F0A04 0%, #1A1208 50%, #2D1F06 100%)",
          border: "1.5px solid rgba(232,148,10,0.4)",
          animation: "slideUpFade 0.35s cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 rounded-full p-1.5 transition-colors"
          style={{ color: "rgba(232,148,10,0.6)" }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#E8940A"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(232,148,10,0.6)"; }}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Stat banner */}
        <div className="px-8 pt-8 pb-0">
          <div
            className="flex items-start gap-3 rounded-xl p-4 mb-5"
            style={{ background: "rgba(232,148,10,0.1)", border: "1px solid rgba(232,148,10,0.2)" }}
          >
            <TrendingDown className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "#E8940A" }} />
            <div>
              <span className="text-2xl font-black" style={{ color: "#E8940A" }}>{HOOK.stat}</span>
              <span className="text-sm leading-relaxed ml-2" style={{ color: "#C4A96A" }}>{HOOK.line}</span>
              <p className="text-xs font-semibold mt-1" style={{ color: "#FBF8F2" }}>{HOOK.cta}</p>
            </div>
          </div>
        </div>

        <div className="px-8 pb-7">
          {state === "success" ? (
            <div className="text-center py-4">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4" style={{ color: "#22C55E" }} />
              <h3 className="text-xl font-bold mb-2" style={{ color: "#FBF8F2", fontFamily: "'Fraunces', serif" }}>
                You're in!
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#C4A96A" }}>
                One or two useful retirement notes a month. No spam, ever.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold mb-1.5 leading-snug" style={{ color: "#FBF8F2", fontFamily: "'Fraunces', serif" }}>
                Before you go—keep your retirement plan on track
              </h2>
              <p className="text-sm leading-relaxed mb-5" style={{ color: "#B0956B" }}>
                Share your email and get one or two useful retirement insights a month. Small check-ins help you revisit your calculation before the years slip by.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                    style={{ color: "rgba(232,148,10,0.5)" }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="yourname@email.com"
                    required
                    className="w-full rounded-xl py-3 pl-10 pr-4 text-sm outline-none"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1.5px solid rgba(232,148,10,0.3)",
                      color: "#FBF8F2",
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = "#E8940A";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(232,148,10,0.12)";
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = "rgba(232,148,10,0.3)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={state === "loading"}
                  className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all"
                  style={{
                    background: state === "loading" ? "#B87A00" : "#E8940A",
                    color: "#1A1208",
                    cursor: state === "loading" ? "wait" : "pointer",
                  }}
                  onMouseEnter={e => { if (state !== "loading") (e.currentTarget as HTMLButtonElement).style.background = "#F5A623"; }}
                  onMouseLeave={e => { if (state !== "loading") (e.currentTarget as HTMLButtonElement).style.background = "#E8940A"; }}
                >
                  {state === "loading" ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-slate-900 border-t-transparent" />
                  ) : (
                    <>Keep me updated <ArrowRight className="h-4 w-4" /></>
                  )}
                </button>
              </form>

              {state === "error" && (
                <p className="text-xs mt-2" style={{ color: "#F87171" }}>{errorMsg}</p>
              )}

              <p className="text-xs mt-3 text-center" style={{ color: "rgba(180,150,100,0.6)" }}>
                Free forever · No spam · Unsubscribe any time
              </p>

              <button
                onClick={dismiss}
                className="w-full text-center text-xs mt-2 underline underline-offset-2 transition-colors"
                style={{ color: "rgba(180,150,100,0.45)" }}
              >
                No thanks, I'll continue without updates
              </button>
            </>
          )}
        </div>

        <style>{`
          @keyframes slideUpFade {
            from { opacity: 0; transform: translateY(28px) scale(0.96); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
      </div>
    </div>
  );
}
