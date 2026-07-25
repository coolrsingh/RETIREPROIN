import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Users, Mail, Phone, Globe, ArrowUpDown, ArrowUp, ArrowDown, Filter, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import BrandLogo from "@/components/brand-logo";
import { Link } from "wouter";
import { isUnauthorizedError } from "@/lib/authUtils";
import { isReEngaged, passesFilter } from "@/lib/leadFilters";
import type { FilterKey } from "@/lib/leadFilters";

type SortKey = "name" | "createdAt" | "updatedAt";
type SortDir = "asc" | "desc";

function SortIcon({ col, sortBy, sortDir }: { col: SortKey; sortBy: SortKey; sortDir: SortDir }) {
  if (sortBy !== col) return <ArrowUpDown className="inline ml-1 h-3.5 w-3.5 text-slate-400" />;
  return sortDir === "asc"
    ? <ArrowUp className="inline ml-1 h-3.5 w-3.5" style={{ color: "var(--saffron)" }} />
    : <ArrowDown className="inline ml-1 h-3.5 w-3.5" style={{ color: "var(--saffron)" }} />;
}

export default function LeadsAdmin() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [sortBy, setSortBy] = useState<SortKey>("updatedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: leads = [], isLoading: leadsLoading } = useQuery<any[]>({
    queryKey: ["/api/leads"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setTimeout(() => { window.location.href = "/api/login"; }, 500);
    }
  }, [isAuthenticated, isLoading]);

  const handleSort = (col: SortKey) => {
    if (sortBy === col) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortBy(col);
      setSortDir("desc");
    }
  };

  const searchTerm = searchQuery.trim().toLowerCase();

  const filteredLeads = leads.filter((lead) => {
    // Filter button logic
    if (!passesFilter(lead, activeFilter)) return false;
    // Search logic (AND with filter)
    if (searchTerm) {
      const name = (lead.name || "").toLowerCase();
      const email = (lead.email || "").toLowerCase();
      const phone = (lead.phone || "").toLowerCase();
      if (!name.includes(searchTerm) && !email.includes(searchTerm) && !phone.includes(searchTerm)) return false;
    }
    return true;
  });

  const sortedLeads = [...filteredLeads].sort((a, b) => {
    let aVal: string | number = "";
    let bVal: string | number = "";
    if (sortBy === "name") {
      aVal = (a.name || "").toLowerCase();
      bVal = (b.name || "").toLowerCase();
    } else if (sortBy === "createdAt") {
      aVal = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      bVal = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    } else {
      aVal = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      bVal = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    }
    if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const reEngagedCount = leads.filter(isReEngaged).length;

  const downloadCSV = () => {
    if (!sortedLeads || sortedLeads.length === 0) return;
    const headers = ["Name", "Email", "Phone", "Source", "Medium", "Campaign", "First contact", "Last contact", "Re-engaged"];
    const rows = sortedLeads.map((l: any) => [
      l.name,
      l.email,
      l.phone,
      l.utm?.utm_source || "direct",
      l.utm?.utm_medium || "",
      l.utm?.utm_campaign || "",
      l.createdAt ? new Date(l.createdAt).toLocaleDateString("en-IN") : "",
      l.updatedAt ? new Date(l.updatedAt).toLocaleDateString("en-IN") : "",
      isReEngaged(l) ? "Yes" : "No",
    ]);
    const csv = [headers, ...rows].map(r => r.map((v: string) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `retirePro_leads_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sourceStats = leads.reduce((acc: Record<string, number>, lead: any) => {
    const src = lead.utm?.utm_source || "direct";
    acc[src] = (acc[src] || 0) + 1;
    return acc;
  }, {});

  if (isLoading || leadsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--ivory)" }}>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: "var(--saffron)" }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--ivory)" }}>
      <header
        className="backdrop-blur-xl shadow-sm sticky top-0 z-50"
        style={{ background: "rgba(251,248,242,0.90)", borderBottom: "1px solid rgba(232,148,10,0.18)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <BrandLogo textClassName="text-slate-800" />
              <span className="font-medium hidden md:block" style={{ color: "var(--slate-mid)" }}>Lead Management</span>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-serif font-bold" style={{ color: "var(--ink)" }}>Ad Leads</h1>
            <p className="mt-1" style={{ color: "var(--slate-mid)" }}>People who expressed interest via your ads</p>
          </div>
          <Button
            onClick={downloadCSV}
            disabled={sortedLeads.length === 0}
            className="text-white hover:opacity-90"
            style={{ background: "var(--leaf)", borderColor: "transparent" }}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV{activeFilter !== "all" ? ` (${sortedLeads.length})` : ""}
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-sm" style={{ background: "white" }}>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg p-2" style={{ background: "rgba(232,148,10,0.12)" }}>
                  <Users className="h-5 w-5" style={{ color: "var(--saffron)" }} />
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: "var(--ink)" }}>{leads.length}</div>
                  <div className="text-xs" style={{ color: "var(--slate-mid)" }}>Total Leads</div>
                </div>
              </div>
            </CardContent>
          </Card>
          {reEngagedCount > 0 && (
            <Card className="border-0 shadow-sm" style={{ background: "rgba(232,148,10,0.08)", border: "1px solid rgba(232,148,10,0.25)" }}>
              <CardContent className="pt-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg p-2" style={{ background: "rgba(232,148,10,0.18)" }}>
                    <Users className="h-5 w-5" style={{ color: "var(--saffron)" }} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold" style={{ color: "var(--saffron)" }}>{reEngagedCount}</div>
                    <div className="text-xs" style={{ color: "var(--saffron)" }}>Re-engaged</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {Object.entries(sourceStats).slice(0, reEngagedCount > 0 ? 2 : 3).map(([src, count]) => (
            <Card key={src} className="border-0 shadow-sm" style={{ background: "white" }}>
              <CardContent className="pt-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg p-2" style={{ background: "rgba(22,163,74,0.10)" }}>
                    <Globe className="h-5 w-5" style={{ color: "var(--leaf)" }} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold" style={{ color: "var(--ink)" }}>{count as number}</div>
                    <div className="text-xs capitalize" style={{ color: "var(--slate-mid)" }}>{src}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Leads Table */}
        <Card className="border-0 shadow-sm" style={{ background: "white" }}>
          <CardHeader style={{ borderBottom: "1px solid rgba(232,148,10,0.12)" }}>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="font-serif text-lg" style={{ color: "var(--ink)" }}>
                  {activeFilter === "all" && !searchTerm ? "All Leads" : (
                    <span>
                      Filtered Leads{" "}
                      <span className="text-sm font-normal" style={{ color: "var(--slate-mid)" }}>
                        ({sortedLeads.length} of {leads.length})
                      </span>
                    </span>
                  )}
                </CardTitle>
                {/* Filter Bar */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Filter className="h-3.5 w-3.5 mr-0.5 flex-shrink-0" style={{ color: "var(--slate-mid)" }} />
                  {(
                    [
                      { key: "all", label: "All" },
                      { key: "re-engaged", label: "Re-engaged" },
                      { key: "7d", label: "Last 7 days" },
                      { key: "30d", label: "Last 30 days" },
                    ] as { key: FilterKey; label: string }[]
                  ).map(({ key, label }) => {
                    const isActive = activeFilter === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setActiveFilter(key)}
                        className="text-xs px-3 py-1 rounded-full transition-all font-medium border"
                        style={
                          isActive
                            ? {
                                background: "var(--saffron)",
                                color: "white",
                                borderColor: "var(--saffron)",
                              }
                            : {
                                background: "transparent",
                                color: "var(--slate-mid)",
                                borderColor: "rgba(232,148,10,0.30)",
                              }
                        }
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* Search input */}
              <div className="relative max-w-sm">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: "var(--slate-mid)" }} />
                <Input
                  type="text"
                  placeholder="Search by name, email or phone…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-8 h-8 text-sm border rounded-lg focus-visible:ring-1 focus-visible:ring-amber-400"
                  style={{ borderColor: "rgba(232,148,10,0.30)", background: "rgba(251,248,242,0.70)" }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {leads.length === 0 ? (
              <div className="text-center py-16">
                <Users className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p className="font-medium" style={{ color: "var(--slate-mid)" }}>No leads yet</p>
                <p className="text-sm mt-1 text-slate-400">
                  Share your ad landing page link to start collecting leads
                </p>
                <div className="mt-4 rounded-lg px-4 py-2 inline-block text-sm font-mono" style={{ background: "rgba(232,148,10,0.08)", color: "var(--slate-mid)" }}>
                  {window.location.origin}/go
                </div>
              </div>
            ) : sortedLeads.length === 0 ? (
              <div className="text-center py-12">
                {searchTerm
                  ? <Search className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                  : <Filter className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                }
                <p className="font-medium" style={{ color: "var(--slate-mid)" }}>
                  {searchTerm ? `No leads match "${searchQuery}"` : "No leads match this filter"}
                </p>
                <button
                  className="mt-3 text-sm underline underline-offset-2"
                  style={{ color: "var(--saffron)" }}
                  onClick={() => { setActiveFilter("all"); setSearchQuery(""); }}
                >
                  Clear {searchTerm && activeFilter !== "all" ? "search & filter" : searchTerm ? "search" : "filter"}
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left" style={{ borderBottom: "1px solid rgba(232,148,10,0.15)" }}>
                      <th
                        className="pb-3 font-medium cursor-pointer select-none hover:opacity-80"
                        style={{ color: "var(--slate-mid)" }}
                        onClick={() => handleSort("name")}
                      >
                        Name <SortIcon col="name" sortBy={sortBy} sortDir={sortDir} />
                      </th>
                      <th className="pb-3 font-medium" style={{ color: "var(--slate-mid)" }}>Contact</th>
                      <th className="pb-3 font-medium" style={{ color: "var(--slate-mid)" }}>Source</th>
                      <th className="pb-3 font-medium" style={{ color: "var(--slate-mid)" }}>Campaign</th>
                      <th
                        className="pb-3 font-medium cursor-pointer select-none hover:opacity-80 whitespace-nowrap"
                        style={{ color: "var(--slate-mid)" }}
                        onClick={() => handleSort("createdAt")}
                      >
                        First contact <SortIcon col="createdAt" sortBy={sortBy} sortDir={sortDir} />
                      </th>
                      <th
                        className="pb-3 font-medium cursor-pointer select-none hover:opacity-80 whitespace-nowrap"
                        style={{ color: "var(--slate-mid)" }}
                        onClick={() => handleSort("updatedAt")}
                      >
                        Last contact <SortIcon col="updatedAt" sortBy={sortBy} sortDir={sortDir} />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedLeads.map((lead: any) => {
                      const reEngaged = isReEngaged(lead);
                      return (
                        <tr key={lead.id} className="hover:bg-amber-50/40 transition-colors" style={{ borderBottom: "1px solid rgba(232,148,10,0.08)" }}>
                          <td className="py-3 font-medium" style={{ color: "var(--ink)" }}>
                            {lead.name}
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-1.5" style={{ color: "var(--slate-mid)" }}>
                              <Mail className="h-3.5 w-3.5 text-slate-400" />
                              {lead.email}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs mt-0.5 text-slate-400">
                              <Phone className="h-3 w-3" />
                              {lead.phone}
                            </div>
                          </td>
                          <td className="py-3">
                            <Badge
                              variant="secondary"
                              className="capitalize text-xs"
                              style={{ background: "rgba(232,148,10,0.10)", color: "var(--saffron)", borderColor: "rgba(232,148,10,0.20)" }}
                            >
                              {lead.utm?.utm_source || "direct"}
                            </Badge>
                          </td>
                          <td className="py-3 text-xs text-slate-400">
                            {lead.utm?.utm_campaign || lead.utm?.utm_medium || "—"}
                          </td>
                          <td className="py-3 text-xs whitespace-nowrap text-slate-400">
                            {lead.createdAt
                              ? new Date(lead.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric", month: "short", year: "numeric",
                                })
                              : "—"}
                          </td>
                          <td className="py-3 text-xs whitespace-nowrap">
                            {lead.updatedAt ? (
                              <div className="flex flex-col gap-1">
                                <span style={reEngaged ? { color: "var(--saffron)", fontWeight: 500 } : { color: "#94a3b8" }}>
                                  {new Date(lead.updatedAt).toLocaleDateString("en-IN", {
                                    day: "numeric", month: "short", year: "numeric",
                                  })}
                                </span>
                                {reEngaged && (
                                  <Badge
                                    className="text-[10px] px-1.5 py-0 h-4 w-fit hover:bg-amber-100"
                                    style={{ background: "rgba(232,148,10,0.12)", color: "var(--saffron)", border: "1px solid rgba(232,148,10,0.25)" }}
                                  >
                                    Re-engaged
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ad Link Helper */}
        <Card className="mt-6 border-0 shadow-sm" style={{ background: "rgba(232,148,10,0.06)", border: "1px solid rgba(232,148,10,0.20)" }}>
          <CardContent className="pt-5">
            <h3 className="font-serif font-semibold mb-2" style={{ color: "var(--ink)" }}>Your Ad Landing Page URL</h3>
            <p className="text-sm mb-3" style={{ color: "var(--slate-mid)" }}>
              Use this link as the destination URL in your Facebook / Instagram ads. UTM parameters are tracked automatically.
            </p>
            <div className="flex flex-col md:flex-row gap-3">
              {[
                { label: "Facebook Ad", url: `${window.location.origin}/go?utm_source=facebook&utm_medium=paid_social&utm_campaign=retirement_awareness` },
                { label: "Instagram Ad", url: `${window.location.origin}/go?utm_source=instagram&utm_medium=paid_social&utm_campaign=retirement_awareness` },
              ].map(({ label, url }) => (
                <div key={label} className="flex-1 rounded-lg border p-3" style={{ background: "white", borderColor: "rgba(232,148,10,0.25)" }}>
                  <div className="text-xs font-semibold mb-1" style={{ color: "var(--saffron)" }}>{label}</div>
                  <div className="text-xs font-mono break-all" style={{ color: "var(--slate-mid)" }}>{url}</div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 text-xs h-7 hover:bg-amber-50"
                    style={{ borderColor: "rgba(232,148,10,0.35)", color: "var(--saffron)" }}
                    onClick={() => { navigator.clipboard.writeText(url); toast({ title: "Copied!", description: `${label} URL copied to clipboard` }); }}
                  >
                    Copy Link
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
