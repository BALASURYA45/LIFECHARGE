import { Activity, Car, ShieldAlert, TrendingUp, AlertTriangle, Gauge } from 'lucide-react';

const statusStyles = {
  Excellent: 'border-cyan-600 bg-cyan-50 text-cyan-800',
  Good: 'border-emerald-600 bg-emerald-50 text-emerald-800',
  Warning: 'border-amber-600 bg-amber-50 text-amber-800',
  Critical: 'border-red-600 bg-red-50 text-red-800',
};

const riskStyles = {
  'Low Risk': 'border-cyan-600 bg-cyan-50 text-cyan-800',
  'Medium Risk': 'border-amber-600 bg-amber-50 text-amber-800',
  'High Risk': 'border-red-600 bg-red-50 text-red-800',
};

function BatteryBar({ soh }) {
  const segments = 10;
  const filled = Math.round((soh / 100) * segments);
  const tone = soh >= 80 ? 'bg-cyan-500' : soh >= 60 ? 'bg-amber-500' : soh >= 40 ? 'bg-orange-500' : 'bg-red-500';
  const shadow = soh >= 80 ? 'shadow-[0_0_20px_rgba(6,182,212,0.45)]' : '';

  return (
    <div className="flex items-end gap-1">
      {Array.from({ length: segments }).map((_, i) => (
        <span
          key={i}
          className={`h-12 w-full rounded-sm transition-all ${
            i < filled ? `${tone} ${shadow}` : 'bg-slate-200'
          }`}
        />
      ))}
    </div>
  );
}

function ProgressBar({ value, max = 100, color = 'bg-accent' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="h-2 w-full rounded-full bg-slate-200">
      <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function PredictionResult({ prediction }) {
  if (!prediction) {
    return (
      <section className="lc-card-static rounded-xl p-5 sm:p-6">
        <div className="grid size-12 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
          <ShieldAlert size={24} aria-hidden="true" />
        </div>
        <h2 className="mt-5 text-lg font-black text-slate-900">Your Battery Health Report</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Complete the 3-step form on the left to get a detailed battery health report with SOH, remaining life, risk assessment, and maintenance tips.
        </p>
      </section>
    );
  }

  const sohColor = prediction.SOH >= 80 ? 'text-accent-light' : prediction.SOH >= 60 ? 'text-amber-400' : prediction.SOH >= 40 ? 'text-orange-400' : 'text-red-400';
  const enhancements = prediction.enhancements || {};

  return (
    <section className="lc-card-static rounded-xl overflow-hidden">
      {/* Vehicle Info */}
      {prediction.vehicleMake && prediction.vehicleModel ? (
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50/60 px-5 py-3 text-xs text-slate-600">
          <Car size={14} className="text-slate-900" aria-hidden="true" />
          <span className="font-semibold">{prediction.vehicleMake} {prediction.vehicleModel}</span>
          {prediction.vehicleType ? <span className="text-slate-500">({prediction.vehicleType})</span> : null}
        </div>
      ) : null}

      <div className="p-5 sm:p-6">
        {/* Status Badges */}
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Diagnostic Report</p>
            <h2 className="mt-1 text-2xl font-black text-slate-900 tracking-tight">Battery Health Result</h2>
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
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-600">Battery Health</span>
            <span className={`text-3xl font-black ${sohColor}`}>{prediction.SOH}%</span>
          </div>
          <BatteryBar soh={prediction.SOH} />
          <div className="mt-3 flex justify-between text-[11px] text-slate-500">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Remaining Life</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{prediction.RUL} <span className="text-sm font-medium text-slate-500">months</span></p>
            <p className="mt-1 text-[11px] text-slate-500">Estimated service window</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Risk Score</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{prediction.riskScore ?? 0}<span className="text-sm font-medium text-slate-500">/100</span></p>
            <p className="mt-1 text-[11px] text-slate-500">Operational risk level</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Confidence</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{prediction.confidenceScore}<span className="text-sm font-medium text-slate-500">%</span></p>
            <p className="mt-1 text-[11px] text-slate-500">Model certainty</p>
          </div>
        </div>

        {/* Enhanced Analytics Section */}
        {enhancements.thermalStress || enhancements.cyclicStress || enhancements.confidenceInterval ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 mb-3">
              <Gauge size={18} className="text-slate-900" aria-hidden="true" />
              <h3 className="text-sm font-black text-slate-900">Performance Analytics</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {enhancements.thermalStress ? (
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Thermal Stress</span>
                    <span className="text-xs font-bold text-slate-700">{enhancements.thermalStress.level}</span>
                  </div>
                  <div className="mt-2">
                    <ProgressBar value={enhancements.thermalStress.score} max={100} color={enhancements.thermalStress.score > 50 ? 'bg-red-500' : 'bg-emerald-500'} />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">Score: {enhancements.thermalStress.score}/100</p>
                </div>
              ) : null}

              {enhancements.cyclicStress ? (
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Cyclic Stress</span>
                    <span className="text-xs font-bold text-slate-700">{enhancements.cyclicStress.level}</span>
                  </div>
                  <div className="mt-2">
                    <ProgressBar value={enhancements.cyclicStress.score} max={100} color={enhancements.cyclicStress.score > 70 ? 'bg-red-500' : enhancements.cyclicStress.score > 40 ? 'bg-amber-500' : 'bg-emerald-500'} />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">Score: {enhancements.cyclicStress.score}/100</p>
                </div>
              ) : null}

              {enhancements.degradationRate ? (
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Projected Service Life</span>
                  <p className="mt-2 text-2xl font-black text-slate-900">
                    {enhancements.degradationRate.value} <span className="text-sm font-medium text-slate-500">{enhancements.degradationRate.unit}</span>
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">Based on current degradation trajectory</p>
                </div>
              ) : null}

              {enhancements.confidenceInterval ? (
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Prediction Confidence Range</span>
                  <p className="mt-2 text-sm text-slate-700">
                    SOH: {enhancements.confidenceInterval.soh.lower}% - {enhancements.confidenceInterval.soh.upper}%
                  </p>
                  <p className="text-sm text-slate-700">
                    RUL: {enhancements.confidenceInterval.rul.lower} - {enhancements.confidenceInterval.rul.upper} months
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Anomaly Detection */}
        {enhancements.anomalyDetection ? (
          <div className={`mt-4 rounded-xl border p-4 ${enhancements.anomalyDetection.isAnomalous ? 'border-red-700 bg-red-950' : 'border-emerald-700 bg-emerald-950'}`}>
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className={enhancements.anomalyDetection.isAnomalous ? 'text-red-100' : 'text-emerald-100'} aria-hidden="true" />
              <h3 className="text-sm font-black text-slate-900">Anomaly Detection</h3>
              <span className={`ml-auto rounded-lg border px-2 py-1 text-xs font-bold ${enhancements.anomalyDetection.isAnomalous ? 'border-red-400 bg-red-900 text-red-100' : 'border-emerald-400 bg-emerald-900 text-emerald-100'}`}>
                {enhancements.anomalyDetection.isAnomalous ? 'Anomaly Detected' : 'Normal'}
              </span>
            </div>
            {enhancements.anomalyDetection.factors?.length ? (
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {enhancements.anomalyDetection.factors.map((factor, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm leading-7 text-slate-600">
                    <span className="mt-1.5 block size-1.5 shrink-0 rounded-full bg-red-500" />
                    {factor}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        {/* Prognosis Scenarios */}
        {enhancements.prognosis ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-slate-900" aria-hidden="true" />
              <h3 className="text-sm font-black text-slate-900">Prognosis Scenarios</h3>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {Object.entries(enhancements.prognosis).map(([key, scenario]) => (
                <div key={key} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{scenario.label}</p>
                  <p className="mt-1 text-lg font-black text-slate-900">{scenario.monthsToReplacement} <span className="text-xs font-medium text-slate-500">months</span></p>
                  <p className="text-[11px] text-slate-500">Est. remaining life</p>
                  <p className="mt-1 text-xs text-slate-600">80% SOH in ~{scenario.monthsTo80SOH} months</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Degradation Trend */}
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-slate-900" aria-hidden="true" />
            <h3 className="text-sm font-black text-slate-900">Degradation Trend</h3>
          </div>
          <p className="mt-2 text-sm leading-7 text-slate-600">{prediction.degradationTrend}</p>
        </div>

        {/* Risk Factors */}
        {prediction.riskFactors?.length ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-black text-slate-900">Risk Drivers</h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {prediction.riskFactors.map((factor) => (
                <li key={factor} className="flex items-start gap-2 text-sm leading-7 text-slate-600">
                  <span className="mt-1.5 block size-1.5 shrink-0 rounded-full bg-amber-500" />
                  {factor}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Model Info */}
        <p className="mt-4 text-[11px] text-slate-500">Analysis by {prediction.modelName}</p>
      </div>
    </section>
  );
}
