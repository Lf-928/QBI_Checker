import React from 'react';
import { 
  ShieldCheck, 
  Clock, 
  FileText, 
  Cloud, 
  Plus, 
  Play, 
  Square, 
  Building2, 
  Receipt,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { TaxpayerProfile } from '../types';

interface HeaderProps {
  activeTab: 'dashboard' | 'timelogs' | 'enterprises' | 'expenses' | 'audit' | 'guidelines';
  setActiveTab: (tab: 'dashboard' | 'timelogs' | 'enterprises' | 'expenses' | 'audit' | 'guidelines') => void;
  taxpayer: TaxpayerProfile;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  onOpenLogModal: () => void;
  onOpenAuditModal: () => void;
  onOpenCloudModal: () => void;
  onOpenTaxpayerModal: () => void;
  onResetDemo: () => void;
  isTimerRunning: boolean;
  timerSeconds: number;
  onToggleTimer: () => void;
  eligibleHours: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  taxpayer,
  selectedYear,
  setSelectedYear,
  onOpenLogModal,
  onOpenAuditModal,
  onOpenCloudModal,
  onOpenTaxpayerModal,
  onResetDemo,
  isTimerRunning,
  timerSeconds,
  onToggleTimer,
  eligibleHours,
}) => {
  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isThresholdMet = eligibleHours >= 250;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-xl">
      {/* Top Banner: Safe Harbor Compliance Status */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-cyan-950/80 px-4 py-1.5 border-b border-emerald-900/40 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-300 font-medium">
            IRC § 199A / IRS Notice 2019-38 Safe Harbor Compliance Standard:
          </span>
          <span className="font-semibold text-emerald-400">
            250 Contemporaneous Service Hours Required per RREE
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-300">
          <button
            onClick={onOpenCloudModal}
            className="flex items-center gap-1.5 hover:text-emerald-300 transition-colors text-slate-400"
            title="Cloud Backup Settings"
          >
            <Cloud className="w-3.5 h-3.5 text-emerald-400" />
            <span>Google Drive: Backed Up</span>
          </button>
          <span className="text-slate-600">|</span>
          <button
            onClick={onResetDemo}
            className="flex items-center gap-1 text-slate-400 hover:text-amber-300 transition-colors"
            title="Reload Demo Data"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Taxpayer info */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-700 p-2.5 rounded-xl shadow-lg shadow-emerald-900/30 ring-1 ring-emerald-400/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  SafeHarbor <span className="text-emerald-400 font-mono text-sm px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800">199A</span>
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  Audit Defense Edition
                </span>
              </div>
              <button
                onClick={onOpenTaxpayerModal}
                className="text-xs text-slate-400 hover:text-emerald-300 transition-colors text-left flex items-center gap-1"
              >
                <span>{taxpayer.entityName || taxpayer.taxpayerName}</span>
                <span className="text-slate-600">•</span>
                <span className="font-mono text-slate-400">{taxpayer.ssnOrEin}</span>
              </button>
            </div>
          </div>

          {/* Quick Active Timer Pill */}
          <div className="hidden lg:flex items-center bg-slate-950/90 border border-slate-800 rounded-xl px-3 py-1.5 gap-3 shadow-inner">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${isTimerRunning ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`} />
              <div className="text-xs">
                <div className="text-slate-400 font-medium">Contemporaneous Timer</div>
                <div className="font-mono text-sm font-semibold text-slate-200">
                  {formatTimer(timerSeconds)}
                </div>
              </div>
            </div>
            <button
              onClick={onToggleTimer}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                isTimerRunning
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
              }`}
            >
              {isTimerRunning ? (
                <>
                  <Square className="w-3 h-3 fill-current" />
                  <span>Stop & Save</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-current" />
                  <span>Start Clock</span>
                </>
              )}
            </button>
          </div>

          {/* Controls: Year Selector & Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Year Selector */}
            <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700 text-xs">
              {[2024, 2025, 2026].map((yr) => (
                <button
                  key={yr}
                  onClick={() => setSelectedYear(yr)}
                  className={`px-2.5 py-1 rounded-md font-mono font-medium transition-colors ${
                    selectedYear === yr
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>

            {/* Log Hours Button */}
            <button
              onClick={onOpenLogModal}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm px-3 sm:px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-lg shadow-emerald-900/30 hover:shadow-emerald-700/40 transition-all border border-emerald-400/30"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Log</span> Hours
            </button>

            {/* Audit Report Button */}
            <button
              onClick={onOpenAuditModal}
              className="bg-slate-800 hover:bg-slate-700 text-emerald-400 font-medium text-xs sm:text-sm px-3 sm:px-3.5 py-2 rounded-lg flex items-center gap-1.5 border border-slate-700 hover:border-emerald-500/40 transition-all"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">IRS</span> Audit Binder
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto py-2 border-t border-slate-800/80 text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'dashboard'
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>250-Hour Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('timelogs')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'timelogs'
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Contemporaneous Logs</span>
          </button>

          <button
            onClick={() => setActiveTab('enterprises')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'enterprises'
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Enterprises & Segregation</span>
          </button>

          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'expenses'
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Schedule E Expenses</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Form 1040 Attachment</span>
          </button>

          <button
            onClick={() => setActiveTab('guidelines')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'guidelines'
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>IRS Rules & Ineligibility Guide</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
