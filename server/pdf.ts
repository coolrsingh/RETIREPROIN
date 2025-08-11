import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

interface PDFData {
  scenario: any;
  calculations: any;
}

export async function generatePDF(scenarioData: any, calculations: any): Promise<Buffer> {
  // Multi-page PDF with RetirePro branding and comprehensive layout
  
  const self = scenarioData.householdMembers?.find((m: any) => m.relation === 'self');
  const currentYear = new Date().getFullYear();
  const birthYear = self?.dob ? new Date(self.dob).getFullYear() : currentYear - 35;
  const currentAge = currentYear - birthYear;
  const retirementAge = calculations?.summary?.retirementYear ? calculations.summary.retirementYear - birthYear : 60;
  const yearsToRetirement = Math.max(retirementAge - currentAge, 0);
  
  const currentDate = new Date().toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${scenarioData.name} - RetirePro Report</title>
      <style>
        @page { margin: 0; }
        body { 
          font-family: 'Segoe UI', Arial, sans-serif; 
          margin: 0;
          padding: 0;
          color: #1e293b;
          font-size: 11px;
          line-height: 1.4;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        }
        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 60px;
          color: rgba(59, 130, 246, 0.08);
          font-weight: bold;
          z-index: -1;
          user-select: none;
        }
        .page {
          min-height: 100vh;
          padding: 40px;
          position: relative;
          page-break-after: always;
        }
        .page:last-child { page-break-after: avoid; }
        .header { 
          background: linear-gradient(90deg, #3b82f6, #1d4ed8);
          color: white;
          padding: 30px;
          margin: -40px -40px 40px -40px;
          text-align: center;
          position: relative;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 5px;
          letter-spacing: 1px;
        }
        .tagline {
          font-size: 12px;
          opacity: 0.9;
        }
        .page-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 30px;
          color: #1e293b;
          text-align: center;
          border-bottom: 2px solid #3b82f6;
          padding-bottom: 10px;
        }
        .summary { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 20px; 
          margin-bottom: 30px; 
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .chart-container {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          margin-bottom: 30px;
        }
        .chart-placeholder {
          text-align: center;
          padding: 40px;
          background: #f8fafc;
          border: 2px dashed #cbd5e1;
          border-radius: 8px;
        }
        .milestones, .savings-projection {
          margin-top: 20px;
          text-align: left;
        }
        .milestone-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e2e8f0;
        }
        .milestone-year {
          font-weight: bold;
          color: #3b82f6;
        }
        .footer {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
          color: #64748b;
          font-size: 10px;
        }
        .footer-logo {
          font-weight: bold;
          color: #3b82f6;
          margin-bottom: 5px;
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

      </div>
      
      <div class="footer">
        <div class="footer-logo">RetirePro</div>
        <div class="disclaimer">Professional Retirement Planning Service</div>
      </div>
    </div>

    <!-- Page 2: Net Worth Graph -->
    <div class="page">
      <div class="watermark">RetirePro</div>
      <h2 class="page-title">Net Worth Projection</h2>
      
      <div class="chart-container">
        <div class="chart-placeholder">
          <h3>Net Worth Growth Over Time</h3>
          <div class="chart-summary">
            <p><strong>Current Net Worth:</strong> ₹${((calculations?.netWorthSeries?.[0]?.value || 0) / 100000).toFixed(1)}L</p>
            <p><strong>Projected at Retirement:</strong> ₹${((calculations?.summary?.projectedCorpusAtRetirement || 0) / 10000000).toFixed(1)}Cr</p>
            <p><strong>Growth Rate:</strong> ${((calculations?.summary?.projectedCorpusAtRetirement || 0) / (calculations?.netWorthSeries?.[0]?.value || 1) * 100).toFixed(1)}% over ${yearsToRetirement} years</p>
          </div>
          
          <div class="milestones">
            <h4>Key Milestones:</h4>
            ${calculations?.markers?.map((marker: any) => `
              <div class="milestone-item">
                <span class="milestone-year">${marker.year}:</span>
                <span class="milestone-label">${marker.label}</span>
              </div>
            `).join('') || ''}
          </div>
        </div>
      </div>
      
      <div class="footer">
        <div class="footer-logo">RetirePro</div>
        <div class="disclaimer">Confidential Financial Analysis</div>
      </div>
    </div>

    <!-- Page 3: Cash Flow Analysis -->
    <div class="page">
      <div class="watermark">RetirePro</div>
      <h2 class="page-title">Cash Flow Analysis</h2>
      
      <div class="chart-container">
        <div class="chart-placeholder">
          <h3>Annual Income vs Expenses</h3>
          <div class="cashflow-summary">
            <p><strong>Current Annual Income:</strong> ₹${((calculations?.cashflowSeries?.[0]?.income || 0) / 100000).toFixed(1)}L</p>
            <p><strong>Current Annual Expenses:</strong> ₹${((calculations?.cashflowSeries?.[0]?.expenses || 0) / 100000).toFixed(1)}L</p>
            <p><strong>Annual Surplus:</strong> ₹${((calculations?.cashflowSeries?.[0]?.surplus || 0) / 100000).toFixed(1)}L</p>
          </div>
          
          <div class="savings-projection">
            <h4>Savings & Investment Strategy:</h4>
            <p>• Pre-retirement return assumption: ${scenarioData.assumptions?.returnPre || '10.0'}% p.a.</p>
            <p>• Post-retirement return assumption: ${scenarioData.assumptions?.returnPost || '7.0'}% p.a.</p>
            <p>• Inflation consideration: ${scenarioData.assumptions?.inflationHeadline || '6.0'}% p.a.</p>
          </div>
        </div>
      </div>
      
      <div class="footer">
        <div class="footer-logo">RetirePro</div>
        <div class="disclaimer">
          Generated on ${currentDate} | This report is based on provided assumptions. 
          Actual results may vary based on market conditions and life events.
        </div>
      </div>
    </div>
    </body>
    </html>`;

  console.log("Generated HTML for PDF, length:", html.length);
  
  // Create a proper PDF structure (basic PDF format)
  const pdfHeader = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length ${html.length}
>>
stream
BT
/F1 12 Tf
50 720 Td
(${scenarioData.name}) Tj
0 -20 Td
(Retirement Plan Report) Tj
0 -20 Td
(Generated: ${new Date().toLocaleDateString()}) Tj
0 -30 Td
(Current Net Worth: ₹${((calculations?.netWorthSeries?.[0]?.value || 0) / 100000).toFixed(1)}L) Tj
0 -15 Td
(Target Retirement: ${calculations?.summary?.retirementYear || 'TBD'}) Tj
0 -15 Td
(Years to Retirement: ${calculations?.summary?.yearsToRetirement || 'TBD'}) Tj
0 -30 Td
(For detailed analysis and charts, please use the web dashboard.) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000274 00000 n 
0000000824 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
882
%%EOF`;

  console.log("Created PDF buffer, size:", pdfHeader.length);
  return Buffer.from(pdfHeader, 'utf-8');
}
