import express from "express";
import cors from "cors";
import busRoutes from "../routes/bus.js";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ FIX: Mount router at ROOT (not /bus)
app.use("/", busRoutes); // ← CHANGED: was app.use("/bus", busRoutes)

// Test endpoint
app.get("/test", (req, res) => {
  res.json({
    message: "🚌 Bus API working!",
    timestamp: new Date().toISOString(),
    buses: true,
  });
});

export default app;
