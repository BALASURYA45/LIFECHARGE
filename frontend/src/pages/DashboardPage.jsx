import { Activity, AlertTriangle, BarChart3, BatteryCharging, CalendarClock, ClipboardCheck, Gauge, Plus, Thermometer, Zap } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import { useToast } from '../components/useToastHook.jsx';

function formatDate(value) {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

function getRiskTone(status = '') {
  const normalized = status.toLowerCase();
  if (normalized.includes('critical')) return 'red';
  if (normalized.includes('warning')) return 'amber';
  if (normalized.includes('good')) return 'emerald';
  return 'cyan';
}

function toneClasses(tone) {
  return {
    cyan: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-100',
    emerald: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100',
    amber: 'border-amber-400/30 bg-amber-400/10 text-amber-100',
    red: 'border-red-500 bg-red-600 text-white',
  }[tone];
}

function EmptyState() {
  const { t } = useTranslation();
  return (
    <div className="rounded-lg border border-cyan-500/20 bg-slate-900/70 p-6">
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          <div className="grid size-12 place-items-center rounded border border-cyan-300/25 bg-cyan-300/10 text-cyan-100">
            <BatteryCharging size={24} aria-hidden="true" />
          </div>
          <h2 className="mt-5 text-2xl font-black text-white">{t('dashboard.emptyTitle')}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            {t('dashboard.emptyDesc')}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link className="lc-focus inline-flex items-center gap-2 rounded bg-cyan-300 px-4 py-3 font-bold text-slate-950 hover:bg-cyan-200" to="/battery">
              <Plus size={18} aria-hidden="true" />
              {t('dashboard.addProfile')}
            </Link>
            <Link className="lc-focus inline-flex items-center gap-2 rounded border border-cyan-300/40 px-4 py-3 font-bold text-slate-100 hover:border-cyan-300" to="/routine">
              <CalendarClock size={18} aria-hidden="true" />
              Add Routine
            </Link>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[t('dashboard.step1'), t('dashboard.step2'), t('dashboard.step3')].map((step, index) => (
            <div key={step} className="rounded border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{t('common.step')} {index + 1}</p>
              <p className="mt-3 font-black text-white">{step}</p>
              <div className="mt-4 h-1.5 rounded bg-slate-800">
                <div className="h-1.5 rounded bg-cyan-300" style={{ width: `${(index + 1) * 30}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

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
          const message = getErrorMessage(dashboardError);
          setError(message);
          addToast(message, 'error');
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
  }, [addToast]);

  const hasPredictions = Boolean(summary?.counts?.predictions);
  const statusData = summary?.statusDistribution ?? [];
  const trendData = summary?.trend ?? [];
  const latestPrediction = summary?.latestPrediction;
  const recommendations = summary?.latestRecommendations?.items ?? [];
  const riskTone = useMemo(() => getRiskTone(latestPrediction?.batteryStatus), [latestPrediction?.batteryStatus]);

  return (
    <section className="space-y-6">
      <div className="lc-card-static rounded-2xl p-5 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">{t('dashboard.title')}</p>
            <h1 className="mt-2 text-3xl font-black text-slate-900 md:text-4xl tracking-tight">{t('dashboard.welcome', { name: user?.name ?? 'driver' })}</h1>
            <p className="mt-3 max-w-2xl text-slate-600 leading-relaxed">
              Enter your daily, weekly, or monthly routine first. LifeCharge translates habits into battery-life analysis, while the legacy analyzer stays available for manual checks.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="lc-focus inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-cyan-500 shadow-md shadow-cyan-500/20 transition-all duration-200" to="/digital-twin">
              <BatteryCharging size={18} aria-hidden="true" />
              Digital Twin
            </Link>
            <Link className="lc-focus inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 shadow-md shadow-slate-900/20 transition-all duration-200" to="/routine">
              <CalendarClock size={18} aria-hidden="true" />
              Analyze Routine
            </Link>
            <Link className="lc-focus inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-purple-500 shadow-md shadow-purple-500/20 transition-all duration-200" to="/model-comparison">
              <BarChart3 size={18} aria-hidden="true" />
              Model Benchmark
            </Link>
            <Link className="lc-focus inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-500 shadow-md shadow-emerald-500/20 transition-all duration-200" to="/research-experiments">
              <Zap size={18} aria-hidden="true" />
              Experiments
            </Link>
            <Link className="lc-focus inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200" to="/reports">
              <ClipboardCheck size={18} aria-hidden="true" />
              {t('dashboard.reports')}
            </Link>
          </div>
        </div>
      </div>

      {error ? <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[t('dashboard.latestSoh'), t('dashboard.latestRul'), t('dashboard.confidence'), t('dashboard.risk')].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white p-4" />
          ))}
        </div>
      ) : null}
      {isLoading ? (
        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="h-80 animate-pulse rounded-xl border border-slate-200 bg-white" />
          <div className="h-80 animate-pulse rounded-xl border border-slate-200 bg-white" />
        </div>
      ) : null}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[t('dashboard.averageSoh'), t('dashboard.avgConfidence'), t('dashboard.avgTemperature'), t('dashboard.fastCharging')].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white p-5" />
          ))}
        </div>
      ) : null}
      {isLoading ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="h-48 animate-pulse rounded-xl border border-slate-200 bg-white" />
          <div className="h-48 animate-pulse rounded-xl border border-slate-200 bg-white" />
        </div>
      ) : null}

      {!isLoading && !hasPredictions ? <EmptyState /> : null}

      {hasPredictions ? (
        <>
          <section className={`lc-card-static rounded-2xl overflow-hidden ${toneClasses(riskTone)}`}>
            <div className="p-5 sm:p-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="grid size-14 place-items-center rounded-2xl border border-current/25 bg-black/20 backdrop-blur-sm">
                      <AlertTriangle size={26} aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.18em] opacity-90">{t('dashboard.latestStatus')}</p>
                      <h2 className="mt-1 text-4xl font-black text-white tracking-tight">{latestPrediction.batteryStatus}</h2>
                    </div>
                  </div>
                  <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-200">
                    {t('dashboard.lastDiagnostic', { soh: latestPrediction.SOH, rul: latestPrediction.RUL, confidence: latestPrediction.confidenceScore })}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[34rem]">
                  <MetricCard label={t('dashboard.latestSoh')} value={`${latestPrediction.SOH}%`} tone={riskTone} />
                  <MetricCard label={t('dashboard.latestRul')} value={`${latestPrediction.RUL} mo`} tone="amber" />
                  <MetricCard label={t('dashboard.confidence')} value={`${latestPrediction.confidenceScore}%`} tone="emerald" />
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              [t('dashboard.averageSoh'), summary.metrics.averageSOH ? `${summary.metrics.averageSOH}%` : '-', BatteryCharging, 'cyan'],
              [t('dashboard.avgConfidence'), summary.metrics.averageConfidence ? `${summary.metrics.averageConfidence}%` : '-', Gauge, 'emerald'],
              [t('dashboard.avgTemperature'), summary.metrics.averageTemperature ? `${summary.metrics.averageTemperature} C` : '-', Thermometer, 'amber'],
              [t('dashboard.fastCharging'), summary.metrics.averageFastChargingUsage ? `${summary.metrics.averageFastChargingUsage}%` : '-', Zap, 'red'],
            ].map(([label, value, Icon, tone]) => (
              <article key={label} className="lc-card-static rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <Icon className={toneClasses(tone).split(' ')[2]} size={24} aria-hidden="true" />
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
                <p className="mt-2 break-words text-2xl font-black text-slate-900">{value}</p>
              </article>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <section className="lc-card-static rounded-xl p-5 sm:p-6">
              <div className="mb-6 flex items-center gap-3">
                <Activity className="text-slate-900" size={24} aria-hidden="true" />
                <div>
                  <h2 className="text-lg font-black text-slate-900">{t('dashboard.healthTrend')}</h2>
                  <p className="text-sm text-slate-600">{t('dashboard.healthTrendDesc')}</p>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" stroke="#94a3b8" tickFormatter={formatDate} style={{ fontSize: 12 }} />
                    <YAxis stroke="#94a3b8" style={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a', borderRadius: 8, boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.1)' }} />
                    <Line type="monotone" dataKey="SOH" stroke="#06b6d4" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="RUL" stroke="#f59e0b" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="lc-card-static rounded-xl p-5 sm:p-6">
              <h2 className="text-lg font-black text-slate-900">{t('dashboard.statusDistribution')}</h2>
              <p className="mt-1 text-sm text-slate-600">{t('dashboard.statusDistDesc')}</p>
              <div className="mt-5 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="status" stroke="#94a3b8" style={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} stroke="#94a3b8" style={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a', borderRadius: 8, boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.1)' }} />
                    <Bar dataKey="count" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="lc-card-static rounded-xl overflow-hidden">
              <div className="border-b border-slate-200 p-5">
                <h2 className="font-black text-slate-900">{t('dashboard.nextActions')}</h2>
              </div>
              {recommendations.length ? (
                <div className="divide-y divide-slate-100">
                  {recommendations.slice(0, 4).map((item) => (
                    <article key={`${item.title}-${item.category}`} className="p-5">
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <h3 className="font-bold text-slate-900">{item.title}</h3>
                        <span className="w-fit rounded-lg border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700 bg-slate-50">{item.priority}</span>
                      </div>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="p-5 text-sm text-slate-600">{t('dashboard.noActions')}</p>
              )}
            </section>

            <section className="lc-card-static rounded-xl overflow-hidden">
              <div className="border-b border-slate-200 p-5">
                <h2 className="font-black text-slate-900">{t('dashboard.recentChecks')}</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {summary.recentPredictions.slice(0, 6).map((prediction) => (
                  <article key={prediction.id ?? prediction._id} className="p-5 text-sm">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                      <div>
                        <p className="font-bold text-slate-900">{prediction.batteryStatus}</p>
                        {prediction.vehicleMake && prediction.vehicleModel ? (
                          <p className="mt-1 text-xs text-slate-500">{prediction.vehicleMake} {prediction.vehicleModel}</p>
                        ) : null}
                      </div>
                      <p className="text-slate-500">{formatDate(prediction.date ?? prediction.createdAt)}</p>
                    </div>
                    <p className="mt-2 text-slate-600">
                      SOH {prediction.SOH}% | RUL {prediction.RUL} months | {t('dashboard.confidence')} {prediction.confidenceScore}%
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




