import { ArrowRight, BarChart3, BatteryCharging, ClipboardCheck, FileText, ShieldCheck, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const actions = [
  {
    to: '/prediction',
    key: 'checkBattery',
    icon: ClipboardCheck,
    tone: 'cyan',
  },
  {
    to: '/dashboard',
    key: 'viewDashboard',
    icon: BarChart3,
    tone: 'emerald',
  },
  {
    to: '/reports',
    key: 'reports',
    icon: FileText,
    tone: 'amber',
  },
];

function BatteryVisual() {
  const { t } = useTranslation();
  return (
    <div className="relative mx-auto w-full max-w-md rounded-lg border border-cyan-500/30 bg-white p-3 sm:p-5 shadow-2xl shadow-cyan-200/30">
      <div className="absolute -right-3 top-1/2 h-16 w-3 -translate-y-1/2 rounded-r border border-l-0 border-cyan-500/40 bg-white" />
      <div className="grid gap-3 rounded-lg border border-cyan-500/20 bg-slate-50 p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-700">{t('home.liveProfile')}</p>
            <p className="mt-1 text-sm text-slate-600">2022 EV long range pack</p>
          </div>
          <BatteryCharging className="text-cyan-600" size={24} aria-hidden="true" />
        </div>
        <div className="grid grid-cols-12 gap-0.5 sm:gap-1">
          {Array.from({ length: 12 }).map((_, index) => (
            <span
              key={index}
              className={`h-16 sm:h-24 rounded-lg ${
                index < 9 ? 'bg-accent shadow-[0_0_20px_rgba(6,182,212,0.45)]' : index < 11 ? 'bg-warning/90' : 'bg-slate-200/80'
              }`}
            />
          ))}
        </div>
        <div className="grid gap-2 sm:gap-3 grid-cols-1 xs:grid-cols-3">
            {[
              [t('home.signals.soh'), '91%', t('home.signals.healthyRange')],
              [t('home.signals.rul'), '38 mo', t('home.signals.projectedLife')],
              [t('home.signals.risk'), 'Low', t('home.signals.noServiceFlag')],
            ].map(([label, value, detail]) => (
              <div key={label} className="rounded-lg border border-cyan-500/15 bg-white p-3">
                <p className="text-xs font-semibold text-slate-700">{label}</p>
                <p className="mt-1 text-xl font-black text-slate-900">{value}</p>
                <p className="mt-1 text-xs text-slate-600">{detail}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { t } = useTranslation();
  return (
    <section className="space-y-8">
      <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-800">
            <ShieldCheck size={16} aria-hidden="true" />
            {t('home.hero.badge')}
          </div>
          <div>
            <h1 className="max-w-4xl text-4xl font-black leading-tight text-slate-900 md:text-6xl">
              {t('home.hero.heading')}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-700 md:text-lg">
              {t('home.hero.description')}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="lc-focus inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-3 font-bold text-white shadow-[0_0_18px_rgba(6,182,212,0.35)] transition hover:bg-accent-light"
              to="/prediction"
            >
              <ClipboardCheck size={18} aria-hidden="true" />
              {t('home.hero.checkBattery')}
            </Link>
            <Link
              className="lc-focus inline-flex items-center gap-2 rounded-lg border border-cyan-500/30 px-4 py-3 font-bold text-slate-700 transition hover:border-accent hover:text-accent"
              to="/dashboard"
            >
              <BarChart3 size={18} aria-hidden="true" />
              {t('home.hero.viewDashboard')}
            </Link>
          </div>
        </div>
        <BatteryVisual />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {actions.map(({ to, key, icon: Icon, tone }) => {
          const toneClass = {
            cyan: 'text-accent-light bg-accent/10 border-accent/30',
            emerald: 'text-emerald-700 bg-emerald-100 border-emerald-300',
            amber: 'text-amber-700 bg-amber-100 border-amber-300',
          }[tone];

          return (
            <Link
              key={key}
              className="lc-focus group rounded-lg border border-cyan-500/15 bg-white p-5 transition hover:-translate-y-0.5 hover:border-accent/40 hover:bg-slate-50"
              to={to}
            >
              <div className={`mb-5 grid size-11 place-items-center rounded-lg border ${toneClass}`}>
                <Icon size={22} aria-hidden="true" />
              </div>
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-black text-slate-900">{t(`home.actions.${key}.title`)}</h2>
                <ArrowRight className="text-slate-500 transition group-hover:translate-x-1 group-hover:text-accent" size={20} aria-hidden="true" />
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{t(`home.actions.${key}.description`)}</p>
            </Link>
          );
        })}
      </div>

      <section className="rounded-lg border border-cyan-500/15 bg-white p-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-lg font-black text-slate-900">{t('home.maintenanceSection.heading')}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              {t('home.maintenanceSection.description')}
            </p>
          </div>
          <Link
            className="lc-focus inline-flex w-fit items-center gap-2 rounded-lg border border-amber-400/40 px-4 py-3 font-bold text-slate-700 hover:border-warning hover:text-warning transition"
            to="/battery"
          >
            <Wrench size={18} aria-hidden="true" />
            {t('home.maintenanceSection.addProfile')}
          </Link>
        </div>
      </section>
    </section>
  );
}