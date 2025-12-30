import express from "express";
import cors from "cors";
import busRoutes from "../routes/bus.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/bus", busRoutes);

app.get("/test", (req, res) => {
  res.json({
    message: "🚌 Bus API working!",
    timestamp: new Date().toISOString(),
  });
});

export default app;
