import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { X, Mail, CheckCircle2, ArrowRight, BookOpen } from "lucide-react";

const STORAGE_KEY = "retirepro_blog_subscribed";
const POPUP_DELAY_MS = 150_000; // 2.5 minutes

export default function BlogSubscribePopup() {
  const [location] = useLocation();
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onBlogArticle = location.startsWith("/blog/");

  useEffect(() => {
    if (!onBlogArticle) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    if (localStorage.getItem(STORAGE_KEY)) return;

    timerRef.current = setTimeout(() => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setVisible(true);
      }
    }, POPUP_DELAY_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onBlogArticle, location]);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "dismissed");
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
        body: JSON.stringify({ email: email.trim(), source: "blog-popup" }),
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
      style={{ background: "rgba(10,8,4,0.72)" }}
      onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
    >
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: "linear-gradient(160deg, #1A1208 0%, #2D1F06 60%, #3D2508 100%)",
          border: "1.5px solid rgba(232,148,10,0.35)",
          animation: "slideUpFade 0.35s cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 rounded-full p-1 transition-colors"
          style={{ color: "rgba(232,148,10,0.7)" }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#E8940A"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(232,148,10,0.7)"; }}
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="px-8 pt-8 pb-7">
          {state === "success" ? (
            <div className="text-center py-4">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4" style={{ color: "#22C55E" }} />
              <h3
                className="text-xl font-bold mb-2"
                style={{ color: "#FBF8F2", fontFamily: "'Fraunces', serif" }}
              >
                You're in!
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#C4A96A" }}>
                We'll send you our next deep-dive on Indian retirement planning — no spam, ever.
              </p>
            </div>
          ) : (
            <>
              <div
                className="flex items-center justify-center w-11 h-11 rounded-xl mb-5"
                style={{ background: "rgba(232,148,10,0.18)" }}
              >
                <BookOpen className="h-5 w-5" style={{ color: "#E8940A" }} />
              </div>

              <h2
                className="text-xl font-bold mb-2 leading-snug"
                style={{ color: "#FBF8F2", fontFamily: "'Fraunces', serif" }}
              >
                Enjoying this article?
              </h2>
              <p className="text-sm leading-relaxed mb-6" style={{ color: "#B0956B" }}>
                Join <strong style={{ color: "#E8940A" }}>2,400+ readers</strong> who get our best India-specific
                retirement insights delivered to their inbox. One article a week. No spam.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                    style={{ color: "rgba(232,148,10,0.55)" }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="yourname@email.com"
                    required
                    className="w-full rounded-xl py-3 pl-10 pr-4 text-sm outline-none"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      border: "1.5px solid rgba(232,148,10,0.3)",
                      color: "#FBF8F2",
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = "#E8940A";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(232,148,10,0.15)";
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
                    background: state === "loading" ? "#C97F00" : "#E8940A",
                    color: "#1A1208",
                    cursor: state === "loading" ? "wait" : "pointer",
                  }}
                  onMouseEnter={e => { if (state !== "loading") (e.currentTarget as HTMLButtonElement).style.background = "#F5A623"; }}
                  onMouseLeave={e => { if (state !== "loading") (e.currentTarget as HTMLButtonElement).style.background = "#E8940A"; }}
                >
                  {state === "loading" ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-slate-900 border-t-transparent" />
                  ) : (
                    <>Get retirement insights <ArrowRight className="h-4 w-4" /></>
                  )}
                </button>
              </form>

              {state === "error" && (
                <p className="text-xs mt-2" style={{ color: "#F87171" }}>{errorMsg}</p>
              )}

              <p className="text-xs mt-3 text-center" style={{ color: "rgba(180,150,100,0.7)" }}>
                Free forever · No spam · Unsubscribe any time
              </p>

              <button
                onClick={dismiss}
                className="w-full text-center text-xs mt-3 underline underline-offset-2 transition-colors"
                style={{ color: "rgba(180,150,100,0.55)" }}
              >
                No thanks, I'll continue reading
              </button>
            </>
          )}
        </div>

        <style>{`
          @keyframes slideUpFade {
            from { opacity: 0; transform: translateY(24px) scale(0.97); }
            to   { opacity: 1; transform: translateY(0)   scale(1); }
          }
        `}</style>
      </div>
    </div>
  );
}
