import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, CreditCard } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PlanLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  planCount: number;
}

export default function PlanLimitModal({ isOpen, onClose, planCount }: PlanLimitModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const upgradeMutation = useMutation({
    mutationFn: async () => {
      // In real implementation, this would integrate with payment gateway
      const paymentToken = "dummy_payment_token_for_$2";
      return apiRequest('/api/upgrade/premium', 'POST', { paymentToken });
    },
    onSuccess: () => {
      toast({
        title: "Upgrade Successful!",
        description: "You now have unlimited retirement plans.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Upgrade Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary-600" />
            Plan Limit Reached
          </DialogTitle>
          <DialogDescription>
            You've created {planCount} retirement plans. Upgrade to premium for unlimited plans.
          </DialogDescription>
        </DialogHeader>
        
        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">$2</div>
              <div className="text-slate-600 mb-4">One-time payment for unlimited plans</div>
              
              <div className="space-y-2 text-left mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Unlimited retirement plans</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>PDF export without lead capture</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Priority support</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button 
                  onClick={() => upgradeMutation.mutate()}
                  disabled={upgradeMutation.isPending}
                  className="w-full"
                  data-testid="button-upgrade-premium"
                >
                  {upgradeMutation.isPending ? "Processing..." : "Upgrade to Premium"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  className="w-full"
                  data-testid="button-cancel-upgrade"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}