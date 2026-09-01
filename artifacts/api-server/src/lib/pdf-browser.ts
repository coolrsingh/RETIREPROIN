import { existsSync } from "node:fs";
import { delimiter, join } from "node:path";

export function resolvePdfBrowserExecutable(): string {
  const configured = process.env.PUPPETEER_EXECUTABLE_PATH;
  if (configured && existsSync(configured)) return configured;

  const chromiumPath = process.env.PATH
    ?.split(delimiter)
    .map((directory) => join(directory, "chromium"))
    .find((candidate) => existsSync(candidate));

  if (!chromiumPath) {
    throw new Error("Chromium is not available for PDF generation");
  }

  return chromiumPath;
}