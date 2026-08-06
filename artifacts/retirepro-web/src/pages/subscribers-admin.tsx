import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { ResponseValidationError } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Mail, ArrowLeft, Download, Users, Sparkles, BookOpen,
  ChevronLeft, ChevronRight, Search, X,
} from "lucide-react";
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

const PAGE_SIZE = 50;

export default function SubscribersAdmin() {
  const { user, isAuthenticated, isLoading } = useAuth();

  const { data: subscribers = [], isLoading: subsLoading, error: subsError } = useQuery<Subscriber[]>({
    queryKey: ["/api/subscribers"],
    enabled: isAuthenticated,
  });

  // Filter + pagination state
  const [emailSearch, setEmailSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setTimeout(() => { window.location.href = "/api/login"; }, 500);
    }
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    if (subsError instanceof ResponseValidationError) {
      console.error("[ResponseValidationError]", {
        url: subsError.url,
        method: subsError.method,
        message: subsError.message,
      });
      toast({
        title: "Update available",
        description: "We deployed an update — please refresh the page.",
        variant: "destructive",
      });
    }
  }, [subsError, toast]);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!isLoading && isAuthenticated && !isAdmin) {
      window.location.href = "/";
    }
  }, [isAuthenticated, isLoading, isAdmin]);

  // CSV exports ALL subscribers regardless of filter
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

  // Group by source for summary cards (always over all subscribers)
  const sourceStats = subscribers.reduce<Record<string, number>>((acc, s) => {
    const key = s.source || "blog";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  // Filtered list
  const filtered = useMemo(() => {
    let list = subscribers;
    if (emailSearch.trim()) {
      const q = emailSearch.trim().toLowerCase();
      list = list.filter((s) => s.email.toLowerCase().includes(q));
    }
    if (sourceFilter !== "all") {
      list = list.filter((s) => (s.source || "blog") === sourceFilter);
    }
    return list;
  }, [subscribers, emailSearch, sourceFilter]);

  // Reset to page 1 whenever filter changes
  useEffect(() => { setPage(1); }, [emailSearch, sourceFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageSlice = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const hasFilters = emailSearch.trim() !== "" || sourceFilter !== "all";

  const clearFilters = () => {
    setEmailSearch("");
    setSourceFilter("all");
  };

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
            const isActive = sourceFilter === key;
            return (
              <button
                key={key}
                onClick={() => setSourceFilter(isActive ? "all" : key)}
                className="rounded-xl p-4 text-left transition-all"
                style={{
                  background: isActive ? "rgba(232,148,10,0.10)" : "#FFFFFF",
                  border: isActive ? "1px solid rgba(232,148,10,0.40)" : "1px solid rgba(26,18,8,0.08)",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="h-3.5 w-3.5 flex-shrink-0" style={{ color: isActive ? "var(--saffron)" : "var(--slate-mid)" }} />
                  <span className="text-xs truncate" style={{ color: isActive ? "var(--saffron)" : "var(--slate-mid)" }}>{label}</span>
                </div>
                <div className="text-xl font-bold" style={{ color: "var(--ink)" }}>{count}</div>
              </button>
            );
          })}
        </div>

        {/* Subscribers Table */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "#FFFFFF", border: "1px solid rgba(26,18,8,0.08)", boxShadow: "0 2px 12px rgba(26,18,8,0.04)" }}
        >
          {/* Table header + search bar */}
          <div
            className="px-6 py-4 border-b flex flex-col sm:flex-row sm:items-center gap-3"
            style={{ borderColor: "rgba(26,18,8,0.08)" }}
          >
            <h2 className="font-semibold flex-1" style={{ color: "var(--ink)", fontFamily: "var(--font-serif)" }}>
              All Subscribers
              {hasFilters && (
                <span className="ml-2 text-sm font-normal" style={{ color: "var(--slate-mid)" }}>
                  — {filtered.length} of {subscribers.length} shown
                </span>
              )}
            </h2>

            {/* Search + source filter */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Email search */}
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none"
                  style={{ color: "var(--slate-mid)" }}
                />
                <Input
                  value={emailSearch}
                  onChange={(e) => setEmailSearch(e.target.value)}
                  placeholder="Search email…"
                  className="pl-8 h-8 text-sm w-48"
                  style={{ borderColor: "rgba(26,18,8,0.15)" }}
                />
                {emailSearch && (
                  <button
                    onClick={() => setEmailSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    <X className="h-3.5 w-3.5" style={{ color: "var(--slate-mid)" }} />
                  </button>
                )}
              </div>

              {/* Source dropdown */}
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="h-8 rounded-md border text-sm px-2"
                style={{
                  borderColor: "rgba(26,18,8,0.15)",
                  color: "var(--ink)",
                  background: "#fff",
                  outline: "none",
                }}
              >
                <option value="all">All sources</option>
                {Object.entries(SOURCE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>

              {/* Clear filters */}
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="h-8 px-3 rounded-md text-sm font-medium transition-colors hover:bg-amber-50"
                  style={{ color: "var(--saffron)", border: "1px solid rgba(232,148,10,0.35)" }}
                >
                  Clear
                </button>
              )}
            </div>
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
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "rgba(232,148,10,0.10)" }}>
                <Search className="h-5 w-5" style={{ color: "var(--saffron)" }} />
              </div>
              <p className="font-medium mb-1" style={{ color: "var(--ink)" }}>No matches</p>
              <p className="text-sm mb-3" style={{ color: "var(--slate-mid)" }}>
                Try a different email or source filter.
              </p>
              <button
                onClick={clearFilters}
                className="text-sm font-medium underline"
                style={{ color: "var(--saffron)" }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
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
                    {pageSlice.map((sub, i) => (
                      <tr
                        key={sub.id}
                        className="transition-colors"
                        style={{ borderBottom: "1px solid rgba(26,18,8,0.05)" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(232,148,10,0.04)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <td className="px-6 py-4" style={{ color: "var(--slate-mid)" }}>
                          {(safePage - 1) * PAGE_SIZE + i + 1}
                        </td>
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

              {/* Pagination footer */}
              {totalPages > 1 && (
                <div
                  className="px-6 py-3 flex items-center justify-between border-t"
                  style={{ borderColor: "rgba(26,18,8,0.07)" }}
                >
                  <span className="text-sm" style={{ color: "var(--slate-mid)" }}>
                    Page {safePage} of {totalPages} &nbsp;·&nbsp; {filtered.length} subscriber{filtered.length !== 1 ? "s" : ""}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={safePage === 1}
                      className="h-8 w-8 rounded-md flex items-center justify-center transition-colors disabled:opacity-40"
                      style={{ border: "1px solid rgba(26,18,8,0.12)" }}
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-4 w-4" style={{ color: "var(--ink)" }} />
                    </button>

                    {/* Page number buttons — show at most 5 around current */}
                    {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 2)
                      .reduce<(number | "…")[]>((acc, p, i, arr) => {
                        if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…");
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, idx) =>
                        p === "…" ? (
                          <span key={`ellipsis-${idx}`} className="px-1 text-sm" style={{ color: "var(--slate-mid)" }}>…</span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => setPage(p as number)}
                            className="h-8 w-8 rounded-md text-sm font-medium transition-colors"
                            style={{
                              background: safePage === p ? "var(--saffron)" : "transparent",
                              color: safePage === p ? "#fff" : "var(--ink)",
                              border: safePage === p ? "none" : "1px solid rgba(26,18,8,0.12)",
                            }}
                            aria-current={safePage === p ? "page" : undefined}
                          >
                            {p}
                          </button>
                        )
                      )}

                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={safePage === totalPages}
                      className="h-8 w-8 rounded-md flex items-center justify-center transition-colors disabled:opacity-40"
                      style={{ border: "1px solid rgba(26,18,8,0.12)" }}
                      aria-label="Next page"
                    >
                      <ChevronRight className="h-4 w-4" style={{ color: "var(--ink)" }} />
                    </button>
                  </div>
                </div>
              )}
            </>
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
