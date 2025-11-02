// Utility for launching Playwright browsers with production-safe settings
import { chromium, Browser } from "playwright";

export interface ScraperOptions {
  show?: boolean;
  slow?: number;
}

/**
 * Launch a Chromium browser with production-safe settings
 * In production, always runs headless regardless of show parameter
 */
export async function launchBrowser(opts?: ScraperOptions): Promise<Browser> {
  const isProduction = process.env.NODE_ENV === "production";
  
  return await chromium.launch({
    headless: isProduction ? true : !opts?.show,
    slowMo: opts?.slow && opts.slow > 0 ? opts.slow : undefined,
    // Additional production-safe options
    args: isProduction ? [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ] : undefined
  });
}