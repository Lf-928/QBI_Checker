import React, { useState, useEffect } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  ProgressRing 
} from './components/ProgressRing';
import { 
  QuickLogBar 
} from './components/QuickLogBar';
import { 
  GeoFenceSimulator 
} from './components/GeoFenceSimulator';
import { 
  TimeLogTable 
} from './components/TimeLogTable';
import { 
  TimeTrackerModal 
} from './components/TimeTrackerModal';
import { 
  EnterpriseManager 
} from './components/EnterpriseManager';
import { 
  ExpenseTracker 
} from './components/ExpenseTracker';
import { 
  PropertyModal 
} from './components/PropertyModal';
import { 
  AuditReportModal 
} from './components/AuditReportModal';
import { 
  CloudBackupModal 
} from './components/CloudBackupModal';
import { 
  TaxpayerProfileModal 
} from './components/TaxpayerProfileModal';
import { 
  IneligibleRulesGuide 
} from './components/IneligibleRulesGuide';
import { 
  Enterprise, 
  Expense, 
  Property, 
  TaxpayerProfile, 
  TimeLogEntry 
} from './types';
import { 
  loadCloudConfig, 
  loadEnterprises, 
  loadExpenses, 
  loadProperties, 
  loadTaxpayer, 
  loadTimeLogs, 
  resetToDemoData, 
  saveCloudConfig, 
  saveEnterprises, 
  saveExpenses, 
  saveProperties, 
  saveTaxpayer, 
  saveTimeLogs, 
  CloudBackupConfig 
} from './utils/storage';
import { exportExpensesCSV, exportTimeLogsCSV } from './utils/csvExporter';
import { ShieldCheck, Plus, Sparkles, Building, Lock } from 'lucide-react';

export default function App() {
  const [taxpayer, setTaxpayer] = useState<TaxpayerProfile>(loadTaxpayer);
  const [enterprises, setEnterprises] = useState<Enterprise[]>(loadEnterprises);
  const [properties, setProperties] = useState<Property[]>(loadProperties);
  const [timeLogs, setTimeLogs] = useState<TimeLogEntry[]>(loadTimeLogs);
  const [expenses, setExpenses] = useState<Expense[]>(loadExpenses);
  const [cloudConfig, setCloudConfig] = useState<CloudBackupConfig>(loadCloudConfig);

  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'timelogs' | 'enterprises' | 'expenses' | 'audit' | 'guidelines'>('dashboard');

  // Modals state
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logModalEnterpriseId, setLogModalEnterpriseId] = useState<string | undefined>(undefined);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState<string | undefined>(undefined);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [isTaxpayerModalOpen, setIsTaxpayerModalOpen] = useState(false);

  // Global Quick Stopwatch Timer
  const [isGlobalTimerRunning, setIsGlobalTimerRunning] = useState(false);
  const [globalTimerSeconds, setGlobalTimerSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGlobalTimerRunning) {
      interval = setInterval(() => {
        setGlobalTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGlobalTimerRunning]);

  const handleToggleGlobalTimer = () => {
    if (isGlobalTimerRunning) {
      // Pause and open log modal with recorded time
      setIsGlobalTimerRunning(false);
      setIsLogModalOpen(true);
    } else {
      setIsGlobalTimerRunning(true);
    }
  };

  // Sync state to local storage
  const handleSaveTaxpayer = (updated: TaxpayerProfile) => {
    setTaxpayer(updated);
    saveTaxpayer(updated);
  };

  const handleSaveEnterprise = (updated: Enterprise) => {
    const next = enterprises.some((e) => e.id === updated.id)
      ? enterprises.map((e) => (e.id === updated.id ? updated : e))
      : [...enterprises, updated];
    setEnterprises(next);
    saveEnterprises(next);
  };

  const handleDeleteEnterprise = (id: string) => {
    const next = enterprises.filter((e) => e.id !== id);
    setEnterprises(next);
    saveEnterprises(next);
  };

  const handleCreateEnterpriseInline = (name: string, type: 'residential' | 'commercial'): Enterprise => {
    const newEnt: Enterprise = {
      id: `ent-${Date.now()}`,
      name,
      type,
      groupingType: 'grouped_portfolio',
      propertyIds: [],
      taxYear: selectedYear,
      separateBankVerified: true,
      bankName: 'Chase Commercial Operating',
      bankAccountLast4: '7721',
      ledgerSoftware: 'QuickBooks Online',
      separateBooksConfirmedDate: new Date().toISOString().split('T')[0],
    };
    const next = [...enterprises, newEnt];
    setEnterprises(next);
    saveEnterprises(next);
    return newEnt;
  };

  const handleSaveProperty = (prop: Property) => {
    const exists = properties.some((p) => p.id === prop.id);
    const nextProps = exists
      ? properties.map((p) => (p.id === prop.id ? prop : p))
      : [...properties, prop];
    setProperties(nextProps);
    saveProperties(nextProps);

    // Update enterprise propertyIds
    const nextEnts = enterprises.map((ent) => {
      const hadProp = ent.propertyIds.includes(prop.id);
      const shouldHaveProp = ent.id === prop.enterpriseId;
      if (shouldHaveProp && !hadProp) {
        return { ...ent, propertyIds: [...ent.propertyIds, prop.id] };
      }
      if (!shouldHaveProp && hadProp) {
        return { ...ent, propertyIds: ent.propertyIds.filter((id) => id !== prop.id) };
      }
      return ent;
    });
    setEnterprises(nextEnts);
    saveEnterprises(nextEnts);
  };

  const handleDeleteProperty = (id: string) => {
    const nextProps = properties.filter((p) => p.id !== id);
    setProperties(nextProps);
    saveProperties(nextProps);

    const nextEnts = enterprises.map((e) => ({
      ...e,
      propertyIds: e.propertyIds.filter((pId) => pId !== id),
    }));
    setEnterprises(nextEnts);
    saveEnterprises(nextEnts);
  };

  const handleSaveTimeLog = (entry: Omit<TimeLogEntry, 'id' | 'createdAt'>) => {
    const newEntry: TimeLogEntry = {
      ...entry,
      id: `log-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const nextLogs = [newEntry, ...timeLogs];
    setTimeLogs(nextLogs);
    saveTimeLogs(nextLogs);

    // If an expense amount was matched/entered, automatically log corresponding Schedule E expense!
    if (entry.expenseAmountMatched && entry.expenseAmountMatched > 0) {
      const matchingExpense: Expense = {
        id: `exp-${Date.now()}`,
        date: entry.date,
        propertyId: entry.propertyId,
        enterpriseId: entry.enterpriseId,
        amount: entry.expenseAmountMatched,
        category: 'Supplies',
        vendor: 'Store Receipt / Maintenance Hardware',
        description: `Corroborating materials receipt for task: ${entry.description}`,
        paymentMethod: 'Debit Card',
        receiptName: entry.receiptName,
        receiptDataUrl: entry.receiptDataUrl,
        linkedTimeLogId: newEntry.id,
        taxDeductible: true,
      };
      const nextExp = [matchingExpense, ...expenses];
      setExpenses(nextExp);
      saveExpenses(nextExp);
    }

    // Reset global timer if it was used
    if (globalTimerSeconds > 0) {
      setGlobalTimerSeconds(0);
    }
  };

  const handleDeleteTimeLog = (id: string) => {
    const nextLogs = timeLogs.filter((l) => l.id !== id);
    setTimeLogs(nextLogs);
    saveTimeLogs(nextLogs);
  };

  const handleSaveExpense = (expense: Omit<Expense, 'id'>) => {
    const newExp: Expense = {
      ...expense,
      id: `exp-${Date.now()}`,
    };
    const next = [newExp, ...expenses];
    setExpenses(next);
    saveExpenses(next);
  };

  const handleDeleteExpense = (id: string) => {
    const next = expenses.filter((e) => e.id !== id);
    setExpenses(next);
    saveExpenses(next);
  };

  const handleToggleArchiveYear = (year: number) => {
    const current = taxpayer.archivedYears || [];
    const updated = current.includes(year)
      ? current.filter((y) => y !== year)
      : [...current, year];
    handleSaveTaxpayer({
      ...taxpayer,
      archivedYears: updated,
    });
  };

  const handleToggleGroupingLock = (locked: boolean) => {
    handleSaveTaxpayer({
      ...taxpayer,
      lockGroupingForTaxYear: locked,
    });
  };

  const handleResetDemo = () => {
    if (confirm('Reset to initial IRS Notice 2019-38 demo portfolio? Any custom edits will be restored to realistic sample data.')) {
      resetToDemoData();
      setTaxpayer(loadTaxpayer());
      setEnterprises(loadEnterprises());
      setProperties(loadProperties());
      setTimeLogs(loadTimeLogs());
      setExpenses(loadExpenses());
      setSelectedYear(2026);
    }
  };

  const handleExportTimeCSV = () => {
    exportTimeLogsCSV(timeLogs, properties, enterprises, selectedYear);
  };

  const handleExportExpCSV = () => {
    exportExpensesCSV(expenses, properties, enterprises, selectedYear);
  };

  // Qualified eligible hours for selected year
  const eligibleYearHours = timeLogs
    .filter((l) => l.isEligible && l.date.startsWith(String(selectedYear)))
    .reduce((sum, l) => sum + l.hours, 0);

  const isCurrentYearArchived = taxpayer.archivedYears?.includes(selectedYear);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        taxpayer={taxpayer}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        onOpenLogModal={() => {
          setLogModalEnterpriseId(undefined);
          setIsLogModalOpen(true);
        }}
        onOpenAuditModal={() => setIsAuditModalOpen(true)}
        onOpenCloudModal={() => setIsCloudModalOpen(true)}
        onOpenTaxpayerModal={() => setIsTaxpayerModalOpen(true)}
        onResetDemo={handleResetDemo}
        isTimerRunning={isGlobalTimerRunning}
        timerSeconds={globalTimerSeconds}
        onToggleTimer={handleToggleGlobalTimer}
        eligibleHours={eligibleYearHours}
      />

      {/* Archived Year Banner if closed year */}
      {isCurrentYearArchived && (
        <div className="bg-cyan-950/90 border-b border-cyan-800/80 px-4 py-2 text-xs flex items-center justify-between text-cyan-200">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              <strong>Read-Only Immutable Archive:</strong> Tax Year {selectedYear} was closed and certified for Form 1040 filing. Historical records are frozen against accidental modification.
            </span>
            <button
              onClick={() => handleToggleArchiveYear(selectedYear)}
              className="ml-auto underline hover:text-white shrink-0"
            >
              Unlock
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Quick 10-Second Log Bar */}
            <QuickLogBar
              enterprises={enterprises}
              properties={properties}
              onQuickLog={handleSaveTimeLog}
              onOpenFullModal={() => {
                setLogModalEnterpriseId(undefined);
                setIsLogModalOpen(true);
              }}
            />

            {/* Intelligent Geo-Fence Site Visit Tracker */}
            <GeoFenceSimulator
              properties={properties}
              onLogFromGeoFence={handleSaveTimeLog}
            />

            {/* Visual 250-Hour Progress Ring, Pacing & Two-Tier RREE View */}
            <ProgressRing
              timeLogs={timeLogs}
              enterprises={enterprises}
              properties={properties}
              taxpayer={taxpayer}
              selectedYear={selectedYear}
              onSelectEnterpriseTab={() => setActiveTab('enterprises')}
              onOpenLogModal={(defaultEntId) => {
                setLogModalEnterpriseId(defaultEntId);
                setIsLogModalOpen(true);
              }}
              onOpenAuditModal={() => setIsAuditModalOpen(true)}
              onOpenPropertyDetails={(propId) => {
                setEditingPropertyId(propId);
                setIsPropertyModalOpen(true);
              }}
            />
          </div>
        )}

        {/* TAB 2: CONTEMPORANEOUS TIME LOGS */}
        {activeTab === 'timelogs' && (
          <div className="space-y-6">
            <TimeLogTable
              timeLogs={timeLogs}
              enterprises={enterprises}
              properties={properties}
              selectedYear={selectedYear}
              onOpenLogModal={() => {
                setLogModalEnterpriseId(undefined);
                setIsLogModalOpen(true);
              }}
              onDeleteLog={handleDeleteTimeLog}
              onExportCSV={handleExportTimeCSV}
            />
          </div>
        )}

        {/* TAB 3: ENTERPRISES & SEGREGATION */}
        {activeTab === 'enterprises' && (
          <div className="space-y-6">
            <EnterpriseManager
              enterprises={enterprises}
              properties={properties}
              timeLogs={timeLogs}
              taxpayer={taxpayer}
              selectedYear={selectedYear}
              onSaveEnterprise={handleSaveEnterprise}
              onDeleteEnterprise={handleDeleteEnterprise}
              onToggleGroupingLock={handleToggleGroupingLock}
              onOpenPropertyModal={(propId) => {
                setEditingPropertyId(propId);
                setIsPropertyModalOpen(true);
              }}
            />
          </div>
        )}

        {/* TAB 4: SCHEDULE E EXPENSES */}
        {activeTab === 'expenses' && (
          <div className="space-y-6">
            <ExpenseTracker
              expenses={expenses}
              enterprises={enterprises}
              properties={properties}
              selectedYear={selectedYear}
              onSaveExpense={handleSaveExpense}
              onDeleteExpense={handleDeleteExpense}
              onExportCSV={handleExportExpCSV}
            />
          </div>
        )}

        {/* TAB 5: FORM 1040 ATTACHMENT / AUDIT STATEMENT */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  <span>Official Form 1040 § 199A Safe Harbor Statement</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  IRS Notice 2019-38 §3.06 mandates attaching a signed statement under penalties of perjury to your return.
                </p>
              </div>
              <button
                onClick={() => setIsAuditModalOpen(true)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-950 flex items-center gap-2 transition-all"
              >
                <span>Open Full Audit Binder & Download PDF</span>
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white">Statutory Statement Preview</h3>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-line shadow-inner max-h-96 overflow-y-auto">
{`STATEMENT UNDER IRS NOTICE 2019-38
SECTION 199A QUALIFIED BUSINESS INCOME SAFE HARBOR ELECTION
ATTACHMENT TO FORM 1040 / SCHEDULE E

Taxpayer: ${taxpayer.entityName || taxpayer.taxpayerName}
TIN / EIN / SSN: ${taxpayer.ssnOrEin}
Taxable Year: ${selectedYear}

Under penalties of perjury, I (we) declare that I (we) have examined this statement, including accompanying contemporaneous logs, and, to the best of my (our) knowledge and belief, the statement contains all the facts required to be included in the statement filed with the return pursuant to IRS Notice 2019-38, Section 3.06.

1. Separate books and records have been maintained for each rental real estate enterprise.
2. 250 or more hours of qualified rental services were performed during the taxable year.
3. Contemporaneous records, including time reports and logs, were maintained.
4. No triple-net (NNN) leases and no personal residence usage exceeding IRC § 280A limitations.

RENTAL REAL ESTATE ENTERPRISES SCHEDULE:
${enterprises.map((e, idx) => {
  const entProps = properties.filter((p) => e.propertyIds.includes(p.id));
  const entHours = timeLogs.filter((l) => l.isEligible && l.enterpriseId === e.id && l.date.startsWith(String(selectedYear))).reduce((s, c) => s + c.hours, 0);
  return `Enterprise ${idx + 1}: ${e.name}
  - Type: ${e.type} (${e.groupingType})
  - Operating Bank: ${e.bankName} (Acct Ending ${e.bankAccountLast4}) | Ledger: ${e.ledgerSoftware}
  - Included Properties: ${entProps.map((p) => `${p.name} [${p.address}]`).join(', ')}
  - Qualified Hours: ${entHours.toFixed(1)} hrs (${entHours >= 250 ? 'QUALIFIED' : 'PENDING 250h'})`;
}).join('\n\n')}

Certified by: ___________________________________________ Date: _________________
Taxpayer / Authorized Representative Signature`}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: GUIDELINES & INELIGIBILITY RULES */}
        {activeTab === 'guidelines' && (
          <IneligibleRulesGuide />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">SafeHarbor 199A</span>
            <span>•</span>
            <span>IRS Notice 2019-38 Contemporaneous Audit Defense Suite</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>20% QBI Pass-Through Tracker</span>
            <span>•</span>
            <span>Separate Books & Accounts Segregation</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Time Tracker Modal */}
      <TimeTrackerModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onSaveLog={handleSaveTimeLog}
        enterprises={enterprises}
        properties={properties}
        taxpayer={taxpayer}
        defaultEnterpriseId={logModalEnterpriseId}
        initialTimerSeconds={globalTimerSeconds}
      />

      {/* 2. Audit Defense Report Modal */}
      <AuditReportModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        taxpayer={taxpayer}
        enterprises={enterprises}
        properties={properties}
        timeLogs={timeLogs}
        expenses={expenses}
        selectedYear={selectedYear}
        onToggleArchiveYear={handleToggleArchiveYear}
      />

      {/* 3. Property Details & Setup Wizard Modal */}
      <PropertyModal
        isOpen={isPropertyModalOpen}
        onClose={() => setIsPropertyModalOpen(false)}
        onSaveProperty={handleSaveProperty}
        onDeleteProperty={handleDeleteProperty}
        enterprises={enterprises}
        existingProperty={properties.find((p) => p.id === editingPropertyId) || null}
        onCreateEnterprise={handleCreateEnterpriseInline}
      />

      {/* 4. Cloud Backup Modal */}
      <CloudBackupModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        cloudConfig={cloudConfig}
        onUpdateCloudConfig={(cfg) => {
          setCloudConfig(cfg);
          saveCloudConfig(cfg);
        }}
        onDataRestored={() => {
          setTaxpayer(loadTaxpayer());
          setEnterprises(loadEnterprises());
          setProperties(loadProperties());
          setTimeLogs(loadTimeLogs());
          setExpenses(loadExpenses());
        }}
      />

      {/* 5. Taxpayer Profile Modal */}
      <TaxpayerProfileModal
        isOpen={isTaxpayerModalOpen}
        onClose={() => setIsTaxpayerModalOpen(false)}
        taxpayer={taxpayer}
        onSaveTaxpayer={handleSaveTaxpayer}
      />
    </div>
  );
}
