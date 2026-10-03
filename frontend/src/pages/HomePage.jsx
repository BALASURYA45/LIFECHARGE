import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  Activity,
  Box,
  BrainCircuit,
  Cpu,
  Database,
  FileSpreadsheet,
  Gauge,
  Layers,
  Network,
  ShieldCheck,
  Sliders,
  Sparkles,
  Zap,
} from 'lucide-react';
import batteryImage from '../../../Images/EV battery.png';
import logoImage from '../assets/lithyx-logo.png';

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="relative min-h-screen bg-[#F0FBF7] dark:bg-[#070D14] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-12 rounded-3xl transition-colors duration-300">
      
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
        {/* Left Hero Content */}
        <div className="lg:col-span-7 space-y-6">
          {/* Research Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 shadow-sm tracking-wide">
            <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400" />
            {t('home.heroBadge', 'LITHYX RESEARCH PLATFORM • HYBRID PHYSICS & EXPLAINABLE AI')}
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-[60px] font-[900] leading-[1.08] tracking-[-0.03em] text-slate-950 dark:text-white font-sans">
            <span className="text-emerald-600 dark:text-emerald-500">LITHYX</span> {t('home.heroTitle', 'Battery Life Prognostics Platform')}
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
            {t('home.heroSubtitle1', 'Lithium-ion Health Inference thru Transfer, Hybrid Physics and Explainability.')}
          </p>

          <p className="max-w-2xl text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            {t('home.heroSubtitle2', 'Physics-informed, uncertainty-aware and cross-chemistry battery life prognostics for next-generation energy storage research.')}
          </p>

          {/* Action CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-950/40 transition hover:-translate-y-0.5"
            >
              <Gauge size={18} />
              {t('home.openDashboard', 'Open Research Dashboard')}
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/lithyx-prediction"
              className="inline-flex items-center gap-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-3.5 text-sm font-bold text-slate-800 dark:text-slate-200 shadow-sm hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
            >
              <Cpu size={18} />
              {t('home.coreEngine', 'LITHYX Core Engine')}
            </Link>
          </div>

          {/* Quick Module Links */}
          <div className="flex flex-wrap gap-4 pt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <Link to="/health-indicators" className="hover:underline flex items-center gap-1">
              <Activity size={14} /> {t('home.dqdvAnalysis', 'dQ/dV Peak Analysis')}
            </Link>
            <Link to="/cross-chemistry" className="hover:underline flex items-center gap-1">
              <Network size={14} /> {t('home.crossChemTransfer', 'Cross-Chemistry Transfer')}
            </Link>
            <Link to="/digital-twin" className="hover:underline flex items-center gap-1">
              <Box size={14} /> {t('home.ukfDigitalTwin', 'UKF Digital Twin')}
            </Link>
          </div>
        </div>

        {/* Right Hero Visual Card */}
        <div className="lg:col-span-5">
          <div className="relative overflow-hidden rounded-[28px] border border-slate-800 bg-[#0B131F] p-5 sm:p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white tracking-wider">{t('home.cardTitle', 'LITHYX ARCHITECTURE')}</h2>
                <p className="text-[11px] font-medium text-emerald-400">{t('home.cardSubtitle', 'Hybrid Physics-AI Degradation Engine')}</p>
              </div>
              <span className="rounded-lg bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                {t('home.cardVersion', 'v2.5 Research')}
              </span>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-slate-950 p-2 shadow-2xl flex items-center justify-center">
              <img
                src={logoImage}
                alt="LITHYX Official Logo"
                className="w-full h-52 sm:h-60 object-contain rounded-xl transition duration-300 hover:scale-105"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 text-center">
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                <p className="text-[10px] font-semibold text-slate-400">{t('home.targetSoh', 'Target SOH R²')}</p>
                <p className="text-lg font-black text-emerald-400">{t('home.targetSohValue', '> 0.96')}</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                <p className="text-[10px] font-semibold text-slate-400">{t('home.rulAlpha', 'RUL Alpha Coverage')}</p>
                <p className="text-lg font-black text-emerald-400">{t('home.rulAlphaValue', '95% Conformal')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Workflow Section */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B131F] p-6 sm:p-8 space-y-6 shadow-md">
        <div className="text-center space-y-2 max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            LITHYX Prognostics Workflow
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
            End-to-end data pipeline from partial charging curves to uncertainty-bounded digital twin state updates.
          </p>
        </div>

        {/* Pipeline Steps Flow */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-3 pt-4">
          {[
            { step: '01', title: 'Partial Charging Data', sub: 'CSV / Telemetry', icon: FileSpreadsheet, color: 'text-amber-500' },
            { step: '02', title: 'Health Indicators', sub: 'dQ/dV & dV/dQ', icon: Activity, color: 'text-teal-400' },
            { step: '03', title: 'LITHYX Core', sub: 'Physics + Residual', icon: Cpu, color: 'text-cyan-400' },
            { step: '04', title: 'Deep Temporal', sub: 'LSTM / TCN / Trans.', icon: Layers, color: 'text-indigo-400' },
            { step: '05', title: 'Cross-Chemistry', sub: 'MMD / CORAL Adapt.', icon: Network, color: 'text-purple-400' },
            { step: '06', title: 'Uncertainty', sub: 'Split Conformal', icon: Sparkles, color: 'text-emerald-400' },
            { step: '07', title: 'Digital Twin + UKF', sub: 'State Assimilation', icon: Box, color: 'text-blue-400' },
            { step: '08', title: 'SOH / RUL Insights', sub: 'SHAP & Reports', icon: Gauge, color: 'text-emerald-400' },
          ].map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div key={idx} className="relative flex flex-col items-center text-center p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 shadow-sm hover:border-teal-500/50 transition group">
                <span className="text-[10px] font-black text-slate-400 group-hover:text-teal-400 mb-1">{item.step}</span>
                <div className={`p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm mb-2 ${item.color}`}>
                  <IconComponent size={20} />
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">{item.title}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">{item.sub}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Core Research Modules Grid */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Core Research Modules</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Click any module to inspect methodology and live computations.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'Physics-Informed Learning',
              desc: 'Integrates Arrhenius thermal activation, square-root cycle kinetics, and C-rate stress into loss functions for physical consistency.',
              link: '/lithyx-prediction',
              icon: BrainCircuit,
              badge: 'Physics Loss',
            },
            {
              title: 'Cross-Chemistry Transfer',
              desc: 'Domain adaptation via MMD and CORAL across LFP, NMC, NCA, and LCO chemistries for zero-shot and few-shot adaptation.',
              link: '/cross-chemistry',
              icon: Network,
              badge: 'MMD / CORAL',
            },
            {
              title: 'Split Conformal Uncertainty',
              desc: 'Generates distribution-free, coverage-guaranteed prediction intervals (PICP, MPIW) for SOH and RUL.',
              link: '/uncertainty',
              icon: Sparkles,
              badge: '95% Bounds',
            },
            {
              title: 'Digital Twin & UKF Assimilation',
              desc: 'Maintains per-battery digital state using Unscented Kalman Filtering for real-time observation assimilation.',
              link: '/digital-twin',
              icon: Box,
              badge: 'UKF State',
            },
            {
              title: 'Partial Charging HI Extraction',
              desc: 'Extracts degradation-sensitive Incremental Capacity (dQ/dV), Differential Voltage (dV/dQ), and CC-CV transition metrics.',
              link: '/health-indicators',
              icon: Activity,
              badge: 'dQ/dV & dV/dQ',
            },
            {
              title: 'SHAP & Parameter Explainability',
              desc: 'Quantifies feature contributions and interprets physical degradation parameters (Ea, k_deg, stress coefficients).',
              link: '/explainability',
              icon: Sliders,
              badge: 'XAI Engine',
            },
          ].map((card, idx) => {
            const IconComp = card.icon;
            return (
              <Link
                key={idx}
                to={card.link}
                className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B131F] p-6 shadow-sm hover:border-teal-500/60 hover:shadow-md transition duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition">
                      <IconComp size={22} />
                    </div>
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                      {card.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
                <div className="pt-4 flex items-center text-xs font-bold text-teal-600 dark:text-teal-400 group-hover:translate-x-1 transition">
                  Explore Module <ArrowRight size={14} className="ml-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
