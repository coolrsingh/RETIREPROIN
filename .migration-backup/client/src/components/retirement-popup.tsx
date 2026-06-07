import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, AlertTriangle, TrendingDown, Clock, ArrowRight } from 'lucide-react';

interface RetirementPopupProps {
  onClose: () => void;
  onCreatePlan: () => void;
}

export function RetirementPopup({ onClose, onCreatePlan }: RetirementPopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
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
      <DialogContent className="max-w-lg p-0 gap-0 bg-white border border-slate-200 shadow-xl" data-testid="dialog-retirement-popup">
        <DialogTitle className="sr-only">Retirement Planning Alert</DialogTitle>
        <div className="relative">
          {/* Header */}
          <div className="bg-primary-600 text-white p-5 text-center rounded-t-lg relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 text-white hover:bg-primary-700/50"
              onClick={handleClose}
              data-testid="button-close-popup"
            >
              <X className="h-4 w-4" />
            </Button>
            <AlertTriangle className="h-8 w-8 mx-auto mb-3 text-white opacity-90" />
            <h2 className="text-xl font-bold mb-1" data-testid="text-popup-headline">
              The Reality of Indian Retirement Planning
            </h2>
            <p className="text-primary-100 text-sm">Are you prepared for what lies ahead?</p>
          </div>

          {/* Content */}
          <div className="p-5 space-y-4">
            {/* Statistics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="text-2xl font-bold text-primary-600 mb-1">77%</div>
                <div className="text-xs text-slate-600">of Indians have no retirement plan</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="text-2xl font-bold text-primary-600 mb-1">57%</div>
                <div className="text-xs text-slate-600">expect savings to run out within 10 years</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="text-2xl font-bold text-primary-600 mb-1">30%</div>
                <div className="text-xs text-slate-600">fear running out in just 5 years</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="text-2xl font-bold text-primary-600 mb-1">40%</div>
                <div className="text-xs text-slate-600">don't invest for retirement at all</div>
              </div>
            </div>

            {/* Risk Factors */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h4 className="font-semibold text-slate-800 mb-2 flex items-center text-sm">
                <TrendingDown className="h-4 w-4 mr-2 text-primary-600" />
                Without a plan, you risk:
              </h4>
              <ul className="space-y-1 text-xs text-slate-600">
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2 mt-0.5">•</span>
                  Lifestyle downgrade and dependence on family
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2 mt-0.5">•</span>
                  Medical costs wiping out your savings
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2 mt-0.5">•</span>
                  Working well into your 70s — not by choice
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2 mt-0.5">•</span>
                  Lakhs lost in compounding by starting late
                </li>
              </ul>
            </div>

            {/* Urgency Message */}
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-center mb-1">
                <Clock className="h-4 w-4 mr-2 text-primary-600" />
                <span className="font-semibold text-primary-800 text-sm">Every year you delay, you pay more</span>
              </div>
              <p className="text-xs text-slate-600">
                Starting early is the single most powerful financial decision you can make.
              </p>
            </div>

            {/* CTA Section */}
            <div className="text-center pt-1">
              <Button
                onClick={handleCreatePlan}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 text-sm font-semibold rounded-lg shadow-md w-full"
                data-testid="button-create-plan"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Start Your Retirement Plan — It's Free
              </Button>
              <p className="text-xs text-slate-400 mt-2">
                No credit card required · Takes under 2 minutes
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
