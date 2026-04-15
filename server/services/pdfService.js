const puppeteer = require('puppeteer');

/**
 * Generates a styled PDF from a proposal document using Puppeteer.
 * Returns a Buffer of the raw PDF bytes.
 */
const generateProposalPDF = async (proposalData) => {
  const {
    proposalId,
    studentName,
    studentEmail,
    formData = {}
  } = proposalData;

  const {
    eventName = 'N/A',
    clubName = 'N/A',
    eventEdition = 'N/A',
    eventDate = 'N/A',
    eventDuration = 'N/A',
    expectedFootfall = 'N/A',
    eventCategory = 'N/A',
    about = '',
    details = '',
    vision = '',
    pastSponsors = [],
    budget = [],
    logistics = [],
    venue = []
  } = formData;

  const submissionDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric'
  });

  const grandTotal = budget.reduce((sum, row) => sum + (parseFloat(row.totalCost) || 0), 0);

  // ─── HTML Template ────────────────────────────────────────────────────────
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', Arial, sans-serif; color: #1a1a2e; font-size: 11pt; line-height: 1.6; }

    /* Cover Page */
    .cover { height: 297mm; display: flex; flex-direction: column; justify-content: center; align-items: center;
             background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); color: white; text-align: center; padding: 60px; page-break-after: always; }
    .cover-logo { font-size: 48pt; font-weight: 700; color: #17d15a; margin-bottom: 8px; letter-spacing: 6px; }
    .cover-subtitle { font-size: 13pt; color: #a0aec0; margin-bottom: 60px; letter-spacing: 2px; text-transform: uppercase; }
    .cover-event { font-size: 26pt; font-weight: 700; color: #fff; margin-bottom: 12px; }
    .cover-club { font-size: 16pt; color: #90cdf4; margin-bottom: 60px; }
    .cover-meta { font-size: 11pt; color: #718096; }
    .cover-meta span { display: block; margin: 4px 0; }
    .cover-divider { width: 60px; height: 3px; background: #17d15a; margin: 30px auto; }

    /* Content pages */
    .page { padding: 25mm 20mm; }
    h1.section-title { font-size: 18pt; color: #0f3460; border-bottom: 3px solid #17d15a; padding-bottom: 8px; margin-bottom: 20px; }
    h2.section-title { font-size: 14pt; color: #0f3460; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 16px; margin-top: 28px; }
    p.content { margin-bottom: 16px; color: #2d3748; text-align: justify; }

    /* Info grid */
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
    .info-item { background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 14px; }
    .info-label { font-size: 8pt; text-transform: uppercase; letter-spacing: 1px; color: #718096; margin-bottom: 3px; }
    .info-value { font-size: 11pt; font-weight: 600; color: #1a202c; }

    /* Tables */
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 10pt; }
    thead tr { background: #0f3460; color: white; }
    thead th { padding: 10px 12px; text-align: left; font-weight: 600; }
    tbody tr:nth-child(even) { background: #f7fafc; }
    tbody td { padding: 9px 12px; border-bottom: 1px solid #e2e8f0; color: #2d3748; }
    .grand-total { background: #0f3460 !important; }
    .grand-total td { color: white !important; font-weight: 700; border: none !important; }

    /* Footer */
    .footer { position: fixed; bottom: 0; left: 0; right: 0; padding: 8px 20mm;
              border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between;
              font-size: 8pt; color: #718096; background: white; }
    
    /* Page break */
    .page-break { page-break-before: always; }
  </style>
</head>
<body>

<!-- Cover Page -->
<div class="cover">
  <div class="cover-logo">KSAC</div>
  <div class="cover-subtitle">KIIT Student Activity Centre</div>
  <div class="cover-divider"></div>
  <div class="cover-event">${eventName}</div>
  <div class="cover-club">${clubName} &mdash; ${eventEdition}</div>
  <div class="cover-divider"></div>
  <div class="cover-meta">
    <span>Proposal ID: ${proposalId}</span>
    <span>Submitted by: ${studentName}</span>
    <span>Date: ${submissionDate}</span>
  </div>
</div>

<!-- Section 1: Event Overview -->
<div class="page">
  <div class="footer">
    <span>Proposal ID: ${proposalId} | ${studentName}</span>
    <span>Confidential — KSAC Document</span>
  </div>

  <h1 class="section-title">Event Overview</h1>
  <div class="info-grid">
    <div class="info-item"><div class="info-label">Event Name</div><div class="info-value">${eventName}</div></div>
    <div class="info-item"><div class="info-label">Club / Society</div><div class="info-value">${clubName}</div></div>
    <div class="info-item"><div class="info-label">Edition</div><div class="info-value">${eventEdition}</div></div>
    <div class="info-item"><div class="info-label">Event Date(s)</div><div class="info-value">${eventDate}</div></div>
    <div class="info-item"><div class="info-label">Duration</div><div class="info-value">${eventDuration}</div></div>
    <div class="info-item"><div class="info-label">Expected Footfall</div><div class="info-value">${expectedFootfall}</div></div>
    <div class="info-item"><div class="info-label">Category</div><div class="info-value">${eventCategory}</div></div>
    <div class="info-item"><div class="info-label">Submitted By</div><div class="info-value">${studentName}</div></div>
  </div>

  <h2 class="section-title">About the Event</h2>
  <p class="content">${about || 'Not provided.'}</p>

  <h2 class="section-title">Event Details</h2>
  <p class="content">${details || 'Not provided.'}</p>

  <h2 class="section-title">Vision &amp; Goals</h2>
  <p class="content">${vision || 'Not provided.'}</p>
</div>

<!-- Section 2: Past Sponsors -->
<div class="page page-break">
  <div class="footer">
    <span>Proposal ID: ${proposalId} | ${studentName}</span>
    <span>Confidential — KSAC Document</span>
  </div>

  <h1 class="section-title">Past Sponsors</h1>
  <table>
    <thead>
      <tr>
        <th>Sponsor Name</th>
        <th>Sponsorship Amount</th>
        <th>Year</th>
        <th>Type</th>
      </tr>
    </thead>
    <tbody>
      ${pastSponsors.length > 0
        ? pastSponsors.map(s => `
        <tr>
          <td>${s.sponsorName || '-'}</td>
          <td>₹${s.amount || '-'}</td>
          <td>${s.year || '-'}</td>
          <td>${s.type || '-'}</td>
        </tr>`).join('')
        : '<tr><td colspan="4" style="text-align:center; color:#718096;">No past sponsors listed.</td></tr>'}
    </tbody>
  </table>

  <!-- Section 3: Tentative Budget -->
  <h1 class="section-title" style="margin-top: 32px;">Tentative Budget Requirement</h1>
  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th>Quantity</th>
        <th>Unit Cost (₹)</th>
        <th>Total Cost (₹)</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>
      ${budget.length > 0
        ? budget.map(b => `
        <tr>
          <td>${b.item || '-'}</td>
          <td>${b.quantity || 0}</td>
          <td>₹${parseFloat(b.unitCost || 0).toLocaleString('en-IN')}</td>
          <td>₹${parseFloat(b.totalCost || 0).toLocaleString('en-IN')}</td>
          <td>${b.notes || '-'}</td>
        </tr>`).join('')
        : '<tr><td colspan="5" style="text-align:center; color:#718096;">No budget items listed.</td></tr>'}
      ${budget.length > 0 ? `
      <tr class="grand-total">
        <td colspan="3"><strong>Grand Total</strong></td>
        <td><strong>₹${grandTotal.toLocaleString('en-IN')}</strong></td>
        <td></td>
      </tr>` : ''}
    </tbody>
  </table>
</div>

<!-- Section 4: Logistics & Venue -->
<div class="page page-break">
  <div class="footer">
    <span>Proposal ID: ${proposalId} | ${studentName}</span>
    <span>Confidential — KSAC Document</span>
  </div>

  <h1 class="section-title">Logistics Requirements</h1>
  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th>Quantity</th>
        <th>Purpose</th>
        <th>Provided By</th>
      </tr>
    </thead>
    <tbody>
      ${logistics.length > 0
        ? logistics.map(l => `
        <tr>
          <td>${l.item || '-'}</td>
          <td>${l.quantity || 0}</td>
          <td>${l.purpose || '-'}</td>
          <td>${l.providedBy || '-'}</td>
        </tr>`).join('')
        : '<tr><td colspan="4" style="text-align:center; color:#718096;">No logistics listed.</td></tr>'}
    </tbody>
  </table>

  <h1 class="section-title" style="margin-top: 32px;">Venue Requirements</h1>
  <table>
    <thead>
      <tr>
        <th>Requirement</th>
        <th>Specification</th>
        <th>Duration Needed</th>
        <th>Remarks</th>
      </tr>
    </thead>
    <tbody>
      ${venue.length > 0
        ? venue.map(v => `
        <tr>
          <td>${v.requirement || '-'}</td>
          <td>${v.specification || '-'}</td>
          <td>${v.duration || '-'}</td>
          <td>${v.remarks || '-'}</td>
        </tr>`).join('')
        : '<tr><td colspan="4" style="text-align:center; color:#718096;">No venue requirements listed.</td></tr>'}
    </tbody>
  </table>
</div>

</body>
</html>
`;

  // ─── Puppeteer render ────────────────────────────────────────────────────
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '20mm', left: '0' }
    });

    return pdfBuffer;
  } finally {
    if (browser) await browser.close();
  }
};

module.exports = { generateProposalPDF };
