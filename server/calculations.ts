interface ScenarioData {
  id: string;
  name: string;
  mode: string;
  assumptions: any;
  householdMembers: any[];
  incomeItems: any[];
  expenseItems: any[];
  goals: any[];
  assets: any[];
  liabilities: any[];
  miniRetirements: any[];
}

interface CalculationResult {
  netWorthSeries: { year: number; value: number }[];
  cashflowSeries: { year: number; income: number; expenses: number; emi: number; surplus: number }[];
  markers: { year: number; type: string; label: string }[];
  summary: {
    requiredCorpusAtRetirement: number;
    projectedCorpusAtRetirement: number;
    gap: number;
    retirementYear: number;
  };
}

export async function calculateRetirementPlan(scenarioData: ScenarioData): Promise<CalculationResult> {
  const currentYear = new Date().getFullYear();
  const assumptions = scenarioData.assumptions || {};
  
  // Parse assumptions with defaults
  const inflationHeadline = parseFloat(assumptions.inflationHeadline || '6.0') / 100;
  const inflationEdu = parseFloat(assumptions.inflationEdu || '8.0') / 100;
  const returnPre = parseFloat(assumptions.returnPre || '10.0') / 100;
  const returnPost = parseFloat(assumptions.returnPost || '7.0') / 100;
  const lifeExpectancy = parseInt(assumptions.lifeExpectancy || '85');

  // Find self to determine retirement year
  const self = scenarioData.householdMembers.find(m => m.relation === 'self');
  const birthYear = self?.dob ? new Date(self.dob).getFullYear() : currentYear - 35;
  const currentAge = currentYear - birthYear;
  const retirementAge = 60; // Default retirement age
  const retirementYear = birthYear + retirementAge;

  // Calculate current financial position
  const totalAssets = scenarioData.assets.reduce((sum, asset) => 
    sum + parseFloat(asset.value || '0'), 0);
  
  const monthlyIncome = scenarioData.incomeItems.reduce((sum, income) => {
    const amount = parseFloat(income.amount || '0');
    return sum + (income.frequency === 'annual' ? amount / 12 : amount);
  }, 0);

  const monthlyExpenses = scenarioData.expenseItems.reduce((sum, expense) => 
    sum + parseFloat(expense.amountMonthly || '0'), 0);

  const monthlyEMI = scenarioData.liabilities.reduce((sum, liability) => 
    sum + parseFloat(liability.emi || '0'), 0);

  const monthlySurplus = monthlyIncome - monthlyExpenses - monthlyEMI;

  // Build year-by-year projections
  const netWorthSeries: { year: number; value: number }[] = [];
  const cashflowSeries: { year: number; income: number; expenses: number; emi: number; surplus: number }[] = [];
  const markers: { year: number; type: string; label: string }[] = [];

  let currentNetWorth = totalAssets;
  
  // Add goal markers
  scenarioData.goals.forEach(goal => {
    const targetYear = parseInt(goal.targetYear);
    let markerType = 'other';
    let label = goal.kind;
    
    if (goal.kind === 'child_edu') {
      markerType = 'education';
      label = 'Child Education';
    } else if (goal.kind === 'child_marriage') {
      markerType = 'marriage';
      label = 'Child Marriage';
    }
    
    markers.push({
      year: targetYear,
      type: markerType,
      label,
    });
  });

  // Add mini retirement markers
  scenarioData.miniRetirements.forEach(mini => {
    markers.push({
      year: parseInt(mini.start),
      type: 'mini',
      label: `Mini Retirement (${mini.months} months)`,
    });
  });

  // Add retirement marker
  markers.push({
    year: retirementYear,
    type: 'retirement',
    label: 'Retirement',
  });

  // Calculate projections year by year
  for (let year = currentYear; year <= lifeExpectancy + birthYear; year++) {
    const yearsFromNow = year - currentYear;
    
    // Adjust for inflation
    const inflatedExpenses = monthlyExpenses * Math.pow(1 + inflationHeadline, yearsFromNow) * 12;
    
    let yearlyIncome = monthlyIncome * 12;
    let yearlyEMI = monthlyEMI * 12;
    
    // Stop income and EMI at retirement
    if (year >= retirementYear) {
      yearlyIncome = 0;
      yearlyEMI = 0;
    }
    
    // Calculate goals impact
    let goalExpenses = 0;
    scenarioData.goals.forEach(goal => {
      if (parseInt(goal.targetYear) === year) {
        const todaysCost = parseFloat(goal.todaysCost || '0');
        const inflationRate = goal.inflationCategory === 'education' ? inflationEdu : inflationHeadline;
        const futureValue = todaysCost * Math.pow(1 + inflationRate, yearsFromNow);
        goalExpenses += futureValue;
      }
    });

    const totalExpenses = inflatedExpenses + goalExpenses;
    const surplus = yearlyIncome - totalExpenses - yearlyEMI;
    
    // Apply investment returns
    const returnRate = year < retirementYear ? returnPre : returnPost;
    currentNetWorth = currentNetWorth * (1 + returnRate) + surplus;
    
    // Ensure net worth doesn't go negative
    currentNetWorth = Math.max(currentNetWorth, 0);

    netWorthSeries.push({
      year,
      value: Math.round(currentNetWorth),
    });

    cashflowSeries.push({
      year,
      income: Math.round(yearlyIncome),
      expenses: Math.round(totalExpenses),
      emi: Math.round(yearlyEMI),
      surplus: Math.round(surplus),
    });
  }

  // Calculate required corpus at retirement
  const retirementExpenses = monthlyExpenses * Math.pow(1 + inflationHeadline, retirementYear - currentYear) * 12;
  const requiredCorpusAtRetirement = retirementExpenses / returnPost; // Simple calculation
  
  // Get projected corpus at retirement
  const retirementData = netWorthSeries.find(item => item.year === retirementYear);
  const projectedCorpusAtRetirement = retirementData?.value || 0;
  
  const gap = Math.max(0, requiredCorpusAtRetirement - projectedCorpusAtRetirement);

  return {
    netWorthSeries,
    cashflowSeries,
    markers,
    summary: {
      requiredCorpusAtRetirement: Math.round(requiredCorpusAtRetirement),
      projectedCorpusAtRetirement: Math.round(projectedCorpusAtRetirement),
      gap: Math.round(gap),
      retirementYear,
    },
  };
}
