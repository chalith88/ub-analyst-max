// src/scrapers/hnb-tariff.ts

import { Page } from "playwright";
import { launchBrowser } from "../utils/browser";
import { clean } from "../utils/text";
import { acceptAnyCookie } from "../utils/dom";

// Types
export interface FeeRow {
  bank: string;
  product: string;      // ["Home Loan"]
  feeType: string;         // e.g. "Up to Rs. 1,000,000/-"
  description: string;     // e.g. "Documentation Charges"
  amount: string;          // e.g. "Rs. 10,000/-"
  notes?: string;
  updatedAt: string;
  source: string;
}

const PRODUCT = ["Home Loan", "LAP", "Personal Loan", "Education Loan"];
const URL = "https://www.hnb.lk/tariffs/retail-services-tariff";

export async function scrapeHnbTariff(opts?: { show?: boolean; slow?: number }): Promise<FeeRow[]> {
  const browser = await launchBrowser({
    show: opts?.show,
    slow: opts?.slow && opts.slow > 0 ? opts.slow : undefined,
  });
  const page = await browser.newPage({ viewport: { width: 1300, height: 900 } });
  const now = new Date().toISOString();

  try {
    await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 45000 });
    await acceptAnyCookie(page);

    // Wait for the table to show up
    const tableSel = 'table.w-full.text-left';
    await page.waitForSelector(tableSel, { timeout: 8000 });

    // Parse table directly in browser context (no external dependencies)
    const rows = await page.evaluate((selector, timestamp, url) => {
      const table = document.querySelector(selector);
      if (!table) return [];

      const out: any[] = [];
      const trs = Array.from(table.querySelectorAll("tbody tr"));
      let groupDesc = "";

      function cleanText(text: string): string {
        return text.replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim();
      }

      for (const tr of trs) {
        const tds = Array.from(tr.querySelectorAll("td")).map(td => cleanText(td.textContent || ""));
        if (!tds.length) continue;

        if (tds.length === 3) {
          groupDesc = tds[0];
          out.push({
            bank: "HNB",
            product: "Home Loan",
            feeType: tds[1],
            description: groupDesc,
            amount: tds[2],
            updatedAt: timestamp,
            source: url,
          });
        } else if (tds.length === 2) {
          const isLikelyGroupLabel = /charges?/i.test(tds[0]) || /settlement/i.test(tds[0]);
          if (isLikelyGroupLabel) {
            groupDesc = tds[0];
            out.push({
              bank: "HNB",
              product: "Home Loan",
              feeType: "",
              description: groupDesc,
              amount: tds[1],
              updatedAt: timestamp,
              source: url,
            });
          } else {
            out.push({
              bank: "HNB", 
              product: "Home Loan",
              feeType: tds[0],
              description: groupDesc,
              amount: tds[1],
              updatedAt: timestamp,
              source: url,
            });
          }
        } else if (tds.length === 1 && tds[0]) {
          out.push({
            bank: "HNB",
            product: "Home Loan",
            feeType: "",
            description: groupDesc,
            amount: "",
            notes: tds[0],
            updatedAt: timestamp,
            source: url,
          });
        }
      }
      return out;
    }, tableSel, now, URL);

    // Expand per product
    const expandedRows: FeeRow[] = [];
    for (const r of rows) {
      for (const product of PRODUCT) {
        expandedRows.push({
          ...r,
          product: product,
        });
      }
    }

    return expandedRows;

  } finally {
    await browser.close();
  }
}