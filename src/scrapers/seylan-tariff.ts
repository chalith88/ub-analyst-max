// src/scrapers/seylan-tariff.ts

import { launchBrowser } from "../utils/browser";
import { clean } from "../utils/text";
import { acceptAnyCookie } from "../utils/dom";

export interface FeeRow {
  bank: string;
  products: string[];      // ["Home Loan"] or ["LAP"]
  feeType: string;         // sub-fee/row name
  description: string;     // group/main section
  amount: string;          // charge/fee value
  notes?: string;
  updatedAt: string;
  source: string;
}

const URL = "https://www.seylan.lk/service-charges?category=HOUSING_LOAN_CHARGES";
export async function scrapeSeylanTariff(opts?: { show?: boolean; slow?: number }): Promise<FeeRow[]> {
  const browser = await launchBrowser({
    show: opts?.show,
    slow: opts?.slow && opts.slow > 0 ? opts.slow : undefined,
  });
  const page = await browser.newPage({ viewport: { width: 1300, height: 900 } });
  const now = new Date().toISOString();

  try {
    await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 45000 });
    await acceptAnyCookie(page);

    // Get Home Loan table
    const homeLoanTableSel = "#home .table-responsive table";
    await page.waitForSelector(homeLoanTableSel, { timeout: 8000 });
    
    const homeLoanRows = await page.evaluate((selector: string, product: string, timestamp: string, url: string) => {
      function cleanText(text: string): string {
        return text.replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim();
      }

      const table = document.querySelector(selector);
      if (!table) return [];

      const out: any[] = [];
      const trs = Array.from(table.querySelectorAll("tbody tr"));
      let groupDesc = ""; // the main group/heading (bold in Description col)

      for (let i = 0; i < trs.length; ++i) {
        const tr = trs[i] as HTMLTableRowElement;
        const tds = Array.from(tr.querySelectorAll("td")).map(td => cleanText(td.textContent || ""));
        if (tds.length < 2) continue;

        // If description cell is bold (main group), treat as new group
        const descCell = tr.querySelector(".row-two-value");
        const isBold = descCell?.querySelector("b") != null;

        if (isBold && tds[2] === "") {
          // Group/heading row (e.g., Mortgage Bond, Valuation Fee, etc)
          groupDesc = tds[1];
          continue; // No fee on group header, skip to children
        }

        // For the first row under a group, if isBold and has fee, it's also a group/heading
        if (isBold && tds[2] !== "") {
          groupDesc = tds[1];
          out.push({
            bank: "Seylan",
            products: [product],
            feeType: "",
            description: groupDesc,
            amount: tds[2],
            updatedAt: timestamp,
            source: url,
          });
        } else {
          // Sub-row under group
          out.push({
            bank: "Seylan",
            products: [product],
            feeType: tds[1],
            description: groupDesc,
            amount: tds[2],
            updatedAt: timestamp,
            source: url,
          });
        }
      }
      return out;
    }, homeLoanTableSel, "Home Loan", now, URL);

    // Get LAP table
    const lapUrl = "https://www.seylan.lk/service-charges?category=LAND_ACQUISITION_AND_PROPERTY";
    await page.goto(lapUrl, { waitUntil: "domcontentloaded", timeout: 45000 });
    await acceptAnyCookie(page);

    const lapTableSel = "#lap .table-responsive table";
    await page.waitForSelector(lapTableSel, { timeout: 8000 });

    const lapRows = await page.evaluate((selector: string, product: string, timestamp: string, url: string) => {
      function cleanText(text: string): string {
        return text.replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim();
      }

      const table = document.querySelector(selector);
      if (!table) return [];

      const out: any[] = [];
      const trs = Array.from(table.querySelectorAll("tbody tr"));
      let groupDesc = ""; // the main group/heading (bold in Description col)

      for (let i = 0; i < trs.length; ++i) {
        const tr = trs[i] as HTMLTableRowElement;
        const tds = Array.from(tr.querySelectorAll("td")).map(td => cleanText(td.textContent || ""));
        if (tds.length < 2) continue;

        // If description cell is bold (main group), treat as new group
        const descCell = tr.querySelector(".row-two-value");
        const isBold = descCell?.querySelector("b") != null;

        if (isBold && tds[2] === "") {
          // Group/heading row (e.g., Mortgage Bond, Valuation Fee, etc)
          groupDesc = tds[1];
          continue; // No fee on group header, skip to children
        }

        // For the first row under a group, if isBold and has fee, it's also a group/heading
        if (isBold && tds[2] !== "") {
          groupDesc = tds[1];
          out.push({
            bank: "Seylan",
            products: [product],
            feeType: "",
            description: groupDesc,
            amount: tds[2],
            updatedAt: timestamp,
            source: url,
          });
        } else {
          // Sub-row under group
          out.push({
            bank: "Seylan",
            products: [product],
            feeType: tds[1],
            description: groupDesc,
            amount: tds[2],
            updatedAt: timestamp,
            source: url,
          });
        }
      }
      return out;
    }, lapTableSel, "LAP", now, lapUrl);

    // Return combined
    return [...(homeLoanRows as FeeRow[]), ...(lapRows as FeeRow[])];
  } finally {
    await browser.close();
  }
}