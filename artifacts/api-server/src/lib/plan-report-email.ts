import { ReplitConnectors } from "@replit/connectors-sdk";
import { RETIREMENT_PROJECTION_DISCLAIMER } from "./retirepro-config";

type SendPlanReportEmailParams = {
  recipientEmail: string;
  recipientName?: string | null;
  planName: string;
  pdfBuffer: Buffer;
  excelBuffer: Buffer;
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character] ?? character;
  });
}

function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9 ]/g, "").trim() || "Retirement Plan";
}

export async function sendPlanReportEmail({
  recipientEmail,
  recipientName,
  planName,
  pdfBuffer,
  excelBuffer,
}: SendPlanReportEmailParams): Promise<void> {
  const from = process.env.RETIREPRO_EMAIL_FROM;
  if (!from) {
    throw new Error("Email sender is not configured");
  }

  const displayName = recipientName?.trim() || "there";
  const safePlanName = safeFileName(planName);
  const connectors = new ReplitConnectors();
  const response = await connectors.proxy("resend", "/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [recipientEmail],
      subject: `Your RetirePro plan: ${safePlanName}`,
      text: `Hello ${displayName},

Thank you for choosing RetirePro. Your retirement plan is attached as a PDF report and Excel workbook.

Stay informed with practical retirement planning insights on the RetirePro blog, and follow us on LinkedIn, Facebook, and Instagram.
LinkedIn: https://www.linkedin.com/company/retirepro-in
Facebook: https://www.facebook.com/people/Retirepro/61591641611852/
Instagram: https://www.instagram.com/retirepro.in/

Warmly,
The RetirePro team`,
      html: `
        <div style="background:#fbf8f2;padding:32px 16px;font-family:Arial,sans-serif;color:#1a1208">
          <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #f0dec5;border-radius:16px;overflow:hidden">
            <div style="padding:28px 32px;background:#1a1208;color:#ffffff">
              <div style="font-size:22px;font-weight:700">Retire<span style="color:#f15a24">Pro</span></div>
              <p style="margin:10px 0 0;color:#f8dfc7">Your retirement plan is ready.</p>
            </div>
            <div style="padding:30px 32px">
              <p style="margin-top:0;font-size:16px">Hello ${escapeHtml(displayName)},</p>
              <p style="line-height:1.6">Thank you for choosing RetirePro. We have attached your <strong>${escapeHtml(planName)}</strong> as a PDF report and an Excel workbook, so you can revisit your plan whenever you need it.</p>
              <div style="padding:16px 18px;background:#fff5e9;border-radius:10px;border-left:4px solid #f15a24">
                <strong>Included with this email</strong>
                <div style="margin-top:6px;line-height:1.5">Your detailed PDF plan report and year-by-year Excel projections.</div>
              </div>
              <p style="line-height:1.6">For more practical retirement planning insights, visit and subscribe to the RetirePro blog.</p>
              <p style="margin-bottom:0;line-height:1.8">
                <a href="https://www.linkedin.com/company/retirepro-in" style="color:#b8451b">LinkedIn</a>
                &nbsp;·&nbsp;
                <a href="https://www.facebook.com/people/Retirepro/61591641611852/" style="color:#b8451b">Facebook</a>
                &nbsp;·&nbsp;
                <a href="https://www.instagram.com/retirepro.in/" style="color:#b8451b">Instagram</a>
              </p>
            </div>
          </div>
        </div>`,
      attachments: [
        {
          filename: `${safePlanName} - Retirement Plan.pdf`,
          content: pdfBuffer.toString("base64"),
        },
        {
          filename: `${safePlanName} - Retirement Plan.xlsx`,
          content: excelBuffer.toString("base64"),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend request failed with status ${response.status}`);
  }
}

type SendGuestPlanSummaryEmailParams = {
  recipientEmail: string;
  recipientName?: string | null;
  planName: string;
  pdfBuffer: Buffer;
};

export async function sendGuestPlanSummaryEmail({
  recipientEmail,
  recipientName,
  planName,
  pdfBuffer,
}: SendGuestPlanSummaryEmailParams): Promise<void> {
  const from = process.env.RETIREPRO_EMAIL_FROM;
  if (!from) throw new Error("Email sender is not configured");

  const displayName = recipientName?.trim() || "there";
  const safePlanName = safeFileName(planName);
  const connectors = new ReplitConnectors();
  const response = await connectors.proxy("resend", "/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [recipientEmail],
      subject: `Your RetirePro plan summary: ${safePlanName}`,
      text: `Hello ${displayName},

Your retirement plan summary is attached as a PDF.

${RETIREMENT_PROJECTION_DISCLAIMER}

Warmly,
The RetirePro team`,
      html: `<div style="background:#fbf8f2;padding:32px 16px;font-family:Arial,sans-serif;color:#1a1208">
        <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #f0dec5;border-radius:16px;overflow:hidden">
          <div style="padding:28px 32px;background:#1a1208;color:#fff"><strong style="font-size:22px">Retire<span style="color:#f15a24">Pro</span></strong><p style="margin:10px 0 0;color:#f8dfc7">Your plan summary is ready.</p></div>
          <div style="padding:30px 32px"><p style="margin-top:0">Hello ${escapeHtml(displayName)},</p><p style="line-height:1.6">Your retirement plan summary is attached as a PDF, ready to keep for reference.</p>
          <p style="padding:14px;background:#fff5e9;border-left:4px solid #f15a24;color:#66594b;font-size:12px;line-height:1.5">${RETIREMENT_PROJECTION_DISCLAIMER}</p></div>
        </div></div>`,
      attachments: [{ filename: `${safePlanName} - Plan Summary.pdf`, content: pdfBuffer.toString("base64") }],
    }),
  });
  if (!response.ok) throw new Error(`Resend request failed with status ${response.status}`);
}