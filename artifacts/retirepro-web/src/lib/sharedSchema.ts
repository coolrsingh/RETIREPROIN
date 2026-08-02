import { z } from "zod";

export const quickPlanSchema = z.object({
  // ── Identity ──────────────────────────────────────────────────────────────
  fullName: z.string().min(1, "Full name is required"),
  dob: z.string().min(1, "Date of birth is required"),
  retirementAge: z.number().min(18).max(100),

  // ── Persona / mode ────────────────────────────────────────────────────────
  /** "accumulating" = still building corpus; "retired" = already retired (drawdown) */
  personaMode: z.enum(["accumulating", "retired"]).default("accumulating").optional(),

  // ── Retirement goal style ─────────────────────────────────────────────────
  retirementGoal: z.enum(["fire", "lean", "comfortable", "lavish"]).default("comfortable").optional(),

  // ── Spouse / partner ──────────────────────────────────────────────────────
  spouseName: z.string().optional(),
  spouseDob: z.string().optional(),
  isJointRetirement: z.boolean().default(false),
  spouseRetirementAge: z.number().min(18).max(100).optional(),
  spouseMonthlyIncome: z.number().min(0).optional(),

  // ── Core financials ───────────────────────────────────────────────────────
  /**
   * Zero is allowed so that retired-mode submissions pass without income.
   * Accumulating-mode must have income > 0 — enforced by superRefine below.
   */
  monthlyIncomeTotal: z.number().min(0),
  monthlyExpenseTotal: z.number().min(1),
  monthlySavings: z.number().min(0, "Monthly savings is required"),
  incomeGrowthRate: z.number().min(0).max(50).optional(),

  // ── Retired-mode fields (ignored in accumulating mode) ────────────────────
  /** Current investment corpus at time of retirement */
  currentCorpus: z.number().min(0).optional(),
  /** Monthly amount to withdraw from corpus in retirement */
  monthlyWithdrawal: z.number().min(0).optional(),
  /** Number of years the corpus needs to last */
  yearsToCover: z.number().min(1).max(60).optional(),

  // ── Children ──────────────────────────────────────────────────────────────
  children: z.array(z.object({
    name: z.string().optional(),
    dob: z.string().optional(),
    eduTodaysCost: z.number().min(0).optional(),
    marriageTodaysCost: z.number().min(0).optional(),
  }).refine(
    (child) => !!(child.name?.trim()) || !!(child.dob?.trim()),
    { message: "Child must have a name or date of birth", path: ["dob"] }
  )).optional(),

  // ── Assets ────────────────────────────────────────────────────────────────
  assetsLumpSum: z.number().min(0).optional(),
  /** EPF (Employee Provident Fund) current corpus balance */
  epfCorpus: z.number().min(0).optional(),
  /** NPS (National Pension System) current corpus balance */
  npsCorpus: z.number().min(0).optional(),
  /** NPS monthly contribution (informational; already included in savings) */
  npsMonthlyContribution: z.number().min(0).optional(),

  // ── Legacy asset allocation fields (kept for backwards compat) ────────────
  assetsEquity: z.number().min(0).optional(),
  assetsDebt: z.number().min(0).optional(),
  assetsRealEstate: z.number().min(0).optional(),
  assetsCash: z.number().min(0).optional(),
  preRetirementReturn: z.number().min(0).max(30).optional(),
  postRetirementReturn: z.number().min(0).max(30).optional(),

  // ── Planning assumptions ──────────────────────────────────────────────────
  assumptions: z.object({
    returnPre: z.number().min(0).max(30).optional(),
    returnPost: z.number().min(0).max(30).optional(),
    inflationHeadline: z.number().min(0).max(20).optional(),
    equityAllocation: z.number().min(0).max(100).default(70),
    debtAllocation: z.number().min(0).max(100).default(30),
    equityReturn: z.number().min(0).max(50).default(14),
    debtReturn: z.number().min(0).max(50).default(8),
  }).optional(),

  // ── Legacy allocation fields ──────────────────────────────────────────────
  assetAllocation: z.object({
    equity: z.number().min(0).max(100).default(50),
    debt: z.number().min(0).max(100).default(30),
    realEstate: z.number().min(0).max(100).default(15),
    gold: z.number().min(0).max(100).default(5),
    cash: z.number().min(0).max(100).default(0),
  }).optional(),
  expectedReturns: z.object({
    equity: z.number().min(0).max(50).default(14),
    debt: z.number().min(0).max(50).default(8),
    realEstate: z.number().min(0).max(50).default(10),
    gold: z.number().min(0).max(50).default(6),
    cash: z.number().min(0).max(50).default(4),
  }).optional(),

  // ── Goals ─────────────────────────────────────────────────────────────────
  shortTermGoals: z.array(z.object({
    name: z.string().min(1),
    type: z.enum(["car", "bike", "tour", "other"]),
    targetMonth: z.number().min(1).max(12),
    targetYear: z.number().min(2024),
    estimatedCost: z.number().min(0),
  })).optional(),
  existingLoans: z.array(z.object({
    name: z.string().min(1),
    type: z.enum(["home_loan", "personal_loan", "car_loan", "education_loan", "other"]),
    principalLeft: z.number().min(0),
    interestRate: z.number().min(0).max(50),
    tenureYears: z.number().min(0).max(50),
    tenureMonths: z.number().min(0).max(11).default(0),
    startDate: z.string(),
    emi: z.number().min(0),
  })).optional(),

  // ── Optional toggles ──────────────────────────────────────────────────────
  miniRetirement: z.object({
    startYear: z.number().min(2024).max(2100),
    durationMonths: z.number().min(1).max(120),
  }).optional(),
  existingEMI: z.object({
    emiAmount: z.number().min(0),
    tenureRemainingMonths: z.number().min(0),
  }).optional(),
  customGoals: z.array(z.object({
    name: z.string().min(1, "Goal name is required"),
    todaysCost: z.number().min(1, "Goal amount is required"),
    yearsFromNow: z.number().min(1).max(50),
  })).optional(),
}).superRefine((data, ctx) => {
  const mode = data.personaMode ?? "accumulating";

  // Accumulating mode: income must be > 0
  if (mode === "accumulating") {
    if (!data.monthlyIncomeTotal || data.monthlyIncomeTotal <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Monthly income is required",
        path: ["monthlyIncomeTotal"],
      });
    }
  }

  // Retired mode: corpus and withdrawal are required
  if (mode === "retired") {
    if (!data.currentCorpus || data.currentCorpus <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Current corpus is required in retired mode",
        path: ["currentCorpus"],
      });
    }
    if (!data.monthlyWithdrawal || data.monthlyWithdrawal <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Monthly withdrawal amount is required in retired mode",
        path: ["monthlyWithdrawal"],
      });
    }
  }
});

export type QuickPlan = z.infer<typeof quickPlanSchema>;
