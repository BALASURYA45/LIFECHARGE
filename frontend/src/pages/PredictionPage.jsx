import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BatteryDataForm from '../components/BatteryDataForm.jsx';
import PredictionResult from '../components/PredictionResult.jsx';
import { createPrediction, getPredictionHistory } from '../services/predictionService.js';
import { getErrorMessage } from '../utils/getErrorMessage.js';

function formatDate(value) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function PredictionPage() {
  const [latestPrediction, setLatestPrediction] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
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
      setMessage('Prediction generated and saved to history.');
      await loadHistory();
    } catch (predictionError) {
      setError(getErrorMessage(predictionError));
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-300">Prediction</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Predict SOH and RUL</h1>
          <p className="mt-2 max-w-3xl text-slate-400">
            Enter battery operating data to estimate State of Health, Remaining Useful Life, battery status, confidence score, and degradation trend.
          </p>
        </div>
        <Link className="rounded border border-slate-700 px-4 py-3 font-semibold text-slate-100 hover:border-teal-400" to="/ml-training">
          Train model
        </Link>
      </div>

      {message ? <p className="rounded border border-teal-800 bg-teal-950 p-3 text-sm text-teal-100">{message}</p> : null}
      {error ? <p className="rounded border border-red-900 bg-red-950 p-3 text-sm text-red-200">{error}</p> : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <section className="rounded border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-5 text-lg font-semibold text-white">Battery input features</h2>
          <BatteryDataForm onSubmit={handlePredict} />
        </section>

        <div className="space-y-6">
          <PredictionResult prediction={latestPrediction} />

          <section className="rounded border border-slate-800 bg-slate-900">
            <div className="border-b border-slate-800 p-4">
              <h2 className="font-semibold text-white">Prediction history</h2>
            </div>
            {isLoadingHistory ? <p className="p-4 text-sm text-slate-400">Loading predictions...</p> : null}
            {!isLoadingHistory && history.length === 0 ? <p className="p-4 text-sm text-slate-400">No predictions yet.</p> : null}
            {history.length ? (
              <div className="divide-y divide-slate-800">
                {history.map((prediction) => (
                  <article key={prediction._id} className="p-4 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-white">{prediction.batteryStatus}</p>
                      <p className="text-slate-500">{formatDate(prediction.createdAt)}</p>
                    </div>
                    <p className="mt-2 text-slate-300">
                      SOH {prediction.SOH}% · RUL {prediction.RUL} months · Confidence {prediction.confidenceScore}%
                    </p>
                    <p className="mt-1 text-slate-400">{prediction.degradationTrend}</p>
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
