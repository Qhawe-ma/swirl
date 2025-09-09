import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Firebase configuration endpoint
  app.get("/api/firebase-config", (req, res) => {
    try {
      const firebaseConfig = {
        apiKey: process.env.VITE_FIREBASE_API_KEY,
        authDomain: `${process.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
        databaseURL: `https://${process.env.VITE_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com/`,
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: `${process.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
        messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.VITE_FIREBASE_APP_ID,
        measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
      };

      // Check if all required fields are present
      if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
        return res.status(500).json({ 
          error: "Firebase configuration incomplete - missing required secrets" 
        });
      }

      res.json(firebaseConfig);
    } catch (error) {
      console.error("Failed to get Firebase config:", error);
      res.status(500).json({ error: "Failed to get Firebase configuration" });
    }
  });

  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
