import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  date,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// Session storage table.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { enum: ['client', 'admin'] }).default('client'),
  planCount: integer("plan_count").notNull().default(0),
  isPremium: boolean("is_premium").default(false),
  // Financial profile fields
  phone: varchar("phone"),
  dob: date("dob"),
  retirementAge: integer("retirement_age"),
  monthlyIncome: decimal("monthly_income", { precision: 15, scale: 2 }),
  monthlyExpenses: decimal("monthly_expenses", { precision: 15, scale: 2 }),
  monthlySavings: decimal("monthly_savings", { precision: 15, scale: 2 }),
  incomeGrowthRate: decimal("income_growth_rate", { precision: 5, scale: 2 }),
  currentAssets: decimal("current_assets", { precision: 15, scale: 2 }),
  shareCount: integer("share_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const scenarios = pgTable("scenarios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: varchar("name").notNull(),
  mode: varchar("mode", { enum: ['quick', 'detailed'] }).notNull(),
  leadId: varchar("lead_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const assumptions = pgTable("assumptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scenarioId: varchar("scenario_id").notNull(),
  inflationHeadline: decimal("inflation_headline", { precision: 5, scale: 2 }),
  inflationEdu: decimal("inflation_edu", { precision: 5, scale: 2 }),
  inflationHealth: decimal("inflation_health", { precision: 5, scale: 2 }),
  returnPre: decimal("return_pre", { precision: 5, scale: 2 }),
  returnPost: decimal("return_post", { precision: 5, scale: 2 }),
  lifeExpectancy: integer("life_expectancy"),
  equityAllocation: decimal("equity_allocation", { precision: 5, scale: 2 }).default('70'),
  debtAllocation: decimal("debt_allocation", { precision: 5, scale: 2 }).default('30'),
  equityReturn: decimal("equity_return", { precision: 5, scale: 2 }).default('14'),
  debtReturn: decimal("debt_return", { precision: 5, scale: 2 }).default('8'),
  source: varchar("source", { enum: ['crm', 'user'] }).default('crm'),
});

export const householdMembers = pgTable("household_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scenarioId: varchar("scenario_id").notNull(),
  name: varchar("name").notNull(),
  relation: varchar("relation", { enum: ['self', 'spouse', 'child', 'parent'] }).notNull(),
  dob: date("dob"),
  dependent: boolean("dependent").default(false),
  dependenceEnd: integer("dependence_end"),
  isJointRetirement: boolean("is_joint_retirement").default(false),
  retirementAge: integer("retirement_age"),
});

export const incomeItems = pgTable("income_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scenarioId: varchar("scenario_id").notNull(),
  type: varchar("type", { enum: ['salary', 'side', 'family', 'pension', 'rental'] }).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  frequency: varchar("frequency", { enum: ['monthly', 'annual'] }).default('monthly'),
  start: integer("start"),
  end: integer("end"),
});

export const expenseItems = pgTable("expense_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scenarioId: varchar("scenario_id").notNull(),
  type: varchar("type", { enum: ['core', 'education', 'health', 'lifestyle'] }).notNull(),
  amountMonthly: decimal("amount_monthly", { precision: 15, scale: 2 }).notNull(),
});

export const goals = pgTable("goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scenarioId: varchar("scenario_id").notNull(),
  kind: varchar("kind", { enum: ['child_edu', 'child_marriage', 'home', 'car', 'bike', 'tour', 'other'] }).notNull(),
  name: varchar("name"),
  todaysCost: decimal("todays_cost", { precision: 15, scale: 2 }).notNull(),
  targetMonth: integer("target_month"),
  targetYear: integer("target_year").notNull(),
  inflationCategory: varchar("inflation_category", { enum: ['headline', 'education', 'health'] }).default('headline'),
});

export const assets = pgTable("assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scenarioId: varchar("scenario_id").notNull(),
  kind: varchar("kind", { enum: ['equity', 'debt', 'real_estate', 'gold', 'cash'] }).notNull(),
  value: decimal("value", { precision: 15, scale: 2 }).notNull(),
  expectedReturnPre: decimal("expected_return_pre", { precision: 5, scale: 2 }),
  expectedReturnPost: decimal("expected_return_post", { precision: 5, scale: 2 }),
});

export const liabilities = pgTable("liabilities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scenarioId: varchar("scenario_id").notNull(),
  name: varchar("name"),
  type: varchar("type", { enum: ['home_loan', 'personal_loan', 'car_loan', 'education_loan', 'other'] }),
  principalLeft: decimal("principal_left", { precision: 15, scale: 2 }).notNull(),
  rate: decimal("rate", { precision: 5, scale: 2 }).notNull(),
  emi: decimal("emi", { precision: 15, scale: 2 }).notNull(),
  tenureYears: integer("tenure_years"),
  tenureMonths: integer("tenure_months").default(0),
  startDate: date("start_date"),
  endDate: date("end_date").notNull(),
});

export const miniRetirements = pgTable("mini_retirements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scenarioId: varchar("scenario_id").notNull(),
  start: integer("start").notNull(),
  months: integer("months").notNull(),
  incomeDuring: decimal("income_during", { precision: 15, scale: 2 }).default('0'),
  expenseDeltaPct: decimal("expense_delta_pct", { precision: 5, scale: 2 }).default('0'),
  fundingOrder: text("funding_order"),
});

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scenarioId: varchar("scenario_id"),
  name: varchar("name").notNull(),
  email: varchar("email"),
  phone: varchar("phone").notNull(),
  utm: jsonb("utm"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique("leads_phone_unique").on(table.phone),
]);

export const subscribers = pgTable("subscribers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  source: varchar("source").default('blog'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const crmDefaults = pgTable("crm_defaults", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  inflationHeadline: decimal("inflation_headline", { precision: 5, scale: 2 }).default('6.0'),
  inflationEdu: decimal("inflation_edu", { precision: 5, scale: 2 }).default('8.0'),
  inflationHealth: decimal("inflation_health", { precision: 5, scale: 2 }).default('7.0'),
  returnPre: decimal("return_pre", { precision: 5, scale: 2 }).default('10.0'),
  returnPost: decimal("return_post", { precision: 5, scale: 2 }).default('7.0'),
  lifeExpectancy: integer("life_expectancy").default(85),
  taxRegime: varchar("tax_regime", { enum: ['old', 'new'] }).default('new'),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  scenarios: many(scenarios),
}));

export const scenariosRelations = relations(scenarios, ({ one, many }) => ({
  user: one(users, {
    fields: [scenarios.userId],
    references: [users.id],
  }),
  assumptions: one(assumptions, {
    fields: [scenarios.id],
    references: [assumptions.scenarioId],
  }),
  householdMembers: many(householdMembers),
  incomeItems: many(incomeItems),
  expenseItems: many(expenseItems),
  goals: many(goals),
  assets: many(assets),
  liabilities: many(liabilities),
  miniRetirements: many(miniRetirements),
  lead: one(leads, {
    fields: [scenarios.leadId],
    references: [leads.id],
  }),
}));

export const assumptionsRelations = relations(assumptions, ({ one }) => ({
  scenario: one(scenarios, {
    fields: [assumptions.scenarioId],
    references: [scenarios.id],
  }),
}));

export const householdMembersRelations = relations(householdMembers, ({ one }) => ({
  scenario: one(scenarios, {
    fields: [householdMembers.scenarioId],
    references: [scenarios.id],
  }),
}));

export const incomeItemsRelations = relations(incomeItems, ({ one }) => ({
  scenario: one(scenarios, {
    fields: [incomeItems.scenarioId],
    references: [scenarios.id],
  }),
}));

export const expenseItemsRelations = relations(expenseItems, ({ one }) => ({
  scenario: one(scenarios, {
    fields: [expenseItems.scenarioId],
    references: [scenarios.id],
  }),
}));

export const goalsRelations = relations(goals, ({ one }) => ({
  scenario: one(scenarios, {
    fields: [goals.scenarioId],
    references: [scenarios.id],
  }),
}));

export const assetsRelations = relations(assets, ({ one }) => ({
  scenario: one(scenarios, {
    fields: [assets.scenarioId],
    references: [scenarios.id],
  }),
}));

export const liabilitiesRelations = relations(liabilities, ({ one }) => ({
  scenario: one(scenarios, {
    fields: [liabilities.scenarioId],
    references: [scenarios.id],
  }),
}));

export const miniRetirementsRelations = relations(miniRetirements, ({ one }) => ({
  scenario: one(scenarios, {
    fields: [miniRetirements.scenarioId],
    references: [scenarios.id],
  }),
}));

export const leadsRelations = relations(leads, ({ one }) => ({
  scenario: one(scenarios, {
    fields: [leads.scenarioId],
    references: [scenarios.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertScenarioSchema = createInsertSchema(scenarios).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAssumptionsSchema = createInsertSchema(assumptions).omit({
  id: true,
});

export const insertHouseholdMemberSchema = createInsertSchema(householdMembers).omit({
  id: true,
});

export const insertIncomeItemSchema = createInsertSchema(incomeItems).omit({
  id: true,
});

export const insertExpenseItemSchema = createInsertSchema(expenseItems).omit({
  id: true,
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
});

export const insertAssetSchema = createInsertSchema(assets).omit({
  id: true,
});

export const insertLiabilitySchema = createInsertSchema(liabilities).omit({
  id: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
}).extend({
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\d{10,}$/, "Phone must contain at least 10 digits and only numeric characters"),
});

export const insertCrmDefaultsSchema = createInsertSchema(crmDefaults).omit({
  id: true,
  updatedAt: true,
});

// Quick Plan schema
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
  })).optional(),
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
  // Enhanced features
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

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Scenario = typeof scenarios.$inferSelect;
export type InsertScenario = z.infer<typeof insertScenarioSchema>;
export type Assumptions = typeof assumptions.$inferSelect;
export type InsertAssumptions = z.infer<typeof insertAssumptionsSchema>;
export type HouseholdMember = typeof householdMembers.$inferSelect;
export type InsertHouseholdMember = z.infer<typeof insertHouseholdMemberSchema>;
export type IncomeItem = typeof incomeItems.$inferSelect;
export type InsertIncomeItem = z.infer<typeof insertIncomeItemSchema>;
export type ExpenseItem = typeof expenseItems.$inferSelect;
export type InsertExpenseItem = z.infer<typeof insertExpenseItemSchema>;
export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Asset = typeof assets.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type Liability = typeof liabilities.$inferSelect;
export type InsertLiability = z.infer<typeof insertLiabilitySchema>;
export const insertMiniRetirementSchema = createInsertSchema(miniRetirements).omit({
  id: true,
});
export type MiniRetirement = typeof miniRetirements.$inferSelect;
export type InsertMiniRetirement = z.infer<typeof insertMiniRetirementSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type CrmDefaults = typeof crmDefaults.$inferSelect;
export type InsertCrmDefaults = z.infer<typeof insertCrmDefaultsSchema>;
export type QuickPlan = z.infer<typeof quickPlanSchema>;
export type Subscriber = typeof subscribers.$inferSelect;
export type InsertSubscriber = typeof subscribers.$inferInsert;

export const insertSubscriberSchema = createInsertSchema(subscribers).omit({
  id: true,
  createdAt: true,
});
