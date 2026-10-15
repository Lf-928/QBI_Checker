export type PerformerRole = 
  | 'Owner / Investor'
  | 'Co-Owner / Spouse'
  | 'W-2 Employee'
  | 'Independent Contractor (1099)'
  | 'Property Manager';

export type ApprovedRentalCategory =
  | 'Advertising & Negotiating Leases'
  | 'Verifying Tenant Applications & Screening'
  | 'Collecting Rent & Processing Payments'
  | 'Daily Operation, Maintenance & Repairs'
  | 'Purchasing Materials & Supplies'
  | 'Managing Property Managers & Contractors';

export type IneligibleCategory =
  | 'Travel To / From Property'
  | 'Reviewing Financial Statements & Investment Reports'
  | 'Planning Capital Improvements / Major Renovations'
  | 'Procuring Financing & Mortgage Refinance'
  | 'Property Acquisition & Disposition Analysis'
  | 'Personal / Non-Rental Activities';

export type AllTaskCategory = ApprovedRentalCategory | IneligibleCategory;

export interface TimeLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  startTime?: string;
  endTime?: string;
  hours: number;
  propertyId: string;
  enterpriseId: string;
  category: AllTaskCategory;
  isEligible: boolean; // Must be true to count toward the 250-hour threshold
  description: string;
  performedBy: string;
  performerRole: PerformerRole;
  receiptName?: string;
  receiptDataUrl?: string;
  linkedExpenseId?: string; // Cross-referenced financial transaction
  expenseAmountMatched?: number;
  isGeoLogged?: boolean; // Logged via intelligent geo-fencing departure
  notes?: string;
  createdAt: string;
}

export type PropertyType = 'residential' | 'commercial';

export interface Property {
  id: string;
  name: string;
  address: string;
  propertyType: PropertyType; // residential or commercial
  unitsCount: number;
  acquisitionDate: string; // YYYY-MM-DD
  leaseTerms: string; // e.g. "12-Month Fixed Residential", "Modified Gross Commercial"
  enterpriseId: string;
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
  // IRS Safe Harbor Exclusion Checklist (Notice 2019-38 §3.05)
  personalUseDays: number;
  totalDaysRented: number;
  isTripleNetLease: boolean;
  usedByTaxpayer: boolean;
  isSafeHarborEligible: boolean;
  ineligibilityReason?: string;
  estimatedNetRentalIncome?: number;
}

export interface Enterprise {
  id: string;
  name: string;
  type: 'residential' | 'commercial';
  groupingType: 'single_property' | 'grouped_portfolio';
  propertyIds: string[];
  taxYear: number;
  isLockedForTaxYear?: boolean;
  separateBankVerified: boolean;
  bankName: string;
  bankAccountLast4: string;
  ledgerSoftware: string;
  separateBooksConfirmedDate: string;
  notes?: string;
}

export type ScheduleECategory =
  | 'Advertising'
  | 'Auto and Travel'
  | 'Cleaning and Maintenance'
  | 'Commissions'
  | 'Insurance'
  | 'Legal & Professional Fees'
  | 'Management Fees'
  | 'Mortgage Interest'
  | 'Other Interest'
  | 'Repairs'
  | 'Supplies'
  | 'Taxes (Property)'
  | 'Utilities'
  | 'Other Expenses';

export interface Expense {
  id: string;
  date: string;
  propertyId: string;
  enterpriseId: string;
  amount: number;
  category: ScheduleECategory;
  vendor: string;
  description: string;
  paymentMethod: 'Bank Transfer' | 'Debit Card' | 'Credit Card' | 'Check' | 'ACH';
  receiptName?: string;
  receiptDataUrl?: string;
  linkedTimeLogId?: string; // Cross-referenced time entry
  taxDeductible: boolean;
}

export interface CoOwnerProfile {
  id: string;
  name: string;
  role: 'Primary Owner' | 'Co-Owner / Spouse' | 'Partner';
  ownershipPercentage: number;
  email: string;
  avatarColor: string;
}

export interface TaxpayerProfile {
  taxpayerName: string;
  ssnOrEin: string;
  taxYear: number;
  filingStatus: 'Single' | 'Married Filing Jointly' | 'Married Filing Separately' | 'Entity (LLC / Partnership / S-Corp)';
  entityName?: string;
  contactEmail: string;
  cpaName?: string;
  lastBackupDate?: string;
  lockGroupingForTaxYear: boolean;
  archivedYears: number[]; // Read-only frozen years (e.g., [2024])
  estimatedAnnualNetIncome: number;
  coOwners: CoOwnerProfile[];
  activePerformerId: string;
}
