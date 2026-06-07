import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Construction, Sparkles, ArrowLeft, Clock, Star } from "lucide-react";
import { Link } from "wouter";

export default function ComingSoonDetailed() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <div className="mb-8">
        <Link href="/">
          <Button variant="outline" size="sm" data-testid="button-back">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Coming Soon Hero */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-br from-orange-100 to-yellow-100 p-4 rounded-full">
            <Construction className="h-12 w-12 text-orange-600" />
          </div>
        </div>
        
        <Badge variant="secondary" className="mb-4 bg-orange-100 text-orange-800">
          <Clock className="h-3 w-3 mr-1" />
          Coming Soon
        </Badge>
        
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Detailed Retirement Plans
        </h1>
        
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          We're building advanced retirement planning features with comprehensive analytics, 
          multi-asset portfolios, and sophisticated goal tracking. Stay tuned!
        </p>
      </div>

      {/* Features Preview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Card className="border-dashed border-2 border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center text-lg text-orange-800">
              <Sparkles className="h-5 w-5 mr-2" />
              Asset Allocation
            </CardTitle>
            <CardDescription>
              Custom allocation across equity, debt, real estate, gold, and cash with individual return expectations
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-dashed border-2 border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center text-lg text-orange-800">
              <Sparkles className="h-5 w-5 mr-2" />
              Joint Planning
            </CardTitle>
            <CardDescription>
              Plan retirement for you and your spouse with coordinated timelines and shared goals
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-dashed border-2 border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center text-lg text-orange-800">
              <Sparkles className="h-5 w-5 mr-2" />
              Goal Tracking
            </CardTitle>
            <CardDescription>
              Track short-term goals like car purchases, vacations, and home improvements with timelines
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-dashed border-2 border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center text-lg text-orange-800">
              <Sparkles className="h-5 w-5 mr-2" />
              Loan Management
            </CardTitle>
            <CardDescription>
              Manage existing loans including home loans, personal loans, and calculate payoff strategies
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-dashed border-2 border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center text-lg text-orange-800">
              <Sparkles className="h-5 w-5 mr-2" />
              Custom Inflation
            </CardTitle>
            <CardDescription>
              Set your own inflation assumptions instead of using fixed defaults for more accurate projections
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-dashed border-2 border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center text-lg text-orange-800">
              <Sparkles className="h-5 w-5 mr-2" />
              Advanced Analytics
            </CardTitle>
            <CardDescription>
              Deep portfolio analysis, stress testing, and Monte Carlo simulations for retirement confidence
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* CTA Section */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Get Notified When It's Ready</h2>
          <p className="text-blue-100 mb-6 text-lg">
            Want early access to detailed retirement planning? Use our Quick Plan for now and get notified when detailed features launch.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/plan?mode=quick">
              <Button size="lg" variant="secondary" className="bg-white text-blue-700 hover:bg-blue-50">
                Try Quick Plan Instead
                <Star className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white/10"
              onClick={() => {
                // In real implementation, this would open an email signup modal
                alert("Email notifications coming soon! For now, check back regularly for updates.");
              }}
            >
              Notify Me When Ready
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center mt-12 pt-8 border-t">
        <p className="text-gray-500">
          Questions about detailed planning? Contact us at <span className="text-blue-600">support@retirepro.com</span>
        </p>
      </div>
    </div>
  );
}