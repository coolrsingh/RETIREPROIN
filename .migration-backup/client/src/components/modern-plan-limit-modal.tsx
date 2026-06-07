import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, Sparkles, Crown, Zap } from "lucide-react";

interface ModernPlanLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModernPlanLimitModal({ isOpen, onClose }: ModernPlanLimitModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden" data-testid="modal-plan-limit">
        <DialogTitle className="sr-only">Upgrade to Premium</DialogTitle>
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-3 rounded-full">
              <Crown className="h-8 w-8" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">You've reached your plan limit!</h2>
          <p className="text-blue-100 text-lg">
            Unlock unlimited retirement plans with <span className="font-semibold">Premium</span>
          </p>
        </div>

        {/* Content Section */}
        <div className="p-8">
          {/* Current Status */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Zap className="h-5 w-5 text-orange-600 mr-3" />
              <div>
                <h3 className="font-semibold text-orange-800">Free Plan: 10/10 Plans Used</h3>
                <p className="text-orange-600 text-sm">You've created the maximum number of retirement plans on the free tier.</p>
              </div>
            </div>
          </div>

          {/* Premium Benefits */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Sparkles className="h-5 w-5 text-yellow-500 mr-2" />
                  Premium Benefits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />
                  <span className="text-sm">Unlimited retirement plans</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />
                  <span className="text-sm">Advanced portfolio analysis</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />
                  <span className="text-sm">Priority customer support</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />
                  <span className="text-sm">Export to PDF (unlimited)</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-blue-800">Premium Pricing</CardTitle>
                  <Badge className="bg-blue-600">Best Value</Badge>
                </div>
                <CardDescription className="text-blue-600">Simple, transparent pricing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-800 mb-1">₹2</div>
                  <div className="text-sm text-blue-600 mb-4">per additional plan</div>
                  <p className="text-xs text-blue-500">
                    No monthly fees • Pay only when you need more plans
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              size="lg" 
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              onClick={() => {
                // In real implementation, redirect to payment
                alert("Premium upgrade coming soon! Contact support for early access.");
                onClose();
              }}
              data-testid="button-upgrade-premium"
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Premium
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={onClose}
              data-testid="button-maybe-later"
            >
              Maybe Later
            </Button>
          </div>

          {/* Footer Note */}
          <div className="text-center mt-6 pt-4 border-t">
            <p className="text-xs text-gray-500">
              Questions about premium? Contact us at <span className="text-blue-600">support@retirepro.com</span>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}