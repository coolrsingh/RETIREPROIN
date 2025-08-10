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
    sipRequired?: number; // Monthly SIP required if there's a gap
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
  
  // Get retirement age from income items or use default
  const salaryIncome = scenarioData.incomeItems.find(i => i.type === 'salary');
  const retirementAge = salaryIncome?.end ? salaryIncome.end - birthYear : 60;
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

  const monthlySavings = monthlyIncome - monthlyExpenses;

  const monthlyEMI = scenarioData.liabilities.reduce((sum, liability) => 
    sum + parseFloat(liability.emi || '0'), 0);

  const monthlySurplus = monthlyIncome - monthlyExpenses - monthlyEMI;

  // Build year-by-year projections
  const netWorthSeries: { year: number; value: number }[] = [];
  const cashflowSeries: { year: number; income: number; expenses: number; emi: number; surplus: number }[] = [];
  const markers: { year: number; type: string; label: string }[] = [];

  let currentNetWorth = totalAssets;
  
  // Add children education and marriage markers individually
  scenarioData.householdMembers
    .filter(member => member.relation === 'child')
    .forEach((child, index) => {
      if (child.dob) {
        const childBirthYear = new Date(child.dob).getFullYear();
        const childName = child.name || `Child ${index + 1}`;
        
        // Education at age 20
        const educationYear = childBirthYear + 20;
        if (educationYear >= currentYear) {
          markers.push({
            year: educationYear,
            type: 'education',
            label: `${childName}'s Education`
          });
        }
        
        // Marriage at age 30
        const marriageYear = childBirthYear + 30;
        if (marriageYear >= currentYear) {
          markers.push({
            year: marriageYear,
            type: 'marriage',
            label: `${childName}'s Marriage`
          });
        }
      }
    });

  // Add retirement marker
  markers.push({
    year: retirementYear,
    type: 'retirement',
    label: 'Retirement',
  });

  // Calculate projections year by year with improved income growth and savings
  const incomeGrowthRate = 0.08; // 8% annual income growth
  const baseAnnualIncome = monthlyIncome * 12;
  
  for (let year = currentYear; year <= lifeExpectancy + birthYear; year++) {
    const yearsFromNow = year - currentYear;
    const isPreRetirement = year < retirementYear;
    
    // Calculate income with growth (stops at retirement)
    let yearlyIncome = 0;
    if (isPreRetirement) {
      yearlyIncome = baseAnnualIncome * Math.pow(1 + incomeGrowthRate, yearsFromNow);
    }
    
    // Adjust expenses for inflation
    const inflatedExpenses = monthlyExpenses * Math.pow(1 + inflationHeadline, yearsFromNow) * 12;
    
    // EMI payments (stop at retirement)
    const yearlyEMI = isPreRetirement ? monthlyEMI * 12 : 0;
    
    // Calculate child age-based goal expenses for this year
    let goalExpenses = 0;
    scenarioData.householdMembers.forEach(member => {
      if (member.relation === 'child' && member.dob) {
        const childBirthYear = new Date(member.dob).getFullYear();
        const childAge = year - childBirthYear;
        
        // Check if this is an education year (age 20)
        if (childAge === 20) {
          // Find education goal for this child or use default 15L
          const eduGoal = scenarioData.goals.find(g => g.kind === 'child_edu');
          const eduCost = eduGoal ? parseFloat(eduGoal.todaysCost) : 1500000; // 15L default
          const inflatedEduCost = eduCost * Math.pow(1 + inflationEdu, yearsFromNow);
          goalExpenses += inflatedEduCost;
        }
        
        // Check if this is a marriage year (age 30)
        if (childAge === 30) {
          // Find marriage goal for this child or use default 25L
          const marriageGoal = scenarioData.goals.find(g => g.kind === 'child_marriage');
          const marriageCost = marriageGoal ? parseFloat(marriageGoal.todaysCost) : 2500000; // 25L default
          const inflatedMarriageCost = marriageCost * Math.pow(1 + inflationEdu, yearsFromNow);
          goalExpenses += inflatedMarriageCost;
        }
      }
    });

    const totalExpenses = inflatedExpenses + goalExpenses;
    const surplus = yearlyIncome - totalExpenses - yearlyEMI;
    
    // Apply investment returns and savings
    const returnRate = isPreRetirement ? returnPre : returnPost;
    
    if (isPreRetirement) {
      // Pre-retirement: Add systematic savings + returns on existing corpus
      const savingsContribution = Math.max(monthlySavings * 12, surplus * 0.3);
      currentNetWorth = currentNetWorth * (1 + returnRate) + savingsContribution;
    } else {
      // Post-retirement: Corpus grows at conservative rate but reduces for expenses
      const netWithdrawal = Math.max(totalExpenses - yearlyIncome, 0);
      currentNetWorth = currentNetWorth * (1 + returnRate) - netWithdrawal;
    }
    
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
  
  // Calculate SIP required if there's a gap
  let sipRequired = 0;
  if (gap > 0) {
    const yearsToRetirement = retirementYear - currentYear;
    const monthsToRetirement = yearsToRetirement * 12;
    const monthlyReturn = returnPre / 12;
    
    // PMT calculation for SIP required to bridge the gap
    if (monthsToRetirement > 0 && monthlyReturn > 0) {
      sipRequired = gap * monthlyReturn / (Math.pow(1 + monthlyReturn, monthsToRetirement) - 1);
    }
  }

  return {
    netWorthSeries,
    cashflowSeries,
    markers,
    summary: {
      requiredCorpusAtRetirement: Math.round(requiredCorpusAtRetirement),
      projectedCorpusAtRetirement: Math.round(projectedCorpusAtRetirement),
      gap: Math.round(gap),
      retirementYear,
      sipRequired: Math.round(sipRequired),
    },
  };
}
