import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Database, Sliders, FileText, CheckCircle, Clock, RotateCcw, AlertTriangle } from 'lucide-react';
import researchService from '../services/researchService.js';

export default function ResearchExperimentsPage() {
  const { t } = useTranslation();
  const [config, setConfig] = useState({
    dataset: 'NASA Li-ion Battery Aging Dataset',
    trainTestRatio: '80 / 20',
    earlyLifeWindow: 100,
    randomSeed: 42,
    testSplit: 0.2,
  });

  const [running, setRunning] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await researchService.getExperimentHistory();
      if (res?.history) {
        setHistory(res.history);
      }
    } catch (err) {
      console.warn('Could not load experiment history');
    }
  };

  const handleRunExperiment = async (e) => {
    e.preventDefault();
    setRunning(true);
    setError('');

    try {
      const res = await researchService.runExperiment(config);
      if (res.success && res.experiment) {
        setCurrentResult(res.experiment);
        loadHistory();
      } else {
        setError('Experiment failed to complete');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error executing experiment');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-2">
            <Sliders size={14} /> {t('researchExperimentsPage.badge', 'Research Module: Step 13')}
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">{t('researchExperimentsPage.title', 'Research Experiment Runner')}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {t('researchExperimentsPage.subtitle', 'Execute reproducible model experiments, configure split ratios & random seeds, and export benchmark data for research papers.')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 p-6 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-xl space-y-6">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Sliders size={18} className="text-emerald-400" />
            {t('researchExperimentsPage.parameters', 'Experiment Parameters')}
          </h2>

          <form onSubmit={handleRunExperiment} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Target Dataset</label>
              <select
                value={config.dataset}
                onChange={(e) => setConfig({ ...config, dataset: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="NASA Li-ion Battery Aging Dataset">NASA Li-ion Battery Aging Dataset</option>
                <option value="CALCE Battery Degradation Dataset">CALCE Battery Degradation Dataset</option>
                <option value="Realistic EV Fleet Battery Benchmark">Realistic EV Fleet Battery Benchmark</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Train / Test Split Ratio</label>
              <select
                value={config.trainTestRatio}
                onChange={(e) => {
                  const val = e.target.value;
                  const testRatio = val.includes('70') ? 0.3 : val.includes('85') ? 0.15 : 0.2;
                  setConfig({ ...config, trainTestRatio: val, testSplit: testRatio });
                }}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="80 / 20">80% Train / 20% Test</option>
                <option value="70 / 30">70% Train / 30% Test</option>
                <option value="85 / 15">85% Train / 15% Test</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Early-Life Cycle Window</label>
              <select
                value={config.earlyLifeWindow}
                onChange={(e) => setConfig({ ...config, earlyLifeWindow: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value={50}>50 Cycles</option>
                <option value={100}>100 Cycles</option>
                <option value={150}>150 Cycles</option>
                <option value={200}>200 Cycles</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Random Seed (Reproducibility)</label>
              <input
                type="number"
                value={config.randomSeed}
                onChange={(e) => setConfig({ ...config, randomSeed: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={running}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition disabled:opacity-50 mt-4"
            >
              <Play size={18} className={running ? 'animate-pulse' : ''} />
              {running ? 'Running Experiment...' : 'Execute Experiment'}
            </button>
          </form>
        </div>

        {/* Experiment Results & History Display */}
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          {currentResult && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="text-xs text-emerald-400 font-mono">ID: {currentResult.experimentId}</div>
                  <h3 className="text-lg font-bold">Experiment Output Summary</h3>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                  <CheckCircle size={14} /> Completed
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="bg-slate-800/60 p-3 rounded-xl">
                  <span className="text-slate-400 block">Dataset</span>
                  <span className="font-bold text-slate-200">{currentResult.dataset}</span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-xl">
                  <span className="text-slate-400 block">Split Ratio</span>
                  <span className="font-bold text-slate-200">{currentResult.trainTestRatio}</span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-xl">
                  <span className="text-slate-400 block">Seed</span>
                  <span className="font-bold text-slate-200">{currentResult.randomSeed}</span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-xl">
                  <span className="text-slate-400 block">Best Model</span>
                  <span className="font-bold text-emerald-400">{currentResult.bestModel}</span>
                </div>
              </div>

              {/* Models benchmark table */}
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2">Model</th>
                      <th className="py-2">SOH R²</th>
                      <th className="py-2">SOH MAE</th>
                      <th className="py-2">RUL R²</th>
                      <th className="py-2">RUL MAE</th>
                      <th className="py-2">Train Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {(currentResult.modelsEvaluated || []).map((m) => (
                      <tr key={m.modelName}>
                        <td className="py-2 font-semibold">{m.modelName}</td>
                        <td className="py-2 font-mono text-emerald-400">{m.soh?.r2}</td>
                        <td className="py-2 font-mono">{m.soh?.mae}</td>
                        <td className="py-2 font-mono text-cyan-400">{m.rul?.r2}</td>
                        <td className="py-2 font-mono">{m.rul?.mae}</td>
                        <td className="py-2 font-mono text-slate-400">{m.trainingTimeMs} ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Saved History Log */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Clock size={18} className="text-slate-400" />
              Experiment History Log
            </h3>

            {history.length === 0 ? (
              <div className="text-xs text-slate-500 py-4 text-center">No previous experiments recorded yet.</div>
            ) : (
              <div className="space-y-3">
                {history.map((exp) => (
                  <div key={exp._id || exp.experimentId} className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-200">{exp.dataset}</div>
                      <div className="text-slate-400 mt-0.5">
                        Seed: {exp.randomSeed} | Split: {exp.trainTestRatio} | Best: <span className="text-emerald-400 font-semibold">{exp.bestModel}</span>
                      </div>
                    </div>
                    <div className="text-right text-slate-500 font-mono text-[10px]">
                      {new Date(exp.createdAt || exp.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
