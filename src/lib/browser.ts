import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import type { Browser } from "puppeteer";

puppeteer.use(StealthPlugin());

let browser: Browser | null = null;

export async function getBrowser(): Promise<Browser> {
  if (browser) {
    try {
      // check still alive
      await browser.version();
      return browser;
    } catch {
      browser = null;
    }
  }

  browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
    ],
  });

  return browser;
}

export async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

export async function fetchWithStealth(url: string): Promise<string> {
  const b = await getBrowser();
  const page = await b.newPage();

  try {
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
    });

    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    // Wait a moment for any JS challenge to resolve
    await new Promise((r) => setTimeout(r, 1500));

    const content = await page.content();
    return content;
  } finally {
    await page.close();
  }
}
