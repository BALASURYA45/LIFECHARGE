import { useEffect, useState } from 'react';
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

export default function MachineLearningPage() {
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

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-300">Machine Learning</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Model training and comparison</h1>
          <p className="mt-2 max-w-3xl text-slate-400">
            Train Random Forest, XGBoost, and LightGBM on the sample battery dataset. The system automatically selects the best model using MAE, RMSE, R2, and cross-validation.
          </p>
        </div>
        <button
          className="rounded bg-teal-500 px-4 py-3 font-semibold text-slate-950 hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-70"
          type="button"
          disabled={isTraining}
          onClick={handleTrain}
        >
          {isTraining ? 'Training...' : 'Train models'}
        </button>
      </div>

      {message ? <p className="rounded border border-teal-800 bg-teal-950 p-3 text-sm text-teal-100">{message}</p> : null}
      {error ? <p className="rounded border border-red-900 bg-red-950 p-3 text-sm text-red-200">{error}</p> : null}
      {isLoading ? <p className="text-sm text-slate-400">Loading model status...</p> : null}

      <div className="rounded border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-lg font-semibold text-white">Current best model</h2>
        {currentModel ? (
          <>
            <div className="mt-4 grid gap-4 md:grid-cols-4">
              <MetricCard label="Model" value={currentModel.bestModelName} />
              <MetricCard label="MAE" value={currentModel.bestMetrics?.mae} />
              <MetricCard label="RMSE" value={currentModel.bestMetrics?.rmse} />
              <MetricCard label="R2" value={currentModel.bestMetrics?.r2} />
            </div>
            <p className="mt-4 text-sm text-slate-400">
              Trained at {formatDate(currentModel.trainedAt)} using {currentModel.rowCount} rows.
            </p>
          </>
        ) : (
          <p className="mt-3 text-sm text-slate-400">No trained model yet. Start training with the sample dataset.</p>
        )}
      </div>

      {currentModel?.modelResults?.length ? (
        <div className="rounded border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 p-4">
            <h2 className="font-semibold text-white">Model comparison</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-950 text-slate-400">
                <tr>
                  <th className="px-4 py-3">Model</th>
                  <th className="px-4 py-3">MAE</th>
                  <th className="px-4 py-3">RMSE</th>
                  <th className="px-4 py-3">R2</th>
                  <th className="px-4 py-3">CV MAE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {currentModel.modelResults.map((result) => (
                  <tr key={result.modelName} className="text-slate-300">
                    <td className="px-4 py-3 font-medium text-white">{result.modelName}</td>
                    <td className="px-4 py-3">{result.metrics.mae}</td>
                    <td className="px-4 py-3">{result.metrics.rmse}</td>
                    <td className="px-4 py-3">{result.metrics.r2}</td>
                    <td className="px-4 py-3">{result.metrics.crossValidationMae}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <div className="rounded border border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800 p-4">
          <h2 className="font-semibold text-white">Training history</h2>
        </div>
        {history.length ? (
          <div className="divide-y divide-slate-800">
            {history.map((item) => (
              <article key={item.trainingId} className="p-4 text-sm text-slate-300">
                <p className="font-medium text-white">{item.bestModelName}</p>
                <p className="mt-1 text-slate-400">
                  {formatDate(item.trainedAt)} · MAE {item.bestMetrics?.mae} · RMSE {item.bestMetrics?.rmse}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="p-4 text-sm text-slate-400">No training runs recorded yet.</p>
        )}
      </div>
    </section>
  );
}
