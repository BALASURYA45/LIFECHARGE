import React from 'react';
import { DollarSign, Navigation, ShieldCheck, Zap, TrendingUp, Award } from 'lucide-react';

export default function ConsumerInsightCard({ financialData, onOpenSmartCharging, onOpenPassport }) {
  if (!financialData) return null;

  const {
    currentPackValuationUsd = 11172,
    accumulatedDepreciationUsd = 828,
    depreciationPerKmUsd = 0.0184,
    annualDepreciationForecastUsd = 360,
    potentialSmartChargingSavingsUsd = 126,
    resalePremiumPenaltyUsd = 550,
    netFuelSavingsToDateUsd = 3150,
    metrics = { soh: 93.1, odometryKm: 45000 },
  } = financialData;

  const originalRangeKm = 420;
  const currentRangeKm = Math.round(originalRangeKm * (metrics.soh / 100));
  const rangeLossKm = originalRangeKm - currentRangeKm;

  return (
    <div className="space-y-6">
      {/* 4 Financial & Range KPI Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pack Financial Valuation */}
        <div className="rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-500/5 to-emerald-500/5 p-4 sm:p-5 space-y-2 dark:bg-[#0B131F] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">BATTERY ASSET VALUE</span>
            <span className="px-2 py-0.5 rounded-full badge-yellow text-[10px]">GRADE A+</span>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
              ${currentPackValuationUsd.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Accumulated wear: <span className="text-amber-400 font-bold">${accumulatedDepreciationUsd}</span> (${depreciationPerKmUsd}/km)
            </p>
          </div>
        </div>

        {/* Card 2: Residual Driving Range */}
        <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 p-4 sm:p-5 space-y-2 dark:bg-[#0B131F] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">FULL CHARGE RANGE</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500">
              <Navigation size={16} />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
              {currentRangeKm} <span className="text-base font-normal text-slate-400">km</span>
            </p>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Original: 420 km (<span className="text-emerald-400 font-bold">-{rangeLossKm} km loss</span>)
            </p>
          </div>
        </div>

        {/* Card 3: Smart Charging Savings */}
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 p-4 sm:p-5 space-y-2 dark:bg-[#0B131F] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-500 dark:text-amber-400">ANNUAL SAVINGS</span>
            <span className="px-2 py-0.5 rounded-full badge-yellow text-[10px] animate-pulse">SAVINGS BOOST</span>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
              +${potentialSmartChargingSavingsUsd} <span className="text-xs font-normal text-slate-400">/year</span>
            </p>
            <p className="text-xs text-slate-500 font-medium mt-1">
              By avoiding high-temp fast charges during heatwaves
            </p>
          </div>
        </div>

        {/* Card 4: Resale Value Impact */}
        <div className="rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-indigo-500/5 p-4 sm:p-5 space-y-2 dark:bg-[#0B131F] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">RESALE MARKET PREMIUM</span>
            <div className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400">
              <Award size={16} />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-yellow-400 font-mono">
              +${resalePremiumPenaltyUsd}
            </p>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Vs fleet average EV of identical age & mileage
            </p>
          </div>
        </div>
      </div>

      {/* Action Banner with Responsive Buttons */}
      <div className="rounded-2xl border border-yellow-500/40 bg-slate-900 text-white p-5 sm:p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-lg glow-border-yellow">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full badge-yellow text-xs font-black">
            <Zap size={14} className="fill-current text-slate-950" /> HIGH-CONTRAST AI ADVISOR
          </div>
          <h4 className="text-base sm:text-lg font-bold">Optimize Your Daily Charge & Claim Certified Battery Passport</h4>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Pre-cooling your battery during summer fast charging extends remaining useful life by 1.8 years.
            Generate your official Battery Passport to prove your high SOH to buyers.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
          <button
            onClick={onOpenSmartCharging}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl badge-yellow hover:bg-yellow-400 text-slate-950 font-black text-xs transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Zap size={14} className="fill-current text-slate-950" /> Smart Charging Advisor
          </button>
          <button
            onClick={onOpenPassport}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck size={14} /> View Battery Passport
          </button>
        </div>
      </div>
    </div>
  );
}
