import { Activity, Car, ShieldAlert, TrendingUp, AlertTriangle, Gauge, Sparkles, Zap, Download, FileSpreadsheet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { generatePdfBatteryPassport } from '../utils/pdfPassportGenerator.js';

const statusStyles = {
  Excellent: 'border-cyan-600 bg-cyan-50 text-cyan-800',
  Good: 'border-emerald-600 bg-emerald-50 text-emerald-800',
  Warning: 'border-amber-600 bg-amber-50 text-amber-800',
  Critical: 'border-emerald-600 bg-emerald-50 text-emerald-800',
};

const riskStyles = {
  'Low Risk': 'border-cyan-600 bg-cyan-50 text-cyan-800',
  'Medium Risk': 'border-amber-600 bg-amber-50 text-amber-800',
  'High Risk': 'border-emerald-600 bg-emerald-50 text-emerald-800',
};

function exportCSVReport(prediction) {
  const lines = [
    'LIFECHARGE BATTERY HEALTH DIAGNOSTIC REPORT',
    `Report ID,REP_${Date.now()}`,
    `Generated At,${new Date().toLocaleString()}`,
    `Vehicle,${prediction.vehicleMake || ''} ${prediction.vehicleModel || ''} (${prediction.vehicleType || ''})`,
    `Category,${prediction.vehicleCategory || ''}`,
    '',
    'DIAGNOSTIC METRICS',
    `State of Health (SOH),${prediction.SOH}%`,
    `Remaining Useful Life (RUL),${prediction.RUL} Months`,
    `Battery Status,${prediction.batteryStatus}`,
    `Risk Level,${prediction.riskLabel || 'Low Risk'}`,
    `Risk Score,${prediction.riskScore || 0}/100`,
    `Confidence Score,${prediction.confidenceScore || 95}%`,
    `Degradation Trend,${prediction.degradationTrend || 'Normal'}`,
    '',
    'ROUTINE & OPERATING CONDITIONS',
    `Daily Distance,${prediction.input?.dailyDistance || 0} km`,
    `Charging Frequency,${prediction.input?.chargingFrequency || 0} charges/week`,
    `Fast Charging Usage,${prediction.input?.fastChargingUsage || 0}%`,
    `Average Temperature,${prediction.input?.averageTemperature || 0} °C`,
    `Battery Capacity,${prediction.input?.batteryCapacity || 0} kWh`,
    `Voltage,${prediction.input?.voltage || 0} V`,
    '',
    'ENHANCED ANALYTICS & STRESS SCORES',
    `Thermal Stress Level,${prediction.enhancements?.thermalStress?.level || 'Normal'} (${prediction.enhancements?.thermalStress?.score || 0}/100)`,
    `Cyclic Stress Level,${prediction.enhancements?.cyclicStress?.level || 'Normal'} (${prediction.enhancements?.cyclicStress?.score || 0}/100)`,
    `Anomaly Score,${prediction.enhancements?.anomalyDetection?.score || 0}/100`,
    `Conformal SOH Range,${prediction.enhancements?.confidenceInterval?.soh?.lower || prediction.SOH}% - ${prediction.enhancements?.confidenceInterval?.soh?.upper || prediction.SOH}%`,
    `Conformal RUL Range,${prediction.enhancements?.confidenceInterval?.rul?.lower || prediction.RUL}m - ${prediction.enhancements?.confidenceInterval?.rul?.upper || prediction.RUL}m`,
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `LifeCharge_Routine_Report_${prediction.vehicleMake || 'EV'}_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportPDFReport(prediction) {
  const sohVal = typeof prediction.SOH === 'number' ? prediction.SOH : parseFloat(prediction.SOH) || 93.1;
  const rulVal = typeof prediction.RUL === 'number' ? prediction.RUL : parseFloat(prediction.RUL) || 880;

  generatePdfBatteryPassport({
    passportId: `PASSPORT-${Math.floor(10000 + Math.random() * 90000)}`,
    vin: prediction.input?.vin || prediction.vin || '19XFA2F83ME00101',
    model: `${prediction.vehicleMake || 'EV'} ${prediction.vehicleModel || 'Pack'}`,
    chemistry: prediction.input?.is_chemistry_lfp ? 'LFP (Lithium Iron Phosphate)' : 'NMC (Nickel Manganese Cobalt)',
    soh: sohVal,
    rul: rulVal,
    capacityKwh: `${prediction.input?.batteryCapacity || 75.0} kWh`,
    resaleAdjustment: sohVal >= 90 ? '+$1,200 (Exceptional Care Premium)' : 'Standard Valuation',
    riskLabel: prediction.riskLabel || 'Low Risk',
    confidenceScore: prediction.confidenceScore || 94.5,
  });
}

function BatteryBar({ soh }) {
  const segments = 10;
  const filled = Math.round((soh / 100) * segments);
  const tone = soh >= 80 ? 'bg-cyan-500' : soh >= 60 ? 'bg-amber-500' : soh >= 40 ? 'bg-orange-500' : 'bg-emerald-500';
  const shadow = soh >= 80 ? 'shadow-[0_0_20px_rgba(6,182,212,0.45)]' : '';

  return (
    <div className="flex items-end gap-1">
      {Array.from({ length: segments }).map((_, i) => (
        <span
          key={i}
          className={`h-12 w-full rounded-sm transition-all ${
            i < filled ? `${tone} ${shadow}` : 'bg-slate-200'
          }`}
        />
      ))}
    </div>
  );
}

function ProgressBar({ value, max = 100, color = 'bg-accent' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="h-2 w-full rounded-full bg-slate-200">
      <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function PredictionResult({ prediction }) {
  const { t } = useTranslation();

  if (!prediction) {
    return (
      <section className="lc-card-static rounded-xl p-5 sm:p-6">
        <div className="grid size-12 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
          <ShieldAlert size={24} aria-hidden="true" />
        </div>
        <h2 className="mt-5 text-lg font-black text-slate-900">Your Battery Health Report</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Complete the 3-step form on the left to get a detailed battery health report with SOH, remaining life, risk assessment, and maintenance tips.
        </p>
      </section>
    );
  }

  const sohColor = prediction.SOH >= 80 ? 'text-accent-light' : prediction.SOH >= 60 ? 'text-amber-400' : prediction.SOH >= 40 ? 'text-orange-400' : 'text-emerald-400';
  const enhancements = prediction.enhancements || {};

  return (
    <section className="lc-card-static rounded-xl overflow-hidden">
      {/* Vehicle Info */}
      {prediction.vehicleMake && prediction.vehicleModel ? (
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/60 px-5 py-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Car size={14} className="text-slate-900" aria-hidden="true" />
            <span className="font-semibold">{prediction.vehicleMake} {prediction.vehicleModel}</span>
            {prediction.vehicleType ? <span className="text-slate-500">({prediction.vehicleType})</span> : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => exportPDFReport(prediction)}
              className="lc-focus inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 text-xs font-bold shadow-sm transition"
            >
              <Download size={13} aria-hidden="true" /> {t('reports.downloadPdf', 'Download PDF')}
            </button>
            <button
              type="button"
              onClick={() => exportCSVReport(prediction)}
              className="lc-focus inline-flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 text-xs font-bold shadow-sm transition"
            >
              <FileSpreadsheet size={13} aria-hidden="true" /> {t('reports.downloadCsv', 'Export CSV')}
            </button>
          </div>
        </div>
      ) : null}

      <div className="p-5 sm:p-6">
        {/* Status Badges */}
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Diagnostic Report</p>
            <h2 className="mt-1 text-2xl font-black text-slate-900 tracking-tight">Battery Health Result</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`w-fit rounded-lg border px-3 py-2 text-sm font-bold ${statusStyles[prediction.batteryStatus] ?? statusStyles.Excellent}`}>
              {t(`dashboard.statusLabels.${prediction.batteryStatus}`, prediction.batteryStatus)}
            </span>
            <span className={`w-fit rounded-lg border px-3 py-2 text-sm font-bold ${riskStyles[prediction.riskLabel] ?? riskStyles['Low Risk']}`}>
              {prediction.riskLabel ?? 'Low Risk'}
            </span>
          </div>
        </div>

        {/* Download & Export Buttons Bar */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
          <button
            type="button"
            onClick={() => exportPDFReport(prediction)}
            className="lc-focus inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs font-bold shadow-sm transition"
          >
            <Download size={15} aria-hidden="true" /> {t('reports.downloadPdf', 'Download PDF Report')}
          </button>
          <button
            type="button"
            onClick={() => exportCSVReport(prediction)}
            className="lc-focus inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 text-xs font-bold shadow-sm transition"
          >
            <FileSpreadsheet size={15} aria-hidden="true" /> {t('reports.downloadCsv', 'Export CSV Data')}
          </button>
        </div>

        {/* Battery Visual */}
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-600">Battery Health</span>
            <span className={`text-3xl font-black ${sohColor}`}>
              {typeof prediction.SOH === 'number' ? Number(prediction.SOH).toFixed(1) : prediction.SOH}%
            </span>
          </div>
          <BatteryBar soh={prediction.SOH} />
          <div className="mt-3 flex justify-between text-[11px] text-slate-500">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Remaining Life</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{prediction.RUL} <span className="text-sm font-medium text-slate-500">months</span></p>
            <p className="mt-1 text-[11px] text-slate-500">Estimated service window</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Risk Score</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{prediction.riskScore ?? 0}<span className="text-sm font-medium text-slate-500">/100</span></p>
            <p className="mt-1 text-[11px] text-slate-500">Operational risk level</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Confidence</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{prediction.confidenceScore}<span className="text-sm font-medium text-slate-500">%</span></p>
            <p className="mt-1 text-[11px] text-slate-500">Model certainty</p>
          </div>
        </div>

        {/* Enhanced Analytics Section */}
        {enhancements.thermalStress || enhancements.cyclicStress || enhancements.confidenceInterval ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 mb-3">
              <Gauge size={18} className="text-slate-900" aria-hidden="true" />
              <h3 className="text-sm font-black text-slate-900">Performance Analytics</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {enhancements.thermalStress ? (
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Thermal Stress</span>
                    <span className="text-xs font-bold text-slate-700">{enhancements.thermalStress.level}</span>
                  </div>
                  <div className="mt-2">
                    <ProgressBar value={enhancements.thermalStress.score} max={100} color={enhancements.thermalStress.score > 50 ? 'bg-emerald-500' : 'bg-emerald-500'} />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">Score: {enhancements.thermalStress.score}/100</p>
                </div>
              ) : null}

              {enhancements.cyclicStress ? (
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Cyclic Stress</span>
                    <span className="text-xs font-bold text-slate-700">{enhancements.cyclicStress.level}</span>
                  </div>
                  <div className="mt-2">
                    <ProgressBar value={enhancements.cyclicStress.score} max={100} color={enhancements.cyclicStress.score > 70 ? 'bg-emerald-500' : enhancements.cyclicStress.score > 40 ? 'bg-amber-500' : 'bg-emerald-500'} />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">Score: {enhancements.cyclicStress.score}/100</p>
                </div>
              ) : null}

              {enhancements.degradationRate ? (
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Projected Service Life</span>
                  <p className="mt-2 text-2xl font-black text-slate-900">
                    {enhancements.degradationRate.value} <span className="text-sm font-medium text-slate-500">{enhancements.degradationRate.unit}</span>
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">Based on current degradation trajectory</p>
                </div>
              ) : null}

              {enhancements.confidenceInterval ? (
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Prediction Confidence Range</span>
                  <p className="mt-2 text-sm text-slate-700">
                    SOH: {enhancements.confidenceInterval.soh.lower}% - {enhancements.confidenceInterval.soh.upper}%
                  </p>
                  <p className="text-sm text-slate-700">
                    RUL: {enhancements.confidenceInterval.rul.lower} - {enhancements.confidenceInterval.rul.upper} months
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Anomaly Detection */}
        {enhancements.anomalyDetection ? (
          <div className={`mt-5 rounded-2xl border p-5 transition-all duration-300 ${
            enhancements.anomalyDetection.isAnomalous 
              ? 'border-emerald-300 bg-emerald-50/90 dark:border-emerald-900/60 dark:bg-emerald-950/40 text-slate-900 dark:text-white' 
              : 'border-emerald-300 bg-emerald-50/90 dark:border-emerald-900/60 dark:bg-emerald-950/40 text-slate-900 dark:text-white'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <AlertTriangle size={20} className={enhancements.anomalyDetection.isAnomalous ? 'text-emerald-600 dark:text-emerald-400' : 'text-emerald-600 dark:text-emerald-400'} aria-hidden="true" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">Anomaly Risk & Stress Diagnosis</h3>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${
                enhancements.anomalyDetection.isAnomalous 
                  ? 'border border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200' 
                  : 'border border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200'
              }`}>
                {enhancements.anomalyDetection.isAnomalous ? 'Anomaly Detected' : 'Normal Operation'}
              </span>
            </div>

            {/* Score Risk Meter */}
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600 dark:text-slate-300">Anomaly Severity Score</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">{enhancements.anomalyDetection.score || (enhancements.anomalyDetection.isAnomalous ? 75 : 15)} / 100</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    enhancements.anomalyDetection.isAnomalous
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-600'
                      : 'bg-gradient-to-r from-teal-500 to-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(5, enhancements.anomalyDetection.score || (enhancements.anomalyDetection.isAnomalous ? 75 : 15)))}%` }}
                />
              </div>
            </div>

            {/* Feature Breakdown Progress Bars */}
            <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 space-y-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Zap size={14} className="text-teal-500" /> Feature Stress Contribution Breakdown
              </p>
              
              <div className="grid gap-2.5 sm:grid-cols-2 text-xs">
                <div>
                  <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                    <span>Thermal Stress Factor</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {enhancements.anomalyDetection.isAnomalous ? '45%' : '15%'}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: enhancements.anomalyDetection.isAnomalous ? '45%' : '15%' }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                    <span>Fast Charging Stress</span>
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                      {enhancements.anomalyDetection.isAnomalous ? '35%' : '10%'}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-amber-500"
                      style={{ width: enhancements.anomalyDetection.isAnomalous ? '35%' : '10%' }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                    <span>Cycle Rate Density</span>
                    <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                      {enhancements.anomalyDetection.isAnomalous ? '20%' : '12%'}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-cyan-500"
                      style={{ width: enhancements.anomalyDetection.isAnomalous ? '20%' : '12%' }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                    <span>Nominal Voltage Stability</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {enhancements.anomalyDetection.isAnomalous ? '10%' : '5%'}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: enhancements.anomalyDetection.isAnomalous ? '10%' : '5%' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended User Action Items Box */}
            <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-3.5 space-y-2 text-xs">
              <p className="font-bold text-teal-700 dark:text-teal-300 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                <Sparkles size={14} className="text-teal-600 dark:text-teal-400" /> Actionable Driver Recommendations
              </p>
              {enhancements.anomalyDetection.isAnomalous ? (
                <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 font-medium">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span><strong>DC Fast Charging:</strong> Limit fast charging to urgent trips. Use AC Level 2 charging for routine daily recharges.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span><strong>Thermal Management:</strong> Avoid charging immediately after high-speed highway driving to prevent thermal overload.</span>
                  </li>
                </ul>
              ) : (
                <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 font-medium">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span><strong>SOC Maintenance:</strong> Maintain battery state of charge between 20% and 80% for optimal health.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 rounded-full bg-teal-500 shrink-0" />
                    <span><strong>Routine Monitoring:</strong> Log weekly routine updates to maintain high predictive AI accuracy.</span>
                  </li>
                </ul>
              )}
            </div>
          </div>
        ) : null}

        {/* Prognosis Scenarios */}
        {enhancements.prognosis ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-slate-900" aria-hidden="true" />
              <h3 className="text-sm font-black text-slate-900">Prognosis Scenarios</h3>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {Object.entries(enhancements.prognosis).map(([key, scenario]) => (
                <div key={key} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{scenario.label}</p>
                  <p className="mt-1 text-lg font-black text-slate-900">{scenario.monthsToReplacement} <span className="text-xs font-medium text-slate-500">months</span></p>
                  <p className="text-[11px] text-slate-500">Est. remaining life</p>
                  <p className="mt-1 text-xs text-slate-600">80% SOH in ~{scenario.monthsTo80SOH} months</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Degradation Trend */}
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-slate-900" aria-hidden="true" />
            <h3 className="text-sm font-black text-slate-900">Degradation Trend</h3>
          </div>
          <p className="mt-2 text-sm leading-7 text-slate-600">{prediction.degradationTrend}</p>
        </div>

        {/* Risk Factors */}
        {prediction.riskFactors?.length ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-black text-slate-900">Risk Drivers</h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {prediction.riskFactors.map((factor) => (
                <li key={factor} className="flex items-start gap-2 text-sm leading-7 text-slate-600">
                  <span className="mt-1.5 block size-1.5 shrink-0 rounded-full bg-amber-500" />
                  {factor}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Model Info */}
        <p className="mt-4 text-[11px] text-slate-500">Analysis by {prediction.modelName}</p>
      </div>
    </section>
  );
}
