import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { calculateRetirementPlan } from "./calculations";
import { generatePDF } from "./pdf";
import { z } from "zod";
import { quickPlanSchema, insertScenarioSchema, insertLeadSchema, users, scenarios } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

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

      const defaults = await storage.updateCrmDefaults(req.body);
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
      const user = await storage.getUser(userId);
      
      // Check plan limit for non-premium users
      if (!user?.isPremium && (user?.planCount || 0) >= 10) {
        return res.status(402).json({ 
          message: "Plan limit reached. Upgrade to premium for unlimited plans.",
          requiresPayment: true,
          planCount: user?.planCount || 0
        });
      }
      
      const scenarioData = insertScenarioSchema.parse({
        ...req.body,
        userId,
      });

      const scenario = await storage.createScenario(scenarioData);
      
      // Increment plan count
      if (user) {
        await storage.updateUserPlanCount(userId, (user.planCount || 0) + 1);
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

      const updatedScenario = await storage.updateScenario(req.params.id, req.body);
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

  // Quick plan creation with limit check
  app.post('/api/plan/quick', isAuthenticated, async (req: any, res) => {
    try {
      console.log("=== PLAN CREATION DEBUG ===");
      console.log("Request body:", JSON.stringify(req.body, null, 2));
      console.log("User claims:", req.user?.claims);
      
      const userId = req.user.claims.sub;
      console.log("User ID:", userId);
      
      const user = await storage.getUser(userId);
      console.log("User from storage:", user);
      
      // Check plan limit for non-premium users
      if (!user?.isPremium && (user?.planCount || 0) >= 10) {
        return res.status(402).json({ 
          message: "Plan limit reached. Upgrade to premium for unlimited plans.",
          requiresPayment: true,
          planCount: user?.planCount || 0
        });
      }
      
      console.log("Attempting to parse plan data...");
      const planData = quickPlanSchema.parse(req.body);
      console.log("Plan data parsed successfully:", planData);

      // Create scenario
      const scenario = await storage.createScenario({
        userId,
        name: `${planData.fullName}'s Retirement Plan`,
        mode: 'quick',
      });

      // Get CRM defaults for missing assumptions
      const crmDefaults = await storage.getCrmDefaults();

      // Create assumptions
      await storage.upsertAssumptions({
        scenarioId: scenario.id,
        inflationHeadline: planData.assumptions?.inflationHeadline?.toString() || crmDefaults.inflationHeadline,
        inflationEdu: crmDefaults.inflationEdu,
        inflationHealth: crmDefaults.inflationHealth,
        returnPre: planData.assumptions?.returnPre?.toString() || crmDefaults.returnPre,
        returnPost: planData.assumptions?.returnPost?.toString() || crmDefaults.returnPost,
        lifeExpectancy: crmDefaults.lifeExpectancy,

        source: planData.assumptions ? 'user' : 'crm',
      });

      // Create household members
      await storage.createHouseholdMember({
        scenarioId: scenario.id,
        name: planData.fullName,
        relation: 'self',
        dob: planData.dob && planData.dob.trim() !== '' ? planData.dob : null,
        dependent: false,
      });

      if (planData.spouseDob && planData.spouseDob.trim() !== '') {
        await storage.createHouseholdMember({
          scenarioId: scenario.id,
          name: 'Spouse',
          relation: 'spouse',
          dob: planData.spouseDob,
          dependent: false,
        });
      }

      // Create children and their goals
      if (planData.children && planData.children.length > 0) {
        for (const child of planData.children) {
          if (child.name) {
            await storage.createHouseholdMember({
              scenarioId: scenario.id,
              name: child.name,
              relation: 'child',
              dob: child.dob && child.dob.trim() !== '' ? child.dob : null,
              dependent: true,
              dependenceEnd: child.dob && child.dob.trim() !== '' ? new Date(child.dob).getFullYear() + 25 : undefined,
            });

            if (child.eduTodaysCost && child.eduTodaysCost > 0) {
              await storage.createGoal({
                scenarioId: scenario.id,
                kind: 'child_edu',
                todaysCost: child.eduTodaysCost.toString(),
                targetYear: child.dob && child.dob.trim() !== '' ? new Date(child.dob).getFullYear() + 20 : new Date().getFullYear() + 20,
                inflationCategory: 'education',
              });
            }

            if (child.marriageTodaysCost && child.marriageTodaysCost > 0) {
              await storage.createGoal({
                scenarioId: scenario.id,
                kind: 'child_marriage',
                todaysCost: child.marriageTodaysCost.toString(),
                targetYear: child.dob && child.dob.trim() !== '' ? new Date(child.dob).getFullYear() + 30 : new Date().getFullYear() + 30,
                inflationCategory: 'headline',
              });
            }
          }
        }
      }

      // Create income item
      await storage.createIncomeItem({
        scenarioId: scenario.id,
        type: 'salary',
        amount: (planData.monthlyIncomeTotal * 12).toString(),
        frequency: 'annual',
        start: new Date().getFullYear(),
        end: new Date(planData.dob).getFullYear() + planData.retirementAge,
      });

      // Create basic expense from monthly total
      await storage.createExpenseItem({
        scenarioId: scenario.id,
        type: 'core',
        amountMonthly: planData.monthlyExpenseTotal.toString(),
      });

      // Create current assets
      if (planData.assetsLumpSum && planData.assetsLumpSum > 0) {
        await storage.createAsset({
          scenarioId: scenario.id,
          kind: 'equity',
          value: planData.assetsLumpSum.toString(),
          expectedReturnPre: planData.preRetirementReturn?.toString() || crmDefaults.returnPre,
          expectedReturnPost: planData.postRetirementReturn?.toString() || crmDefaults.returnPost,
        });
      }

      // Mini-retirement feature removed as requested

      // Increment plan count for the user
      if (user) {
        await storage.updateUserPlanCount(userId, (user.planCount || 0) + 1);
      }

      res.json(scenario);
    } catch (error) {
      console.error("Error creating quick plan:", error);
      console.error("Error stack:", error.stack);
      if (error instanceof z.ZodError) {
        console.error("Zod validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid plan data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create plan. Please try again." });
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
      const calculations = await calculateRetirementPlan(scenarioData);
      
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

  // PDF export - both GET and POST routes for flexibility
  app.get('/api/export/pdf/:scenarioId', async (req, res) => {
    try {
      const scenarioData = await storage.getScenarioWithAllData(req.params.scenarioId);
      if (!scenarioData) {
        return res.status(404).json({ message: "Scenario not found" });
      }

      const calculations = await calculateRetirementPlan(scenarioData);
      const pdfBuffer = await generatePDF(scenarioData, calculations);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="retirement-plan-${scenarioData.name}.pdf"`);
      res.send(pdfBuffer);
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
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  // Analytics and reporting endpoint for daily emails
  app.get('/api/analytics/daily', async (req, res) => {
    try {
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
  app.post('/api/upgrade/premium', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // In a real implementation, this would integrate with Stripe/Razorpay
      const { paymentToken } = req.body;
      
      if (!paymentToken) {
        return res.status(400).json({ message: "Payment token required for premium upgrade" });
      }
      
      // Simulate payment processing for $2 USD
      // await processPayment(paymentToken, 200); // 200 cents = $2
      
      // Update user to premium status
      const [updatedUser] = await db
        .update(users)
        .set({ isPremium: true, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning();
      
      res.json({ 
        message: "Successfully upgraded to premium! You now have unlimited retirement plans.",
        user: updatedUser
      });
    } catch (error) {
      console.error("Error upgrading to premium:", error);
      res.status(500).json({ message: "Failed to upgrade to premium" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
