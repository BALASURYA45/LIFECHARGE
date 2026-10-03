import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Zap, Thermometer, BatteryCharging, CheckCircle2, ArrowRight, RefreshCw } from 'lucide-react';

const priorityStyles = {
  High: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  Medium: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400',
  Low: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
};

const defaultPreventionPlan = [
  {
    title: 'Optimize Fast Charging Ratio (DC vs. AC Level 2)',
    description: 'Restrict DC Fast Charging to emergency long-distance trips. For routine daily recharges, use AC Level 2 charging overnight to minimize internal cell heating and SEI layer growth.',
    priority: 'High',
    category: 'Charging Strategy',
  },
  {
    title: '20% to 80% State of Charge (SOC) Guard Rail',
    description: 'Keep daily operational battery state of charge between 20% and 80%. Avoid leaving the EV parked at 100% full charge for extended periods in warm weather.',
    priority: 'High',
    category: 'SOC Management',
  },
  {
    title: 'Thermal Mitigation & Post-Drive Cooling Window',
    description: 'Allow a 15–20 minute battery cooling window after high-speed highway driving before initiating charge sessions to prevent thermal stress accumulation.',
    priority: 'Medium',
    category: 'Thermal Care',
  },
  {
    title: 'Monthly BMS Cell Balancing Routine',
    description: 'Perform a slow 100% AC charge once a month to allow the Battery Management System (BMS) to perform passive cell voltage balancing across module strings.',
    priority: 'Low',
    category: 'Maintenance',
  },
];

export default function RecommendationPanel({ recommendations, isLoading, onGenerate }) {
  const { t } = useTranslation();
  const items = recommendations?.items?.length ? recommendations.items : defaultPreventionPlan;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-md dark:border-slate-800 dark:bg-slate-900 space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
            <ShieldCheck size={14} /> DEGRADATION PREVENTION PLAN
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">How to Prevent Degradation & Extend Lifespan</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {recommendations?.summary || 'Targeted operational actions to preserve battery health based on your routine analysis.'}
          </p>
        </div>
        {onGenerate ? (
          <button
            className="lc-focus inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 text-xs font-bold shadow-md transition disabled:opacity-50 shrink-0"
            type="button"
            disabled={isLoading}
            onClick={onGenerate}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            {isLoading ? 'Updating Actions...' : 'Refresh Actions'}
          </button>
        ) : null}
      </div>

      {isLoading ? (
        <div className="py-8 text-center space-y-3">
          <div className="size-8 mx-auto border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Generating tailored prevention actions based on routine stress scores...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, idx) => (
            <article key={`${item.title}-${idx}`} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4 sm:p-5 space-y-2 hover:border-emerald-500/30 transition duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="grid size-6 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black shrink-0">
                    {idx + 1}
                  </span>
                  {item.title}
                </h3>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 bg-slate-200/60 dark:bg-slate-700/60 px-2 py-0.5 rounded-md">
                    {item.category}
                  </span>
                  <span className={`rounded-md border px-2.5 py-0.5 text-[10px] font-extrabold ${priorityStyles[item.priority] || priorityStyles.Low}`}>
                    {item.priority} Priority
                  </span>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 pl-8">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
