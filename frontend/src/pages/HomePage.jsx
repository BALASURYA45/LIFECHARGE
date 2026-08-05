import { ArrowRight, BarChart3, BatteryCharging, Bike, Bus, CalendarClock, Car, ClipboardCheck, LayoutGrid, ShieldCheck, Truck, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../../../Images/EV battery.png';

const cardStyles = {
  cyan: 'from-cyan-500/10 via-cyan-400/5 to-white border-cyan-200/70 shadow-cyan-100/80',
  emerald: 'from-emerald-500/10 via-emerald-400/5 to-white border-emerald-200/70 shadow-emerald-100/80',
  amber: 'from-amber-500/10 via-amber-400/5 to-white border-amber-200/70 shadow-amber-100/80',
};

const actions = [
  {
    to: '/routine',
    title: 'Routine-based analysis',
    description: 'Fill your daily, weekly, or monthly routine and let LifeCharge turn it into battery health insights.',
    icon: CalendarClock,
    tone: 'cyan',
  },
  {
    to: '/dashboard',
    title: 'Live battery dashboard',
    description: 'Review trends, status summaries, and your most recent battery-health reports in one place.',
    icon: BarChart3,
    tone: 'emerald',
  },
  {
    to: '/prediction',
    title: 'Legacy manual analyzer',
    description: 'Use the original detailed check when you want full control over the input values.',
    icon: ClipboardCheck,
    tone: 'amber',
  },
];

function BatteryVisual() {
  const { t } = useTranslation();
  return (
    <div className="relative mx-auto w-full max-w-md rounded-[24px] border border-cyan-500/25 bg-white p-3 shadow-[0_20px_60px_-20px_rgba(6,182,212,0.35)] sm:p-5">
      <div className="absolute -right-3 top-1/2 h-16 w-3 -translate-y-1/2 rounded-r border border-l-0 border-cyan-500/40 bg-white" />
      <div className="grid gap-3 rounded-[20px] border border-cyan-500/20 bg-gradient-to-br from-slate-50 via-white to-cyan-50 p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">{t('home.liveProfile')}</p>
            <p className="mt-1 text-sm text-slate-600">2022 EV long range pack</p>
          </div>
          <BatteryCharging className="text-cyan-600" size={24} aria-hidden="true" />
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 sm:p-2">
          <div className="relative h-56 overflow-hidden rounded-lg bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.25),_transparent_45%),linear-gradient(135deg,_#0f172a,_#111827_45%,_#0f766e)] sm:h-64">
            <style>{`
              @keyframes spinCCW {
                0% { transform: rotateX(0deg) rotateY(0deg); }
                100% { transform: rotateX(-360deg) rotateY(-360deg); }
              }
              @keyframes floatGlow {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-6px); }
              }
            `}</style>
            <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.08)_45%,transparent_70%)]" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/80 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative h-36 w-36 [perspective:1000px]">
                <div className="absolute inset-0 animate-[spinCCW_7s_linear_infinite] [transform-style:preserve-3d]">
                  <div className="absolute inset-0 overflow-hidden rounded-2xl border border-cyan-300/30 bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 shadow-[0_0_30px_rgba(34,211,238,0.25)] [transform:rotateY(0deg)_translateZ(72px)]">
                    <img
                      src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=80"
                      alt="Electric bike"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 overflow-hidden rounded-2xl border border-emerald-300/30 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 shadow-[0_0_30px_rgba(16,185,129,0.25)] [transform:rotateY(90deg)_translateZ(72px)]">
                    <img
                      src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80"
                      alt="Electric car"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 overflow-hidden rounded-2xl border border-violet-300/30 bg-gradient-to-br from-slate-900 via-slate-800 to-violet-950 shadow-[0_0_30px_rgba(167,139,250,0.25)] [transform:rotateY(180deg)_translateZ(72px)]">
                    <img
                      src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=900&q=80"
                      alt="Electric bus"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 overflow-hidden rounded-2xl border border-amber-300/30 bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 shadow-[0_0_25px_rgba(249,115,22,0.25)] [transform:rotateY(270deg)_translateZ(72px)]">
                    <img
                      src="https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=900&q=80"
                      alt="Auto rickshaw"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-br from-slate-900 via-slate-800 to-white/10 shadow-[0_0_25px_rgba(255,255,255,0.15)] [transform:rotateX(90deg)_translateZ(72px)]">
                    <BatteryCharging size={28} className="text-white" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-br from-slate-900 via-slate-800 to-white/10 shadow-[0_0_25px_rgba(255,255,255,0.15)] [transform:rotateX(270deg)_translateZ(72px)]">
                    <ShieldCheck size={28} className="text-cyan-200" />
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/20 bg-slate-900/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-100 shadow-lg animate-[floatGlow_3s_ease-in-out_infinite]">
              <BatteryCharging size={14} /> rotating EV dice
            </div>
          </div>
        </div>
        <div className="grid gap-2 sm:gap-3 grid-cols-1 xs:grid-cols-3">
          {[
            [t('home.signals.soh'), '91%', t('home.signals.healthyRange')],
            [t('home.signals.rul'), '38 mo', t('home.signals.projectedLife')],
            [t('home.signals.risk'), 'Low', t('home.signals.noServiceFlag')],
          ].map(([label, value, detail]) => (
            <div key={label} className="rounded-xl border border-cyan-500/10 bg-white/90 p-3 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600">{label}</p>
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
    <section className="space-y-8" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700">
            <ShieldCheck size={16} aria-hidden="true" />
            {t('home.hero.badge')}
          </div>
          <div>
            <h1 className="max-w-4xl text-4xl font-black leading-[1.08] tracking-[-0.02em] text-slate-900 md:text-6xl">
              {t('home.hero.heading')}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg" style={{ fontFamily: '"Poppins", Inter, sans-serif' }}>
              {t('home.hero.description')}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="lc-focus inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 font-bold text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all duration-200"
              to="/routine"
            >
              <CalendarClock size={20} aria-hidden="true" />
              Start routine analysis
            </Link>
            <Link
              className="lc-focus inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 font-bold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200"
              to="/prediction"
            >
              <ClipboardCheck size={20} aria-hidden="true" />
              Open legacy analyzer
            </Link>
            <Link
              className="lc-focus inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 font-bold text-slate-700 hover:border-violet-300 hover:text-violet-700 transition-all duration-200"
              to="/showroom"
            >
              <LayoutGrid size={20} aria-hidden="true" />
              3D Showroom
            </Link>
          </div>
        </div>
        <BatteryVisual />
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:grid-cols-3 sm:p-6">
        {[
          ['Daily routine', 'Great for regular commuting and predictable home charging.', 'from-cyan-500/10 to-cyan-50 border-cyan-200/70'],
          ['Weekly routine', 'Perfect when the week changes with work, school, or weekend travel.', 'from-emerald-500/10 to-emerald-50 border-emerald-200/70'],
          ['Monthly routine', 'Useful for seasonal travel or occasional EV use.', 'from-amber-500/10 to-amber-50 border-amber-200/70'],
        ].map(([title, description, gradient]) => (
          <div key={title} className={`rounded-2xl border bg-gradient-to-br ${gradient} p-4 shadow-sm`}>
            <p className="text-sm font-black text-slate-900">{title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
          </div>
        ))}
      </div>

      <Link
        to="/showroom"
        className="group block rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 transition-all duration-300 hover:border-violet-300 hover:shadow-card-hover hover:-translate-y-0.5"
      >
        <div className="flex items-center gap-6">
          <div className="hidden sm:grid size-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
            <Bike size={36} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900">EV Fleet Showroom</h2>
              <span className="rounded-full bg-gradient-to-r from-violet-500 to-purple-600 px-2.5 py-0.5 text-xs font-bold text-white">3D</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Browse our complete EV database in an interactive 3D showroom. Click any vehicle to instantly check its battery health.
            </p>
            <div className="mt-3 flex gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Bike size={14} /> {t('home.actions.checkBattery.title')} EVs</span>
              <span className="flex items-center gap-1"><Truck size={14} /> 3-Wheelers</span>
              <span className="flex items-center gap-1"><Car size={14} /> Cars & SUVs</span>
              <span className="flex items-center gap-1"><Bus size={14} /> Buses</span>
            </div>
          </div>
          <ArrowRight className="text-violet-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-violet-600 shrink-0" size={24} aria-hidden="true" />
        </div>
      </Link>

      <div className="grid gap-4 lg:grid-cols-3">
        {actions.map(({ to, title, description, icon: Icon, tone }) => {
          const toneClass = {
            cyan: 'text-cyan-700 bg-cyan-100/80 border-cyan-300/70',
            emerald: 'text-emerald-700 bg-emerald-100/80 border-emerald-300/70',
            amber: 'text-amber-700 bg-amber-100/80 border-amber-300/70',
          }[tone];

          return (
            <Link
              key={title}
              className={`lc-focus group rounded-[20px] border bg-gradient-to-br ${cardStyles[tone]} p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-6`}
              to={to}
            >
              <div className={`mb-5 grid size-11 place-items-center rounded-lg border ${toneClass}`}>
                <Icon size={22} aria-hidden="true" />
              </div>
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-black tracking-[-0.01em] text-slate-900">{title}</h2>
                <ArrowRight className="text-slate-400 transition-all duration-200 group-hover:translate-x-1 group-hover:text-accent" size={20} aria-hidden="true" />
              </div>
              <p className="mt-2.5 text-sm leading-6 text-slate-600">{description}</p>
            </Link>
          );
        })}
      </div>

      <section className="lc-card-static rounded-xl p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-lg font-black text-slate-900">{t('home.maintenanceSection.heading')}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              {t('home.maintenanceSection.description')}
            </p>
          </div>
          <Link
            className="lc-focus inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-700 hover:border-amber-400 hover:text-amber-700 transition-all duration-200"
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