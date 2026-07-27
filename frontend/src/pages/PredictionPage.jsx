import { BrainCircuit, Car, History, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SimpleBatteryForm from '../components/SimpleBatteryForm.jsx';
import ExplanationPanel from '../components/ExplanationPanel.jsx';
import PredictionResult from '../components/PredictionResult.jsx';
import RecommendationPanel from '../components/RecommendationPanel.jsx';
import { generateExplanation } from '../services/explanationService.js';
import { createPrediction, getPredictionHistory } from '../services/predictionService.js';
import { generateRecommendations } from '../services/recommendationService.js';
import { getErrorMessage } from '../utils/getErrorMessage.js';

function formatDate(value) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function publishLatestPrediction(prediction) {
  try {
    window.localStorage.setItem('lifecharge.latestPrediction', JSON.stringify(prediction));
    const storedHistory = window.localStorage.getItem('lifecharge.predictionHistory');
    const history = storedHistory ? JSON.parse(storedHistory) : [];
    const withoutDuplicate = history.filter((item) => item._id !== prediction._id);
    window.localStorage.setItem(
      'lifecharge.predictionHistory',
      JSON.stringify([prediction, ...withoutDuplicate].slice(0, 10)),
    );
    window.dispatchEvent(new window.CustomEvent('lifecharge:prediction-updated', { detail: prediction }));
  } catch {
    // Local storage can be unavailable in private or restricted browser contexts.
  }
}

function publishPredictionHistory(predictions) {
  try {
    window.localStorage.setItem('lifecharge.predictionHistory', JSON.stringify(predictions.slice(0, 10)));
    if (predictions[0]) {
      window.localStorage.setItem('lifecharge.latestPrediction', JSON.stringify(predictions[0]));
    }
  } catch {
    // Local storage can be unavailable in private or restricted browser contexts.
  }
}

export default function PredictionPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [latestPrediction, setLatestPrediction] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  async function loadHistory() {
    setIsLoadingHistory(true);

    try {
      const data = await getPredictionHistory({ limit: 10 });
      setHistory(data.predictions);
      publishPredictionHistory(data.predictions);
    } catch (historyError) {
      setError(getErrorMessage(historyError));
    } finally {
      setIsLoadingHistory(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function handlePredict(values) {
    setError('');
    setMessage('');

    try {
      const data = await createPrediction(values);
      setLatestPrediction(data.prediction);
      setExplanation(data.prediction.explanation ?? null);
      setRecommendations(data.prediction.recommendations ?? null);
      publishLatestPrediction(data.prediction);
      setMessage('Battery health check saved to history.');
      await loadHistory();
    } catch (predictionError) {
      setError(getErrorMessage(predictionError));
    }
  }

  async function handleExplain() {
    if (!latestPrediction?._id) {
      setError('Run a battery health check before requesting an explanation.');
      return;
    }

    setError('');
    setIsExplaining(true);

    try {
      const data = await generateExplanation(latestPrediction._id);
      setExplanation(data.explanation);
      setLatestPrediction((current) => ({ ...current, explanation: data.explanation }));
      await loadHistory();
    } catch (explanationError) {
      setError(getErrorMessage(explanationError));
    } finally {
      setIsExplaining(false);
    }
  }

  async function handleGenerateRecommendations() {
    if (!latestPrediction?._id) {
      setError('Run a battery health check before requesting maintenance guidance.');
      return;
    }

    setError('');
    setIsGeneratingRecommendations(true);

    try {
      const data = await generateRecommendations(latestPrediction._id);
      setRecommendations(data.recommendations);
      setLatestPrediction((current) => ({ ...current, recommendations: data.recommendations }));
      await loadHistory();
    } catch (recommendationError) {
      setError(getErrorMessage(recommendationError));
    } finally {
      setIsGeneratingRecommendations(false);
    }
  }

  function selectHistoryPrediction(prediction) {
    setLatestPrediction(prediction);
    setExplanation(prediction.explanation ?? null);
    setRecommendations(prediction.recommendations ?? null);
    publishLatestPrediction(prediction);
    setMessage('');
    setError('');
  }

  // Pre-select vehicle from URL query params (from showcase page)
  const preselectedVehicle = searchParams.get('category') && searchParams.get('make') && searchParams.get('model')
    ? {
        categoryId: searchParams.get('category'),
        make: searchParams.get('make'),
        model: searchParams.get('model'),
      }
    : null;

  const defaultFormValues = preselectedVehicle
    ? {
        categoryId: preselectedVehicle.categoryId,
        make: preselectedVehicle.make,
        model: preselectedVehicle.model,
        vehicleAge: '',
        totalKmDriven: '',
        dailyDistance: '',
        chargingFrequency: '',
        fastChargePercent: '',
        avgTemperature: '',
        chargingDuration: '',
        socAtEndOfDay: '',
      }
    : undefined;

  return (
    <section className="space-y-6">
      <div className="lc-card-static rounded-2xl bg-slate-900 p-5 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-accent-light">{t('prediction.title')}</p>
            <h1 className="mt-3 text-3xl font-black text-white md:text-4xl tracking-tight">Battery Health Check</h1>
            <p className="mt-3 max-w-2xl text-slate-300 leading-relaxed">
              {preselectedVehicle
                ? `Selected: ${preselectedVehicle.make} ${preselectedVehicle.model} — enter your usage details to check battery health.`
                : 'Check your EV battery health in 3 simple steps. Select your vehicle, tell us how you use it, and get a detailed health report.'}
            </p>
          </div>
          {preselectedVehicle ? (
            <Link
              to="/showroom"
              className="lc-focus inline-flex items-center gap-2 rounded-xl border border-violet-400/30 px-4 py-3 font-bold text-slate-100 hover:border-violet-400 hover:text-violet-300 transition-all duration-200"
            >
              ← Back to Showroom
            </Link>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Link className="lc-focus inline-flex items-center gap-2 rounded-xl border border-amber-400/40 px-4 py-3 font-bold text-slate-100 hover:border-warning hover:text-warning-light transition-all duration-200" to="/ml-training">
              <BrainCircuit size={18} aria-hidden="true" />
              {t('prediction.calibration')}
            </Link>
            <Link className="lc-focus inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 px-4 py-3 font-bold text-slate-100 hover:border-accent hover:text-accent-light transition-all duration-200" to="/battery">
              <Wrench size={18} aria-hidden="true" />
              {t('prediction.batteryProfile')}
            </Link>
          </div>
        </div>
      </div>

      {message ? <p className="rounded-xl border border-accent/40 bg-accent/10 p-4 text-sm text-accent-light">{message}</p> : null}
      {error ? <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</p> : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <section className="lc-card-static rounded-xl bg-white p-4 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-slate-900">
              <Car size={22} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-black text-slate-900">Your Vehicle Details</h2>
              <p className="text-sm text-slate-600">Select your EV and describe your usage pattern</p>
            </div>
          </div>
          <SimpleBatteryForm defaultValues={defaultFormValues} onSubmit={handlePredict} />
        </section>

        <div className="space-y-6">
          <PredictionResult prediction={latestPrediction} />
          {latestPrediction ? (
            <ExplanationPanel explanation={explanation} isLoading={isExplaining} onGenerate={handleExplain} />
          ) : null}
          {latestPrediction ? (
            <RecommendationPanel
              recommendations={recommendations}
              isLoading={isGeneratingRecommendations}
              onGenerate={handleGenerateRecommendations}
            />
          ) : null}

          <section className="lc-card-static rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 border-b border-slate-200 p-4 sm:p-5">
              <History className="text-slate-900" size={20} aria-hidden="true" />
              <h2 className="font-black text-slate-900">{t('prediction.pastChecks')}</h2>
            </div>
            {isLoadingHistory ? <p className="p-4 text-sm text-slate-500">{t('common.loading')}</p> : null}
            {!isLoadingHistory && history.length === 0 ? (
              <p className="p-4 text-sm leading-6 text-slate-600">{t('prediction.noHistory')}</p>
            ) : null}
            {history.length ? (
              <div className="divide-y divide-slate-100">
                {history.map((prediction) => (
                  <article key={prediction._id} className="p-4 text-sm sm:p-5">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                      <div>
                        <p className="font-bold text-slate-900">{prediction.batteryStatus}</p>
                        {prediction.vehicleMake && prediction.vehicleModel ? (
                          <p className="mt-0.5 text-xs text-slate-500">{prediction.vehicleMake} {prediction.vehicleModel}</p>
                        ) : null}
                      </div>
                      <p className="text-slate-500">{formatDate(prediction.createdAt)}</p>
                    </div>
                    <p className="mt-2 text-slate-600">
                      SOH {prediction.SOH}% | RUL {prediction.RUL} months | {t('prediction.confidence')} {prediction.confidenceScore}%
                    </p>
                    <p className="mt-1 text-slate-500 text-xs">{prediction.degradationTrend}</p>
                    <button
                      className="lc-focus mt-3 rounded text-slate-900 font-semibold hover:bg-slate-50 transition-colors"
                      type="button"
                      onClick={() => selectHistoryPrediction(prediction)}
                    >
                      {t('prediction.viewReport')}
                    </button>
                  </article>
                ))}
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </section>
  );
}
