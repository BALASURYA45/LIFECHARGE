import React from 'react';
import { useTranslation } from 'react-i18next';
import { HelpCircle, AlertTriangle, CheckCircle2, TrendingDown, TrendingUp, Sparkles, RefreshCw } from 'lucide-react';

const directionStyles = {
  positive: 'bg-emerald-500',
  negative: 'bg-emerald-500',
};

function FactorList({ title, factors, isNegative }) {
  if (!factors?.length) return null;

  return (
    <div className={`rounded-2xl border p-4 space-y-3 ${isNegative ? 'border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/20' : 'border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/20'}`}>
      <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-slate-900 dark:text-white">
        {isNegative ? <TrendingDown size={16} className="text-emerald-500" /> : <TrendingUp size={16} className="text-emerald-500" />}
        {title}
      </h4>
      <ul className="space-y-2">
        {factors.map((factor, idx) => (
          <li key={`${factor.feature}-${idx}`} className="text-xs leading-relaxed flex items-start justify-between gap-3 text-slate-700 dark:text-slate-300">
            <span className="font-semibold">{factor.label || factor.feature}</span>
            <span className={`shrink-0 font-bold px-2 py-0.5 rounded-md text-[10px] ${isNegative ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'}`}>
              {factor.impact}% impact
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ExplanationPanel({ explanation, isLoading, onGenerate }) {
  const { t } = useTranslation();

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-md dark:border-slate-800 dark:bg-slate-900 space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1 text-xs font-bold text-teal-600 dark:text-teal-400 mb-1">
            <Sparkles size={14} /> EXPLAINABLE AI (SHAP)
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Why is this Battery in this Risk Level?</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {explanation ? `Analysis Method: ${explanation.method || 'TreeSHAP Feature Attribution'}` : 'Click below to generate a detailed AI breakdown.'}
          </p>
        </div>
        {onGenerate ? (
          <button
            className="lc-focus inline-flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white px-4 py-2.5 text-xs font-bold shadow-md transition disabled:opacity-50 shrink-0"
            type="button"
            disabled={isLoading}
            onClick={onGenerate}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            {isLoading ? 'Analyzing Risk Drivers...' : explanation ? 'Re-analyze Factors' : 'Explain Risk Level'}
          </button>
        ) : null}
      </div>

      {isLoading ? (
        <div className="py-8 text-center space-y-3">
          <div className="size-8 mx-auto border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Computing SHAP feature attributions and degradation risk factors...</p>
        </div>
      ) : explanation ? (
        <div className="space-y-6">
          {/* Plain English Verdict Banner */}
          <div className="rounded-2xl border border-teal-500/20 bg-teal-500/5 p-4 sm:p-5 dark:bg-teal-950/20 space-y-2">
            <h3 className="text-sm font-black text-teal-700 dark:text-teal-300 flex items-center gap-2">
              <HelpCircle size={17} /> Risk Verdict & Degradation Mechanism
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200 font-medium">
              {explanation.plainEnglishExplanation}
            </p>
          </div>

          {/* Top Negative and Positive Drivers */}
          <div className="grid gap-4 md:grid-cols-2">
            <FactorList title="Primary Degradation Drivers (Risk Accelerators)" factors={explanation.topNegativeFactors} isNegative={true} />
            <FactorList title="Positive Health Preserving Factors" factors={explanation.topPositiveFactors} isNegative={false} />
          </div>

          {/* Feature Importance Bars */}
          {explanation.featureImportance?.length ? (
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                SHAP Feature Attribution Scores
              </h3>
              <div className="space-y-3">
                {explanation.featureImportance.map((feature) => (
                  <div key={feature.feature} className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-800 dark:text-slate-200">{feature.label || feature.feature}</span>
                      <span className="text-slate-500 font-mono text-[11px]">{feature.impact}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${directionStyles[feature.direction] || 'bg-teal-500'}`}
                        style={{ width: `${Math.min(feature.impact, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-500 text-center font-medium">
          Detailed risk driver analysis will be generated automatically after running your routine check.
        </div>
      )}
    </section>
  );
}
