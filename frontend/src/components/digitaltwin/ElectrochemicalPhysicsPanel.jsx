import React, { useState } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from 'recharts';
import {
  Flame,
  Zap,
  Activity,
  ShieldAlert,
  Sliders,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function ElectrochemicalPhysicsPanel({
  cycleSimCount = 185,
  operatingTemp = 28,
  fastChargingPct = 25,
}) {
  const [activeSubTab, setActiveSubTab] = useState('sei');

  // Calculate dynamic physics outputs
  const seiThicknessNm = Number((15 + cycleSimCount * 0.08 + (fastChargingPct > 30 ? (fastChargingPct - 30) * 0.15 : 0) + (operatingTemp > 35 ? (operatingTemp - 35) * 0.4 : 0)).toFixed(1));
  const platingRiskPct = Math.min(98, Math.max(5, Math.round((fastChargingPct * 0.8) + (operatingTemp < 20 ? (20 - operatingTemp) * 3.5 : 0) + (cycleSimCount > 400 ? (cycleSimCount - 400) * 0.05 : 0))));
  const lliRatio = Number((65 + (cycleSimCount / 800) * 15).toFixed(1));
  const lamRatio = Number((100 - lliRatio).toFixed(1));

  // SEI Layer Growth Data over cycles
  const seiGrowthData = [
    { cycle: 0, seiThickness: 5.0, platingRisk: 2 },
    { cycle: 100, seiThickness: Number((5 + 100 * 0.07).toFixed(1)), platingRisk: Math.round(platingRiskPct * 0.3) },
    { cycle: 250, seiThickness: Number((5 + 250 * 0.075).toFixed(1)), platingRisk: Math.round(platingRiskPct * 0.6) },
    { cycle: 500, seiThickness: Number((5 + 500 * 0.082).toFixed(1)), platingRisk: Math.round(platingRiskPct * 0.85) },
    { cycle: 800, seiThickness: Number((5 + 800 * 0.095).toFixed(1)), platingRisk: Math.min(99, platingRiskPct + 15) },
  ];

  // LLI vs LAM Mechanism Breakdown Data
  const degradationMechanismData = [
    { cycle: 0, lli: 0, lam: 0, totalLoss: 0 },
    { cycle: 200, lli: 3.2, lam: 1.1, totalLoss: 4.3 },
    { cycle: 400, lli: 6.8, lam: 2.9, totalLoss: 9.7 },
    { cycle: 600, lli: 11.2, lam: 5.4, totalLoss: 16.6 },
    { cycle: 800, lli: 16.5, lam: 8.8, totalLoss: 25.3 },
  ];

  // EIS Nyquist Plot Simulation (Z_real vs -Z_imag)
  const nyquistFresh = [
    { zReal: 12, zImag: 0 },
    { zReal: 15, zImag: 4 },
    { zReal: 20, zImag: 6 },
    { zReal: 25, zImag: 4 },
    { zReal: 28, zImag: 0 },
    { zReal: 34, zImag: 6 },
    { zReal: 42, zImag: 15 },
  ];

  const nyquistCurrent = [
    { zReal: 18, zImag: 0 },
    { zReal: 23, zImag: 8 },
    { zReal: 32, zImag: 11 },
    { zReal: 41, zImag: 8 },
    { zReal: 46, zImag: 0 },
    { zReal: 56, zImag: 10 },
    { zReal: 70, zImag: 24 },
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xl space-y-6">
      {/* Header & Subtabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-1">
            <Layers size={14} />
            Physics-Informed Digital Twin Mechanics
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            Electrochemical Degradation & EIS Analysis
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Solid Electrolyte Interphase (SEI) growth, Lithium Plating hazard, LLI vs LAM degradation breakdown, and EIS Nyquist spectroscopy.
          </p>
        </div>

        {/* Navigation Sub-Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 shrink-0">
          {[
            { id: 'sei', label: '1. SEI & Plating Risk' },
            { id: 'mechanisms', label: '2. LLI vs LAM Breakdown' },
            { id: 'eis', label: '3. EIS Nyquist Plot' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeSubTab === tab.id
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Physics KPI Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
          <div className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400">SEI Layer Thickness</div>
          <div className="text-2xl font-mono font-black text-amber-600 dark:text-amber-400 mt-1">{seiThicknessNm} nm</div>
          <div className="text-[10px] text-slate-500 mt-1">Solvent decomposition growth</div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
          <div className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400">Lithium Plating Hazard</div>
          <div className="text-2xl font-mono font-black text-amber-600 dark:text-amber-400 mt-1">{platingRiskPct}%</div>
          <div className="text-[10px] text-slate-500 mt-1">Anode Li/Li⁺ overpotential risk</div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
          <div className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400">Loss of Li Inventory (LLI)</div>
          <div className="text-2xl font-mono font-black text-amber-600 dark:text-amber-400 mt-1">{lliRatio}%</div>
          <div className="text-[10px] text-slate-500 mt-1">Dominant capacity loss vector</div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
          <div className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400">Active Material Loss (LAM)</div>
          <div className="text-2xl font-mono font-black text-amber-600 dark:text-amber-400 mt-1">{lamRatio}%</div>
          <div className="text-[10px] text-slate-500 mt-1">Electrode particle cracking</div>
        </div>
      </div>

      {/* Subtab 1: SEI Layer & Lithium Plating */}
      {activeSubTab === 'sei' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="text-amber-500" size={16} /> Solid Electrolyte Interphase (SEI) Growth & Plating Hazard vs Cycle Count
            </h3>
            <span className="text-xs font-mono text-slate-500">Rate: +0.08 nm / cycle</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={seiGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="cycle" stroke="#94a3b8" />
                <YAxis yAxisId="left" stroke="#f59e0b" label={{ value: 'SEI Thickness (nm)', angle: -90, position: 'insideLeft', fill: '#f59e0b', fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#ef4444" domain={[0, 100]} label={{ value: 'Plating Risk (%)', angle: 90, position: 'insideRight', fill: '#ef4444', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="seiThickness" stroke="#f59e0b" strokeWidth={3} name="SEI Thickness (nm)" />
                <Line yAxisId="right" type="monotone" dataKey="platingRisk" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" name="Lithium Plating Hazard (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Subtab 2: LLI vs LAM Degradation Mechanisms */}
      {activeSubTab === 'mechanisms' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="text-amber-500" size={16} /> Loss of Lithium Inventory (LLI) vs Loss of Active Material (LAM)
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={degradationMechanismData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="cycle" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                <Legend />
                <Area type="monotone" dataKey="lli" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="Loss of Lithium Inventory (LLI %)" />
                <Area type="monotone" dataKey="lam" stackId="1" stroke="#a855f7" fill="#a855f7" fillOpacity={0.6} name="Loss of Active Material (LAM %)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Subtab 3: EIS Nyquist Plot */}
      {activeSubTab === 'eis' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="text-amber-500" size={16} /> Electrochemical Impedance Spectroscopy (EIS) Nyquist Diagram
            </h3>
            <span className="text-xs text-slate-500">Z_real vs -Z_imaginary (mΩ)</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis type="number" dataKey="zReal" name="Z_real" unit="mΩ" stroke="#94a3b8" domain={[0, 80]} />
                <YAxis type="number" dataKey="zImag" name="-Z_imag" unit="mΩ" stroke="#94a3b8" domain={[0, 30]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                <Legend />
                <Scatter name="Fresh Pack (Cycle 0)" data={nyquistFresh} fill="#10b981" line lineType="joint" />
                <Scatter name={`Current Twin (Cycle ${cycleSimCount})`} data={nyquistCurrent} fill="#f59e0b" line lineType="joint" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
