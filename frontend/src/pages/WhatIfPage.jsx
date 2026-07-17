import { useState } from 'react';
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
    <label className="block rounded border border-slate-800 bg-slate-950 p-4">
      <span className="flex items-center justify-between gap-3 text-sm font-medium text-slate-200">
        {field.label}
        <span className="text-xs text-slate-500">{field.unit}</span>
      </span>
      <input
        className="mt-3 w-full accent-teal-400"
        type="range"
        min={field.min}
        max={field.max}
        step={field.step}
        value={values[field.name]}
        onChange={(event) => onChange(field.name, event.target.value)}
      />
      <input
        className="mt-3 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-teal-400"
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
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-300">What-If Analysis</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Simulate battery health changes</h1>
          <p className="mt-2 max-w-3xl text-slate-400">
            Compare a baseline battery profile against a changed scenario to estimate how charging, temperature, SOC, and usage affect SOH and RUL.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            className="rounded border border-slate-700 px-4 py-3 font-semibold text-slate-100 hover:border-teal-400"
            type="button"
            onClick={copyBaselineToScenario}
          >
            Copy baseline
          </button>
          <button
            className="rounded bg-teal-500 px-4 py-3 font-semibold text-slate-950 hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-70"
            type="button"
            disabled={isSimulating}
            onClick={handleSimulate}
          >
            {isSimulating ? 'Simulating...' : 'Run simulation'}
          </button>
        </div>
      </div>

      {error ? <p className="rounded border border-red-900 bg-red-950 p-3 text-sm text-red-200">{error}</p> : null}

      {result ? (
        <section className="rounded border border-slate-800 bg-slate-900 p-5">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h2 className="text-lg font-semibold text-white">Simulation result</h2>
              <p className="mt-1 text-sm text-slate-400">Generated using {result.modelName}</p>
            </div>
            <span className="rounded border border-slate-700 px-3 py-2 text-sm text-slate-300">
              {result.scenario.batteryStatus}
            </span>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-4">
            <MetricCard label="Scenario SOH" value={`${result.scenario.SOH}%`} />
            <MetricCard label="SOH Change" value={`${result.delta.SOH > 0 ? '+' : ''}${result.delta.SOH}%`} />
            <MetricCard label="Scenario RUL" value={`${result.scenario.RUL} months`} />
            <MetricCard label="RUL Change" value={`${result.delta.RUL > 0 ? '+' : ''}${result.delta.RUL} months`} />
          </div>

          <div className="mt-5 rounded border border-slate-800 bg-slate-950 p-4">
            <h3 className="font-semibold text-white">Scenario insights</h3>
            <ul className="mt-3 space-y-2">
              {result.insights.map((insight) => (
                <li key={insight} className="text-sm leading-6 text-slate-300">
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold text-white">Baseline</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {batteryFields.map((field) => (
              <FieldControl key={field.name} field={field} values={baseline} onChange={updateBaseline} />
            ))}
          </div>
        </section>

        <section className="rounded border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold text-white">Scenario</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {batteryFields.map((field) => (
              <FieldControl key={field.name} field={field} values={scenario} onChange={updateScenario} />
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
