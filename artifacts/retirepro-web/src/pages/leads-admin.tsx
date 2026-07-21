import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Users, Mail, Phone, Globe, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import BrandLogo from "@/components/brand-logo";
import { Link } from "wouter";
import { isUnauthorizedError } from "@/lib/authUtils";

type SortKey = "name" | "createdAt" | "updatedAt";
type SortDir = "asc" | "desc";

function isReEngaged(lead: any): boolean {
  if (!lead.updatedAt || !lead.createdAt) return false;
  const diff = Math.abs(
    new Date(lead.updatedAt).getTime() - new Date(lead.createdAt).getTime()
  );
  return diff > 60_000;
}

function SortIcon({ col, sortBy, sortDir }: { col: SortKey; sortBy: SortKey; sortDir: SortDir }) {
  if (sortBy !== col) return <ArrowUpDown className="inline ml-1 h-3.5 w-3.5 text-slate-400" />;
  return sortDir === "asc"
    ? <ArrowUp className="inline ml-1 h-3.5 w-3.5 text-blue-500" />
    : <ArrowDown className="inline ml-1 h-3.5 w-3.5 text-blue-500" />;
}

export default function LeadsAdmin() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [sortBy, setSortBy] = useState<SortKey>("updatedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

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

  const sortedLeads = [...leads].sort((a, b) => {
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
    if (!leads || leads.length === 0) return;
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
      <div className="min-h-screen bg-gradient-to-b from-[#F4F9FF] to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F4F9FF] to-white">
      <header className="bg-white/85 backdrop-blur-xl border-b border-slate-200/60 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <BrandLogo textClassName="text-slate-800" />
              <span className="text-slate-500 font-medium hidden md:block">Lead Management</span>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm">
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
            <h1 className="text-2xl font-bold text-slate-900">Ad Leads</h1>
            <p className="text-slate-500 mt-1">People who expressed interest via your ads</p>
          </div>
          <Button
            onClick={downloadCSV}
            disabled={!leads || leads.length === 0}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 rounded-lg p-2">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">{leads.length}</div>
                  <div className="text-xs text-slate-500">Total Leads</div>
                </div>
              </div>
            </CardContent>
          </Card>
          {reEngagedCount > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-5">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 rounded-lg p-2">
                    <Users className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-amber-700">{reEngagedCount}</div>
                    <div className="text-xs text-amber-600">Re-engaged</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {Object.entries(sourceStats).slice(0, reEngagedCount > 0 ? 2 : 3).map(([src, count]) => (
            <Card key={src}>
              <CardContent className="pt-5">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 rounded-lg p-2">
                    <Globe className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-800">{count as number}</div>
                    <div className="text-xs text-slate-500 capitalize">{src}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Leads Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">All Leads</CardTitle>
          </CardHeader>
          <CardContent>
            {leads.length === 0 ? (
              <div className="text-center py-16">
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No leads yet</p>
                <p className="text-slate-400 text-sm mt-1">
                  Share your ad landing page link to start collecting leads
                </p>
                <div className="mt-4 bg-slate-100 rounded-lg px-4 py-2 inline-block text-sm font-mono text-slate-600">
                  {window.location.origin}/go
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left">
                      <th
                        className="pb-3 text-slate-500 font-medium cursor-pointer select-none hover:text-slate-700"
                        onClick={() => handleSort("name")}
                      >
                        Name <SortIcon col="name" sortBy={sortBy} sortDir={sortDir} />
                      </th>
                      <th className="pb-3 text-slate-500 font-medium">Contact</th>
                      <th className="pb-3 text-slate-500 font-medium">Source</th>
                      <th className="pb-3 text-slate-500 font-medium">Campaign</th>
                      <th
                        className="pb-3 text-slate-500 font-medium cursor-pointer select-none hover:text-slate-700 whitespace-nowrap"
                        onClick={() => handleSort("createdAt")}
                      >
                        First contact <SortIcon col="createdAt" sortBy={sortBy} sortDir={sortDir} />
                      </th>
                      <th
                        className="pb-3 text-slate-500 font-medium cursor-pointer select-none hover:text-slate-700 whitespace-nowrap"
                        onClick={() => handleSort("updatedAt")}
                      >
                        Last contact <SortIcon col="updatedAt" sortBy={sortBy} sortDir={sortDir} />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedLeads.map((lead: any) => {
                      const reEngaged = isReEngaged(lead);
                      return (
                        <tr key={lead.id} className="hover:bg-slate-50">
                          <td className="py-3 font-medium text-slate-800">
                            {lead.name}
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Mail className="h-3.5 w-3.5 text-slate-400" />
                              {lead.email}
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-0.5">
                              <Phone className="h-3 w-3 text-slate-400" />
                              {lead.phone}
                            </div>
                          </td>
                          <td className="py-3">
                            <Badge variant="secondary" className="capitalize text-xs">
                              {lead.utm?.utm_source || "direct"}
                            </Badge>
                          </td>
                          <td className="py-3 text-slate-500 text-xs">
                            {lead.utm?.utm_campaign || lead.utm?.utm_medium || "—"}
                          </td>
                          <td className="py-3 text-slate-400 text-xs whitespace-nowrap">
                            {lead.createdAt
                              ? new Date(lead.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric", month: "short", year: "numeric",
                                })
                              : "—"}
                          </td>
                          <td className="py-3 text-xs whitespace-nowrap">
                            {lead.updatedAt ? (
                              <div className="flex flex-col gap-1">
                                <span className={reEngaged ? "text-amber-700 font-medium" : "text-slate-400"}>
                                  {new Date(lead.updatedAt).toLocaleDateString("en-IN", {
                                    day: "numeric", month: "short", year: "numeric",
                                  })}
                                </span>
                                {reEngaged && (
                                  <Badge className="text-[10px] px-1.5 py-0 h-4 bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-100 w-fit">
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
        <Card className="mt-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-5">
            <h3 className="font-semibold text-blue-800 mb-2">Your Ad Landing Page URL</h3>
            <p className="text-blue-600 text-sm mb-3">
              Use this link as the destination URL in your Facebook / Instagram ads. UTM parameters are tracked automatically.
            </p>
            <div className="flex flex-col md:flex-row gap-3">
              {[
                { label: "Facebook Ad", url: `${window.location.origin}/go?utm_source=facebook&utm_medium=paid_social&utm_campaign=retirement_awareness` },
                { label: "Instagram Ad", url: `${window.location.origin}/go?utm_source=instagram&utm_medium=paid_social&utm_campaign=retirement_awareness` },
              ].map(({ label, url }) => (
                <div key={label} className="flex-1 bg-white rounded-lg border border-blue-200 p-3">
                  <div className="text-xs font-semibold text-blue-700 mb-1">{label}</div>
                  <div className="text-xs font-mono text-slate-600 break-all">{url}</div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 text-xs h-7 border-blue-300 text-blue-700"
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
