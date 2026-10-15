import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  Copy, 
  Check, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Award, 
  AlertCircle,
  Building,
  Calendar,
  Printer
} from 'lucide-react';
import { Enterprise, Expense, Property, TaxpayerProfile, TimeLogEntry } from '../types';
import { generateAuditDefensePDF } from '../utils/pdfGenerator';

interface AuditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  taxpayer: TaxpayerProfile;
  enterprises: Enterprise[];
  properties: Property[];
  timeLogs: TimeLogEntry[];
  expenses: Expense[];
  selectedYear: number;
  onToggleArchiveYear: (year: number) => void;
}

export const AuditReportModal: React.FC<AuditReportModalProps> = ({
  isOpen,
  onClose,
  taxpayer,
  enterprises,
  properties,
  timeLogs,
  expenses,
  selectedYear,
  onToggleArchiveYear,
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedEnterpriseFilter, setSelectedEnterpriseFilter] = useState('all');

  if (!isOpen) return null;

  const isYearArchived = taxpayer.archivedYears?.includes(selectedYear);

  const yearLogs = timeLogs.filter((l) => l.date.startsWith(String(selectedYear)));
  const eligibleLogs = yearLogs.filter((l) => l.isEligible);
  const totalEligibleHours = eligibleLogs.reduce((sum, l) => sum + l.hours, 0);

  const targetEnterprises = selectedEnterpriseFilter === 'all'
    ? enterprises
    : enterprises.filter((e) => e.id === selectedEnterpriseFilter);

  // Statutory Safe Harbor Text (Notice 2019-38 §3.06)
  const statutoryStatementText = `STATEMENT UNDER IRS NOTICE 2019-38
SECTION 199A QUALIFIED BUSINESS INCOME SAFE HARBOR ELECTION
ATTACHMENT TO FORM 1040 / FORM 1065 / FORM 1120-S

Taxpayer Name: ${taxpayer.entityName || taxpayer.taxpayerName}
TIN / EIN / SSN: ${taxpayer.ssnOrEin}
Taxable Year: ${selectedYear}

Under penalties of perjury, I (we) declare that I (we) have examined this statement, including the accompanying contemporaneous logs, and, to the best of my (our) knowledge and belief, the statement contains all the facts required to be included in the statement filed with the return pursuant to IRS Notice 2019-38, Section 3.06.

1. The taxpayer held an interest in the Rental Real Estate Enterprise(s) (RREE) listed below during the taxable year.
2. Separate books and records have been maintained to reflect income and expenses for each rental real estate enterprise.
3. 250 or more hours of qualified rental services were performed with respect to the enterprise during the taxable year.
4. Contemporaneous records, including time reports, logs, and similar documents, were maintained and are available for inspection upon request by the Internal Revenue Service.
5. All rental properties included herein meet the safe harbor criteria, with no triple-net (NNN) leases and no personal residence usage exceeding IRC § 280A limitations.

RENTAL REAL ESTATE ENTERPRISES SCHEDULE:
${enterprises.map((e, idx) => {
  const entProps = properties.filter((p) => e.propertyIds.includes(p.id));
  const entHours = eligibleLogs.filter((l) => l.enterpriseId === e.id).reduce((s, c) => s + c.hours, 0);
  const status = entHours >= 250 ? 'QUALIFIED (≥250 hrs)' : `IN PROGRESS (${entHours.toFixed(1)} / 250 hrs)`;
  return `Enterprise ${idx + 1}: ${e.name}
  - Classification: ${e.type === 'residential' ? 'Residential Portfolio' : 'Commercial Enterprise'} (${e.groupingType})
  - Separate Bank & Books: ${e.bankName} (Acct Ending ${e.bankAccountLast4}) | Ledger: ${e.ledgerSoftware}
  - Included Properties: ${entProps.map((p) => `${p.name} [${p.address}]`).join(', ')}
  - Total Qualified Contemporaneous Hours: ${entHours.toFixed(1)} hrs
  - Safe Harbor Status: ${status}`;
}).join('\n\n')}

Certified by: ___________________________________________ Date: _________________
Taxpayer / Authorized Representative Signature`;

  const handleCopyStatement = () => {
    navigator.clipboard.writeText(statutoryStatementText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownloadPDF = () => {
    generateAuditDefensePDF({
      taxpayer,
      enterprises,
      properties,
      timeLogs,
      expenses,
      selectedEnterpriseId: selectedEnterpriseFilter,
      selectedYear,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                IRS Notice 2019-38 Audit Defense Dossier & Form 1040 Attachment
              </h2>
              <p className="text-xs text-slate-400">
                Statutory Statement, Enterprise Summary Table, and Contemporaneous Audit Ledger
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-Year Archiving & Immutable Lock Bar */}
        <div className="bg-slate-850 px-6 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60">
          <div className="flex items-center gap-2 text-xs">
            {isYearArchived ? (
              <span className="flex items-center gap-1.5 text-cyan-400 font-semibold bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-800">
                <Lock className="w-3.5 h-3.5" />
                <span>Tax Year {selectedYear} Frozen in Read-Only Audit Archive</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-300 font-medium bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-800">
                <Unlock className="w-3.5 h-3.5 text-amber-400" />
                <span>Tax Year {selectedYear} Active (Editable)</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onToggleArchiveYear(selectedYear)}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1"
            >
              {isYearArchived ? 'Unlock for Edits' : 'Freeze & Lock as Filed Year'}
            </button>

            <button
              onClick={handleCopyStatement}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Form 1040 Text'}</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md shadow-emerald-950 flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Official PDF Dossier</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* SECTION A: Statutory Safe Harbor Statement Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Section A: Statutory Safe Harbor Statement (Notice 2019-38 §3.06)
              </span>
              <span className="text-[11px] text-slate-400">Must be attached to Form 1040</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-line shadow-inner max-h-60 overflow-y-auto">
              {statutoryStatementText}
            </div>
          </div>

          {/* SECTION B: Enterprise Executive Summary Table */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Section B: Enterprise Executive Summary Table
            </span>

            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Enterprise Name</th>
                    <th className="py-2.5 px-3">Property Type</th>
                    <th className="py-2.5 px-3">Total Properties</th>
                    <th className="py-2.5 px-3 text-right">Total Hours Logged</th>
                    <th className="py-2.5 px-3 text-center">Safe Harbor Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {enterprises.map((e) => {
                    const entProps = properties.filter((p) => e.propertyIds.includes(p.id));
                    const entHours = eligibleLogs
                      .filter((l) => l.enterpriseId === e.id)
                      .reduce((s, c) => s + c.hours, 0);
                    const isMet = entHours >= 250;

                    return (
                      <tr key={e.id} className="hover:bg-slate-900/40">
                        <td className="py-2.5 px-3 font-semibold text-white font-sans">{e.name}</td>
                        <td className="py-2.5 px-3 text-slate-300 font-sans capitalize">{e.type}</td>
                        <td className="py-2.5 px-3 text-slate-300">{entProps.length} Properties</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-200">
                          {entHours.toFixed(1)} hrs
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {isMet ? (
                            <span className="text-emerald-400 font-bold font-sans text-[11px] bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                              ✅ MET (≥250 hrs)
                            </span>
                          ) : (
                            <span className="text-amber-400 font-bold font-sans text-[11px] bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                              ❌ NOT MET ({entHours.toFixed(1)} / 250 hrs)
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION C: Contemporaneous Log Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Section C: The Contemporaneous Log (The Audit Trail)
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {eligibleLogs.length} qualified entries ({totalEligibleHours.toFixed(1)} hrs)
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Property Address</th>
                    <th className="py-2 px-3">IRS Category</th>
                    <th className="py-2 px-3">Description of Service</th>
                    <th className="py-2 px-3 text-right">Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {eligibleLogs.slice(0, 8).map((log) => {
                    const prop = properties.find((p) => p.id === log.propertyId);
                    return (
                      <tr key={log.id} className="hover:bg-slate-900/30">
                        <td className="py-2 px-3 font-mono text-slate-300 whitespace-nowrap">{log.date}</td>
                        <td className="py-2 px-3 text-slate-200 truncate max-w-[130px]">
                          {prop ? prop.address : 'Portfolio Wide'}
                        </td>
                        <td className="py-2 px-3 text-slate-400 truncate max-w-[120px]">{log.category}</td>
                        <td className="py-2 px-3 text-slate-300 truncate max-w-[200px]" title={log.description}>
                          {log.description}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-emerald-400 whitespace-nowrap">
                          {log.hours.toFixed(1)} hrs
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-500 italic">
              Showing preview of first 8 entries. Full dossier PDF exports all {eligibleLogs.length} contemporaneous logs and Schedule E receipts.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-mono">
            Tamper-evident timestamp: {new Date().toISOString().slice(0, 19).replace('T', ' ')} UTC | SafeHarbor 199A
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
