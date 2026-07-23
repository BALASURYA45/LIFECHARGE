export default function MetricCard({ label, value, tone = 'cyan', detail }) {
  const tones = {
    cyan: 'border-cyan-200 bg-cyan-50 text-cyan-900',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    amber: 'border-amber-200 bg-amber-50 text-amber-900',
    red: 'border-red-200 bg-red-50 text-red-900',
    slate: 'border-slate-300 bg-slate-100 text-slate-900',
  };

  return (
    <article className={`rounded-lg border p-4 ${tones[tone] ?? tones.cyan}`}>
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="mt-2 break-words text-2xl font-black text-slate-900">{value ?? '-'}</p>
      {detail ? <p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p> : null}
    </article>
  );
}
