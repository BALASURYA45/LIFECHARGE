import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, BarChart2, Cpu, Download, RefreshCw, Sliders, Zap } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function HealthIndicatorsPage() {
  const { t } = useTranslation();
  const [chemistry, setChemistry] = useState('NMC');
  const [cRate, setCRate] = useState(1.0);
  const [tempC, setTempC] = useState(25);
  const [dod, setDod] = useState(0.8);
  const [loading, setLoading] = useState(false);

  // Sample IC (dQ/dV) curve comparison data (Fresh Cycle 1 vs Degraded Cycle 500)
  const icData = [
    { voltage: 3.4, dQdV_fresh: 0.15, dQdV_aged: 0.08 },
    { voltage: 3.5, dQdV_fresh: 0.35, dQdV_aged: 0.20 },
    { voltage: 3.6, dQdV_fresh: 0.85, dQdV_aged: 0.45 },
    { voltage: 3.7, dQdV_fresh: 1.85, dQdV_aged: 1.05 },
    { voltage: 3.75, dQdV_fresh: 2.50, dQdV_aged: 1.40 }, // Fresh Peak 1
    { voltage: 3.8, dQdV_fresh: 2.10, dQdV_aged: 1.75 }, // Aged Peak Shifted (voltage shift ΔV)
    { voltage: 3.9, dQdV_fresh: 1.15, dQdV_aged: 0.75 },
    { voltage: 4.0, dQdV_fresh: 1.95, dQdV_aged: 1.20 }, // Peak 2
    { voltage: 4.1, dQdV_fresh: 0.95, dQdV_aged: 0.50 },
    { voltage: 4.2, dQdV_fresh: 0.20, dQdV_aged: 0.10 },
  ];

  // Sample DV (dV/dQ) curve comparison data (Fresh Cycle 1 vs Degraded Cycle 500)
  const dvData = [
    { capacity: 0.1, dVdQ_fresh: 0.75, dVdQ_aged: 0.95 },
    { capacity: 0.3, dVdQ_fresh: 0.35, dVdQ_aged: 0.52 },
    { capacity: 0.5, dVdQ_fresh: 0.18, dVdQ_aged: 0.38 }, // Inflection 1 shift
    { capacity: 0.7, dVdQ_fresh: 0.52, dVdQ_aged: 0.78 },
    { capacity: 0.9, dVdQ_fresh: 1.05, dVdQ_aged: 1.45 }, // Inflection 2
    { capacity: 1.1, dVdQ_fresh: 0.28, dVdQ_aged: 0.48 },
    { capacity: 1.3, dVdQ_fresh: 0.65, dVdQ_aged: 0.92 },
  ];

  const hiFeatures = [
    { feature: 'IC Peak 1 Voltage (V)', value: '3.75 V → 3.80 V', impact: 'SEI Layer Thickness Growth (+0.05V Shift)', status: t('healthIndicators.statusOptimal', 'Optimal') },
    { feature: 'IC Peak 1 Height (Ah/V)', value: '2.50 → 1.40 Ah/V', impact: 'Active Lithium Loss (LAM) (-44% Fade)', status: t('healthIndicators.statusModerateFade', 'Moderate Fade') },
    { feature: 'IC Peak 2 Voltage (V)', value: '4.00 V → 4.03 V', impact: 'Cathode Structural Degradation', status: t('healthIndicators.statusOptimal', 'Optimal') },
    { feature: 'DV Inflection 1 (Ah)', value: '0.50 Ah → 0.42 Ah', impact: 'Anode Phase Transition Shift', status: t('healthIndicators.statusNormal', 'Normal') },
    { feature: 'CC Phase Duration', value: '42.5 min → 31.8 min', impact: 'Main Charging Speed Decrease', status: t('healthIndicators.statusGood', 'Good') },
    { feature: 'CV Phase Duration', value: '18.2 min → 28.6 min', impact: 'Polarization Resistance Growth (+57%)', status: t('healthIndicators.statusSlightGrowth', 'Slight Growth') },
    { feature: 'CC-CV Transition Ratio', value: '0.70 → 0.52', impact: 'Internal Resistance Score Increase', status: t('healthIndicators.statusStable', 'Stable') },
  ];

  function handleExtract() {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 600);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1 text-xs font-bold text-teal-400 mb-2">
            <Activity size={14} /> {t('healthIndicators.badge', 'MODULE 2 — HEALTH INDICATOR EXTRACTION')}
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            {t('healthIndicators.title', 'Partial-Charging Health Indicators')}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            {t('healthIndicators.subtitle', 'Extract degradation-sensitive features from partial charging voltage, current, and capacity profiles.')}
          </p>
        </div>

        <button
          onClick={handleExtract}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white px-5 py-3 text-sm font-bold shadow-md transition disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          {loading ? t('healthIndicators.extracting', 'Extracting HI...') : t('healthIndicators.reextract', 'Re-extract HI Vector')}
        </button>
      </div>

      {/* Control Panel */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B131F] p-6 space-y-4 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sliders size={18} className="text-teal-400" /> {t('healthIndicators.protocolParams', 'Charging Protocol Parameters')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold">
          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1">{t('healthIndicators.batteryChemistry', 'Battery Chemistry')}</label>
            <select
              value={chemistry}
              onChange={(e) => setChemistry(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white font-bold"
            >
              <option value="NMC">NMC (Nickel Manganese Cobalt)</option>
              <option value="LFP">LFP (Lithium Iron Phosphate)</option>
              <option value="NCA">NCA (Nickel Cobalt Aluminum)</option>
              <option value="LCO">LCO (Lithium Cobalt Oxide)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1">C-Rate ({cRate}C)</label>
            <input
              type="range"
              min="0.2"
              max="3.0"
              step="0.1"
              value={cRate}
              onChange={(e) => setCRate(parseFloat(e.target.value))}
              className="w-full accent-teal-500"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1">Ambient Temperature ({tempC}°C)</label>
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={tempC}
              onChange={(e) => setTempC(parseInt(e.target.value))}
              className="w-full accent-teal-500"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1">Depth of Discharge ({Math.round(dod * 100)}%)</label>
            <input
              type="range"
              min="0.2"
              max="1.0"
              step="0.05"
              value={dod}
              onChange={(e) => setDod(parseFloat(e.target.value))}
              className="w-full accent-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Visual Plot Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incremental Capacity (dQ/dV) */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B131F] p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Incremental Capacity Curve (dQ/dV)</h3>
              <p className="text-xs text-slate-500">Overlaying Fresh Cell (Cycle 1) vs Degraded Cell (Cycle 500) to isolate peak shifts.</p>
            </div>
            <span className="rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-bold px-2 py-1">
              dQ/dV Plot
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={icData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="voltage" stroke="#94a3b8" label={{ value: 'Voltage (V)', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 11 }} />
                <YAxis stroke="#94a3b8" label={{ value: 'dQ/dV (Ah/V)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                <Legend verticalAlign="top" height={30} />
                <Line type="monotone" dataKey="dQdV_fresh" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} name="Fresh Cell (Cycle 1)" />
                <Line type="monotone" dataKey="dQdV_aged" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 4, fill: '#f59e0b' }} name="Degraded Cell (Cycle 500)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Differential Voltage (dV/dQ) */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B131F] p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Differential Voltage Curve (dV/dQ)</h3>
              <p className="text-xs text-slate-500">Overlaying Fresh vs Degraded cycles to observe phase transition peak shifts.</p>
            </div>
            <span className="rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold px-2 py-1">
              dV/dQ Plot
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dvData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="capacity" stroke="#94a3b8" label={{ value: 'Charged Capacity (Ah)', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 11 }} />
                <YAxis stroke="#94a3b8" label={{ value: 'dV/dQ (V/Ah)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                <Legend verticalAlign="top" height={30} />
                <Line type="monotone" dataKey="dVdQ_fresh" stroke="#a855f7" strokeWidth={3} dot={{ r: 4, fill: '#a855f7' }} name="Fresh Cell (Cycle 1)" />
                <Line type="monotone" dataKey="dVdQ_aged" stroke="#38bdf8" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 4, fill: '#38bdf8' }} name="Degraded Cell (Cycle 500)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Extracted Health Indicator Vector */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B131F] p-6 space-y-4 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Extracted Health Indicator (HI) Vector
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Health Indicator Feature</th>
                <th className="p-3">Extracted Value</th>
                <th className="p-3">Physical Degradation Significance</th>
                <th className="p-3">Feature Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {hiFeatures.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{row.feature}</td>
                  <td className="p-3 font-mono text-teal-600 dark:text-teal-400 font-bold">{row.value}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">{row.impact}</td>
                  <td className="p-3">
                    <span className="rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 px-2 py-0.5 font-bold text-[10px]">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
