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
  miniRetirements?: any[];
}

interface YearlyRow {
  year: number;
  age: number;
  income: number;
  regularExpenses: number;
  emiExpenses: number;
  goalExpenses: number;
  totalExpenses: number;
  netSavings: number;
  portfolioReturn: number;
  netWorth: number;
  notes: string[];
}

interface CalculationResult {
  netWorthSeries: { year: number; value: number }[];
  cashflowSeries: { year: number; income: number; expenses: number; emi: number; surplus: number }[];
  markers: { year: number; type: string; label: string }[];
  yearlyDetail: YearlyRow[];
  summary: {
    requiredCorpusAtRetirement: number;
    projectedCorpusAtRetirement: number;
    gap: number;
    retirementYear: number;
    sipRequired?: number;
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
  
  // Get retirement age from income items or use default
  const salaryIncome = scenarioData.incomeItems.find(i => i.type === 'salary');
  const retirementAge = salaryIncome?.end ? salaryIncome.end - birthYear : 60;
  const retirementYear = birthYear + retirementAge;

  // Calculate current financial position
  const totalAssets = scenarioData.assets.reduce((sum: number, asset: any) => 
    sum + parseFloat(asset.value || '0'), 0);
  
  const monthlyIncome = scenarioData.incomeItems.reduce((sum: number, income: any) => {
    const amount = parseFloat(income.amount || '0');
    return sum + (income.frequency === 'annual' ? amount / 12 : amount);
  }, 0);

  const monthlyExpenses = scenarioData.expenseItems.reduce((sum: number, expense: any) => 
    sum + parseFloat(expense.amountMonthly || '0'), 0);

  // Pre-process mini retirements
  const miniRetirementPeriods = (scenarioData.miniRetirements || []).map((mr: any) => ({
    startYear: mr.start,
    endYear: mr.start + Math.ceil((mr.months || 0) / 12),
    months: mr.months || 0,
  }));

  // Pre-process EMI with end dates
  const emiItems = scenarioData.liabilities.map((l: any) => ({
    monthlyEMI: parseFloat(l.emi || '0'),
    endYear: l.endDate ? new Date(l.endDate).getFullYear() : null,
  }));

  // Build year-by-year projections
  const netWorthSeries: { year: number; value: number }[] = [];
  const cashflowSeries: { year: number; income: number; expenses: number; emi: number; surplus: number }[] = [];
  const markers: { year: number; type: string; label: string }[] = [];
  const yearlyDetail: YearlyRow[] = [];

  // Add children education and marriage markers
  scenarioData.householdMembers
    .filter((member: any) => member.relation === 'child')
    .forEach((child: any, index: number) => {
      if (child.dob) {
        const childBirthYear = new Date(child.dob).getFullYear();
        const childName = child.name || `Child ${index + 1}`;
        
        const educationYear = childBirthYear + 20;
        if (educationYear >= currentYear) {
          markers.push({ year: educationYear, type: 'education', label: `${childName}'s Education` });
        }
        
        const marriageYear = childBirthYear + 30;
        if (marriageYear >= currentYear) {
          markers.push({ year: marriageYear, type: 'marriage', label: `${childName}'s Marriage` });
        }
      }
    });

  // Add retirement marker
  markers.push({ year: retirementYear, type: 'retirement', label: 'Retirement' });

  // Read salary growth rate from the income item (set by user in the form), falling back to assumptions or 8%
  const salaryGrowthFromItem = salaryIncome?.growthRate ? parseFloat(salaryIncome.growthRate) : null;
  const incomeGrowthRate = salaryGrowthFromItem != null
    ? salaryGrowthFromItem / 100
    : parseFloat(assumptions.incomeGrowthRate || '8') / 100;
  const baseAnnualIncome = monthlyIncome * 12;
  
  let currentNetWorth = totalAssets;
  
  for (let year = currentYear; year <= lifeExpectancy + birthYear; year++) {
    const yearsFromNow = year - currentYear;
    const age = birthYear + (year - currentYear);
    const isPreRetirement = year < retirementYear;
    const notes: string[] = [];

    // Check if this year falls in a mini retirement period
    const isMiniRetirement = miniRetirementPeriods.some(
      (mr) => year >= mr.startYear && year < mr.endYear
    );

    // Add mini retirement markers and notes
    if (miniRetirementPeriods.some((mr) => year === mr.startYear)) {
      markers.push({ year, type: 'mini_retirement', label: 'Mini Retirement' });
      notes.push('Mini Retirement starts — no savings added, portfolio grows only through returns');
    }
    if (miniRetirementPeriods.some((mr) => year > mr.startYear && year < mr.endYear)) {
      notes.push('Mini Retirement in progress');
    }
    if (miniRetirementPeriods.some((mr) => year === mr.endYear)) {
      notes.push('Mini Retirement ends — resuming normal savings');
    }
    
    // Calculate income with growth (stops at retirement or during mini retirement)
    let yearlyIncome = 0;
    if (isPreRetirement && !isMiniRetirement) {
      yearlyIncome = baseAnnualIncome * Math.pow(1 + incomeGrowthRate, yearsFromNow);
    }

    if (year === retirementYear) {
      notes.push(`Retirement at age ${retirementAge} — income stops, corpus begins drawdown`);
    }
    
    // Adjust expenses for inflation
    const inflatedExpenses = monthlyExpenses * Math.pow(1 + inflationHeadline, yearsFromNow) * 12;
    
    // EMI payments — only during pre-retirement and only while tenure has not expired
    const activeEMIMonthly = emiItems.reduce((sum, emi) => {
      if (!isPreRetirement) return sum;
      if (emi.endYear !== null && year >= emi.endYear) return sum;
      return sum + emi.monthlyEMI;
    }, 0);
    const yearlyEMI = activeEMIMonthly * 12;

    if (yearlyEMI > 0) {
      notes.push(`EMI of ₹${(yearlyEMI / 12).toLocaleString('en-IN', { maximumFractionDigits: 0 })}/month active`);
    }

    // Check if any EMI ends this year
    emiItems.forEach(emi => {
      if (emi.endYear !== null && year === emi.endYear) {
        notes.push('Existing EMI closes — monthly surplus increases');
      }
    });
    
    // Calculate child age-based goal expenses for this year
    let goalExpenses = 0;
    scenarioData.householdMembers.forEach((member: any) => {
      if (member.relation === 'child' && member.dob) {
        const childBirthYear = new Date(member.dob).getFullYear();
        const childAge = year - childBirthYear;
        const childName = member.name || 'Child';
        
        if (childAge === 20) {
          const eduGoal = scenarioData.goals.find((g: any) => g.kind === 'child_edu');
          const eduCostToday = eduGoal ? parseFloat(eduGoal.todaysCost) : 1500000;
          const inflatedEduCost = eduCostToday * Math.pow(1 + inflationEdu, yearsFromNow);
          goalExpenses += inflatedEduCost;
          notes.push(`${childName}'s higher education — ₹${(inflatedEduCost / 100000).toFixed(1)}L (inflation-adjusted from ₹${(eduCostToday / 100000).toFixed(1)}L today)`);
        }
        
        if (childAge === 30) {
          const marriageGoal = scenarioData.goals.find((g: any) => g.kind === 'child_marriage');
          const marriageCostToday = marriageGoal ? parseFloat(marriageGoal.todaysCost) : 2500000;
          const inflatedMarriageCost = marriageCostToday * Math.pow(1 + inflationHeadline, yearsFromNow);
          goalExpenses += inflatedMarriageCost;
          notes.push(`${childName}'s marriage — ₹${(inflatedMarriageCost / 100000).toFixed(1)}L (inflation-adjusted from ₹${(marriageCostToday / 100000).toFixed(1)}L today)`);
        }
      }
    });

    // Apply investment returns and savings
    const returnRate = isPreRetirement ? returnPre : returnPost;
    const portfolioReturn = currentNetWorth * returnRate;
    const totalOutflow = inflatedExpenses + goalExpenses + yearlyEMI;
    const totalInflows = yearlyIncome;
    
    let netSavings = totalInflows - totalOutflow;
    if (isPreRetirement) {
      if (isMiniRetirement) {
        // During mini retirement: no new savings, only portfolio appreciation
        currentNetWorth = currentNetWorth * (1 + returnRate) - totalOutflow;
        netSavings = -totalOutflow;
      } else {
        currentNetWorth = currentNetWorth * (1 + returnRate) + netSavings;
      }
    } else {
      // Post-retirement: corpus grows at conservative rate and is reduced by full yearly deficit
      currentNetWorth = currentNetWorth * (1 + returnRate) + netSavings;
    }
    
    // Ensure net worth doesn't go negative
    currentNetWorth = Math.max(currentNetWorth, 0);

    const totalExpensesForYear = totalOutflow;
    const surplus = netSavings;

    netWorthSeries.push({ year, value: Math.round(currentNetWorth) });
    cashflowSeries.push({
      year,
      income: Math.round(yearlyIncome),
      expenses: Math.round(inflatedExpenses + goalExpenses),
      emi: Math.round(yearlyEMI),
      surplus: Math.round(surplus),
    });

    yearlyDetail.push({
      year,
      age,
      income: Math.round(yearlyIncome),
      regularExpenses: Math.round(inflatedExpenses),
      emiExpenses: Math.round(yearlyEMI),
      goalExpenses: Math.round(goalExpenses),
      totalExpenses: Math.round(totalExpensesForYear),
      netSavings: Math.round(netSavings),
      portfolioReturn: Math.round(portfolioReturn),
      netWorth: Math.round(currentNetWorth),
      notes: notes.length > 0 ? notes : (isPreRetirement ? ['Normal accumulation phase'] : ['Retirement — corpus drawdown phase']),
    });
  }

  // Calculate required corpus at retirement using the 4% safe withdrawal rate equivalent
  const retirementExpenses = monthlyExpenses * Math.pow(1 + inflationHeadline, retirementYear - currentYear) * 12;
  const requiredCorpusAtRetirement = retirementExpenses / returnPost;
  
  const retirementData = netWorthSeries.find(item => item.year === retirementYear);
  const projectedCorpusAtRetirement = retirementData?.value || 0;
  
  const gap = Math.max(0, requiredCorpusAtRetirement - projectedCorpusAtRetirement);
  
  // Fix: returnPre is already a decimal (e.g. 0.10), so monthly rate = returnPre / 12
  let sipRequired = 0;
  if (gap > 0) {
    const yearsToRetirement = retirementYear - currentYear;
    const monthsToRetirement = yearsToRetirement * 12;
    const monthlyReturn = returnPre / 12;
    
    if (monthsToRetirement > 0 && monthlyReturn > 0) {
      sipRequired = gap * monthlyReturn / (Math.pow(1 + monthlyReturn, monthsToRetirement) - 1);
    }
  }

  return {
    netWorthSeries,
    cashflowSeries,
    markers,
    yearlyDetail,
    summary: {
      requiredCorpusAtRetirement: Math.round(requiredCorpusAtRetirement),
      projectedCorpusAtRetirement: Math.round(projectedCorpusAtRetirement),
      gap: Math.round(gap),
      retirementYear,
      sipRequired: Math.round(sipRequired),
    },
  };
}
