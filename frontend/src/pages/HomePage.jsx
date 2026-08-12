import { ArrowRight, BarChart3, Bike, Bus, CalendarClock, Car, ClipboardCheck, Dices, LayoutGrid, ShieldCheck, Truck, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import batteryImage from '../../../Images/EV battery.png';

const actions = [
  {
    to: '/routine',
    title: 'Routine-based analysis',
    description: 'Fill your daily, weekly, or monthly routine and let LifeCharge turn it into battery health insights.',
    icon: CalendarClock,
    tone: 'accent',
  },
  {
    to: '/dashboard',
    title: 'Live battery dashboard',
    description: 'Review trends, status summaries, and your most recent battery-health reports in one place.',
    icon: BarChart3,
    tone: 'accent',
  },
  {
    to: '/prediction',
    title: 'Legacy manual analyzer',
    description: 'Use the original detailed check when you want full control over the input values.',
    icon: ClipboardCheck,
    tone: 'accent',
  },
];

function BatteryVisual() {
  return (
    <div className="mx-auto w-full max-w-md overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/85 shadow-[0_40px_90px_-40px_rgba(6,182,212,0.35)]">
      <img src={batteryImage} alt="Battery pack illustration" className="h-full w-full object-cover" />
    </div>
  );
}

export default function HomePage() {
  const { t } = useTranslation();
  return (
    <section className="relative overflow-hidden space-y-10 px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(6,182,212,0.1),transparent_30%)] pointer-events-none" />
      <div className="relative grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-600 dark:text-cyan-400 shadow-sm">
            <ShieldCheck size={16} aria-hidden="true" />
            {t('home.hero.badge')}
          </div>
          <div>
            <h1 className="max-w-4xl text-4xl font-black leading-[1.05] tracking-[-0.04em] text-slate-900 dark:text-white md:text-6xl">
              {t('home.hero.heading')}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 md:text-lg" style={{ fontFamily: '"Poppins", Inter, sans-serif' }}>
              {t('home.hero.description')}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="lc-focus inline-flex items-center gap-2 rounded-2xl bg-cyan-600 px-5 py-3.5 font-bold text-white shadow-lg shadow-cyan-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-cyan-500 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
              to="/routine"
            >
              <CalendarClock size={20} aria-hidden="true" />
              Start routine analysis
            </Link>
            <Link
              className="lc-focus inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3.5 font-bold text-slate-800 shadow-sm transition-all duration-200 hover:border-cyan-500 hover:text-cyan-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-cyan-400 dark:hover:text-white"
              to="/prediction"
            >
              <ClipboardCheck size={20} aria-hidden="true" />
              Open legacy analyzer
            </Link>
            <Link
              className="lc-focus inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3.5 font-bold text-slate-800 shadow-sm transition-all duration-200 hover:border-cyan-500 hover:text-cyan-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-cyan-400 dark:hover:text-white"
              to="/showroom"
            >
              <LayoutGrid size={20} aria-hidden="true" />
              3D Showroom
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ['AI-powered insights', 'Real-time battery wisdom'],
              ['Secure by design', 'Encrypted device data'],
              ['Premium alerts', 'Smart maintenance cues'],
            ].map(([title, subtitle]) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-bold text-cyan-600 dark:text-cyan-400">{title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">{subtitle}</p>
              </div>
            ))}
          </div>
        </div>
        <BatteryVisual />
      </div>

      <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-3">
        {[
          ['Daily routine', 'Great for regular commuting and predictable home charging.'],
          ['Weekly routine', 'Perfect when the week changes with work, school, or weekend travel.'],
          ['Monthly routine', 'Useful for seasonal travel or occasional EV use.'],
        ].map(([title, description]) => (
          <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-base font-extrabold text-slate-900 dark:text-white">{title}</p>
            <p className="mt-2.5 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
          </div>
        ))}
      </div>

      <Link
        to="/showroom"
        className="group block overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-cyan-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-cyan-400"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="hidden lg:grid h-16 w-16 place-items-center rounded-2xl bg-cyan-500/10 dark:bg-cyan-500/20">
            <Bike size={32} className="text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">EV Fleet Showroom</h2>
              <span className="rounded-full bg-cyan-600 px-3 py-0.5 text-xs font-bold text-white dark:bg-cyan-500 dark:text-slate-950">3D</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Browse our complete EV database in an interactive 3D showroom. Click any vehicle to instantly check its battery health.
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1"><Bike size={14} /> {t('home.actions.checkBattery.title')} EVs</span>
              <span className="inline-flex items-center gap-1"><Truck size={14} /> 3-Wheelers</span>
              <span className="inline-flex items-center gap-1"><Car size={14} /> Cars & SUVs</span>
              <span className="inline-flex items-center gap-1"><Bus size={14} /> Buses</span>
            </div>
          </div>
          <ArrowRight className="text-cyan-600 dark:text-cyan-400 transition-all duration-300 group-hover:translate-x-1 shrink-0" size={24} aria-hidden="true" />
        </div>
      </Link>

      <div className="grid gap-4 lg:grid-cols-3">
        {actions.map(({ to, title, description, icon: Icon }) => {
          return (
            <Link
              key={title}
              className="lc-focus group rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-cyan-400"
              to={to}
            >
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl border border-cyan-500/20 bg-cyan-50 text-cyan-600 dark:border-slate-700 dark:bg-slate-800 dark:text-cyan-400">
                <Icon size={22} aria-hidden="true" />
              </div>
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-black tracking-[-0.01em] text-slate-900 dark:text-white">{title}</h2>
                <ArrowRight className="text-slate-400 transition-all duration-200 group-hover:translate-x-1 group-hover:text-cyan-500" size={20} aria-hidden="true" />
              </div>
              <p className="mt-2.5 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
            </Link>
          );
        })}
      </div>

      <section className="lc-card-static rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">{t('home.maintenanceSection.heading')}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              {t('home.maintenanceSection.description')}
            </p>
          </div>
          <Link
            className="lc-focus inline-flex w-fit items-center gap-2 rounded-2xl bg-cyan-600 px-4 py-3 font-bold text-white shadow-sm transition-all duration-200 hover:bg-cyan-500 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
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
