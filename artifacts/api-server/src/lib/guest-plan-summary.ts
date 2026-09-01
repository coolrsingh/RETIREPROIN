import puppeteer from "puppeteer";
import { RETIREMENT_PROJECTION_DISCLAIMER } from "./retirepro-config";

export type GuestPlanSnapshot = {
  name: string;
  requiredCorpus: number;
  projectedCorpus: number;
  fundingGap: number;
  yearsToRetire: number;
  retirementAge: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  currentAssets: number;
  inflationRate: number;
  preRetirementReturn: number;
  postRetirementReturn: number;
  lifeExpectancy: number;
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[character] ?? character));
}

function formatCurrency(value: number): string {
  if (value >= 10_000_000) return `₹${(value / 10_000_000).toFixed(1)} Cr`;
  if (value >= 100_000) return `₹${(value / 100_000).toFixed(1)} L`;
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export async function generateGuestPlanSummaryPdf(snapshot: GuestPlanSnapshot): Promise<Buffer> {
  const headlineFigures = [
    ["Required Corpus", formatCurrency(snapshot.requiredCorpus)],
    ["Projected Corpus", formatCurrency(snapshot.projectedCorpus)],
    ["Funding Gap", formatCurrency(snapshot.fundingGap)],
    ["Years to Retire", `${snapshot.yearsToRetire} years`],
  ];
  const assumptions = [
    ["Retirement age", `${snapshot.retirementAge} years`],
    ["Monthly income", formatCurrency(snapshot.monthlyIncome)],
    ["Monthly expenses", formatCurrency(snapshot.monthlyExpenses)],
    ["Monthly savings", formatCurrency(snapshot.monthlySavings)],
    ["Current assets", formatCurrency(snapshot.currentAssets)],
    ["Inflation", `${snapshot.inflationRate}% p.a.`],
    ["Pre-retirement return", `${snapshot.preRetirementReturn}% p.a.`],
    ["Post-retirement return", `${snapshot.postRetirementReturn}% p.a.`],
    ["Life expectancy", `${snapshot.lifeExpectancy} years`],
  ];

  const html = `<!doctype html>
    <html><head><meta charset="utf-8" />
    <style>
      @page { size: A4; margin: 0; }
      * { box-sizing: border-box; }
      body { margin: 0; font-family: Arial, sans-serif; color: #1a1208; background: #fff; }
      .page { min-height: 1123px; padding: 54px 54px 42px; }
      .brand { background: #1a1208; color: #fff; margin: -54px -54px 34px; padding: 30px 54px; }
      .logo { font-size: 25px; font-weight: 700; } .logo span { color: #f15a24; }
      .brand p { margin: 7px 0 0; color: #f8dfc7; font-size: 14px; }
      h1 { margin: 0; font-size: 27px; } .sub { color: #66594b; margin: 7px 0 26px; font-size: 14px; }
      .metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .metric { border: 1px solid #f0dec5; border-radius: 10px; padding: 15px; background: #fffaf3; }
      .metric b { display: block; color: #8a570e; font-size: 11px; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 7px; }
      .metric span { font-size: 22px; font-weight: 700; }
      h2 { font-size: 17px; margin: 30px 0 11px; }
      table { width: 100%; border-collapse: collapse; font-size: 13px; }
      td { border-bottom: 1px solid #eee2d1; padding: 9px 4px; } td:last-child { text-align: right; font-weight: 600; }
      .disclaimer { margin-top: 30px; padding: 12px 14px; background: #fff5e9; border-left: 3px solid #f15a24; color: #66594b; font-size: 10px; line-height: 1.5; }
      .footer { margin-top: 21px; color: #8b7a68; font-size: 10px; text-align: center; }
    </style></head><body><main class="page">
      <header class="brand"><div class="logo">Retire<span>Pro</span></div><p>Your retirement plan summary</p></header>
      <h1>${escapeHtml(snapshot.name || "Your Retirement Plan")}</h1>
      <p class="sub">Prepared on ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
      <section class="metrics">${headlineFigures.map(([label, value]) => `<div class="metric"><b>${label}</b><span>${value}</span></div>`).join("")}</section>
      <h2>Planning inputs used</h2>
      <table>${assumptions.map(([label, value]) => `<tr><td>${label}</td><td>${value}</td></tr>`).join("")}</table>
      <p class="disclaimer">${RETIREMENT_PROJECTION_DISCLAIMER}</p>
      <p class="footer">RetirePro · retirement planning made clearer</p>
    </main></body></html>`;

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
  });
  try {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on("request", (request) => request.abort());
    await page.setContent(html, { waitUntil: "domcontentloaded" });
    return await page.pdf({ format: "A4", printBackground: true, margin: { top: "0", right: "0", bottom: "0", left: "0" } });
  } finally {
    await browser.close();
  }
}