import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  Check, 
  AlertCircle, 
  ArrowRight, 
  X, 
  Play, 
  Square,
  Sparkles
} from 'lucide-react';
import { Property, TimeLogEntry } from '../types';

interface GeoFenceSimulatorProps {
  properties: Property[];
  onLogFromGeoFence: (entry: Omit<TimeLogEntry, 'id' | 'createdAt'>) => void;
}

export const GeoFenceSimulator: React.FC<GeoFenceSimulatorProps> = ({
  properties,
  onLogFromGeoFence,
}) => {
  const [activePropertyId, setActivePropertyId] = useState<string>(properties[0]?.id || '');
  const [isOnSite, setIsOnSite] = useState<boolean>(false);
  const [siteArrivalTime, setSiteArrivalTime] = useState<number | null>(null);
  const [elapsedMinutes, setElapsedMinutes] = useState<number>(0);
  const [departurePrompt, setDeparturePrompt] = useState<{
    property: Property;
    durationHours: number;
    promptTime: string;
  } | null>(null);

  const activeProperty = properties.find((p) => p.id === activePropertyId) || properties[0];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOnSite && siteArrivalTime) {
      interval = setInterval(() => {
        const mins = Math.max(1, Math.floor((Date.now() - siteArrivalTime) / 60000));
        setElapsedMinutes(mins);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOnSite, siteArrivalTime]);

  const handleSimulateArrival = () => {
    setIsOnSite(true);
    setSiteArrivalTime(Date.now());
    setElapsedMinutes(0);
    setDeparturePrompt(null);
  };

  const handleSimulateDeparture = () => {
    if (!isOnSite || !activeProperty) return;

    // For realistic demonstration, if elapsed is less than 5 min, simulate a 2.25 hr on-site maintenance session
    const simulatedHours = elapsedMinutes > 5 ? parseFloat((elapsedMinutes / 60).toFixed(2)) : 2.25;

    setDeparturePrompt({
      property: activeProperty,
      durationHours: simulatedHours,
      promptTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    setIsOnSite(false);
    setSiteArrivalTime(null);
    setElapsedMinutes(0);
  };

  const handleAcceptDepartureLog = () => {
    if (!departurePrompt) return;

    onLogFromGeoFence({
      date: new Date().toISOString().split('T')[0],
      startTime: '09:30',
      endTime: '11:45',
      hours: departurePrompt.durationHours,
      propertyId: departurePrompt.property.id,
      enterpriseId: departurePrompt.property.enterpriseId,
      category: 'Daily Operation, Maintenance & Repairs',
      isEligible: true,
      description: `On-site rental service visit at ${departurePrompt.property.name}: routine maintenance and tenant inspection.`,
      performedBy: 'Alexandre Pinheiro',
      performerRole: 'Owner / Investor',
      isGeoLogged: true,
      notes: `Automatically captured via Intelligent Geo-Fence perimeter departure prompt at ${departurePrompt.promptTime}.`,
    });

    setDeparturePrompt(null);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-xl">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Intelligent Geo-Fencing & Site Visit Tracker</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                Auto-Prompt Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Recognizes physical presence at registered properties and prompts you when driving away.
            </p>
          </div>
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
          <span className={`h-2.5 w-2.5 rounded-full ${isOnSite ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
          <span className="text-slate-300 font-medium">
            {isOnSite ? (
              <span className="text-emerald-400 font-semibold">
                On-Site at {activeProperty?.name} ({elapsedMinutes}m)
              </span>
            ) : (
              'Monitoring 3 Registered Geo-Fences'
            )}
          </span>
        </div>
      </div>

      {/* Geo-Fence Departure Prompt Banner (High-Value Feature) */}
      {departurePrompt && (
        <div className="p-4 bg-gradient-to-r from-cyan-950 via-slate-900 to-emerald-950 border border-cyan-500/50 rounded-xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-cyan-500 text-slate-950 rounded-lg shrink-0 mt-0.5">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  📍 Departure Detected ({departurePrompt.promptTime})
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                  {departurePrompt.durationHours} Hours On-Site
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-100 font-medium mt-0.5">
                We noticed you just spent <strong className="text-cyan-300 font-mono">{departurePrompt.durationHours} hours</strong> at <strong className="text-white">{departurePrompt.property.name}</strong> ({departurePrompt.property.address}). Would you like to log this as rental services?
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={() => setDeparturePrompt(null)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              title="Dismiss prompt"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={handleAcceptDepartureLog}
              className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-lg shadow-md shadow-emerald-950 flex items-center justify-center gap-1.5 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>1-Tap Log {departurePrompt.durationHours}h</span>
            </button>
          </div>
        </div>
      )}

      {/* Simulator Control Box */}
      <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-slate-400 whitespace-nowrap">Target Property:</span>
          <select
            value={activePropertyId}
            onChange={(e) => setActivePropertyId(e.target.value)}
            disabled={isOnSite}
            className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 font-medium w-full sm:w-auto"
          >
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.address})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {!isOnSite ? (
            <button
              onClick={handleSimulateArrival}
              className="w-full sm:w-auto px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Simulate Arrival at Property</span>
            </button>
          ) : (
            <button
              onClick={handleSimulateDeparture}
              className="w-full sm:w-auto px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow animate-pulse"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Simulate Departure / Drive Away</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
