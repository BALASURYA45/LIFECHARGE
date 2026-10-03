import React, { useState } from 'react';
import { X, Zap, Thermometer, Clock, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function SmartChargingAdvisorModal({ isOpen, onClose }) {
  const [currentSoc, setCurrentSoc] = useState(28);
  const [targetSoc, setTargetSoc] = useState(80);
  const [ambientTempC, setAmbientTempC] = useState(32);
  const [departureInHours, setDepartureInHours] = useState(8);

  if (!isOpen) return null;

  // Calculate dynamic recommendations
  const energyNeededKwh = ((targetSoc - currentSoc) / 100) * 75.0;
  const avgKwNeeded = energyNeededKwh / Math.max(0.5, departureInHours);

  let maxKw = Math.min(150, Math.max(11, Math.round(avgKwNeeded * 1.25)));
  let preconditioning = 'NONE';
  let adviceMessage = 'Optimal ambient conditions for balanced trickle charging.';

  if (ambientTempC > 34) {
    preconditioning = 'PRE_COOLING_REQUIRED';
    maxKw = Math.min(maxKw, 50);
    adviceMessage = 'High ambient temperature! Active HVAC pre-cooling will reduce pack temp to 25°C before charging to mitigate thermal degradation.';
  } else if (ambientTempC < 5) {
    preconditioning = 'PRE_HEATING_REQUIRED';
    maxKw = Math.min(maxKw, 30);
    adviceMessage = 'Freezing temperature! PTC pre-heating to 15°C is required to prevent destructive lithium plating.';
  }

  const cycleGain = Math.round((150 - maxKw) * 1.6);
  const wearReduction = Math.min(42, Math.round((1 - maxKw / 150) * 38));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#0B131F] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-400">
              <Zap size={22} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Smart Charging & Climate Advisor</h3>
              <p className="text-xs text-slate-500 font-medium">Prescriptive charging parameters to maximize battery longevity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Interactive Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Target SOC slider */}
          <div className="space-y-2 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center text-xs font-bold text-slate-600 dark:text-slate-300">
              <span>Target SOC</span>
              <span className="text-teal-400 font-mono text-sm">{targetSoc}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              value={targetSoc}
              onChange={(e) => setTargetSoc(Number(e.target.value))}
              className="w-full accent-teal-500"
            />
            <p className="text-[10px] text-slate-400">80% limit recommended for daily driving</p>
          </div>

          {/* Ambient Temp slider */}
          <div className="space-y-2 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center text-xs font-bold text-slate-600 dark:text-slate-300">
              <span>Ambient Temp</span>
              <span className="text-amber-500 font-mono text-sm">{ambientTempC}°C</span>
            </div>
            <input
              type="range"
              min="-10"
              max="45"
              value={ambientTempC}
              onChange={(e) => setAmbientTempC(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
            <p className="text-[10px] text-slate-400">Triggers pre-cooling / heating HVAC</p>
          </div>

          {/* Departure Hours slider */}
          <div className="space-y-2 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center text-xs font-bold text-slate-600 dark:text-slate-300">
              <span>Departure Window</span>
              <span className="text-cyan-400 font-mono text-sm">{departureInHours} hours</span>
            </div>
            <input
              type="range"
              min="1"
              max="14"
              value={departureInHours}
              onChange={(e) => setDepartureInHours(Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
            <p className="text-[10px] text-slate-400">Slower charging = longer battery life</p>
          </div>
        </div>

        {/* AI Prescriptive Results */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-start gap-3">
            {preconditioning !== 'NONE' ? <AlertTriangle size={20} className="shrink-0 text-amber-400 mt-0.5" /> : <CheckCircle2 size={20} className="shrink-0 text-teal-400 mt-0.5" />}
            <div className="text-xs space-y-1">
              <p className="font-bold text-slate-900 dark:text-white">AI Prescriptive Advice</p>
              <p className="text-slate-300">{adviceMessage}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-400 font-bold">RECOMMENDED MAX CHARGE RATE</p>
              <p className="text-3xl font-black text-teal-400 font-mono mt-1">{maxKw} <span className="text-sm font-normal text-slate-400">kW</span></p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-400 font-bold">ESTIMATED LIFESPAN GAIN</p>
              <p className="text-3xl font-black text-emerald-400 font-mono mt-1">+{cycleGain} <span className="text-sm font-normal text-slate-400">cycles</span></p>
              <p className="text-[10px] font-bold text-emerald-400">{wearReduction}% lower degradation</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-sm transition-all shadow-lg flex items-center justify-center gap-2"
        >
          <ShieldCheck size={18} /> Apply Prescriptive Charging Profile
        </button>
      </div>
    </div>
  );
}
