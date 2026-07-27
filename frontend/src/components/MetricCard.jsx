export default function MetricCard({ label, value, tone = 'slate', detail, icon: Icon }) {
  const tones = {
    cyan: 'border-cyan-200 bg-cyan-50/80 text-cyan-900',
    emerald: 'border-emerald-200 bg-emerald-50/80 text-emerald-900',
    amber: 'border-amber-200 bg-amber-50/80 text-amber-900',
    red: 'border-red-200 bg-red-50/80 text-red-900',
    slate: 'border-slate-200 bg-white text-slate-900',
    violet: 'border-violet-200 bg-violet-50/80 text-violet-900',
  };

  return (
    <article className={`lc-card rounded-xl p-4 sm:p-5 ${tones[tone] ?? tones.slate}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        {Icon ? <Icon size={18} className="text-slate-400" aria-hidden="true" /> : null}
      </div>
      <p className="mt-3 break-words text-3xl font-black text-slate-900">{value ?? '-'}</p>
      {detail ? <p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p> : null}
    </article>
  );
}
