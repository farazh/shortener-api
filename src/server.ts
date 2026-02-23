import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { pool } from "./config/database";
import { shortenUrl, redirectToOriginal } from "./controllers/urlController";

// Load environment variables from .env
dotenv.config();

// Check required env variables
if (!process.env.PORT || !process.env.BASE_URL) {
  throw new Error("PORT or BASE_URL not defined in .env");
}

const PORT = parseInt(process.env.PORT, 10);
const BASE_URL = process.env.BASE_URL;

const app = express();

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
