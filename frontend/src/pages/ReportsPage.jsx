import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Download,
  FileSpreadsheet,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Printer,
  Code2,
  Calendar,
  Zap,
  Info,
  CheckSquare,
  Square,
} from 'lucide-react';

export default function ReportsPage() {
  const { t } = useTranslation();
  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState('');

  // Custom Report Builder State
  const [builderConfig, setBuilderConfig] = useState({
    title: 'LITHYX Comprehensive Battery Health Evaluation Report',
    cellId: 'CELL_NMC_2026_04',
    chemistry: 'NMC',
    modelArchitecture: 'LITHYX Hybrid PINN + Ensemble Conformal',
    confidenceLevel: '95%',
    includeICA: true,
    includeConformal: true,
    includeSHAP: true,
    includePhysicsParams: true,
    includeDigitalTwin: true,
  });

  const reportItems = [
    {
      id: 'REP_2026_001',
      title: 'LITHYX Full Research & Prognostics Report',
      batteryId: 'CELL_LFP_001',
      chemistry: 'LFP',
      soh: '93.1%',
      rul: '880 Cycles',
      confidence: '95% Conformal Bounds [91.3% - 94.9%]',
      date: '2026-09-20',
      checkpoint: 'chk_2026_09_v1.0.pt',
    },
    {
      id: 'REP_2026_002',
      title: 'Cross-Chemistry Transfer & Domain Adaptation Report',
      batteryId: 'CELL_NMC_004',
      chemistry: 'NMC',
      soh: '91.5%',
      rul: '720 Cycles',
      confidence: '95% Conformal Bounds [89.6% - 93.4%]',
      date: '2026-09-18',
      checkpoint: 'chk_2026_09_v1.0.pt',
    },
    {
      id: 'REP_2026_003',
      title: 'P10-P40 Partial Observation Window Benchmark Report',
      batteryId: 'CELL_NCA_008',
      chemistry: 'NCA',
      soh: '88.4%',
      rul: '540 Cycles',
      confidence: '95% Conformal Bounds [86.2% - 90.6%]',
      date: '2026-09-15',
      checkpoint: 'chk_2026_09_v1.0.pt',
    },
  ];

  const toggleSection = (key) => {
    setBuilderConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const generateReportJSON = () => {
    const reportData = {
      meta: {
        generator: 'LITHYX AI Battery Health Research Platform v1.0',
        timestamp: new Date().toISOString(),
        gitCommit: '7f8a92b',
        randomSeed: 42,
        checkpoint: 'chk_2026_09_v1.0.pt',
      },
      configuration: builderConfig,
      results: {
        sohPercent: 91.5,
        rulCycles: 720,
        uncertainty: {
          conformalLowerPct: 89.6,
          conformalUpperPct: 93.4,
          empiricalCoveragePct: 95.2,
          meanIntervalWidthPct: 3.8,
        },
        physicsParameters: {
          activationEnergyEv: 0.35,
          degradationRateKdeg: 0.30,
          seiGrowthNm: 1.42,
          lithiumLossPct: 4.2,
        },
        disclaimer: 'Section 20.4 Safety Caveat: All SOH predictions and inferred physical parameters are model-derived AI estimates and should not be used as certified operational safety controls.',
      },
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${builderConfig.cellId}_LITHYX_Report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setMessage('Downloaded structured JSON scientific experiment log.');
    setTimeout(() => setMessage(''), 4000);
  };

  const handlePrintPDF = () => {
    setDownloading(true);
    setTimeout(() => {
      window.print();
      setDownloading(false);
      setMessage('Triggered publication-ready PDF print dialog.');
      setTimeout(() => setMessage(''), 4000);
    }, 400);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-400 mb-2">
            <FileText size={14} /> MODULE 16 — RESEARCH REPORT GENERATION & EXPORT
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            LITHYX Scientific Report Exporter
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            Generate, customize, and export publication-ready research reports (PDF/JSON) containing SOH trajectories, conformal bounds, SHAP attributions, and Section 20.4 safety disclaimers.
          </p>
        </div>
      </div>

      {message && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center gap-3 text-emerald-300 font-bold text-xs shadow-sm">
          <CheckCircle2 size={18} />
          {message}
        </div>
      )}

      {/* Interactive Custom Report Builder Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B131F] p-6 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders size={20} className="text-emerald-500" /> Interactive Report Builder
            </h2>
            <p className="text-xs text-slate-500">Configure parameters and toggle diagnostic sections for export.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintPDF}
              disabled={downloading}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              <Printer size={14} /> Print / Save PDF
            </button>
            <button
              onClick={generateReportJSON}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-2 text-xs font-bold hover:border-emerald-500 transition-all"
            >
              <Code2 size={14} /> Export JSON Log
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1">Report Title</label>
            <input
              type="text"
              value={builderConfig.title}
              onChange={(e) => setBuilderConfig({ ...builderConfig, title: e.target.value })}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1">Target Battery Cell ID</label>
            <input
              type="text"
              value={builderConfig.cellId}
              onChange={(e) => setBuilderConfig({ ...builderConfig, cellId: e.target.value })}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1">Battery Chemistry</label>
            <select
              value={builderConfig.chemistry}
              onChange={(e) => setBuilderConfig({ ...builderConfig, chemistry: e.target.value })}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white font-bold"
            >
              <option value="NMC">NMC (Nickel Manganese Cobalt)</option>
              <option value="LFP">LFP (Lithium Iron Phosphate)</option>
              <option value="NCA">NCA (Nickel Cobalt Aluminum)</option>
              <option value="LCO">LCO (Lithium Cobalt Oxide)</option>
            </select>
          </div>
        </div>

        {/* Section Toggles */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Included Research Sections</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-xs">
            {[
              { key: 'includeICA', label: 'ICA / DVA Curves' },
              { key: 'includeConformal', label: 'Conformal Intervals' },
              { key: 'includeSHAP', label: 'SHAP Attributions' },
              { key: 'includePhysicsParams', label: 'Physical Parameters' },
              { key: 'includeDigitalTwin', label: 'UKF Digital Twin' },
            ].map((sec) => (
              <button
                key={sec.key}
                onClick={() => toggleSection(sec.key)}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left font-bold transition-all ${
                  builderConfig[sec.key]
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-400'
                }`}
              >
                {builderConfig[sec.key] ? <CheckSquare size={14} /> : <Square size={14} />}
                <span>{sec.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pre-Generated Reports List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Pre-Generated Research Evaluation Reports</h2>
        {reportItems.map((rep) => (
          <div key={rep.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B131F] p-6 space-y-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5">
                  {rep.chemistry} Chemistry
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">{rep.id}</span>
                <span className="text-xs font-mono text-slate-500 font-medium">Checkpoint: {rep.checkpoint}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{rep.title}</h3>
              <div className="flex flex-wrap gap-4 text-xs text-slate-500 font-medium">
                <span>Cell: <strong className="text-slate-900 dark:text-white">{rep.batteryId}</strong></span>
                <span>SOH: <strong className="text-emerald-400 font-bold">{rep.soh}</strong></span>
                <span>RUL: <strong className="text-cyan-400 font-bold">{rep.rul}</strong></span>
                <span>{rep.confidence}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handlePrintPDF}
                disabled={downloading}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 text-xs font-bold shadow transition disabled:opacity-50"
              >
                <Download size={14} /> Export PDF
              </button>
              <button
                onClick={generateReportJSON}
                disabled={downloading}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-4 py-2.5 text-xs font-bold shadow-sm hover:border-emerald-500 transition disabled:opacity-50"
              >
                <FileSpreadsheet size={14} /> Export JSON
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}