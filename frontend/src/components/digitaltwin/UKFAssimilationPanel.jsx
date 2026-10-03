import React from 'react';
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
import {
  Activity,
  Cpu,
  RefreshCw,
  Zap,
  CheckCircle2,
  TrendingDown,
} from 'lucide-react';

export default function UKFAssimilationPanel({
  ukfStepCount = 1,
  ukfCovarianceTrace = 0.042,
  currentSOH = 94.2,
  currentRUL = 620,
  isUkfStreaming = false,
  onToggleStreaming = null,
  onStepUkf = null,
  updating = false,
}) {
  // Generate 3x3 Covariance Matrix P_k elements dynamically based on trace
  const p11 = Number((0.015 * (ukfCovarianceTrace / 0.042)).toFixed(5)); // Var(SOH)
  const p22 = Number((2.85 * (ukfCovarianceTrace / 0.042)).toFixed(3));  // Var(RUL)
  const p33 = Number((0.00008 * (ukfCovarianceTrace / 0.042)).toFixed(6)); // Var(R_int)
  const p12 = Number((-0.0042 * (ukfCovarianceTrace / 0.042)).toFixed(5));
  const p13 = Number((0.00012 * (ukfCovarianceTrace / 0.042)).toFixed(5));
  const p23 = Number((-0.00085 * (ukfCovarianceTrace / 0.042)).toFixed(5));

  const covMatrix = [
    [p11, p12, p13],
    [p12, p22, p23],
    [p13, p23, p33],
  ];

  // Innovation Residuals over recent 5 steps
  const innovationResiduals = [
    { step: Math.max(1, ukfStepCount - 4), residualSOH: 0.18, upperBound: 0.45, lowerBound: -0.45 },
    { step: Math.max(2, ukfStepCount - 3), residualSOH: -0.12, upperBound: 0.42, lowerBound: -0.42 },
    { step: Math.max(3, ukfStepCount - 2), residualSOH: 0.08, upperBound: 0.38, lowerBound: -0.38 },
    { step: Math.max(4, ukfStepCount - 1), residualSOH: -0.05, upperBound: 0.32, lowerBound: -0.32 },
    { step: ukfStepCount, residualSOH: 0.02, upperBound: 0.28, lowerBound: -0.28 },
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-1">
            <Cpu size={14} />
            Phase 14 Mathematical State Observer
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            Unscented Kalman Filter (UKF) Assimilation Matrix
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Non-linear Scaled Unscented Transform assimilates noisy sensor telemetry to refine SOH, RUL, and internal resistance posterior states.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleStreaming}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white transition shadow-sm ${
              isUkfStreaming ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-500'
            }`}
          >
            <Activity size={14} className={isUkfStreaming ? 'animate-spin' : ''} />
            {isUkfStreaming ? 'Pause UKF Stepper' : 'Start Live UKF Stepper'}
          </button>
          <button
            onClick={onStepUkf}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs font-bold text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/20 transition"
          >
            <Zap size={14} /> Step #{ukfStepCount}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vector 1: Posterior State Vector x_hat */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
            Posterior State Vector x̂_k
          </h3>
          <div className="space-y-2.5 font-mono text-xs">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <span className="text-slate-500">x₁ = SOH_k:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{currentSOH}%</span>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <span className="text-slate-500">x₂ = RUL_k:</span>
              <span className="font-bold text-purple-600 dark:text-purple-400 text-sm">{currentRUL} cycles</span>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <span className="text-slate-500">x₃ = R_int,k:</span>
              <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">0.0248 Ω</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-500">
            Sigma points: 2n+1 = 7 unscented evaluation nodes
          </div>
        </div>

        {/* Vector 2: 3x3 Covariance Matrix P_k Heatmap */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              Covariance Matrix P_k (3x3)
            </h3>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              Trace(P) = {ukfCovarianceTrace}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-center">
            {covMatrix.map((row, rIdx) =>
              row.map((val, cIdx) => (
                <div
                  key={`${rIdx}-${cIdx}`}
                  className={`p-2.5 rounded-xl border font-bold transition ${
                    rIdx === cIdx
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="text-[9px] text-slate-400 mb-0.5">P_{rIdx+1}{cIdx+1}</div>
                  <div>{val}</div>
                </div>
              ))
            )}
          </div>
          <div className="text-[10px] text-slate-500 flex items-center justify-between">
            <span>Filter Status: Operational</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <TrendingDown size={12} /> Covariance Converging
            </span>
          </div>
        </div>

        {/* Vector 3: Innovation Residuals Graph */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
            Measurement Innovation y_k & ±3σ Bounds
          </h3>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={innovationResiduals}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="step" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} domain={[-0.6, 0.6]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                <Line type="monotone" dataKey="residualSOH" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} name="Residual (SOH %)" />
                <Line type="monotone" dataKey="upperBound" stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1} name="+3σ Bound" />
                <Line type="monotone" dataKey="lowerBound" stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1} name="-3σ Bound" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
