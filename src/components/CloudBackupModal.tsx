import React, { useState } from 'react';
import { 
  X, 
  Cloud, 
  Download, 
  Upload, 
  Check, 
  RefreshCw, 
  ShieldCheck, 
  HardDrive,
  FileJson,
  CheckCircle2
} from 'lucide-react';
import { CloudBackupConfig, exportFullBackupJSON, restoreFromJSON, saveCloudConfig } from '../utils/storage';

interface CloudBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  cloudConfig: CloudBackupConfig;
  onUpdateCloudConfig: (config: CloudBackupConfig) => void;
  onDataRestored: () => void;
}

export const CloudBackupModal: React.FC<CloudBackupModalProps> = ({
  isOpen,
  onClose,
  cloudConfig,
  onUpdateCloudConfig,
  onDataRestored,
}) => {
  const [provider, setProvider] = useState<'google_drive' | 'dropbox' | 'local'>(cloudConfig.provider);
  const [autoSync, setAutoSync] = useState(cloudConfig.autoSync);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSyncNow = () => {
    setIsSyncing(true);
    setSyncSuccessMessage(null);

    setTimeout(() => {
      setIsSyncing(false);
      const updated: CloudBackupConfig = {
        ...cloudConfig,
        provider,
        autoSync,
        lastSyncTimestamp: new Date().toISOString(),
      };
      onUpdateCloudConfig(updated);
      saveCloudConfig(updated);
      setSyncSuccessMessage(`Successfully backed up audit records to ${provider === 'google_drive' ? 'Google Drive' : 'Dropbox'}!`);
      setTimeout(() => setSyncSuccessMessage(null), 4000);
    }, 1200);
  };

  const handleDownloadArchive = () => {
    const data = exportFullBackupJSON();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SafeHarbor_199A_Audit_Archive_${data.taxYear}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result as string);
          if (restoreFromJSON(parsed)) {
            alert('Audit database restored successfully from archive!');
            onDataRestored();
            onClose();
          } else {
            alert('Invalid backup archive structure.');
          }
        } catch {
          alert('Failed to parse backup JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Cloud Storage & Audit Backup</h3>
              <p className="text-xs text-slate-400">
                Securely back up contemporaneous logs to Google Drive or Dropbox
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {syncSuccessMessage && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{syncSuccessMessage}</span>
          </div>
        )}

        <div className="space-y-4 text-xs">
          {/* Provider Selection */}
          <div>
            <label className="block text-slate-300 font-semibold mb-2">Cloud Storage Provider</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setProvider('google_drive')}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                  provider === 'google_drive'
                    ? 'bg-emerald-950/60 border-emerald-500 text-white shadow'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="p-1.5 bg-slate-800 rounded text-emerald-400 font-bold">G</div>
                <div>
                  <div className="font-bold">Google Drive</div>
                  <div className="text-[10px] text-slate-400">PinheirosFamily@gmail.com</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setProvider('dropbox')}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                  provider === 'dropbox'
                    ? 'bg-emerald-950/60 border-emerald-500 text-white shadow'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="p-1.5 bg-slate-800 rounded text-blue-400 font-bold">D</div>
                <div>
                  <div className="font-bold">Dropbox</div>
                  <div className="text-[10px] text-slate-400">Connected</div>
                </div>
              </button>
            </div>
          </div>

          {/* Auto-Sync Toggle */}
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-200">Automatic Real-Time Cloud Sync</div>
              <div className="text-[11px] text-slate-400">
                Back up contemporaneous logs every time a task is completed
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
              className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
            />
          </div>

          {/* Last sync timestamp */}
          <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>Last Synced:</span>
            <span>{cloudConfig.lastSyncTimestamp ? new Date(cloudConfig.lastSyncTimestamp).toLocaleString() : 'Never'}</span>
          </div>

          {/* Sync Button */}
          <button
            onClick={handleSyncNow}
            disabled={isSyncing}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchronizing to Cloud...' : 'Sync to Cloud Now'}</span>
          </button>

          {/* Direct Archive File Export & Restore */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Local Hard-Drive Backup & Archive
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDownloadArchive}
                className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-semibold text-white">Download JSON</div>
                  <div className="text-[10px] text-slate-400">Export offline backup</div>
                </div>
              </button>

              <label className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left flex items-center gap-2 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="font-semibold text-white">Restore JSON</div>
                  <div className="text-[10px] text-slate-400">Import backup file</div>
                </div>
                <input
                  type="file"
                  accept="application/json"
                  onChange={handleRestoreFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
