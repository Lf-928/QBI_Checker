import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Enterprise, Expense, Property, TaxpayerProfile, TimeLogEntry } from '../types';

export interface AuditPdfOptions {
  taxpayer: TaxpayerProfile;
  enterprises: Enterprise[];
  properties: Property[];
  timeLogs: TimeLogEntry[];
  expenses: Expense[];
  selectedEnterpriseId?: string; // 'all' or specific
  selectedYear: number;
}

export function generateAuditDefensePDF(options: AuditPdfOptions): void {
  const { taxpayer, enterprises, properties, timeLogs, expenses, selectedEnterpriseId, selectedYear } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter',
  });

  const primaryColor = [15, 23, 42]; // Slate 900
  const emeraldColor = [16, 185, 129]; // Emerald 500
  const mutedColor = [100, 116, 139];

  // Filter logs for this year and optionally enterprise
  const yearLogs = timeLogs.filter((l) => {
    const isYear = l.date.startsWith(String(selectedYear));
    if (!isYear) return false;
    if (selectedEnterpriseId && selectedEnterpriseId !== 'all') {
      return l.enterpriseId === selectedEnterpriseId;
    }
    return true;
  });

  const eligibleLogs = yearLogs.filter((l) => l.isEligible);
  const ineligibleLogs = yearLogs.filter((l) => !l.isEligible);

  const totalEligibleHours = eligibleLogs.reduce((sum, l) => sum + l.hours, 0);
  const totalIneligibleHours = ineligibleLogs.reduce((sum, l) => sum + l.hours, 0);

  // Target Enterprises
  const targetEnterprises = selectedEnterpriseId && selectedEnterpriseId !== 'all'
    ? enterprises.filter((e) => e.id === selectedEnterpriseId)
    : enterprises;

  // PAGE 1: Safe Harbor Certification Statement (Form 1040 Attachment)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('SECTION 199A SAFE HARBOR STATEMENT', 40, 50);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(emeraldColor[0], emeraldColor[1], emeraldColor[2]);
  doc.text('IRS NOTICE 2019-38 | CONTEMPORANEOUS COMPLIANCE RECORD', 40, 68);

  doc.setDrawColor(226, 232, 240);
  doc.line(40, 78, 572, 78);

  // Taxpayer Info Grid
  doc.setFontSize(9);
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.text('TAXPAYER / ENTITY NAME:', 40, 95);
  doc.text('TIN / EIN / SSN:', 300, 95);
  doc.text('TAX YEAR:', 450, 95);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(taxpayer.entityName || taxpayer.taxpayerName, 40, 108);
  doc.text(taxpayer.ssnOrEin, 300, 108);
  doc.text(String(selectedYear), 450, 108);

  // Safe Harbor Legal Statement Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(40, 125, 532, 105, 4, 4, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(40, 125, 532, 105, 4, 4, 'D');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(51, 65, 85);
  const declarationText = 
    'Under penalties of perjury, I (we) declare that I (we) have examined this statement, including the accompanying logs, ' +
    'and, to the best of my (our) knowledge and belief, the statement contains all the facts required to be included in the ' +
    'statement filed with the return pursuant to IRS Notice 2019-38, Section 3.06.\n\n' +
    '1. The taxpayer held an interest in the Rental Real Estate Enterprise(s) (RREE) listed herein during the taxable year.\n' +
    '2. Separate books and records have been maintained to reflect income and expenses for each rental real estate enterprise.\n' +
    '3. 250 or more hours of qualified rental services were performed with respect to the enterprise during the tax year.\n' +
    '4. Contemporaneous records, including time reports, logs, and similar documents, were maintained and are available for inspection.';
  
  doc.text(declarationText, 48, 142, { maxWidth: 516 });

  // Enterprise Qualification Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('1. Rental Real Estate Enterprise (RREE) Schedule', 40, 252);

  const entRows = targetEnterprises.map((e) => {
    const entProps = properties.filter((p) => e.propertyIds.includes(p.id));
    const entHours = eligibleLogs
      .filter((l) => l.enterpriseId === e.id)
      .reduce((s, curr) => s + curr.hours, 0);

    const isQualified = entHours >= 250 ? 'QUALIFIED (≥250 hrs)' : `IN PROGRESS (${entHours.toFixed(1)} / 250 hrs)`;
    const propNames = entProps.map((p) => p.name).join('; ');

    return [
      e.name,
      e.type === 'residential' ? 'Residential Portfolio' : 'Commercial Enterprise',
      propNames,
      `${e.bankName} (Acct ending ${e.bankAccountLast4})\nSoftware: ${e.ledgerSoftware}`,
      `${entHours.toFixed(1)} hrs`,
      isQualified,
    ];
  });

  autoTable(doc, {
    startY: 262,
    head: [['Enterprise Name', 'RREE Type', 'Included Properties', 'Separate Books & Bank Verification', 'Hours', '250h Status']],
    body: entRows,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 5 },
    headStyles: { fillColor: [15, 23, 42], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 65 },
      2: { cellWidth: 110 },
      3: { cellWidth: 125 },
      4: { cellWidth: 45, halign: 'right' },
      5: { cellWidth: 85, fontStyle: 'bold' },
    },
  });

  let currentY = (doc as any).lastAutoTable.finalY + 25;

  // Summary Metrics Breakdown
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('2. Hours Audit & Contractor Allocation Summary', 40, currentY);

  const ownerHours = eligibleLogs.filter((l) => l.performerRole.includes('Owner')).reduce((s, c) => s + c.hours, 0);
  const contractorHours = eligibleLogs.filter((l) => l.performerRole.includes('Contractor')).reduce((s, c) => s + c.hours, 0);
  const mgrHours = eligibleLogs.filter((l) => l.performerRole.includes('Manager')).reduce((s, c) => s + c.hours, 0);
  const empHours = eligibleLogs.filter((l) => l.performerRole.includes('Employee')).reduce((s, c) => s + c.hours, 0);

  const summaryRows = [
    ['Investor / Owner Direct Services', `${ownerHours.toFixed(1)} hrs`, `${((ownerHours / Math.max(totalEligibleHours, 1)) * 100).toFixed(1)}%`],
    ['Independent Contractors (1099-NEC)', `${contractorHours.toFixed(1)} hrs`, `${((contractorHours / Math.max(totalEligibleHours, 1)) * 100).toFixed(1)}%`],
    ['Licensed Property Managers', `${mgrHours.toFixed(1)} hrs`, `${((mgrHours / Math.max(totalEligibleHours, 1)) * 100).toFixed(1)}%`],
    ['Direct W-2 Employees', `${empHours.toFixed(1)} hrs`, `${((empHours / Math.max(totalEligibleHours, 1)) * 100).toFixed(1)}%`],
    ['TOTAL QUALIFIED RENTAL SERVICES', `${totalEligibleHours.toFixed(1)} hrs`, '100.0%'],
    ['Non-Qualifying / Management Excluded', `${totalIneligibleHours.toFixed(1)} hrs`, 'Excluded per §3.02'],
  ];

  autoTable(doc, {
    startY: currentY + 10,
    head: [['Labor Allocation Classification', 'Total Hours', '% of Qualified Hours']],
    body: summaryRows,
    theme: 'striped',
    styles: { fontSize: 8.5 },
    headStyles: { fillColor: [51, 65, 85] },
  });

  currentY = (doc as any).lastAutoTable.finalY + 30;

  // Signature Block
  if (currentY > 620) {
    doc.addPage();
    currentY = 50;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TAX RETURN ATTACHMENT SIGNATURE & VERIFICATION', 40, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('I hereby certify under penalties of perjury that the above statements and contemporaneous logs are true, correct, and complete.', 40, currentY + 15);

  doc.line(40, currentY + 60, 250, currentY + 60);
  doc.text('Taxpayer / Authorized Representative Signature', 40, currentY + 72);

  doc.line(300, currentY + 60, 420, currentY + 60);
  doc.text('Date', 300, currentY + 72);

  doc.line(440, currentY + 60, 560, currentY + 60);
  doc.text('Preparer / CPA ID', 440, currentY + 72);

  // PAGE 2: CONTEMPORANEOUS TIME LOGS TABLE
  doc.addPage();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('CONTEMPORANEOUS TIME LOGS (IRS NOTICE 2019-38 §3.04)', 40, 45);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.text(`Tax Year: ${selectedYear} | Total Logged Events: ${eligibleLogs.length} | Total Qualified Hours: ${totalEligibleHours.toFixed(2)}`, 40, 60);

  const logRows = eligibleLogs
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((log) => {
      const prop = properties.find((p) => p.id === log.propertyId);
      return [
        log.date,
        prop ? prop.name : 'All',
        log.category,
        `${log.performedBy}\n(${log.performerRole})`,
        log.description,
        `${log.hours.toFixed(1)} hrs`,
      ];
    });

  autoTable(doc, {
    startY: 72,
    head: [['Date', 'Property', 'IRS Approved Category', 'Performed By / Role', 'Detailed Service Description (Audit Defense)', 'Hours']],
    body: logRows,
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 4, overflow: 'linebreak' },
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 55 },
      1: { cellWidth: 80 },
      2: { cellWidth: 95 },
      3: { cellWidth: 85 },
      4: { cellWidth: 175 },
      5: { cellWidth: 40, halign: 'right', fontStyle: 'bold' },
    },
  });

  // PAGE 3: SCHEDULE E EXPENSE & RECEIPT AUDIT TRAIL
  const yearExpenses = expenses.filter((e) => {
    const isYear = e.date.startsWith(String(selectedYear));
    if (!isYear) return false;
    if (selectedEnterpriseId && selectedEnterpriseId !== 'all') {
      return e.enterpriseId === selectedEnterpriseId;
    }
    return true;
  });

  if (yearExpenses.length > 0) {
    doc.addPage();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('SCHEDULE E EXPENSES & RECEIPT AUDIT TRAIL', 40, 45);

    const totalExpAmount = yearExpenses.reduce((s, e) => s + e.amount, 0);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    doc.text(`Financial Segregation Reconciliation | Total Segregated Expenses: $${totalExpAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 40, 60);

    const expRows = yearExpenses
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((e) => {
        const prop = properties.find((p) => p.id === e.propertyId);
        return [
          e.date,
          prop ? prop.name : 'Enterprise',
          e.category,
          e.vendor,
          e.description,
          e.paymentMethod,
          `$${e.amount.toFixed(2)}`,
          e.receiptName ? 'Verified' : 'Pending',
        ];
      });

    autoTable(doc, {
      startY: 72,
      head: [['Date', 'Property', 'IRS Category', 'Vendor', 'Description', 'Method', 'Amount', 'Receipt']],
      body: expRows,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [51, 65, 85], textColor: 255 },
      columnStyles: {
        6: { halign: 'right', fontStyle: 'bold' },
        7: { halign: 'center' },
      },
    });
  }

  // Footer on all pages
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Form 1040 § 199A Safe Harbor Compliance Dossier | Generated ${new Date().toLocaleDateString()} | Page ${i} of ${pageCount}`,
      40,
      780
    );
  }

  const filename = `SafeHarbor_199A_Audit_Binder_${taxpayer.taxpayerName.replace(/\s+/g, '_')}_${selectedYear}.pdf`;
  doc.save(filename);
}
