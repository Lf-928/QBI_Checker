import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Unlock, 
  Landmark, 
  BookOpen, 
  ShieldCheck, 
  Edit3, 
  Layers, 
  Trash2,
  Info
} from 'lucide-react';
import { Enterprise, Property, TaxpayerProfile, TimeLogEntry } from '../types';

interface EnterpriseManagerProps {
  enterprises: Enterprise[];
  properties: Property[];
  timeLogs: TimeLogEntry[];
  taxpayer: TaxpayerProfile;
  selectedYear: number;
  onSaveEnterprise: (enterprise: Enterprise) => void;
  onDeleteEnterprise: (id: string) => void;
  onToggleGroupingLock: (locked: boolean) => void;
  onOpenPropertyModal: (propertyId?: string) => void;
}

export const EnterpriseManager: React.FC<EnterpriseManagerProps> = ({
  enterprises,
  properties,
  timeLogs,
  taxpayer,
  selectedYear,
  onSaveEnterprise,
  onDeleteEnterprise,
  onToggleGroupingLock,
  onOpenPropertyModal,
}) => {
  const [editingEnterprise, setEditingEnterprise] = useState<Enterprise | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<'residential' | 'commercial'>('residential');
  const [groupingType, setGroupingType] = useState<'single_property' | 'grouped_portfolio'>('grouped_portfolio');
  const [bankName, setBankName] = useState('Chase Commercial Banking');
  const [bankAccountLast4, setBankAccountLast4] = useState('4821');
  const [ledgerSoftware, setLedgerSoftware] = useState('QuickBooks Online (Separate Chart of Accounts)');
  const [separateBooksConfirmedDate, setSeparateBooksConfirmedDate] = useState('2026-01-05');
  const [separateBankVerified, setSeparateBankVerified] = useState(true);
  const [notes, setNotes] = useState('');

  const eligibleLogs = timeLogs.filter((l) => l.isEligible && l.date.startsWith(String(selectedYear)));

  const handleOpenAdd = () => {
    setEditingEnterprise(null);
    setName('');
    setType('residential');
    setGroupingType('grouped_portfolio');
    setBankName('Chase Commercial Banking');
    setBankAccountLast4('1234');
    setLedgerSoftware('QuickBooks Online');
    setSeparateBooksConfirmedDate(new Date().toISOString().split('T')[0]);
    setSeparateBankVerified(true);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ent: Enterprise) => {
    setEditingEnterprise(ent);
    setName(ent.name);
    setType(ent.type);
    setGroupingType(ent.groupingType);
    setBankName(ent.bankName);
    setBankAccountLast4(ent.bankAccountLast4);
    setLedgerSoftware(ent.ledgerSoftware);
    setSeparateBooksConfirmedDate(ent.separateBooksConfirmedDate);
    setSeparateBankVerified(ent.separateBankVerified);
    setNotes(ent.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Enterprise Name is required.');
      return;
    }

    const entId = editingEnterprise ? editingEnterprise.id : `ent-${Date.now()}`;
    const existingProps = editingEnterprise ? editingEnterprise.propertyIds : [];

    onSaveEnterprise({
      id: entId,
      name: name.trim(),
      type,
      groupingType,
      propertyIds: existingProps,
      taxYear: selectedYear,
      isLockedForTaxYear: taxpayer.lockGroupingForTaxYear,
      separateBankVerified,
      bankName: bankName.trim(),
      bankAccountLast4: bankAccountLast4.trim(),
      ledgerSoftware: ledgerSoftware.trim(),
      separateBooksConfirmedDate,
      notes: notes.trim(),
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Notice 2019-38 Separate Books & Grouping Lock */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              IRS Notice 2019-38 §3.03 & §3.06
            </span>
            <span className="text-xs text-slate-400 font-mono">Tax Year {selectedYear}</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1.5">
            Enterprise Grouping & Separate Bookkeeping Segregation
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            The IRS mandates completely separate books, accounts, and contemporaneous records for each Rental Real Estate Enterprise.
          </p>
        </div>

        {/* Lock-In Setting Toggle */}
        <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            {taxpayer.lockGroupingForTaxYear ? (
              <Lock className="w-4 h-4 text-emerald-400" />
            ) : (
              <Unlock className="w-4 h-4 text-amber-400" />
            )}
            <div className="text-xs">
              <div className="font-semibold text-slate-200">Lock Grouping for Tax Year {selectedYear}</div>
              <div className="text-[10px] text-slate-400">
                {taxpayer.lockGroupingForTaxYear ? 'Consistency rule enforced' : 'Unlocked (Modifications allowed)'}
              </div>
            </div>
          </div>
          <button
            onClick={() => onToggleGroupingLock(!taxpayer.lockGroupingForTaxYear)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              taxpayer.lockGroupingForTaxYear
                ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
                : 'bg-amber-600/30 text-amber-300 border border-amber-500/40'
            }`}
          >
            {taxpayer.lockGroupingForTaxYear ? 'Locked' : 'Unlocked'}
          </button>
        </div>
      </div>

      {/* Enterprise Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {enterprises.map((ent) => {
          const entProps = properties.filter((p) => ent.propertyIds.includes(p.id));
          const entHours = eligibleLogs
            .filter((l) => l.enterpriseId === ent.id)
            .reduce((s, curr) => s + curr.hours, 0);
          const isQualified = entHours >= 250;

          return (
            <div
              key={ent.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {ent.type === 'residential' ? 'Residential Portfolio' : 'Commercial Enterprise'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {ent.groupingType === 'grouped_portfolio' ? '👥 Grouped RREE' : '⏹️ Stand-Alone'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1.5">{ent.name}</h3>
                  </div>

                  <button
                    onClick={() => handleOpenEdit(ent)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                    title="Edit Enterprise"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                {/* Safe Harbor 250h meter */}
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 mb-4">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-slate-400">Safe Harbor 250h Status:</span>
                    <span className={`font-mono font-bold ${isQualified ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {entHours.toFixed(1)} / 250.0 hrs {isQualified ? '✓ MET' : ''}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isQualified ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(100, (entHours / 250) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Separate Books & Bank Account Checklist */}
                <div className="space-y-2 mb-4">
                  <div className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                    Separate Ledger Checklist (Notice 2019-38 §3.01)
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Landmark className="w-3.5 h-3.5 text-emerald-400" />
                        Operating Bank Account:
                      </span>
                      <span className="font-mono text-slate-200">
                        {ent.bankName} (..{ent.bankAccountLast4})
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                        Accounting Ledger:
                      </span>
                      <span className="text-slate-200">{ent.ledgerSoftware}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                      <span className="text-slate-400">Separate Records Verified:</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirmed {ent.separateBooksConfirmedDate}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Constituent Properties */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">
                      Constituent Properties ({entProps.length}):
                    </span>
                    <button
                      onClick={() => onOpenPropertyModal()}
                      className="text-emerald-400 hover:text-emerald-300 text-[11px] font-semibold"
                    >
                      + Add Property
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {entProps.map((p) => {
                      const propHours = eligibleLogs
                        .filter((l) => l.propertyId === p.id)
                        .reduce((s, c) => s + c.hours, 0);

                      return (
                        <div
                          key={p.id}
                          onClick={() => onOpenPropertyModal(p.id)}
                          className="p-2.5 bg-slate-950/80 border border-slate-800 hover:border-emerald-500/30 rounded-lg flex items-center justify-between text-xs cursor-pointer transition-colors"
                        >
                          <div>
                            <div className="font-semibold text-slate-200">{p.name}</div>
                            <div className="text-[10px] text-slate-400">{p.address}</div>
                          </div>
                          <div className="text-right font-mono">
                            <span className="font-bold text-emerald-400">{propHours.toFixed(1)} hrs</span>
                            <div className="text-[10px] text-slate-500">logged</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {ent.groupingType === 'grouped_portfolio'
                    ? 'Combined enterprise pool'
                    : 'Single property standalone'}
                </span>

                <button
                  onClick={() => handleOpenEdit(ent)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                >
                  <span>Edit Ledger Details</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Enterprise Button */}
      <div className="flex justify-center">
        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-2 transition-all shadow"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>+ Create New Rental Real Estate Enterprise (RREE)</span>
        </button>
      </div>

      {/* Edit/Add Enterprise Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">
                  {editingEnterprise ? 'Edit Enterprise & Separate Books' : 'Create New RREE'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Enterprise Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Austin Residential Portfolio Enterprise"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Grouping</label>
                  <select
                    value={groupingType}
                    onChange={(e) => setGroupingType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="grouped_portfolio">Grouped Portfolio</option>
                    <option value="single_property">Stand-Alone Property</option>
                  </select>
                </div>
              </div>

              {/* Bank segregation */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="text-[11px] font-bold text-emerald-400 uppercase">
                  Separate Bank & Ledger Verification (Mandatory)
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Dedicated Operating Bank Name</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. Chase Business Checking"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1">Account Last 4 Digits</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={bankAccountLast4}
                      onChange={(e) => setBankAccountLast4(e.target.value)}
                      placeholder="4821"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Confirmation Date</label>
                    <input
                      type="date"
                      value={separateBooksConfirmedDate}
                      onChange={(e) => setSeparateBooksConfirmedDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Accounting Software / Ledger ID</label>
                  <input
                    type="text"
                    value={ledgerSoftware}
                    onChange={(e) => setLedgerSoftware(e.target.value)}
                    placeholder="e.g. QuickBooks Online (Entity RREE-01)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                    required
                  />
                </div>
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
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg"
                >
                  Save Enterprise
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
