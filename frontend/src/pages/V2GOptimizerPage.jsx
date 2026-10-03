import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Zap,
  DollarSign,
  TrendingUp,
  BatteryCharging,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Sliders,
  CheckCircle2,
  Award,
  ArrowUpRight,
  Info,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { optimizeV2G } from '../services/v2gService.js';
import V2GBidirectionalFlowWidget from '../components/v2g/V2GBidirectionalFlowWidget.jsx';
import V2GMarketHourlyChart from '../components/v2g/V2GMarketHourlyChart.jsx';
import V2GFleetRevenueCalculator from '../components/v2g/V2GFleetRevenueCalculator.jsx';
import V2GDispatchScheduleTable from '../components/v2g/V2GDispatchScheduleTable.jsx';

export default function V2GOptimizerPage() {
  const { t } = useTranslation();

  // Control Inputs State
  const [batteryCapacity, setBatteryCapacity] = useState(75);
  const [peakTariff, setPeakTariff] = useState(0.38);
  const [offPeakTariff, setOffPeakTariff] = useState(0.12);
  const [dailyDischargeKwh, setDailyDischargeKwh] = useState(25);
  const [operatingTemp, setOperatingTemp] = useState(28);
  const [batteryChemistry, setBatteryChemistry] = useState('NMC');

  // Calculated Results State
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchOptimization = async () => {
      setLoading(true);
      const res = await optimizeV2G({
        batteryCapacity,
        peakTariff,
        offPeakTariff,
        dailyDischargeKwh,
        operatingTemp,
        batteryChemistry,
      });
      if (isMounted) {
        setResults(res);
        setLoading(false);
      }
    };
    fetchOptimization();
    return () => { isMounted = false; };
  }, [batteryCapacity, peakTariff, offPeakTariff, dailyDischargeKwh, operatingTemp, batteryChemistry]);

  const financialBarData = results ? [
    { name: 'Gross Arbitrage', value: results.annualGrossArbitrage, fill: '#10b981' },
    { name: 'Degradation Cost', value: results.annualDegradationCost, fill: '#ef4444' },
    { name: 'Net Annual Profit', value: Math.max(0, results.annualNetProfit), fill: '#f59e0b' },
  ] : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full badge-yellow text-xs font-black shadow-md mb-2">
            <Zap size={14} className="fill-current text-slate-950" />
            VEHICLE-TO-GRID FINANCIAL ARBITRAGE & DEGRADATION OPTIMIZER
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            V2G Economic & Grid Optimizer
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
            Calculate grid tariff arbitrage revenue ($/yr) vs battery capacity wear cost ($/yr) to optimize daily V2G discharge limits, power flow, and fleet operations.
          </p>
        </div>
      </div>

      {/* 1. Animated Bi-Directional Power Flow Topology Widget */}
      <V2GBidirectionalFlowWidget
        dischargeKwh={dailyDischargeKwh}
        peakTariff={peakTariff}
        offPeakTariff={offPeakTariff}
        batteryCapacity={batteryCapacity}
        currentSoc={78}
      />

      {/* 2. Control Sliders & Input Parameters Panel */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#0B131F] shadow-lg space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Sliders className="text-amber-500" size={20} />
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
            V2G Economic & Battery Parameters
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pack Capacity */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">Battery Pack Capacity:</span>
              <span className="text-amber-600 dark:text-amber-400 font-mono text-sm">{batteryCapacity} kWh</span>
            </div>
            <input
              type="range"
              min="40"
              max="120"
              step="5"
              value={batteryCapacity}
              onChange={(e) => setBatteryCapacity(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
            />
          </div>

          {/* Peak Tariff */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">Peak Tariff Rate:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">${peakTariff}/kWh</span>
            </div>
            <input
              type="range"
              min="0.20"
              max="0.80"
              step="0.02"
              value={peakTariff}
              onChange={(e) => setPeakTariff(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
            />
          </div>

          {/* Off-Peak Tariff */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">Off-Peak Tariff Rate:</span>
              <span className="text-cyan-600 dark:text-cyan-400 font-mono text-sm">${offPeakTariff}/kWh</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.25"
              step="0.01"
              value={offPeakTariff}
              onChange={(e) => setOffPeakTariff(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
            />
          </div>

          {/* Daily V2G Discharge */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">Daily V2G Discharge:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">{dailyDischargeKwh} kWh/day</span>
            </div>
            <input
              type="range"
              min="5"
              max={Math.round(batteryCapacity * 0.7)}
              step="1"
              value={dailyDischargeKwh}
              onChange={(e) => setDailyDischargeKwh(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
            />
          </div>

          {/* Temperature */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">Operating Temperature:</span>
              <span className="text-purple-600 dark:text-purple-400 font-mono text-sm">{operatingTemp}°C</span>
            </div>
            <input
              type="range"
              min="15"
              max="45"
              step="1"
              value={operatingTemp}
              onChange={(e) => setOperatingTemp(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
            />
          </div>

          {/* Chemistry Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Battery Chemistry:</label>
            <select
              value={batteryChemistry}
              onChange={(e) => setBatteryChemistry(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none focus:border-amber-500"
            >
              <option value="NMC">NMC (Nickel Manganese Cobalt)</option>
              <option value="LFP">LFP (Lithium Iron Phosphate - High Durability)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Metrics Summary Cards */}
      {results && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 text-slate-900 dark:text-white shadow-sm space-y-1">
              <div className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">Net Annual V2G Profit</div>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">${results.annualNetProfit} <span className="text-xs text-slate-500 font-normal">/ yr</span></div>
              <div className="text-[10px] text-slate-500 mt-1">Arbitrage Revenue minus Degradation</div>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#0B131F] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-sm space-y-1">
              <div className="text-[10px] font-black uppercase text-slate-500">Gross Arbitrage Revenue</div>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">${results.annualGrossArbitrage}</div>
              <div className="text-[10px] text-slate-500 mt-1">From Grid Tariff Spread (${(peakTariff - offPeakTariff).toFixed(2)}/kWh)</div>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#0B131F] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-sm space-y-1">
              <div className="text-[10px] font-black uppercase text-slate-500">Battery Degradation Cost</div>
              <div className="text-3xl font-black text-rose-500 mt-1">${results.annualDegradationCost}</div>
              <div className="text-[10px] text-slate-500 mt-1">-{results.sohLossPctPerYear}% SOH loss per year</div>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#0B131F] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-sm space-y-1">
              <div className="text-[10px] font-black uppercase text-slate-500">Levelized Cost of Storage (LCOS)</div>
              <div className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-1">${results.lcosUsdPerKwh} <span className="text-xs font-normal">/ kWh</span></div>
              <div className="text-[10px] text-slate-500 mt-1">Break-Even Spread: ${results.breakEvenSpreadUsd}/kWh</div>
            </div>
          </div>

          {/* LCOS & OEM Warranty Guardrail Alert Banner */}
          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-emerald-500 shrink-0" size={24} />
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  Levelized Degradation Cost & Warranty Guardrail
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                    results.warrantyProtectionStatus === 'SAFE' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                    results.warrantyProtectionStatus === 'WARN' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                    'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  }`}>
                    OEM WARRANTY {results.warrantyProtectionStatus}
                  </span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Current grid tariff spread is <strong>${results.tariffSpread}/kWh</strong> vs battery LCOS degradation cost of <strong>${results.lcosUsdPerKwh}/kWh</strong>.
                  {results.isProfitable ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold ml-1">✓ V2G Discharge Approved: Profitable Arbitrage Margin.</span>
                  ) : (
                    <span className="text-rose-600 dark:text-rose-400 font-bold ml-1">⚠️ V2G Paused: Tariff spread is below degradation wear cost.</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold shrink-0">
              <span className="text-slate-500">Optimal Cap:</span>
              <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-mono">
                {results.maxRecommendedDailyKwh} kWh / day
              </span>
            </div>
          </div>
        </>
      )}

      {/* 4. 24-Hour Spot Energy Market & Power Schedule Chart */}
      <V2GMarketHourlyChart
        peakTariff={peakTariff}
        offPeakTariff={offPeakTariff}
        dailyDischargeKwh={dailyDischargeKwh}
      />

      {/* 5. Financial & Trajectory Charts Section */}
      {results && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Financial Breakdown Bar Chart */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0B131F] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-md space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="text-emerald-500" size={18} /> Financial Breakdown ($ / Year)
            </h3>
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financialBarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {financialBarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 5-Year SOH Trajectory Comparison */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0B131F] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-md space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="text-amber-500" size={18} /> 5-Year SOH Trajectory Comparison
            </h3>
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={results.trajectoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="year" stroke="#94a3b8" label={{ value: 'Years', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis domain={[70, 100]} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                  <Legend />
                  <Line type="monotone" dataKey="smartAiV2g" stroke="#10b981" strokeWidth={3} name="Smart AI-Managed V2G" />
                  <Line type="monotone" dataKey="noV2gDrivingOnly" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 4" name="Driving Only (No V2G)" />
                  <Line type="monotone" dataKey="unmanagedV2g" stroke="#ef4444" strokeWidth={2.5} strokeDasharray="2 2" name="Unmanaged Aggressive V2G" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 6. Multi-EV Fleet Scaling & Ancillary Services Revenue Engine */}
      <V2GFleetRevenueCalculator
        singleEvNetProfit={results?.annualNetProfit || 340}
        batteryCapacity={batteryCapacity}
      />

      {/* 7. 24-Hour Dispatch Schedule Table & Certificate Exporter */}
      <V2GDispatchScheduleTable
        batteryCapacity={batteryCapacity}
        peakTariff={peakTariff}
        offPeakTariff={offPeakTariff}
        dailyDischargeKwh={dailyDischargeKwh}
      />
    </div>
  );
}
