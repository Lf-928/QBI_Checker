import React from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  BookOpen, 
  DollarSign, 
  Building, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const IneligibleRulesGuide: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-emerald-950/40 border border-emerald-900/40 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Regulatory Compliance Constitution
            </div>
            <h2 className="text-xl font-bold text-white">
              IRS Notice 2019-38 & IRC § 199A Safe Harbor Guide
            </h2>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
          Internal Revenue Code Section 199A permits eligible real estate investors to deduct up to <strong>20% of net rental income</strong>. To remove audit ambiguity over whether rental activities qualify as a trade or business under § 162, the IRS issued <strong>Notice 2019-38</strong> establishing an objective 250-hour Safe Harbor.
        </p>
      </div>

      {/* Comparison Grid: What Counts vs What Is Strictly Barred */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Approved Rental Services */}
        <div className="bg-slate-900 border border-emerald-900/60 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">IRS-Approved Rental Services (§3.02(1))</h3>
              <div className="text-xs text-emerald-400 font-medium">Counts toward the 250-hour standard</div>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
              <div className="font-bold text-slate-100 mb-0.5">1. Daily Operation, Maintenance & Repairs</div>
              <p className="text-slate-400 leading-relaxed">
                Plumbing, heating/cooling filters, electrical repairs, painting, cleaning turnovers, landscaping, snow removal, routine appliance maintenance.
              </p>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
              <div className="font-bold text-slate-100 mb-0.5">2. Advertising & Negotiating Leases</div>
              <p className="text-slate-400 leading-relaxed">
                Creating rental listings, photographing units, conducting showings and virtual tours, negotiating lease clauses, drafting extensions and addenda.
              </p>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
              <div className="font-bold text-slate-100 mb-0.5">3. Verifying Tenant Applications</div>
              <p className="text-slate-400 leading-relaxed">
                Running credit reports, criminal background screenings, calling previous landlords, verifying W-2 paystubs and employment references.
              </p>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
              <div className="font-bold text-slate-100 mb-0.5">4. Collecting Rent & Processing Payments</div>
              <p className="text-slate-400 leading-relaxed">
                Collecting rents, managing payment portals, bank deposits, tracking security deposits, distributing formal legal notices for late rent.
              </p>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
              <div className="font-bold text-slate-100 mb-0.5">5. Purchasing Materials & Supplies</div>
              <p className="text-slate-400 leading-relaxed">
                Procuring repair hardware, paint, tools, smoke alarms, locksets, and materials consumed directly in operations.
              </p>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
              <div className="font-bold text-slate-100 mb-0.5">6. Supervising Employees & 1099 Contractors</div>
              <p className="text-slate-400 leading-relaxed">
                Managing independent contractors (electricians, roofers, HVAC techs) or overseeing licensed third-party property managers.
              </p>
            </div>
          </div>
        </div>

        {/* Ineligible Tasks */}
        <div className="bg-slate-900 border border-amber-900/60 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Ineligible Tasks Barred by IRS (§3.02(2))</h3>
              <div className="text-xs text-amber-400 font-medium">Explicitly barred from the 250-hour count</div>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
              <div className="font-bold text-amber-300 mb-0.5">1. Travel & Commute Time</div>
              <p className="text-slate-400 leading-relaxed">
                Driving or traveling to and from the rental property. The IRS strictly excludes travel hours from the 250-hour threshold.
              </p>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
              <div className="font-bold text-amber-300 mb-0.5">2. Financial Review & Investment Analysis</div>
              <p className="text-slate-400 leading-relaxed">
                Reviewing quarterly financials, studying profit & loss spreadsheets, monitoring stock markets, or analyzing overall investment performance.
              </p>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
              <div className="font-bold text-amber-300 mb-0.5">3. Planning Long-Term Capital Improvements</div>
              <p className="text-slate-400 leading-relaxed">
                Planning additions, whole-building structural re-roofing, major architectural renovations that are capitalized and depreciated under IRC § 263.
              </p>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
              <div className="font-bold text-amber-300 mb-0.5">4. Procuring Financing & Mortgage Refinance</div>
              <p className="text-slate-400 leading-relaxed">
                Meeting mortgage brokers, applying for loans, preparing refinancing packets, or coordinating bank property appraisals.
              </p>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
              <div className="font-bold text-amber-300 mb-0.5">5. Acquisition & Disposition Activities</div>
              <p className="text-slate-400 leading-relaxed">
                Searching for new properties to buy, underwriting potential acquisitions, or negotiating the sale of real estate.
              </p>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
              <div className="font-bold text-amber-300 mb-0.5">6. Personal & Vacation Usage</div>
              <p className="text-slate-400 leading-relaxed">
                Any days spent staying at the property personally. Vacation rentals with &gt; 14 personal use days are completely excluded from Safe Harbor.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* The 4 Pillars of Bulletproof IRS Audit Defense */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>The Four Mandatory Pillars of Notice 2019-38 Compliance</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
            <div className="text-emerald-400 font-bold text-sm">Pillar 1</div>
            <div className="font-semibold text-white">Separate Books & Accounts</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Separate bank accounts and dedicated ledgers must be maintained for each Rental Real Estate Enterprise. Commingling funds destroys safe harbor eligibility.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
            <div className="text-emerald-400 font-bold text-sm">Pillar 2</div>
            <div className="font-semibold text-white">250 Contemporaneous Hours</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              At least 250 hours of qualified services logged during the tax year. Hours can be performed by the owner, employees, or 1099 independent contractors.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
            <div className="text-emerald-400 font-bold text-sm">Pillar 3</div>
            <div className="font-semibold text-white">Contemporaneous Logs</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Logs must record the exact date, hours, task description, and performer. Post-hoc estimations reconstructed during an audit are routinely rejected by Tax Court.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
            <div className="text-emerald-400 font-bold text-sm">Pillar 4</div>
            <div className="font-semibold text-white">Signed Form 1040 Statement</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              A formal signed statement under penalties of perjury must be attached to the timely filed tax return, declaring that all Safe Harbor requirements are met.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
