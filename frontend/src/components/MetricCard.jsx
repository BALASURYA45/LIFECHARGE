export default function MetricCard({ label, value, tone = 'slate', detail, icon: Icon }) {
  const tones = {
    cyan: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-950/30 dark:text-emerald-100',
    emerald: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-950/30 dark:text-emerald-100',
    amber: 'border-amber-200 bg-amber-50/80 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200',
    red: 'border-emerald-500/30 bg-emerald-950/30 text-emerald-200 dark:border-emerald-500/40 dark:bg-emerald-950/40 dark:text-emerald-200',
    slate: 'border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white',
    violet: 'border-violet-200 bg-violet-50/80 text-violet-900 dark:border-violet-900/50 dark:bg-violet-950/30 dark:text-violet-200',
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
