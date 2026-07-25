import { z } from "zod";

export const quickPlanSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  dob: z.string().min(1, "Date of birth is required"),
  retirementAge: z.number().min(18).max(100),
  spouseDob: z.string().optional(),
  monthlyIncomeTotal: z.number().min(1, "Monthly income is required"),
  monthlyExpenseTotal: z.number().min(1),
  monthlySavings: z.number().min(0, "Monthly savings is required"),
  incomeGrowthRate: z.number().min(0).max(50).optional(),
  children: z.array(z.object({
    name: z.string().optional(),
    dob: z.string().optional(),
    eduTodaysCost: z.number().min(0).optional(),
    marriageTodaysCost: z.number().min(0).optional(),
  }).refine(
    (child) => !!(child.name?.trim()) || !!(child.dob?.trim()),
    { message: "Child must have a name or date of birth", path: ["dob"] }
  )).optional(),
  assetsLumpSum: z.number().min(0).optional(),
  assetsEquity: z.number().min(0).optional(),
  assetsDebt: z.number().min(0).optional(),
  assetsRealEstate: z.number().min(0).optional(),
  assetsCash: z.number().min(0).optional(),
  preRetirementReturn: z.number().min(0).max(30).optional(),
  postRetirementReturn: z.number().min(0).max(30).optional(),
  assumptions: z.object({
    returnPre: z.number().min(0).max(30).optional(),
    returnPost: z.number().min(0).max(30).optional(),
    inflationHeadline: z.number().min(0).max(20).optional(),
    equityAllocation: z.number().min(0).max(100).default(70),
    debtAllocation: z.number().min(0).max(100).default(30),
    equityReturn: z.number().min(0).max(50).default(14),
    debtReturn: z.number().min(0).max(50).default(8)
  }).optional(),
  isJointRetirement: z.boolean().default(false),
  spouseRetirementAge: z.number().min(18).max(100).optional(),
  assetAllocation: z.object({
    equity: z.number().min(0).max(100).default(50),
    debt: z.number().min(0).max(100).default(30),
    realEstate: z.number().min(0).max(100).default(15),
    gold: z.number().min(0).max(100).default(5),
    cash: z.number().min(0).max(100).default(0)
  }).optional(),
  expectedReturns: z.object({
    equity: z.number().min(0).max(50).default(14),
    debt: z.number().min(0).max(50).default(8),
    realEstate: z.number().min(0).max(50).default(10),
    gold: z.number().min(0).max(50).default(6),
    cash: z.number().min(0).max(50).default(4)
  }).optional(),
  shortTermGoals: z.array(z.object({
    name: z.string().min(1),
    type: z.enum(['car', 'bike', 'tour', 'other']),
    targetMonth: z.number().min(1).max(12),
    targetYear: z.number().min(2024),
    estimatedCost: z.number().min(0)
  })).optional(),
  existingLoans: z.array(z.object({
    name: z.string().min(1),
    type: z.enum(['home_loan', 'personal_loan', 'car_loan', 'education_loan', 'other']),
    principalLeft: z.number().min(0),
    interestRate: z.number().min(0).max(50),
    tenureYears: z.number().min(0).max(50),
    tenureMonths: z.number().min(0).max(11).default(0),
    startDate: z.string(),
    emi: z.number().min(0)
  })).optional(),
  miniRetirement: z.object({
    startYear: z.number().min(2024).max(2100),
    durationMonths: z.number().min(1).max(120),
  }).optional(),
  existingEMI: z.object({
    emiAmount: z.number().min(0),
    tenureRemainingMonths: z.number().min(0),
  }).optional(),
});

export type QuickPlan = z.infer<typeof quickPlanSchema>;
