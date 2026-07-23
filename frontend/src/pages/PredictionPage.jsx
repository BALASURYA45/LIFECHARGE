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
      <div className="flex flex-col justify-between gap-4 rounded-lg border border-cyan-500/20 bg-slate-900/60 p-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent-light">{t('prediction.title')}</p>
          <h1 className="mt-2 text-3xl font-black text-white md:text-4xl">Battery Health Check</h1>
          <p className="mt-2 max-w-3xl text-slate-300">
            {preselectedVehicle
              ? `Selected: ${preselectedVehicle.make} ${preselectedVehicle.model} — enter your usage details to check battery health.`
              : 'Check your EV battery health in 3 simple steps. Select your vehicle, tell us how you use it, and get a detailed health report.'}
          </p>
        </div>
        {preselectedVehicle ? (
          <Link
            to="/showroom"
            className="lc-focus inline-flex items-center gap-2 rounded-lg border border-violet-400/30 px-4 py-3 font-bold text-slate-100 hover:border-violet-400 hover:text-violet-300 transition"
          >
            ← Back to Showroom
          </Link>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <Link className="lc-focus inline-flex items-center gap-2 rounded-lg border border-amber-400/40 px-4 py-3 font-bold text-slate-100 hover:border-warning hover:text-warning-light transition" to="/ml-training">
            <BrainCircuit size={18} aria-hidden="true" />
            {t('prediction.calibration')}
          </Link>
          <Link className="lc-focus inline-flex items-center gap-2 rounded-lg border border-cyan-500/30 px-4 py-3 font-bold text-slate-100 hover:border-accent hover:text-accent-light transition" to="/battery">
            <Wrench size={18} aria-hidden="true" />
            {t('prediction.batteryProfile')}
          </Link>
        </div>
      </div>

      {message ? <p className="rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm text-accent-light">{message}</p> : null}
      {error ? <p className="rounded-lg border border-danger-light/30 bg-danger/10 p-3 text-sm text-danger-light">{error}</p> : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <section className="rounded-lg border border-cyan-500/15 bg-slate-900/80 p-4 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-lg border border-accent/30 bg-accent/10 text-accent-light">
              <Car size={22} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-black text-white">Your Vehicle Details</h2>
              <p className="text-sm text-slate-300">Select your EV and describe your usage pattern</p>
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

          <section className="rounded-lg border border-cyan-500/15 bg-slate-900/80">
            <div className="flex items-center gap-3 border-b border-cyan-500/20 p-4">
              <History className="text-accent-light" size={20} aria-hidden="true" />
              <h2 className="font-black text-white">{t('prediction.pastChecks')}</h2>
            </div>
            {isLoadingHistory ? <p className="p-4 text-sm text-slate-400">{t('common.loading')}</p> : null}
            {!isLoadingHistory && history.length === 0 ? (
              <p className="p-4 text-sm leading-6 text-slate-300">{t('prediction.noHistory')}</p>
            ) : null}
            {history.length ? (
              <div className="divide-y divide-cyan-500/15">
                {history.map((prediction) => (
                  <article key={prediction._id} className="p-4 text-sm">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                      <div>
                        <p className="font-bold text-white">{prediction.batteryStatus}</p>
                        {prediction.vehicleMake && prediction.vehicleModel ? (
                          <p className="text-xs text-slate-400">{prediction.vehicleMake} {prediction.vehicleModel}</p>
                        ) : null}
                      </div>
                      <p className="text-slate-400">{formatDate(prediction.createdAt)}</p>
                    </div>
                    <p className="mt-2 text-slate-200">
                      SOH {prediction.SOH}% | RUL {prediction.RUL} months | {t('prediction.confidence')} {prediction.confidenceScore}%
                    </p>
                    <p className="mt-1 text-slate-300">{prediction.degradationTrend}</p>
                    <button
                      className="lc-focus mt-3 rounded text-accent-light hover:text-white"
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