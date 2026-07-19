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
import Blog3 from "@/pages/blog-3";
import Blog4 from "@/pages/blog-4";
import GuestPlanPreview from "@/pages/guest-plan-preview";
import FreePlan from "@/pages/free-plan";
import PrivacyPolicy from "@/pages/privacy-policy";
import Disclaimer from "@/pages/disclaimer";
import RefundPolicy from "@/pages/refund-policy";
import TermsAndConditions from "@/pages/terms-and-conditions";
import FAQ from "@/pages/faq";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Always-public pages */}
      <Route path="/go" component={AdLanding} />
      <Route path="/landing" component={Landing} />
      <Route path="/blog" component={BlogIndex} />
      <Route path="/blog/why-indians-fail-retirement" component={Blog1} />
      <Route path="/blog/nps-vs-ppf-vs-sip" component={Blog2} />
      <Route path="/blog/real-estate-rich-retirement-illusion" component={Blog3} />
      <Route path="/blog/how-much-to-retire-india" component={Blog4} />
      <Route path="/plan/preview" component={GuestPlanPreview} />
      <Route path="/free-plan" component={FreePlan} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/disclaimer" component={Disclaimer} />
      <Route path="/refund-policy" component={RefundPolicy} />
      <Route path="/terms-and-conditions" component={TermsAndConditions} />
      <Route path="/faq" component={FAQ} />

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
