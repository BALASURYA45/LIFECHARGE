import { Activity, BatteryCharging, Gauge, Thermometer, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import MetricCard from '../components/MetricCard.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { getDashboardSummary } from '../services/dashboardService.js';
import { getErrorMessage } from '../utils/getErrorMessage.js';

function formatDate(value) {
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

function EmptyState() {
  return (
    <div className="rounded border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-lg font-semibold text-white">No dashboard data yet</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        Add battery records, train the model, and run predictions to populate dashboard analytics.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link className="rounded bg-teal-500 px-4 py-3 font-semibold text-slate-950 hover:bg-teal-400" to="/battery">
          Add battery data
        </Link>
        <Link className="rounded border border-slate-700 px-4 py-3 font-semibold text-slate-100 hover:border-teal-400" to="/prediction">
          Run prediction
        </Link>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        const data = await getDashboardSummary();
        if (isMounted) {
          setSummary(data.summary);
        }
      } catch (dashboardError) {
        if (isMounted) {
          setError(getErrorMessage(dashboardError));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const hasPredictions = Boolean(summary?.counts?.predictions);
  const statusData = summary?.statusDistribution ?? [];
  const trendData = summary?.trend ?? [];
  const latestPrediction = summary?.latestPrediction;
  const recommendations = summary?.latestRecommendations?.items ?? [];

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-300">Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Welcome, {user?.name}</h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Monitor battery health, prediction trends, degradation status, dataset coverage, and maintenance recommendations.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link className="rounded bg-teal-500 px-4 py-3 font-semibold text-slate-950 hover:bg-teal-400" to="/battery">
            Manage battery data
          </Link>
          <Link className="rounded border border-slate-700 px-4 py-3 font-semibold text-slate-100 hover:border-teal-400" to="/prediction">
            Run prediction
          </Link>
          <Link className="rounded border border-slate-700 px-4 py-3 font-semibold text-slate-100 hover:border-teal-400" to="/what-if">
            What-if analysis
          </Link>
          <Link className="rounded border border-slate-700 px-4 py-3 font-semibold text-slate-100 hover:border-teal-400" to="/reports">
            Reports
          </Link>
        </div>
      </div>

      {error ? <p className="rounded border border-red-900 bg-red-950 p-3 text-sm text-red-200">{error}</p> : null}
      {isLoading ? <p className="text-sm text-slate-400">Loading dashboard...</p> : null}
      {!isLoading && !hasPredictions ? <EmptyState /> : null}

      {hasPredictions ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Latest SOH" value={`${latestPrediction.SOH}%`} />
            <MetricCard label="Latest RUL" value={`${latestPrediction.RUL} months`} />
            <MetricCard label="Prediction Count" value={summary.counts.predictions} />
            <MetricCard label="Battery Records" value={summary.counts.batteryRecords} />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              ['Average SOH', summary.metrics.averageSOH ? `${summary.metrics.averageSOH}%` : '-', BatteryCharging],
              ['Average Confidence', summary.metrics.averageConfidence ? `${summary.metrics.averageConfidence}%` : '-', Gauge],
              ['Avg Temperature', summary.metrics.averageTemperature ? `${summary.metrics.averageTemperature} C` : '-', Thermometer],
              ['Avg Fast Charging', summary.metrics.averageFastChargingUsage ? `${summary.metrics.averageFastChargingUsage}%` : '-', Zap],
            ].map(([label, value, Icon]) => (
              <article key={label} className="rounded border border-slate-800 bg-slate-900 p-5">
                <Icon className="text-teal-300" size={22} aria-hidden="true" />
                <p className="mt-4 text-sm text-slate-400">{label}</p>
                <p className="mt-2 text-2xl font-bold text-white">{value}</p>
              </article>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <section className="rounded border border-slate-800 bg-slate-900 p-5">
              <div className="mb-5 flex items-center gap-3">
                <Activity className="text-teal-300" size={22} aria-hidden="true" />
                <div>
                  <h2 className="font-semibold text-white">Battery trend</h2>
                  <p className="text-sm text-slate-400">SOH and RUL across recent predictions</p>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                    <XAxis dataKey="date" stroke="#94a3b8" tickFormatter={formatDate} />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ background: '#020617', border: '1px solid #334155', color: '#e2e8f0' }} />
                    <Line type="monotone" dataKey="SOH" stroke="#2dd4bf" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="RUL" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="rounded border border-slate-800 bg-slate-900 p-5">
              <h2 className="font-semibold text-white">Status distribution</h2>
              <p className="mt-1 text-sm text-slate-400">Prediction count by battery status</p>
              <div className="mt-5 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData}>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                    <XAxis dataKey="status" stroke="#94a3b8" />
                    <YAxis allowDecimals={false} stroke="#94a3b8" />
                    <Tooltip contentStyle={{ background: '#020617', border: '1px solid #334155', color: '#e2e8f0' }} />
                    <Bar dataKey="count" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded border border-slate-800 bg-slate-900">
              <div className="border-b border-slate-800 p-4">
                <h2 className="font-semibold text-white">Latest recommendations</h2>
              </div>
              {recommendations.length ? (
                <div className="divide-y divide-slate-800">
                  {recommendations.slice(0, 4).map((item) => (
                    <article key={`${item.title}-${item.category}`} className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-semibold text-white">{item.title}</h3>
                        <span className="rounded border border-slate-700 px-2 py-1 text-xs text-slate-300">{item.priority}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="p-4 text-sm text-slate-400">Generate recommendations from a prediction to show them here.</p>
              )}
            </section>

            <section className="rounded border border-slate-800 bg-slate-900">
              <div className="border-b border-slate-800 p-4">
                <h2 className="font-semibold text-white">Recent predictions</h2>
              </div>
              <div className="divide-y divide-slate-800">
                {summary.recentPredictions.slice(0, 6).map((prediction) => (
                  <article key={prediction.id} className="p-4 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-white">{prediction.batteryStatus}</p>
                      <p className="text-slate-500">{formatDate(prediction.date)}</p>
                    </div>
                    <p className="mt-2 text-slate-300">
                      SOH {prediction.SOH}% | RUL {prediction.RUL} months | Confidence {prediction.confidenceScore}%
                    </p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </>
      ) : null}
    </section>
  );
}
