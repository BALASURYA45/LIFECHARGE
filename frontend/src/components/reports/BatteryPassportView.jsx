import React, { useState } from 'react';
import { ShieldCheck, Award, QrCode, Printer, CheckCircle2, FileText, X, Download } from 'lucide-react';
import { generatePdfBatteryPassport } from '../../utils/pdfPassportGenerator.js';

export default function BatteryPassportView({ isOpen, onClose, passportData = null }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const passport = passportData || {
    passportId: 'PASSPORT-00101-9921',
    verificationHash: '8F92A1B7E3C4092D817E451F',
    issuedAt: new Date().toLocaleDateString(),
    vehicle: {
      vin: '19XFA2F83ME00101',
      model: 'Tesla Model Y Long Range',
      year: 2023,
      odometryKm: '45,000 km',
    },
    battery: {
      serialNo: 'BP-8849-0101',
      chemistry: 'NMC (Nickel Manganese Cobalt)',
      capacityKwh: '75.0 kWh',
      usableKwh: '69.8 kWh',
    },
    health: {
      soh: 93.1,
      grade: 'A+',
      rulCycles: 880,
      rangeKm: 391,
      fastChargeRatio: '32%',
    },
    warranty: {
      status: 'FULLY COVERED',
      threshold: '70.0% SOH',
      remainingKm: '115,000 km remaining',
    },
    market: {
      score: 91,
      adjustment: '+$1,200 Resale Premium (Exceptional Battery Care)',
    },
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(passport.verificationHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPdf = () => {
    generatePdfBatteryPassport({
      passportId: passport.passportId,
      verificationHash: passport.verificationHash,
      vin: passport.vehicle.vin,
      model: passport.vehicle.model,
      chemistry: passport.battery.chemistry,
      soh: passport.health.soh,
      rul: passport.health.rulCycles,
      capacityKwh: passport.battery.capacityKwh,
      resaleAdjustment: passport.market.adjustment,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#0B131F] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-8 space-y-6 shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Certificate Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-slate-950 font-black shadow-lg">
              <Award size={28} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-teal-500/10 text-teal-400 text-xs font-extrabold mb-1 border border-teal-500/20">
                <ShieldCheck size={14} /> CERTIFIED BATTERY PASSPORT
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">EV Health Lineage Certificate</h2>
              <p className="text-xs text-slate-500 font-medium">Digital asset passport verifying SOH, warranty compliance, and resale score</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 font-bold">GRADE</span>
            <p className="text-4xl font-black text-teal-400 font-mono leading-none">{passport.health.grade}</p>
          </div>
        </div>

        {/* Passport Grid Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vehicle & Battery Info */}
          <div className="space-y-4 bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <FileText size={14} className="text-teal-400" /> Vehicle & Battery Specifications
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-500">Vehicle VIN:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{passport.vehicle.vin}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-500">Model:</span>
                <span className="font-bold text-slate-900 dark:text-white">{passport.vehicle.model}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-500">Chemistry:</span>
                <span className="font-bold text-purple-400">{passport.battery.chemistry}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Usable Capacity:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{passport.battery.usableKwh} / {passport.battery.capacityKwh}</span>
              </div>
            </div>
          </div>

          {/* Health Metrics & Warranty */}
          <div className="space-y-4 bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-400" /> State of Health & Warranty Audit
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-500">State of Health (SOH):</span>
                <span className="font-black text-teal-400 text-sm">{passport.health.soh}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-500">Estimated RUL:</span>
                <span className="font-mono font-bold text-cyan-400">{passport.health.rulCycles} Cycles</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-500">OEM Warranty Status:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1"><CheckCircle2 size={12}/> {passport.warranty.status}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Resale Impact:</span>
                <span className="font-bold text-indigo-400">{passport.market.adjustment}</span>
              </div>
            </div>
          </div>
        </div>

        {/* EU Sustainability & Carbon Footprint Card */}
        <div className="p-5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Award size={14} className="text-emerald-400" /> EU Battery Regulation (2023/1542) Carbon Footprint & Recycled Content
            </h4>
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              EU CERTIFIED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Carbon Footprint</span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">62.4 kg CO₂e / kWh</span>
              <span className="text-[9px] text-slate-400 block mt-0.5">Below EU 2026 Tier 1 Ceiling</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Recycled Raw Materials</span>
              <span className="text-xs font-extrabold text-slate-900 dark:text-white block mt-0.5">
                Co: <strong className="text-emerald-400">16%</strong> • Li: <strong className="text-cyan-400">12%</strong> • Ni: <strong className="text-purple-400">22%</strong>
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5">Complies with EU 2031 Targets</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Responsible Sourcing</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                <CheckCircle2 size={12} /> OECD Due Diligence
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5">Audited Cobalt/Lithium Chain</span>
            </div>
          </div>
        </div>

        {/* Digital Signature Hash & Verification QR */}
        <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 flex items-center justify-between gap-4 border border-slate-800">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SHA-256 DIGITAL VERIFICATION HASH</p>
            <p className="font-mono text-xs text-teal-400 font-bold">{passport.verificationHash}</p>
          </div>

          <button
            onClick={handleCopyHash}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold transition-all text-slate-300"
          >
            {copied ? 'Copied!' : 'Copy Hash'}
          </button>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={handleExportPdf}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs transition-all shadow-xl shadow-emerald-950/40 flex items-center gap-2 transform hover:-translate-y-0.5"
          >
            <Download size={16} /> Download Client-Ready PDF Passport
          </button>
        </div>
      </div>
    </div>
  );
}
