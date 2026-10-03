import React, { useState } from 'react';
import {
  Users,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Zap,
  Building,
  Leaf,
  BarChart2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function V2GFleetRevenueCalculator({
  singleEvNetProfit = 340,
  batteryCapacity = 75,
}) {
  const [fleetSize, setFleetSize] = useState(15);
  const [includeFrequencyReg, setIncludeFrequencyReg] = useState(true);
  const [includeDemandCharge, setIncludeDemandCharge] = useState(true);

  // Dynamic Fleet Revenue Computations
  const baseArbitrageRev = singleEvNetProfit * fleetSize;
  const frequencyRegRev = includeFrequencyReg ? Math.round(fleetSize * 420) : 0; // ~$420/EV/yr for AGC standby
  const demandChargeSavings = includeDemandCharge ? Math.round(fleetSize * 650) : 0; // ~$650/EV/yr peak demand reduction

  const totalFleetProfitUsd = baseArbitrageRev + frequencyRegRev + demandChargeSavings;
  const totalFleetCapacityMwh = Number(((batteryCapacity * fleetSize) / 1000).toFixed(2));
  const fleetCo2OffsetTonnes = Number((fleetSize * 1.8).toFixed(1));

  // Breakdown bar data for fleet revenue sources
  const fleetRevenueData = [
    { source: 'Tariff Arbitrage', value: baseArbitrageRev },
    { source: 'Frequency Regulation (AGC)', value: frequencyRegRev },
    { source: 'Demand Charge Savings', value: demandChargeSavings },
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 mb-1">
            <Building size={14} />
            Commercial Fleet V2G & Ancillary Services Revenue
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            Multi-EV Fleet Scaling & Grid Ancillary Market Engine
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Scale revenue across commercial corporate/delivery EV fleets with Frequency Regulation (AGC) standby payments and peak demand charge avoidance.
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-right">
          <div className="text-[10px] uppercase font-bold text-purple-700 dark:text-purple-400">Total Fleet Annual Net Profit</div>
          <div className="text-2xl font-mono font-black text-purple-600 dark:text-purple-400">
            ${totalFleetProfitUsd.toLocaleString()} / yr
          </div>
        </div>
      </div>

      {/* Fleet Slider & Ancillary Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-700 dark:text-slate-300">EV Fleet Count:</span>
            <span className="text-purple-600 dark:text-purple-400 font-mono text-sm">{fleetSize} Electric Vehicles</span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            step="1"
            value={fleetSize}
            onChange={(e) => setFleetSize(Number(e.target.value))}
            className="w-full accent-purple-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
          />
          <p className="text-[10px] text-slate-500">Virtual Power Plant (VPP) Aggregate: {totalFleetCapacityMwh} MWh energy storage</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-900 dark:text-white block">Frequency Regulation (AGC)</span>
            <span className="text-[10px] text-slate-500">+$420 / EV standby revenue</span>
          </div>
          <input
            type="checkbox"
            checked={includeFrequencyReg}
            onChange={(e) => setIncludeFrequencyReg(e.target.checked)}
            className="size-5 accent-purple-600 cursor-pointer"
          />
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-900 dark:text-white block">Peak Demand Charge Savings</span>
            <span className="text-[10px] text-slate-500">+$650 / EV building demand reduction</span>
          </div>
          <input
            type="checkbox"
            checked={includeDemandCharge}
            onChange={(e) => setIncludeDemandCharge(e.target.checked)}
            className="size-5 accent-purple-600 cursor-pointer"
          />
        </div>
      </div>

      {/* Revenue Breakdown Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
            Fleet Annual Revenue Sources ($ USD)
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fleetRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="source" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Annual Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sustainability KPI */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-900/90 to-slate-900 border border-purple-800/80 text-white space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <Leaf size={14} /> Virtual Power Plant (VPP) Impact
            </span>
            <div className="text-3xl font-mono font-black text-amber-400">{fleetCo2OffsetTonnes} Tonnes</div>
            <p className="text-xs text-slate-300">
              Net annual CO₂ offset by replacing natural gas peaker plants during evening grid stress.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/10 border border-white/20 text-xs font-mono">
            VPP Energy Storage Capacity: <strong className="text-purple-300">{totalFleetCapacityMwh} MWh</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
