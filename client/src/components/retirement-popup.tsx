import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, AlertTriangle, TrendingDown, Clock, DollarSign } from 'lucide-react';

interface RetirementPopupProps {
  onClose: () => void;
  onCreatePlan: () => void;
}

export function RetirementPopup({ onClose, onCreatePlan }: RetirementPopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show popup after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleCreatePlan = () => {
    setIsVisible(false);
    onCreatePlan();
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  return (
    <Dialog open={isVisible} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0 gap-0 bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200" data-testid="dialog-retirement-popup">
        <div className="relative">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 text-center">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 text-white hover:bg-red-700/50"
              onClick={handleClose}
              data-testid="button-close-popup"
            >
              <X className="h-4 w-4" />
            </Button>
            <AlertTriangle className="h-8 w-8 mx-auto mb-3 text-yellow-300" />
            <h2 className="text-2xl font-bold mb-2" data-testid="text-popup-headline">
              The Shocking Truth About Indian Retirement Planning
            </h2>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Warning Message */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-red-700 mb-4">
                Don't Let This Be Your Reality
              </h3>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/80 p-4 rounded-lg border border-red-200">
                <div className="text-3xl font-bold text-red-600 mb-1">77%</div>
                <div className="text-sm text-gray-700">of Indians have no retirement plan</div>
              </div>
              <div className="bg-white/80 p-4 rounded-lg border border-red-200">
                <div className="text-3xl font-bold text-red-600 mb-1">57%</div>
                <div className="text-sm text-gray-700">expect savings to run out within 10 years</div>
              </div>
              <div className="bg-white/80 p-4 rounded-lg border border-red-200">
                <div className="text-3xl font-bold text-red-600 mb-1">30%</div>
                <div className="text-sm text-gray-700">fear running out in just 5 years</div>
              </div>
              <div className="bg-white/80 p-4 rounded-lg border border-red-200">
                <div className="text-3xl font-bold text-red-600 mb-1">40%</div>
                <div className="text-sm text-gray-700">don't invest for retirement at all</div>
              </div>
            </div>

            {/* Risk Factors */}
            <div className="bg-white/60 p-5 rounded-lg border border-orange-200">
              <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                <TrendingDown className="h-5 w-5 mr-2 text-red-600" />
                Without a Plan, You Risk:
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Lifestyle downgrade & dependence on family
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Medical costs wiping out your savings
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Working well into your 70s — not because you want to
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  41% higher risk of depression in unplanned retirement
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Lakhs lost in compounding if you start late
                </li>
              </ul>
            </div>

            {/* Urgency Message */}
            <div className="bg-gradient-to-r from-orange-100 to-red-100 p-4 rounded-lg border border-orange-300">
              <div className="flex items-center mb-2">
                <Clock className="h-5 w-5 mr-2 text-orange-600" />
                <span className="font-bold text-orange-800">Every Year You Delay, You Pay</span>
              </div>
              <p className="text-sm text-orange-700">
                The earlier you start, the stronger your future.
              </p>
            </div>

            {/* CTA Section */}
            <div className="text-center pt-4">
              <div className="mb-4">
                <span className="text-green-600 text-lg">✅</span>
                <span className="ml-2 font-semibold text-gray-800">Secure your future.</span>
              </div>
              <Button
                onClick={handleCreatePlan}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                data-testid="button-create-plan"
              >
                <DollarSign className="h-5 w-5 mr-2" />
                Create Your Retirement Plan Now
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Free analysis • No credit card required • Start in 2 minutes
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}