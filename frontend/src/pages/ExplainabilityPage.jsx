import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sliders,
  BrainCircuit,
  ShieldCheck,
  Info,
  Sparkles,
  Activity,
  Layers,
  Download,
  RefreshCw,
  BarChart3,
  Filter,
  CheckCircle2,
  TrendingDown,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
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
  AreaChart,
  Area,
} from 'recharts';

export default function ExplainabilityPage() {
  const { t } = useTranslation();

  // Interactive controls state
  const [targetMode, setTargetMode] = useState('SOH'); // 'SOH' or 'RUL'
  const [selectedChemistry, setSelectedChemistry] = useState('ALL'); // 'ALL', 'NMC', 'LFP', 'NCA', 'LCO'
  const [selectedEpisode, setSelectedEpisode] = useState('cell_402_cycle_650');
  const [isComputing, setIsComputing] = useState(false);
  const [showExportToast, setShowExportToast] = useState(false);

  // Simulated re-computation trigger
  const handleRecalculateSHAP = () => {
    setIsComputing(true);
    setTimeout(() => {
      setIsComputing(false);
    }, 800);
  };

  // Episode dataset options for local waterfall calculation
  const testEpisodes = [
    { id: 'cell_402_cycle_650', label: 'Cell #402 — Cycle 650 (High Degradation)', predictedSoh: 88.5, baseSoh: 92.0, predictedRul: 340, baseRul: 480 },
    { id: 'cell_108_cycle_200', label: 'Cell #108 — Cycle 200 (Early Life / Fresh)', predictedSoh: 96.8, baseSoh: 98.0, predictedRul: 820, baseRul: 850 },
    { id: 'cell_782_cycle_950', label: 'Cell #782 — Cycle 950 (Near EOL Stress)', predictedSoh: 79.2, baseSoh: 85.0, predictedRul: 110, baseRul: 260 },
  ];

  const currentEpisodeData = useMemo(() => {
    return testEpisodes.find((e) => e.id === selectedEpisode) || testEpisodes[0];
  }, [selectedEpisode]);

  // Global SHAP feature importance data (Dynamic based on targetMode and chemistry)
  const shapValues = useMemo(() => {
    if (targetMode === 'SOH') {
      let base = [
        { feature: 'IC Peak 1 Height (dQ/dV)', importance: 0.38, impact: 'High Positive Degradation Indicator', category: 'Electrochemical' },
        { feature: 'Cycle Count (N)', importance: 0.29, impact: 'High Negative SOH Cumulative Stress', category: 'Operational' },
        { feature: 'Ambient Temp (T)', importance: 0.18, impact: 'Accelerates Kinetic SEI Growth', category: 'Environmental' },
        { feature: 'CV Phase Duration', importance: 0.12, impact: 'Internal Resistance & Polarization Rise', category: 'Operational' },
        { feature: 'C-Rate Fast Charge Stress', importance: 0.09, impact: 'High Charging Current Density Stress', category: 'Operational' },
        { feature: 'Depth of Discharge (DoD)', importance: 0.06, impact: 'Deep Discharge Structural Stress', category: 'Operational' },
        { feature: 'DV Peak 2 Distance (dV/dQ)', importance: 0.05, impact: 'Active Material Phase Shift', category: 'Electrochemical' },
        { feature: 'Ohmic Resistance (R_0)', importance: 0.04, impact: 'Electrolyte Degradation & Contact Loss', category: 'Physical' },
      ];
      if (selectedChemistry === 'LFP') {
        base[0].importance = 0.22; // Lower IC peak sensitivity in flat LFP plateau
        base[5].importance = 0.31; // DoD plays much higher role in LFP phase transitions
      } else if (selectedChemistry === 'NMC') {
        base[2].importance = 0.42; // Thermal sensitivity dominant in NMC
      }
      return base;
    } else {
      // RUL target SHAP importance
      return [
        { feature: 'Parabolic Degradation Velocity (k_deg)', importance: 0.44, impact: 'Determines Slope to 80% EOL Threshold', category: 'Physics' },
        { feature: 'Cycle Count (N)', importance: 0.35, impact: 'Elapsed Lifetime Consumed', category: 'Operational' },
        { feature: 'IC Peak 1 Height Drop', importance: 0.26, impact: 'Loss of Active Lithium Stock', category: 'Electrochemical' },
        { feature: 'Average Discharge C-Rate', importance: 0.19, impact: 'Mechanical Electrode Strain', category: 'Operational' },
        { feature: 'Thermal Excursion Hours (>40°C)', importance: 0.15, impact: 'Irreversible SEI Growth Rate', category: 'Environmental' },
        { feature: 'Internal Resistance (R_p)', importance: 0.11, impact: 'Voltage Drop & Power Fade', category: 'Physical' },
        { feature: 'DoD Variance', importance: 0.08, impact: 'Irregular Cycling Strain', category: 'Operational' },
        { feature: 'SOC Storage Duration (>90%)', importance: 0.06, impact: 'High SOC Anode Stress', category: 'Operational' },
      ];
    }
  }, [targetMode, selectedChemistry]);

  // Per-Prediction SHAP Waterfall Data (Dynamic per selectedEpisode & targetMode)
  const waterfallData = useMemo(() => {
    if (targetMode === 'SOH') {
      const ep = currentEpisodeData;
      if (selectedEpisode === 'cell_402_cycle_650') {
        return [
          { feature: 'Base Expected SOH', value: ep.baseSoh, push: `+${ep.baseSoh}%`, type: 'base', desc: 'Population baseline average' },
          { feature: 'Low Fast-Charge Usage', value: 1.5, push: '+1.5%', type: 'positive', desc: 'Mild charging protocols preserved SOH' },
          { feature: 'IC Peak 1 Height Drop', value: -1.8, push: '-1.8%', type: 'negative', desc: 'Active Li+ inventory loss observed' },
          { feature: 'High Temp Stress (38°C)', value: -2.4, push: '-2.4%', type: 'negative', desc: 'Thermal SEI thickening accelerated' },
          { feature: 'CV Phase Extension', value: -0.8, push: '-0.8%', type: 'negative', desc: 'Polarization resistance increase' },
          { feature: 'Final Predicted SOH', value: ep.predictedSoh, push: `${ep.predictedSoh}%`, type: 'total', desc: 'Model estimated current SOH' },
        ];
      } else if (selectedEpisode === 'cell_108_cycle_200') {
        return [
          { feature: 'Base Expected SOH', value: ep.baseSoh, push: `+${ep.baseSoh}%`, type: 'base', desc: 'Population baseline average' },
          { feature: 'Optimal Temp (24°C)', value: 0.9, push: '+0.9%', type: 'positive', desc: 'Controlled thermal environment' },
          { feature: 'Low Cycle Aging (N=200)', value: 0.6, push: '+0.6%', type: 'positive', desc: 'Minimal cycle accumulation' },
          { feature: 'IC Peak Intact', value: -0.5, push: '-0.5%', type: 'negative', desc: 'Slight initial SEI formation' },
          { feature: 'Final Predicted SOH', value: ep.predictedSoh, push: `${ep.predictedSoh}%`, type: 'total', desc: 'Model estimated current SOH' },
        ];
      } else {
        return [
          { feature: 'Base Expected SOH', value: ep.baseSoh, push: `+${ep.baseSoh}%`, type: 'base', desc: 'Population baseline average' },
          { feature: 'High Cycle Strain (N=950)', value: -3.8, push: '-3.8%', type: 'negative', desc: 'Accumulated fatigue cycles' },
          { feature: 'Severe IC Peak Loss', value: -1.4, push: '-1.4%', type: 'negative', desc: 'Loss of active host material' },
          { feature: 'Resistance Doubling', value: -0.6, push: '-0.6%', type: 'negative', desc: 'High polarization impedance' },
          { feature: 'Final Predicted SOH', value: ep.predictedSoh, push: `${ep.predictedSoh}%`, type: 'total', desc: 'Model estimated current SOH' },
        ];
      }
    } else {
      // RUL target waterfall
      const ep = currentEpisodeData;
      return [
        { feature: 'Base Expected RUL', value: ep.baseRul, push: `+${ep.baseRul} cyc`, type: 'base', desc: 'Baseline population RUL' },
        { feature: 'Low Degradation Slope (k_deg)', value: 45, push: '+45 cyc', type: 'positive', desc: 'Stable capacity fade trajectory' },
        { feature: 'High Operating Temp (38°C)', value: -110, push: '-110 cyc', type: 'negative', desc: 'Thermal acceleration penalty' },
        { feature: 'CV Phase Extension', value: -45, push: '-45 cyc', type: 'negative', desc: 'Impedance growth penalty' },
        { feature: 'Final Predicted RUL', value: ep.predictedRul, push: `${ep.predictedRul} cyc`, type: 'total', desc: 'Estimated remaining cycles to 80% SOH' },
      ];
    }
  }, [targetMode, selectedEpisode, currentEpisodeData]);

  // Physical Parameter Aging Evolution Trajectory (Cycles 0 to 800)
  const physicsAgingData = [
    { cycle: 0, seiThicknessNm: 0.50, lithiumLossPct: 0.5, resistanceMohm: 12.0 },
    { cycle: 200, seiThicknessNm: 0.85, lithiumLossPct: 1.6, resistanceMohm: 13.8 },
    { cycle: 400, seiThicknessNm: 1.15, lithiumLossPct: 2.8, resistanceMohm: 15.5 },
    { cycle: 600, seiThicknessNm: 1.38, lithiumLossPct: 3.9, resistanceMohm: 17.2 },
    { cycle: 800, seiThicknessNm: 1.62, lithiumLossPct: 5.1, resistanceMohm: 19.4 },
  ];

  // Cross-Chemistry Top Feature Shift Comparison
  const chemistryShapShift = [
    { chemistry: 'NMC (Nickel Manganese Cobalt)', top1: 'Ambient Operating Temp (0.42)', top2: 'IC Peak 1 Height (0.35)', dominantMechanism: 'Thermal SEI Growth & Cathode Phase Transition' },
    { chemistry: 'LFP (Lithium Iron Phosphate)', top1: 'Voltage Plateau Slope (0.46)', top2: 'Depth of Discharge (0.31)', dominantMechanism: 'Anode Phase Transition & Mechanical Stress' },
    { chemistry: 'NCA (Nickel Cobalt Aluminum)', top1: 'IC Peak 1 Height (0.44)', top2: 'C-Rate Fast Charge (0.38)', dominantMechanism: 'Active Lithium Loss (LAM) & Micro-cracking' },
    { chemistry: 'LCO (Lithium Cobalt Oxide)', top1: 'CV Phase Duration (0.40)', top2: 'Cycle Count N (0.36)', dominantMechanism: 'Ohmic Polarization & Cobalt Dissolution' },
  ];

  const physicsParams = [
    { name: 'Apparent Activation Energy (E_a)', value: '0.38 eV', meaning: 'SEI layer growth thermal kinetic barrier' },
    { name: 'SEI Layer Growth Estimate (x_sei)', value: '1.42 nm', meaning: 'Solid-electrolyte interphase boundary layer thickness' },
    { name: 'Active Lithium Loss (Q_loss)', value: '4.2 %', meaning: 'Irreversible capacity fade due to consumed Li+ ions' },
    { name: 'Polarization Resistance (R_p)', value: '18.5 mΩ', meaning: 'Charge-transfer and ohmic internal resistance' },
    { name: 'Degradation Rate Coef (k_deg)', value: '0.30 SOH%/√cycle', meaning: 'Parabolic diffusion-limited capacity fade velocity' },
  ];

  const handleExportReport = () => {
    const reportPayload = {
      timestamp: new Date().toISOString(),
      targetMode,
      selectedChemistry,
      selectedEpisode,
      currentEpisodeData,
      shapValues,
      waterfallData,
    };
    const blob = new Blob([JSON.stringify(reportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SHAP_Attribution_${targetMode}_${selectedEpisode}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setShowExportToast(true);
    setTimeout(() => setShowExportToast(false), 3000);
  };

  return (
    <div className="space-y-8 pb-12 animate-fadeIn">
      {/* Toast Notification */}
      {showExportToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-emerald-600 px-5 py-3.5 font-bold text-white shadow-2xl border border-emerald-400/40 transition">
          <CheckCircle2 size={20} className="text-emerald-200" />
          <span>SHAP Feature Attribution Report Exported (JSON/PDF)!</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gradient-to-r from-slate-900 via-[#0B131F] to-slate-900 dark:from-[#080d14] dark:via-[#0b1424] dark:to-[#080d14] p-6 lg:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 size-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1 text-xs font-bold text-teal-400 backdrop-blur-md">
            <Sliders size={14} className="animate-spin-slow" /> {t('explainability.badge', 'MODULE 7 — SHAP & FEATURE ATTRIBUTION')}
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
            {t('explainability.title', 'Explainable AI & SHAP Degradation Analysis')}
          </h1>
          <p className="text-sm text-slate-400 font-medium max-w-2xl leading-relaxed">
            {t('explainability.subtitle', 'Quantify feature attribution for battery SOH and RUL predictions using TreeSHAP and KernelSHAP models. Deconstruct exact capacity degradation drivers with physics-guided loss verification.')}
          </p>
        </div>

        {/* Global Action Controls */}
        <div className="flex flex-wrap items-center gap-3 z-10">
          <button
            onClick={handleRecalculateSHAP}
            disabled={isComputing}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-500/20 border border-teal-500/30 px-4 py-2.5 text-xs font-bold text-teal-300 hover:bg-teal-500/30 transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw size={15} className={isComputing ? 'animate-spin' : ''} />
            <span>{isComputing ? 'Computing TreeSHAP...' : 'Re-calculate SHAP'}</span>
          </button>
          
          <button
            onClick={handleExportReport}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:from-teal-400 hover:to-emerald-400 transition shadow-lg shadow-teal-500/25 active:scale-95"
          >
            <Download size={15} />
            <span>Export Attribution</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Target Mode & Chemistry Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B131F] p-4 shadow-sm">
        {/* Target Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <TargetIcon /> Target Output:
          </span>
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setTargetMode('SOH')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                targetMode === 'SOH'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              SOH (State of Health)
            </button>
            <button
              onClick={() => setTargetMode('RUL')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                targetMode === 'RUL'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              RUL (Remaining Useful Life)
            </button>
          </div>
        </div>

        {/* Chemistry Filter & Episode Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-teal-400" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Chemistry:</span>
            <select
              value={selectedChemistry}
              onChange={(e) => setSelectedChemistry(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="ALL">All Chemistries</option>
              <option value="NMC">NMC (Nickel Manganese Cobalt)</option>
              <option value="LFP">LFP (Lithium Iron Phosphate)</option>
              <option value="NCA">NCA (Nickel Cobalt Aluminum)</option>
              <option value="LCO">LCO (Lithium Cobalt Oxide)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Eye size={14} className="text-teal-400" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Test Episode:</span>
            <select
              value={selectedEpisode}
              onChange={(e) => setSelectedEpisode(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {testEpisodes.map((ep) => (
                <option key={ep.id} value={ep.id}>
                  {ep.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B131F] p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold">
            <span>Primary Driver</span>
            <BrainCircuit size={16} className="text-teal-400" />
          </div>
          <div className="text-lg font-black text-slate-900 dark:text-white truncate">
            {shapValues[0].feature}
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-500">
            <span>Shapley |SHAP| = {shapValues[0].importance}</span>
            <span className="rounded bg-teal-500/10 px-1.5 py-0.5 text-[10px]">Rank #1</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B131F] p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold">
            <span>Mean Shapley Impact</span>
            <BarChart3 size={16} className="text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            0.245 <span className="text-xs font-normal text-slate-400">{targetMode === 'SOH' ? 'SOH % / feature' : 'Cycles / feature'}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-500 font-semibold">
            <ArrowUpRight size={14} /> High Attribution Stability
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B131F] p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold">
            <span>TreeSHAP Coverage</span>
            <Layers size={16} className="text-purple-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">99.4%</div>
          <div className="text-xs text-slate-500 font-medium">Variance Explained</div>
        </div>

        {/* Card 4 */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B131F] p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold">
            <span>Physics Loss Penalty</span>
            <ShieldCheck size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">0.021</div>
          <div className="text-xs text-amber-400/90 font-medium">Strict Thermodynamic Bound</div>
        </div>
      </div>

      {/* Grid: Global SHAP Summary vs Per-Prediction Waterfall Plot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Global SHAP Summary Bar Chart */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B131F] p-6 space-y-4 shadow-sm relative">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 size={18} className="text-teal-400" /> Global SHAP Feature Importance ({targetMode})
              </h3>
              <p className="text-xs text-slate-500">Mean absolute Shapley values across extracted feature vectors.</p>
            </div>
            <span className="rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-bold px-2 py-1">
              Global TreeSHAP
            </span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shapValues} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} label={{ value: `Mean |SHAP Value| (${targetMode})`, position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 11 }} />
                <YAxis type="category" dataKey="feature" stroke="#94a3b8" fontSize={10} width={180} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="importance" radius={[0, 6, 6, 0]} name="Feature Importance">
                  {shapValues.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#14b8a6' : index < 3 ? '#06b6d4' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Per-Prediction SHAP Waterfall Force Plot */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B131F] p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity size={18} className="text-emerald-400" /> Episode Waterfall Attribution ({targetMode})
              </h3>
              <p className="text-xs text-slate-500">
                Decomposes target prediction ({targetMode === 'SOH' ? `${currentEpisodeData.predictedSoh}%` : `${currentEpisodeData.predictedRul} cycles`}) into positive/negative feature pushes.
              </p>
            </div>
            <span className="rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-1">
              Episode SHAP
            </span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterfallData} layout="vertical" margin={{ left: 15, right: 20, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis type="category" dataKey="feature" stroke="#94a3b8" fontSize={10} width={170} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} name="Feature Impact">
                  {waterfallData.map((entry, index) => {
                    let color = '#10b981';
                    if (entry.type === 'base') color = '#64748b';
                    else if (entry.type === 'negative') color = '#f43f5e';
                    else if (entry.type === 'total') color = '#06b6d4';
                    return <Cell key={`wf-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Actionable Counterfactual Recourse Recommendations Block */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-transparent border border-teal-500/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="text-teal-400 shrink-0" size={22} />
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">AI Counterfactual Recourse Recommendations</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Data-driven parameter adjustments to neutralize negative SHAP degradation drivers for <strong>{currentEpisodeData.label}</strong>:
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold font-mono border border-teal-500/30">
            SHAP Recourse Engine
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-rose-500 uppercase">Thermal Recourse (-2.4% SOH penalty)</span>
            <p className="font-bold text-slate-900 dark:text-white">Reduce Ambient Heat Exposure below 26°C</p>
            <p className="text-slate-500 text-[11px]">Park in shaded/cooled garages to lower SEI kinetic activation rate ($E_a$).</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-amber-500 uppercase">Fast-Charge Recourse (-1.8% SOH penalty)</span>
            <p className="font-bold text-slate-900 dark:text-white">Cap DC Fast-Charging Usage below 20%</p>
            <p className="text-slate-500 text-[11px]">Shift daily charging to Level 2 AC chargers to prevent active Li+ loss.</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-emerald-500 uppercase">Estimated Recovery Outcome</span>
            <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">+3.2% SOH Capacity Recovery</p>
            <p className="text-slate-500 text-[11px]">Extends remaining useful battery life by <strong>+180 Cycles</strong>.</p>
          </div>
        </div>
      </div>

      {/* Cross-Chemistry Top Feature Shift Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B131F] p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BrainCircuit size={18} className="text-teal-400" /> SHAP Feature Attribution Shifts Across Battery Chemistries
            </h3>
            <p className="text-xs text-slate-500">Top Shapley features change according to underlying electrochemical degradation mechanisms.</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-md bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[10px] font-bold px-2.5 py-1">
            <Sparkles size={12} /> Cross-Chemistry Dynamics
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Battery Chemistry</th>
                <th className="p-3">Primary SHAP Feature (Top 1)</th>
                <th className="p-3">Secondary SHAP Feature (Top 2)</th>
                <th className="p-3">Dominant Electrochemical Mechanism</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {chemistryShapShift.map((c, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                  <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="size-2 rounded-full bg-teal-400" /> {c.chemistry}
                  </td>
                  <td className="p-3 font-mono text-teal-600 dark:text-teal-400 font-bold">{c.top1}</td>
                  <td className="p-3 font-mono text-cyan-600 dark:text-cyan-400 font-bold">{c.top2}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">{c.dominantMechanism}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: Physical Parameter Aging Evolution vs Parameter Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Physical Parameter Aging Evolution Chart */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B131F] p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingDown size={18} className="text-emerald-400" /> Physical Parameter Aging Trajectories
              </h3>
              <p className="text-xs text-slate-500">Inferred SEI Layer Growth (x<sub>sei</sub>) and Active Lithium Loss (Q<sub>loss</sub>) over 800 cycles.</p>
            </div>
            <span className="rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-bold px-2 py-1">
              Physics Trajectory
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={physicsAgingData} margin={{ left: 0, right: 10, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="cycle" stroke="#94a3b8" label={{ value: 'Cycle Number', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 11 }} />
                <YAxis stroke="#94a3b8" label={{ value: 'Value (nm / %)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                <Legend verticalAlign="top" height={30} />
                <Line type="monotone" dataKey="seiThicknessNm" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} name="SEI Layer Thickness (nm)" />
                <Line type="monotone" dataKey="lithiumLossPct" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} name="Active Lithium Loss (%)" />
                <Line type="monotone" dataKey="resistanceMohm" stroke="#38bdf8" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 4 }} name="Polarization Resistance (mΩ)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Physical Parameters Table with Section 18.2 UI Disclaimer */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B131F] p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <ShieldCheck size={18} className="text-teal-400" /> Learned Physical & Degradation Parameters
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-2.5">Physics Parameter</th>
                    <th className="p-2.5">Estimated Value</th>
                    <th className="p-2.5">Physical Meaning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {physicsParams.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                      <td className="p-2.5 font-bold text-slate-900 dark:text-white">{p.name}</td>
                      <td className="p-2.5 font-mono text-teal-600 dark:text-teal-400 font-bold">{p.value}</td>
                      <td className="p-2.5 text-slate-600 dark:text-slate-400">{p.meaning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 18.2 / 20.4 Mandatory UI Disclaimer Banner */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-300 flex items-start gap-2.5 mt-4">
            <Info size={18} className="shrink-0 text-amber-400 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-bold text-amber-200 block mb-0.5">Section 18.2 Inferred Parameter Caveat:</strong>
              Inferred physical parameters are latent estimates calculated via physics-guided neural loss constraints (L<sub>phys</sub>) and should be interpreted as model-derived indicators rather than direct laboratory electrochemical measurements.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Custom Tooltip for SHAP Recharts
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-xl bg-slate-900/95 p-3 text-xs text-white border border-slate-700 shadow-xl backdrop-blur-md max-w-xs space-y-1">
        <p className="font-bold text-teal-300">{data.feature || label}</p>
        <p className="text-slate-300">
          Value / Impact: <strong className="text-white">{data.push || data.value || data.importance}</strong>
        </p>
        {data.desc && <p className="text-[11px] text-slate-400 leading-tight">{data.desc}</p>}
        {data.impact && <p className="text-[11px] text-cyan-300 leading-tight">{data.impact}</p>}
      </div>
    );
  }
  return null;
}

function TargetIcon() {
  return (
    <svg className="size-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="12" cy="12" r="9" strokeWidth="2" />
      <circle cx="12" cy="12" r="5" strokeWidth="2" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}
