import { Activity, BrainCircuit, CalendarClock, CheckCircle2, Cpu, Database, Loader2, Play, ServerCog, Trophy } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MetricCard from '../components/MetricCard.jsx';
import { getCurrentModel, getTrainingHistory, trainModels } from '../services/mlService.js';
import { getErrorMessage } from '../utils/getErrorMessage.js';

function formatDate(value) {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatMetric(value, digits = 3) {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return value;
  }

  return numericValue.toFixed(digits).replace(/\.?0+$/, '');
}

function getMetricValue(result, key) {
  return Number(result?.metrics?.[key]);
}

function getLowerIsBetterWidth(value, maxValue) {
  if (!Number.isFinite(value) || !Number.isFinite(maxValue) || maxValue <= 0) {
    return 8;
  }

  return Math.max(8, Math.round((1 - value / maxValue) * 72 + 24));
}

function getHigherIsBetterWidth(value, maxValue) {
  if (!Number.isFinite(value) || !Number.isFinite(maxValue) || maxValue <= 0) {
    return 8;
  }

  return Math.max(8, Math.round((value / maxValue) * 100));
}

function getModelInitials(name = '') {
  const words = name.split(/\s+/).filter(Boolean);
  if (!words.length) return 'ML';
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

function DetailItem({ icon: Icon, label, value, tone = 'cyan' }) {
  const toneClasses = {
    cyan: 'border-cyan-400/40 bg-cyan-400/15 text-cyan-100',
    emerald: 'border-emerald-400/40 bg-emerald-400/15 text-emerald-100',
    amber: 'border-amber-400/40 bg-amber-400/15 text-amber-100',
    slate: 'border-slate-700 bg-slate-950/70 text-slate-100',
  };

  return (
    <div className={`rounded-lg border p-4 ${toneClasses[tone] ?? toneClasses.cyan}`}>
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded border border-current/20 bg-slate-950/50">
          <Icon size={18} aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
          <p className="mt-2 break-words text-sm font-bold text-white">{value ?? '-'}</p>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="h-72 animate-pulse rounded border border-slate-800 bg-slate-900/70 p-5">
        <div className="h-3 w-36 rounded bg-slate-800" />
        <div className="mt-6 h-9 w-64 rounded bg-slate-800" />
        <div className="mt-4 h-3 w-full max-w-xl rounded bg-slate-800" />
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-20 rounded border border-slate-800 bg-slate-950/70" />
          ))}
        </div>
      </div>
      <div className="h-72 animate-pulse rounded border border-slate-800 bg-slate-900/70 p-5">
        <div className="h-3 w-32 rounded bg-slate-800" />
        <div className="mt-6 space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-12 rounded bg-slate-800/80" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MachineLearningPage() {
  const { t } = useTranslation();
  const [currentModel, setCurrentModel] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isTraining, setIsTraining] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  async function loadModelState() {
    setIsLoading(true);
    setError('');

    try {
      const [modelResult, historyResult] = await Promise.allSettled([
        getCurrentModel(),
        getTrainingHistory(),
      ]);

      if (modelResult.status === 'fulfilled') {
        setCurrentModel(modelResult.value.metadata);
      }

      if (historyResult.status === 'fulfilled') {
        setHistory(historyResult.value.history);
      }
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadModelState();
  }, []);

  async function handleTrain() {
    setIsTraining(true);
    setError('');
    setMessage('');

    try {
      const data = await trainModels();
      setCurrentModel(data.metadata);
      setMessage(`Training completed. Best model: ${data.metadata.bestModelName}.`);
      await loadModelState();
    } catch (trainError) {
      setError(getErrorMessage(trainError));
    } finally {
      setIsTraining(false);
    }
  }

  const modelResults = useMemo(() => currentModel?.modelResults ?? [], [currentModel?.modelResults]);
  const bestModelName = currentModel?.bestModelName;
  const hasModel = Boolean(currentModel);
  const metricCeilings = useMemo(() => {
    return modelResults.reduce(
      (acc, result) => ({
        mae: Math.max(acc.mae, getMetricValue(result, 'mae') || 0),
        rmse: Math.max(acc.rmse, getMetricValue(result, 'rmse') || 0),
        crossValidationMae: Math.max(acc.crossValidationMae, getMetricValue(result, 'crossValidationMae') || 0),
        r2: Math.max(acc.r2, getMetricValue(result, 'r2') || 0),
      }),
      { mae: 0, rmse: 0, crossValidationMae: 0, r2: 0 },
    );
  }, [modelResults]);

  const sortedResults = useMemo(
    () =>
      [...modelResults].sort((a, b) => {
        if (a.modelName === bestModelName) return -1;
        if (b.modelName === bestModelName) return 1;
        return (getMetricValue(a, 'mae') || 0) - (getMetricValue(b, 'mae') || 0);
      }),
    [bestModelName, modelResults],
  );

  const artifactName = currentModel?.artifactPath ?? currentModel?.modelPath ?? currentModel?.artifactName ?? 'Current registry artifact';
  const datasetName = currentModel?.datasetPath ?? currentModel?.datasetName ?? currentModel?.dataSource ?? 'Battery health training dataset';

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-lg border border-cyan-500/20 bg-slate-900/60 p-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent-light">{t('ml.title')}</p>
          <h1 className="mt-2 text-3xl font-black text-white md:text-4xl">{t('ml.heading')}</h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            {t('ml.description')}
          </p>
        </div>
        <button
          className="lc-focus inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 font-bold text-slate-950 hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-70 shadow-[0_0_18px_rgba(6,182,212,0.35)] transition"
          type="button"
          disabled={isTraining}
          onClick={handleTrain}
        >
          {isTraining ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
          {isTraining ? t('ml.training') : t('ml.train')}
        </button>
      </div>

      {message ? <p className="rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm text-accent-light">{message}</p> : null}
      {error ? <p className="rounded-lg border border-danger-light/30 bg-danger/10 p-3 text-sm text-danger-light">{error}</p> : null}
      {isLoading ? <LoadingState /> : null}

      {!isLoading ? (
        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <section className="rounded border border-slate-800 bg-slate-900/80 p-5">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="grid size-12 place-items-center rounded border border-cyan-300/25 bg-cyan-300/10 text-cyan-100">
                    {hasModel ? <Trophy size={24} aria-hidden="true" /> : <BrainCircuit size={24} aria-hidden="true" />}
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t('ml.currentBest')}</p>
                    <h2 className="mt-1 break-words text-2xl font-black text-white md:text-3xl">
                      {currentModel?.bestModelName ?? t('ml.noModel')}
                    </h2>
                  </div>
                </div>
                <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-400">
                  {hasModel
                    ? `Ready for battery SOH and RUL prediction with ${currentModel.rowCount ?? '-'} training rows and ${modelResults.length} algorithm${modelResults.length === 1 ? '' : 's'} compared.`
                    : 'Start a training run to benchmark candidate algorithms and register the best performing model.'}
                </p>
              </div>
              <span
                className={`w-fit rounded border px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] ${
                  hasModel
                    ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100'
                    : 'border-amber-400/30 bg-amber-400/10 text-amber-100'
                }`}
              >
                {hasModel ? t('ml.productionReady') : t('ml.awaitingTraining')}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MetricCard label={t('ml.mae')} value={formatMetric(currentModel?.bestMetrics?.mae)} detail="Lower prediction error" />
              <MetricCard label={t('ml.rmse')} value={formatMetric(currentModel?.bestMetrics?.rmse)} tone="amber" detail="Penalty for larger misses" />
              <MetricCard label={t('ml.r2')} value={formatMetric(currentModel?.bestMetrics?.r2)} tone="emerald" detail="Explained variance" />
              <MetricCard label={t('ml.rows')} value={currentModel?.rowCount ?? '-'} tone="slate" detail="Dataset coverage" />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <DetailItem icon={CalendarClock} label={t('ml.lastTrained')} value={formatDate(currentModel?.trainedAt)} tone="cyan" />
              <DetailItem icon={Database} label={t('ml.dataset')} value={datasetName} tone="slate" />
              <DetailItem icon={ServerCog} label={t('ml.artifact')} value={artifactName} tone="emerald" />
            </div>
          </section>

          <section className="rounded border border-slate-800 bg-slate-900/80 p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
                <Cpu size={20} aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-black text-white">{t('ml.pipelineReadiness')}</h2>
                <p className="text-sm text-slate-400">Training state and registry signals</p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              {[
                ['Dataset loaded', currentModel?.rowCount ? `${currentModel.rowCount} rows available` : 'Waiting for training rows', Boolean(currentModel?.rowCount)],
                ['Algorithms benchmarked', modelResults.length ? `${modelResults.length} candidates compared` : 'No comparison results yet', Boolean(modelResults.length)],
                ['Model registered', currentModel?.bestModelName ?? 'No active model', Boolean(currentModel?.bestModelName)],
              ].map(([label, detail, isComplete]) => (
                <div key={label} className="flex items-center gap-3 rounded border border-slate-800 bg-slate-950/70 p-3">
                  <span
                    className={`grid size-8 place-items-center rounded border ${
                      isComplete ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100' : 'border-slate-700 bg-slate-900 text-slate-500'
                    }`}
                  >
                    <CheckCircle2 size={16} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white">{label}</p>
                    <p className="text-xs text-slate-500">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {!isLoading && modelResults.length ? (
        <section className="rounded border border-slate-800 bg-slate-900/80">
          <div className="border-b border-slate-800 p-4">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-black text-white">{t('ml.algorithmComparison')}</h2>
                <p className="mt-1 text-sm text-slate-400">Lower MAE, RMSE, and CV MAE are better. Higher R2 is better.</p>
              </div>
              <span className="w-fit rounded border border-cyan-400/20 bg-cyan-400/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-cyan-100">
                {sortedResults.length} {t('ml.candidates')}
              </span>
            </div>
          </div>
          <div className="divide-y divide-slate-800">
            {sortedResults.map((result) => {
              const isBest = result.modelName === currentModel.bestModelName;
              const mae = getMetricValue(result, 'mae');
              const rmse = getMetricValue(result, 'rmse');
              const r2 = getMetricValue(result, 'r2');
              const crossValidationMae = getMetricValue(result, 'crossValidationMae');

              return (
                <article key={result.modelName} className="p-4">
                   <div className="grid gap-4 md:grid-cols-[12rem_1fr] items-center">
                    <div className="flex items-center gap-3">
                      <span
                        className={`grid size-11 shrink-0 place-items-center rounded border text-sm font-black ${
                          isBest
                            ? 'border-amber-300/40 bg-amber-300/10 text-amber-100'
                            : 'border-slate-700 bg-slate-950 text-slate-300'
                        }`}
                      >
                        {getModelInitials(result.modelName)}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="break-words font-black text-white">{result.modelName}</h3>
                          {isBest ? (
                            <span className="rounded border border-amber-300/30 bg-amber-300/10 px-2 py-1 text-xs font-bold text-amber-100">{t('ml.best')}</span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">Cross-validation MAE {formatMetric(crossValidationMae)}</p>
                      </div>
                    </div>

                     <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                      {[
                        [t('ml.mae'), mae, getLowerIsBetterWidth(mae, metricCeilings.mae), 'bg-cyan-300'],
                        [t('ml.rmse'), rmse, getLowerIsBetterWidth(rmse, metricCeilings.rmse), 'bg-amber-300'],
                        [t('ml.r2'), r2, getHigherIsBetterWidth(r2, metricCeilings.r2), 'bg-emerald-300'],
                        ['CV MAE', crossValidationMae, getLowerIsBetterWidth(crossValidationMae, metricCeilings.crossValidationMae), 'bg-teal-300'],
                      ].map(([label, value, width, colorClass]) => (
                        <div key={label} className="rounded border border-slate-800 bg-slate-950/70 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p>
                            <p className="font-black text-white">{formatMetric(value)}</p>
                          </div>
                          <div className="mt-3 h-2 rounded bg-slate-800">
                            <div className={`h-2 rounded ${colorClass}`} style={{ width: `${width}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {!isLoading && !hasModel ? (
        <section className="rounded border border-slate-800 bg-slate-900/80 p-6">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <div className="grid size-12 place-items-center rounded border border-cyan-300/25 bg-cyan-300/10 text-cyan-100">
                <BrainCircuit size={24} aria-hidden="true" />
              </div>
              <h2 className="mt-5 text-2xl font-black text-white">{t('ml.noModel')}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                Run the training job to compare algorithms, create the model artifact, and populate the registry status panels.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {['Load battery dataset', 'Benchmark algorithms', 'Register best model'].map((step, index) => (
                <div key={step} className="rounded border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Stage {index + 1}</p>
                  <p className="mt-3 font-black text-white">{step}</p>
                  <div className="mt-4 h-1.5 rounded bg-slate-800">
                    <div className="h-1.5 rounded bg-cyan-300" style={{ width: `${(index + 1) * 30}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="rounded border border-slate-800 bg-slate-900/80">
        <div className="border-b border-slate-800 p-4">
          <div className="flex items-center gap-3">
            <Activity className="text-cyan-200" size={20} aria-hidden="true" />
            <div>
              <h2 className="font-black text-white">{t('ml.trainingHistory')}</h2>
              <p className="text-sm text-slate-400">Recent model runs and winning error profile</p>
            </div>
          </div>
        </div>
        {history.length ? (
          <div className="divide-y divide-slate-800">
            {history.map((item, index) => (
              <article key={item.trainingId} className="grid gap-4 p-4 text-sm text-slate-300 md:grid-cols-[8rem_1fr_auto] md:items-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Run {history.length - index}</p>
                  <p className="mt-1 text-slate-400">{formatDate(item.trainedAt)}</p>
                </div>
                <div>
                  <p className="font-black text-white">{item.bestModelName}</p>
                  <p className="mt-1 text-slate-500">Training ID {item.trainingId ?? '-'}</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-3 md:min-w-[22rem]">
                  <span className="rounded border border-cyan-400/20 bg-cyan-400/5 px-3 py-2 text-cyan-100">{t('ml.mae')} {formatMetric(item.bestMetrics?.mae)}</span>
                  <span className="rounded border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-amber-100">{t('ml.rmse')} {formatMetric(item.bestMetrics?.rmse)}</span>
                  <span className="rounded border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 text-emerald-100">{t('ml.r2')} {formatMetric(item.bestMetrics?.r2)}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="p-4 text-sm text-slate-400">{t('ml.noTraining')}</p>
        )}
      </section>
    </section>
  );
}