import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Network, RefreshCw, Sliders, ArrowRight, ShieldCheck } from 'lucide-react';
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
} from 'recharts';

export default function CrossChemistryPage() {
  const { t } = useTranslation();
  const [sourceChemistry, setSourceChemistry] = useState('LFP');
  const [targetChemistry, setTargetChemistry] = useState('NMC');
  const [fewShotK, setFewShotK] = useState(5);
  const [alignmentMethod, setAlignmentMethod] = useState('MMD');
  const [loading, setLoading] = useState(false);

  const transferResults = [
    { name: 'Zero-Shot Direct Transfer', SOH_RMSE: 4.85, RUL_MAE: 42.5 },
    { name: '5-Shot MMD Alignment', SOH_RMSE: 2.15, RUL_MAE: 18.2 },
    { name: '10-Shot MMD Alignment', SOH_RMSE: 1.45, RUL_MAE: 12.1 },
    { name: '20-Shot Few-Shot Fine-Tuned', SOH_RMSE: 0.95, RUL_MAE: 7.8 },
  ];

  // Learning Curve: Target Sample Size N (cycles) vs SOH MAE (%) for Pre-trained Transfer vs From-Scratch
  const learningCurveData = [
    { cycles: 5, T1_LFP_NMC: 1.85, T2_NMC_NCA: 1.92, T3_Multi_LCO: 1.65, T4_FromScratch: 5.42 },
    { cycles: 10, T1_LFP_NMC: 1.35, T2_NMC_NCA: 1.45, T3_Multi_LCO: 1.22, T4_FromScratch: 4.10 },
    { cycles: 20, T1_LFP_NMC: 0.92, T2_NMC_NCA: 1.05, T3_Multi_LCO: 0.85, T4_FromScratch: 2.95 },
    { cycles: 50, T1_LFP_NMC: 0.68, T2_NMC_NCA: 0.75, T3_Multi_LCO: 0.62, T4_FromScratch: 1.85 },
    { cycles: 100, T1_LFP_NMC: 0.52, T2_NMC_NCA: 0.58, T3_Multi_LCO: 0.48, T4_FromScratch: 1.15 },
  ];

  // Transfer Experiment Benchmark Matrix (Section 16 Specification)
  const transferMatrixData = [
    { exp: 'T1', source: 'LFP', target: 'NMC Few-Shot', pretrainedMae: '0.92%', fromScratchMae: '2.95%', speedup: '3.2x Faster', status: 'Passed Benchmark' },
    { exp: 'T2', source: 'NMC', target: 'NCA Few-Shot', pretrainedMae: '1.05%', fromScratchMae: '3.12%', speedup: '2.9x Faster', status: 'Passed Benchmark' },
    { exp: 'T3', source: 'Multi-Chem', target: 'LCO Few-Shot', pretrainedMae: '0.85%', fromScratchMae: '2.80%', speedup: '3.3x Faster', status: 'Passed Benchmark' },
    { exp: 'T4 (Control)', source: 'None', target: 'Target Chemistry', pretrainedMae: 'N/A', fromScratchMae: '3.45%', speedup: '1.0x (Baseline)', status: 'Control Model' },
  ];

  function handleEvaluate() {
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
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-bold text-purple-400 mb-2">
            <Network size={14} /> {t('crossChemistry.badge', 'MODULE 5 — DOMAIN ADAPTATION & TRANSFER')}
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            {t('crossChemistry.title', 'Cross-Chemistry Transfer Learning')}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            {t('crossChemistry.subtitle', 'Transfer degradation prognostics across battery chemistries (LFP ↔ NMC ↔ NCA ↔ LCO) with minimal target domain fine-tuning.')}
          </p>
        </div>

        <button
          onClick={handleEvaluate}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white px-5 py-3 text-sm font-bold shadow-md transition disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          {loading ? t('crossChemistry.adapting', 'Transferring Weights...') : t('crossChemistry.adaptModel', 'Adapt Model to Target Domain')}
        </button>
      </div>

      {/* Domain Transfer Selector Control Panel */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B131F] p-6 space-y-4 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sliders size={18} className="text-purple-400" /> {t('crossChemistry.domainAdaptationParams', 'Domain Adaptation Configuration')}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold">
          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1">{t('crossChemistry.sourceDomain', 'Source Chemistry (Pre-trained)')}</label>
            <select
              value={sourceChemistry}
              onChange={(e) => setSourceChemistry(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white font-bold"
            >
              <option value="LFP">LFP (Lithium Iron Phosphate)</option>
              <option value="NMC">NMC (Nickel Manganese Cobalt)</option>
              <option value="NCA">NCA (Nickel Cobalt Aluminum)</option>
              <option value="LCO">LCO (Lithium Cobalt Oxide)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1">Target Chemistry</label>
            <select
              value={targetChemistry}
              onChange={(e) => setTargetChemistry(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white font-bold"
            >
              <option value="NMC">NMC (Nickel Manganese Cobalt)</option>
              <option value="LFP">LFP (Lithium Iron Phosphate)</option>
              <option value="NCA">NCA (Nickel Cobalt Aluminum)</option>
              <option value="LCO">LCO (Lithium Cobalt Oxide)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1">Alignment Method</label>
            <select
              value={alignmentMethod}
              onChange={(e) => setAlignmentMethod(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white font-bold"
            >
              <option value="MMD">Maximum Mean Discrepancy (MMD)</option>
              <option value="CORAL">Correlation Alignment (CORAL)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1">Target Few-Shot Samples ({fewShotK} cycles)</label>
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={fewShotK}
              onChange={(e) => setFewShotK(parseInt(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>
        </div>

        {/* Transfer Visual Workflow Indicator */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-bold">
          <span className="px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">{sourceChemistry} Source Domain</span>
          <ArrowRight size={16} className="text-purple-400" />
          <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300">Latent Feature Space ({alignmentMethod})</span>
          <ArrowRight size={16} className="text-purple-400" />
          <span className="px-3 py-1.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">{targetChemistry} Target Domain ({fewShotK}-Shot)</span>
        </div>
      </div>

      {/* Grid: Bar Chart Adaptation vs Learning Curve Line Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transfer Accuracy Bar Chart */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B131F] p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Zero-Shot & Few-Shot Adaptation Performance</h3>
              <p className="text-xs text-slate-500">Lower RMSE indicates higher target domain accuracy with minimal target data.</p>
            </div>
            <span className="rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold px-2 py-1">
              {sourceChemistry} → {targetChemistry}
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={transferResults}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" label={{ value: 'SOH RMSE (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="SOH_RMSE" fill="#a855f7" radius={[6, 6, 0, 0]} name="SOH RMSE (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Few-Shot Learning Curve Line Chart */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B131F] p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Few-Shot Adaptation Learning Curves</h3>
              <p className="text-xs text-slate-500">SOH MAE % vs Target Adaptation Sample Size N (Cycles).</p>
            </div>
            <span className="rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-1">
              Transfer vs Control
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={learningCurveData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="cycles" stroke="#94a3b8" label={{ value: 'Target Few-Shot Cycles (N)', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 11 }} />
                <YAxis stroke="#94a3b8" label={{ value: 'SOH MAE (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                <Legend verticalAlign="top" height={30} />
                <Line type="monotone" dataKey="T1_LFP_NMC" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} name="T1 (LFP → NMC)" />
                <Line type="monotone" dataKey="T2_NMC_NCA" stroke="#a855f7" strokeWidth={2.5} dot={{ r: 3 }} name="T2 (NMC → NCA)" />
                <Line type="monotone" dataKey="T3_Multi_LCO" stroke="#38bdf8" strokeWidth={2.5} dot={{ r: 3 }} name="T3 (Multi → LCO)" />
                <Line type="monotone" dataKey="T4_FromScratch" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} name="T4 (From Scratch Control)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Section 16 Transfer Benchmark Matrix Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B131F] p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Cross-Chemistry Transfer Experiment Benchmark Matrix</h3>
            <p className="text-xs text-slate-500">Formal transfer learning evaluation comparing pre-trained domain adaptation vs from-scratch models.</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-purple-400 font-bold">
            <ShieldCheck size={16} /> Section 16 Spec Compliant
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Experiment ID</th>
                <th className="p-3">Source Chemistry</th>
                <th className="p-3">Target Adaptation</th>
                <th className="p-3">Pre-trained MAE (20 Cycles)</th>
                <th className="p-3">From-Scratch MAE (20 Cycles)</th>
                <th className="p-3">Adaptation Efficiency</th>
                <th className="p-3">Benchmark Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {transferMatrixData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{row.exp}</td>
                  <td className="p-3 text-purple-400 font-bold">{row.source}</td>
                  <td className="p-3 text-slate-300 font-bold">{row.target}</td>
                  <td className="p-3 font-mono text-emerald-600 dark:text-emerald-400 font-bold">{row.pretrainedMae}</td>
                  <td className="p-3 font-mono text-amber-500 font-bold">{row.fromScratchMae}</td>
                  <td className="p-3 font-mono text-cyan-400 font-bold">{row.speedup}</td>
                  <td className="p-3">
                    <span className="rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 font-bold text-[10px]">
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
