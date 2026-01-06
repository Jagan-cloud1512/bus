import express from "express";
import cors from "cors";
import busRoutes from "./routes/bus.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// API ONLY - No frontend serving
app.use("/api/bus", busRoutes);

export default app;
