import React, { useState, useMemo } from 'react';
import {
  Sliders,
  Sparkles,
  DollarSign,
  ShieldCheck,
  TrendingUp,
  BatteryCharging,
  Thermometer,
  Zap,
  Clock,
  Award,
  CheckCircle2,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from 'recharts';

export default function LifeExtensionSimulator() {
  // Baseline (Unoptimized) Charging Habit State
  const [baselineFastChargePct, setBaselineFastChargePct] = useState(60);
  const [baselineSocCutoff, setBaselineSocCutoff] = useState(100);
  const [baselineTempC, setBaselineTempC] = useState(36);

  // Smart Optimized Charging Habit State
  const [optFastChargePct, setOptFastChargePct] = useState(20);
  const [optSocCutoff, setOptSocCutoff] = useState(80);
  const [optTempC, setOptTempC] = useState(24);

  // Global EV Specs
  const [dailyKm, setDailyKm] = useState(45);
  const [packCostUsd, setPackCostUsd] = useState(12000);

  // Physics Degradation Computation over 60 Months (5 Years)
  const simulationResults = useMemo(() => {
    // Annual degradation rate formula (% loss per year)
    // Base calendar aging = ~1.8%/yr
    // Fast charging penalty = +0.06% per 1% fast charge
    // High SOC penalty = +0.08% per 1% above 80%
    // Thermal penalty = +0.12% per 1°C above 25°C

    const baselineFastPenalty = baselineFastChargePct * 0.055;
    const baselineSocPenalty = Math.max(0, baselineSocCutoff - 80) * 0.085;
    const baselineTempPenalty = Math.max(0, baselineTempC - 25) * 0.11;
    const baselineKmPenalty = (dailyKm / 40) * 0.4;
    const baselineAnnualDecay = 1.8 + baselineFastPenalty + baselineSocPenalty + baselineTempPenalty + baselineKmPenalty;

    const optFastPenalty = optFastChargePct * 0.055;
    const optSocPenalty = Math.max(0, optSocCutoff - 80) * 0.085;
    const optTempPenalty = Math.max(0, optTempC - 25) * 0.11;
    const optKmPenalty = (dailyKm / 40) * 0.4;
    const optAnnualDecay = 1.8 + optFastPenalty + optSocPenalty + optTempPenalty + optKmPenalty;

    // Monthly data points over 5 years (Month 0 to 60)
    const monthlyData = [];
    for (let month = 0; month <= 60; month += 6) {
      const year = (month / 12).toFixed(1);
      const baselineSoh = Math.max(45, Number((100 - (month / 12) * baselineAnnualDecay).toFixed(1)));
      const optSoh = Math.max(45, Number((100 - (month / 12) * optAnnualDecay).toFixed(1)));
      monthlyData.push({
        month,
        label: month === 0 ? 'Start' : `Yr ${year}`,
        baselineSoh,
        optSoh,
        sohGain: Number((optSoh - baselineSoh).toFixed(1)),
      });
    }

    // 5-Year Final SOH Values
    const finalBaselineSoh = monthlyData[monthlyData.length - 1].baselineSoh;
    const finalOptSoh = monthlyData[monthlyData.length - 1].optSoh;
    const sohGainPct = Number((finalOptSoh - finalBaselineSoh).toFixed(1));

    // Calculate Extended Useful Lifespan (Months until 70% SOH EOL)
    const baselineMonthsToEol = Number(((30 / baselineAnnualDecay) * 12).toFixed(0));
    const optMonthsToEol = Number(((30 / optAnnualDecay) * 12).toFixed(0));
    const extraYearsLife = Number(((optMonthsToEol - baselineMonthsToEol) / 12).toFixed(1));

    // Financial Forecasts ($) over 5 Years
    // 1. Deferred Pack Replacement Value ($) = (extraYearsLife / 8) * packCostUsd
    const replacementSavingsUsd = Math.round((Math.max(0, extraYearsLife) / 8.0) * packCostUsd);
    // 2. Used EV Resale Premium = +$120 per 1% higher SOH at Year 5
    const resalePremiumUsd = Math.round(sohGainPct * 145);
    // 3. Off-peak Smart Charging Tariff Savings = ~$220/year
    const tariffSavingsUsd = 220 * 5;
    const total5YearSavingsUsd = replacementSavingsUsd + resalePremiumUsd + tariffSavingsUsd;

    return {
      monthlyData,
      finalBaselineSoh,
      finalOptSoh,
      sohGainPct,
      extraYearsLife,
      replacementSavingsUsd,
      resalePremiumUsd,
      tariffSavingsUsd,
      total5YearSavingsUsd,
    };
  }, [
    baselineFastChargePct,
    baselineSocCutoff,
    baselineTempC,
    optFastChargePct,
    optSocCutoff,
    optTempC,
    dailyKm,
    packCostUsd,
  ]);

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B131F] p-6 md:p-8 space-y-8 shadow-2xl animate-fade-in">
      {/* 1. Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles size={14} className="animate-spin text-emerald-500" />
            AI 5-Year Life Extension & Savings Simulator
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <TrendingUp className="text-emerald-500" size={32} />
            Battery Longevity & Monetary Return Forecast
          </h2>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 font-medium mt-1 max-w-2xl">
            Compare unoptimized charging routines against AI-recommended smart charging habits to project 5-year SOH capacity retention and total financial savings ($).
          </p>
        </div>

        {/* Dynamic 5-Year Return Badge */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xl shadow-emerald-950/40 flex items-center gap-4 shrink-0">
          <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-md">
            <DollarSign size={32} className="text-white" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-100 block">
              Projected 5-Year Net Financial Return
            </span>
            <span className="text-3xl font-black font-mono tracking-tight">
              +${simulationResults.total5YearSavingsUsd.toLocaleString()}
            </span>
            <span className="text-xs font-extrabold text-emerald-200 block mt-0.5">
              +{simulationResults.extraYearsLife} Extra Years Battery Lifespan
            </span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Dual-Slider Optimization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Unoptimized Baseline Controls (Red Accent) */}
        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-rose-500 animate-pulse" />
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                Unoptimized Baseline Habits
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-extrabold text-xs border border-rose-500/20">
              Higher Degradation Rate
            </span>
          </div>

          <div className="space-y-4">
            {/* Fast Charging Usage Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <Zap size={14} className="text-rose-500" /> DC Fast Charging Frequency:
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 font-mono font-black text-xs border border-rose-500/20">
                  {baselineFastChargePct}% of sessions
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={baselineFastChargePct}
                onChange={(e) => setBaselineFastChargePct(parseInt(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
            </div>

            {/* Max SOC Cutoff Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <BatteryCharging size={14} className="text-rose-500" /> Daily Charging Ceiling (SOC):
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 font-mono font-black text-xs border border-rose-500/20">
                  {baselineSocCutoff}% Max SOC
                </span>
              </div>
              <input
                type="range"
                min="70"
                max="100"
                step="5"
                value={baselineSocCutoff}
                onChange={(e) => setBaselineSocCutoff(parseInt(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
            </div>

            {/* Climate Ambient Temperature Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <Thermometer size={14} className="text-rose-500" /> Ambient Heat Exposure:
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 font-mono font-black text-xs border border-rose-500/20">
                  {baselineTempC}°C
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="45"
                step="1"
                value={baselineTempC}
                onChange={(e) => setBaselineTempC(parseInt(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Smart Optimized Controls (Green Accent) */}
        <div className="p-6 rounded-3xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/30 space-y-5">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                AI Smart Optimized Care
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs border border-emerald-500/30">
              Optimal Longevity
            </span>
          </div>

          <div className="space-y-4">
            {/* Fast Charging Usage Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <Zap size={14} className="text-emerald-500" /> Target DC Fast Charging Frequency:
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-black text-xs border border-emerald-500/30">
                  {optFastChargePct}% of sessions
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={optFastChargePct}
                onChange={(e) => setOptFastChargePct(parseInt(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
            </div>

            {/* Max SOC Cutoff Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <BatteryCharging size={14} className="text-emerald-500" /> Target Daily SOC Cutoff:
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-black text-xs border border-emerald-500/30">
                  {optSocCutoff}% Max SOC
                </span>
              </div>
              <input
                type="range"
                min="70"
                max="100"
                step="5"
                value={optSocCutoff}
                onChange={(e) => setOptSocCutoff(parseInt(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
            </div>

            {/* Climate Temperature Buffer Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <Thermometer size={14} className="text-emerald-500" /> Climate Control / Shaded Parking Temp:
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-black text-xs border border-emerald-500/30">
                  {optTempC}°C
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="45"
                step="1"
                value={optTempC}
                onChange={(e) => setOptTempC(parseInt(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Real-Time 5-Year SOH Degradation Curve Comparison */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp size={20} className="text-emerald-500" /> 5-Year SOH Capacity Trajectory Curve
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Real-time projection comparing capacity decay (% SOH) over 60 months.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-rose-500" />
              <span className="text-slate-600 dark:text-slate-400">Baseline ({simulationResults.finalBaselineSoh}% SOH)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-emerald-500" />
              <span className="text-slate-900 dark:text-white font-extrabold">Smart Optimized ({simulationResults.finalOptSoh}% SOH)</span>
            </div>
          </div>
        </div>

        {/* Recharts Trajectory Graph */}
        <div className="h-[340px] w-full p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={simulationResults.monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 11, fontWeight: 'bold' }} />
              <YAxis domain={[45, 100]} stroke="#64748b" tick={{ fontSize: 11, fontWeight: 'bold' }} unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '16px',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
              />
              <Area type="monotone" dataKey="optSoh" fill="#10b981" fillOpacity={0.15} stroke="none" />
              <Line
                type="monotone"
                dataKey="baselineSoh"
                name="Unoptimized Baseline SOH (%)"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="optSoh"
                name="AI Smart Optimized SOH (%)"
                stroke="#10b981"
                strokeWidth={4}
                dot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Financial Savings Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-2">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
            Deferred Pack Replacement
          </span>
          <p className="text-3xl font-black font-mono text-emerald-500">
            +${simulationResults.replacementSavingsUsd.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 font-medium">
            Saves battery capital wear by delaying ${packCostUsd.toLocaleString()} replacement by +{simulationResults.extraYearsLife} yrs.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-2">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
            Used EV Resale Premium
          </span>
          <p className="text-3xl font-black font-mono text-teal-400">
            +${simulationResults.resalePremiumUsd.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 font-medium">
            Certified +{simulationResults.sohGainPct}% higher battery SOH retains premium valuation upon vehicle resale.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-2">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
            Smart Off-Peak Charging
          </span>
          <p className="text-3xl font-black font-mono text-cyan-400">
            +${simulationResults.tariffSavingsUsd.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 font-medium">
            Saved over 5 years by scheduling slow AC charging during grid off-peak tariff windows.
          </p>
        </div>
      </div>

      {/* 5. Actionable Habit Checklist for EV Owners */}
      <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 space-y-4">
        <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="text-emerald-500" size={18} />
          Recommended EV Charging Habits to Achieve Maximum 5-Year Return:
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium text-slate-700 dark:text-slate-300">
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
            <span className="size-5 rounded-full bg-emerald-500/20 text-emerald-500 font-bold flex items-center justify-center text-[10px] shrink-0">
              1
            </span>
            <div>
              <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Limit Daily SOC to 80%</span>
              Cap overnight AC charging at 80% for daily commuting. Only charge to 100% before long road trips.
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
            <span className="size-5 rounded-full bg-emerald-500/20 text-emerald-500 font-bold flex items-center justify-center text-[10px] shrink-0">
              2
            </span>
            <div>
              <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Minimize DC Fast Charging</span>
              Use Level 2 AC chargers for 80%+ of charging needs to prevent high C-Rate thermal stress.
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
            <span className="size-5 rounded-full bg-emerald-500/20 text-emerald-500 font-bold flex items-center justify-center text-[10px] shrink-0">
              3
            </span>
            <div>
              <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Park in Shaded/Garage Areas</span>
              Avoid leaving your EV parked under direct sunlight during summer heatwaves (over 35°C).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
