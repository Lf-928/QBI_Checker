import { Enterprise, Expense, Property, TaxpayerProfile, TimeLogEntry } from '../types';
import { initialEnterprises, initialExpenses, initialProperties, initialTaxpayer, initialTimeLogs } from '../data/initialData';

const STORAGE_KEYS = {
  ENTERPRISES: 'safeharbor_enterprises_v1',
  PROPERTIES: 'safeharbor_properties_v1',
  TIME_LOGS: 'safeharbor_timelogs_v1',
  EXPENSES: 'safeharbor_expenses_v1',
  TAXPAYER: 'safeharbor_taxpayer_v1',
  TIMER_STATE: 'safeharbor_active_timer_v1',
  CLOUD_CONFIG: 'safeharbor_cloud_config_v1',
};

export interface CloudBackupConfig {
  provider: 'google_drive' | 'dropbox' | 'local';
  autoSync: boolean;
  connectedAccount: string;
  lastSyncTimestamp: string | null;
  syncedFileName?: string;
}

export function loadTaxpayer(): TaxpayerProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TAXPAYER);
    return raw ? JSON.parse(raw) : initialTaxpayer;
  } catch (e) {
    console.error('Failed to load taxpayer', e);
    return initialTaxpayer;
  }
}

export function saveTaxpayer(data: TaxpayerProfile): void {
  localStorage.setItem(STORAGE_KEYS.TAXPAYER, JSON.stringify(data));
}

export function loadEnterprises(): Enterprise[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ENTERPRISES);
    return raw ? JSON.parse(raw) : Object.values(initialEnterprises);
  } catch (e) {
    console.error('Failed to load enterprises', e);
    return Object.values(initialEnterprises);
  }
}

export function saveEnterprises(data: Enterprise[]): void {
  localStorage.setItem(STORAGE_KEYS.ENTERPRISES, JSON.stringify(data));
}

export function loadProperties(): Property[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
    return raw ? JSON.parse(raw) : initialProperties;
  } catch (e) {
    console.error('Failed to load properties', e);
    return initialProperties;
  }
}

export function saveProperties(data: Property[]): void {
  localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(data));
}

export function loadTimeLogs(): TimeLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TIME_LOGS);
    return raw ? JSON.parse(raw) : initialTimeLogs;
  } catch (e) {
    console.error('Failed to load time logs', e);
    return initialTimeLogs;
  }
}

export function saveTimeLogs(data: TimeLogEntry[]): void {
  localStorage.setItem(STORAGE_KEYS.TIME_LOGS, JSON.stringify(data));
}

export function loadExpenses(): Expense[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return raw ? JSON.parse(raw) : initialExpenses;
  } catch (e) {
    console.error('Failed to load expenses', e);
    return initialExpenses;
  }
}

export function saveExpenses(data: Expense[]): void {
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(data));
}

export function loadCloudConfig(): CloudBackupConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLOUD_CONFIG);
    return raw
      ? JSON.parse(raw)
      : {
          provider: 'google_drive',
          autoSync: true,
          connectedAccount: 'PinheirosFamily@gmail.com',
          lastSyncTimestamp: new Date().toISOString(),
          syncedFileName: 'SafeHarbor_199A_Audit_Backup_2026.json',
        };
  } catch {
    return {
      provider: 'google_drive',
      autoSync: true,
      connectedAccount: 'PinheirosFamily@gmail.com',
      lastSyncTimestamp: new Date().toISOString(),
      syncedFileName: 'SafeHarbor_199A_Audit_Backup_2026.json',
    };
  }
}

export function saveCloudConfig(config: CloudBackupConfig): void {
  localStorage.setItem(STORAGE_KEYS.CLOUD_CONFIG, JSON.stringify(config));
}

export interface FullAuditBackupData {
  schemaVersion: string;
  app: string;
  exportedAt: string;
  taxYear: number;
  taxpayer: TaxpayerProfile;
  enterprises: Enterprise[];
  properties: Property[];
  timeLogs: TimeLogEntry[];
  expenses: Expense[];
  summary: {
    totalEligibleHours: number;
    totalEnterprises: number;
    totalProperties: number;
    isFullyCompliant: boolean;
  };
}

export function exportFullBackupJSON(): FullAuditBackupData {
  const taxpayer = loadTaxpayer();
  const enterprises = loadEnterprises();
  const properties = loadProperties();
  const timeLogs = loadTimeLogs();
  const expenses = loadExpenses();

  const eligibleHours = timeLogs
    .filter((l) => l.isEligible)
    .reduce((acc, curr) => acc + curr.hours, 0);

  return {
    schemaVersion: '1.0.0-irs-notice-2019-38',
    app: 'SafeHarbor 199A Audit Tracker',
    exportedAt: new Date().toISOString(),
    taxYear: taxpayer.taxYear,
    taxpayer,
    enterprises,
    properties,
    timeLogs,
    expenses,
    summary: {
      totalEligibleHours: eligibleHours,
      totalEnterprises: enterprises.length,
      totalProperties: properties.length,
      isFullyCompliant: eligibleHours >= 250,
    },
  };
}

export function restoreFromJSON(backup: FullAuditBackupData): boolean {
  try {
    if (!backup.timeLogs || !backup.enterprises) {
      throw new Error('Invalid backup structure');
    }
    if (backup.taxpayer) saveTaxpayer(backup.taxpayer);
    if (backup.enterprises) saveEnterprises(backup.enterprises);
    if (backup.properties) saveProperties(backup.properties);
    if (backup.timeLogs) saveTimeLogs(backup.timeLogs);
    if (backup.expenses) saveExpenses(backup.expenses);
    return true;
  } catch (err) {
    console.error('Error restoring backup', err);
    return false;
  }
}

export function resetToDemoData(): void {
  localStorage.removeItem(STORAGE_KEYS.ENTERPRISES);
  localStorage.removeItem(STORAGE_KEYS.PROPERTIES);
  localStorage.removeItem(STORAGE_KEYS.TIME_LOGS);
  localStorage.removeItem(STORAGE_KEYS.EXPENSES);
  localStorage.removeItem(STORAGE_KEYS.TAXPAYER);
}
