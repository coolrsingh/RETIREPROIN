import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartLine, Zap, FileText, Shield } from "lucide-react";
import { RetirementPopup } from "@/components/retirement-popup";

export default function Landing() {
  const [showPopup, setShowPopup] = useState(true);

  const handleCreatePlan = () => {
    window.location.href = '/api/login';
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <ChartLine className="text-primary-600 h-8 w-8" />
              <span className="text-xl font-bold text-slate-800">RetirePro</span>
            </div>
            <Button onClick={() => window.location.href = '/api/login'} data-testid="button-login">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            Smart Retirement Planning
            <span className="text-primary-600 block">Made Simple</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Create your personalized retirement plan in under 60 seconds. 
            Get professional insights, visualize your financial future, and 
            make informed decisions for a secure retirement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-primary-600 hover:bg-primary-700 text-lg px-8 py-3"
              onClick={() => window.location.href = '/api/login'}
              data-testid="button-get-started"
            >
              <Zap className="mr-2 h-5 w-5" />
              Create Quick Plan
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-3"
              data-testid="button-learn-more"
            >
              <FileText className="mr-2 h-5 w-5" />
              Learn More
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Zap className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <CardTitle>Quick Plan</CardTitle>
              <CardDescription>
                Get your retirement plan ready in under 60 seconds with smart defaults
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-slate-600 space-y-2">
                <li>• Minimal inputs required</li>
                <li>• Research-backed assumptions</li>
                <li>• Instant visualizations</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <ChartLine className="h-12 w-12 text-success-600 mx-auto mb-4" />
              <CardTitle>Visual Projections</CardTitle>
              <CardDescription>
                See your net worth growth with life event markers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-slate-600 space-y-2">
                <li>• Interactive charts</li>
                <li>• Life event tracking</li>
                <li>• Gap analysis</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 text-amber-600 mx-auto mb-4" />
              <CardTitle>Professional Insights</CardTitle>
              <CardDescription>
                India-specific planning with professional assumptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-slate-600 space-y-2">
                <li>• Inflation-adjusted planning</li>
                <li>• Tax regime considerations</li>
                <li>• PDF export available</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-primary-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Secure Your Future?</h2>
          <p className="text-primary-100 mb-6 text-lg">
            Join thousands of Indians who have already started their retirement planning journey
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="bg-white text-primary-600 hover:bg-primary-50 text-lg px-8 py-3"
            onClick={() => window.location.href = '/api/login'}
            data-testid="button-start-planning"
          >
            Start Planning Now
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <ChartLine className="h-6 w-6" />
              <span className="text-lg font-bold">RetirePro</span>
            </div>
            <p className="text-slate-400">
              © 2024 RetirePro. Professional retirement planning made accessible.
            </p>
          </div>
        </div>
      </footer>

      {/* Retirement Planning Popup */}
      {showPopup && (
        <RetirementPopup 
          onClose={handleClosePopup}
          onCreatePlan={handleCreatePlan}
        />
      )}
    </div>
  );
}
