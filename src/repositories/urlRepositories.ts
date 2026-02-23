import { pool } from "../config/database";

export interface Url {
  id: number;
  original_url: string;
  short_code: string;
  created_at: Date;
  clicks: number;
}

/**
 * Create a new shortened URL
 */
export async function createUrl(
  originalUrl: string,
  shortCode: string
): Promise<Url> {
  const query = `
    INSERT INTO urls (original_url, short_code)
    VALUES ($1, $2)
    RETURNING *;
  `;

  const values = [originalUrl, shortCode];

  const result = await pool.query(query, values);
  return result.rows[0];
}

/**
 * Find URL by short code
 */
export async function findByShortCode(
  shortCode: string
): Promise<Url | null> {
  const query = `
    SELECT * FROM urls
    WHERE short_code = $1;
  `;

  const result = await pool.query(query, [shortCode]);

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

/**
 * Increment click counter
 */
export async function incrementClicks(shortCode: string): Promise<void> {
  const query = `
    UPDATE urls
    SET clicks = clicks + 1
    WHERE short_code = $1;
  `;

  await pool.query(query, [shortCode]);
}