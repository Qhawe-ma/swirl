import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
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

      if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
        const missingFields = [];
        if (!firebaseConfig.apiKey) missingFields.push('VITE_FIREBASE_API_KEY');
        if (!firebaseConfig.projectId) missingFields.push('VITE_FIREBASE_PROJECT_ID');
        
        console.error('Missing Firebase environment variables:', missingFields);
        return res.status(500).json({
          error: `Firebase configuration incomplete. Missing: ${missingFields.join(', ')}`,
        });
      }

      res.json(firebaseConfig);
    } catch (error) {
      console.error("Failed to get Firebase config:", error);
      res.status(500).json({ error: "Failed to get Firebase configuration" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
