import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUpdateScenario, getListScenariosQueryKey, getGetScenarioQueryKey } from "@workspace/api-client-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Edit, Save, X } from "lucide-react";

interface AssumptionsPanelProps {
  scenario: {
    id: string;
    assumptions?: {
      inflationHeadline?: string | null;
      inflationEdu?: string | null;
      inflationHealth?: string | null;
      returnPre?: string | null;
      returnPost?: string | null;
      lifeExpectancy?: number | null;
      source?: string | null;
    } | null;
    assets?: Array<{
      id: string;
      expectedReturnPre?: string | null;
      monthlyContribution?: string | null;
    }>;
  };
  /** CRM-level defaults; taxRegime lives here, not in the assumptions table. */
  crmDefaults?: {
    taxRegime?: string | null;
  } | null;
}

export default function AssumptionsPanel({ scenario, crmDefaults }: AssumptionsPanelProps) {
  const assumptions = scenario.assumptions;
  const epfAsset = scenario.assets?.find(asset => asset.id === 'epf' || asset.id.startsWith('epf:'));
  const npsAsset = scenario.assets?.find(asset => asset.id === 'nps' || asset.id.startsWith('nps:'));
  const otherAsset = scenario.assets?.find(asset =>
    asset.id !== 'epf' && !asset.id.startsWith('epf:') &&
    asset.id !== 'nps' && !asset.id.startsWith('nps:')
  );
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    inflationHeadline: assumptions?.inflationHeadline || '6.0',
    inflationEdu: assumptions?.inflationEdu || '8.0',
    returnPre: assumptions?.returnPre || '10.0',
    returnPost: assumptions?.returnPost || '7.0',
    lifeExpectancy: assumptions?.lifeExpectancy || 85,
  });
  const [assetEditValues, setAssetEditValues] = useState({
    otherReturn: otherAsset?.expectedReturnPre || assumptions?.returnPre || '10.0',
    epfReturn: epfAsset?.expectedReturnPre || '8.0',
    epfContribution: epfAsset?.monthlyContribution || '0',
    npsReturn: npsAsset?.expectedReturnPre || '10.0',
    npsContribution: npsAsset?.monthlyContribution || '0',
  });

  const updateAssumptionsMutation = useUpdateScenario({
    mutation: {
      onSuccess: () => {
        // Invalidate the individual scenario (plan dashboard) and the calc cache.
        // Use the generated key so it matches the dashboard's useGetScenario query.
        queryClient.invalidateQueries({ queryKey: getGetScenarioQueryKey(scenario.id) });
        queryClient.invalidateQueries({ queryKey: ["/api/calc", scenario.id] });
        // Also invalidate the scenarios list so the home-page plan card
        // picks up the freshly recalculated projectedCorpus from the server.
        queryClient.invalidateQueries({ queryKey: getListScenariosQueryKey() });
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
    },
  });

  const handleSave = () => {
    const rates = [assetEditValues.otherReturn, assetEditValues.epfReturn, assetEditValues.npsReturn];
    const contributions = [assetEditValues.epfContribution, assetEditValues.npsContribution];
    const invalidRate = rates.some(value => value.trim() === '' || Number(value) < 0 || Number(value) > 30);
    const invalidContribution = contributions.some(value =>
      value.trim() === '' || Number(value) < 0 || Number(value) > 100000000
    );

    if (invalidRate || invalidContribution) {
      toast({
        title: "Check asset settings",
        description: "Returns must be 0–30%, and monthly contributions must be between ₹0 and ₹10 crore.",
        variant: "destructive",
      });
      return;
    }

    updateAssumptionsMutation.mutate({
      id: scenario.id,
      data: {
        assumptions: {
          ...assumptions,
          ...editValues,
          source: 'user',
        },
        assets: [
          {
            id: otherAsset?.id,
            bucket: 'other',
            expectedReturnPre: assetEditValues.otherReturn,
          },
          {
            id: epfAsset?.id,
            bucket: 'epf',
            expectedReturnPre: assetEditValues.epfReturn,
            monthlyContribution: assetEditValues.epfContribution,
          },
          {
            id: npsAsset?.id,
            bucket: 'nps',
            expectedReturnPre: assetEditValues.npsReturn,
            monthlyContribution: assetEditValues.npsContribution,
          },
        ],
      },
    });
  };

  const handleCancel = () => {
    setEditValues({
      inflationHeadline: assumptions?.inflationHeadline || '6.0',
      inflationEdu: assumptions?.inflationEdu || '8.0',
      returnPre: assumptions?.returnPre || '10.0',
      returnPost: assumptions?.returnPost || '7.0',
      lifeExpectancy: assumptions?.lifeExpectancy || 85,
    });
    setAssetEditValues({
      otherReturn: otherAsset?.expectedReturnPre || assumptions?.returnPre || '10.0',
      epfReturn: epfAsset?.expectedReturnPre || '8.0',
      epfContribution: epfAsset?.monthlyContribution || '0',
      npsReturn: npsAsset?.expectedReturnPre || '10.0',
      npsContribution: npsAsset?.monthlyContribution || '0',
    });
    setIsEditing(false);
  };

  const formatPercentage = (value: string | null | undefined, defaultValue: string) => {
    if (!value) return `${defaultValue}%`;
    return `${parseFloat(value).toFixed(1)}%`;
  };

  const isFromCrm = (source?: string | null) => source === 'crm' || !source;

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
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="20"
                    value={editValues.inflationEdu}
                    onChange={(e) => setEditValues(prev => ({ ...prev, inflationEdu: e.target.value }))}
                    className="w-20 h-8 text-right"
                    data-testid="input-inflation-edu"
                  />
                  <span className="text-sm">%</span>
                </div>
              ) : (
                <>
                  <span className="text-sm font-medium" data-testid="assumption-inflation-edu">
                    {formatPercentage(assumptions?.inflationEdu, '8.0')}
                  </span>
                  <span className="text-xs text-slate-400 block">
                    {isFromCrm(assumptions?.source) ? '(from CRM)' : '(user set)'}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Return (Pre-retirement)</span>
            <div className="text-right">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="30"
                    value={editValues.returnPre}
                    onChange={(e) => setEditValues(prev => ({ ...prev, returnPre: e.target.value }))}
                    className="w-20 h-8 text-right"
                    data-testid="input-return-pre"
                  />
                  <span className="text-sm">%</span>
                </div>
              ) : (
                <>
                  <span className="text-sm font-medium" data-testid="assumption-return-pre">
                    {formatPercentage(assumptions?.returnPre, '10.0')}
                  </span>
                  <span className="text-xs text-blue-600 block">
                    {isFromCrm(assumptions?.source) ? '(from CRM)' : '(user set)'}
                  </span>
                </>
              )}
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
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="1"
                    min="60"
                    max="120"
                    value={editValues.lifeExpectancy}
                    onChange={(e) => setEditValues(prev => ({ ...prev, lifeExpectancy: parseInt(e.target.value) || 85 }))}
                    className="w-20 h-8 text-right"
                    data-testid="input-life-expectancy"
                  />
                  <span className="text-sm">years</span>
                </div>
              ) : (
                <>
                  <span className="text-sm font-medium" data-testid="assumption-life-expectancy">
                    {assumptions?.lifeExpectancy || 85} years
                  </span>
                  <span className="text-xs text-slate-400 block">
                    {isFromCrm(assumptions?.source) ? '(from CRM)' : '(user set)'}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="mb-3 text-sm font-semibold text-slate-800">Asset growth &amp; contributions</p>
            <div className="space-y-4">
              <AssetSettingRow
                label="Other Investments"
                isEditing={isEditing}
                returnValue={assetEditValues.otherReturn}
                onReturnChange={(value) => setAssetEditValues(prev => ({ ...prev, otherReturn: value }))}
                testId="other-investments"
              />
              <AssetSettingRow
                label="EPF"
                isEditing={isEditing}
                returnValue={assetEditValues.epfReturn}
                contributionValue={assetEditValues.epfContribution}
                onReturnChange={(value) => setAssetEditValues(prev => ({ ...prev, epfReturn: value }))}
                onContributionChange={(value) => setAssetEditValues(prev => ({ ...prev, epfContribution: value }))}
                testId="epf"
              />
              <AssetSettingRow
                label="NPS"
                isEditing={isEditing}
                returnValue={assetEditValues.npsReturn}
                contributionValue={assetEditValues.npsContribution}
                onReturnChange={(value) => setAssetEditValues(prev => ({ ...prev, npsReturn: value }))}
                onContributionChange={(value) => setAssetEditValues(prev => ({ ...prev, npsContribution: value }))}
                testId="nps"
              />
            </div>
          </div>

          {/* Tax Regime — read-only; lives in CRM defaults, not in the assumptions table */}
          <div className="flex justify-between items-center border-t pt-4 mt-2">
            <span className="text-sm text-slate-600">Tax Regime</span>
            <div className="text-right">
              <span className="text-sm font-medium" data-testid="assumption-tax-regime">
                {crmDefaults?.taxRegime === 'old' ? 'Old Regime' : 'New Regime'}
              </span>
              <span className="text-xs text-slate-400 block">
                (controlled via CRM Settings)
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface AssetSettingRowProps {
  label: string;
  isEditing: boolean;
  returnValue: string;
  contributionValue?: string;
  onReturnChange: (value: string) => void;
  onContributionChange?: (value: string) => void;
  testId: string;
}

function AssetSettingRow({
  label,
  isEditing,
  returnValue,
  contributionValue,
  onReturnChange,
  onContributionChange,
  testId,
}: AssetSettingRowProps) {
  if (!isEditing) {
    return (
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm text-slate-600">{label}</span>
        <div className="text-right">
          <span className="text-sm font-medium" data-testid={`asset-${testId}-return`}>
            {Number(returnValue).toFixed(1)}% return
          </span>
          {contributionValue !== undefined && (
            <span className="block text-xs text-slate-500" data-testid={`asset-${testId}-contribution`}>
              ₹{Number(contributionValue).toLocaleString('en-IN')}/month
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <p className="mb-2 text-sm font-medium text-slate-700">{label}</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="text-xs text-slate-600">
          Expected return (%)
          <Input
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            max="30"
            value={returnValue}
            onChange={(event) => onReturnChange(event.target.value)}
            className="mt-1 h-8"
            data-testid={`input-${testId}-return`}
          />
        </label>
        {contributionValue !== undefined && onContributionChange && (
          <label className="text-xs text-slate-600">
            Monthly contribution (₹)
            <Input
              type="number"
              inputMode="decimal"
              step="100"
              min="0"
              max="100000000"
              value={contributionValue}
              onChange={(event) => onContributionChange(event.target.value)}
              className="mt-1 h-8"
              data-testid={`input-${testId}-contribution`}
            />
          </label>
        )}
      </div>
    </div>
  );
}
