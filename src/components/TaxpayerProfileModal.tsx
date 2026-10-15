import React, { useState } from 'react';
import { 
  X, 
  User, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Users, 
  DollarSign, 
  Plus, 
  Trash2, 
  Mail,
  Building
} from 'lucide-react';
import { CoOwnerProfile, TaxpayerProfile } from '../types';

interface TaxpayerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  taxpayer: TaxpayerProfile;
  onSaveTaxpayer: (taxpayer: TaxpayerProfile) => void;
}

export const TaxpayerProfileModal: React.FC<TaxpayerProfileModalProps> = ({
  isOpen,
  onClose,
  taxpayer,
  onSaveTaxpayer,
}) => {
  const [taxpayerName, setTaxpayerName] = useState(taxpayer.taxpayerName);
  const [entityName, setEntityName] = useState(taxpayer.entityName || '');
  const [ssnOrEin, setSsnOrEin] = useState(taxpayer.ssnOrEin);
  const [filingStatus, setFilingStatus] = useState(taxpayer.filingStatus);
  const [contactEmail, setContactEmail] = useState(taxpayer.contactEmail);
  const [cpaName, setCpaName] = useState(taxpayer.cpaName || '');
  const [lockGroupingForTaxYear, setLockGroupingForTaxYear] = useState(taxpayer.lockGroupingForTaxYear);
  const [estimatedAnnualNetIncome, setEstimatedAnnualNetIncome] = useState(taxpayer.estimatedAnnualNetIncome || 125000);
  const [coOwners, setCoOwners] = useState<CoOwnerProfile[]>(taxpayer.coOwners || []);

  // New co-owner form
  const [newCoOwnerName, setNewCoOwnerName] = useState('');
  const [newCoOwnerRole, setNewCoOwnerRole] = useState<'Co-Owner / Spouse' | 'Partner'>('Co-Owner / Spouse');
  const [isAddingCoOwner, setIsAddingCoOwner] = useState(false);

  if (!isOpen) return null;

  const handleAddCoOwner = () => {
    if (!newCoOwnerName.trim()) return;
    const newOwner: CoOwnerProfile = {
      id: `co-${Date.now()}`,
      name: newCoOwnerName.trim(),
      role: newCoOwnerRole,
      ownershipPercentage: 50,
      email: contactEmail,
      avatarColor: 'bg-indigo-600',
    };
    setCoOwners([...coOwners, newOwner]);
    setNewCoOwnerName('');
    setIsAddingCoOwner(false);
  };

  const handleRemoveCoOwner = (id: string) => {
    if (coOwners.length <= 1) {
      alert('At least one primary owner must be registered.');
      return;
    }
    setCoOwners(coOwners.filter((c) => c.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveTaxpayer({
      ...taxpayer,
      taxpayerName: taxpayerName.trim(),
      entityName: entityName.trim() || undefined,
      ssnOrEin: ssnOrEin.trim(),
      filingStatus,
      contactEmail: contactEmail.trim(),
      cpaName: cpaName.trim() || undefined,
      lockGroupingForTaxYear,
      estimatedAnnualNetIncome: Number(estimatedAnnualNetIncome),
      coOwners,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 my-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Taxpayer & Co-Owner Settings</h3>
              <p className="text-xs text-slate-400">
                IRS Section 199A Form 1040 Entity Registration & Spousal Syncing
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Taxpayer Legal Name</label>
              <input
                type="text"
                value={taxpayerName}
                onChange={(e) => setTaxpayerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Entity Name (Optional)</label>
              <input
                type="text"
                value={entityName}
                onChange={(e) => setEntityName(e.target.value)}
                placeholder="e.g. Pinheiro Realty Holdings LLC"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">TIN / EIN / SSN</label>
              <input
                type="text"
                value={ssnOrEin}
                onChange={(e) => setSsnOrEin(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tax Filing Classification</label>
              <select
                value={filingStatus}
                onChange={(e) => setFilingStatus(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="Entity (LLC / Partnership / S-Corp)">Entity (LLC / Partnership / S-Corp)</option>
                <option value="Married Filing Jointly">Married Filing Jointly</option>
                <option value="Single">Single</option>
                <option value="Married Filing Separately">Married Filing Separately</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email (for Cloud Sync & PDF)</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">CPA / Tax Preparer</label>
              <input
                type="text"
                value={cpaName}
                onChange={(e) => setCpaName(e.target.value)}
                placeholder="e.g. Marcus Vance, CPA"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>

          {/* Estimated Annual Net Income for 20% calculation */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Estimated Total Net Rental Income ($/yr) - Powers the 20% QBI Savings Calculator
            </label>
            <input
              type="number"
              step="1000"
              value={estimatedAnnualNetIncome}
              onChange={(e) => setEstimatedAnnualNetIncome(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono font-bold"
            />
          </div>

          {/* CO-OWNERS / SPOUSAL SYNCING SECTION */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Co-Owners & Spousal Syncing</span>
              </span>
              <button
                type="button"
                onClick={() => setIsAddingCoOwner(!isAddingCoOwner)}
                className="text-emerald-400 hover:text-emerald-300 font-semibold text-[11px]"
              >
                {isAddingCoOwner ? 'Cancel' : '+ Add Co-Owner'}
              </button>
            </div>

            <div className="space-y-1.5">
              {coOwners.map((owner) => (
                <div
                  key={owner.id}
                  className="p-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${owner.avatarColor}`} />
                    <span className="font-semibold text-white">{owner.name}</span>
                    <span className="text-[10px] text-slate-400 font-medium">({owner.role})</span>
                  </div>
                  {coOwners.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCoOwner(owner.id)}
                      className="p-1 text-slate-500 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isAddingCoOwner && (
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Co-Owner / Spouse Name"
                  value={newCoOwnerName}
                  onChange={(e) => setNewCoOwnerName(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={handleAddCoOwner}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg"
                >
                  Save
                </button>
              </div>
            )}
          </div>

          {/* Grouping Lock Toggle */}
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="font-semibold text-slate-200">Lock Grouping Consistency for 2026</div>
                <div className="text-[10px] text-slate-400">
                  Notice 2019-38 consistency requirement prevents accidental mid-year modifications
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={lockGroupingForTaxYear}
              onChange={(e) => setLockGroupingForTaxYear(e.target.checked)}
              className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
