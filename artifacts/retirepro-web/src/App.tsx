import { Switch, Route, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import PlanForm from "@/pages/plan-form";
import PlanDashboard from "@/pages/plan-dashboard";
import SettingsCrm from "@/pages/settings-crm";
import AdLanding from "@/pages/ad-landing";
import LeadsAdmin from "@/pages/leads-admin";
import BlogIndex from "@/pages/blog-index";
import Blog1 from "@/pages/blog-1";
import Blog2 from "@/pages/blog-2";
import GuestPlanPreview from "@/pages/guest-plan-preview";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Always-public pages */}
      <Route path="/go" component={AdLanding} />
      <Route path="/blog" component={BlogIndex} />
      <Route path="/blog/why-indians-fail-retirement" component={Blog1} />
      <Route path="/blog/nps-vs-ppf-vs-sip" component={Blog2} />
      <Route path="/plan/preview" component={GuestPlanPreview} />

      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/plan" component={PlanForm} />
          <Route path="/plan/:id" component={PlanDashboard} />
          <Route path="/settings/crm" component={SettingsCrm} />
          <Route path="/leads" component={LeadsAdmin} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Toaster />
          <Router />
        </WouterRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
