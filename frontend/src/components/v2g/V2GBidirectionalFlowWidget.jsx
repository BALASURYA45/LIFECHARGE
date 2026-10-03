import React, { useState, useEffect } from 'react';
import {
  Zap,
  BatteryCharging,
  Home,
  Sun,
  ShieldCheck,
  ArrowRightLeft,
  Activity,
  CheckCircle2,
  Sliders,
} from 'lucide-react';

export default function V2GBidirectionalFlowWidget({
  dischargeKwh = 25,
  peakTariff = 0.38,
  offPeakTariff = 0.12,
  batteryCapacity = 75,
  currentSoc = 78,
}) {
  const [flowMode, setFlowMode] = useState('v2g'); // 'v2g' (EV -> Grid) | 'charging' (Grid -> EV) | 'v2h' (EV -> Home)
  const [powerKw, setPowerKw] = useState(11.5);
  const [inverterEfficiency, setInverterEfficiency] = useState(96.5);

  // Auto toggle particle animation direction
  const isDischarging = flowMode === 'v2g' || flowMode === 'v2h';

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 text-white shadow-2xl space-y-6 relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />

      {/* Top Header & Mode Pills */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 mb-1">
            <ArrowRightLeft size={14} className="animate-pulse" />
            ISO 15118-20 Bi-Directional Power Flow
          </div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            Real-Time Power Transfer & Inverter Topology
          </h2>
          <p className="text-xs text-slate-400">
            Interactive node graph showing DC/AC bi-directional conversion between EV Battery, Inverter, Building, and Utility Grid.
          </p>
        </div>

        {/* Flow Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 shrink-0">
          {[
            { id: 'v2g', label: 'EV ➔ Grid (V2G Peak)', color: 'bg-amber-500 text-white' },
            { id: 'charging', label: 'Grid ➔ EV (Off-Peak)', color: 'bg-emerald-500 text-white' },
            { id: 'v2h', label: 'EV ➔ Home (V2H Backup)', color: 'bg-cyan-500 text-white' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setFlowMode(mode.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                flowMode === mode.id
                  ? `${mode.color} shadow-lg`
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Animated Bi-Directional Node Topology */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-4 items-center py-4">
        {/* Node 1: EV Battery Pack */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 relative group hover:border-amber-500/50 transition">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-black uppercase text-slate-400 flex items-center gap-1.5">
              <BatteryCharging size={16} className="text-amber-400" /> EV Battery Pack
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-mono font-bold">
              {currentSoc}% SoC
            </span>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Pack Voltage:</span>
              <span className="text-white font-bold">380 V DC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Discharge Power:</span>
              <span className="text-amber-400 font-bold">{powerKw} kW</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Capacity:</span>
              <span className="text-cyan-400 font-bold">{batteryCapacity} kWh</span>
            </div>
          </div>
        </div>

        {/* Animated Connector Beam 1 */}
        <div className="hidden md:flex flex-col items-center justify-center space-y-2">
          <span className="text-[10px] font-mono text-amber-400 font-bold flex items-center gap-1">
            <Zap size={12} className="animate-bounce" /> {powerKw} kW DC
          </span>
          <div className="w-full h-1.5 bg-slate-800 rounded-full relative overflow-hidden">
            <div
              className={`absolute top-0 bottom-0 w-1/3 rounded-full ${
                isDischarging
                  ? 'bg-gradient-to-r from-amber-500 to-emerald-400 animate-pulse left-0'
                  : 'bg-gradient-to-r from-emerald-400 to-amber-500 animate-pulse right-0'
              }`}
              style={{
                animationDuration: '1s',
              }}
            />
          </div>
          <span className="text-[9px] text-slate-500">Bi-Directional DC Bus</span>
        </div>

        {/* Node 2: Smart Bi-Directional Inverter */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 relative group hover:border-emerald-500/50 transition">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-black uppercase text-slate-400 flex items-center gap-1.5">
              <Zap size={16} className="text-emerald-400" /> Smart Inverter
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
              {inverterEfficiency}% Eff
            </span>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Topology:</span>
              <span className="text-white font-bold">SiC MOSFET</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">AC Output:</span>
              <span className="text-emerald-400 font-bold">240 V AC / 3-Ph</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Loss:</span>
              <span className="text-slate-400">{(powerKw * (1 - inverterEfficiency / 100)).toFixed(2)} kW thermal</span>
            </div>
          </div>
        </div>

        {/* Node 3: Grid / Building Destination */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 relative group hover:border-cyan-500/50 transition">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-black uppercase text-slate-400 flex items-center gap-1.5">
              {flowMode === 'v2h' ? <Home size={16} className="text-cyan-400" /> : <Sun size={16} className="text-amber-400" />}
              {flowMode === 'v2h' ? 'Building Load (V2H)' : 'Power Grid Utility'}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-mono font-bold">
              50/60 Hz
            </span>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Current Tariff:</span>
              <span className={`font-bold ${isDischarging ? 'text-amber-400' : 'text-emerald-400'}`}>
                ${isDischarging ? peakTariff : offPeakTariff}/kWh
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Revenue Flow:</span>
              <span className="text-emerald-400 font-bold">
                +${(powerKw * (isDischarging ? peakTariff : offPeakTariff)).toFixed(2)} / hr
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Grid Response:</span>
              <span className="text-cyan-400 font-bold">Frequency Regulation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
