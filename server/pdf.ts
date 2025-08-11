import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

interface PDFData {
  scenario: any;
  calculations: any;
}

export async function generatePDF(scenarioData: any, calculations: any): Promise<Buffer> {
  // Enhanced multi-page PDF with RetirePro watermarks and comprehensive layout
  
  const self = scenarioData.householdMembers?.find((m: any) => m.relation === 'self');
  const currentYear = new Date().getFullYear();
  const birthYear = self?.dob ? new Date(self.dob).getFullYear() : currentYear - 35;
  const currentAge = currentYear - birthYear;
  const retirementAge = calculations?.summary?.retirementYear ? calculations.summary.retirementYear - birthYear : 60;
  const yearsToRetirement = Math.max(retirementAge - currentAge, 0);
  
  const currentDate = new Date().toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
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
          background: white;
        }
        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 80px;
          color: rgba(59, 130, 246, 0.03);
          font-weight: bold;
          z-index: -1;
          user-select: none;
          pointer-events: none;
        }
        .footer-watermark {
          position: fixed;
          bottom: 15px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 12px;
          color: #3b82f6;
          font-weight: bold;
          z-index: 100;
        }
        .page {
          min-height: 100vh;
          padding: 40px;
          position: relative;
          page-break-after: always;
        }
        .page:last-child { page-break-after: avoid; }
        .logo-header {
          text-align: center;
          margin-bottom: 40px;
          background: linear-gradient(90deg, #3b82f6, #1d4ed8);
          color: white;
          padding: 30px;
          margin: -40px -40px 40px -40px;
        }
        .logo {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 8px;
          letter-spacing: 2px;
        }
        .tagline {
          font-size: 14px;
          opacity: 0.9;
        }
        .user-summary-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .user-summary-table th {
          background: #f8fafc;
          padding: 12px;
          text-align: left;
          font-weight: bold;
          border-bottom: 1px solid #e2e8f0;
        }
        .user-summary-table td {
          padding: 10px 12px;
          border-bottom: 1px solid #f1f5f9;
        }
        .chart-section {
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          margin: 20px 0;
          position: relative;
        }
        .chart-title {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 20px;
          color: #1e293b;
          text-align: center;
        }
        .chart-placeholder {
          height: 300px;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border: 2px dashed #cbd5e1;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          font-size: 16px;
          position: relative;
        }
      </style>
    </head>
    <body>
      <!-- Background watermark on every page -->
      <div class="watermark">RetirePro</div>
      <div class="footer-watermark">RetirePro - Your Retirement Planning Partner</div>

      <!-- Page 1: Logo & Service Introduction -->
      <div class="page">
        <div class="logo-header">
          <div class="logo">RetirePro</div>
          <div class="tagline">Professional Retirement Planning Solutions</div>
          <div style="margin-top: 15px; font-size: 16px;">Comprehensive Financial Analysis Report</div>
        </div>
        
        <div style="text-align: center; margin: 50px 0;">
          <h2 style="font-size: 24px; color: #1e293b; margin-bottom: 20px;">Welcome to Your Personal Retirement Plan</h2>
          <p style="font-size: 14px; color: #64748b; max-width: 600px; margin: 0 auto; line-height: 1.6;">
            This comprehensive report has been generated based on your financial information and retirement goals. 
            Our advanced calculation engine has analyzed your current financial position and projected your wealth 
            accumulation journey to help you achieve a secure retirement.
          </p>
        </div>

        <div style="background: #f8fafc; padding: 30px; border-radius: 12px; margin: 40px 0;">
          <h3 style="color: #3b82f6; margin-bottom: 15px;">Report Generated On:</h3>
          <p style="font-size: 16px; margin: 5px 0;"><strong>${currentDate}</strong></p>
          <p style="font-size: 14px; color: #64748b;">Plan Name: ${scenarioData.name}</p>
        </div>
      </div>

      <!-- Page 2: User Summary -->
      <div class="page">
        <div class="logo-header">
          <div class="logo">RetirePro</div>
          <div class="tagline">User Profile & Plan Summary</div>
        </div>

        <h2 style="font-size: 22px; margin-bottom: 30px; color: #1e293b;">Personal Information & Plan Details</h2>
        
        <table class="user-summary-table">
          <tr>
            <th style="width: 40%;">Personal Details</th>
            <th>Information</th>
          </tr>
          <tr>
            <td><strong>Full Name</strong></td>
            <td>${self?.name || 'Not provided'}</td>
          </tr>
          <tr>
            <td><strong>Current Age</strong></td>
            <td>${currentAge} years</td>
          </tr>
          <tr>
            <td><strong>Planned Retirement Age</strong></td>
            <td>${retirementAge} years</td>
          </tr>
          <tr>
            <td><strong>Years to Retirement</strong></td>
            <td>${yearsToRetirement} years</td>
          </tr>
        </table>

        <table class="user-summary-table">
          <tr>
            <th style="width: 40%;">Financial Overview</th>
            <th>Amount (₹)</th>
          </tr>
          <tr>
            <td><strong>Current Net Worth</strong></td>
            <td>₹${calculations?.summary?.currentNetWorth?.toLocaleString('en-IN') || '0'}</td>
          </tr>
          <tr>
            <td><strong>Monthly Income</strong></td>
            <td>₹${scenarioData.incomeItems?.[0]?.amount?.toLocaleString('en-IN') || '0'}</td>
          </tr>
          <tr>
            <td><strong>Monthly Savings</strong></td>
            <td>₹${scenarioData.incomeItems?.[0]?.amount ? (scenarioData.incomeItems[0].amount * 0.3).toLocaleString('en-IN') : '0'}</td>
          </tr>
          <tr>
            <td><strong>Net Worth at Retirement</strong></td>
            <td>₹${calculations?.summary?.netWorthAtRetirement?.toLocaleString('en-IN') || '0'}</td>
          </tr>
        </table>

        ${scenarioData.householdMembers?.filter((m: any) => m.relation === 'child').length > 0 ? `
        <table class="user-summary-table">
          <tr>
            <th style="width: 40%;">Family Members</th>
            <th>Details</th>
          </tr>
          ${scenarioData.householdMembers.filter((m: any) => m.relation === 'child').map((child: any) => `
          <tr>
            <td><strong>${child.name}</strong></td>
            <td>Born: ${new Date(child.dob).toLocaleDateString('en-IN')}</td>
          </tr>
          `).join('')}
        </table>
        ` : ''}
      </div>

      <!-- Page 3: Net Worth Chart -->
      <div class="page">
        <div class="chart-section">
          <div class="chart-title">Net Worth Projection Over Time</div>
          <div class="chart-placeholder">
            <div style="text-align: center;">
              <div style="font-size: 18px; margin-bottom: 10px;">📈 Net Worth Growth Chart</div>
              <div style="font-size: 14px; color: #64748b;">Interactive chart showing your wealth accumulation journey</div>
              <div style="margin-top: 15px; font-size: 12px;">
                Current: ₹${calculations?.summary?.currentNetWorth?.toLocaleString('en-IN') || '0'} → 
                Retirement: ₹${calculations?.summary?.netWorthAtRetirement?.toLocaleString('en-IN') || '0'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Page 4: Cash Flow Analysis -->
      <div class="page">
        <div class="chart-section">
          <div class="chart-title">Cash Flow Analysis - Line Chart</div>
          <div class="chart-placeholder">
            <div style="text-align: center;">
              <div style="font-size: 18px; margin-bottom: 10px;">📊 Income vs Expenses Trend</div>
              <div style="font-size: 14px; color: #64748b;">Line chart showing cash flow patterns over time</div>
            </div>
          </div>
        </div>
        
        <div class="chart-section">
          <div class="chart-title">Cash Flow Analysis - Bar Chart</div>
          <div class="chart-placeholder">
            <div style="text-align: center;">
              <div style="font-size: 18px; margin-bottom: 10px;">📊 Monthly Income & Expense Breakdown</div>
              <div style="font-size: 14px; color: #64748b;">Bar chart comparing income sources and expense categories</div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const puppeteer = await import('puppeteer');
    console.log('Generated HTML for PDF, length:', html.length);
    
    const browser = await puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0'
      }
    });
    
    await browser.close();
    console.log('Created PDF buffer, size:', pdf.length);
    return pdf;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error(`PDF generation failed: ${error.message}`);
  }
}