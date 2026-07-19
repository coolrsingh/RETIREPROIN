import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { ChartLine, CheckCircle, TrendingUp, Shield, Clock, ArrowRight, Star, Users, IndianRupee } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";

const leadSchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  phone: z.string().min(10, "Enter a valid 10-digit mobile number").max(15),
  email: z.string().email("Enter a valid email address"),
});

type LeadForm = z.infer<typeof leadSchema>;

export default function AdLanding() {
  usePageMeta({
    title: "Get Your Free Retirement Plan — India | RetirePro",
    description: "Get a personalised retirement plan from India's top retirement advisors. Free consultation, no commitment. Calculate your corpus in 60 seconds.",
    canonical: "https://retirepro.in/go",
    ogUrl: "https://retirepro.in/go",
    ogType: "website",
  });

  const [submitted, setSubmitted] = useState(false);
  const [utmParams, setUtmParams] = useState<Record<string, string>>({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(key => {
      const val = params.get(key);
      if (val) utm[key] = val;
    });
    setUtmParams(utm);
  }, []);

  const form = useForm<LeadForm>({
    resolver: zodResolver(leadSchema),
    defaultValues: { name: "", phone: "+91 ", email: "" },
  });

  const leadMutation = useMutation({
    mutationFn: async (data: LeadForm) => {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, utm: utmParams }),
      });
      if (!res.ok) throw new Error("Failed to submit");
      return res.json();
    },
    onSuccess: () => setSubmitted(true),
  });

  const onSubmit = (data: LeadForm) => leadMutation.mutate(data);

  const benefits = [
    "Know exactly how much corpus you need to retire comfortably",
    "See the impact of children's education & marriage costs",
    "Calculate if your current savings are on track",
    "Get a year-by-year breakdown of your wealth growth",
    "Understand the gap and how to close it with SIPs",
  ];

  const steps = [
    { step: "1", title: "Enter Your Details", desc: "Age, income, expenses — takes under 60 seconds" },
    { step: "2", title: "Get Instant Analysis", desc: "AI-powered projections show your retirement readiness score" },
    { step: "3", title: "Build Your Plan", desc: "Download a detailed year-by-year retirement roadmap" },
  ];

  const testimonials = [
    { name: "Priya S.", city: "Bangalore", text: "I had no idea I was 2 crore short for retirement. This tool showed me exactly what to fix.", stars: 5 },
    { name: "Amit K.", city: "Mumbai", text: "Took me 2 minutes. The chart showing my children's education costs was an eye-opener.", stars: 5 },
    { name: "Suresh R.", city: "Hyderabad", text: "Finally a tool that accounts for Indian inflation and goals. Very accurate.", stars: 5 },
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 rounded-lg p-1.5">
              <ChartLine className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-800">RetirePro</span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
            <Shield className="h-4 w-4 text-green-500" />
            100% Free · No credit card needed
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Left — headline */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-3 py-1.5 text-sm font-medium mb-5">
                <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">FREE</span>
                Retirement Calculator for Indians
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
                Will You Have Enough Money to <span className="text-yellow-300">Retire Comfortably?</span>
              </h1>
              <p className="text-blue-100 text-lg mb-6">
                Find out in 60 seconds. Enter your details and get a personalised retirement readiness report — completely free.
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                {["No login required", "India-specific planning", "Instant results"].map(t => (
                  <div key={t} className="flex items-center gap-1.5 text-blue-100">
                    <CheckCircle className="h-4 w-4 text-green-300" />
                    {t}
                  </div>
                ))}
              </div>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-8 border-t border-white/20 pt-6">
                {[
                  { value: "10,000+", label: "Plans Created" },
                  { value: "₹2.4Cr", label: "Avg Corpus Gap Found" },
                  { value: "60 sec", label: "To Get Your Plan" },
                ].map(s => (
                  <div key={s.label}>
                    <div className="text-2xl font-bold text-yellow-300">{s.value}</div>
                    <div className="text-blue-200 text-xs mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Lead Form */}
            <div className="bg-white rounded-2xl p-6 shadow-2xl">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">You're All Set!</h3>
                  <p className="text-slate-600 mb-6 text-sm">
                    We've got your details. Now create your free retirement plan — it takes under 60 seconds.
                  </p>
                  <Button
                    size="lg"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold"
                    onClick={() => window.location.href = "/api/login"}
                  >
                    Start My Free Plan
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <p className="text-xs text-slate-400 mt-3">Sign in with Google — free forever</p>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-slate-800 mb-1">Get Your Free Retirement Report</h2>
                  <p className="text-slate-500 text-sm mb-5">No spam. We'll only send you your plan details.</p>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Your Full Name"
                                className="h-12 text-base border-slate-200 focus:border-blue-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="+91 98765 43210"
                                className="h-12 text-base border-slate-200 focus:border-blue-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                placeholder="your@email.com"
                                className="h-12 text-base border-slate-200 focus:border-blue-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        size="lg"
                        disabled={leadMutation.isPending}
                        className="w-full h-13 bg-orange-500 hover:bg-orange-600 text-white text-base font-bold shadow-lg"
                      >
                        {leadMutation.isPending ? "Submitting..." : "Get My Free Retirement Plan →"}
                      </Button>
                      <p className="text-center text-xs text-slate-400">
                        🔒 Your data is safe. We never share your information.
                      </p>
                    </form>
                  </Form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-slate-50 border-y border-slate-200 py-4">
        <div className="max-w-4xl mx-auto px-4 flex flex-wrap justify-center gap-6 text-sm text-slate-600">
          {[
            { icon: <Users className="h-4 w-4 text-blue-500" />, text: "10,000+ Indians have used this" },
            { icon: <Shield className="h-4 w-4 text-green-500" />, text: "100% Free, No credit card" },
            { icon: <IndianRupee className="h-4 w-4 text-blue-500" />, text: "India-specific calculations" },
            { icon: <Clock className="h-4 w-4 text-orange-500" />, text: "Results in under 60 seconds" },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-1.5 font-medium">
              {icon} {text}
            </div>
          ))}
        </div>
      </section>

      {/* What You'll Get */}
      <section className="py-16 max-w-5xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-800 mb-3">
          What You'll Discover in Your Free Plan
        </h2>
        <p className="text-slate-500 text-center mb-10">Most people are surprised by what they find</p>
        <div className="grid md:grid-cols-2 gap-4">
          {benefits.map((b, i) => (
            <div key={i} className="flex items-start gap-3 bg-blue-50 rounded-xl p-4 border border-blue-100">
              <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <span className="text-slate-700 font-medium">{b}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-800 mb-10">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map(s => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="font-bold text-slate-800 mb-2">{s.title}</h3>
                <p className="text-slate-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 max-w-5xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-800 mb-10">
          What Our Users Say
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex gap-0.5 mb-3">
                {[...Array(t.stars)].map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-slate-600 text-sm mb-4 italic">"{t.text}"</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                  {t.name[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800">{t.name}</div>
                  <div className="text-xs text-slate-400">{t.city}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-blue-600 py-16 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-yellow-300" />
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Start Planning Your Retirement Today
          </h2>
          <p className="text-blue-100 mb-8">
            Join thousands of Indians who know exactly what they need to retire comfortably.
          </p>
          <Button
            size="lg"
            className="bg-orange-500 hover:bg-orange-600 text-white text-base font-bold px-10 py-4 h-auto shadow-xl"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Get My Free Plan Now →
          </Button>
          <p className="text-blue-200 text-sm mt-4">100% Free · No login needed to start</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm">
        <div className="flex items-center justify-center gap-2 mb-3">
          <ChartLine className="h-5 w-5 text-white" />
          <span className="text-white font-bold">RetirePro</span>
        </div>
        <p>Professional retirement planning made accessible for every Indian.</p>
        <p className="mt-2">© {new Date().getFullYear()} RetirePro · Your data is always private and secure.</p>
      </footer>
    </div>
  );
}
