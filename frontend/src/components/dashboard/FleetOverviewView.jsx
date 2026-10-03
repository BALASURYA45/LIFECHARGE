import React, { useState, useEffect } from 'react';
import {
  Truck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Battery,
  Navigation,
  Activity,
  Zap,
  Flame,
  Radio,
  Sliders,
  RotateCcw,
  Compass,
  MapPin,
  Maximize2,
  RefreshCw,
  Cpu,
  Layers,
  ChevronRight,
  Sparkles,
  Download,
  Wifi,
  WifiOff,
  Car,
  BatteryCharging,
} from 'lucide-react';
import BatteryPack3DView from '../telematics/BatteryPack3DView.jsx';
import useTelematicsStream from '../../hooks/useTelematicsStream.js';

export default function FleetOverviewView({ fleetData }) {
  if (!fleetData) return null;

  const { summary = {}, vehicles = [] } = fleetData;

  // Real-Time WebSocket Telemetry Stream Hook
  const {
    isConnected: isWsConnected,
    telematicsData: wsData,
    lastUpdated: wsLastUpdated,
    alerts: wsAlerts,
    streamConfig,
    setDriveMode: setWsDriveMode,
  } = useTelematicsStream();

  // Selected vehicle for 3D inspection & telemetry focus
  const [selectedVin, setSelectedVin] = useState(vehicles[0]?.vin || '');
  const [activeFilter, setActiveFilter] = useState('ALL'); // ALL | HIGH_RISK | LONG_HAUL | CITY

  // Find currently selected vehicle
  const selectedVehicle =
    vehicles.find((v) => v.vin === selectedVin) || vehicles[0] || {};

  // Override vehicle properties dynamically if WebSocket stream is connected
  const currentPackTemp = wsData?.packTemp ?? selectedVehicle.packTempC ?? 28.5;
  const currentDeltaV = wsData?.deltaV ?? selectedVehicle.deltaV ?? 0.018;
  const currentSoc = wsData?.soc ?? selectedVehicle.currentSoc ?? 80;
  const currentDriveMode = streamConfig?.driveMode || 'CITY_DRIVING';

  // Filter vehicles based on active filter tab
  const filteredVehicles = vehicles.filter((v) => {
    if (activeFilter === 'HIGH_RISK') return v.riskLevel === 'HIGH' || v.riskLevel === 'CRITICAL';
    if (activeFilter === 'LONG_HAUL') return v.soh >= 92 && v.currentSoc >= 70;
    if (activeFilter === 'CITY') return v.soh < 92;
    return true;
  });

  const getRiskBadge = (risk) => {
    switch (risk) {
      case 'LOW':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-sm">
            <CheckCircle2 size={13} /> Optimal Health
          </span>
        );
      case 'MODERATE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-sm">
            <AlertTriangle size={13} /> Moderate Wear
          </span>
        );
      case 'HIGH':
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse shadow-sm">
            <ShieldAlert size={13} /> High Thermal / Delta V
          </span>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return (
          <span className="px-2.5 py-0.5 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 font-extrabold text-[10px] border border-teal-500/20">
            READY FOR ROUTE
          </span>
        );
      case 'CHARGING':
        return (
          <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-extrabold text-[10px] border border-cyan-500/20 flex items-center gap-1">
            <Zap size={10} className="animate-bounce" /> FAST CHARGING
          </span>
        );
      case 'IN_SERVICE':
        return (
          <span className="px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold text-[10px] border border-blue-500/20">
            EN ROUTE
          </span>
        );
      case 'MAINTENANCE_REQUIRED':
        return (
          <span className="px-2.5 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-extrabold text-[10px] border border-rose-500/20">
            SERVICE DEPOT
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. High-Tech Header & Live WebSocket Telemetry Stream Banner */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white shadow-2xl relative overflow-hidden">
        {/* Glowing background ambient lights */}
        <div className="absolute -top-24 -right-24 size-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 size-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black tracking-wider uppercase border ${
                  isWsConnected
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                }`}
              >
                {isWsConnected ? <Wifi size={14} className="animate-pulse text-emerald-400" /> : <Wifi size={14} className="text-emerald-400" />}
                {isWsConnected ? `WebSocket Stream Active (0.5 Hz • Port 5000)` : `WebSocket Telemetry Engine Ready`}
                <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
              </div>

              {wsLastUpdated && (
                <span className="text-[11px] font-mono text-slate-400 font-bold bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700">
                  Last Tick: {wsLastUpdated}
                </span>
              )}
            </div>

            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Truck size={32} className="text-emerald-400" /> Commercial EV Fleet Command Center
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl font-medium">
              Real-time WebSocket telemetry ingest, 3D digital twin pack inspection, thermal overheat warning broadcasts, and AI route dispatching.
            </p>
          </div>

          {/* Quick WebSocket Operational Mode Ingest Controls */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 p-2 rounded-2xl border border-slate-800 shadow-xl">
            <span className="text-[10px] font-black uppercase text-slate-400 px-2">Inject Mode:</span>
            {[
              { key: 'CITY_DRIVING', label: 'City', icon: Car },
              { key: 'FAST_CHARGING', label: 'Fast Charge', icon: BatteryCharging },
              { key: 'HIGH_LOAD', label: 'High Load', icon: Zap },
              { key: 'THERMAL_STRESS', label: 'Thermal Stress', icon: Flame },
            ].map((m) => {
              const Icon = m.icon;
              const isActive = currentDriveMode === m.key;
              return (
                <button
                  key={m.key}
                  onClick={() => setWsDriveMode(m.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon size={13} />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Live Broadcast Anomaly Alerts Ticker (WebSocket Injected) */}
      {wsAlerts && wsAlerts.length > 0 && (
        <div className="space-y-2">
          {wsAlerts.map((alt) => (
            <div
              key={alt.id}
              className={`p-4 rounded-2xl border flex items-center justify-between gap-4 shadow-lg animate-fade-in ${
                alt.severity === 'CRITICAL'
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                  : alt.severity === 'HIGH'
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldAlert size={22} className="shrink-0 animate-bounce" />
                <div>
                  <span className="text-xs font-black uppercase tracking-wider block">{alt.title}</span>
                  <p className="text-xs font-medium opacity-90">{alt.message}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-slate-950/60 px-2.5 py-1 rounded-lg border border-white/10 shrink-0">
                {alt.timestamp}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 3. Fleet KPI Highlights Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-3xl border border-indigo-500/20 bg-white dark:bg-[#0B131F] p-6 space-y-3 shadow-md hover:shadow-indigo-500/10 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              Total Roster EVs
            </span>
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              <Truck size={22} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-900 dark:text-white font-mono">
              {summary.totalVehicles || vehicles.length}
            </span>
            <span className="text-xs font-bold text-slate-500">Commercial Units</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-500">
            <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
            WebSocket Telemetry Ingestion Active
          </div>
        </div>

        <div className="rounded-3xl border border-teal-500/20 bg-white dark:bg-[#0B131F] p-6 space-y-3 shadow-md hover:shadow-teal-500/10 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              Fleet Average SOH
            </span>
            <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-500 dark:text-teal-400 group-hover:scale-110 transition-transform">
              <Activity size={22} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-teal-500 dark:text-teal-400 font-mono">
              {summary.avgSoh}%
            </span>
            <span className="text-xs font-bold text-slate-400">Target ≥ 90%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-1000"
              style={{ width: `${summary.avgSoh}%` }}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-cyan-500/20 bg-white dark:bg-[#0B131F] p-6 space-y-3 shadow-md hover:shadow-cyan-500/10 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              Highway Long-Haul Ready
            </span>
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 group-hover:scale-110 transition-transform">
              <Navigation size={22} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-cyan-500 dark:text-cyan-400 font-mono">
              {summary.availableForLongHaul}
            </span>
            <span className="text-xs font-bold text-slate-400">EVs</span>
          </div>
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
            Qualified for 350+ km express routes
          </p>
        </div>

        <div className="rounded-3xl border border-rose-500/30 bg-rose-500/5 p-6 space-y-3 shadow-md hover:shadow-rose-500/10 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold tracking-wider text-rose-600 dark:text-rose-400 uppercase">
              Attention Required
            </span>
            <div className="p-3 rounded-2xl bg-rose-500/15 text-rose-500 dark:text-rose-400 group-hover:scale-110 transition-transform">
              <ShieldAlert size={22} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-rose-600 dark:text-rose-400 font-mono">
              {summary.highRiskCount}
            </span>
            <span className="text-xs font-bold text-slate-500">EV</span>
          </div>
          <p className="text-[11px] font-bold text-rose-500 dark:text-rose-400 flex items-center gap-1">
            <AlertTriangle size={12} /> Elevated Cell Imbalance / Temp
          </p>
        </div>
      </div>

      {/* 4. 3D Digital Twin Inspection Spotlight */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B131F] p-6 md:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-emerald-500 uppercase tracking-wider mb-1">
              <Sparkles size={16} /> 3D Digital Twin Cell-Level Pack Renderer
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              Inspecting Vehicle: {selectedVehicle.name}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              VIN: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{selectedVehicle.vin}</span> • Chemistry:{' '}
              <span className="font-bold text-teal-500">{selectedVehicle.chemistry}</span>
            </p>
          </div>

          {/* Quick Vehicle Selector Dropdown */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 hidden sm:inline">Select EV:</span>
            <select
              value={selectedVin}
              onChange={(e) => setSelectedVin(e.target.value)}
              className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm cursor-pointer"
            >
              {vehicles.map((v) => (
                <option key={v.vin} value={v.vin}>
                  {v.name} ({v.chemistry} • SOH {v.soh}%)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Telemetry KPI Chips for Selected Vehicle */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">State of Health (SOH)</span>
            <p className="text-2xl font-black font-mono text-emerald-500">{selectedVehicle.soh}%</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Remaining Useful Life</span>
            <p className="text-2xl font-black font-mono text-cyan-400">{selectedVehicle.rulCycles} Cycles</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Live Pack Temp (WS)</span>
            <p className={`text-2xl font-black font-mono ${currentPackTemp > 38 ? 'text-rose-500' : 'text-teal-400'}`}>
              {currentPackTemp}°C
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Max Cell Imbalance (ΔV)</span>
            <p className={`text-2xl font-black font-mono ${currentDeltaV > 0.05 ? 'text-amber-500' : 'text-slate-900 dark:text-white'}`}>
              {currentDeltaV} V
            </p>
          </div>
        </div>

        {/* Embedded 3D Battery Pack Canvas */}
        <BatteryPack3DView
          selectedBatteryId={selectedVehicle.vin}
          operatingTemp={currentPackTemp}
          fastChargingPct={selectedVehicle.riskLevel === 'HIGH' ? 65 : 20}
          hotspotCellIndex={selectedVehicle.riskLevel === 'HIGH' ? 14 : (wsData?.hotspotCellIndex || 3)}
          cellVoltages={wsData?.cellVoltages || null}
        />
      </div>

      {/* 5. Fleet Roster & Route Dispatch Matrix */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B131F] p-6 md:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Truck size={20} className="text-indigo-500" /> Commercial Roster & Route Duty Dispatch Matrix
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Click any vehicle row to inspect its 3D battery module, cell imbalance, and thermal status.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            {[
              { id: 'ALL', label: 'All Fleet' },
              { id: 'LONG_HAUL', label: 'Highway Ready (≥92% SOH)' },
              { id: 'HIGH_RISK', label: 'High Risk Alert' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  activeFilter === tab.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Roster Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-black uppercase text-[10px] tracking-wider">
                <th className="py-4 px-4">Vehicle / VIN</th>
                <th className="py-4 px-4">Chemistry</th>
                <th className="py-4 px-4">SOH (%)</th>
                <th className="py-4 px-4">RUL (Cycles)</th>
                <th className="py-4 px-4">SOC / Pack Temp</th>
                <th className="py-4 px-4">Cell ΔV</th>
                <th className="py-4 px-4">Operational Status</th>
                <th className="py-4 px-4">Health Assessment</th>
                <th className="py-4 px-4">AI Recommended Duty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredVehicles.map((v) => {
                const isSelected = v.vin === selectedVin;
                return (
                  <tr
                    key={v.vin}
                    onClick={() => setSelectedVin(v.vin)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-emerald-500/10 dark:bg-emerald-500/15 font-bold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-900/40'
                    }`}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {isSelected && <ChevronRight size={14} className="text-emerald-500 animate-pulse" />}
                        <div>
                          <p className="font-extrabold text-slate-900 dark:text-white text-sm">{v.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{v.vin}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-700 dark:text-slate-300">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px]">
                        {v.chemistry}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-black text-slate-900 dark:text-white text-base font-mono">
                        {v.soh}%
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-cyan-400 font-bold">{v.rulCycles}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-xs">
                        <Battery size={14} className="text-slate-400" />
                        <span className="font-bold text-slate-900 dark:text-white">{isSelected ? currentSoc : v.currentSoc}%</span>
                        <span className="text-slate-400">|</span>
                        <span className={(isSelected ? currentPackTemp : v.packTempC) > 38 ? 'text-rose-500 font-bold' : 'text-slate-400'}>
                          {isSelected ? currentPackTemp : v.packTempC}°C
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {isSelected ? currentDeltaV : v.deltaV} V
                    </td>
                    <td className="py-4 px-4">{getStatusBadge(v.status)}</td>
                    <td className="py-4 px-4">{getRiskBadge(v.riskLevel)}</td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-[11px] inline-block shadow-sm">
                        {v.recommendedDuty}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
