import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { calculateRetirementPlan } from "./calculations";
import { generatePDF } from "./pdf";
import { z } from "zod";
import { quickPlanSchema, insertScenarioSchema, insertLeadSchema } from "@shared/schema";

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
      const scenarioData = insertScenarioSchema.parse({
        ...req.body,
        userId,
      });

      const scenario = await storage.createScenario(scenarioData);
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

  // Quick plan creation
  app.post('/api/plan/quick', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const planData = quickPlanSchema.parse(req.body);

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
        taxRegime: crmDefaults.taxRegime,
        source: planData.assumptions ? 'user' : 'crm',
      });

      // Create household members
      await storage.createHouseholdMember({
        scenarioId: scenario.id,
        name: planData.fullName,
        relation: 'self',
        dob: planData.dob,
        dependent: false,
      });

      if (planData.spouseDob) {
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
              dob: child.dob,
              dependent: true,
              dependenceEnd: child.dob ? new Date(child.dob).getFullYear() + 25 : undefined,
            });

            if (child.eduTodaysCost && child.eduTodaysCost > 0) {
              await storage.createGoal({
                scenarioId: scenario.id,
                kind: 'child_edu',
                todaysCost: child.eduTodaysCost.toString(),
                targetYear: child.dob ? new Date(child.dob).getFullYear() + 22 : new Date().getFullYear() + 18,
                inflationCategory: 'education',
              });
            }

            if (child.marriageTodaysCost && child.marriageTodaysCost > 0) {
              await storage.createGoal({
                scenarioId: scenario.id,
                kind: 'child_marriage',
                todaysCost: child.marriageTodaysCost.toString(),
                targetYear: child.dob ? new Date(child.dob).getFullYear() + 28 : new Date().getFullYear() + 25,
                inflationCategory: 'headline',
              });
            }
          }
        }
      }

      // Create basic expense from monthly total
      await storage.createExpenseItem({
        scenarioId: scenario.id,
        type: 'core',
        amountMonthly: planData.monthlyExpenseTotal.toString(),
      });

      // Create assets if provided
      if (planData.assetsLumpSum && planData.assetsLumpSum > 0) {
        await storage.createAsset({
          scenarioId: scenario.id,
          kind: 'equity',
          value: planData.assetsLumpSum.toString(),
        });
      }

      // Create mini retirement if provided
      if (planData.miniRetirement && planData.miniRetirement.start) {
        await storage.createMiniRetirement({
          scenarioId: scenario.id,
          start: planData.miniRetirement.start,
          months: planData.miniRetirement.months || 12,
          incomeDuring: planData.miniRetirement.incomeDuring?.toString() || '0',
          expenseDeltaPct: planData.miniRetirement.expenseDeltaPct?.toString() || '0',
        });
      }

      res.json(scenario);
    } catch (error) {
      console.error("Error creating quick plan:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid plan data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create plan" });
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

  // PDF export
  app.post('/api/export/pdf/:scenarioId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const scenario = await storage.getScenario(req.params.scenarioId);
      
      if (!scenario || scenario.userId !== userId) {
        return res.status(404).json({ message: "Scenario not found" });
      }

      // Check if scenario has a lead attached (for gating)
      if (!scenario.leadId) {
        return res.status(403).json({ message: "Lead capture required for PDF export" });
      }

      const scenarioData = await storage.getScenarioWithAllData(req.params.scenarioId);
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

  const httpServer = createServer(app);
  return httpServer;
}
