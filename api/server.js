import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import busRoutes from "./routes/bus.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// API routes FIRST
app.use("/api/bus", busRoutes);
app.get("/api/test", (req, res) => {
  res.json({
    message: "🚌 Bus Booking API working!",
    timestamp: new Date().toISOString(),
  });
});

// Static files AFTER API
app.use(express.static(path.join(__dirname, "../frontend")));

// SPA catch-all (non-API routes only)
app.get(/^\/(?!api\/).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// 404 last
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`🚌 Server: http://localhost:${PORT}`);
  console.log(`🚌 API: http://localhost:${PORT}/api/bus`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
});
