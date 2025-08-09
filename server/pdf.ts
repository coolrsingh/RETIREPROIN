import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

interface PDFData {
  scenario: any;
  calculations: any;
}

export async function generatePDF(scenarioData: any, calculations: any): Promise<Buffer> {
  // Simple HTML to PDF conversion
  // In a real application, you would use a library like Puppeteer or @react-pdf/renderer
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${scenarioData.name} - Retirement Plan</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 40px; 
          color: #334155;
        }
        .header { 
          text-align: center; 
          margin-bottom: 40px; 
          border-bottom: 2px solid #3b82f6;
          padding-bottom: 20px;
        }
        .summary { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 20px; 
          margin-bottom: 30px; 
        }
        .kpi-card { 
          border: 1px solid #e2e8f0; 
          padding: 20px; 
          border-radius: 8px; 
          background: #f8fafc;
        }
        .kpi-title { 
          font-size: 14px; 
          color: #64748b; 
          margin-bottom: 8px; 
        }
        .kpi-value { 
          font-size: 24px; 
          font-weight: bold; 
          color: #1e293b; 
        }
        .assumptions { 
          margin-top: 30px; 
        }
        .assumptions h3 { 
          color: #1e293b; 
          margin-bottom: 15px; 
        }
        .assumption-row { 
          display: flex; 
          justify-content: space-between; 
          padding: 8px 0; 
          border-bottom: 1px solid #e2e8f0; 
        }
        .disclaimer {
          margin-top: 40px;
          padding: 20px;
          background: #fef3c7;
          border-radius: 8px;
          font-size: 12px;
          color: #92400e;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${scenarioData.name}</h1>
        <p>Retirement Planning Report</p>
        <p>Generated on ${new Date().toLocaleDateString('en-IN')}</p>
      </div>

      <div class="summary">
        <div class="kpi-card">
          <div class="kpi-title">Required Corpus at Retirement</div>
          <div class="kpi-value">₹${(calculations.summary.requiredCorpusAtRetirement / 10000000).toFixed(1)} Cr</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-title">Projected Corpus at Retirement</div>
          <div class="kpi-value">₹${(calculations.summary.projectedCorpusAtRetirement / 10000000).toFixed(1)} Cr</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-title">Funding Gap</div>
          <div class="kpi-value" style="color: ${calculations.summary.gap > 0 ? '#dc2626' : '#059669'}">
            ₹${(calculations.summary.gap / 10000000).toFixed(1)} Cr
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-title">Retirement Year</div>
          <div class="kpi-value">${calculations.summary.retirementYear}</div>
        </div>
      </div>

      <div class="assumptions">
        <h3>Planning Assumptions</h3>
        ${scenarioData.assumptions ? `
        <div class="assumption-row">
          <span>General Inflation Rate</span>
          <span>${parseFloat(scenarioData.assumptions.inflationHeadline || '6.0').toFixed(1)}%</span>
        </div>
        <div class="assumption-row">
          <span>Education Inflation Rate</span>
          <span>${parseFloat(scenarioData.assumptions.inflationEdu || '8.0').toFixed(1)}%</span>
        </div>
        <div class="assumption-row">
          <span>Pre-retirement Return</span>
          <span>${parseFloat(scenarioData.assumptions.returnPre || '10.0').toFixed(1)}%</span>
        </div>
        <div class="assumption-row">
          <span>Post-retirement Return</span>
          <span>${parseFloat(scenarioData.assumptions.returnPost || '7.0').toFixed(1)}%</span>
        </div>
        <div class="assumption-row">
          <span>Life Expectancy</span>
          <span>${scenarioData.assumptions.lifeExpectancy || 85} years</span>
        </div>
        ` : '<p>No custom assumptions set - using CRM defaults</p>'}
      </div>

      <div class="disclaimer">
        <h4>Important Disclaimer</h4>
        <p>This retirement plan is based on the information provided and assumptions made at the time of calculation. 
        Actual results may vary due to market conditions, inflation rates, and other economic factors. 
        This report is for illustrative purposes only and should not be considered as financial advice. 
        Please consult with a qualified financial advisor before making investment decisions.</p>
      </div>
    </body>
    </html>
  `;

  // For this implementation, we'll return the HTML as a buffer
  // In a real application, you would convert HTML to PDF using a proper library
  return Buffer.from(html, 'utf-8');
}
