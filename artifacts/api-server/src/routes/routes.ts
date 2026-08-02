import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "../storage";
import { setupAuth, isAuthenticated } from "../replitAuth";
import { calculateRetirementPlan } from "../calculations";
import { generatePDF } from "../pdf";
import { z } from "zod/v4";
import {
  quickPlanSchema, insertScenarioSchema, insertLeadSchema,
  users, scenarios, leads,
  assumptions, householdMembers, incomeItems, expenseItems, goals, assets, liabilities, miniRetirements,
} from "@workspace/db";

import { db } from "../db";
import { eq, and, or, sql } from "drizzle-orm";
import * as XLSX from "xlsx";
import { crmDefaultsUpdateSchema } from "../schemas/crm-defaults";
import { buildGuestAssets } from "../plan-mapper";

const updateScenarioAssumptionsSchema = z.object({
  inflationHeadline: z.string().nullable().optional(),
  inflationEdu: z.string().nullable().optional(),
  inflationHealth: z.string().nullable().optional(),
  returnPre: z.string().nullable().optional(),
  returnPost: z.string().nullable().optional(),
  lifeExpectancy: z.number().int().nullable().optional(),
  source: z.enum(['crm', 'user']).nullable().optional(),
});

const updateScenarioBodySchema = z.object({
  name: z.string().optional(),
  leadId: z.string().nullable().optional(),
  assumptions: updateScenarioAssumptionsSchema.optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // CRM defaults routes
  app.get('/api/crm/defaults', async (req, res) => {
    try {
      const defaults = await storage.getCrmDefaults();
      res.json(defaults);
    } catch (error) {
      console.error("Error fetching CRM defaults:", error);
      res.status(500).json({ message: "Failed to fetch CRM defaults" });
    }
  });

  app.put('/api/crm/defaults', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const parsed = crmDefaultsUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid CRM defaults", issues: parsed.error.issues });
      }

      const defaults = await storage.updateCrmDefaults(parsed.data);
      res.json(defaults);
    } catch (error) {
      console.error("Error updating CRM defaults:", error);
      res.status(500).json({ message: "Failed to update CRM defaults" });
    }
  });

  // Scenario routes
  app.get('/api/scenarios', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const scenarios = await storage.getScenariosByUser(userId);
      res.json(scenarios);
    } catch (error) {
      console.error("Error fetching scenarios:", error);
      res.status(500).json({ message: "Failed to fetch scenarios" });
    }
  });

  app.get('/api/scenarios/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const scenario = await storage.getScenario(req.params.id);
      
      if (!scenario || scenario.userId !== userId) {
        return res.status(404).json({ message: "Scenario not found" });
      }

      const scenarioWithData = await storage.getScenarioWithAllData(req.params.id);
      res.json(scenarioWithData);
    } catch (error) {
      console.error("Error fetching scenario:", error);
      res.status(500).json({ message: "Failed to fetch scenario" });
    }
  });

  app.post('/api/scenarios', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      const scenarioData = insertScenarioSchema.parse({
        ...req.body,
        userId,
      });

      // Wrap quota check-and-increment + scenario insert in one transaction so
      // that a failed scenario insert automatically rolls back the counter —
      // no compensating decrement needed.
      let scenario;
      try {
        scenario = await db.transaction(async (tx) => {
          const [grantedUser] = await tx
            .update(users)
            .set({ planCount: sql`COALESCE(${users.planCount}, 0) + 1`, updatedAt: new Date() })
            .where(
              and(
                eq(users.id, userId),
                or(eq(users.isPremium, true), sql`COALESCE(${users.planCount}, 0) < 10`)
              )
            )
            .returning();

          if (!grantedUser) {
            const err: any = new Error("Plan limit reached");
            err.code = "PLAN_LIMIT_REACHED";
            throw err;
          }

          const [newScenario] = await tx.insert(scenarios).values(scenarioData).returning();
          return newScenario;
        });
      } catch (txErr: any) {
        if (txErr.code === "PLAN_LIMIT_REACHED") {
          return res.status(402).json({
            message: "Plan limit reached. Upgrade to premium for unlimited plans.",
            requiresPayment: true,
          });
        }
        throw txErr;
      }

      res.json(scenario);
    } catch (error) {
      console.error("Error creating scenario:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid scenario data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create scenario" });
    }
  });

  app.put('/api/scenarios/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const scenario = await storage.getScenario(req.params.id);
      
      if (!scenario || scenario.userId !== userId) {
        return res.status(404).json({ message: "Scenario not found" });
      }

      const parsed = updateScenarioBodySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid scenario data", issues: parsed.error.issues });
      }

      // Split the payload: `assumptions` lives in a separate table and must be
      // routed to upsertAssumptions, not to the scenarios row update.
      const { assumptions: assumptionsPayload, ...scenarioFields } = parsed.data;

      const updatedScenario = await storage.updateScenario(req.params.id, scenarioFields);

      // Persist assumption changes when the client sends them.
      if (assumptionsPayload) {
        await storage.upsertAssumptions({
          scenarioId: req.params.id,
          ...assumptionsPayload,
        });
      }

      // Recalculate and persist the projected corpus before returning so
      // the next GET /api/scenarios list fetch always reflects the latest
      // inputs — eliminating any race between a background write and an
      // immediate list refetch on the client.
      try {
        const scenarioData = await storage.getScenarioWithAllData(req.params.id);
        if (scenarioData) {
          const calculations = await calculateRetirementPlan(scenarioData);
          await storage.updateScenarioCorpus(
            req.params.id,
            calculations.summary.projectedCorpusAtRetirement,
          );
          // Surface the freshly computed corpus in the response body so the
          // client can use it without waiting for an additional list refetch.
          (updatedScenario as any).projectedCorpus =
            calculations.summary.projectedCorpusAtRetirement;
        }
      } catch {
        // Corpus recalculation is an optimisation; never fail the save.
        // The client will get the previous corpus value and will refresh it
        // the next time the plan dashboard is opened (POST /api/calc/:id).
      }

      res.json(updatedScenario);
    } catch (error) {
      console.error("Error updating scenario:", error);
      res.status(500).json({ message: "Failed to update scenario" });
    }
  });

  app.delete('/api/scenarios/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const scenario = await storage.getScenario(req.params.id);
      
      if (!scenario || scenario.userId !== userId) {
        return res.status(404).json({ message: "Scenario not found" });
      }

      await storage.deleteScenario(req.params.id);
      res.json({ message: "Scenario deleted successfully" });
    } catch (error) {
      console.error("Error deleting scenario:", error);
      res.status(500).json({ message: "Failed to delete scenario" });
    }
  });

  // Guest (no-auth) stateless plan calculation — no DB save, just compute and return
  app.post('/api/plan/try', async (req, res) => {
    try {
      const validationResult = quickPlanSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Validation failed", errors: validationResult.error.issues });
      }
      const planData = validationResult.data;
      const currentYear = new Date().getFullYear();
      const birthYear = planData.dob ? new Date(planData.dob).getFullYear() : currentYear - 35;
      const currentAge = currentYear - birthYear;
      // Retired mode: retirement year = now.  Accumulating: derived from dob + retirementAge.
      const retirementYear = planData.personaMode === 'retired'
        ? currentYear
        : birthYear + planData.retirementAge;

      const returnPreStr  = planData.assumptions?.returnPre?.toString()         ?? '12.0';
      const returnPostStr = planData.assumptions?.returnPost?.toString()         ?? '8.0';
      const inflationStr  = planData.assumptions?.inflationHeadline?.toString()  ?? '6.0';

      // Goal multiplier: scales the target post-retirement expense
      const GOAL_MULTIPLIERS = { fire: 0.6, lean: 0.75, comfortable: 1.0, lavish: 1.3 } as const;
      const goalMultiplier = GOAL_MULTIPLIERS[planData.retirementGoal as keyof typeof GOAL_MULTIPLIERS] ?? 1.0;
      const postRetirementMonthlyExpense = Math.round(planData.monthlyExpenseTotal * goalMultiplier);

      // Build the asset list via the shared mapper.
      // Retired mode → only currentCorpus; accumulating → lumpSum + EPF + NPS.
      // See plan-mapper.ts for the full contract and double-counting rationale.
      const retiredAssets = buildGuestAssets(planData, returnPreStr, returnPostStr);

      const lifeExpectancyForRetired = Math.min(currentAge + (planData.yearsToCover ?? 25), 100);

      const scenarioData = {
        id: 'guest',
        name: `${planData.fullName}'s Retirement Plan`,
        mode: 'quick',
        assumptions: {
          inflationHeadline: inflationStr,
          inflationEdu: '8.0',
          inflationHealth: '8.0',
          // In retired mode use conservative return for all years
          returnPre: planData.personaMode === 'retired' ? returnPostStr : returnPreStr,
          returnPost: returnPostStr,
          lifeExpectancy: planData.personaMode === 'retired'
            ? String(lifeExpectancyForRetired)
            : '85',
          // Goal-adjusted post-retirement monthly expense; used by calculations.ts
          // to size the required corpus and post-retirement drawdown correctly.
          postRetirementMonthlyExpense: planData.personaMode === 'retired'
            ? String(planData.monthlyWithdrawal || planData.monthlyExpenseTotal)
            : String(postRetirementMonthlyExpense),
        },
        householdMembers: [
          {
            id: '1',
            relation: 'self',
            name: planData.fullName,
            dob: planData.dob ?? `${currentYear - 35}-01-01`,
            dependent: false,
          },
          ...(planData.spouseDob ? [{
            id: '2',
            relation: 'spouse',
            name: planData.spouseName || 'Spouse',
            dob: planData.spouseDob,
            dependent: false,
          }] : []),
          ...(planData.children ?? []).map((child: any, i: number) => ({
            id: `child-${i}`,
            relation: 'child',
            name: child.name || `Child ${i + 1}`,
            dob: child.dob && child.dob.trim() !== '' ? child.dob : null,
            dependent: true,
          })),
        ],
        incomeItems: planData.personaMode === 'retired'
          // Retired: dummy salary end=currentYear pins retirementYear correctly; no actual income
          ? [{
              id: 'retired-marker',
              type: 'salary',
              amount: '0',
              frequency: 'annual',
              start: currentYear - 1,
              end: currentYear,
              growthRate: '0',
            }]
          // Accumulating: own salary + optional spouse salary
          : [
              {
                id: '1',
                type: 'salary',
                amount: String(planData.monthlyIncomeTotal * 12),
                frequency: 'annual',
                start: currentYear,
                end: retirementYear,
                growthRate: planData.incomeGrowthRate?.toString() ?? '8',
              },
              ...(planData.spouseMonthlyIncome && planData.spouseMonthlyIncome > 0 && planData.spouseDob
                ? [{
                    id: '2',
                    type: 'salary',
                    amount: String(planData.spouseMonthlyIncome * 12),
                    frequency: 'annual',
                    start: currentYear,
                    end: new Date(planData.spouseDob).getFullYear() + (planData.spouseRetirementAge ?? 60),
                    growthRate: '5',
                  }]
                : []),
            ],
        expenseItems: [
          {
            id: '1',
            type: 'core',
            amountMonthly: planData.personaMode === 'retired'
              ? String(planData.monthlyWithdrawal || planData.monthlyExpenseTotal)
              : String(planData.monthlyExpenseTotal),
          },
        ],
        goals: planData.personaMode === 'retired' ? [] : [
          ...(planData.children ?? []).flatMap((child, i) => {
            const childBirth = child.dob ? new Date(child.dob).getFullYear() : currentYear + 5;
            const goals: any[] = [];
            if (child.eduTodaysCost && child.eduTodaysCost > 0) {
              goals.push({ id: `edu-${i}`, kind: 'child_edu', todaysCost: String(child.eduTodaysCost), targetYear: childBirth + 20, inflationCategory: 'education' });
            }
            if (child.marriageTodaysCost && child.marriageTodaysCost > 0) {
              goals.push({ id: `mar-${i}`, kind: 'child_marriage', todaysCost: String(child.marriageTodaysCost), targetYear: childBirth + 30, inflationCategory: 'headline' });
            }
            return goals;
          }),
          ...(planData.customGoals ?? []).map((g, i) => ({
            id: `custom-${i}`,
            kind: 'other',
            name: g.name,
            todaysCost: String(g.todaysCost),
            targetYear: currentYear + g.yearsFromNow,
            inflationCategory: 'headline',
          })),
        ],
        assets: retiredAssets,
        liabilities: planData.existingEMI?.emiAmount ? [{
          id: '1',
          name: 'Existing EMI',
          type: 'other',
          principalLeft: '0',
          rate: '0',
          emi: String(planData.existingEMI.emiAmount),
          tenureMonths: (planData.existingEMI.tenureRemainingMonths ?? 0) % 12,
          tenureYears: Math.floor((planData.existingEMI.tenureRemainingMonths ?? 0) / 12),
          endDate: (() => {
            const d = new Date();
            d.setMonth(d.getMonth() + (planData.existingEMI?.tenureRemainingMonths ?? 0));
            return d.toISOString().split('T')[0];
          })(),
        }] : [],
        miniRetirements: planData.miniRetirement?.startYear && planData.personaMode !== 'retired' ? [{
          id: '1',
          start: planData.miniRetirement.startYear,
          months: planData.miniRetirement.durationMonths,
          incomeDuring: '0',
          expenseDeltaPct: '0',
        }] : [],
      };

      const calculations = await calculateRetirementPlan(scenarioData as any);
      res.json(calculations);
    } catch (error: any) {
      console.error("Guest plan calculation error:", error);
      res.status(500).json({ message: "Calculation failed", error: error.message });
    }
  });

  // Quick plan creation with limit check
  app.post('/api/plan/quick', isAuthenticated, async (req: any, res) => {
    const userId: string = req.user.claims.sub;
    try {
      console.log("=== PLAN CREATION START ===");
      console.log("User ID:", userId);

      // Validate input before touching the DB so malformed requests never
      // consume quota or create partial records.
      const validationResult = quickPlanSchema.safeParse(req.body);
      if (!validationResult.success) {
        console.log("=== VALIDATION FAILED ===");
        console.log("Validation errors:", JSON.stringify(validationResult.error.issues, null, 2));
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validationResult.error.issues 
        });
      }
      const planData = validationResult.data;
      console.log("Plan data parsed successfully");

      // Fetch CRM defaults outside the transaction (read-only, safe to retry).
      const crmDefaults = await storage.getCrmDefaults();

      // Wrap quota check-and-increment + ALL sub-record inserts in a single
      // transaction.  Any failure automatically rolls back planCount and every
      // partial insert — no compensating decrement needed.
      let scenario;
      try {
        scenario = await db.transaction(async (tx) => {
          // 1. Atomic quota check-and-increment
          const [grantedUser] = await tx
            .update(users)
            .set({ planCount: sql`COALESCE(${users.planCount}, 0) + 1`, updatedAt: new Date() })
            .where(
              and(
                eq(users.id, userId),
                or(eq(users.isPremium, true), sql`COALESCE(${users.planCount}, 0) < 10`)
              )
            )
            .returning();

          if (!grantedUser) {
            const err: any = new Error("Plan limit reached");
            err.code = "PLAN_LIMIT_REACHED";
            throw err;
          }

          // 2. Create scenario
          const [newScenario] = await tx.insert(scenarios).values({
            userId,
            name: `${planData.fullName}'s Retirement Plan`,
            mode: 'quick',
          }).returning();
          const scenarioId = newScenario.id;
          console.log("Scenario created:", scenarioId);

          // 3. Assumptions
          const authCurrentYear = new Date().getFullYear();
          const authCurrentAge = planData.dob
            ? authCurrentYear - new Date(planData.dob).getFullYear()
            : 35;
          const authIsRetired = planData.personaMode === 'retired';
          const authLifeExpectancyNum = authIsRetired
            ? Math.min(authCurrentAge + (planData.yearsToCover ?? 25), 100)
            : parseInt(String(crmDefaults.lifeExpectancy ?? '85')) || 85;
          // In retired mode all years are post-retirement, so use returnPost throughout
          const authReturnPre = authIsRetired
            ? (planData.assumptions?.returnPost?.toString() || String(crmDefaults.returnPost ?? '7.0'))
            : (planData.assumptions?.returnPre?.toString() || String(crmDefaults.returnPre ?? '10.0'));

          // Goal multiplier for authenticated plans
          const AUTH_GOAL_MULTIPLIERS = { fire: 0.6, lean: 0.75, comfortable: 1.0, lavish: 1.3 } as const;
          const authGoalMultiplier = AUTH_GOAL_MULTIPLIERS[planData.retirementGoal as keyof typeof AUTH_GOAL_MULTIPLIERS] ?? 1.0;
          const authPostRetirementExpense = authIsRetired
            ? (planData.monthlyWithdrawal || planData.monthlyExpenseTotal)
            : Math.round(planData.monthlyExpenseTotal * authGoalMultiplier);

          await tx.insert(assumptions).values({
            scenarioId,
            inflationHeadline: planData.assumptions?.inflationHeadline?.toString() || crmDefaults.inflationHeadline,
            inflationEdu: crmDefaults.inflationEdu,
            inflationHealth: crmDefaults.inflationHealth,
            returnPre: authReturnPre,
            returnPost: planData.assumptions?.returnPost?.toString() || crmDefaults.returnPost,
            lifeExpectancy: authLifeExpectancyNum,
            source: planData.assumptions ? 'user' : 'crm',
            // Goal-adjusted post-retirement expense (today's ₹).
            // Stored separately from the core expense item so calculations.ts can apply
            // it only to post-retirement years while using actual spending pre-retirement.
            postRetirementMonthlyExpense: String(authPostRetirementExpense),
          });

          // 4. Household members
          await tx.insert(householdMembers).values({
            scenarioId,
            name: planData.fullName,
            relation: 'self',
            dob: planData.dob && planData.dob.trim() !== '' ? planData.dob : null,
            dependent: false,
          });

          if (planData.spouseDob && planData.spouseDob.trim() !== '') {
            await tx.insert(householdMembers).values({
              scenarioId,
              name: planData.spouseName || 'Spouse',
              relation: 'spouse',
              dob: planData.spouseDob,
              dependent: false,
            });
            // Spouse income stream is inserted AFTER the primary salary (step 5)
            // so the calculation engine's first-salary lookup always finds the
            // primary user's salary, not the spouse's.  See step 5b below.
          }

          if (planData.children && planData.children.length > 0) {
            for (const child of planData.children) {
              if (child.name) {
                await tx.insert(householdMembers).values({
                  scenarioId,
                  name: child.name,
                  relation: 'child',
                  dob: child.dob && child.dob.trim() !== '' ? child.dob : null,
                  dependent: true,
                  dependenceEnd: child.dob && child.dob.trim() !== '' ? new Date(child.dob).getFullYear() + 25 : undefined,
                });
                if (child.eduTodaysCost && child.eduTodaysCost > 0) {
                  await tx.insert(goals).values({
                    scenarioId,
                    kind: 'child_edu',
                    todaysCost: child.eduTodaysCost.toString(),
                    targetYear: child.dob && child.dob.trim() !== '' ? new Date(child.dob).getFullYear() + 20 : new Date().getFullYear() + 20,
                    inflationCategory: 'education',
                  });
                }
                if (child.marriageTodaysCost && child.marriageTodaysCost > 0) {
                  await tx.insert(goals).values({
                    scenarioId,
                    kind: 'child_marriage',
                    todaysCost: child.marriageTodaysCost.toString(),
                    targetYear: child.dob && child.dob.trim() !== '' ? new Date(child.dob).getFullYear() + 30 : new Date().getFullYear() + 30,
                    inflationCategory: 'headline',
                  });
                }
              }
            }
          }

          // 5. Income
          console.log("Creating income item...");
          if (authIsRetired) {
            // Retired mode: dummy salary with end = currentYear pins retirementYear = now
            // in the calculation engine so all projection years are post-retirement.
            await tx.insert(incomeItems).values({
              scenarioId,
              type: 'salary',
              amount: '0',
              frequency: 'annual',
              start: authCurrentYear - 1,
              end: authCurrentYear,
            });
          } else {
            await tx.insert(incomeItems).values({
              scenarioId,
              type: 'salary',
              amount: (planData.monthlyIncomeTotal * 12).toString(),
              frequency: 'annual',
              start: authCurrentYear,
              end: new Date(planData.dob).getFullYear() + planData.retirementAge,
            });
          }

          // 5b. Spouse income — inserted AFTER primary salary so the calculation engine's
          // first-salary lookup always finds the primary user's salary.
          // Omitted in retired mode because retired scenarios use a dummy salary only.
          if (!authIsRetired && planData.spouseDob && planData.spouseDob.trim() !== ''
              && planData.spouseMonthlyIncome && planData.spouseMonthlyIncome > 0) {
            const spouseBirthYear = new Date(planData.spouseDob).getFullYear();
            const spouseRetirementYear = spouseBirthYear + (planData.spouseRetirementAge ?? 60);
            await tx.insert(incomeItems).values({
              scenarioId,
              type: 'salary',
              amount: (planData.spouseMonthlyIncome * 12).toString(),
              frequency: 'annual',
              start: authCurrentYear,
              end: spouseRetirementYear,
            });
          }

          // 6. Expenses — always persist the user's CURRENT monthly expense as the expense
          // item so pre-retirement cash-flow projection is accurate.  The goal-adjusted
          // post-retirement amount is stored separately in assumptions.postRetirementMonthlyExpense
          // and is applied only to post-retirement years by calculations.ts.
          const authCurrentExpense = authIsRetired
            ? (planData.monthlyWithdrawal || planData.monthlyExpenseTotal)
            : planData.monthlyExpenseTotal;
          await tx.insert(expenseItems).values({
            scenarioId,
            type: 'core',
            amountMonthly: authCurrentExpense.toString(),
          });

          // 7. Assets — retired mode: persist current corpus as the primary corpus asset
          if (authIsRetired && planData.currentCorpus && planData.currentCorpus > 0) {
            await tx.insert(assets).values({
              scenarioId,
              kind: 'equity',
              value: planData.currentCorpus.toString(),
              expectedReturnPre: planData.assumptions?.returnPost?.toString() || crmDefaults.returnPost,
              expectedReturnPost: planData.assumptions?.returnPost?.toString() || crmDefaults.returnPost,
            });
          }

          if (!authIsRetired && planData.assetsLumpSum && planData.assetsLumpSum > 0) {
            await tx.insert(assets).values({
              scenarioId,
              kind: 'equity',
              value: planData.assetsLumpSum.toString(),
              expectedReturnPre: planData.assetsLumpSumReturn?.toString() || planData.preRetirementReturn?.toString() || crmDefaults.returnPre,
              expectedReturnPost: planData.postRetirementReturn?.toString() || crmDefaults.returnPost,
            });
          }

          // EPF/NPS are added as separate assets only in accumulating mode.
          // In retired mode the user enters currentCorpus which already includes
          // their EPF/NPS balance, so adding them again would double-count.
          // Each carries its own expected return and monthly contribution, which
          // calculations.ts grows independently of the general savings pool.
          if (!authIsRetired) {
            if (planData.epfCorpus && planData.epfCorpus > 0) {
              await tx.insert(assets).values({
                scenarioId,
                kind: 'equity',
                value: planData.epfCorpus.toString(),
                expectedReturnPre: planData.epfReturn?.toString() || '8',
                expectedReturnPost: crmDefaults.returnPost,
                monthlyContribution: (planData.epfMonthlyContribution ?? 0).toString(),
              });
            }
            if (planData.npsCorpus && planData.npsCorpus > 0) {
              await tx.insert(assets).values({
                scenarioId,
                kind: 'equity',
                value: planData.npsCorpus.toString(),
                expectedReturnPre: planData.npsReturn?.toString() || '10',
                expectedReturnPost: crmDefaults.returnPost,
                monthlyContribution: (planData.npsMonthlyContribution ?? 0).toString(),
              });
            }
          }

          // 8. Custom goals
          if (planData.customGoals && planData.customGoals.length > 0) {
            for (const g of planData.customGoals) {
              await tx.insert(goals).values({
                scenarioId,
                kind: 'other',
                name: g.name,
                todaysCost: g.todaysCost.toString(),
                targetYear: new Date().getFullYear() + g.yearsFromNow,
                inflationCategory: 'headline',
              });
            }
          }

          // 9. Mini retirement
          if (planData.miniRetirement?.startYear && planData.miniRetirement?.durationMonths) {
            await tx.insert(miniRetirements).values({
              scenarioId,
              start: planData.miniRetirement.startYear,
              months: planData.miniRetirement.durationMonths,
              incomeDuring: '0',
              expenseDeltaPct: '0',
            });
          }

          // 9. Existing EMI as liability
          if (planData.existingEMI?.emiAmount && planData.existingEMI?.tenureRemainingMonths) {
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + planData.existingEMI.tenureRemainingMonths);
            await tx.insert(liabilities).values({
              scenarioId,
              name: 'Existing EMI',
              type: 'other',
              principalLeft: '0',
              rate: '0',
              emi: planData.existingEMI.emiAmount.toString(),
              tenureMonths: planData.existingEMI.tenureRemainingMonths % 12,
              tenureYears: Math.floor(planData.existingEMI.tenureRemainingMonths / 12),
              endDate: endDate.toISOString().split('T')[0],
            });
          }

          return newScenario;
        });
      } catch (txErr: any) {
        if (txErr.code === "PLAN_LIMIT_REACHED") {
          return res.status(402).json({
            message: "Plan limit reached. Upgrade to premium for unlimited plans.",
            requiresPayment: true,
          });
        }
        throw txErr;
      }

      // Run a corpus calculation immediately after creation so plan cards on
      // the home page always show a projected corpus figure without requiring
      // the user to open the plan first (which would trigger POST /api/calc/:id).
      try {
        const scenarioData = await storage.getScenarioWithAllData(scenario.id);
        if (scenarioData) {
          const calculations = await calculateRetirementPlan(scenarioData);
          await storage.updateScenarioCorpus(
            scenario.id,
            calculations.summary.projectedCorpusAtRetirement,
          );
          // Surface the corpus in the response body so the client can
          // display it immediately without an extra list refetch.
          (scenario as any).projectedCorpus =
            calculations.summary.projectedCorpusAtRetirement;
        }
      } catch {
        // Corpus calculation is an optimisation — never fail plan creation.
      }

      res.json(scenario);
    } catch (error: any) {
      console.error("=== PLAN CREATION ERROR ===");
      console.error("Error type:", error.constructor?.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      if (error instanceof z.ZodError) {
        console.error("Zod validation errors:", error.issues);
        return res.status(400).json({ message: "Invalid plan data", errors: error.issues });
      }
      res.status(500).json({ 
        message: "Failed to create plan. Please try again.",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Financial calculations
  app.post('/api/calc/:scenarioId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const scenario = await storage.getScenario(req.params.scenarioId);
      
      if (!scenario || scenario.userId !== userId) {
        return res.status(404).json({ message: "Scenario not found" });
      }

      const scenarioData = await storage.getScenarioWithAllData(req.params.scenarioId);
      if (!scenarioData) {
        return res.status(404).json({ message: "Scenario data not found" });
      }

      // Support live rate overrides from the dashboard without saving
      const { overrideReturnPre, overrideReturnPost } = req.body || {};
      if ((overrideReturnPre || overrideReturnPost) && scenarioData.assumptions) {
        if (overrideReturnPre) scenarioData.assumptions.returnPre = String(overrideReturnPre);
        if (overrideReturnPost) scenarioData.assumptions.returnPost = String(overrideReturnPost);
      }

      const calculations = await calculateRetirementPlan(scenarioData);

      // Persist the projected corpus on the scenario row so plan cards can
      // display it without re-running the full calculation engine.
      // Skip when live rate overrides are active — those results are ephemeral.
      if (!overrideReturnPre && !overrideReturnPost) {
        storage.updateScenarioCorpus(
          req.params.scenarioId,
          calculations.summary.projectedCorpusAtRetirement,
        ).catch(() => { /* best-effort, don't fail the response */ });
      }

      res.json(calculations);
    } catch (error) {
      console.error("Error calculating plan:", error);
      res.status(500).json({ message: "Failed to calculate plan" });
    }
  });

  // Lead capture
  app.post('/api/lead', async (req, res) => {
    try {
      const leadData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(leadData);
      
      // Update scenario with lead ID if provided
      if (leadData.scenarioId) {
        await storage.updateScenario(leadData.scenarioId, { leadId: lead.id });
      }
      
      res.json(lead);
    } catch (error) {
      console.error("Error creating lead:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid lead data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create lead" });
    }
  });

  // User profile routes
  app.get('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.put('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const allowed = ['phone','dob','retirementAge','monthlyIncome','monthlyExpenses','monthlySavings','incomeGrowthRate','currentAssets','firstName','lastName'];
      const profile: any = {};
      for (const key of allowed) {
        if (req.body[key] !== undefined) profile[key] = req.body[key];
      }
      const user = await storage.updateUserProfile(userId, profile);
      res.json(user);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Share tracking
  app.post('/api/share', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.incrementShareCount(userId);
      res.json({ shareCount: user.shareCount });
    } catch (error) {
      console.error("Error recording share:", error);
      res.status(500).json({ message: "Failed to record share" });
    }
  });

  // Get all leads (admin only)
  app.get('/api/leads', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const allLeads = await db.select().from(leads).orderBy(leads.createdAt);
      res.json(allLeads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  // PDF export - GET route requires authentication and ownership check
  app.get('/api/export/pdf/:scenarioId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const scenario = await storage.getScenario(req.params.scenarioId);

      if (!scenario || scenario.userId !== userId) {
        return res.status(404).json({ message: "Scenario not found" });
      }

      const scenarioData = await storage.getScenarioWithAllData(req.params.scenarioId);
      if (!scenarioData) {
        return res.status(404).json({ message: "Scenario data not found" });
      }

      const calculations = await calculateRetirementPlan(scenarioData);
      const pdfBuffer = await generatePDF(scenarioData, calculations);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="retirement-plan-${scenarioData.name}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.end(pdfBuffer);
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  app.post('/api/export/pdf/:scenarioId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const scenario = await storage.getScenario(req.params.scenarioId);
      
      if (!scenario || scenario.userId !== userId) {
        return res.status(404).json({ message: "Scenario not found" });
      }

      const scenarioData = await storage.getScenarioWithAllData(req.params.scenarioId);
      if (!scenarioData) {
        return res.status(404).json({ message: "Scenario data not found" });
      }
      const calculations = await calculateRetirementPlan(scenarioData);
      
      const pdfBuffer = await generatePDF(scenarioData, calculations);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${scenarioData.name}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.end(pdfBuffer);
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  // Excel export endpoint
  app.get('/api/export/excel/:scenarioId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const scenario = await storage.getScenario(req.params.scenarioId);
      
      if (!scenario || scenario.userId !== userId) {
        return res.status(404).json({ message: "Scenario not found" });
      }

      const scenarioData = await storage.getScenarioWithAllData(req.params.scenarioId);
      if (!scenarioData) {
        return res.status(404).json({ message: "Scenario data not found" });
      }
      
      const calculations = await calculateRetirementPlan(scenarioData);

      const wb = XLSX.utils.book_new();

      // Summary Sheet
      const summaryRows = [
        ["Retirement Plan Summary", "", "", ""],
        ["Plan Name", scenarioData.name, "", ""],
        ["Generated On", new Date().toLocaleDateString('en-IN'), "", ""],
        ["", "", "", ""],
        ["Metric", "Value", "", ""],
        ["Projected Corpus at Retirement", `₹${(calculations.summary.projectedCorpusAtRetirement / 10000000).toFixed(2)} Cr`, "", ""],
        ["Required Corpus at Retirement", `₹${(calculations.summary.requiredCorpusAtRetirement / 10000000).toFixed(2)} Cr`, "", ""],
        ["Surplus / Gap", calculations.summary.gap > 0 ? `-₹${(calculations.summary.gap / 10000000).toFixed(2)} Cr (Shortfall)` : "Surplus — on track!", "", ""],
        ["Retirement Year", calculations.summary.retirementYear.toString(), "", ""],
        ["SIP Required to Close Gap", calculations.summary.sipRequired && calculations.summary.sipRequired > 0 ? `₹${calculations.summary.sipRequired.toLocaleString('en-IN')} / month` : "None — no gap!", "", ""],
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
      summarySheet['!cols'] = [{ wch: 35 }, { wch: 30 }, { wch: 20 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

      // Year-by-Year Detail Sheet
      const headers = [
        "Year", "Age", "Annual Income (₹)", "Regular Expenses (₹)",
        "EMI Payments (₹)", "Goal Expenses (₹)", "Total Outflow (₹)",
        "Net Surplus / Deficit (₹)", "Portfolio Return (₹)", "Net Worth (₹)", "Notes & Events"
      ];
      
      const detailRows = [headers, ...calculations.yearlyDetail.map(row => [
        row.year,
        row.age,
        row.income,
        row.regularExpenses,
        row.emiExpenses,
        row.goalExpenses,
        row.totalExpenses,
        row.netSavings,
        row.portfolioReturn,
        row.netWorth,
        row.notes.join('; ')
      ])];

      const detailSheet = XLSX.utils.aoa_to_sheet(detailRows);
      detailSheet['!cols'] = [
        { wch: 8 }, { wch: 8 }, { wch: 20 }, { wch: 22 },
        { wch: 18 }, { wch: 20 }, { wch: 20 },
        { wch: 24 }, { wch: 20 }, { wch: 18 }, { wch: 60 }
      ];
      XLSX.utils.book_append_sheet(wb, detailSheet, "Year-by-Year Projections");

      // Assumptions Sheet
      const assumptionRows = [
        ["Planning Assumptions Used", ""],
        ["Inflation (General)", `${scenarioData.assumptions?.inflationHeadline || '6.0'}%`],
        ["Inflation (Education)", `${scenarioData.assumptions?.inflationEdu || '8.0'}%`],
        ["Pre-retirement Return", `${scenarioData.assumptions?.returnPre || '10.0'}%`],
        ["Post-retirement Return", `${scenarioData.assumptions?.returnPost || '7.0'}%`],
        ["Life Expectancy", `${scenarioData.assumptions?.lifeExpectancy || 85} years`],
        ["Income Growth Rate", "8% per annum"],
      ];
      const assumptionSheet = XLSX.utils.aoa_to_sheet(assumptionRows);
      assumptionSheet['!cols'] = [{ wch: 30 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, assumptionSheet, "Assumptions");

      const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      
      const safeName = scenarioData.name.replace(/[^a-zA-Z0-9 ]/g, '');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${safeName} - Retirement Plan.xlsx"`);
      res.setHeader('Content-Length', excelBuffer.length);
      res.end(excelBuffer);
    } catch (error) {
      console.error("Error generating Excel:", error);
      res.status(500).json({ message: "Failed to generate Excel" });
    }
  });

  // Analytics and reporting endpoint for daily emails
  app.get('/api/analytics/daily', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Get daily stats
      const allUsers = await db.select().from(users);
      const allScenarios = await db.select().from(scenarios);
      
      const newUsersToday = allUsers.filter(u => 
        u.createdAt && new Date(u.createdAt).toDateString() === today.toDateString()
      ).length;
      
      const newPlansToday = allScenarios.filter(s => 
        s.createdAt && new Date(s.createdAt).toDateString() === today.toDateString()
      ).length;
      
      const totalUsers = allUsers.length;
      const totalPlans = allScenarios.length;
      
      const analytics = {
        date: today.toISOString().split('T')[0],
        newUsers: newUsersToday,
        totalUsers,
        newPlans: newPlansToday,
        totalPlans,
        avgPlansPerUser: totalUsers > 0 ? (totalPlans / totalUsers).toFixed(2) : 0,
        message: `Daily Analytics Report - ${newUsersToday} new users, ${newPlansToday} new retirement plans created`,
        premiumUsers: allUsers.filter(u => u.isPremium).length,
        revenueGenerated: allUsers.filter(u => u.isPremium).length * 2 // $2 per premium user
      };
      
      res.json(analytics);
    } catch (error) {
      console.error("Error generating analytics:", error);
      res.status(500).json({ message: "Failed to generate analytics" });
    }
  });

  // Payment upgrade endpoint for premium plans
  // NOTE: This endpoint requires a verified payment provider integration before
  // it can safely grant premium status. Accepting a client-supplied token as
  // proof of payment without server-side verification with a payment processor
  // allows any user to obtain premium for free.  Until a real payment flow is
  // wired up (Stripe, Razorpay, etc.) this endpoint is disabled.
  app.post('/api/upgrade/premium', isAuthenticated, async (_req, res) => {
    return res.status(501).json({
      message: "Premium upgrade is not yet available. Payment provider integration is pending.",
    });
  });

  // List all newsletter subscribers (admin only)
  app.get('/api/subscribers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const subs = await storage.getSubscribers();
      res.json(subs);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      res.status(500).json({ message: "Failed to fetch subscribers" });
    }
  });

  // Newsletter subscription — stores email for future campaigns
  app.post('/api/subscribe', async (req, res) => {
    try {
      const schema = z.object({
        email: z.string().email("Please enter a valid email address"),
        source: z.string().optional(),
      });
      const { email, source } = schema.parse(req.body);
      const subscriber = await storage.subscribeEmail(email.toLowerCase().trim(), source || 'blog');
      res.json({ success: true, id: subscriber.id });
    } catch (error: any) {
      if (error?.issues) {
        return res.status(400).json({ message: error.issues[0]?.message || "Invalid email" });
      }
      console.error("Error saving subscriber:", error);
      res.status(500).json({ message: "Failed to subscribe" });
    }
  });

  app.get('/api/healthz', (_req, res) => {
    res.json({ status: 'ok' });
  });

  const httpServer = createServer(app);
  return httpServer;
}
