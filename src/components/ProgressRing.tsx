import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  DollarSign, 
  Users, 
  ArrowUpRight, 
  Building, 
  ChevronDown,
  ChevronRight,
  Sparkles,
  Award,
  Bell,
  Lock,
  Calendar,
  Layers,
  Home
} from 'lucide-react';
import { Enterprise, Property, TaxpayerProfile, TimeLogEntry } from '../types';

interface ProgressRingProps {
  timeLogs: TimeLogEntry[];
  enterprises: Enterprise[];
  properties: Property[];
  taxpayer: TaxpayerProfile;
  selectedYear: number;
  onSelectEnterpriseTab: () => void;
  onOpenLogModal: (defaultEnterpriseId?: string) => void;
  onOpenAuditModal: () => void;
  onOpenPropertyDetails: (propertyId?: string) => void;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  timeLogs,
  enterprises,
  properties,
  taxpayer,
  selectedYear,
  onSelectEnterpriseTab,
  onOpenLogModal,
  onOpenAuditModal,
  onOpenPropertyDetails,
}) => {
  const [dashboardTier, setDashboardTier] = useState<'enterprises' | 'properties'>('enterprises');
  const [expandedEnterpriseIds, setExpandedEnterpriseIds] = useState<Record<string, boolean>>({
    'ent-1': true,
    'ent-2': true,
  });

  // Filter for selected year
  const yearLogs = timeLogs.filter((l) => l.date.startsWith(String(selectedYear)));
  const eligibleLogs = yearLogs.filter((l) => l.isEligible);
  const totalEligibleHours = eligibleLogs.reduce((sum, l) => sum + l.hours, 0);

  // Ineligible / Excluded tasks
  const ineligibleLogs = yearLogs.filter((l) => !l.isEligible);
  const totalIneligibleHours = ineligibleLogs.reduce((sum, l) => sum + l.hours, 0);

  // 250-hour calculation
  const targetHours = 250.0;
  const percentage = Math.min(100, (totalEligibleHours / targetHours) * 100);
  const hoursRemaining = Math.max(0, targetHours - totalEligibleHours);
  const isSafeHarborAchieved = totalEligibleHours >= targetHours;

  // Potential QBI 20% deduction calculation
  const totalNetRentalIncome = properties
    .filter((p) => p.isSafeHarborEligible)
    .reduce((sum, p) => sum + (p.estimatedNetRentalIncome || 0), 0) || taxpayer.estimatedAnnualNetIncome || 100000;
  const potentialQbiDeduction = totalNetRentalIncome * 0.20;
  // Estimated federal income tax savings assuming ~28-35% combined marginal bracket:
  const estimatedTaxSavings = potentialQbiDeduction * 0.32;

  // Labor role breakdown
  const ownerHours = eligibleLogs
    .filter((l) => l.performerRole.includes('Owner'))
    .reduce((s, c) => s + c.hours, 0);
  const contractorHours = eligibleLogs
    .filter((l) => l.performerRole.includes('Contractor'))
    .reduce((s, c) => s + c.hours, 0);
  const managerHours = eligibleLogs
    .filter((l) => l.performerRole.includes('Manager'))
    .reduce((s, c) => s + c.hours, 0);
  const employeeHours = eligibleLogs
    .filter((l) => l.performerRole.includes('Employee'))
    .reduce((s, c) => s + c.hours, 0);

  // SVG circular gauge math
  const radius = 86;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  // Proactive Burn-Rate Calculations (Late October -> ~11 weeks remaining until Dec 31)
  const weeksRemaining = 11;
  const weeklyHoursNeeded = hoursRemaining > 0 ? (hoursRemaining / weeksRemaining).toFixed(1) : '0';

  const toggleExpand = (id: string) => {
    setExpandedEnterpriseIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Proactive Burn-Rate Alert Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950/60 border border-indigo-900/40 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-xl mt-0.5 sm:mt-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Proactive Safe Harbor Burn-Rate Alert
              </span>
              <span className="text-xs text-slate-400 font-mono">Tax Year {selectedYear}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 font-medium">
              {isSafeHarborAchieved ? (
                <span className="text-emerald-400">
                  🎉 Outstanding! You have surpassed the 250-hour mark. Your Safe Harbor election is fully substantiated.
                </span>
              ) : (
                <>
                  It is currently October. You are <strong className="text-emerald-400 font-bold">{hoursRemaining.toFixed(1)} hours away</strong> from unlocking an estimated <strong className="text-emerald-400 font-mono">${potentialQbiDeduction.toLocaleString()}</strong> Section 199A QBI deduction.
                  <span className="block text-slate-300 mt-0.5">
                    To hit your 250-hour Safe Harbor goal by December 31, you need to average <strong className="text-amber-400 font-bold">{weeklyHoursNeeded} hours</strong> of qualified rental services per week.
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            onClick={() => onOpenLogModal()}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2"
          >
            <span>+ Log Services Now</span>
          </button>
        </div>
      </div>

      {/* Main KPI Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main 250-Hour Circular Gauge Card */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                  IRS Notice 2019-38
                </span>
                <span className="text-xs text-slate-400 font-mono">Year {selectedYear}</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-2">250-Hour Countdown</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Contemporaneous qualified rental services logged
              </p>
            </div>
            {taxpayer.lockGroupingForTaxYear && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/70" title="Notice 2019-38 consistency rule: Grouping locked for tax year">
                <Lock className="w-3 h-3" />
                Locked 2026
              </span>
            )}
          </div>

          {/* Circular Ring */}
          <div className="my-6 flex flex-col items-center justify-center relative">
            <svg className="w-56 h-56 -rotate-90 transform" viewBox="0 0 200 200">
              {/* Background Track */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="14"
                fill="none"
              />
              {/* Active Progress Gradient */}
              <defs>
                <linearGradient id="meterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <circle
                cx="100"
                cy="100"
                r={radius}
                stroke="url(#meterGradient)"
                strokeWidth="14"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Centered Numbers */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-mono text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                {totalEligibleHours.toFixed(1)}
              </span>
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400 mt-1">
                of 250.0 Hours
              </span>
              <div className="mt-2 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800/90 border border-slate-700 text-xs font-semibold text-emerald-400">
                <span>{percentage.toFixed(1)}%</span>
                <span>{isSafeHarborAchieved ? 'Achieved' : 'Logged'}</span>
              </div>
            </div>
          </div>

          {/* Bottom Pace Bar & Stats */}
          <div className="bg-slate-950/70 rounded-xl p-3.5 border border-slate-800/80 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Pacing Target:</span>
              <span className="font-mono text-white">
                {hoursRemaining > 0 ? `${weeklyHoursNeeded} hrs/wk remaining` : 'Target Exceeded'}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-800/60">
              <span className="text-slate-400">Hours to Unlock Deduction:</span>
              <span className="font-mono font-bold text-emerald-400">
                {hoursRemaining > 0 ? `${hoursRemaining.toFixed(1)} hrs` : '0.0 hrs (Qualified)'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Cards: QBI 20% Value, Labor Breakdown, and Segregation Status */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Estimated 20% Section 199A Tax Savings */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-900/50 rounded-2xl p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                    Estimated Tax Savings Tracker
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    20% Qualified Business Income Deduction
                  </h3>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <div className="font-mono text-2xl font-black text-emerald-400">
                  ${potentialQbiDeduction.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </div>
                <div className="text-xs text-slate-400">
                  ~${estimatedTaxSavings.toLocaleString('en-US', { maximumFractionDigits: 0 })} estimated direct tax cut
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
              <div>
                <span className="text-slate-400">Qualified Net Rental Base: </span>
                <span className="font-mono font-bold text-white">${totalNetRentalIncome.toLocaleString()}</span>
              </div>
              <div className="text-emerald-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>20% IRC § 199A Write-off</span>
              </div>
            </div>
          </div>

          {/* Card 2: Labor Allocation Breakdown (Contractor vs Owner vs Property Manager) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Contemporaneous Labor Allocation</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {eligibleLogs.length} verified logs
              </span>
            </div>

            {/* Distribution Bars */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Investor / Owner Direct Hours</span>
                  <span className="font-mono text-white font-semibold">{ownerHours.toFixed(1)} hrs ({((ownerHours / Math.max(totalEligibleHours, 1)) * 100).toFixed(0)}%)</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${(ownerHours / Math.max(totalEligibleHours, 1)) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Independent Contractors (1099-NEC)</span>
                  <span className="font-mono text-white font-semibold">{contractorHours.toFixed(1)} hrs ({((contractorHours / Math.max(totalEligibleHours, 1)) * 100).toFixed(0)}%)</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full rounded-full transition-all"
                    style={{ width: `${(contractorHours / Math.max(totalEligibleHours, 1)) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Licensed Property Managers</span>
                  <span className="font-mono text-white font-semibold">{managerHours.toFixed(1)} hrs ({((managerHours / Math.max(totalEligibleHours, 1)) * 100).toFixed(0)}%)</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-500 h-full rounded-full transition-all"
                    style={{ width: `${(managerHours / Math.max(totalEligibleHours, 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Ineligible tasks notification */}
            {totalIneligibleHours > 0 ? (
              <div className="mt-4 p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-amber-300">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>{totalIneligibleHours.toFixed(1)} non-qualifying hours</strong> (Travel/Refinance/Capital Planning) segregated per Notice 2019-38 §3.02.
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Two-Tier View: Enterprise Grouping vs Individual Properties */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-400" />
              <span>Rental Real Estate Enterprise (RREE) Architecture</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              The IRS allows grouping similar properties into an enterprise, or treating properties as individual standalone enterprises.
            </p>
          </div>

          {/* Two-Tier Toggle */}
          <div className="flex items-center bg-slate-950 rounded-xl p-1 border border-slate-800">
            <button
              onClick={() => setDashboardTier('enterprises')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                dashboardTier === 'enterprises'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Enterprise View</span>
            </button>
            <button
              onClick={() => setDashboardTier('properties')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                dashboardTier === 'properties'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Individual Property View</span>
            </button>
          </div>
        </div>

        {/* TIER 1: ENTERPRISE VIEW (Aggregated card with expandable accordion) */}
        {dashboardTier === 'enterprises' ? (
          <div className="space-y-4">
            {enterprises.map((ent) => {
              const entProps = properties.filter((p) => ent.propertyIds.includes(p.id));
              const entHours = eligibleLogs
                .filter((l) => l.enterpriseId === ent.id)
                .reduce((s, curr) => s + curr.hours, 0);
              const entPct = Math.min(100, (entHours / targetHours) * 100);
              const isEntQualified = entHours >= targetHours;
              const isExpanded = !!expandedEnterpriseIds[ent.id];

              return (
                <div
                  key={ent.id}
                  className="bg-slate-950/70 border border-slate-800 rounded-xl overflow-hidden transition-all hover:border-slate-700"
                >
                  {/* Top Enterprise Aggregator Header */}
                  <div
                    onClick={() => toggleExpand(ent.id)}
                    className="p-4 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-900/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-slate-800 text-emerald-400 rounded-lg shrink-0 mt-0.5">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {ent.type === 'residential' ? 'Residential Portfolio' : 'Commercial Enterprise'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {ent.groupingType === 'grouped_portfolio' ? '👥 Grouped RREE' : '⏹️ Stand-Alone'}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white mt-1">{ent.name}</h4>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Bank: <strong className="text-slate-300">{ent.bankName}</strong> (..{ent.bankAccountLast4}) • Ledger: {ent.ledgerSoftware}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Hours & Progress */}
                      <div className="text-right min-w-[120px]">
                        <div className="text-xs font-mono font-bold text-white">
                          {entHours.toFixed(1)} / 250.0 hrs
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {isEntQualified ? (
                            <span className="text-emerald-400 font-semibold">Safe Harbor Satisfied</span>
                          ) : (
                            `${(targetHours - entHours).toFixed(1)} hrs needed`
                          )}
                        </div>
                        <div className="w-32 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full rounded-full ${isEntQualified ? 'bg-emerald-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400'}`}
                            style={{ width: `${entPct}%` }}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenLogModal(ent.id);
                        }}
                        className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-semibold rounded-lg border border-emerald-500/30 transition-colors whitespace-nowrap"
                      >
                        + Log
                      </button>
                    </div>
                  </div>

                  {/* Expandable Constituent Properties List */}
                  {isExpanded && (
                    <div className="bg-slate-900/60 border-t border-slate-800/80 px-4 py-3 space-y-2">
                      <div className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider mb-2">
                        Constituent Properties in this Enterprise:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {entProps.map((prop) => {
                          const propHours = eligibleLogs
                            .filter((l) => l.propertyId === prop.id)
                            .reduce((s, curr) => s + curr.hours, 0);

                          return (
                            <div
                              key={prop.id}
                              onClick={() => onOpenPropertyDetails(prop.id)}
                              className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg hover:border-emerald-500/40 cursor-pointer transition-colors flex items-center justify-between"
                            >
                              <div>
                                <div className="text-xs font-bold text-slate-100">{prop.name}</div>
                                <div className="text-[11px] text-slate-400 truncate max-w-[200px]">{prop.address}</div>
                                <div className="text-[10px] text-slate-500 mt-0.5">Lease: {prop.leaseTerms}</div>
                              </div>
                              <div className="text-right">
                                <span className="font-mono text-xs font-bold text-emerald-400">
                                  {propHours.toFixed(1)} hrs
                                </span>
                                <div className="text-[10px] text-slate-400">contributed</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* TIER 2: INDIVIDUAL PROPERTY VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {properties.map((prop) => {
              const propHours = eligibleLogs
                .filter((l) => l.propertyId === prop.id)
                .reduce((s, curr) => s + curr.hours, 0);
              const ent = enterprises.find((e) => e.id === prop.enterpriseId);

              return (
                <div
                  key={prop.id}
                  onClick={() => onOpenPropertyDetails(prop.id)}
                  className="p-4 bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl cursor-pointer transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {prop.propertyType} • {prop.unitsCount} Units
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1">{prop.name}</h4>
                        <div className="text-xs text-slate-400">{prop.address}</div>
                      </div>
                      <div className="text-right font-mono">
                        <div className="text-sm font-bold text-emerald-400">{propHours.toFixed(1)} hrs</div>
                        <span className="text-[10px] text-slate-400">Contemporaneous</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-xs text-slate-400 space-y-1">
                      <div>
                        <strong>Enterprise: </strong>
                        <span className="text-slate-300">{ent ? ent.name : 'Unassigned'}</span>
                      </div>
                      <div>
                        <strong>Lease Terms: </strong>
                        <span className="text-slate-300">{prop.leaseTerms}</span>
                      </div>
                      <div>
                        <strong>Acquisition Date: </strong>
                        <span className="text-slate-300">{prop.acquisitionDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
                    <span className={prop.isSafeHarborEligible ? 'text-emerald-400' : 'text-amber-400'}>
                      {prop.isSafeHarborEligible ? '✓ Safe Harbor Qualified' : '⚠ Excluded / Non-qualifying'}
                    </span>
                    <span className="text-emerald-400 hover:text-emerald-300 font-medium">Edit Details →</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
