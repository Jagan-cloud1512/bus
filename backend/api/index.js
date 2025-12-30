import express from "express";
import cors from "cors";
import busRoutes from "../routes/bus.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes - Vercel needs /api prefix
app.use("/bus", busRoutes);

// Test endpoint
app.get("/test", (req, res) => {
  res.json({
    message: "🚌 Bus API working!",
    timestamp: new Date().toISOString(),
  });
});

// Vercel Serverless - CRITICAL
export default app;
