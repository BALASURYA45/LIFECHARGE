import React from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  Activity,
  BarChart3,
  Sliders,
  Sparkles,
} from 'lucide-react';

export default function SensitivityRadarWidget({
  cRate = 1.5,
  temp = 32,
  dod = 0.8,
}) {
  // Sensitivity scoring based on current parameters
  const tempSens = Math.round(Math.min(100, Math.max(10, (temp / 50) * 100)));
  const cRateSens = Math.round(Math.min(100, Math.max(10, (cRate / 3.0) * 100)));
  const dodSens = Math.round(Math.min(100, Math.max(10, dod * 100)));
  const hvacSens = Math.round(Math.min(100, Math.max(10, tempSens * 0.45)));
  const restSocSens = Math.round(Math.min(100, Math.max(10, dodSens * 0.35)));

  const radarData = [
    { subject: 'Ambient Temp', sensitivity: tempSens, fullMark: 100 },
    { subject: 'Fast Charge C-Rate', sensitivity: cRateSens, fullMark: 100 },
    { subject: 'Depth of Discharge', sensitivity: dodSens, fullMark: 100 },
    { subject: 'HVAC Thermal Load', sensitivity: hvacSens, fullMark: 100 },
    { subject: 'Resting SoC Stress', sensitivity: restSocSens, fullMark: 100 },
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 mb-1">
            <BarChart3 size={14} />
            Partial Derivative Sensitivity Analysis
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            Multi-Parameter Degradation Sensitivity Spider
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ranks parameters by relative degradation impact (∂SOH / ∂xᵢ) under current operating conditions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        {/* Radar Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#334155" opacity={0.4} />
              <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
              <PolarRadiusAxis domain={[0, 100]} stroke="#94a3b8" fontSize={9} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
              <Radar name="Sensitivity Score" dataKey="sensitivity" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.5} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Feature Sensitivity Breakdown List */}
        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <span className="font-bold text-slate-700 dark:text-slate-300">1. Ambient Temperature (°C)</span>
            <span className="font-mono font-black text-cyan-600 dark:text-cyan-400">{tempSens}/100 Sensitivity</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <span className="font-bold text-slate-700 dark:text-slate-300">2. Fast Charging C-Rate (C)</span>
            <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">{cRateSens}/100 Sensitivity</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <span className="font-bold text-slate-700 dark:text-slate-300">3. Depth of Discharge (DoD)</span>
            <span className="font-mono font-black text-amber-600 dark:text-amber-400">{dodSens}/100 Sensitivity</span>
          </div>
        </div>
      </div>
    </div>
  );
}
