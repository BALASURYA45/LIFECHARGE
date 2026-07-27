import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import MetricCard from '../components/MetricCard.jsx';
import { batteryFields } from '../constants/batteryFields.js';
import { simulateWhatIf } from '../services/whatIfService.js';
import { getErrorMessage } from '../utils/getErrorMessage.js';

const initialBaseline = {
  batteryAge: 3,
  chargingCycles: 1200,
  chargingFrequency: 6,
  fastChargingUsage: 55,
  averageTemperature: 36,
  chargingDuration: 4,
  dailyDistance: 90,
  socHistory: 85,
  batteryCapacity: 72,
  voltage: 385,
  current: 80,
};

const initialScenario = {
  ...initialBaseline,
  fastChargingUsage: 25,
  averageTemperature: 30,
  chargingFrequency: 4,
  chargingDuration: 3,
  socHistory: 70,
};

function toNumericPayload(values) {
  return Object.fromEntries(batteryFields.map((field) => [field.name, Number(values[field.name])]));
}

function FieldControl({ field, values, onChange }) {
  return (
    <label className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <span className="flex items-center justify-between gap-3 text-sm font-medium text-slate-900">
        {field.label}
        <span className="text-xs text-slate-500">{field.unit}</span>
      </span>
      <input
        className="mt-3 w-full accent-cyan-600"
        type="range"
        min={field.min}
        max={field.max}
        step={field.step}
        value={values[field.name]}
        onChange={(event) => onChange(field.name, event.target.value)}
      />
      <input
        className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
        type="number"
        min={field.min}
        max={field.max}
        step={field.step}
        value={values[field.name]}
        onChange={(event) => onChange(field.name, event.target.value)}
      />
    </label>
  );
}

export default function WhatIfPage() {
  const { t } = useTranslation();
  const [baseline, setBaseline] = useState(initialBaseline);
  const [scenario, setScenario] = useState(initialScenario);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  function updateBaseline(field, value) {
    setBaseline((current) => ({ ...current, [field]: value }));
  }

  function updateScenario(field, value) {
    setScenario((current) => ({ ...current, [field]: value }));
  }

  function copyBaselineToScenario() {
    setScenario(baseline);
    setResult(null);
  }

  async function handleSimulate() {
    setError('');
    setIsSimulating(true);

    try {
      const data = await simulateWhatIf({
        baseline: toNumericPayload(baseline),
        scenario: toNumericPayload(scenario),
      });
      setResult(data.result);
    } catch (simulationError) {
      setError(getErrorMessage(simulationError));
    } finally {
      setIsSimulating(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="lc-card-static rounded-2xl p-5 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">{t('whatIf.title')}</p>
            <h1 className="mt-2 text-3xl font-black text-slate-900 md:text-4xl tracking-tight">{t('whatIf.heading')}</h1>
            <p className="mt-3 max-w-3xl text-slate-600 leading-relaxed">
              {t('whatIf.description')}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              className="lc-focus rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200"
              type="button"
              onClick={copyBaselineToScenario}
            >
              {t('whatIf.copyBaseline')}
            </button>
            <button
              className="lc-focus rounded-xl bg-slate-900 px-5 py-3 font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 shadow-lg shadow-slate-900/20 transition-all duration-200"
              type="button"
              disabled={isSimulating}
              onClick={handleSimulate}
            >
              {isSimulating ? t('whatIf.simulating') : t('whatIf.runSimulation')}
            </button>
          </div>
        </div>
      </div>

      {error ? <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}

      {result ? (
        <section className="lc-card-static rounded-xl overflow-hidden">
          <div className="border-b border-slate-200 p-5">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <h2 className="text-lg font-black text-slate-900">{t('whatIf.result')}</h2>
                <p className="mt-1 text-sm text-slate-600">{t('whatIf.generatedUsing', { model: result.modelName })}</p>
              </div>
              <span className="w-fit rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700">
                {result.scenario.batteryStatus}
              </span>
            </div>
          </div>
          <div className="p-5 sm:p-6">
            <div className="grid gap-4 md:grid-cols-4">
              <MetricCard label={t('whatIf.scenarioSoh')} value={`${result.scenario.SOH}%`} />
              <MetricCard label={t('whatIf.sohChange')} value={`${result.delta.SOH > 0 ? '+' : ''}${result.delta.SOH}%`} tone={result.delta.SOH >= 0 ? 'emerald' : 'red'} />
              <MetricCard label={t('whatIf.scenarioRul')} value={`${result.scenario.RUL} months`} />
              <MetricCard label={t('whatIf.rulChange')} value={`${result.delta.RUL > 0 ? '+' : ''}${result.delta.RUL} months`} tone={result.delta.RUL >= 0 ? 'emerald' : 'red'} />
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-black text-slate-900">{t('whatIf.scenarioInsights')}</h3>
              <ul className="mt-3 space-y-2">
                {result.insights.map((insight) => (
                  <li key={insight} className="text-sm leading-7 text-slate-700">{insight}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="lc-card-static rounded-xl p-4 sm:p-5">
          <h2 className="text-lg font-black text-slate-900">{t('whatIf.baseline')}</h2>
          <div className="mt-4 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            {batteryFields.map((field) => (
              <FieldControl key={field.name} field={field} values={baseline} onChange={updateBaseline} />
            ))}
          </div>
        </section>

        <section className="lc-card-static rounded-xl p-4 sm:p-5">
          <h2 className="text-lg font-black text-slate-900">{t('whatIf.scenario')}</h2>
          <div className="mt-4 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            {batteryFields.map((field) => (
              <FieldControl key={field.name} field={field} values={scenario} onChange={updateScenario} />
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}