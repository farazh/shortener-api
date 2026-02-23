import { Request, Response } from "express";
import { createUrl, findByShortCode, incrementClicks } from "../repositories/urlRepositories";
import { generateShortCode } from "../utils/generateShortCode";

const SHORT_CODE_LENGTH = 6;
const MAX_RETRIES = 5;

// Simple URL validation
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * POST /shorten
 */
export async function shortenUrl(req: Request, res: Response) {
  try {
    const { originalUrl } = req.body;

    if (!originalUrl || !isValidUrl(originalUrl)) {
      return res.status(400).json({ error: "Invalid or missing originalUrl" });
    }

    let shortCode: string | null = null;
    let retries = 0;

    // Retry loop for collision handling
    while (retries < MAX_RETRIES) {
      const candidate = generateShortCode(SHORT_CODE_LENGTH);
      const existing = await findByShortCode(candidate);
      if (!existing) {
        shortCode = candidate;
        break;
      }
      retries++;
    }

    if (!shortCode) {
      return res.status(500).json({ error: "Failed to generate unique short code" });
    }

    const newUrl = await createUrl(originalUrl, shortCode);

    return res.status(201).json({
      message: "Short URL created",
      data: newUrl,
    });
  } catch (error) {
    console.error("Error creating short URL:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * GET /:shortCode
 */
export async function redirectToOriginal(req: Request, res: Response) {
  try {
    const { shortCode } = req.params;

    if (!shortCode || Array.isArray(shortCode)) {
        return res.status(400).json({ error: "Invalid short code" });
      }

    const url = await findByShortCode(shortCode);

    if (!url) {
      return res.status(404).json({ error: "Short URL not found" });
    }

    await incrementClicks(shortCode);

    return res.redirect(url.original_url);
  } catch (error) {
    console.error("Error redirecting:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}