import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, ArrowLeft, Download, Users, Sparkles, BookOpen } from "lucide-react";
import BrandLogo from "@/components/brand-logo";
import { Link } from "wouter";

interface Subscriber {
  id: string;
  email: string;
  source: string | null;
  createdAt: string;
}

const SOURCE_LABELS: Record<string, string> = {
  "blog-why-indians-fail": "Why Indians Fail",
  "blog-nps-ppf-sip": "NPS vs PPF vs SIP",
  "blog-real-estate": "Real Estate Illusion",
  "blog-how-much-retire": "How Much to Retire",
  "blog": "Blog (general)",
};

const SOURCE_COLORS: Record<string, string> = {
  "blog-why-indians-fail": "bg-amber-100 text-amber-700",
  "blog-nps-ppf-sip": "bg-green-100 text-green-700",
  "blog-real-estate": "bg-orange-100 text-orange-700",
  "blog-how-much-retire": "bg-rose-100 text-rose-700",
  "blog": "bg-amber-50 text-amber-600",
};

export default function SubscribersAdmin() {
  const { user, isAuthenticated, isLoading } = useAuth();

  const { data: subscribers = [], isLoading: subsLoading } = useQuery<Subscriber[]>({
    queryKey: ["/api/subscribers"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setTimeout(() => { window.location.href = "/api/login"; }, 500);
    }
  }, [isAuthenticated, isLoading]);

  const isAdmin = (user as any)?.role === "admin";

  useEffect(() => {
    if (!isLoading && isAuthenticated && !isAdmin) {
      window.location.href = "/";
    }
  }, [isAuthenticated, isLoading, isAdmin]);

  const downloadCSV = () => {
    if (!subscribers || subscribers.length === 0) return;
    const headers = ["Email", "Blog Source", "Subscribed On"];
    const rows = subscribers.map((s) => [
      s.email,
      SOURCE_LABELS[s.source || "blog"] || s.source || "blog",
      new Date(s.createdAt).toLocaleDateString("en-IN", {
        year: "numeric", month: "short", day: "numeric",
      }),
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${v}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `retirepro_subscribers_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Group by source for the summary cards
  const sourceStats = subscribers.reduce<Record<string, number>>((acc, s) => {
    const key = s.source || "blog";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  if (isLoading || subsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--ivory)" }}>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: "var(--saffron)" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--ivory)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50"
        style={{
          background: "rgba(251,248,242,0.92)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(232,148,10,0.18)",
          boxShadow: "0 1px 8px rgba(26,18,8,0.06)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <BrandLogo textClassName="text-stone-800" />
              <span className="text-sm font-medium hidden md:block" style={{ color: "var(--slate-mid)" }}>
                Newsletter Subscribers
              </span>
            </div>
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-amber-50"
                style={{ borderColor: "rgba(232,148,10,0.35)", color: "var(--saffron)" }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Title row */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-2xl font-bold mb-1"
              style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}
            >
              Blog Subscribers
            </h1>
            <p style={{ color: "var(--slate-mid)", fontSize: "14px" }}>
              Email IDs collected from the newsletter widget on your blog pages
            </p>
          </div>
          <Button
            onClick={downloadCSV}
            disabled={subscribers.length === 0}
            className="flex items-center gap-2 text-white font-semibold"
            style={{ background: "var(--saffron)", border: "none" }}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {/* Total */}
          <div
            className="rounded-xl p-4 col-span-2 sm:col-span-1"
            style={{
              background: "linear-gradient(135deg, rgba(232,148,10,0.12) 0%, rgba(251,159,11,0.06) 100%)",
              border: "1px solid rgba(232,148,10,0.25)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(232,148,10,0.15)" }}>
                <Users className="h-4 w-4" style={{ color: "var(--saffron)" }} />
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: "var(--ink)" }}>{subscribers.length}</div>
                <div className="text-xs" style={{ color: "var(--slate-mid)" }}>Total Subscribers</div>
              </div>
            </div>
          </div>

          {/* Per-source cards */}
          {Object.entries(SOURCE_LABELS).map(([key, label]) => {
            const count = sourceStats[key] || 0;
            return (
              <div
                key={key}
                className="rounded-xl p-4"
                style={{ background: "#FFFFFF", border: "1px solid rgba(26,18,8,0.08)" }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "var(--slate-mid)" }} />
                  <span className="text-xs truncate" style={{ color: "var(--slate-mid)" }}>{label}</span>
                </div>
                <div className="text-xl font-bold" style={{ color: "var(--ink)" }}>{count}</div>
              </div>
            );
          })}
        </div>

        {/* Subscribers Table */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "#FFFFFF", border: "1px solid rgba(26,18,8,0.08)", boxShadow: "0 2px 12px rgba(26,18,8,0.04)" }}
        >
          <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(26,18,8,0.08)" }}>
            <h2 className="font-semibold" style={{ color: "var(--ink)", fontFamily: "var(--font-serif)" }}>
              All Subscribers
            </h2>
          </div>

          {subscribers.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(232,148,10,0.10)" }}>
                <Mail className="h-6 w-6" style={{ color: "var(--saffron)" }} />
              </div>
              <p className="font-medium mb-1" style={{ color: "var(--ink)" }}>No subscribers yet</p>
              <p className="text-sm" style={{ color: "var(--slate-mid)" }}>
                The newsletter widget on your blog pages will collect emails here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(26,18,8,0.07)" }}>
                    <th className="px-6 py-3 text-left font-medium" style={{ color: "var(--slate-mid)" }}>#</th>
                    <th className="px-6 py-3 text-left font-medium" style={{ color: "var(--slate-mid)" }}>Email Address</th>
                    <th className="px-6 py-3 text-left font-medium" style={{ color: "var(--slate-mid)" }}>Blog Source</th>
                    <th className="px-6 py-3 text-left font-medium" style={{ color: "var(--slate-mid)" }}>Subscribed On</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((sub, i) => (
                    <tr
                      key={sub.id}
                      className="transition-colors"
                      style={{ borderBottom: "1px solid rgba(26,18,8,0.05)" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(232,148,10,0.04)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <td className="px-6 py-4" style={{ color: "var(--slate-mid)" }}>{i + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "var(--saffron)" }} />
                          <a
                            href={`mailto:${sub.email}`}
                            className="font-medium hover:underline"
                            style={{ color: "var(--ink)" }}
                          >
                            {sub.email}
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${SOURCE_COLORS[sub.source || "blog"] || "bg-amber-50 text-amber-600"}`}
                        >
                          {SOURCE_LABELS[sub.source || "blog"] || sub.source || "blog"}
                        </span>
                      </td>
                      <td className="px-6 py-4" style={{ color: "var(--slate-mid)" }}>
                        {new Date(sub.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric", month: "short", day: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Send campaign hint */}
        {subscribers.length > 0 && (
          <div
            className="mt-6 rounded-xl px-5 py-4 flex items-start gap-3"
            style={{ background: "rgba(232,148,10,0.07)", border: "1px solid rgba(232,148,10,0.18)" }}
          >
            <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "var(--saffron)" }} />
            <p className="text-sm" style={{ color: "var(--slate-mid)" }}>
              <strong style={{ color: "var(--ink)" }}>Ready to send a campaign?</strong>{" "}
              Export the CSV and import it into your email tool (Mailchimp, SendGrid, Brevo, etc.) to send your next newsletter.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
