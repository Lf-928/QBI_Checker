import React, { useState, useEffect } from 'react';
import { 
  X, 
  Building, 
  Home, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  Calendar, 
  FileText, 
  DollarSign,
  ShieldCheck,
  Info
} from 'lucide-react';
import { Enterprise, Property, PropertyType } from '../types';

interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProperty: (property: Property) => void;
  onDeleteProperty?: (id: string) => void;
  enterprises: Enterprise[];
  existingProperty?: Property | null;
  onCreateEnterprise: (name: string, type: 'residential' | 'commercial') => Enterprise;
}

export const PropertyModal: React.FC<PropertyModalProps> = ({
  isOpen,
  onClose,
  onSaveProperty,
  onDeleteProperty,
  enterprises,
  existingProperty,
  onCreateEnterprise,
}) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('residential');
  const [unitsCount, setUnitsCount] = useState(1);
  const [acquisitionDate, setAcquisitionDate] = useState('2024-01-15');
  const [leaseTerms, setLeaseTerms] = useState('12-Month Standard Residential Lease');
  const [groupingChoice, setGroupingChoice] = useState<'standalone' | 'grouped'>('grouped');
  const [selectedEnterpriseId, setSelectedEnterpriseId] = useState('');
  const [newEnterpriseName, setNewEnterpriseName] = useState('');
  const [isCreatingNewEnt, setIsCreatingNewEnt] = useState(false);

  // Safe Harbor Exclusion Checklist
  const [personalUseDays, setPersonalUseDays] = useState(0);
  const [totalDaysRented, setTotalDaysRented] = useState(365);
  const [isTripleNetLease, setIsTripleNetLease] = useState(false);
  const [usedByTaxpayer, setUsedByTaxpayer] = useState(false);
  const [estimatedNetRentalIncome, setEstimatedNetRentalIncome] = useState(36000);

  useEffect(() => {
    if (existingProperty) {
      setName(existingProperty.name);
      setAddress(existingProperty.address);
      setPropertyType(existingProperty.propertyType);
      setUnitsCount(existingProperty.unitsCount);
      setAcquisitionDate(existingProperty.acquisitionDate || '2024-01-15');
      setLeaseTerms(existingProperty.leaseTerms || '12-Month Standard Lease');
      setSelectedEnterpriseId(existingProperty.enterpriseId || '');
      setPersonalUseDays(existingProperty.personalUseDays);
      setTotalDaysRented(existingProperty.totalDaysRented);
      setIsTripleNetLease(existingProperty.isTripleNetLease);
      setUsedByTaxpayer(existingProperty.usedByTaxpayer);
      setEstimatedNetRentalIncome(existingProperty.estimatedNetRentalIncome || 36000);

      const ent = enterprises.find((e) => e.id === existingProperty.enterpriseId);
      setGroupingChoice(ent?.groupingType === 'single_property' ? 'standalone' : 'grouped');
    } else {
      setName('');
      setAddress('');
      setPropertyType('residential');
      setUnitsCount(1);
      setAcquisitionDate(new Date().toISOString().split('T')[0]);
      setLeaseTerms('12-Month Standard Residential');
      setPersonalUseDays(0);
      setTotalDaysRented(365);
      setIsTripleNetLease(false);
      setUsedByTaxpayer(false);
      setEstimatedNetRentalIncome(35000);
      setIsCreatingNewEnt(false);

      // Default to first matching enterprise
      const firstMatching = enterprises.find((e) => e.type === 'residential');
      setSelectedEnterpriseId(firstMatching?.id || '');
    }
  }, [existingProperty, isOpen, enterprises]);

  // Compute Safe Harbor exclusions
  const exceedsPersonalUse = personalUseDays > 14 && personalUseDays > (totalDaysRented * 0.10);
  const isExcluded = isTripleNetLease || exceedsPersonalUse || usedByTaxpayer;

  // Filter enterprises matching property type (Notice 2019-38 prohibits mixing!)
  const compatibleEnterprises = enterprises.filter((e) => e.type === propertyType);
  const incompatibleEnterprises = enterprises.filter((e) => e.type !== propertyType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !address.trim()) {
      alert('Please fill out the Property Name and Address.');
      return;
    }

    let finalEnterpriseId = selectedEnterpriseId;

    if (groupingChoice === 'standalone') {
      // Find or create standalone enterprise
      const existingStandAlone = enterprises.find(
        (ent) => ent.groupingType === 'single_property' && ent.name.includes(name)
      );
      if (existingStandAlone) {
        finalEnterpriseId = existingStandAlone.id;
      } else {
        const created = onCreateEnterprise(`${name} (Stand-Alone Enterprise)`, propertyType);
        finalEnterpriseId = created.id;
      }
    } else if (isCreatingNewEnt && newEnterpriseName.trim()) {
      const created = onCreateEnterprise(newEnterpriseName.trim(), propertyType);
      finalEnterpriseId = created.id;
    }

    const propId = existingProperty?.id || `prop-${Date.now()}`;

    let ineligibilityReason: string | undefined = undefined;
    if (isTripleNetLease) {
      ineligibilityReason = 'Excluded under Notice 2019-38 §3.05: Triple-Net (NNN) leases where tenant pays taxes, insurance, and maintenance are barred from Safe Harbor.';
    } else if (exceedsPersonalUse) {
      ineligibilityReason = `Excluded under Notice 2019-38 §3.05: Personal use days (${personalUseDays}) exceed 14 days and 10% of days rented. Treated as personal residence under § 280A.`;
    }

    onSaveProperty({
      id: propId,
      name: name.trim(),
      address: address.trim(),
      propertyType,
      unitsCount: Number(unitsCount),
      acquisitionDate,
      leaseTerms: leaseTerms.trim(),
      enterpriseId: finalEnterpriseId,
      personalUseDays: Number(personalUseDays),
      totalDaysRented: Number(totalDaysRented),
      isTripleNetLease,
      usedByTaxpayer,
      isSafeHarborEligible: !isExcluded,
      ineligibilityReason,
      estimatedNetRentalIncome: Number(estimatedNetRentalIncome),
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {existingProperty ? 'Edit Property Details' : 'Add Rental Property to Portfolio'}
              </h2>
              <p className="text-xs text-slate-400">
                Configure Notice 2019-38 enterprise grouping and safe harbor qualifications
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* STEP A: Property Type Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Step A: Property Classification
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPropertyType('residential')}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                  propertyType === 'residential'
                    ? 'bg-emerald-950/60 border-emerald-500 text-white shadow ring-1 ring-emerald-500/50'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="p-2 bg-slate-800 rounded-lg text-emerald-400">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold">Residential Property</div>
                  <div className="text-[11px] text-slate-400">Single-family, duplex, multi-family</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPropertyType('commercial')}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                  propertyType === 'commercial'
                    ? 'bg-emerald-950/60 border-emerald-500 text-white shadow ring-1 ring-emerald-500/50'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="p-2 bg-slate-800 rounded-lg text-emerald-400">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold">Commercial Property</div>
                  <div className="text-[11px] text-slate-400">Office, retail suites, light industrial</div>
                </div>
              </button>
            </div>
          </div>

          {/* Core Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Property Nickname / Building Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Pinecrest Duplex (Units A & B)"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Number of Units
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={unitsCount}
                onChange={(e) => setUnitsCount(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Physical Street Address (Required for Audit Defense)
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 742 Pinecrest Blvd, Portland, OR 97201"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Acquisition Date
              </label>
              <input
                type="date"
                value={acquisitionDate}
                onChange={(e) => setAcquisitionDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Lease Terms Structure
              </label>
              <input
                type="text"
                value={leaseTerms}
                onChange={(e) => setLeaseTerms(e.target.value)}
                placeholder="e.g. 12-Month Standard, Month-to-Month, Modified Gross"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* STEP B: Grouping Choice */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Step B: IRS Safe Harbor Grouping Choice
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGroupingChoice('standalone')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  groupingChoice === 'standalone'
                    ? 'bg-emerald-950/60 border-emerald-500 text-white shadow ring-1 ring-emerald-500/50'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span>⏹️ Stand-Alone Property</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Track this property on its own. It must hit 250 hours independently.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setGroupingChoice('grouped')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  groupingChoice === 'grouped'
                    ? 'bg-emerald-950/60 border-emerald-500 text-white shadow ring-1 ring-emerald-500/50'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span>👥 Group into an Enterprise</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Combine with other {propertyType} properties. Combined hours pool toward 250+.
                </p>
              </button>
            </div>

            {/* Step C: Enterprise Selector if Grouped */}
            {groupingChoice === 'grouped' && (
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-3 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    Step C: Select or Create {propertyType === 'residential' ? 'Residential' : 'Commercial'} Enterprise
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCreatingNewEnt(!isCreatingNewEnt)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    {isCreatingNewEnt ? 'Choose Existing' : '+ Create New Enterprise'}
                  </button>
                </div>

                {!isCreatingNewEnt ? (
                  <div>
                    <select
                      value={selectedEnterpriseId}
                      onChange={(e) => setSelectedEnterpriseId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      {compatibleEnterprises.map((ent) => (
                        <option key={ent.id} value={ent.id}>
                          {ent.name} (Bank: {ent.bankName})
                        </option>
                      ))}
                    </select>

                    {/* IRS Guardrail Tip for Incompatible Enterprises */}
                    {incompatibleEnterprises.length > 0 && (
                      <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>
                          IRS Rule Notice 2019-38 §3.03: Commercial and residential properties cannot be combined in the same enterprise.
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      placeholder="e.g. Portland Residential Portfolio Enterprise"
                      value={newEnterpriseName}
                      onChange={(e) => setNewEnterpriseName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* STEP D: Safe Harbor Exclusions Check (Notice 2019-38 §3.05) */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Safe Harbor Exclusions Verification
              </label>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isExcluded ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'}`}>
                {isExcluded ? '⚠ Disqualified from Safe Harbor' : '✓ Safe Harbor Eligible'}
              </span>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-3">
              {/* Triple Net Check */}
              <label className="flex items-start gap-2.5 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={isTripleNetLease}
                  onChange={(e) => setIsTripleNetLease(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 mt-0.5"
                />
                <div>
                  <span className="font-semibold text-slate-200">
                    Triple-Net (NNN) Lease (Tenant pays taxes, insurance, & maintenance)
                  </span>
                  <div className="text-[11px] text-slate-400">
                    Notice 2019-38 explicitly bars NNN leases from the 250-hour Safe Harbor.
                  </div>
                </div>
              </label>

              {/* Personal Use Days Check */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Personal Use Days (IRC § 280A)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="365"
                    value={personalUseDays}
                    onChange={(e) => setPersonalUseDays(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                  <div className="text-[10px] text-slate-500 mt-0.5">Must not exceed 14 days</div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Days Rented to Tenants
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={totalDaysRented}
                    onChange={(e) => setTotalDaysRented(parseInt(e.target.value) || 365)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                  <div className="text-[10px] text-slate-500 mt-0.5">At fair market rental rate</div>
                </div>
              </div>

              {/* Estimated net rental income */}
              <div className="pt-2 border-t border-slate-800/80">
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Estimated Net Rental Income ($/yr) - Powers the 20% QBI Savings Calculator
                </label>
                <input
                  type="number"
                  step="500"
                  value={estimatedNetRentalIncome}
                  onChange={(e) => setEstimatedNetRentalIncome(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            {existingProperty && onDeleteProperty ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Remove property "${name}"? Logs for this property will be retained.`)) {
                    onDeleteProperty(existingProperty.id);
                    onClose();
                  }
                }}
                className="text-xs text-red-400 hover:text-red-300 font-semibold"
              >
                Delete Property
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-950 transition-all flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Save Property Settings</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
