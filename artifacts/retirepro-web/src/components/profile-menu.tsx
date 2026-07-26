import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGetProfile, useUpdateProfile, getGetProfileQueryKey } from "@workspace/api-client-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { User, Phone, Calendar, TrendingUp, Wallet, PiggyBank, BarChart2, Edit2, LogOut, Share2, Check } from "lucide-react";

function fmt(v: string | null | undefined, prefix = "₹") {
  if (!v) return "—";
  return prefix + Number(v).toLocaleString("en-IN");
}

interface ProfileMenuProps {
  user: any;
  isAdmin?: boolean;
}

export default function ProfileMenu({ user, isAdmin }: ProfileMenuProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [shared, setShared] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: profile } = useGetProfile();

  const [form, setForm] = useState<any>({});

  const openEdit = () => {
    setForm({
      firstName: profile?.firstName || user?.firstName || "",
      phone: profile?.phone || "",
      dob: profile?.dob || "",
      retirementAge: profile?.retirementAge || 60,
      monthlyIncome: profile?.monthlyIncome || "",
      monthlyExpenses: profile?.monthlyExpenses || "",
      monthlySavings: profile?.monthlySavings || "",
      incomeGrowthRate: profile?.incomeGrowthRate || 8,
      currentAssets: profile?.currentAssets || "",
    });
    setEditOpen(true);
  };

  const saveMutation = useUpdateProfile({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        setEditOpen(false);
        toast({ title: "Profile saved", description: "Your details have been updated." });
      },
      onError: () => {
        toast({ title: "Save failed", description: "Please try again.", variant: "destructive" });
      },
    },
  });

  const shareMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/share", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
    },
  });

  const handleShare = async () => {
    const url = window.location.origin;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // fallback silent
    }
    shareMutation.mutate();
    setShared(true);
    toast({
      title: "Link copied!",
      description: "Share RetirePro with your friends and family.",
    });
    setTimeout(() => setShared(false), 3000);
  };

  const p = profile || user;
  const displayName = p?.firstName ? `${p.firstName}${p.lastName ? " " + p.lastName : ""}` : p?.email || "User";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700">
            <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center">
              {p?.profileImageUrl ? (
                <img src={p.profileImageUrl} className="w-7 h-7 rounded-full object-cover" alt="" />
              ) : (
                <User className="h-4 w-4 text-primary-600" />
              )}
            </div>
            <span className="max-w-[120px] truncate">{displayName}</span>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-80 p-0" sideOffset={8}>
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-md">
            <p className="text-white font-semibold text-sm">{displayName}</p>
            <p className="text-blue-100 text-xs mt-0.5">{p?.email}</p>
            {isAdmin && (
              <span className="inline-block mt-1 text-xs bg-yellow-400 text-yellow-900 font-semibold px-2 py-0.5 rounded-full">
                Admin
              </span>
            )}
          </div>

          {/* Stored financial data */}
          <div className="px-4 py-3 space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Your Saved Data</p>

            <DataRow icon={<Phone className="h-3.5 w-3.5 text-slate-400" />} label="Phone" value={p?.phone || "—"} />
            <DataRow icon={<Calendar className="h-3.5 w-3.5 text-slate-400" />} label="Date of Birth" value={p?.dob ? new Date(p.dob).toLocaleDateString("en-IN") : "—"} />
            <DataRow icon={<User className="h-3.5 w-3.5 text-slate-400" />} label="Retirement Age" value={p?.retirementAge ? `${p.retirementAge} yrs` : "—"} />
            <DataRow icon={<TrendingUp className="h-3.5 w-3.5 text-slate-400" />} label="Monthly Income" value={fmt(p?.monthlyIncome)} />
            <DataRow icon={<Wallet className="h-3.5 w-3.5 text-slate-400" />} label="Monthly Expenses" value={fmt(p?.monthlyExpenses)} />
            <DataRow icon={<PiggyBank className="h-3.5 w-3.5 text-slate-400" />} label="Monthly Savings" value={fmt(p?.monthlySavings)} />
            <DataRow icon={<BarChart2 className="h-3.5 w-3.5 text-slate-400" />} label="Current Assets" value={fmt(p?.currentAssets)} />
            <DataRow icon={<TrendingUp className="h-3.5 w-3.5 text-slate-400" />} label="Income Growth" value={p?.incomeGrowthRate ? `${p.incomeGrowthRate}% p.a.` : "—"} />
          </div>

          <DropdownMenuSeparator />

          <div className="px-4 py-3 space-y-2">
            {/* Shares count */}
            {(p?.shareCount || 0) > 0 && (
              <p className="text-xs text-slate-500">
                You've shared RetirePro <span className="font-semibold text-primary-600">{p.shareCount} time{p.shareCount !== 1 ? "s" : ""}</span> — thank you!
              </p>
            )}

            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" onClick={openEdit}>
                <Edit2 className="h-3.5 w-3.5 mr-1" />
                Edit Profile
              </Button>
              <Button
                size="sm"
                variant={shared ? "default" : "outline"}
                className={`flex-1 ${shared ? "bg-green-600 hover:bg-green-700" : ""}`}
                onClick={handleShare}
              >
                {shared ? <Check className="h-3.5 w-3.5 mr-1" /> : <Share2 className="h-3.5 w-3.5 mr-1" />}
                {shared ? "Copied!" : "Share"}
              </Button>
            </div>

            <Button
              size="sm"
              variant="ghost"
              className="w-full text-slate-500 hover:text-red-600"
              onClick={() => (window.location.href = "/api/logout")}
            >
              <LogOut className="h-3.5 w-3.5 mr-1" />
              Sign Out
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Your Profile</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2">
              <Label>Full Name</Label>
              <Input value={form.firstName || ""} onChange={e => setForm({ ...form, firstName: e.target.value })} placeholder="Your name" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.phone || ""} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
            </div>
            <div>
              <Label>Date of Birth</Label>
              <Input type="date" value={form.dob || ""} onChange={e => setForm({ ...form, dob: e.target.value })} />
            </div>
            <div>
              <Label>Retirement Age</Label>
              <Input type="number" value={form.retirementAge || ""} onChange={e => setForm({ ...form, retirementAge: Number(e.target.value) })} placeholder="60" />
            </div>
            <div>
              <Label>Monthly Income (₹)</Label>
              <Input type="number" value={form.monthlyIncome || ""} onChange={e => setForm({ ...form, monthlyIncome: e.target.value })} placeholder="50000" />
            </div>
            <div>
              <Label>Monthly Expenses (₹)</Label>
              <Input type="number" value={form.monthlyExpenses || ""} onChange={e => setForm({ ...form, monthlyExpenses: e.target.value })} placeholder="30000" />
            </div>
            <div>
              <Label>Monthly Savings (₹)</Label>
              <Input type="number" value={form.monthlySavings || ""} onChange={e => setForm({ ...form, monthlySavings: e.target.value })} placeholder="20000" />
            </div>
            <div>
              <Label>Current Assets (₹)</Label>
              <Input type="number" value={form.currentAssets || ""} onChange={e => setForm({ ...form, currentAssets: e.target.value })} placeholder="1000000" />
            </div>
            <div>
              <Label>Income Growth Rate (%/yr)</Label>
              <Input type="number" value={form.incomeGrowthRate || ""} onChange={e => setForm({ ...form, incomeGrowthRate: e.target.value })} placeholder="8" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate({ data: form })} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function DataRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5 text-slate-500 text-xs">
        {icon}
        {label}
      </div>
      <span className="text-xs font-medium text-slate-700">{value}</span>
    </div>
  );
}
