import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for Supabase integration
  // Note: All database operations are handled client-side through Supabase
  // This backend serves the React app and could handle additional API endpoints if needed
  
  const httpServer = createServer(app);
  return httpServer;
}
