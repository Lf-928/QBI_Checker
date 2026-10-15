import React, { useState } from 'react';
import { Zap, Clock, Check, Plus, Sparkles, Building, ArrowRight } from 'lucide-react';
import { ApprovedRentalCategory, Enterprise, Property, TimeLogEntry } from '../types';

interface QuickLogBarProps {
  enterprises: Enterprise[];
  properties: Property[];
  onQuickLog: (entry: Omit<TimeLogEntry, 'id' | 'createdAt'>) => void;
  onOpenFullModal: () => void;
}

interface QuickPreset {
  id: string;
  title: string;
  category: ApprovedRentalCategory;
  defaultHours: number;
  description: string;
  icon: string;
}

const QUICK_PRESETS: QuickPreset[] = [
  {
    id: 'p1',
    title: 'Emergency Plumbing / Sink Repair',
    category: 'Daily Operation, Maintenance & Repairs',
    defaultHours: 1.5,
    description: 'Diagnosed and replaced leaking sink P-trap and shutoff valve; tested pressure seals.',
    icon: '🔧',
  },
  {
    id: 'p2',
    title: 'HVAC Filter & Seasonal Check',
    category: 'Daily Operation, Maintenance & Repairs',
    defaultHours: 2.0,
    description: 'Replaced forced-air furnace filters and inspected thermostat cycling across units.',
    icon: '❄️',
  },
  {
    id: 'p3',
    title: 'Hardware & Supplies Trip',
    category: 'Purchasing Materials & Supplies',
    defaultHours: 1.5,
    description: 'Purchased replacement smoke alarms, weatherstripping, and repair fixtures at Home Depot.',
    icon: '🛒',
  },
  {
    id: 'p4',
    title: 'Tenant Screening & Verification',
    category: 'Verifying Tenant Applications & Screening',
    defaultHours: 1.0,
    description: 'Reviewed credit report, verified W-2 paystubs, and conducted prior landlord reference check.',
    icon: '🔍',
  },
  {
    id: 'p5',
    title: 'Lease Renewal & Walkthrough',
    category: 'Advertising & Negotiating Leases',
    defaultHours: 1.5,
    description: 'Conducted routine property inspection and met with tenant regarding 12-month lease renewal.',
    icon: '📝',
  },
  {
    id: 'p6',
    title: 'Rent Reconcile & Bank Deposit',
    category: 'Collecting Rent & Processing Payments',
    defaultHours: 1.0,
    description: 'Reconciled monthly rent payments into dedicated operating bank account; updated ledger.',
    icon: '💵',
  },
];

export const QuickLogBar: React.FC<QuickLogBarProps> = ({
  enterprises,
  properties,
  onQuickLog,
  onOpenFullModal,
}) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(
    properties[0]?.id || ''
  );
  const [justLoggedTitle, setJustLoggedTitle] = useState<string | null>(null);

  const selectedProperty = properties.find((p) => p.id === selectedPropertyId);
  const selectedEnterprise = enterprises.find(
    (e) => e.id === selectedProperty?.enterpriseId
  ) || enterprises[0];

  const handleApplyPreset = (preset: QuickPreset) => {
    if (!selectedProperty || !selectedEnterprise) {
      alert('Please configure at least one property and enterprise first.');
      return;
    }

    onQuickLog({
      date: new Date().toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '11:30',
      hours: preset.defaultHours,
      propertyId: selectedProperty.id,
      enterpriseId: selectedEnterprise.id,
      category: preset.category,
      isEligible: true,
      description: preset.description,
      performedBy: 'Alexandre Pinheiro',
      performerRole: 'Owner / Investor',
      notes: 'Quick-logged on site via 1-tap mobile shortcut.',
    });

    setJustLoggedTitle(preset.title);
    setTimeout(() => {
      setJustLoggedTitle(null);
    }, 3000);
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-850 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Owner 10-Second Quick-Log</h3>
              <span className="text-[10px] uppercase font-semibold tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                Zero Form-Fatigue
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Finishing work on-site? One tap records contemporaneous IRS Notice 2019-38 compliant hours.
            </p>
          </div>
        </div>

        {/* Target Property Quick Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 whitespace-nowrap hidden md:inline">
            Active Property:
          </span>
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500 font-medium"
          >
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.propertyType === 'residential' ? 'Res' : 'Comm'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Confirmation Toast if Just Logged */}
      {justLoggedTitle && (
        <div className="mb-3 p-2.5 bg-emerald-950/80 border border-emerald-500/40 rounded-xl flex items-center justify-between text-xs text-emerald-200 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>
              Logged <strong>{justLoggedTitle}</strong> to {selectedProperty?.name}! (+Hours added to Safe Harbor meter).
            </span>
          </div>
          <span className="font-mono text-emerald-400 text-[11px]">Contemporaneous Record Saved</span>
        </div>
      )}

      {/* Preset Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {QUICK_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handleApplyPreset(preset)}
            className="group relative bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-3 text-left transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-base mb-1.5">
                <span>{preset.icon}</span>
                <span className="text-[10px] font-mono font-bold bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded border border-slate-700 group-hover:bg-emerald-950 group-hover:border-emerald-700 transition-colors">
                  +{preset.defaultHours}h
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300 transition-colors line-clamp-1">
                {preset.title}
              </div>
              <div className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                {preset.description}
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
              <span className="text-emerald-400/80 group-hover:text-emerald-400 font-medium">1-Tap Log</span>
              <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-emerald-400 transition-colors" />
            </div>
          </button>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Pre-loaded with IRS Notice 2019-38 compliant contemporaneous task descriptions.</span>
        </span>
        <button
          onClick={onOpenFullModal}
          className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
        >
          <span>Open Custom Logger</span>
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
