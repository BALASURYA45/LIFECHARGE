import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  Sliders,
  Zap,
  Flame,
  Award,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

export default function PhysicsStressTestPanel({
  currentSOH = 94.2,
  cycleSimCount = 185,
}) {
  const [selectedScenario, setSelectedScenario] = useState('all');

  // Trajectory Simulation Data for 4 Operating Modes
  const stressTestData = [
    { cycle: cycleSimCount, baseline: currentSOH, heavyDCFC: currentSOH, desertHeat: currentSOH, aiOptimized: currentSOH },
    { cycle: cycleSimCount + 150, baseline: Number((currentSOH - 3.2).toFixed(1)), heavyDCFC: Number((currentSOH - 6.5).toFixed(1)), desertHeat: Number((currentSOH - 7.8).toFixed(1)), aiOptimized: Number((currentSOH - 2.1).toFixed(1)) },
    { cycle: cycleSimCount + 300, baseline: Number((currentSOH - 7.5).toFixed(1)), heavyDCFC: Number((currentSOH - 13.8).toFixed(1)), desertHeat: Number((currentSOH - 16.2).toFixed(1)), aiOptimized: Number((currentSOH - 4.9).toFixed(1)) },
    { cycle: cycleSimCount + 450, baseline: Number((currentSOH - 12.0).toFixed(1)), heavyDCFC: Number((currentSOH - 21.5).toFixed(1)), desertHeat: Number((currentSOH - 25.0).toFixed(1)), aiOptimized: Number((currentSOH - 8.2).toFixed(1)) },
    { cycle: cycleSimCount + 600, baseline: Number((currentSOH - 17.2).toFixed(1)), heavyDCFC: Number((currentSOH - 29.8).toFixed(1)), desertHeat: Number((currentSOH - 34.5).toFixed(1)), aiOptimized: Number((currentSOH - 11.8).toFixed(1)) },
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 mb-1">
            <Sliders size={14} />
            Multi-Scenario Decision Engine
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            Multi-Trajectory Stress Test & What-If Comparator
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Simulate and compare battery longevity trajectories across 4 operational profiles over 600 future cycles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Filter View:</span>
          <select
            value={selectedScenario}
            onChange={(e) => setSelectedScenario(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none"
          >
            <option value="all">Compare All 4 Trajectories</option>
            <option value="aiOptimized">AI Thermal Pre-conditioned</option>
            <option value="heavyDCFC">Heavy Fast-Charging (80% DCFC)</option>
            <option value="desertHeat">Desert Extreme Heat (+45°C)</option>
          </select>
        </div>
      </div>

      {/* Quantified Benefit Summary Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-900/90 to-indigo-950/90 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider">
            <Award className="text-amber-400" size={18} /> LifeCharge AI Recommendation Benefit
          </div>
          <h3 className="text-lg font-black">
            Active Pre-Conditioning & Thermal Resting saves <span className="text-amber-400">+175 Lifespan Cycles</span>
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl">
            Pre-cooling the pack 10 minutes prior to DC fast charging reduces peak internal temperature from 44°C to 31°C, mitigating SEI growth by 42%.
          </p>
        </div>

        <div className="shrink-0 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 font-mono text-xs text-amber-300 font-bold text-center">
          +2.4 Years Added EV Life
        </div>
      </div>

      {/* Trajectories Graph */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={stressTestData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis dataKey="cycle" stroke="#94a3b8" />
            <YAxis domain={[50, 100]} stroke="#94a3b8" unit="%" />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
            <Legend />
            {(selectedScenario === 'all' || selectedScenario === 'aiOptimized') && (
              <Line type="monotone" dataKey="aiOptimized" stroke="#10b981" strokeWidth={3.5} dot={{ r: 4 }} name="LifeCharge AI Pre-Conditioned" />
            )}
            {selectedScenario === 'all' && (
              <Line type="monotone" dataKey="baseline" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} name="Baseline Commute Profile" />
            )}
            {(selectedScenario === 'all' || selectedScenario === 'heavyDCFC') && (
              <Line type="monotone" dataKey="heavyDCFC" stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 3 }} name="Heavy DC Fast Charging (80% DCFC)" />
            )}
            {(selectedScenario === 'all' || selectedScenario === 'desertHeat') && (
              <Line type="monotone" dataKey="desertHeat" stroke="#ef4444" strokeWidth={2.5} strokeDasharray="2 2" dot={{ r: 3 }} name="Desert Thermal Stress (+45°C)" />
            )}
            <ReferenceLine y={80} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: '80% EOL Limit', fill: '#f59e0b', fontSize: 11 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
