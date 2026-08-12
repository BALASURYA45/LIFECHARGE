import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import { Activity, Clock, ShieldCheck, AlertTriangle, Layers, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import researchService from '../services/researchService.js';
import { getBatteryHistory } from '../services/batteryService.js';

export default function EarlyLifePage() {
  const { t } = useTranslation();
  const [selectedWindow, setSelectedWindow] = useState(100);
  const [batteryId, setBatteryId] = useState('');
  const [batteries, setBatteries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  // Form input state for standalone evaluation
  const [formData, setFormData] = useState({
    batteryAge: 1.5,
    chargingCycles: 350,
    chargingFrequency: 1.2,
    fastChargingUsage: 25,
    averageTemperature: 28,
    chargingDuration: 3.5,
    dailyDistance: 45,
    socHistory: 65,
    batteryCapacity: 60,
    voltage: 350,
    current: 45,
  });

  useEffect(() => {
    async function loadBatteries() {
      try {
        const res = await getBatteryHistory();
        if (res?.data?.length) {
          setBatteries(res.data);
          setBatteryId(res.data[0]._id);
        }
      } catch (err) {
        console.warn('Using default battery form values');
      }
    }
    loadBatteries();
    runPrediction(selectedWindow);
  }, []);

  const runPrediction = async (windowSize) => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        cyclesUsed: windowSize,
        ...formData,
      };
      const res = await researchService.predictEarlyLife(payload);
      if (res?.earlyLife) {
        setResult(res.earlyLife);
      } else {
        setError('Failed to calculate early-life prognosis');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error executing early-life prognosis');
    } finally {
      setLoading(false);
    }
  };

  const handleWindowChange = (w) => {
    setSelectedWindow(w);
    runPrediction(w);
  };

  // Combine actual and predicted trajectories for chart
  const combinedTrajectoryData = React.useMemo(() => {
    if (!result) return [];
    const predMap = new Map((result.predictedTrajectory || []).map((p) => [p.cycle, p.soh]));
    const actMap = new Map((result.actualTrajectory || []).map((a) => [a.cycle, a.soh]));

    const cycles = Array.from(new Set([...predMap.keys(), ...actMap.keys()])).sort((a, b) => a - b);

    return cycles.map((c) => ({
      cycle: c,
      predictedSoh: predMap.get(c) ?? null,
      actualSoh: actMap.get(c) ?? null,
    }));
  }, [result]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 mb-2">
            <Activity size={14} /> {t('earlyLifePage.badge', 'Research Module: Step 3')}
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">{t('earlyLifePage.title', 'Early-Life Battery Prognostics')}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {t('earlyLifePage.subtitle', 'Investigate how accurately future degradation, SOH, and RUL can be predicted from limited early-cycle battery data.')}
          </p>
        </div>

        <button
          onClick={() => runPrediction(selectedWindow)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-lg shadow-cyan-500/20 transition disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          {t('earlyLifePage.runPrognosis', 'Run Prognosis')}
        </button>
      </div>

      {/* Control Panel: Cycle Window Selector */}
      <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl p-6 shadow-xl text-white">
        <h2 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Layers size={18} className="text-cyan-400" />
          {t('earlyLifePage.selectWindow', 'Select Early-Life Cycle Window Used for Prediction')}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[50, 100, 150, 200].map((w) => (
            <button
              key={w}
              onClick={() => handleWindowChange(w)}
              className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
                selectedWindow === w
                  ? 'bg-cyan-950/80 border-cyan-500 text-white ring-2 ring-cyan-500/50'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-500'
              }`}
            >
              <div className="text-2xl font-black">{w} {t('units.cycles', 'Cycles')}</div>
              <div className="text-xs text-slate-400 mt-1">
                {t('earlyLifePage.cyclesObserved', 'First {{count}} cycle observations (~{{months}} months)', { count: w, months: Math.round((w / 180) * 12) })}
              </div>
              {selectedWindow === w && (
                <div className="absolute top-2 right-2 size-2 rounded-full bg-cyan-400 animate-ping" />
              )}
            </button>
          ))}
        </div>

        {/* Battery Selector Dropdown if available */}
        {batteries.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-4 text-xs text-slate-400">
            <span>Select Target Battery:</span>
            <select
              value={batteryId}
              onChange={(e) => setBatteryId(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
            >
              {batteries.map((b) => (
                <option key={b._id} value={b._id}>
                  Battery ({b.batteryCapacity} kWh, {b.chargingCycles} cycles)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Main Results Dashboard */}
      {result && (
        <div className="space-y-8">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-md">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('earlyLifePage.observedWindow', 'Observed Window')}</div>
              <div className="text-3xl font-black text-cyan-400 mt-2">{result.cyclesUsed} {t('units.cycles', 'Cycles')}</div>
              <div className="text-xs text-slate-400 mt-1">First {result.cyclesUsed} cycles used</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-md">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('earlyLifePage.predictedSoh', 'Predicted SOH')}</div>
              <div className="text-3xl font-black text-emerald-400 mt-2">{result.predictedSoh}%</div>
              <div className="text-xs text-slate-400 mt-1">At cycle {result.cyclesUsed}</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-md">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('earlyLifePage.predictedRul', 'Predicted RUL')}</div>
              <div className="text-3xl font-black text-amber-400 mt-2">{result.predictedRul} {t('units.cycles', 'Cycles')}</div>
              <div className="text-xs text-slate-400 mt-1">Remaining until 80% SOH</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-md">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('earlyLifePage.confidenceScore', 'Confidence Score')}</div>
              <div className="text-3xl font-black text-purple-400 mt-2">{result.confidenceScore}%</div>
              <div className="text-xs text-slate-400 mt-1">Reliability rating</div>
            </div>
          </div>

          {/* Graph: Actual vs Predicted Degradation */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-100">{t('earlyLifePage.trajectoryTitle', 'Degradation Trajectory Comparison')}</h3>
                <p className="text-xs text-slate-400">
                  {t('earlyLifePage.trajectoryDesc', 'Actual early-life observations (solid blue line) vs. Predicted full lifecycle trajectory (dashed green line)')}
                </p>
              </div>
              <div className="px-3 py-1 rounded-lg bg-slate-800 text-xs text-slate-300 font-mono">
                Window: {selectedWindow} cycles
              </div>
            </div>

            <div className="h-80 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={combinedTrajectoryData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="cycle" stroke="#94a3b8" label={{ value: 'Cycles', position: 'insideBottom', offset: -5 }} />
                  <YAxis domain={[40, 105]} stroke="#94a3b8" label={{ value: 'SOH (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                  <Legend verticalAlign="top" height={36} />
                  <ReferenceLine x={selectedWindow} stroke="#e11d48" strokeDasharray="4 4" label={{ value: 'Window Threshold', fill: '#e11d48', fontSize: 12 }} />
                  <ReferenceLine y={80} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: '80% EOL Threshold', fill: '#f59e0b', fontSize: 12 }} />

                  <Line type="monotone" dataKey="actualSoh" name="ACTUAL Degradation" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} connectNulls={false} />
                  <Line type="monotone" dataKey="predictedSoh" name="PREDICTED Trajectory" stroke="#4ade80" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Window Performance Comparison Error Table */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck size={20} className="text-cyan-400" />
              {t('earlyLifePage.metricsTitle', 'Early-Life Window Error Metric Comparison')}
            </h3>
            <p className="text-xs text-slate-400">
              {t('earlyLifePage.metricsDesc', 'Experimental comparison demonstrating prediction accuracy improvement as early observation cycle window increases.')}
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/50">
                    <th className="py-3 px-4">{t('earlyLifePage.earlyWindowCol', 'Early-Life Window')}</th>
                    <th className="py-3 px-4">{t('earlyLifePage.predictedRulCol', 'Predicted RUL')}</th>
                    <th className="py-3 px-4">{t('earlyLifePage.sohMaeCol', 'SOH MAE (%)')}</th>
                    <th className="py-3 px-4">{t('earlyLifePage.sohRmseCol', 'SOH RMSE (%)')}</th>
                    <th className="py-3 px-4">{t('earlyLifePage.rulMaeCol', 'RUL MAE (Cycles)')}</th>
                    <th className="py-3 px-4">{t('earlyLifePage.reliabilityCol', 'Reliability')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {(result.windowComparisons || []).map((row) => {
                    const isSelected = row.windowCycles === selectedWindow;
                    return (
                      <tr
                        key={row.windowCycles}
                        className={`transition ${isSelected ? 'bg-cyan-950/40 font-semibold text-cyan-300' : 'hover:bg-slate-800/40'}`}
                      >
                        <td className="py-3 px-4 flex items-center gap-2">
                          {row.windowCycles} Cycles
                          {isSelected && <span className="px-2 py-0.5 rounded text-xs bg-cyan-500/20 text-cyan-400">Active</span>}
                        </td>
                        <td className="py-3 px-4 font-mono">{row.predictedRul} cycles</td>
                        <td className="py-3 px-4 font-mono">{row.mae}%</td>
                        <td className="py-3 px-4 font-mono">{row.rmse}%</td>
                        <td className="py-3 px-4 font-mono">{row.rulMae} cycles</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              row.reliability === 'High'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : row.reliability === 'Medium'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {row.reliability}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
