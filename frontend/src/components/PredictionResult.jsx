import MetricCard from './MetricCard.jsx';

const statusStyles = {
  Excellent: 'border-teal-700 bg-teal-950 text-teal-100',
  Good: 'border-emerald-700 bg-emerald-950 text-emerald-100',
  Warning: 'border-amber-700 bg-amber-950 text-amber-100',
  Critical: 'border-red-700 bg-red-950 text-red-100',
};

export default function PredictionResult({ prediction }) {
  if (!prediction) {
    return null;
  }

  return (
    <section className="rounded border border-slate-800 bg-slate-900 p-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h2 className="text-lg font-semibold text-white">Prediction result</h2>
          <p className="mt-1 text-sm text-slate-400">Generated using {prediction.modelName}</p>
        </div>
        <span className={`rounded border px-3 py-2 text-sm font-semibold ${statusStyles[prediction.batteryStatus]}`}>
          {prediction.batteryStatus}
        </span>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-4">
        <MetricCard label="SOH" value={`${prediction.SOH}%`} />
        <MetricCard label="RUL" value={`${prediction.RUL} months`} />
        <MetricCard label="Confidence" value={`${prediction.confidenceScore}%`} />
        <MetricCard label="Trend" value={prediction.degradationTrend} />
      </div>
    </section>
  );
}
