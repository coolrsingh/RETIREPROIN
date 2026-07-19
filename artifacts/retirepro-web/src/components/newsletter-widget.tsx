import { useState } from "react";
import { Mail, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

interface Props {
  source?: string;
}

export default function NewsletterWidget({ source = "blog" }: Props) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setState("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.message || "Something went wrong. Please try again.");
        setState("error");
      } else {
        setState("success");
      }
    } catch {
      setErrorMsg("Network error. Please check your connection.");
      setState("error");
    }
  };

  return (
    <div
      className="rounded-2xl p-8 my-10"
      style={{
        background: "linear-gradient(135deg, #FBF8F2 0%, #FEF3E2 100%)",
        border: "1.5px solid rgba(232,148,10,0.25)",
        boxShadow: "0 4px 24px rgba(232,148,10,0.08)",
      }}
    >
      {state === "success" ? (
        <div className="text-center py-4">
          <CheckCircle2 className="h-10 w-10 mx-auto mb-3" style={{ color: "#16A34A" }} />
          <h3 className="text-lg font-bold mb-1" style={{ color: "#1A1208", fontFamily: "'Fraunces', serif" }}>
            You're on the list!
          </h3>
          <p className="text-sm" style={{ color: "#475569" }}>
            We'll send you our next deep-dive on Indian retirement planning. No spam, ever.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-3 mb-5">
            <div
              className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "rgba(232,148,10,0.15)" }}
            >
              <Sparkles className="h-4 w-4" style={{ color: "#E8940A" }} />
            </div>
            <div>
              <h3
                className="text-lg font-bold mb-1"
                style={{ color: "#1A1208", fontFamily: "'Fraunces', serif" }}
              >
                Get our next retirement insight
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#475569" }}>
                We're covering <strong>tax-efficient SWP strategies</strong> in our next article. Join 2,400+ readers
                getting India-specific retirement planning guidance — no spam, unsubscribe anytime.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                style={{ color: "#94A3B8" }}
              />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="yourname@email.com"
                required
                className="w-full rounded-xl py-3 pl-10 pr-4 text-sm outline-none"
                style={{
                  border: "1.5px solid rgba(232,148,10,0.3)",
                  background: "#FFFFFF",
                  color: "#1A1208",
                }}
                onFocus={e => { e.currentTarget.style.borderColor = "#E8940A"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(232,148,10,0.12)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "rgba(232,148,10,0.3)"; e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>
            <button
              type="submit"
              disabled={state === "loading"}
              className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all"
              style={{
                background: state === "loading" ? "#C97F00" : "#E8940A",
                minWidth: "160px",
                cursor: state === "loading" ? "wait" : "pointer",
              }}
              onMouseEnter={e => { if (state !== "loading") (e.currentTarget as HTMLButtonElement).style.background = "#D4830A"; }}
              onMouseLeave={e => { if (state !== "loading") (e.currentTarget as HTMLButtonElement).style.background = "#E8940A"; }}
            >
              {state === "loading" ? (
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <>Subscribe <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          {state === "error" && (
            <p className="text-sm mt-2" style={{ color: "#DC2626" }}>{errorMsg}</p>
          )}

          <p className="text-xs mt-3" style={{ color: "#94A3B8" }}>
            Free forever · No spam · Unsubscribe any time
          </p>
        </>
      )}
    </div>
  );
}
