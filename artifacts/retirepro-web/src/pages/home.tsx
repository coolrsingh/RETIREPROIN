import { useAuth } from "@/hooks/useAuth";
import { useListScenarios, getListScenariosQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChartLine, Plus, FileText, Zap, Users, BookOpen, HelpCircle, Target, Mail, TrendingUp, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import ProfileMenu from "@/components/profile-menu";
import BrandLogo from "@/components/brand-logo";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { formatCorpus } from "@/lib/formatCorpus";

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const [renameScenario, setRenameScenario] = useState<{ id: string; name: string } | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [deleteScenario, setDeleteScenario] = useState<{ id: string; name: string } | null>(null);

  const { data: scenarios, isLoading: scenariosLoading } = useListScenarios({
    query: { queryKey: getListScenariosQueryKey(), enabled: isAuthenticated },
  });

  const renameMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const res = await fetch(`/api/scenarios/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to rename plan");
      return res.json();
    },
    onMutate: async ({ id, name }) => {
      await queryClient.cancelQueries({ queryKey: getListScenariosQueryKey() });
      const previous = queryClient.getQueryData(getListScenariosQueryKey());
      queryClient.setQueryData(getListScenariosQueryKey(), (old: any[]) =>
        old?.map((s) => (s.id === id ? { ...s, name } : s))
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(getListScenariosQueryKey(), ctx.previous);
      }
      toast({ title: "Error", description: "Could not rename plan. Please try again.", variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: getListScenariosQueryKey() });
    },
    onSuccess: () => {
      toast({ title: "Plan renamed", description: "Your plan name has been updated." });
      setRenameScenario(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/scenarios/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete plan");
      return res.json();
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: getListScenariosQueryKey() });
      const previous = queryClient.getQueryData(getListScenariosQueryKey());
      queryClient.setQueryData(getListScenariosQueryKey(), (old: any[]) =>
        old?.filter((s) => s.id !== id)
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(getListScenariosQueryKey(), ctx.previous);
      }
      toast({ title: "Error", description: "Could not delete plan. Please try again.", variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: getListScenariosQueryKey() });
    },
    onSuccess: () => {
      toast({ title: "Plan deleted", description: "Your plan has been removed." });
      setDeleteScenario(null);
    },
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const raw = sessionStorage.getItem("guestCalcForm");
      if (raw) {
        navigate("/plan?mode=quick");
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading || scenariosLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--ivory)" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E8940A] mx-auto mb-4"></div>
          <p style={{ color: "var(--slate-mid)" }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const isAdmin = (user as any)?.role === 'admin';

  const handleRenameOpen = (scenario: { id: string; name: string }) => {
    setRenameScenario(scenario);
    setRenameDraft(scenario.name);
  };

  const renameTrimmed = renameDraft.trim();
  const isDuplicateName =
    !!renameScenario &&
    !!renameTrimmed &&
    renameTrimmed.toLowerCase() !== renameScenario.name.toLowerCase() &&
    !!(scenarios as any[])?.some(
      (s: any) =>
        s.id !== renameScenario.id &&
        s.name.toLowerCase() === renameTrimmed.toLowerCase()
    );

  const handleRenameSubmit = () => {
    if (!renameScenario) return;
    const trimmed = renameDraft.trim();
    if (!trimmed || trimmed === renameScenario.name) {
      setRenameScenario(null);
      return;
    }
    if (isDuplicateName) return;
    renameMutation.mutate({ id: renameScenario.id, name: trimmed });
  };

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
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <BrandLogo textClassName="text-slate-800" />
              <nav className="hidden md:flex space-x-6 items-center">
                <span className="font-semibold" style={{ color: "var(--saffron)" }}>Dashboard</span>
                <Link href="/blog" className="font-medium hover:opacity-80 flex items-center gap-1.5" style={{ color: "var(--slate-mid)" }}>
                  <BookOpen className="h-4 w-4" />
                  Blog
                </Link>
                <Link href="/faq" className="font-medium hover:opacity-80 flex items-center gap-1.5" style={{ color: "var(--slate-mid)" }}>
                  <HelpCircle className="h-4 w-4" />
                  FAQ
                </Link>
                <Link href="/landing" className="font-medium hover:opacity-80 flex items-center gap-1.5" style={{ color: "var(--slate-mid)" }}>
                  <ChartLine className="h-4 w-4" />
                  About
                </Link>
                {isAdmin && (
                  <Link href="/leads" className="font-medium hover:opacity-80 flex items-center gap-1" style={{ color: "var(--slate-mid)" }}>
                    <Users className="h-4 w-4" />
                    Ad Leads
                  </Link>
                )}
                {isAdmin && (
                  <Link href="/subscribers" className="font-medium hover:opacity-80 flex items-center gap-1.5" style={{ color: "var(--slate-mid)" }}>
                    <Mail className="h-4 w-4" />
                    Subscribers
                  </Link>
                )}
              </nav>
            </div>
            <ProfileMenu user={user} isAdmin={isAdmin} />
          </div>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}
          >
            Welcome back, {(user as any)?.firstName || 'there'}!
          </h1>
          <p style={{ color: "var(--slate-mid)" }}>
            Manage your retirement plans and track your financial goals
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div
            className="rounded-2xl p-6"
            style={{
              background: "linear-gradient(135deg, rgba(232,148,10,0.10) 0%, rgba(251,159,11,0.06) 100%)",
              border: "1px solid rgba(232,148,10,0.22)",
            }}
          >
            <div className="flex items-start gap-3 mb-4">
              <Zap className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: "var(--saffron)" }} />
              <div>
                <h2
                  className="text-lg font-semibold mb-1"
                  style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}
                >
                  Create a New Retirement Plan
                </h2>
                <p className="text-sm" style={{ color: "var(--slate-mid)" }}>
                  Fill in your household income, savings, children and goals — get a full year-by-year projection instantly
                </p>
              </div>
            </div>
            <Link href="/plan?mode=quick">
              <Button
                className="text-white font-semibold px-6"
                style={{ background: "var(--saffron)", borderColor: "transparent" }}
                data-testid="button-create-quick-plan"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Retirement Plan
              </Button>
            </Link>
          </div>
        </div>

        {/* Existing Plans */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-2xl font-bold"
              style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}
            >
              Your Plans
            </h2>
            {scenarios && scenarios.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                style={{ borderColor: "rgba(232,148,10,0.35)", color: "var(--saffron)" }}
                data-testid="button-view-all"
              >
                <FileText className="mr-2 h-4 w-4" />
                View All
              </Button>
            )}
          </div>

          {scenarios && scenarios.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scenarios.map((scenario: any) => (
                <div
                  key={scenario.id}
                  className="rounded-2xl p-5 transition-shadow hover:shadow-md"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid rgba(232,148,10,0.18)",
                    boxShadow: "0 1px 6px rgba(26,18,8,0.05)",
                  }}
                  data-testid={`card-scenario-${scenario.id}`}
                >
                  <div className="mb-3">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3
                        className="text-lg font-semibold leading-snug"
                        style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}
                      >
                        {scenario.name}
                      </h3>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{
                            background: scenario.mode === 'quick'
                              ? "rgba(232,148,10,0.12)"
                              : "rgba(59,130,246,0.10)",
                            color: scenario.mode === 'quick' ? "var(--saffron)" : "#2563EB",
                          }}
                        >
                          {scenario.mode === 'quick' ? 'Quick' : 'Detailed'}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className="rounded-md p-1 hover:bg-black/5 transition-colors"
                              style={{ color: "var(--slate-mid)" }}
                              aria-label="Plan options"
                              data-testid={`btn-options-${scenario.id}`}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem
                              className="gap-2 cursor-pointer"
                              onSelect={() => handleRenameOpen({ id: scenario.id, name: scenario.name })}
                              data-testid={`btn-rename-${scenario.id}`}
                            >
                              <Pencil className="h-4 w-4" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="gap-2 cursor-pointer text-red-600 focus:text-red-600"
                              onSelect={() => setDeleteScenario({ id: scenario.id, name: scenario.name })}
                              data-testid={`btn-delete-${scenario.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Target
                        className="h-4 w-4 shrink-0"
                        style={{ color: scenario.selfRetirementAge != null ? "var(--saffron)" : "rgba(26,18,8,0.25)" }}
                      />
                      {scenario.selfRetirementAge != null ? (
                        <span className="text-sm font-medium" style={{ color: "var(--ink)" }}>
                          Retires at age {scenario.selfRetirementAge}
                        </span>
                      ) : (
                        <span className="text-sm" style={{ color: "var(--slate-mid)" }}>
                          Retirement age not set
                        </span>
                      )}
                    </div>
                    {formatCorpus(scenario.projectedCorpus) && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <TrendingUp className="h-4 w-4 shrink-0" style={{ color: "#16a34a" }} />
                        <span className="text-sm font-semibold" style={{ color: "#16a34a" }}>
                          {formatCorpus(scenario.projectedCorpus)}
                        </span>
                      </div>
                    )}
                    <p className="text-xs mt-1.5" style={{ color: "var(--slate-mid)" }}>
                      Updated {new Date(scenario.updatedAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div className="mt-3">
                    <Link href={`/plan/${scenario.id}`}>
                      <Button
                        size="sm"
                        className="text-white font-medium"
                        style={{ background: "var(--saffron)", borderColor: "transparent" }}
                        data-testid={`button-view-${scenario.id}`}
                      >
                        <ChartLine className="mr-2 h-4 w-4" />
                        View Plan
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="rounded-2xl text-center py-14 px-6"
              style={{
                background: "#FFFFFF",
                border: "1px solid rgba(232,148,10,0.18)",
                boxShadow: "0 1px 6px rgba(26,18,8,0.05)",
              }}
            >
              <ChartLine className="h-14 w-14 mx-auto mb-4" style={{ color: "rgba(232,148,10,0.3)" }} />
              <h3
                className="text-xl font-semibold mb-2"
                style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}
              >
                No plans yet
              </h3>
              <p className="mb-5 text-sm" style={{ color: "var(--slate-mid)" }}>
                Get started by creating your first retirement plan
              </p>

              <div
                className="inline-block rounded-xl px-5 py-3 mb-6 text-left max-w-md"
                style={{
                  background: "rgba(232,148,10,0.08)",
                  border: "1px solid rgba(232,148,10,0.20)",
                }}
              >
                <h4
                  className="font-semibold text-sm mb-1"
                  style={{ color: "var(--ink)" }}
                >
                  💡 Did you know?
                </h4>
                <p className="text-sm" style={{ color: "var(--slate-mid)" }}>
                  Starting to save for retirement at age 25 vs 35 can result in 2× more wealth at retirement,
                  thanks to the power of compound interest. Every year matters!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/plan?mode=quick">
                  <Button
                    className="text-white font-semibold"
                    style={{ background: "var(--saffron)", borderColor: "transparent" }}
                    data-testid="button-first-quick-plan"
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Create Retirement Plan
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Rename Dialog */}
      <Dialog open={!!renameScenario} onOpenChange={(open) => { if (!open) setRenameScenario(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename Plan</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-1.5">
            <Input
              value={renameDraft}
              onChange={(e) => setRenameDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameSubmit();
                if (e.key === "Escape") setRenameScenario(null);
              }}
              autoFocus
              maxLength={120}
              placeholder="Plan name"
              data-testid="input-rename"
              className={isDuplicateName ? "border-red-400 focus-visible:ring-red-300" : ""}
            />
            {isDuplicateName && (
              <p className="text-xs text-red-600" data-testid="rename-duplicate-error">
                You already have a plan with this name.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameScenario(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleRenameSubmit}
              disabled={renameMutation.isPending || !renameDraft.trim() || isDuplicateName}
              className="text-white"
              style={{ background: "var(--saffron)", borderColor: "transparent" }}
              data-testid="btn-rename-confirm"
            >
              {renameMutation.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteScenario} onOpenChange={(open) => { if (!open) setDeleteScenario(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete plan?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteScenario?.name}</strong> will be permanently deleted and cannot be recovered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteScenario && deleteMutation.mutate(deleteScenario.id)}
              className="bg-red-600 hover:bg-red-700 text-white"
              data-testid="btn-delete-confirm"
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
