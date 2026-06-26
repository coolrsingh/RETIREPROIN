import {
  users,
  scenarios,
  assumptions,
  householdMembers,
  incomeItems,
  expenseItems,
  goals,
  assets,
  liabilities,
  miniRetirements,
  leads,
  crmDefaults,
  type User,
  type UpsertUser,
  type Scenario,
  type InsertScenario,
  type Assumptions,
  type InsertAssumptions,
  type HouseholdMember,
  type InsertHouseholdMember,
  type IncomeItem,
  type InsertIncomeItem,
  type ExpenseItem,
  type InsertExpenseItem,
  type Goal,
  type InsertGoal,
  type Asset,
  type InsertAsset,
  type Liability,
  type InsertLiability,
  type MiniRetirement,
  type InsertMiniRetirement,
  type Lead,
  type InsertLead,
  type CrmDefaults,
  type InsertCrmDefaults,
} from "@workspace/db";
import { db } from "./db";
import { eq, and, or, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserPlanCount(userId: string, count: number): Promise<User>;
  /**
   * Atomically increments planCount only when the user is either premium or
   * currently below the 10-plan free-tier limit.  Returns the updated user
   * record, or null when the limit is already reached.
   */
  atomicIncrementPlanCount(userId: string): Promise<User | null>;
  /**
   * Compensating decrement used when scenario creation fails after quota was
   * already charged. Never goes below 0.
   */
  decrementPlanCount(userId: string): Promise<void>;
  updateUserProfile(userId: string, profile: Partial<UpsertUser>): Promise<User>;
  incrementShareCount(userId: string): Promise<User>;
  
  // Scenario operations
  getScenario(id: string): Promise<Scenario | undefined>;
  getScenariosByUser(userId: string): Promise<Scenario[]>;
  createScenario(scenario: InsertScenario): Promise<Scenario>;
  updateScenario(id: string, scenario: Partial<InsertScenario>): Promise<Scenario>;
  deleteScenario(id: string): Promise<void>;
  
  // Scenario data operations
  getScenarioWithAllData(id: string): Promise<any>;
  
  // Assumptions operations
  getAssumptions(scenarioId: string): Promise<Assumptions | undefined>;
  upsertAssumptions(assumptions: InsertAssumptions): Promise<Assumptions>;
  
  // Household members operations
  getHouseholdMembers(scenarioId: string): Promise<HouseholdMember[]>;
  createHouseholdMember(member: InsertHouseholdMember): Promise<HouseholdMember>;
  updateHouseholdMember(id: string, member: Partial<InsertHouseholdMember>): Promise<HouseholdMember>;
  deleteHouseholdMember(id: string): Promise<void>;
  
  // Income operations
  getIncomeItems(scenarioId: string): Promise<IncomeItem[]>;
  createIncomeItem(income: InsertIncomeItem): Promise<IncomeItem>;
  updateIncomeItem(id: string, income: Partial<InsertIncomeItem>): Promise<IncomeItem>;
  deleteIncomeItem(id: string): Promise<void>;
  
  // Expense operations
  getExpenseItems(scenarioId: string): Promise<ExpenseItem[]>;
  createExpenseItem(expense: InsertExpenseItem): Promise<ExpenseItem>;
  updateExpenseItem(id: string, expense: Partial<InsertExpenseItem>): Promise<ExpenseItem>;
  deleteExpenseItem(id: string): Promise<void>;
  
  // Goals operations
  getGoals(scenarioId: string): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: string, goal: Partial<InsertGoal>): Promise<Goal>;
  deleteGoal(id: string): Promise<void>;
  
  // Assets operations
  getAssets(scenarioId: string): Promise<Asset[]>;
  createAsset(asset: InsertAsset): Promise<Asset>;
  updateAsset(id: string, asset: Partial<InsertAsset>): Promise<Asset>;
  deleteAsset(id: string): Promise<void>;
  
  // Liabilities operations
  getLiabilities(scenarioId: string): Promise<Liability[]>;
  createLiability(liability: InsertLiability): Promise<Liability>;
  updateLiability(id: string, liability: Partial<InsertLiability>): Promise<Liability>;
  deleteLiability(id: string): Promise<void>;
  
  // Mini retirements operations
  getMiniRetirements(scenarioId: string): Promise<MiniRetirement[]>;
  createMiniRetirement(miniRetirement: InsertMiniRetirement): Promise<MiniRetirement>;
  updateMiniRetirement(id: string, miniRetirement: Partial<InsertMiniRetirement>): Promise<MiniRetirement>;
  deleteMiniRetirement(id: string): Promise<void>;
  
  // Lead operations
  createLead(lead: InsertLead): Promise<Lead>;
  getLead(id: string): Promise<Lead | undefined>;
  
  // CRM defaults operations
  getCrmDefaults(): Promise<CrmDefaults>;
  updateCrmDefaults(defaults: Partial<InsertCrmDefaults>): Promise<CrmDefaults>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserPlanCount(userId: string, count: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ planCount: count, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async atomicIncrementPlanCount(userId: string): Promise<User | null> {
    // Both the WHERE guard and the SET expression use COALESCE so that NULL
    // plan_count rows (legacy data) are treated as 0 rather than silently
    // bypassing the limit (NULL + 1 = NULL, NULL < 10 = NULL = falsy in SQL).
    const [user] = await db
      .update(users)
      .set({ planCount: sql`COALESCE(${users.planCount}, 0) + 1`, updatedAt: new Date() })
      .where(
        and(
          eq(users.id, userId),
          or(eq(users.isPremium, true), sql`COALESCE(${users.planCount}, 0) < 10`)
        )
      )
      .returning();
    return user ?? null;
  }

  async decrementPlanCount(userId: string): Promise<void> {
    // Compensating update: called when scenario creation fails after the quota
    // was already charged. GREATEST prevents the counter going below 0.
    await db
      .update(users)
      .set({ planCount: sql`GREATEST(COALESCE(${users.planCount}, 0) - 1, 0)`, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async updateUserProfile(userId: string, profile: Partial<UpsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async incrementShareCount(userId: string): Promise<User> {
    const existing = await this.getUser(userId);
    const newCount = (existing?.shareCount || 0) + 1;
    const [user] = await db
      .update(users)
      .set({ shareCount: newCount, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Scenario operations
  async getScenario(id: string): Promise<Scenario | undefined> {
    const [scenario] = await db.select().from(scenarios).where(eq(scenarios.id, id));
    return scenario;
  }

  async getScenariosByUser(userId: string): Promise<Scenario[]> {
    return db.select().from(scenarios).where(eq(scenarios.userId, userId));
  }

  async createScenario(scenario: InsertScenario): Promise<Scenario> {
    const [newScenario] = await db.insert(scenarios).values(scenario).returning();
    return newScenario;
  }

  async updateScenario(id: string, scenario: Partial<InsertScenario>): Promise<Scenario> {
    const [updatedScenario] = await db
      .update(scenarios)
      .set({ ...scenario, updatedAt: new Date() })
      .where(eq(scenarios.id, id))
      .returning();
    return updatedScenario;
  }

  async deleteScenario(id: string): Promise<void> {
    await db.delete(scenarios).where(eq(scenarios.id, id));
  }

  async getScenarioWithAllData(id: string) {
    const scenario = await this.getScenario(id);
    if (!scenario) return null;

    const [
      scenarioAssumptions,
      scenarioHouseholdMembers,
      scenarioIncomeItems,
      scenarioExpenseItems,
      scenarioGoals,
      scenarioAssets,
      scenarioLiabilities,
      scenarioMiniRetirements,
    ] = await Promise.all([
      this.getAssumptions(id),
      this.getHouseholdMembers(id),
      this.getIncomeItems(id),
      this.getExpenseItems(id),
      this.getGoals(id),
      this.getAssets(id),
      this.getLiabilities(id),
      this.getMiniRetirements(id),
    ]);

    return {
      ...scenario,
      assumptions: scenarioAssumptions,
      householdMembers: scenarioHouseholdMembers,
      incomeItems: scenarioIncomeItems,
      expenseItems: scenarioExpenseItems,
      goals: scenarioGoals,
      assets: scenarioAssets,
      liabilities: scenarioLiabilities,
      miniRetirements: scenarioMiniRetirements,
    };
  }

  // Assumptions operations
  async getAssumptions(scenarioId: string): Promise<Assumptions | undefined> {
    const [assumption] = await db.select().from(assumptions).where(eq(assumptions.scenarioId, scenarioId));
    return assumption;
  }

  async upsertAssumptions(assumptionData: InsertAssumptions): Promise<Assumptions> {
    // Check if assumptions already exist for this scenario
    const existing = await this.getAssumptions(assumptionData.scenarioId);
    
    if (existing) {
      // Update existing assumptions
      const [assumption] = await db
        .update(assumptions)
        .set(assumptionData)
        .where(eq(assumptions.scenarioId, assumptionData.scenarioId))
        .returning();
      return assumption;
    } else {
      // Insert new assumptions
      const [assumption] = await db
        .insert(assumptions)
        .values(assumptionData)
        .returning();
      return assumption;
    }
  }

  // Household members operations
  async getHouseholdMembers(scenarioId: string): Promise<HouseholdMember[]> {
    return db.select().from(householdMembers).where(eq(householdMembers.scenarioId, scenarioId));
  }

  async createHouseholdMember(member: InsertHouseholdMember): Promise<HouseholdMember> {
    const [newMember] = await db.insert(householdMembers).values(member).returning();
    return newMember;
  }

  async updateHouseholdMember(id: string, member: Partial<InsertHouseholdMember>): Promise<HouseholdMember> {
    const [updatedMember] = await db
      .update(householdMembers)
      .set(member)
      .where(eq(householdMembers.id, id))
      .returning();
    return updatedMember;
  }

  async deleteHouseholdMember(id: string): Promise<void> {
    await db.delete(householdMembers).where(eq(householdMembers.id, id));
  }

  // Income operations
  async getIncomeItems(scenarioId: string): Promise<IncomeItem[]> {
    return db.select().from(incomeItems).where(eq(incomeItems.scenarioId, scenarioId));
  }

  async createIncomeItem(income: InsertIncomeItem): Promise<IncomeItem> {
    const [newIncome] = await db.insert(incomeItems).values(income).returning();
    return newIncome;
  }

  async updateIncomeItem(id: string, income: Partial<InsertIncomeItem>): Promise<IncomeItem> {
    const [updatedIncome] = await db
      .update(incomeItems)
      .set(income)
      .where(eq(incomeItems.id, id))
      .returning();
    return updatedIncome;
  }

  async deleteIncomeItem(id: string): Promise<void> {
    await db.delete(incomeItems).where(eq(incomeItems.id, id));
  }

  // Expense operations
  async getExpenseItems(scenarioId: string): Promise<ExpenseItem[]> {
    return db.select().from(expenseItems).where(eq(expenseItems.scenarioId, scenarioId));
  }

  async createExpenseItem(expense: InsertExpenseItem): Promise<ExpenseItem> {
    const [newExpense] = await db.insert(expenseItems).values(expense).returning();
    return newExpense;
  }

  async updateExpenseItem(id: string, expense: Partial<InsertExpenseItem>): Promise<ExpenseItem> {
    const [updatedExpense] = await db
      .update(expenseItems)
      .set(expense)
      .where(eq(expenseItems.id, id))
      .returning();
    return updatedExpense;
  }

  async deleteExpenseItem(id: string): Promise<void> {
    await db.delete(expenseItems).where(eq(expenseItems.id, id));
  }

  // Goals operations
  async getGoals(scenarioId: string): Promise<Goal[]> {
    return db.select().from(goals).where(eq(goals.scenarioId, scenarioId));
  }

  async createGoal(goal: InsertGoal): Promise<Goal> {
    const [newGoal] = await db.insert(goals).values(goal).returning();
    return newGoal;
  }

  async updateGoal(id: string, goal: Partial<InsertGoal>): Promise<Goal> {
    const [updatedGoal] = await db
      .update(goals)
      .set(goal)
      .where(eq(goals.id, id))
      .returning();
    return updatedGoal;
  }

  async deleteGoal(id: string): Promise<void> {
    await db.delete(goals).where(eq(goals.id, id));
  }

  // Assets operations
  async getAssets(scenarioId: string): Promise<Asset[]> {
    return db.select().from(assets).where(eq(assets.scenarioId, scenarioId));
  }

  async createAsset(asset: InsertAsset): Promise<Asset> {
    const [newAsset] = await db.insert(assets).values(asset).returning();
    return newAsset;
  }

  async updateAsset(id: string, asset: Partial<InsertAsset>): Promise<Asset> {
    const [updatedAsset] = await db
      .update(assets)
      .set(asset)
      .where(eq(assets.id, id))
      .returning();
    return updatedAsset;
  }

  async deleteAsset(id: string): Promise<void> {
    await db.delete(assets).where(eq(assets.id, id));
  }

  // Liabilities operations
  async getLiabilities(scenarioId: string): Promise<Liability[]> {
    return db.select().from(liabilities).where(eq(liabilities.scenarioId, scenarioId));
  }

  async createLiability(liability: InsertLiability): Promise<Liability> {
    const [newLiability] = await db.insert(liabilities).values(liability).returning();
    return newLiability;
  }

  async updateLiability(id: string, liability: Partial<InsertLiability>): Promise<Liability> {
    const [updatedLiability] = await db
      .update(liabilities)
      .set(liability)
      .where(eq(liabilities.id, id))
      .returning();
    return updatedLiability;
  }

  async deleteLiability(id: string): Promise<void> {
    await db.delete(liabilities).where(eq(liabilities.id, id));
  }

  // Mini retirements operations
  async getMiniRetirements(scenarioId: string): Promise<MiniRetirement[]> {
    return db.select().from(miniRetirements).where(eq(miniRetirements.scenarioId, scenarioId));
  }

  async createMiniRetirement(miniRetirement: InsertMiniRetirement): Promise<MiniRetirement> {
    const [newMiniRetirement] = await db.insert(miniRetirements).values(miniRetirement).returning();
    return newMiniRetirement;
  }

  async updateMiniRetirement(id: string, miniRetirement: Partial<InsertMiniRetirement>): Promise<MiniRetirement> {
    const [updatedMiniRetirement] = await db
      .update(miniRetirements)
      .set(miniRetirement)
      .where(eq(miniRetirements.id, id))
      .returning();
    return updatedMiniRetirement;
  }

  async deleteMiniRetirement(id: string): Promise<void> {
    await db.delete(miniRetirements).where(eq(miniRetirements.id, id));
  }

  // Lead operations
  async createLead(lead: InsertLead): Promise<Lead> {
    const [newLead] = await db.insert(leads).values(lead).returning();
    return newLead;
  }

  async getLead(id: string): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead;
  }

  // CRM defaults operations
  async getCrmDefaults(): Promise<CrmDefaults> {
    let [defaults] = await db.select().from(crmDefaults).limit(1);
    
    if (!defaults) {
      // Create default entry if none exists
      [defaults] = await db.insert(crmDefaults).values({}).returning();
    }
    
    return defaults;
  }

  async updateCrmDefaults(defaultsData: Partial<InsertCrmDefaults>): Promise<CrmDefaults> {
    const existingDefaults = await this.getCrmDefaults();
    
    const [updatedDefaults] = await db
      .update(crmDefaults)
      .set({ ...defaultsData, updatedAt: new Date() })
      .where(eq(crmDefaults.id, existingDefaults.id))
      .returning();
    
    return updatedDefaults;
  }
}

export const storage = new DatabaseStorage();
