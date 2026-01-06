import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import busRoutes from "./routes/bus.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// API ROUTES
app.use("/api/bus", busRoutes);

// ✅ VERCEL STATIC FILE SERVING (CRITICAL FIX)
const isVercel = process.env.VERCEL === "1";
if (isVercel) {
  // Vercel serves frontend from root automatically
  app.get("*", (req, res) => {
    res.setHeader("Cache-Control", "public, max-age=31536000");
    // Vercel handles frontend files
    res.status(200).end();
  });
} else {
  // Local dev: serve frontend from ../frontend
  app.use(express.static(path.join(__dirname, "../frontend")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
  });
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚌 Bus server running on port ${port}`);
});

export default app;
