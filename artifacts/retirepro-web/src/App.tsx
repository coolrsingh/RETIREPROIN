import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { setDefaultCredentials, configureZodValidation } from "@workspace/api-client-react";
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
import Blog5 from "@/pages/blog-5";
import Blog6 from "@/pages/blog-6";
import Blog7 from "@/pages/blog-7";
import Blog8 from "@/pages/blog-8";
import Blog9 from "@/pages/blog-9";
import BlogSubscribePopup from "@/components/blog-subscribe-popup";
import GuestPlanPreview from "@/pages/guest-plan-preview";
import FreePlan from "@/pages/free-plan";
import PrivacyPolicy from "@/pages/privacy-policy";
import Disclaimer from "@/pages/disclaimer";
import RefundPolicy from "@/pages/refund-policy";
import TermsAndConditions from "@/pages/terms-and-conditions";
import FAQ from "@/pages/faq";
import SubscribersAdmin from "@/pages/subscribers-admin";
import NotFound from "@/pages/not-found";

setDefaultCredentials("include");
// Enable runtime Zod validation on API responses so shape mismatches surface
// as explicit errors rather than silent rendering failures.  Pass `false` here
// to disable validation in a specific environment if the overhead matters.
configureZodValidation(true);

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location]);
  return null;
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <>
    <ScrollToTop />
    <Switch>
      {/* Always-public pages */}
      <Route path="/go" component={AdLanding} />
      <Route path="/landing" component={Landing} />
      <Route path="/blog" component={BlogIndex} />
      <Route path="/blog/why-indians-fail-retirement" component={Blog1} />
      <Route path="/blog/nps-vs-ppf-vs-sip" component={Blog2} />
      <Route path="/blog/real-estate-rich-retirement-illusion" component={Blog3} />
      <Route path="/blog/how-much-to-retire-india" component={Blog4} />
      <Route path="/blog/retirement-corpus-calculator-india-serious-planners" component={Blog5} />
      <Route path="/blog/nps-vs-ups-vs-ops-which-is-better" component={Blog6} />
      <Route path="/blog/how-much-money-to-retire-in-india" component={Blog7} />
      <Route path="/blog/retirement-planning-self-employed-india" component={Blog8} />
      <Route path="/blog/nps-withdrawal-rules-2026" component={Blog9} />
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
          <Route path="/subscribers" component={SubscribersAdmin} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
    <BlogSubscribePopup />
    </>
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
