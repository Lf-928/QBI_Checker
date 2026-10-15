import { Enterprise, Expense, Property, TimeLogEntry } from '../types';

export function exportTimeLogsCSV(
  logs: TimeLogEntry[],
  properties: Property[],
  enterprises: Enterprise[],
  year: number
): void {
  const filtered = logs.filter((l) => l.date.startsWith(String(year)));

  const headers = [
    'Log ID',
    'Date',
    'Hours',
    'Safe Harbor Eligible (Notice 2019-38)',
    'Activity Category',
    'Task Description',
    'Performed By',
    'Performer Classification',
    'Property Name',
    'Enterprise Name',
    'Receipt Reference',
    'Notes',
  ];

  const escapeCsv = (str: string | undefined | null) => {
    if (str === undefined || str === null) return '""';
    const clean = String(str).replace(/"/g, '""');
    return `"${clean}"`;
  };

  const rows = filtered.map((l) => {
    const prop = properties.find((p) => p.id === l.propertyId);
    const ent = enterprises.find((e) => e.id === l.enterpriseId);

    return [
      escapeCsv(l.id),
      escapeCsv(l.date),
      l.hours.toFixed(2),
      l.isEligible ? '"YES (Qualified Rental Service)"' : '"NO (Excluded Task)"',
      escapeCsv(l.category),
      escapeCsv(l.description),
      escapeCsv(l.performedBy),
      escapeCsv(l.performerRole),
      escapeCsv(prop ? prop.name : 'All'),
      escapeCsv(ent ? ent.name : 'Unknown Enterprise'),
      escapeCsv(l.receiptName || 'None'),
      escapeCsv(l.notes || ''),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `IRS_199A_Contemporaneous_TimeLogs_${year}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportExpensesCSV(
  expenses: Expense[],
  properties: Property[],
  enterprises: Enterprise[],
  year: number
): void {
  const filtered = expenses.filter((e) => e.date.startsWith(String(year)));

  const headers = [
    'Expense ID',
    'Date',
    'Enterprise',
    'Property',
    'Schedule E Category',
    'Vendor',
    'Description',
    'Payment Method',
    'Amount',
    'Tax Deductible',
    'Receipt Reference',
  ];

  const escapeCsv = (str: string | undefined | null) => {
    if (str === undefined || str === null) return '""';
    const clean = String(str).replace(/"/g, '""');
    return `"${clean}"`;
  };

  const rows = filtered.map((e) => {
    const prop = properties.find((p) => p.id === e.propertyId);
    const ent = enterprises.find((entItem) => entItem.id === e.enterpriseId);

    return [
      escapeCsv(e.id),
      escapeCsv(e.date),
      escapeCsv(ent ? ent.name : 'Unknown Enterprise'),
      escapeCsv(prop ? prop.name : 'Enterprise Wide'),
      escapeCsv(e.category),
      escapeCsv(e.vendor),
      escapeCsv(e.description),
      escapeCsv(e.paymentMethod),
      e.amount.toFixed(2),
      e.taxDeductible ? '"YES"' : '"NO"',
      escapeCsv(e.receiptName || 'No Receipt'),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Schedule_E_Segregated_Expenses_${year}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
