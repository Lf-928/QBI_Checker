import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Square, 
  FileText, 
  Paperclip, 
  ShieldCheck, 
  Sparkles,
  UserCheck,
  Building,
  Upload,
  Camera,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { 
  AllTaskCategory, 
  ApprovedRentalCategory, 
  Enterprise, 
  IneligibleCategory, 
  PerformerRole, 
  Property, 
  TaxpayerProfile, 
  TimeLogEntry 
} from '../types';

interface TimeTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveLog: (entry: Omit<TimeLogEntry, 'id' | 'createdAt'>) => void;
  enterprises: Enterprise[];
  properties: Property[];
  taxpayer: TaxpayerProfile;
  defaultEnterpriseId?: string;
  initialTimerSeconds?: number;
}

const APPROVED_CATEGORIES: { label: ApprovedRentalCategory; iconText: string; desc: string }[] = [
  {
    label: 'Daily Operation, Maintenance & Repairs',
    iconText: '🔧',
    desc: 'HVAC servicing, plumbing, painting, pest control, yard care, routine turnover repairs',
  },
  {
    label: 'Advertising & Negotiating Leases',
    iconText: '📢',
    desc: 'Marketing listings, virtual tours, drafting renewals, lease execution',
  },
  {
    label: 'Verifying Tenant Applications & Screening',
    iconText: '🔍',
    desc: 'Credit checks, criminal background screening, income verification, landlord calls',
  },
  {
    label: 'Collecting Rent & Processing Payments',
    iconText: '💵',
    desc: 'Reconciling ledger, payment portal management, notice distribution, bank deposits',
  },
  {
    label: 'Purchasing Materials & Supplies',
    iconText: '🛒',
    desc: 'Procuring hardware, filters, locks, smoke detectors, repair components',
  },
  {
    label: 'Managing Property Managers & Contractors',
    iconText: '📋',
    desc: 'Contractor bidding, on-site supervision, property manager oversight & inspection',
  },
];

const INELIGIBLE_CATEGORIES: { label: IneligibleCategory; codeRef: string; desc: string }[] = [
  {
    label: 'Travel To / From Property',
    codeRef: 'Notice 2019-38 §3.02(2)',
    desc: 'Commuting or traveling to inspect or work on the rental property is strictly excluded by the IRS.',
  },
  {
    label: 'Reviewing Financial Statements & Investment Reports',
    codeRef: 'Notice 2019-38 §3.02(2)',
    desc: 'Investor-level review, bookkeeping analysis, or reviewing periodic profit & loss statements.',
  },
  {
    label: 'Planning Capital Improvements / Major Renovations',
    codeRef: 'Notice 2019-38 §3.02(2)',
    desc: 'Capitalized projects (e.g., adding an addition or whole-building re-roofing) are excluded.',
  },
  {
    label: 'Procuring Financing & Mortgage Refinance',
    codeRef: 'Notice 2019-38 §3.02(2)',
    desc: 'Securing loans, refinancing debt, or preparing mortgage packages.',
  },
  {
    label: 'Property Acquisition & Disposition Analysis',
    codeRef: 'Notice 2019-38 §3.02(2)',
    desc: 'Analyzing prospective acquisitions or staging for capital sale.',
  },
];

// Smart Real-time Ineligible Keywords Scanner (IRS Guardrail Engine)
const INELIGIBLE_KEYWORD_PATTERNS = [
  {
    regex: /(travel|driving to|commute|transit to|drove to property)/i,
    flaggedCategory: 'Travel To / From Property' as IneligibleCategory,
    reason: 'Travel and driving time to/from rental real estate is explicitly excluded under Notice 2019-38 §3.02(2).',
  },
  {
    regex: /(financial statement|quarterly financials|reconfigured investment|balance sheet|reviewed financials|investor report)/i,
    flaggedCategory: 'Reviewing Financial Statements & Investment Reports' as IneligibleCategory,
    reason: 'Reviewing investment reports and financial statements does not constitute qualified rental services.',
  },
  {
    regex: /(capital improvement|renovation plan|major remodel|new addition|architectural drawings for expansion)/i,
    flaggedCategory: 'Planning Capital Improvements / Major Renovations' as IneligibleCategory,
    reason: 'Planning long-term capital improvements is capitalized under IRC § 263 and excluded from daily safe harbor services.',
  },
  {
    regex: /(refinance|mortgage approval|loan package|procuring loan|bank appraisal)/i,
    flaggedCategory: 'Procuring Financing & Mortgage Refinance' as IneligibleCategory,
    reason: 'Procuring financing or debt refinancing is excluded from 250-hour rental services.',
  },
];

export const TimeTrackerModal: React.FC<TimeTrackerModalProps> = ({
  isOpen,
  onClose,
  onSaveLog,
  enterprises,
  properties,
  taxpayer,
  defaultEnterpriseId,
  initialTimerSeconds = 0,
}) => {
  const [mode, setMode] = useState<'approved' | 'ineligible'>('approved');
  const [selectedCategory, setSelectedCategory] = useState<AllTaskCategory>(
    'Daily Operation, Maintenance & Repairs'
  );
  const [selectedEnterpriseId, setSelectedEnterpriseId] = useState<string>('');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('11:30');
  const [hours, setHours] = useState<number>(2.5);
  const [description, setDescription] = useState<string>('');
  const [performedBy, setPerformedBy] = useState<string>(
    taxpayer.coOwners.find((c) => c.id === taxpayer.activePerformerId)?.name || taxpayer.taxpayerName
  );
  const [performerRole, setPerformerRole] = useState<PerformerRole>('Owner / Investor');
  const [notes, setNotes] = useState<string>('');
  const [receiptName, setReceiptName] = useState<string>('');
  const [receiptDataUrl, setReceiptDataUrl] = useState<string>('');
  const [receiptAmount, setReceiptAmount] = useState<number | ''>('');

  // Live timer inside modal
  const [isLiveTimerActive, setIsLiveTimerActive] = useState<boolean>(false);
  const [liveSeconds, setLiveSeconds] = useState<number>(initialTimerSeconds);

  // IRS Guardrail Alert state
  const [guardrailAlert, setGuardrailAlert] = useState<{
    reason: string;
    flaggedCategory: IneligibleCategory;
  } | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLiveTimerActive) {
      interval = setInterval(() => {
        setLiveSeconds((prev) => {
          const next = prev + 1;
          setHours(parseFloat((next / 3600).toFixed(2)));
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLiveTimerActive]);

  // Set default enterprise & property
  useEffect(() => {
    if (enterprises.length > 0) {
      const initialEnt = defaultEnterpriseId
        ? enterprises.find((e) => e.id === defaultEnterpriseId) || enterprises[0]
        : enterprises[0];
      setSelectedEnterpriseId(initialEnt.id);

      const entProps = properties.filter((p) => initialEnt.propertyIds.includes(p.id));
      if (entProps.length > 0) {
        setSelectedPropertyId(entProps[0].id);
      }
    }
  }, [enterprises, properties, defaultEnterpriseId, isOpen]);

  // Real-time Text Scanner for IRS Ineligible Tasks Guardrail
  const handleDescriptionChange = (text: string) => {
    setDescription(text);

    let foundAlert: { reason: string; flaggedCategory: IneligibleCategory } | null = null;
    for (const pattern of INELIGIBLE_KEYWORD_PATTERNS) {
      if (pattern.regex.test(text)) {
        foundAlert = {
          reason: pattern.reason,
          flaggedCategory: pattern.flaggedCategory,
        };
        break;
      }
    }
    setGuardrailAlert(foundAlert);
  };

  const applyGuardrailSegregation = () => {
    if (guardrailAlert) {
      setMode('ineligible');
      setSelectedCategory(guardrailAlert.flaggedCategory);
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

  const handleSelectCoOwner = (name: string, role: 'Owner / Investor' | 'Co-Owner / Spouse') => {
    setPerformedBy(name);
    setPerformerRole(role);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('The IRS requires a detailed description of the rental service for contemporaneous audit defense.');
      return;
    }
    if (hours <= 0) {
      alert('Please specify valid hours spent (> 0).');
      return;
    }

    const isEligible = mode === 'approved' && !guardrailAlert;

    onSaveLog({
      date,
      startTime,
      endTime,
      hours: Number(hours),
      propertyId: selectedPropertyId,
      enterpriseId: selectedEnterpriseId,
      category: selectedCategory,
      isEligible,
      description: description.trim(),
      performedBy: performedBy.trim(),
      performerRole,
      notes: notes.trim() || undefined,
      receiptName: receiptName || undefined,
      receiptDataUrl: receiptDataUrl || undefined,
      expenseAmountMatched: typeof receiptAmount === 'number' ? receiptAmount : undefined,
    });

    onClose();
  };

  if (!isOpen) return null;

  const currentEnterprise = enterprises.find((e) => e.id === selectedEnterpriseId);
  const eligibleProperties = currentEnterprise
    ? properties.filter((p) => currentEnterprise.propertyIds.includes(p.id))
    : properties;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Log Contemporaneous Rental Service Hours
              </h2>
              <p className="text-xs text-slate-400">
                IRS Notice 2019-38 Contemporaneous Record & Receipt Cross-Referencing
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

        {/* Live Stopwatch Toolbar */}
        <div className="bg-slate-850 px-6 py-3 border-b border-slate-800 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-medium">Contemporaneous Stopwatch:</span>
            <div className="font-mono text-base font-bold text-emerald-400 bg-slate-900 px-3 py-1 rounded-md border border-slate-800">
              {Math.floor(liveSeconds / 3600).toString().padStart(2, '0')}:
              {Math.floor((liveSeconds % 3600) / 60).toString().padStart(2, '0')}:
              {(liveSeconds % 60).toString().padStart(2, '0')}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsLiveTimerActive(!isLiveTimerActive)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isLiveTimerActive
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950'
              }`}
            >
              {isLiveTimerActive ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Pause Timer</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Live Timer</span>
                </>
              )}
            </button>
            {liveSeconds > 0 && (
              <button
                type="button"
                onClick={() => {
                  setIsLiveTimerActive(false);
                  setLiveSeconds(0);
                }}
                className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* CO-OWNER / SPOUSAL QUICK SELECTOR */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>Person Performing Service (Joint / Spousal Syncing)</span>
              <span className="text-[10px] text-slate-400 font-normal">
                Hours pool collectively under Notice 2019-38
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              {taxpayer.coOwners.map((owner) => {
                const isSelected = performedBy === owner.name;
                const roleType = owner.role === 'Co-Owner / Spouse' ? 'Co-Owner / Spouse' : 'Owner / Investor';

                return (
                  <button
                    key={owner.id}
                    type="button"
                    onClick={() => handleSelectCoOwner(owner.name, roleType)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-emerald-950/80 border-emerald-500 text-white ring-1 ring-emerald-500/40'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${owner.avatarColor}`} />
                    <span>{owner.name}</span>
                    <span className="text-[10px] text-slate-400">({owner.role})</span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  setPerformedBy('Dave Miller (Miller HVAC Services)');
                  setPerformerRole('Independent Contractor (1099)');
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  performerRole.includes('Contractor')
                    ? 'bg-cyan-950/80 border-cyan-500 text-white'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span>🔧 Contractor (1099-NEC)</span>
              </button>
            </div>
          </div>

          {/* Category Mode Switcher: Approved vs Ineligible */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Service Classification & Safe Harbor Filter
              </label>
              <span className="text-xs font-medium">
                {mode === 'approved' ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Counts toward 250 Hours
                  </span>
                ) : (
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Excluded from 250 Hours
                  </span>
                )}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setMode('approved');
                  setSelectedCategory('Daily Operation, Maintenance & Repairs');
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  mode === 'approved'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>IRS-Approved Services</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('ineligible');
                  setSelectedCategory('Travel To / From Property');
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  mode === 'ineligible'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Ineligible Task Quarantining</span>
              </button>
            </div>
          </div>

          {/* Quick Select Buttons */}
          {mode === 'approved' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {APPROVED_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.label;
                return (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => setSelectedCategory(cat.label)}
                    className={`p-2.5 text-left rounded-xl border transition-all text-xs flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-emerald-950/60 border-emerald-500 text-white ring-1 ring-emerald-500/50'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-base">{cat.iconText}</span>
                    <div>
                      <div className="font-semibold text-slate-100">{cat.label}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">{cat.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {INELIGIBLE_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.label;
                return (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => setSelectedCategory(cat.label)}
                    className={`p-2.5 text-left rounded-xl border transition-all text-xs ${
                      isSelected
                        ? 'bg-amber-950/60 border-amber-500 text-white ring-1 ring-amber-500/50'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-amber-300">{cat.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{cat.desc}</div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Enterprise & Property Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target Enterprise (RREE)
              </label>
              <select
                value={selectedEnterpriseId}
                onChange={(e) => {
                  setSelectedEnterpriseId(e.target.value);
                  const ent = enterprises.find((item) => item.id === e.target.value);
                  if (ent) {
                    const entProps = properties.filter((p) => ent.propertyIds.includes(p.id));
                    if (entProps.length > 0) setSelectedPropertyId(entProps[0].id);
                  }
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              >
                {enterprises.map((ent) => (
                  <option key={ent.id} value={ent.id}>
                    {ent.name} ({ent.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Sub-Property Selector (Keeps Audit Trail Bulletproof)
              </label>
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              >
                {eligibleProperties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.address})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date, Hours, Times */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Hours Spent</label>
              <input
                type="number"
                step="0.25"
                min="0.25"
                max="24"
                value={hours}
                onChange={(e) => setHours(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          {/* Description with Smart Real-Time IRS Guardrail Scanner */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Detailed Contemporaneous Task Description
              </label>
              <span className="text-[11px] text-slate-400">
                Real-time IRS guardrail scanner active
              </span>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="Describe the exact task performed (e.g., Repaired leaking shutoff valve in Unit 2 kitchen, replaced supply line, and tested pressure)."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
              required
            />

            {/* Smart Task-Validation Engine (The "IRS Guardrail") Warning Badge */}
            {guardrailAlert && (
              <div className="mt-2 p-3 bg-amber-950/70 border border-amber-500/50 rounded-xl flex items-start justify-between gap-3 text-xs text-amber-200 animate-fadeIn">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-300">⚠️ IRS Guardrail Alert: </strong>
                    {guardrailAlert.reason}
                    <div className="text-[11px] text-amber-300/80 mt-0.5">
                      This entry will be safely retained in your management ledger, but segregated from your 250-hour Safe Harbor meter.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={applyGuardrailSegregation}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded text-[11px] shrink-0"
                >
                  Segregate Task
                </button>
              </div>
            )}
          </div>

          {/* AUTOMATED RECEIPTS & EXPENSE MATCHING (High-Value Feature) */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">
                  Cross-Reference Store Receipt & Financial Match
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">
                Audit Defense: Corroborates Time with Transaction
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Purchase Amount ($ USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 48.20"
                  value={receiptAmount}
                  onChange={(e) => setReceiptAmount(e.target.value ? parseFloat(e.target.value) : '')}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Receipt File / Photo
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex-1 cursor-pointer px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 flex items-center justify-center gap-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="truncate">{receiptName ? receiptName : 'Snap / Upload Receipt'}</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {receiptName && (
                    <button
                      type="button"
                      onClick={() => {
                        setReceiptName('');
                        setReceiptDataUrl('');
                      }}
                      className="p-1.5 text-slate-500 hover:text-red-400"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className={`px-5 py-2 text-xs font-bold rounded-lg shadow-lg flex items-center gap-2 transition-all ${
                mode === 'approved' && !guardrailAlert
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950'
                  : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {mode === 'approved' && !guardrailAlert
                  ? 'Record Qualified Rental Hours'
                  : 'Save Segregated Management Record'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
