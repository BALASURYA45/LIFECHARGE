import { Activity, Car, ShieldAlert } from 'lucide-react';

const statusStyles = {
  Excellent: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-100',
  Good: 'border-emerald-700 bg-emerald-950 text-emerald-100',
  Warning: 'border-amber-700 bg-amber-950 text-amber-100',
  Critical: 'border-red-700 bg-red-950 text-red-100',
};

const riskStyles = {
  'Low Risk': 'border-cyan-400/30 bg-cyan-400/10 text-cyan-100',
  'Medium Risk': 'border-amber-700 bg-amber-950 text-amber-100',
  'High Risk': 'border-red-700 bg-red-950 text-red-100',
};

function BatteryBar({ soh }) {
  const segments = 10;
  const filled = Math.round((soh / 100) * segments);
  const tone = soh >= 80 ? 'bg-accent' : soh >= 60 ? 'bg-amber-500' : soh >= 40 ? 'bg-orange-500' : 'bg-red-500';
  const shadow = soh >= 80 ? 'shadow-[0_0_20px_rgba(6,182,212,0.45)]' : '';

  return (
    <div className="flex items-end gap-1">
      {Array.from({ length: segments }).map((_, i) => (
        <span
          key={i}
          className={`h-12 w-full rounded-sm transition-all ${
            i < filled ? `${tone} ${shadow}` : 'bg-slate-700/60'
          }`}
        />
      ))}
    </div>
  );
}

export default function PredictionResult({ prediction }) {
  if (!prediction) {
    return (
      <section className="rounded-lg border border-cyan-500/15 bg-slate-900/80 p-5">
        <div className="grid size-12 place-items-center rounded-lg border border-slate-700 bg-slate-950 text-slate-400">
          <ShieldAlert size={24} aria-hidden="true" />
        </div>
        <h2 className="mt-5 text-lg font-black text-white">Your Battery Health Report</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Complete the 3-step form on the left to get a detailed battery health report with SOH, remaining life, risk assessment, and maintenance tips.
        </p>
      </section>
    );
  }

  const sohColor = prediction.SOH >= 80 ? 'text-accent-light' : prediction.SOH >= 60 ? 'text-amber-400' : prediction.SOH >= 40 ? 'text-orange-400' : 'text-red-400';

  return (
    <section className="rounded-lg border border-cyan-500/15 bg-slate-900/80 p-5">
      {/* Vehicle Info */}
      {prediction.vehicleMake && prediction.vehicleModel ? (
        <div className="mb-4 flex items-center gap-2 text-sm text-slate-400">
          <Car size={16} className="text-accent-light" aria-hidden="true" />
          <span>{prediction.vehicleMake} {prediction.vehicleModel}</span>
          {prediction.vehicleType ? <span className="text-xs text-slate-600">({prediction.vehicleType})</span> : null}
        </div>
      ) : null}

      {/* Status Badges */}
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-200">Diagnostic Report</p>
          <h2 className="mt-1 text-2xl font-black text-white">Battery Health Result</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`w-fit rounded-lg border px-3 py-2 text-sm font-bold ${statusStyles[prediction.batteryStatus] ?? statusStyles.Excellent}`}>
            {prediction.batteryStatus}
          </span>
          <span className={`w-fit rounded-lg border px-3 py-2 text-sm font-bold ${riskStyles[prediction.riskLabel] ?? riskStyles['Low Risk']}`}>
            {prediction.riskLabel ?? 'Low Risk'}
          </span>
        </div>
      </div>

      {/* Battery Visual */}
      <div className="mt-5 rounded-lg border border-slate-700 bg-slate-950/70 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-slate-300">Battery Health</span>
          <span className={`text-3xl font-black ${sohColor}`}>{prediction.SOH}%</span>
        </div>
        <BatteryBar soh={prediction.SOH} />
        <div className="mt-3 flex justify-between text-xs text-slate-500">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-700 bg-slate-950/70 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Remaining Life</p>
          <p className="mt-1 text-2xl font-black text-white">{prediction.RUL} <span className="text-sm font-medium text-slate-400">months</span></p>
          <p className="mt-1 text-xs text-slate-500">Estimated service window</p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-950/70 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Risk Score</p>
          <p className="mt-1 text-2xl font-black text-white">{prediction.riskScore ?? 0}<span className="text-sm font-medium text-slate-400">/100</span></p>
          <p className="mt-1 text-xs text-slate-500">Operational risk level</p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-950/70 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Confidence</p>
          <p className="mt-1 text-2xl font-black text-white">{prediction.confidenceScore}<span className="text-sm font-medium text-slate-400">%</span></p>
          <p className="mt-1 text-xs text-slate-500">Model certainty</p>
        </div>
      </div>

      {/* Degradation Trend */}
      <div className="mt-4 rounded-lg border border-slate-700 bg-slate-950/70 p-4">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-accent-light" aria-hidden="true" />
          <h3 className="font-bold text-white">Degradation Trend</h3>
        </div>
        <p className="mt-2 text-sm text-slate-300">{prediction.degradationTrend}</p>
      </div>

      {/* Risk Factors */}
      {prediction.riskFactors?.length ? (
        <div className="mt-4 rounded-lg border border-slate-700 bg-slate-950/70 p-4">
          <h3 className="font-bold text-white">Risk Drivers</h3>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {prediction.riskFactors.map((factor) => (
              <li key={factor} className="flex items-start gap-2 text-sm leading-6 text-slate-300">
                <span className="mt-1.5 block size-1.5 shrink-0 rounded-full bg-amber-500" />
                {factor}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Model Info */}
      <p className="mt-4 text-xs text-slate-600">Analysis by {prediction.modelName}</p>
    </section>
  );
}