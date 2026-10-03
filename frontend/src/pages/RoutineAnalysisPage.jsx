import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  BatteryCharging,
  CalendarDays,
  CalendarRange,
  ClipboardCheck,
  Gauge,
  History,
  Route,
  Sparkles,
  Thermometer,
  Zap,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  Car,
  Flame,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  RotateCcw,
  Cpu,
  Activity,
  Award,
  Navigation,
  ArrowLeft,
  Edit3,
  FileText,
} from 'lucide-react';

import ExplanationPanel from '../components/ExplanationPanel.jsx';
import PredictionResult from '../components/PredictionResult.jsx';
import RecommendationPanel from '../components/RecommendationPanel.jsx';
import SubmitButton from '../components/SubmitButton.jsx';
import VehicleSelector from '../components/VehicleSelector.jsx';
import BatteryPassportView from '../components/reports/BatteryPassportView.jsx';
import WeeklyChargingMaintenancePlannerWidget from '../components/routine/WeeklyChargingMaintenancePlannerWidget.jsx';
import { getVehicleSpec, getVehicleTypeCode } from '../constants/vehicleDatabase.js';
import { generateExplanation } from '../services/explanationService.js';
import { createPrediction, getPredictionHistory } from '../services/predictionService.js';
import { generateRecommendations } from '../services/recommendationService.js';
import { getErrorMessage } from '../utils/getErrorMessage.js';

const routineModes = [
  {
    id: 'daily',
    label: 'Daily Commute',
    description: 'Best for predictable daily travel and home charging',
    hint: 'City & Office Routine',
    icon: CalendarDays,
  },
  {
    id: 'weekly',
    label: 'Weekly Rhythm',
    description: 'Perfect for varying weekday work & weekend trips',
    hint: 'Mixed Driving Rhythm',
    icon: Route,
  },
  {
    id: 'monthly',
    label: 'Monthly Overview',
    description: 'Ideal for seasonal, long-haul, or low-frequency usage',
    hint: 'Extended Travel Rhythm',
    icon: CalendarRange,
  },
];

const ROUTINE_PRESETS = [
  {
    name: 'Urban Eco Commuter',
    mode: 'daily',
    badge: 'Low Stress',
    color: 'emerald',
    values: {
      batteryAge: '2',
      odometer: '18000',
      dailyDistance: '28',
      weeklyCharges: '3',
      fastChargePercent: '10',
      avgTemperature: '26',
      chargeDuration: '6',
      endSoc: '35',
    },
  },
  {
    name: 'High-Demand Commercial',
    mode: 'daily',
    badge: 'High Stress',
    color: 'emerald',
    values: {
      batteryAge: '3',
      odometer: '65000',
      dailyDistance: '120',
      weeklyCharges: '7',
      fastChargePercent: '65',
      avgTemperature: '38',
      chargeDuration: '1.5',
      endSoc: '15',
    },
  },
  {
    name: 'Weekend Long-Range',
    mode: 'weekly',
    badge: 'Moderate Stress',
    color: 'cyan',
    values: {
      batteryAge: '1.5',
      odometer: '24000',
      weeklyDistance: '380',
      weeklyCharges: '2',
      fastChargePercent: '35',
      avgTemperature: '30',
      chargeDuration: '4',
      endSoc: '25',
    },
  },
  {
    name: 'Cold Climate Driver',
    mode: 'daily',
    badge: 'Thermal Risk',
    color: 'amber',
    values: {
      batteryAge: '4',
      odometer: '48000',
      dailyDistance: '45',
      weeklyCharges: '5',
      fastChargePercent: '30',
      avgTemperature: '2',
      chargeDuration: '7',
      endSoc: '30',
    },
  },
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

const routineSteps = [
  {
    step: '01',
    title: 'Select Routine Rhythm',
    description: 'Match your EV usage pattern: daily city commutes, weekly mixed trips, or monthly long-hauls.',
  },
  {
    step: '02',
    title: 'Input Driving & Charging Habits',
    description: 'Specify mileage, fast-charging share, and ambient temperatures using interactive controls.',
  },
  {
    step: '03',
    title: 'Get AI Battery Health Prognosis',
    description: 'View SOH %, projected remaining useful life, stress score, and actionable lifespan recommendations.',
  },
];

const DIAGNOSTIC_STAGES = [
  { percent: 20, label: 'Extracting routine usage & climate metrics...' },
  { percent: 45, label: 'Synthesizing physics-informed thermal degradation features...' },
  { percent: 70, label: 'Evaluating multi-model ML SOH/RUL ensemble...' },
  { percent: 90, label: 'Calibrating split-conformal prediction bounds & recommendations...' },
  { percent: 100, label: 'Prognostics complete! Loading battery health report...' },
];

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
    // Local storage handle
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

  const thermalStress = Math.max(0, temp - 30) * 2.2 + (temp < 5 ? 12 : 0);
  const fastChargeStress = fastCharge * 0.48;
  const cyclingStress = weeklyChargingFrequency * 2.8;
  const stressScore = Math.min(100, Math.round(thermalStress + fastChargeStress + cyclingStress));

  return {
    averageDailyDistance: Math.round(averageDailyDistance * 10) / 10,
    weeklyChargingFrequency: Math.round(weeklyChargingFrequency * 10) / 10,
    totalKm,
    estimatedCycles,
    stressScore,
    thermalStress: Math.round(thermalStress),
    fastChargeStress: Math.round(fastChargeStress),
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
    notes: 'Generated from routine-based LITHYX entry.',
  };
}

export default function RoutineAnalysisPage() {
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState('FORM'); // 'FORM' | 'LOADING' | 'RESULTS'
  const [mode, setMode] = useState('daily');
  const [vehicle, setVehicle] = useState({ categoryId: '', make: '', model: '' });
  const [routine, setRoutine] = useState(defaults);
  const [latestPrediction, setLatestPrediction] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [history, setHistory] = useState([]);
  const [partialWindow, setPartialWindow] = useState('P30'); // 'P10' | 'P20' | 'P30' | 'P40' | 'FULL'
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const [diagnosticStageIndex, setDiagnosticStageIndex] = useState(0);
  const [isPassportOpen, setIsPassportOpen] = useState(false);

  const windowInfoMap = {
    P10: { label: 'P10 (10% Charge Observed)', coverage: '10% charging trajectory', confidenceWidth: '± 3.8% SOH', featureStability: 'Low Peak Stability' },
    P20: { label: 'P20 (20% Charge Observed)', coverage: '20% charging trajectory', confidenceWidth: '± 2.5% SOH', featureStability: 'Moderate Peak Stability' },
    P30: { label: 'P30 (30% Charge Observed)', coverage: '30% charging trajectory (Primary LITHYX Regime)', confidenceWidth: '± 1.8% SOH', featureStability: 'High Peak Stability' },
    P40: { label: 'P40 (40% Charge Observed)', coverage: '40% charging trajectory', confidenceWidth: '± 1.2% SOH', featureStability: 'Optimal Peak Stability' },
    FULL: { label: 'FULL (100% Complete Cycle)', coverage: '100% complete charging cycle (Lab Bound)', confidenceWidth: '± 0.8% SOH', featureStability: 'Reference Standard' },
  };

  const selectedSpec = vehicle.categoryId && vehicle.make && vehicle.model
    ? getVehicleSpec(vehicle.categoryId, vehicle.make, vehicle.model)
    : null;

  const selectedMode = routineModes.find((item) => item.id === mode) ?? routineModes[0];
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

  function applyPreset(preset) {
    setMode(preset.mode);
    setRoutine((prev) => ({ ...prev, ...preset.values }));
    setMessage(`Applied preset: ${preset.name}`);
    setTimeout(() => setMessage(''), 3000);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    const payload = buildPredictionPayload(vehicle, routine, metrics, selectedSpec);
    if (!payload) {
      setError('Please select your vehicle make and model before starting routine analysis.');
      return;
    }

    // Switch view to 3.5-second loading overlay
    setActiveView('LOADING');
    setDiagnosticStageIndex(0);

    const stage1 = setTimeout(() => setDiagnosticStageIndex(1), 800);
    const stage2 = setTimeout(() => setDiagnosticStageIndex(2), 1700);
    const stage3 = setTimeout(() => setDiagnosticStageIndex(3), 2500);
    const stage4 = setTimeout(() => setDiagnosticStageIndex(4), 3200);

    try {
      const data = await createPrediction(payload);
      const pred = data.prediction;

      setTimeout(async () => {
        setLatestPrediction(pred);
        publishLatestPrediction(pred);
        setHistory((current) => [pred, ...current.filter((item) => item._id !== pred._id)].slice(0, 6));

        if (pred?._id) {
          try {
            const [expRes, recRes] = await Promise.all([
              generateExplanation(pred._id).catch(() => null),
              generateRecommendations(pred._id).catch(() => null),
            ]);
            if (expRes?.explanation) setExplanation(expRes.explanation);
            if (recRes?.recommendations) setRecommendations(recRes.recommendations);
          } catch (subErr) {
            console.warn('Sub-generation notice:', subErr);
          }
        }

        // Complete scan: Form disappears and full-width Results view overlay appears cleanly
        setActiveView('RESULTS');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 3500);
    } catch (predictionError) {
      clearTimeout(stage1);
      clearTimeout(stage2);
      clearTimeout(stage3);
      clearTimeout(stage4);
      setActiveView('FORM');
      setError(getErrorMessage(predictionError));
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

  const getStressBadge = (score) => {
    if (score < 30) return { label: 'Optimal Low Stress', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
    if (score < 60) return { label: 'Moderate Stress', bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' };
    if (score < 80) return { label: 'High Degradation Risk', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    return { label: 'Critical Stress Warning', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
  };

  const stressInfo = getStressBadge(metrics.stressScore);
  const currentStage = DIAGNOSTIC_STAGES[diagnosticStageIndex] || DIAGNOSTIC_STAGES[0];

  return (
    <section className="space-y-8 max-w-7xl mx-auto px-4 py-4">
      {/* ---------------------------------------------------- */}
      {/* STAGE 1: CONFIGURE FORM VIEW (When activeView === 'FORM') */}
      {/* ---------------------------------------------------- */}
      {activeView === 'FORM' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Hero Banner */}
          <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-950 via-[#0B131F] to-slate-900 p-6 sm:p-8 text-white shadow-2xl relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center relative z-10">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1.5 text-xs font-bold text-teal-400 shadow-sm">
                  <Sparkles size={14} className="text-teal-400" />
                  ROUTINE-BASED EV PROGNOSTICS ENGINE
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                  Model Battery Longevity From Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400">Daily Driving Habits</span>
                </h1>
                <p className="text-sm sm:text-base leading-relaxed text-slate-300 font-medium max-w-xl">
                  No OBD-II cables required. Choose your travel rhythm, adjust your charging frequency & climate conditions, and receive real-time AI battery degradation analytics.
                </p>

                {/* Routine Presets */}
                <div className="pt-2 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Zap size={14} className="text-teal-400" /> Quick-Fill Routine Presets:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ROUTINE_PRESETS.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => applyPreset(p)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-bold text-slate-200 transition-all flex items-center gap-2 hover:border-teal-500/50 shadow-sm cursor-pointer"
                      >
                        <span>{p.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-teal-400 font-mono border border-slate-700">
                          {p.badge}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic Stress Scorecard */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur-xl space-y-5 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                      <Gauge size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Selected Travel Rhythm</p>
                      <h3 className="font-black text-lg text-white">{selectedMode.label}</h3>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${stressInfo.bg}`}>
                    {stressInfo.label}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Avg Daily</span>
                    <span className="text-xl font-black text-teal-400 font-mono">{metrics.averageDailyDistance} <span className="text-xs text-slate-400 font-normal">km</span></span>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Charges/Wk</span>
                    <span className="text-xl font-black text-cyan-400 font-mono">{metrics.weeklyChargingFrequency}</span>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Stress Score</span>
                    <span className="text-xl font-black text-amber-400 font-mono">{metrics.stressScore}<span className="text-xs text-slate-400">/100</span></span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-400">
                    <span>Usage Stress Breakdown</span>
                    <span className="text-white font-mono font-bold">{metrics.stressScore}% Impact</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        metrics.stressScore < 35
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : metrics.stressScore < 65
                          ? 'bg-gradient-to-r from-teal-400 to-amber-500'
                          : 'bg-gradient-to-r from-amber-500 to-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, metrics.stressScore))}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 11 Partial Observation Window Sandbox Banner */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <Sliders size={18} /> Section 11 Partial Observation Window Evaluator
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Select the portion of charging observed to evaluate LITHYX prognosis under limited charging windows (P10 to FULL).
                </p>
              </div>
              <span className="rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-1">
                Regime: {partialWindow}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              {['P10', 'P20', 'P30', 'P40', 'FULL'].map((winKey) => (
                <button
                  key={winKey}
                  type="button"
                  onClick={() => setPartialWindow(winKey)}
                  className={`p-3 rounded-xl border text-center font-bold transition-all ${
                    partialWindow === winKey
                      ? 'border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                      : 'border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-emerald-500'
                  }`}
                >
                  <div className="text-sm font-black">{winKey}</div>
                  <div className="text-[10px] opacity-80 font-normal">{winKey === 'FULL' ? '100% Full' : `${winKey.replace('P', '')}% Observed`}</div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-semibold pt-1">
              <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-500/20">
                <span className="text-slate-500 block text-[10px]">SELECTED WINDOW</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{windowInfoMap[partialWindow]?.label}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-500/20">
                <span className="text-slate-500 block text-[10px]">ESTIMATED CONFORMAL WIDTH</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">{windowInfoMap[partialWindow]?.confidenceWidth}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-500/20">
                <span className="text-slate-500 block text-[10px]">ICA PEAK STABILITY</span>
                <span className="text-slate-900 dark:text-white font-bold">{windowInfoMap[partialWindow]?.featureStability}</span>
              </div>
            </div>
          </div>

          {/* 3 Step Process Card Bar */}
          <div className="grid gap-4 md:grid-cols-3">
            {routineSteps.map((step) => (
              <div key={step.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0B131F] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-teal-500 font-mono">{step.step}</span>
                  <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
                    <CheckCircle2 size={16} />
                  </div>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{step.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{step.description}</p>
              </div>
            ))}
          </div>

          {/* Alerts */}
          {message ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 size={16} /> {message}
            </div>
          ) : null}
          {error ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-400 flex items-center gap-2">
              <AlertTriangle size={16} /> {error}
            </div>
          ) : null}

          {/* Full-Width Routine Input Form (Single Clean Container) */}
          <form
            id="routine-form"
            className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xl dark:border-slate-800 dark:bg-[#0B131F] space-y-8 max-w-5xl mx-auto"
            onSubmit={handleSubmit}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-5 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <Sliders size={26} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">Configure Your Driving & Charging Profile</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Fine-tune parameters to calculate precise battery health prognostics</p>
                </div>
              </div>
            </div>

            {/* Mode Switcher Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {routineModes.map((item) => {
                const Icon = item.icon;
                const isActive = mode === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMode(item.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-teal-500/10 border-teal-500 text-teal-400 font-bold shadow-md border-2'
                        : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <Icon size={18} className={isActive ? 'text-teal-400' : 'text-slate-400'} />
                      <span>{item.label}</span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium mt-1.5 leading-relaxed">{item.description}</p>
                  </button>
                );
              })}
            </div>

            {/* EV Selector Block */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 p-6 space-y-4">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Car size={18} className="text-teal-400" /> Select Your Electric Vehicle Model
              </h4>
              <VehicleSelector value={vehicle} onChange={setVehicle} />

              {selectedSpec ? (
                <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 text-slate-300 text-xs flex flex-wrap items-center justify-between gap-3 font-medium">
                  <span className="font-bold text-white text-sm">{vehicle.make} {vehicle.model}</span>
                  <span className="font-mono text-teal-400">{selectedSpec.batteryCapacity} kWh | {selectedSpec.typicalRange} km Range | {selectedSpec.batteryType}</span>
                </div>
              ) : null}
            </div>

            {/* Input Fields Grid */}
            <div className="grid gap-6 sm:grid-cols-2">
              <InteractiveField
                icon={CalendarDays}
                label="Battery Age"
                unit="years"
                value={routine.batteryAge}
                onChange={(val) => updateRoutine('batteryAge', val)}
                min="0.1"
                max="12"
                step="0.5"
              />
              <InteractiveField
                icon={Gauge}
                label="Odometer Reading"
                unit="km"
                value={routine.odometer}
                onChange={(val) => updateRoutine('odometer', val)}
                min="0"
                max="300000"
                step="1000"
              />

              {mode === 'daily' && (
                <InteractiveField
                  icon={Route}
                  label="Normal Daily Distance"
                  unit="km/day"
                  value={routine.dailyDistance}
                  onChange={(val) => updateRoutine('dailyDistance', val)}
                  min="5"
                  max="300"
                  step="5"
                />
              )}
              {mode === 'weekly' && (
                <InteractiveField
                  icon={Route}
                  label="Usual Weekly Distance"
                  unit="km/week"
                  value={routine.weeklyDistance}
                  onChange={(val) => updateRoutine('weeklyDistance', val)}
                  min="20"
                  max="2000"
                  step="20"
                />
              )}
              {mode === 'monthly' && (
                <InteractiveField
                  icon={Route}
                  label="Usual Monthly Distance"
                  unit="km/month"
                  value={routine.monthlyDistance}
                  onChange={(val) => updateRoutine('monthlyDistance', val)}
                  min="100"
                  max="8000"
                  step="100"
                />
              )}

              {mode === 'monthly' ? (
                <InteractiveField
                  icon={Zap}
                  label="Monthly Charge Sessions"
                  unit="charges"
                  value={routine.monthlyCharges}
                  onChange={(val) => updateRoutine('monthlyCharges', val)}
                  min="1"
                  max="60"
                  step="1"
                />
              ) : (
                <InteractiveField
                  icon={Zap}
                  label="Weekly Charge Sessions"
                  unit="charges"
                  value={routine.weeklyCharges}
                  onChange={(val) => updateRoutine('weeklyCharges', val)}
                  min="1"
                  max="21"
                  step="1"
                />
              )}

              <InteractiveField
                icon={Zap}
                label="DC Fast Charging Share"
                unit="%"
                value={routine.fastChargePercent}
                onChange={(val) => updateRoutine('fastChargePercent', val)}
                min="0"
                max="100"
                step="5"
              />

              <InteractiveField
                icon={Thermometer}
                label="Typical Operating Temp"
                unit="°C"
                value={routine.avgTemperature}
                onChange={(val) => updateRoutine('avgTemperature', val)}
                min="-10"
                max="55"
                step="1"
              />

              <InteractiveField
                icon={BatteryCharging}
                label="Average Charge Duration"
                unit="hours"
                value={routine.chargeDuration}
                onChange={(val) => updateRoutine('chargeDuration', val)}
                min="0.5"
                max="16"
                step="0.5"
              />

              <InteractiveField
                icon={BatteryCharging}
                label="End of Trip SOC Remaining"
                unit="%"
                value={routine.endSoc}
                onChange={(val) => updateRoutine('endSoc', val)}
                min="5"
                max="90"
                step="5"
              />
            </div>

            {/* Run Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-base transition-all shadow-xl flex items-center justify-center gap-3 cursor-pointer"
              >
                <ClipboardCheck size={22} />
                Run LITHYX Routine Prognostics
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* STAGE 2: 3.5s DIAGNOSTIC SCANNING LOADER (When activeView === 'LOADING') */}
      {/* ---------------------------------------------------- */}
      {activeView === 'LOADING' && (
        <div className="my-16 max-w-3xl mx-auto rounded-3xl border border-teal-500/30 bg-gradient-to-br from-slate-950 via-[#0B131F] to-slate-900 p-10 text-center text-white shadow-2xl space-y-8 animate-fadeIn relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative size-24 mx-auto grid place-items-center">
            <Cpu className="size-14 text-teal-400 animate-spin" />
            <div className="absolute inset-0 rounded-full border-4 border-teal-500/30 border-t-teal-400 animate-spin"></div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
              LITHYX AI PROGNOSTICS SCANNING
            </span>
            <h3 className="text-2xl font-black text-white">{currentStage.label}</h3>
          </div>

          <div className="w-full bg-slate-900 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-800 max-w-lg mx-auto">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-400 transition-all duration-700"
              style={{ width: `${currentStage.percent}%` }}
            ></div>
          </div>

          <p className="text-xs text-slate-400 font-medium">Running multi-model SOH/RUL ensemble & thermal physics validation...</p>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* STAGE 3: FULL-WIDTH BATTERY HEALTH RESULT (When activeView === 'RESULTS') */}
      {/* ---------------------------------------------------- */}
      {activeView === 'RESULTS' && latestPrediction && (
        <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
          {/* Top Control Header: Back to Form Button & Summary Pill */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B131F] p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <button
              onClick={() => setActiveView('FORM')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
            >
              <ArrowLeft size={16} /> Edit Routine Parameters & Re-Analyze
            </button>

            <div className="flex items-center gap-3 text-xs">
              <span className="font-bold text-slate-500">Evaluated EV:</span>
              <span className="px-3 py-1 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 font-bold font-mono">
                {latestPrediction.vehicleMake} {latestPrediction.vehicleModel}
              </span>
            </div>
          </div>

          {/* Full Width Prediction Result Card */}
          <PredictionResult prediction={latestPrediction} />

          {/* Routine Economic & Asset Valuation Card */}
          <div className="rounded-3xl border border-teal-500/20 bg-gradient-to-br from-teal-500/5 via-[#0B131F] to-emerald-500/5 p-6 sm:p-8 shadow-md space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <DollarSign size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Routine Economic & Battery Asset Valuation</h3>
                  <p className="text-xs text-slate-400 font-medium">Financial breakdown based on your operational driving habits</p>
                </div>
              </div>
              <button
                onClick={() => setIsPassportOpen(true)}
                className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Award size={15} /> Claim Certified Battery Passport
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase block">Annual Wear Cost</span>
                <span className="text-3xl font-black text-amber-400 font-mono">
                  ${Math.round((100 - Number(latestPrediction.SOH || 93)) * 140)}
                </span>
                <span className="text-xs text-slate-500 block font-medium">Depreciation under routine</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase block">Smart Charge Preservation</span>
                <span className="text-3xl font-black text-emerald-400 font-mono">
                  +${Math.round(Number(latestPrediction.RUL || 880) * 0.45)}
                </span>
                <span className="text-xs text-slate-500 block font-medium">Value preserved over baseline</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase block">Residual Range / Charge</span>
                <span className="text-3xl font-black text-cyan-400 font-mono">
                  {Math.round(420 * (Number(latestPrediction.SOH || 93) / 100))} <span className="text-sm font-normal text-slate-400">km</span>
                </span>
                <span className="text-xs text-slate-500 block font-medium">Usable driving autonomy</span>
              </div>
            </div>
          </div>

          {/* 7-Day Smart Charging Calendar Schedule & Stewardship Scorecard */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-md dark:border-slate-800 dark:bg-[#0B131F] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <CalendarDays size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">AI 7-Day Smart Charging Calendar</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Optimal weekly charging slots to maximize battery life and minimize grid electricity costs</p>
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs shrink-0">
                <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                  Driver Stewardship Score: {Math.max(60, 100 - metrics.stressScore)} / 100
                </span>
              </div>
            </div>

            {/* 7-Day Schedule Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-7 gap-3 text-xs">
              {[
                { day: 'Mon', time: '01:00 - 05:00 AM', mode: 'Slow AC (Off-Peak)', cost: '$0.10/kWh', status: 'RECOMMENDED' },
                { day: 'Tue', time: 'No Charge Needed', mode: 'Rest Day', cost: '-', status: 'IDLE' },
                { day: 'Wed', time: '02:00 - 06:00 AM', mode: 'Slow AC (Off-Peak)', cost: '$0.10/kWh', status: 'RECOMMENDED' },
                { day: 'Thu', time: 'No Charge Needed', mode: 'Rest Day', cost: '-', status: 'IDLE' },
                { day: 'Fri', time: '01:30 - 05:30 AM', mode: 'Slow AC (Off-Peak)', cost: '$0.10/kWh', status: 'RECOMMENDED' },
                { day: 'Sat', time: '11:00 AM - 01:00 PM', mode: 'Solar Surplus AC', cost: '$0.06/kWh', status: 'OPTIONAL' },
                { day: 'Sun', time: 'No Charge Needed', mode: 'Rest Day', cost: '-', status: 'IDLE' },
              ].map((item) => (
                <div
                  key={item.day}
                  className={`p-3.5 rounded-2xl border flex flex-col justify-between space-y-2 ${
                    item.status === 'RECOMMENDED'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : item.status === 'OPTIONAL'
                      ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                      : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-slate-900 dark:text-white">{item.day}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-950/60 font-mono">
                      {item.status}
                    </span>
                  </div>
                  <div>
                    <span className="font-mono font-bold text-xs block text-slate-800 dark:text-slate-200">{item.time}</span>
                    <span className="text-[10px] opacity-75 block mt-0.5">{item.mode}</span>
                  </div>
                  {item.cost !== '-' && (
                    <span className="text-[10px] font-mono font-bold text-teal-400 block pt-1 border-t border-slate-700/50">
                      Rate: {item.cost}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Interactive AI Weekly Charging & Maintenance Planner Widget */}
          <WeeklyChargingMaintenancePlannerWidget
            weeklyKm={metrics.averageDailyDistance * 7}
            fastChargePct={toNumber(routine.fastChargePercent)}
            operatingTemp={toNumber(routine.avgTemperature, 30)}
          />

          {/* Full Width SHAP Explanation Panel */}
          <ExplanationPanel explanation={explanation} isLoading={isExplaining} onGenerate={handleExplain} />

          {/* Full Width Recommendations Panel */}
          <RecommendationPanel
            recommendations={recommendations}
            isLoading={isGeneratingRecommendations}
            onGenerate={handleGenerateRecommendations}
          />

          {/* Routine Evaluation History */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0B131F] overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
              <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                <History className="text-teal-400" size={18} /> Routine Evaluation History
              </h3>
            </div>

            {history.length ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {history.map((pred) => (
                  <button
                    key={pred._id}
                    onClick={() => {
                      setLatestPrediction(pred);
                      setExplanation(pred.explanation ?? null);
                      setRecommendations(pred.recommendations ?? null);
                      setActiveView('RESULTS');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors block text-xs space-y-1.5 cursor-pointer"
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-900 dark:text-white">{pred.vehicleMake} {pred.vehicleModel}</span>
                      <span className="text-teal-400 font-mono font-black">{typeof pred.SOH === 'number' ? Number(pred.SOH).toFixed(1) : pred.SOH}% SOH</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px] font-mono">
                      <span>RUL: {Math.round(pred.RUL)} cycles</span>
                      <span>{formatDate(pred.createdAt)}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Digital Battery Passport Modal */}
      <BatteryPassportView
        isOpen={isPassportOpen}
        onClose={() => setIsPassportOpen(false)}
      />
    </section>
  );
}

// Interactive Field component with Dual Range Slider + Input Number
function InteractiveField({ icon: Icon, label, unit, value, onChange, min, max, step }) {
  return (
    <div className="space-y-2 bg-slate-50/80 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80">
      <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
        <span className="flex items-center gap-2">
          <Icon className="text-teal-500" size={16} />
          {label}
        </span>
        <span className="font-mono text-teal-400 text-sm font-black">
          {value} <span className="text-xs text-slate-400 font-normal">{unit}</span>
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full accent-teal-500 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
      />
    </div>
  );
}
