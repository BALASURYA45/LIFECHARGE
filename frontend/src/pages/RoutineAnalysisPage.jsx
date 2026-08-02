import {
  BatteryCharging,
  CalendarDays,
  CalendarRange,
  ClipboardCheck,
  Gauge,
  History,
  Info,
  Route,
  Thermometer,
  Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import ExplanationPanel from '../components/ExplanationPanel.jsx';
import PredictionResult from '../components/PredictionResult.jsx';
import RecommendationPanel from '../components/RecommendationPanel.jsx';
import SubmitButton from '../components/SubmitButton.jsx';
import VehicleSelector from '../components/VehicleSelector.jsx';
import { getVehicleSpec, getVehicleTypeCode } from '../constants/vehicleDatabase.js';
import { generateExplanation } from '../services/explanationService.js';
import { createPrediction, getPredictionHistory } from '../services/predictionService.js';
import { generateRecommendations } from '../services/recommendationService.js';
import { getErrorMessage } from '../utils/getErrorMessage.js';

const routineModes = [
  { id: 'daily', label: 'Daily', description: 'Same pattern most days' },
  { id: 'weekly', label: 'Weekly', description: 'Plan by commute and weekend use' },
  { id: 'monthly', label: 'Monthly', description: 'Best for irregular use' },
];

const defaults = {
  batteryAge: '2',
  odometer: '18000',
  dailyDistance: '32',
  weeklyDistance: '220',
  monthlyDistance: '900',
  weeklyCharges: '4',
  monthlyCharges: '16',
  fastChargePercent: '20',
  avgTemperature: '30',
  chargeDuration: '4',
  endSoc: '35',
};

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function publishLatestPrediction(prediction) {
  try {
    window.localStorage.setItem('lifecharge.latestPrediction', JSON.stringify(prediction));
    const storedHistory = window.localStorage.getItem('lifecharge.predictionHistory');
    const history = storedHistory ? JSON.parse(storedHistory) : [];
    const withoutDuplicate = history.filter((item) => item._id !== prediction._id);
    window.localStorage.setItem('lifecharge.predictionHistory', JSON.stringify([prediction, ...withoutDuplicate].slice(0, 10)));
    window.dispatchEvent(new window.CustomEvent('lifecharge:prediction-updated', { detail: prediction }));
  } catch {
    // Local storage may be unavailable in private or restricted browser contexts.
  }
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function buildRoutineMetrics(mode, routine, selectedSpec) {
  const distanceByMode = {
    daily: toNumber(routine.dailyDistance),
    weekly: toNumber(routine.weeklyDistance) / 7,
    monthly: toNumber(routine.monthlyDistance) / 30,
  };
  const chargesByMode = {
    daily: toNumber(routine.weeklyCharges),
    weekly: toNumber(routine.weeklyCharges),
    monthly: toNumber(routine.monthlyCharges) / 4.33,
  };

  const averageDailyDistance = Math.max(0, distanceByMode[mode] ?? 0);
  const weeklyChargingFrequency = Math.max(0, chargesByMode[mode] ?? 0);
  const totalKm = Math.max(toNumber(routine.odometer), averageDailyDistance * 365 * Math.max(toNumber(routine.batteryAge), 0.2));
  const estimatedCycles = selectedSpec?.typicalRange ? Math.round(totalKm / selectedSpec.typicalRange) : 0;
  const fastCharge = toNumber(routine.fastChargePercent);
  const temp = toNumber(routine.avgTemperature, 25);
  const stressScore = Math.min(100, Math.round((fastCharge * 0.45) + (weeklyChargingFrequency * 2.5) + (Math.max(0, temp - 30) * 2)));

  return {
    averageDailyDistance: Math.round(averageDailyDistance * 10) / 10,
    weeklyChargingFrequency: Math.round(weeklyChargingFrequency * 10) / 10,
    totalKm,
    estimatedCycles,
    stressScore,
  };
}

function buildPredictionPayload(vehicle, routine, metrics, selectedSpec) {
  if (!selectedSpec) return null;

  const batteryType = (selectedSpec.batteryType || '').toLowerCase();
  const isLfp = batteryType.includes('lfp') || batteryType.includes('lithium iron') ? 1 : 0;
  const isNmc = batteryType.includes('nmc') || batteryType.includes('nickel') ? 1 : 0;
  const isLeadAcid = batteryType.includes('lead acid') || batteryType.includes('lead-acid') ? 1 : 0;
  const current = selectedSpec.voltage > 0 && selectedSpec.typicalRange > 0
    ? Math.round((selectedSpec.batteryCapacity * 1000 * 40) / (selectedSpec.typicalRange * selectedSpec.voltage))
    : 10;

  return {
    vehicleCategory: vehicle.categoryId,
    vehicleMake: vehicle.make,
    vehicleModel: vehicle.model,
    vehicleType: getVehicleTypeCode(vehicle.categoryId),
    batteryCapacity: selectedSpec.batteryCapacity,
    voltage: selectedSpec.voltage,
    expectedCycles: selectedSpec.expectedCycles,
    typicalRange: selectedSpec.typicalRange,
    batteryAge: toNumber(routine.batteryAge),
    totalKmDriven: metrics.totalKm,
    dailyDistance: metrics.averageDailyDistance,
    chargingCycles: metrics.estimatedCycles,
    chargingFrequency: metrics.weeklyChargingFrequency,
    fastChargingUsage: toNumber(routine.fastChargePercent),
    averageTemperature: toNumber(routine.avgTemperature, 25),
    chargingDuration: toNumber(routine.chargeDuration),
    socHistory: toNumber(routine.endSoc, 50),
    current,
    estimatedLifeYears: selectedSpec.estimatedLifeYears || toNumber(routine.batteryAge) + 2,
    is_two_wheeler: vehicle.categoryId === 'two_wheeler' ? 1 : 0,
    is_three_wheeler: vehicle.categoryId === 'three_wheeler' ? 1 : 0,
    is_four_wheeler: vehicle.categoryId === 'four_wheeler' ? 1 : 0,
    is_bus: vehicle.categoryId === 'bus_heavy' ? 1 : 0,
    is_chemistry_lfp: isLfp,
    is_chemistry_nmc: isNmc,
    is_chemistry_lead_acid: isLeadAcid,
    notes: 'Generated from routine-based LifeCharge entry.',
  };
}

export default function RoutineAnalysisPage() {
  const [mode, setMode] = useState('daily');
  const [vehicle, setVehicle] = useState({ categoryId: '', make: '', model: '' });
  const [routine, setRoutine] = useState(defaults);
  const [latestPrediction, setLatestPrediction] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);

  const selectedSpec = vehicle.categoryId && vehicle.make && vehicle.model
    ? getVehicleSpec(vehicle.categoryId, vehicle.make, vehicle.model)
    : null;
  const metrics = useMemo(() => buildRoutineMetrics(mode, routine, selectedSpec), [mode, routine, selectedSpec]);

  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await getPredictionHistory({ limit: 6 });
        setHistory(data.predictions ?? []);
      } catch {
        setHistory([]);
      }
    }

    loadHistory();
  }, []);

  function updateRoutine(field, value) {
    setRoutine((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    const payload = buildPredictionPayload(vehicle, routine, metrics, selectedSpec);
    if (!payload) {
      setError('Choose your EV before running routine analysis.');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await createPrediction(payload);
      setLatestPrediction(data.prediction);
      setExplanation(data.prediction.explanation ?? null);
      setRecommendations(data.prediction.recommendations ?? null);
      publishLatestPrediction(data.prediction);
      setHistory((current) => [data.prediction, ...current.filter((item) => item._id !== data.prediction._id)].slice(0, 6));
      setMessage('Routine analysis saved to battery history.');
    } catch (predictionError) {
      setError(getErrorMessage(predictionError));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleExplain() {
    if (!latestPrediction?._id) return;
    setIsExplaining(true);
    setError('');
    try {
      const data = await generateExplanation(latestPrediction._id);
      setExplanation(data.explanation);
    } catch (explanationError) {
      setError(getErrorMessage(explanationError));
    } finally {
      setIsExplaining(false);
    }
  }

  async function handleGenerateRecommendations() {
    if (!latestPrediction?._id) return;
    setIsGeneratingRecommendations(true);
    setError('');
    try {
      const data = await generateRecommendations(latestPrediction._id);
      setRecommendations(data.recommendations);
    } catch (recommendationError) {
      setError(getErrorMessage(recommendationError));
    } finally {
      setIsGeneratingRecommendations(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
        <div className="lc-card-static rounded-2xl p-5 sm:p-6 lg:p-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">Routine analysis</p>
          <h1 className="mt-2 max-w-3xl text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
            Tell LifeCharge how you actually use your EV.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Fill daily, weekly, or monthly driving and charging habits. LifeCharge translates the routine into battery health inputs and estimates SOH, useful life, confidence, and risk.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {routineModes.map((item) => (
              <button
                key={item.id}
                className={`lc-focus rounded-xl border px-4 py-3 text-left transition ${
                  mode === item.id
                    ? 'border-slate-950 bg-slate-950 text-white shadow-lg shadow-slate-900/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
                type="button"
                onClick={() => setMode(item.id)}
              >
                <span className="block text-sm font-black">{item.label}</span>
                <span className={`mt-0.5 block text-xs ${mode === item.id ? 'text-slate-300' : 'text-slate-500'}`}>{item.description}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white shadow-xl shadow-slate-900/15 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-cyan-300 text-slate-950">
              <CalendarRange size={22} aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-200">Routine translator</p>
              <h2 className="font-black">Converted for analysis</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <Metric label="Avg daily drive" value={`${metrics.averageDailyDistance} km`} />
            <Metric label="Charging frequency" value={`${metrics.weeklyChargingFrequency} / week`} />
            <Metric label="Usage stress" value={`${metrics.stressScore}/100`} />
          </div>
          <p className="mt-5 flex gap-2 text-sm leading-6 text-slate-300">
            <Info className="mt-0.5 shrink-0 text-cyan-200" size={16} aria-hidden="true" />
            These derived values are sent to the existing battery model, so the old health-check page stays available while routine entry becomes the easier path.
          </p>
        </div>
      </div>

      {message ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{message}</p> : null}
      {error ? <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <form className="lc-card-static rounded-xl p-4 sm:p-6" onSubmit={handleSubmit}>
          <div className="mb-5 flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-slate-900">
              <BatteryCharging size={22} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-black text-slate-900">Vehicle and routine details</h2>
              <p className="text-sm text-slate-600">Pick your EV, then enter the habits you can remember easily.</p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <VehicleSelector value={vehicle} onChange={setVehicle} />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <RoutineField icon={CalendarDays} label="Battery age" unit="years" value={routine.batteryAge} onChange={(value) => updateRoutine('batteryAge', value)} min="0" step="0.5" />
            <RoutineField icon={Gauge} label="Odometer reading" unit="km" value={routine.odometer} onChange={(value) => updateRoutine('odometer', value)} min="0" step="100" />
            {mode === 'daily' ? (
              <RoutineField icon={Route} label="Distance on a normal day" unit="km/day" value={routine.dailyDistance} onChange={(value) => updateRoutine('dailyDistance', value)} min="0" step="1" />
            ) : null}
            {mode === 'weekly' ? (
              <RoutineField icon={Route} label="Distance in a usual week" unit="km/week" value={routine.weeklyDistance} onChange={(value) => updateRoutine('weeklyDistance', value)} min="0" step="5" />
            ) : null}
            {mode === 'monthly' ? (
              <RoutineField icon={Route} label="Distance in a usual month" unit="km/month" value={routine.monthlyDistance} onChange={(value) => updateRoutine('monthlyDistance', value)} min="0" step="25" />
            ) : null}
            {mode === 'monthly' ? (
              <RoutineField icon={Zap} label="Charging sessions per month" unit="charges" value={routine.monthlyCharges} onChange={(value) => updateRoutine('monthlyCharges', value)} min="0" step="1" />
            ) : (
              <RoutineField icon={Zap} label="Charging sessions per week" unit="charges" value={routine.weeklyCharges} onChange={(value) => updateRoutine('weeklyCharges', value)} min="0" step="1" />
            )}
            <RoutineField icon={Zap} label="Fast charging share" unit="%" value={routine.fastChargePercent} onChange={(value) => updateRoutine('fastChargePercent', value)} min="0" max="100" step="5" />
            <RoutineField icon={Thermometer} label="Typical city temperature" unit="C" value={routine.avgTemperature} onChange={(value) => updateRoutine('avgTemperature', value)} min="-10" max="60" step="1" />
            <RoutineField icon={BatteryCharging} label="Average charging duration" unit="hours" value={routine.chargeDuration} onChange={(value) => updateRoutine('chargeDuration', value)} min="0" max="24" step="0.5" />
            <RoutineField icon={BatteryCharging} label="Battery left at end of use" unit="%" value={routine.endSoc} onChange={(value) => updateRoutine('endSoc', value)} min="0" max="100" step="5" />
          </div>

          {selectedSpec ? (
            <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Selected battery baseline</p>
              <p className="mt-2 font-black text-slate-900">{vehicle.make} {vehicle.model}</p>
              <p className="mt-1 text-sm text-slate-600">
                {selectedSpec.batteryCapacity} kWh, {selectedSpec.typicalRange} km range, {selectedSpec.batteryType}, {selectedSpec.expectedCycles} expected cycles
              </p>
            </div>
          ) : null}

          <div className="mt-6 flex justify-end">
            <SubmitButton isLoading={isSubmitting}>
              <span className="inline-flex items-center gap-2">
                <ClipboardCheck size={18} aria-hidden="true" />
                Analyze Routine
              </span>
            </SubmitButton>
          </div>
        </form>

        <div className="space-y-6">
          <PredictionResult prediction={latestPrediction} />
          {latestPrediction ? <ExplanationPanel explanation={explanation} isLoading={isExplaining} onGenerate={handleExplain} /> : null}
          {latestPrediction ? (
            <RecommendationPanel recommendations={recommendations} isLoading={isGeneratingRecommendations} onGenerate={handleGenerateRecommendations} />
          ) : null}
          <section className="lc-card-static overflow-hidden rounded-xl">
            <div className="flex items-center gap-3 border-b border-slate-200 p-4 sm:p-5">
              <History className="text-slate-900" size={20} aria-hidden="true" />
              <h2 className="font-black text-slate-900">Recent analysis history</h2>
            </div>
            {history.length ? (
              <div className="divide-y divide-slate-100">
                {history.map((prediction) => (
                  <button
                    key={prediction._id}
                    className="lc-focus block w-full p-4 text-left text-sm transition hover:bg-slate-50 sm:p-5"
                    type="button"
                    onClick={() => {
                      setLatestPrediction(prediction);
                      setExplanation(prediction.explanation ?? null);
                      setRecommendations(prediction.recommendations ?? null);
                    }}
                  >
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                      <p className="font-bold text-slate-900">{prediction.batteryStatus}</p>
                      <p className="text-xs text-slate-500">{formatDate(prediction.createdAt)}</p>
                    </div>
                    <p className="mt-2 text-slate-600">SOH {prediction.SOH}% | RUL {prediction.RUL} months | Confidence {prediction.confidenceScore}%</p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="p-5 text-sm leading-6 text-slate-600">Routine analysis results will appear here after your first check.</p>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function RoutineField({ icon: Icon, label, unit, value, onChange, ...inputProps }) {
  return (
    <label className="block">
      <span className="flex items-center gap-2 text-sm font-bold text-slate-800">
        <Icon className="text-cyan-700" size={16} aria-hidden="true" />
        {label}
      </span>
      <div className="mt-1.5 flex items-center gap-2">
        <input
          className="lc-focus w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 transition placeholder:text-slate-400 focus:border-cyan-500"
          type="number"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          {...inputProps}
        />
        <span className="w-20 shrink-0 text-xs font-semibold text-slate-500">{unit}</span>
      </div>
    </label>
  );
}
