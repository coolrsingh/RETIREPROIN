import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

interface PDFData {
  scenario: any;
  calculations: any;
}

export async function generatePDF(scenarioData: any, calculations: any): Promise<Buffer> {
  // Enhanced HTML to PDF with comprehensive dashboard information
  
  const self = scenarioData.householdMembers?.find((m: any) => m.relation === 'self');
  const currentYear = new Date().getFullYear();
  const birthYear = self?.dob ? new Date(self.dob).getFullYear() : currentYear - 35;
  const currentAge = currentYear - birthYear;
  const retirementAge = calculations?.summary?.retirementYear ? calculations.summary.retirementYear - birthYear : 60;
  const yearsToRetirement = Math.max(retirementAge - currentAge, 0);
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${scenarioData.name} - Retirement Plan</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px; 
          color: #334155;
          font-size: 12px;
        }
        .header { 
          text-align: center; 
          margin-bottom: 30px; 
          border-bottom: 2px solid #3b82f6;
          padding-bottom: 15px;
        }
        .summary { 
          display: grid; 
          grid-template-columns: 1fr 1fr 1fr 1fr; 
          gap: 15px; 
          margin-bottom: 25px; 
        }
        .kpi-card { 
          border: 1px solid #e2e8f0; 
          padding: 15px; 
          border-radius: 6px; 
          background: #f8fafc;
          text-align: center;
        }
        .kpi-title { 
          font-size: 11px; 
          color: #64748b; 
          margin-bottom: 6px; 
        }
        .kpi-value { 
          font-size: 18px; 
          font-weight: bold; 
          color: #1e293b; 
        }
        .section { 
          margin-bottom: 25px; 
        }
        .section-title {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #1e293b;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 5px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
          border-bottom: 1px solid #f1f5f9;
        }
        .chart-placeholder {
          height: 200px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${scenarioData.name}</h1>
        <p>Comprehensive Retirement Plan Report</p>
        <p>Generated on ${new Date().toLocaleDateString('en-IN')}</p>
      </div>
      
      <div class="summary">
        <div class="kpi-card">
          <div class="kpi-title">Current Age</div>
          <div class="kpi-value">${currentAge} years</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-title">Retirement Age</div>
          <div class="kpi-value">${retirementAge} years</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-title">Years to Retirement</div>
          <div class="kpi-value">${yearsToRetirement} years</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-title">Current Net Worth</div>
          <div class="kpi-value">₹${((calculations?.netWorthSeries?.[0]?.value || 0) / 100000).toFixed(1)}L</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Financial Overview</div>
        <div class="info-grid">
          <div class="info-item">
            <span>Monthly Income:</span>
            <span>₹${((scenarioData.incomeItems?.[0]?.amount || 0) / 12 / 1000).toFixed(0)}K</span>
          </div>
          <div class="info-item">
            <span>Monthly Expenses:</span>
            <span>₹${((scenarioData.expenseItems?.[0]?.amountMonthly || 0) / 1000).toFixed(0)}K</span>
          </div>
          <div class="info-item">
            <span>Monthly Savings:</span>
            <span>₹${(((scenarioData.incomeItems?.[0]?.amount || 0) / 12 - (scenarioData.expenseItems?.[0]?.amountMonthly || 0)) / 1000).toFixed(0)}K</span>
          </div>
          <div class="info-item">
            <span>Current Assets:</span>
            <span>₹${((scenarioData.assets?.reduce((sum: number, asset: any) => sum + parseFloat(asset.value || '0'), 0) || 0) / 100000).toFixed(1)}L</span>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Retirement Projections</div>
        <div class="info-grid">
          <div class="info-item">
            <span>Projected Corpus at Retirement:</span>
            <span>₹${((calculations?.summary?.projectedCorpusAtRetirement || 0) / 10000000).toFixed(1)}Cr</span>
          </div>
          <div class="info-item">
            <span>Required Corpus:</span>
            <span>₹${((calculations?.summary?.requiredCorpusAtRetirement || 0) / 10000000).toFixed(1)}Cr</span>
          </div>
          <div class="info-item">
            <span>Surplus/Gap:</span>
            <span style="color: ${(calculations?.summary?.gap || 0) >= 0 ? '#16a34a' : '#dc2626'}">
              ₹${(Math.abs(calculations?.summary?.gap || 0) / 10000000).toFixed(1)}Cr ${(calculations?.summary?.gap || 0) >= 0 ? 'Surplus' : 'Gap'}
            </span>
          </div>
          <div class="info-item">
            <span>Target Retirement Year:</span>
            <span>${calculations?.summary?.retirementYear || currentYear + yearsToRetirement}</span>
          </div>
        </div>
      </div>

      ${scenarioData.householdMembers?.filter((m: any) => m.relation === 'child').length > 0 ? `
      <div class="section">
        <div class="section-title">Children & Goals</div>
        ${scenarioData.householdMembers.filter((m: any) => m.relation === 'child').map((child: any, index: number) => {
          const childBirthYear = child.dob ? new Date(child.dob).getFullYear() : null;
          const currentChildAge = childBirthYear ? currentYear - childBirthYear : 0;
          return `
          <div class="info-item">
            <span>Child ${index + 1} (${child.name || 'Unnamed'}):</span>
            <span>Age ${currentChildAge}, Education at ${currentChildAge + (20 - currentChildAge)}, Marriage at ${currentChildAge + (30 - currentChildAge)}</span>
          </div>
          `;
        }).join('')}
      </div>
      ` : ''}

      <div class="section">
        <div class="section-title">Assumptions</div>
        <div class="info-grid">
          <div class="info-item">
            <span>Pre-Retirement Return:</span>
            <span>${scenarioData.assumptions?.returnPre || '10.0'}% p.a.</span>
          </div>
          <div class="info-item">
            <span>Post-Retirement Return:</span>
            <span>${scenarioData.assumptions?.returnPost || '7.0'}% p.a.</span>
          </div>
          <div class="info-item">
            <span>Inflation (General):</span>
            <span>${scenarioData.assumptions?.inflationHeadline || '6.0'}% p.a.</span>
          </div>
          <div class="info-item">
            <span>Inflation (Education):</span>
            <span>${scenarioData.assumptions?.inflationEdu || '8.0'}% p.a.</span>
          </div>
        </div>
      </div>

      <div class="chart-placeholder">
        <p>Net Worth Projection Chart<br>
        Current: ₹${((calculations?.netWorthSeries?.[0]?.value || 0) / 100000).toFixed(1)}L → 
        Retirement: ₹${((calculations?.summary?.projectedCorpusAtRetirement || 0) / 10000000).toFixed(1)}Cr</p>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 10px;">
        <p>This report is generated based on the assumptions and data provided. 
        Actual results may vary based on market conditions and life events.</p>
      </div>
    </body>
    </html>`;

  // Convert HTML to buffer (in a real app, use Puppeteer or similar)
  return Buffer.from(html, 'utf-8');
}
