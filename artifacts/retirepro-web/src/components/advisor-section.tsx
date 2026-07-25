import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Phone, AlertTriangle } from "lucide-react";

const advisorStyles = `
  @media (min-width: 1920px) {
    .advisor-section-inner { max-width: 1600px !important; }
  }
  @media (min-width: 2560px) {
    .advisor-section-inner { max-width: 1920px !important; }
  }
  @media (max-width: 359px) {
    .advisor-badge {
      font-size: 11px !important;
      padding: 5px 10px !important;
      gap: 4px !important;
    }
    .advisor-testimonial-card {
      padding: 10px 12px !important;
      gap: 8px !important;
    }
    .advisor-testimonial-text {
      font-size: 12px !important;
    }
    .advisor-testimonial-who {
      font-size: 10px !important;
    }
    .advisor-section-outer {
      padding-left: 14px !important;
      padding-right: 14px !important;
    }
  }
`;

interface AdvisorSectionProps {
  defaultName?: string;
}

export default function AdvisorSection({ defaultName = "" }: AdvisorSectionProps) {
  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [phoneError, setPhoneError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError("");
    if (!/^\d{10,}$/.test(phone.trim())) {
      setPhoneError("Enter a valid 10-digit mobile number");
      return;
    }
    setStatus("submitting");
    try {
      const body: Record<string, string> = {
        name: name.trim() || "Guest enquiry",
        phone: phone.trim(),
      };
      if (email.trim()) body.email = email.trim();
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("api_error");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
    <style>{advisorStyles}</style>
    <section
      id="advisor-section"
      className="advisor-section-outer px-5 sm:px-6 py-14 sm:py-20 lg:py-[88px]"
      style={{
        background: "linear-gradient(160deg, #FBF8F2 0%, #FEF3E2 60%, #FBF8F2 100%)",
        borderTop: "1px solid rgba(232,148,10,0.12)",
        borderBottom: "1px solid rgba(232,148,10,0.12)",
      }}
    >
      <div className="advisor-section-inner mx-auto" style={{ maxWidth: 1280, width: "100%" }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* ── Left: copy ─────────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }}>
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6"
              style={{ background: "rgba(232,148,10,0.12)", color: "#92660A", border: "1px solid rgba(232,148,10,0.25)" }}
            >
              <Users className="h-3.5 w-3.5" />
              Talk to an Advisor
            </div>

            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(26px, 3.5vw, 42px)", fontWeight: 700, color: "var(--ink)", lineHeight: 1.2, marginBottom: 18 }}>
              Get a free review from an<br />AMFI-registered advisor.
            </h2>

            <p style={{ fontSize: "16px", color: "var(--slate-mid)", lineHeight: 1.75, marginBottom: 28, maxWidth: 460 }}>
              Leave your details and an advisor from <strong style={{ color: "var(--ink)" }}>Nidesh Financial</strong> will call you back within one business day — no pushy sales, just personalised guidance on your SIPs, asset allocation, and funding gap.
            </p>

            <div className="flex flex-wrap gap-2.5 mb-10">
              {[
                { icon: "✅", label: "AMFI-Registered" },
                { icon: "🇮🇳", label: "India-focused" },
                { icon: "📞", label: "Callback within 1 day" },
                { icon: "🆓", label: "Zero cost, no obligation" },
              ].map(tag => (
                <span
                  key={tag.label}
                  className="advisor-badge flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full"
                  style={{ background: "rgba(26,18,8,0.05)", color: "#334155", border: "1px solid rgba(0,0,0,0.08)" }}
                >
                  {tag.icon} {tag.label}
                </span>
              ))}
            </div>

            {/* Testimonials */}
            <div className="flex flex-col gap-3">
              {[
                { stars: 5, text: "Helped me realise I was saving ₹20k/mo less than I needed. Changed my SIP overnight.", who: "Ankit R., Pune" },
                { stars: 5, text: "Finally understood what my corpus gap meant and how to close it. Super helpful!", who: "Meera S., Bengaluru" },
              ].map((r, i) => (
                <div
                  key={i}
                  className="advisor-testimonial-card rounded-2xl px-4 py-3.5 flex gap-3"
                  style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(232,148,10,0.18)", backdropFilter: "blur(8px)" }}
                >
                  <div style={{ color: "var(--saffron)", fontSize: 13, flexShrink: 0 }}>{"★".repeat(r.stars)}</div>
                  <div>
                    <p className="advisor-testimonial-text" style={{ fontSize: 13, color: "#334155", lineHeight: 1.55, marginBottom: 3 }}>{r.text}</p>
                    <p className="advisor-testimonial-who" style={{ fontSize: 11, color: "#94A3B8" }}>— {r.who}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Right: form card ────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, delay: 0.1 }}>
            <div
              className="p-4 sm:p-8 lg:p-9 rounded-2xl sm:rounded-3xl"
              style={{
                background: "#FFFFFF",
                border: "1px solid rgba(232,148,10,0.22)",
                boxShadow: "0 8px 40px rgba(232,148,10,0.08), 0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              <AnimatePresence mode="wait">
                {status === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="text-center py-6"
                  >
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                      style={{ background: "rgba(22,163,74,0.1)", border: "2px solid rgba(22,163,74,0.25)" }}
                    >
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="16" fill="rgba(22,163,74,0.12)" />
                        <path d="M9 16.5l5 5 9-10" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "22px", fontWeight: 700, color: "var(--ink)", marginBottom: 10 }}>
                      You're on the list!
                    </h3>
                    <p style={{ fontSize: "15px", color: "var(--slate-mid)", lineHeight: 1.65, marginBottom: 24, maxWidth: 320, margin: "0 auto 24px" }}>
                      An advisor from Nidesh Financial will call you back within one business day. Check your WhatsApp too!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <a
                        href={`https://wa.me/919819590598?text=${encodeURIComponent(`Hi! I just requested a free retirement plan review on RetirePro. Looking forward to speaking with you!`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-sm font-semibold text-white w-full sm:w-auto"
                        style={{ background: "#25D366" }}
                      >
                        💬 Message on WhatsApp
                      </a>
                      <button
                        onClick={() => setStatus("idle")}
                        className="rounded-xl py-2.5 px-4 text-sm font-medium w-full sm:w-auto"
                        style={{ border: "1.5px solid rgba(0,0,0,0.12)", color: "var(--slate-mid)", background: "transparent" }}
                      >
                        Submit another
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    noValidate
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "21px", fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>
                      Request a free callback
                    </h3>
                    <p style={{ fontSize: "13px", color: "#94A3B8", marginBottom: 22 }}>
                      An advisor calls you back — no spam, no obligation.
                    </p>

                    <div className="flex flex-col gap-3 mb-5">
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: "#64748B", letterSpacing: "0.03em" }}>
                          Your name
                        </label>
                        <input
                          className="w-full rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-sm outline-none transition-colors"
                          style={{ border: "1.5px solid rgba(0,0,0,0.11)", background: "var(--ivory)", color: "var(--ink)", fontFamily: "var(--font-sans)" }}
                          onFocus={e => { (e.currentTarget as HTMLInputElement).style.borderColor = "var(--saffron)"; }}
                          onBlur={e => { (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(0,0,0,0.11)"; }}
                          placeholder="e.g. Ramesh Sharma"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          data-testid="input-advisor-name"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: "#64748B", letterSpacing: "0.03em" }}>
                          Mobile / WhatsApp <span style={{ color: "#E53E3E" }}>*</span>
                        </label>
                        <input
                          className="w-full rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-sm outline-none transition-colors"
                          style={{
                            border: `1.5px solid ${phoneError ? "#E53E3E" : "rgba(0,0,0,0.11)"}`,
                            background: "var(--ivory)",
                            color: "var(--ink)",
                            fontFamily: "var(--font-sans)",
                          }}
                          onFocus={e => { if (!phoneError) (e.currentTarget as HTMLInputElement).style.borderColor = "var(--saffron)"; }}
                          onBlur={e => { if (!phoneError) (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(0,0,0,0.11)"; }}
                          placeholder="9876543210"
                          value={phone}
                          onChange={e => { setPhone(e.target.value); setPhoneError(""); }}
                          data-testid="input-advisor-phone"
                          type="tel"
                          required
                        />
                        {phoneError && (
                          <p className="mt-1 text-xs" style={{ color: "#E53E3E" }}>{phoneError}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: "#64748B", letterSpacing: "0.03em" }}>
                          Email <span style={{ color: "#94A3B8", fontWeight: 400 }}>(optional)</span>
                        </label>
                        <input
                          className="w-full rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-sm outline-none transition-colors"
                          style={{ border: "1.5px solid rgba(0,0,0,0.11)", background: "var(--ivory)", color: "var(--ink)", fontFamily: "var(--font-sans)" }}
                          onFocus={e => { (e.currentTarget as HTMLInputElement).style.borderColor = "var(--saffron)"; }}
                          onBlur={e => { (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(0,0,0,0.11)"; }}
                          placeholder="ramesh@email.com"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          data-testid="input-advisor-email"
                          type="email"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={status === "submitting"}
                      className="w-full rounded-xl py-3.5 font-bold text-sm text-white flex items-center justify-center gap-2"
                      style={{
                        background: status === "submitting" ? "rgba(241,90,36,0.6)" : "var(--orange)",
                        transition: "opacity 0.2s, transform 0.15s",
                        cursor: status === "submitting" ? "not-allowed" : "pointer",
                      }}
                      onMouseEnter={e => { if (status !== "submitting") (e.currentTarget as HTMLButtonElement).style.opacity = "0.88"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
                      data-testid="button-advisor-submit"
                    >
                      {status === "submitting" ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Sending…
                        </>
                      ) : (
                        <>
                          <Phone className="h-4 w-4" />
                          Request a Free Callback
                        </>
                      )}
                    </button>

                    {status === "error" && (
                      <p className="text-center text-xs mt-3 flex items-center justify-center gap-1.5" style={{ color: "#B91C1C" }}>
                        <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                        Something went wrong — please try WhatsApp directly.
                      </p>
                    )}

                    <p className="text-center text-xs mt-4" style={{ color: "#94A3B8", lineHeight: 1.6 }}>
                      By submitting you agree to be contacted by Nidesh Financial.<br />
                      Mutual fund investments are subject to market risk.
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* WhatsApp nudge below card */}
            <p className="mt-5 text-center text-sm" style={{ color: "var(--slate-mid)" }}>
              Prefer instant messaging?{" "}
              <a
                href={`https://wa.me/919819590598?text=${encodeURIComponent("Hi! I'd like a free review of my retirement plan.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold"
                style={{ color: "#16A34A", textDecoration: "underline", textUnderlineOffset: "3px" }}
              >
                Chat on WhatsApp →
              </a>
            </p>
          </motion.div>

        </div>
      </div>
    </section>
    </>
  );
}
