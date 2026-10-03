import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Flame,
  Snowflake,
  Sun,
  Award,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function CounterfactualAdvisorPanel({
  cRate = 1.5,
  temp = 32,
  dod = 0.8,
  onApplyCounterfactual = null,
  onApplyClimatePreset = null,
}) {
  // Compute minimum counterfactual recourse action
  const recCRate = Math.min(1.0, cRate);
  const recTemp = Math.min(25, temp);
  const recDod = Math.min(0.7, dod);

  const sohSavedEst = Number(((temp > 25 ? (temp - 25) * 0.28 : 0) + (cRate > 1.0 ? (cRate - 1.0) * 2.8 : 0)).toFixed(1));

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-1">
            <Sparkles size={14} />
            AI Counterfactual Recourse Engine
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            Minimal Recourse Actions & Climate Stress Testing
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Calculates minimal parameter modifications required to prevent accelerated SEI growth and extend lifecycle SOH.
          </p>
        </div>
      </div>

      {/* Recourse Advice Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 text-slate-900 dark:text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            <Award size={18} /> Optimal Counterfactual Action
          </div>
          <h3 className="text-lg font-black">
            Reduce C-Rate to {recCRate}C and keep pre-charge temp at {recTemp}°C
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Applying this minimal recourse action preserves <strong className="text-emerald-600 dark:text-emerald-400 font-mono">+{sohSavedEst}% SOH</strong> at 800 cycles.
          </p>
        </div>

        {onApplyCounterfactual && (
          <button
            onClick={() => onApplyCounterfactual({ cRate: recCRate, temp: recTemp, dod: recDod })}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-xs font-bold text-white transition shadow-md shrink-0 flex items-center gap-1.5"
          >
            <Sparkles size={14} /> Apply Counterfactual Fix
          </button>
        )}
      </div>

      {/* Extreme Climate Stress Test Presets */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
          Extreme Climate & Operational Stress Test Scenarios:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => onApplyClimatePreset && onApplyClimatePreset({ name: 'Phoenix Desert Heatwave', cRate: 2.2, temp: 48, dod: 0.9 })}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-left hover:border-amber-500 transition group space-y-1"
          >
            <div className="flex items-center justify-between">
              <Sun className="text-amber-500" size={18} />
              <span className="text-[10px] font-bold text-amber-500 font-mono">48°C Heatwave</span>
            </div>
            <span className="font-bold text-xs text-slate-900 dark:text-white block group-hover:text-amber-500 transition">Phoenix Desert Heat</span>
            <span className="text-[10px] text-slate-500 block">Accelerated Arrhenius thermal degradation</span>
          </button>

          <button
            onClick={() => onApplyClimatePreset && onApplyClimatePreset({ name: 'Nordic Sub-Zero Arctic', cRate: 1.2, temp: -15, dod: 0.85 })}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-left hover:border-cyan-500 transition group space-y-1"
          >
            <div className="flex items-center justify-between">
              <Snowflake className="text-cyan-500" size={18} />
              <span className="text-[10px] font-bold text-cyan-500 font-mono">-15°C Sub-Zero</span>
            </div>
            <span className="font-bold text-xs text-slate-900 dark:text-white block group-hover:text-cyan-500 transition">Nordic Sub-Zero Cold</span>
            <span className="text-[10px] text-slate-500 block">Lithium plating hazard overpotential</span>
          </button>

          <button
            onClick={() => onApplyClimatePreset && onApplyClimatePreset({ name: 'Urban Delivery Stop-and-Go', cRate: 1.8, temp: 34, dod: 0.95 })}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-left hover:border-purple-500 transition group space-y-1"
          >
            <div className="flex items-center justify-between">
              <Zap className="text-purple-500" size={18} />
              <span className="text-[10px] font-bold text-purple-500 font-mono">95% DoD Cycle</span>
            </div>
            <span className="font-bold text-xs text-slate-900 dark:text-white block group-hover:text-purple-500 transition">Urban Delivery Taxi</span>
            <span className="text-[10px] text-slate-500 block">High depth-of-discharge throughput</span>
          </button>

          <button
            onClick={() => onApplyClimatePreset && onApplyClimatePreset({ name: 'Eco Cruise Mild Care', cRate: 0.5, temp: 22, dod: 0.6 })}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-left hover:border-emerald-500 transition group space-y-1"
          >
            <div className="flex items-center justify-between">
              <ShieldCheck className="text-emerald-500" size={18} />
              <span className="text-[10px] font-bold text-emerald-500 font-mono">0.5C Mild</span>
            </div>
            <span className="font-bold text-xs text-slate-900 dark:text-white block group-hover:text-emerald-500 transition">Eco Mild Cycling</span>
            <span className="text-[10px] text-slate-500 block">Maximized battery longevity mode</span>
          </button>
        </div>
      </div>
    </div>
  );
}
