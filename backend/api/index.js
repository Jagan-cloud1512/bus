import express from "express";
import cors from "cors";
import busRoutes from "../routes/bus.js"; // Note: ../ because now in api/ folder

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/bus", busRoutes);

// Vercel Serverless - CRITICAL
export default app;
