import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { simulationController } from "./controllers/simulation";

export async function registerRoutes(app: Express): Promise<Server> {
  // Prefix all routes with /api
  
  // Simulation-related routes
  app.get("/api/simulation/state", simulationController.getState);
  app.post("/api/simulation/cast", simulationController.castSpell);
  app.post("/api/simulation/feedback", simulationController.triggerFeedback);

  // Hidden protocol discovery endpoints - these don't advertise their presence
  app.get("/api/protocols/discover", simulationController.discoverProtocols);
  
  const httpServer = createServer(app);

  return httpServer;
}
