import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Edit, Save, X } from "lucide-react";

interface AssumptionsPanelProps {
  scenario: {
    id: string;
    assumptions?: {
      inflationHeadline?: string;
      inflationEdu?: string;
      inflationHealth?: string;
      returnPre?: string;
      returnPost?: string;
      lifeExpectancy?: number;
      taxRegime?: string;
      source?: string;
    };
  };
}

export default function AssumptionsPanel({ scenario }: AssumptionsPanelProps) {
  const assumptions = scenario.assumptions;
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    inflationHeadline: assumptions?.inflationHeadline || '6.0',
    returnPost: assumptions?.returnPost || '7.0',
  });

  const updateAssumptionsMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PATCH", `/api/scenarios/${scenario.id}`, {
        assumptions: {
          ...assumptions,
          ...data,
          source: 'user'
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scenarios", scenario.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/calc", scenario.id] });
      toast({
        title: "Assumptions Updated",
        description: "Investment assumptions have been updated successfully.",
      });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update assumptions. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateAssumptionsMutation.mutate(editValues);
  };

  const handleCancel = () => {
    setEditValues({
      inflationHeadline: assumptions?.inflationHeadline || '6.0',
      returnPost: assumptions?.returnPost || '7.0',
    });
    setIsEditing(false);
  };

  const formatPercentage = (value: string | undefined, defaultValue: string) => {
    if (!value) return `${defaultValue}%`;
    return `${parseFloat(value).toFixed(1)}%`;
  };

  const isFromCrm = (source?: string) => source === 'crm' || !source;

  return (
    <Card data-testid="assumptions-panel">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Active Assumptions</CardTitle>
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              data-testid="button-edit-assumptions"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                data-testid="button-cancel-edit"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={updateAssumptionsMutation.isPending}
                data-testid="button-save-assumptions"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Inflation (General)</span>
            <div className="text-right">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="20"
                    value={editValues.inflationHeadline}
                    onChange={(e) => setEditValues(prev => ({ ...prev, inflationHeadline: e.target.value }))}
                    className="w-20 h-8 text-right"
                    data-testid="input-inflation-headline"
                  />
                  <span className="text-sm">%</span>
                </div>
              ) : (
                <>
                  <span className="text-sm font-medium" data-testid="assumption-inflation-headline">
                    {formatPercentage(assumptions?.inflationHeadline, '6.0')}
                  </span>
                  <span className="text-xs text-slate-400 block">
                    {isFromCrm(assumptions?.source) ? '(from CRM)' : '(user set)'}
                  </span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Education Inflation</span>
            <div className="text-right">
              <span className="text-sm font-medium" data-testid="assumption-inflation-edu">
                {formatPercentage(assumptions?.inflationEdu, '8.0')}
              </span>
              <span className="text-xs text-slate-400 block">
                {isFromCrm(assumptions?.source) ? '(from CRM)' : '(user set)'}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Return (Pre-retirement)</span>
            <div className="text-right">
              <span className="text-sm font-medium" data-testid="assumption-return-pre">
                {formatPercentage(assumptions?.returnPre, '10.0')}
              </span>
              <span className="text-xs text-blue-600 block">
                {isFromCrm(assumptions?.source) ? '(from CRM)' : '(user set)'}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Return (Post-retirement)</span>
            <div className="text-right">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="30"
                    value={editValues.returnPost}
                    onChange={(e) => setEditValues(prev => ({ ...prev, returnPost: e.target.value }))}
                    className="w-20 h-8 text-right"
                    data-testid="input-return-post"
                  />
                  <span className="text-sm">%</span>
                </div>
              ) : (
                <>
                  <span className="text-sm font-medium" data-testid="assumption-return-post">
                    {formatPercentage(assumptions?.returnPost, '7.0')}
                  </span>
                  <span className="text-xs text-slate-400 block">
                    {isFromCrm(assumptions?.source) ? '(from CRM)' : '(user set)'}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Life Expectancy</span>
            <div className="text-right">
              <span className="text-sm font-medium" data-testid="assumption-life-expectancy">
                {assumptions?.lifeExpectancy || 85} years
              </span>
              <span className="text-xs text-slate-400 block">
                {isFromCrm(assumptions?.source) ? '(from CRM)' : '(user set)'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
