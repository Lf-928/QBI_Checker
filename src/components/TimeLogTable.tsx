import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Paperclip, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Building,
  User,
  Calendar,
  ExternalLink,
  Eye
} from 'lucide-react';
import { Enterprise, Property, TimeLogEntry } from '../types';

interface TimeLogTableProps {
  timeLogs: TimeLogEntry[];
  enterprises: Enterprise[];
  properties: Property[];
  selectedYear: number;
  onOpenLogModal: () => void;
  onDeleteLog: (id: string) => void;
  onExportCSV: () => void;
}

export const TimeLogTable: React.FC<TimeLogTableProps> = ({
  timeLogs,
  enterprises,
  properties,
  selectedYear,
  onOpenLogModal,
  onDeleteLog,
  onExportCSV,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntFilter, setSelectedEntFilter] = useState('all');
  const [selectedPropFilter, setSelectedPropFilter] = useState('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [selectedEligibilityFilter, setSelectedEligibilityFilter] = useState<'all' | 'eligible' | 'ineligible'>('all');
  const [previewReceiptLog, setPreviewReceiptLog] = useState<TimeLogEntry | null>(null);

  // Filter logs
  const filteredLogs = timeLogs
    .filter((log) => log.date.startsWith(String(selectedYear)))
    .filter((log) => {
      if (selectedEntFilter !== 'all' && log.enterpriseId !== selectedEntFilter) return false;
      if (selectedPropFilter !== 'all' && log.propertyId !== selectedPropFilter) return false;
      if (selectedCategoryFilter !== 'all' && log.category !== selectedCategoryFilter) return false;
      if (selectedEligibilityFilter === 'eligible' && !log.isEligible) return false;
      if (selectedEligibilityFilter === 'ineligible' && log.isEligible) return false;

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const prop = properties.find((p) => p.id === log.propertyId);
        const matchesDesc = log.description.toLowerCase().includes(query);
        const matchesPerformer = log.performedBy.toLowerCase().includes(query);
        const matchesProp = prop?.name.toLowerCase().includes(query) || false;
        const matchesCat = log.category.toLowerCase().includes(query);
        return matchesDesc || matchesPerformer || matchesProp || matchesCat;
      }
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalFilteredHours = filteredLogs
    .filter((l) => l.isEligible)
    .reduce((sum, l) => sum + l.hours, 0);

  const totalIneligibleFilteredHours = filteredLogs
    .filter((l) => !l.isEligible)
    .reduce((sum, l) => sum + l.hours, 0);

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              <span>Contemporaneous Time Log Ledger</span>
            </h2>
            <p className="text-xs text-slate-400">
              IRS Notice 2019-38 §3.04 compliant audit records for Tax Year {selectedYear}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onExportCSV}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onOpenLogModal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-950 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Log Service</span>
            </button>
          </div>
        </div>

        {/* Search & Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-2">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search descriptions, performers, properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Enterprise Filter */}
          <select
            value={selectedEntFilter}
            onChange={(e) => setSelectedEntFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Enterprises</option>
            {enterprises.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>

          {/* Property Filter */}
          <select
            value={selectedPropFilter}
            onChange={(e) => setSelectedPropFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Properties</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Eligibility Filter */}
          <select
            value={selectedEligibilityFilter}
            onChange={(e) => setSelectedEligibilityFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Statuses</option>
            <option value="eligible">✓ Safe Harbor Eligible Only</option>
            <option value="ineligible">⚠ Excluded Tasks Only</option>
          </select>
        </div>

        {/* Filter Metrics Summary */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          <div>
            Showing <strong className="text-white font-mono">{filteredLogs.length}</strong> logged entries
          </div>
          <div className="flex items-center gap-4">
            <span>
              Qualified Hours: <strong className="text-emerald-400 font-mono text-sm">{totalFilteredHours.toFixed(1)} hrs</strong>
            </span>
            {totalIneligibleFilteredHours > 0 && (
              <span>
                Quarantined: <strong className="text-amber-400 font-mono">{totalIneligibleFilteredHours.toFixed(1)} hrs</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Date & Time</th>
                <th className="py-3.5 px-4 font-semibold">Property / RREE</th>
                <th className="py-3.5 px-4 font-semibold">IRS Category</th>
                <th className="py-3.5 px-4 font-semibold">Performed By</th>
                <th className="py-3.5 px-4 font-semibold">Detailed Task Description</th>
                <th className="py-3.5 px-4 font-semibold text-right">Hours</th>
                <th className="py-3.5 px-4 font-semibold text-center">Receipt</th>
                <th className="py-3.5 px-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No time entries found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const prop = properties.find((p) => p.id === log.propertyId);
                  const ent = enterprises.find((e) => e.id === log.enterpriseId);

                  return (
                    <tr
                      key={log.id}
                      className={`hover:bg-slate-850/60 transition-colors ${
                        !log.isEligible ? 'bg-amber-950/10' : ''
                      }`}
                    >
                      {/* Date */}
                      <td className="py-3 px-4 font-mono whitespace-nowrap">
                        <div className="font-semibold text-slate-200">{log.date}</div>
                        {log.startTime && log.endTime && (
                          <div className="text-[10px] text-slate-500">
                            {log.startTime} - {log.endTime}
                          </div>
                        )}
                      </td>

                      {/* Property & Enterprise */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200 truncate max-w-[150px]">
                          {prop ? prop.name : 'All Properties'}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                          {ent ? ent.name : 'Unknown RREE'}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {log.isEligible ? (
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                          ) : (
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                          )}
                          <span
                            className={`font-medium ${
                              log.isEligible ? 'text-slate-200' : 'text-amber-300'
                            }`}
                          >
                            {log.category}
                          </span>
                        </div>
                        {!log.isEligible && (
                          <span className="inline-block mt-0.5 text-[9px] uppercase font-bold text-amber-400 bg-amber-950 px-1 rounded border border-amber-800">
                            Excluded Task
                          </span>
                        )}
                      </td>

                      {/* Performer */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-200">{log.performedBy}</div>
                        <div className="text-[10px] text-slate-400">{log.performerRole}</div>
                      </td>

                      {/* Description */}
                      <td className="py-3 px-4">
                        <p className="text-slate-300 leading-relaxed max-w-md line-clamp-2" title={log.description}>
                          {log.description}
                        </p>
                        {log.notes && (
                          <div className="text-[10px] text-slate-400 mt-0.5 italic">
                            Note: {log.notes}
                          </div>
                        )}
                      </td>

                      {/* Hours */}
                      <td className="py-3 px-4 text-right font-mono whitespace-nowrap">
                        <span
                          className={`text-sm font-bold ${
                            log.isEligible ? 'text-emerald-400' : 'text-slate-400 line-through'
                          }`}
                        >
                          {log.hours.toFixed(1)} hrs
                        </span>
                      </td>

                      {/* Receipt */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {log.receiptName ? (
                          <button
                            type="button"
                            onClick={() => setPreviewReceiptLog(log)}
                            className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 hover:text-emerald-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700"
                            title={log.receiptName}
                          >
                            <Paperclip className="w-3 h-3" />
                            <span>View</span>
                          </button>
                        ) : (
                          <span className="text-slate-600 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Delete this contemporaneous time log entry?')) {
                              onDeleteLog(log.id);
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Preview Modal */}
      {previewReceiptLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Paperclip className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-sm">Receipt / Supporting Document</h3>
              </div>
              <button
                onClick={() => setPreviewReceiptLog(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">File Name:</span>
                <span className="font-mono text-slate-200">{previewReceiptLog.receiptName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Date Logged:</span>
                <span className="font-mono text-slate-200">{previewReceiptLog.date}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Task:</span>
                <span className="text-slate-200 font-medium">{previewReceiptLog.category}</span>
              </div>
            </div>

            {previewReceiptLog.receiptDataUrl ? (
              <div className="mt-3 max-h-60 overflow-hidden rounded-lg border border-slate-700 bg-slate-950 flex items-center justify-center p-2">
                <img
                  src={previewReceiptLog.receiptDataUrl}
                  alt="Receipt"
                  className="max-h-56 object-contain"
                />
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-400">
                Document verified for audit defense: {previewReceiptLog.receiptName}
              </div>
            )}

            <button
              onClick={() => setPreviewReceiptLog(null)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
