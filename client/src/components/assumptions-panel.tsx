import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AssumptionsPanelProps {
  scenario: {
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

  const formatPercentage = (value: string | undefined, defaultValue: string) => {
    if (!value) return `${defaultValue}%`;
    return `${parseFloat(value).toFixed(1)}%`;
  };

  const isFromCrm = (source?: string) => source === 'crm' || !source;

  return (
    <Card data-testid="assumptions-panel">
      <CardHeader>
        <CardTitle>Active Assumptions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Inflation (General)</span>
            <div className="text-right">
              <span className="text-sm font-medium" data-testid="assumption-inflation-headline">
                {formatPercentage(assumptions?.inflationHeadline, '6.0')}
              </span>
              <span className="text-xs text-slate-400 block">
                {isFromCrm(assumptions?.source) ? '(from CRM)' : '(user set)'}
              </span>
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
              <span className="text-sm font-medium" data-testid="assumption-return-post">
                {formatPercentage(assumptions?.returnPost, '7.0')}
              </span>
              <span className="text-xs text-slate-400 block">
                {isFromCrm(assumptions?.source) ? '(from CRM)' : '(user set)'}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Life Expectancy</span>
            <div className="text-right">
              <span className="text-sm font-medium" data-testid="assumption-life-expectancy">
                {assumptions?.lifeExpectancy || 'Consider general'} {assumptions?.lifeExpectancy ? 'years' : ''}
              </span>
              <span className="text-xs text-slate-400 block">
                {assumptions?.lifeExpectancy ? (isFromCrm(assumptions?.source) ? '(from CRM)' : '(user set)') : '(recommended)'}
              </span>
            </div>
          </div>
        </div>

        <Button 
          variant="outline" 
          className="w-full mt-6"
          data-testid="button-edit-assumptions"
        >
          Edit Assumptions
        </Button>
      </CardContent>
    </Card>
  );
}
