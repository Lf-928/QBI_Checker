import React, { useState } from 'react';
import { 
  Receipt, 
  Plus, 
  Search, 
  Download, 
  Trash2, 
  Paperclip, 
  Sparkles, 
  DollarSign, 
  Upload, 
  Building, 
  CheckCircle2 
} from 'lucide-react';
import { Enterprise, Expense, Property, ScheduleECategory } from '../types';

interface ExpenseTrackerProps {
  expenses: Expense[];
  enterprises: Enterprise[];
  properties: Property[];
  selectedYear: number;
  onSaveExpense: (expense: Omit<Expense, 'id'>) => void;
  onDeleteExpense: (id: string) => void;
  onExportCSV: () => void;
}

const SCHEDULE_E_CATEGORIES: ScheduleECategory[] = [
  'Advertising',
  'Auto and Travel',
  'Cleaning and Maintenance',
  'Commissions',
  'Insurance',
  'Legal & Professional Fees',
  'Management Fees',
  'Mortgage Interest',
  'Other Interest',
  'Repairs',
  'Supplies',
  'Taxes (Property)',
  'Utilities',
  'Other Expenses',
];

// Smart auto-categorization lookup based on vendor keywords
const AUTO_CATEGORY_RULES: { keywords: string[]; category: ScheduleECategory }[] = [
  { keywords: ['home depot', 'lowes', 'hardware', 'ace hardware', 'menards'], category: 'Supplies' },
  { keywords: ['hvac', 'plumbing', 'electric', 'roofing', 'painter', 'contractor', 'repair'], category: 'Repairs' },
  { keywords: ['zillow', 'apartments.com', 'yard sign', 'facebook ad', 'craigslist', 'ad'], category: 'Advertising' },
  { keywords: ['state farm', 'allstate', 'travelers', 'liberty mutual', 'geico', 'insurance'], category: 'Insurance' },
  { keywords: ['attorney', 'lawyer', 'cpa', 'accounting', 'legal', 'eviction filing'], category: 'Legal & Professional Fees' },
  { keywords: ['water', 'electric', 'pge', 'gas', 'trash', 'sewer', 'utility'], category: 'Utilities' },
  { keywords: ['county tax', 'property tax', 'treasurer', 'assessment'], category: 'Taxes (Property)' },
  { keywords: ['clean', 'janitorial', 'carpet cleaning', 'maid', 'landscaping', 'mowing'], category: 'Cleaning and Maintenance' },
];

export const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({
  expenses,
  enterprises,
  properties,
  selectedYear,
  onSaveExpense,
  onDeleteExpense,
  onExportCSV,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntFilter, setSelectedEntFilter] = useState('all');
  const [selectedCatFilter, setSelectedCatFilter] = useState('all');

  // Form states
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPropertyId, setSelectedPropertyId] = useState(properties[0]?.id || '');
  const [selectedEnterpriseId, setSelectedEnterpriseId] = useState(enterprises[0]?.id || '');
  const [amount, setAmount] = useState<number>(150);
  const [category, setCategory] = useState<ScheduleECategory>('Supplies');
  const [vendor, setVendor] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Bank Transfer' | 'Debit Card' | 'Credit Card' | 'Check' | 'ACH'>('Debit Card');
  const [receiptName, setReceiptName] = useState('');
  const [receiptDataUrl, setReceiptDataUrl] = useState('');
  const [autoCatSuggestion, setAutoCatSuggestion] = useState<ScheduleECategory | null>(null);

  const handleVendorChange = (val: string) => {
    setVendor(val);
    const lower = val.toLowerCase();
    for (const rule of AUTO_CATEGORY_RULES) {
      if (rule.keywords.some((kw) => lower.includes(kw))) {
        setAutoCatSuggestion(rule.category);
        setCategory(rule.category);
        break;
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setReceiptDataUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor.trim() || amount <= 0) {
      alert('Please fill out a valid vendor and amount.');
      return;
    }

    const prop = properties.find((p) => p.id === selectedPropertyId);
    const entId = prop ? prop.enterpriseId : selectedEnterpriseId;

    onSaveExpense({
      date,
      propertyId: selectedPropertyId,
      enterpriseId: entId,
      amount: Number(amount),
      category,
      vendor: vendor.trim(),
      description: description.trim(),
      paymentMethod,
      receiptName: receiptName || undefined,
      receiptDataUrl: receiptDataUrl || undefined,
      taxDeductible: true,
    });

    setIsModalOpen(false);
    setVendor('');
    setDescription('');
    setReceiptName('');
    setReceiptDataUrl('');
    setAutoCatSuggestion(null);
  };

  const filteredExpenses = expenses
    .filter((e) => e.date.startsWith(String(selectedYear)))
    .filter((e) => {
      if (selectedEntFilter !== 'all' && e.enterpriseId !== selectedEntFilter) return false;
      if (selectedCatFilter !== 'all' && e.category !== selectedCatFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          e.vendor.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalExpenseSum = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              Form 1040 Schedule E
            </span>
            <span className="text-xs text-slate-400 font-mono">Tax Year {selectedYear}</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1.5">
            Segregated Real Estate Expenses & Receipt Logging
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Automatic categorization into IRS Schedule E line items with receipt audit defense.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportCSV}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Expenses</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-950 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Log Expense</span>
          </button>
        </div>
      </div>

      {/* KPI & Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span className="text-xs text-slate-400">Total Segregated Expenses:</span>
            <span className="text-base font-mono font-bold text-white">
              ${totalExpenseSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="text-xs text-slate-400">
            {filteredExpenses.length} receipts & transactions logged
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800/80">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search vendor or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

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

          <select
            value={selectedCatFilter}
            onChange={(e) => setSelectedCatFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Schedule E Categories</option>
            {SCHEDULE_E_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Date</th>
                <th className="py-3.5 px-4 font-semibold">Property / RREE</th>
                <th className="py-3.5 px-4 font-semibold">Schedule E Category</th>
                <th className="py-3.5 px-4 font-semibold">Vendor</th>
                <th className="py-3.5 px-4 font-semibold">Description</th>
                <th className="py-3.5 px-4 font-semibold">Method</th>
                <th className="py-3.5 px-4 font-semibold text-right">Amount</th>
                <th className="py-3.5 px-4 font-semibold text-center">Receipt</th>
                <th className="py-3.5 px-4 font-semibold text-center">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No expenses found for this criteria.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => {
                  const prop = properties.find((p) => p.id === exp.propertyId);
                  const ent = enterprises.find((e) => e.id === exp.enterpriseId);

                  return (
                    <tr key={exp.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                        {exp.date}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">{prop ? prop.name : 'Enterprise'}</div>
                        <div className="text-[10px] text-slate-400">{ent?.name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 text-[11px] whitespace-nowrap">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-200">{exp.vendor}</td>
                      <td className="py-3 px-4 text-slate-300 max-w-xs truncate">{exp.description}</td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">{exp.paymentMethod}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-white whitespace-nowrap">
                        ${exp.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {exp.receiptName ? (
                          <span className="text-emerald-400 font-mono text-[11px] flex items-center justify-center gap-1">
                            <Paperclip className="w-3 h-3" />
                            <span>Logged</span>
                          </span>
                        ) : (
                          <span className="text-slate-600 text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => onDeleteExpense(exp.id)}
                          className="p-1 text-slate-500 hover:text-red-400"
                          title="Delete expense"
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

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Record Schedule E Rental Expense</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Amount ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-white font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Property</label>
                <select
                  value={selectedPropertyId}
                  onChange={(e) => setSelectedPropertyId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.address})
                    </option>
                  ))}
                </select>
              </div>

              {/* Vendor with auto-categorization */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-300 font-semibold">Vendor / Merchant</label>
                  {autoCatSuggestion && (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Auto-categorized as {autoCatSuggestion}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="e.g. Home Depot, Miller HVAC, Zillow, Cascade Concrete"
                  value={vendor}
                  onChange={(e) => handleVendorChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Schedule E Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-white"
                  >
                    {SCHEDULE_E_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-white"
                  >
                    <option value="Debit Card">Debit Card (Operating Acct)</option>
                    <option value="Bank Transfer">Bank Transfer / Wire</option>
                    <option value="ACH">ACH Direct</option>
                    <option value="Credit Card">Business Credit Card</option>
                    <option value="Check">Check</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description of Expense</label>
                <input
                  type="text"
                  placeholder="e.g. Plumbing replacement cartridge, sealant, and hardware fittings"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              {/* Receipt File */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="text-xs">
                  <div className="font-semibold text-slate-200">Receipt / Invoice File</div>
                  <div className="text-[11px] text-slate-400">
                    {receiptName ? receiptName : 'Attach digital photo or PDF'}
                  </div>
                </div>
                <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg cursor-pointer flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Browse</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg"
                >
                  Save Schedule E Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
