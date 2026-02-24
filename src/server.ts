import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";

import { pool } from "./config/database";
import { shortenUrl, redirectToOriginal } from "./controllers/urlController";
import path from "path";

// Load environment variables from .env
dotenv.config();

// Check required env variables
if (!process.env.PORT || !process.env.BASE_URL) {
  throw new Error("PORT or BASE_URL not defined in .env");
}

const PORT = parseInt(process.env.PORT, 10);
const BASE_URL = process.env.BASE_URL;

const app = express();

app.use(cors({
    origin: [
      "http://localhost:5173", // dev frontend
      "https://your-frontend-render-url.onrender.com" // prod frontend
    ],
    methods: ["GET", "POST"]
  }));

// JSON middleware
app.use(express.json());

// ---------------------
// Health check route
// ---------------------
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});
app.use(express.json());
app.post("/shorten", shortenUrl);
app.get("/:shortCode", redirectToOriginal);

// === Serve frontend in production ===
if (process.env.NODE_ENV === "production") {
    const frontendDistPath = path.join(__dirname, "../frontend/dist");
  
    app.use(express.static(frontendDistPath));
  
    // SPA fallback (Express 5 safe)
    app.get(/.*/, (_req, res) => {
      res.sendFile(path.join(frontendDistPath, "index.html"));
    });
  }

// ---------------------
// Test DB connection at startup
// ---------------------
pool.connect()
  .then(client => {
    console.log("Connected to Postgres successfully");
    client.release();
  })
  .catch(err => {
    console.error("Failed to connect to Postgres:", err);
    process.exit(1);
  });

// ---------------------
// Placeholder URL routes
// ---------------------
// We will add controllers here later
// Example:
// import urlRouter from "./controllers/urlController";
// app.use("/api/v1/urls", urlRouter);

// ---------------------
// Start server
// ---------------------
app.listen(PORT, () => {
  console.log(`Server running at ${BASE_URL} on port ${PORT}`);
});
