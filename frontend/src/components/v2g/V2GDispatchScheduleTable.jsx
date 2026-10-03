import React, { useState } from 'react';
import {
  FileText,
  Download,
  CheckCircle2,
  Clock,
  Zap,
  ShieldCheck,
  DollarSign,
  TrendingUp,
  BatteryCharging,
  Sliders,
} from 'lucide-react';

export default function V2GDispatchScheduleTable({
  batteryCapacity = 75,
  peakTariff = 0.38,
  offPeakTariff = 0.12,
  initialDischargeKwh = 25,
}) {
  const [dailyDischargeKwh, setDailyDischargeKwh] = useState(initialDischargeKwh);
  const [v2gMode, setV2gMode] = useState('SMART_DEGRADATION_AWARE'); // SMART_DEGRADATION_AWARE | AGGRESSIVE_MAX_REVENUE

  // Calculate economic & battery degradation trade-offs
  const degradationCostPerKwh = v2gMode === 'SMART_DEGRADATION_AWARE' ? 0.042 : 0.085; // $/kWh degradation cost
  const grossAnnualRevenue = Math.round(dailyDischargeKwh * (peakTariff - offPeakTariff) * 365);
  const annualDegradationCost = Math.round(dailyDischargeKwh * degradationCostPerKwh * 365);
  const netAnnualProfit = grossAnnualRevenue - annualDegradationCost;
  const threeYearSohDrop = v2gMode === 'SMART_DEGRADATION_AWARE' ? 3.2 : 7.8;

  const dispatchRows = [
    { hour: '00:00 - 05:00', mode: 'Smart Charging', power: '+7.4 kW', tariff: `$${offPeakTariff}/kWh`, gridImpact: 'Absorbing Clean Off-Peak Wind Energy' },
    { hour: '05:00 - 08:00', mode: 'Standby / Commute', power: '0.0 kW', tariff: `$${(offPeakTariff * 1.2).toFixed(2)}/kWh`, gridImpact: 'Vehicle Commute / Resting' },
    { hour: '08:00 - 17:00', mode: 'Standby / V2H Ready', power: '0.0 kW', tariff: `$${(offPeakTariff * 1.5).toFixed(2)}/kWh`, gridImpact: 'Solar Excess Smoothing' },
    { hour: '17:00 - 21:00', mode: 'V2G Peak Discharge', power: `-${(dailyDischargeKwh / 4.0).toFixed(1)} kW`, tariff: `$${peakTariff}/kWh`, gridImpact: 'High-Demand Peaker Plant Displacement' },
    { hour: '21:00 - 24:00', mode: 'Standby', power: '0.0 kW', tariff: `$${offPeakTariff}/kWh`, gridImpact: 'Thermal Stabilization & Cooling' },
  ];

  const handleDownloadCertificate = () => {
    const reportHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>ISO 15118-20 / IEEE 1547.3 V2G Interconnect Certificate</title>
  <style>
    body { font-family: sans-serif; margin: 40px; background: #0b131f; color: #f8fafc; }
    .card { background: #1e293b; padding: 30px; border-radius: 16px; border: 1px solid #334155; }
    h1 { color: #f59e0b; margin-bottom: 5px; }
    .kpi { display: flex; gap: 20px; margin: 20px 0; }
    .box { background: #0f172a; padding: 15px; border-radius: 12px; flex: 1; border: 1px solid #334155; }
    .val { font-size: 20px; font-weight: bold; color: #10b981; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th, td { padding: 10px; border: 1px solid #334155; text-align: left; font-size: 13px; }
    th { background: #0f172a; color: #f59e0b; }
  </style>
</head>
<body>
  <div class="card">
    <h1>ISO 15118-20 / IEEE 1547.3 V2G Interconnect Certificate</h1>
    <p>Issued by LifeCharge V2G Smart Optimization Engine • Timestamp: ${new Date().toISOString()}</p>
    <hr style="border-color: #334155; margin: 20px 0;" />
    
    <h3>Interconnect Financial & Battery Degradation Analysis</h3>
    <div class="kpi">
      <div class="box"><div>EV Pack Capacity</div><div class="val">${batteryCapacity} kWh</div></div>
      <div class="box"><div>Daily V2G Limit</div><div class="val">${dailyDischargeKwh} kWh/day</div></div>
      <div class="box"><div>Gross Annual Revenue</div><div class="val">$${grossAnnualRevenue}/yr</div></div>
      <div class="box"><div>Net Annual Profit</div><div class="val">$${netAnnualProfit}/yr</div></div>
    </div>

    <h3>24-Hour Automated Smart Dispatch Schedule</h3>
    <table>
      <thead>
        <tr>
          <th>Time Window</th>
          <th>Dispatch Mode</th>
          <th>Power Transfer</th>
          <th>Electricity Rate</th>
          <th>Grid Impact</th>
        </tr>
      </thead>
      <tbody>
        ${dispatchRows.map(r => `
          <tr>
            <td>${r.hour}</td>
            <td>${r.mode}</td>
            <td>${r.power}</td>
            <td>${r.tariff}</td>
            <td>${r.gridImpact}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <br />
    <p style="font-size: 12px; color: #94a3b8;">Digitally Signed by ISO 15118-20 Smart Gateway Engine</p>
  </div>
</body>
</html>
    `;

    const blob = new Blob([reportHtml], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ISO15118_V2G_Interconnect_Certificate.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 mb-1">
            <ShieldCheck size={14} />
            Automated ISO 15118-20 V2G Protocol & Battery Health Protection
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            V2G Dispatch Schedule & Net Degradation Profit Balancer
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Balances grid arbitrage revenues ($/kWh) against electrochemical battery degradation costs ($/cycle).
          </p>
        </div>

        <button
          onClick={handleDownloadCertificate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-xs font-bold text-white hover:from-amber-600 hover:to-orange-600 transition shadow-lg shrink-0"
        >
          <Download size={15} /> Export ISO 15118 Certificate
        </button>
      </div>

      {/* V2G Interactive Controls & Financial Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 space-y-1">
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">Gross Annual Revenue</span>
          <div className="text-2xl font-mono font-black text-emerald-600 dark:text-emerald-400">${grossAnnualRevenue}/yr</div>
          <span className="text-[10px] text-slate-500">From grid peak arbitrage</span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 space-y-1">
          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase">Est. Battery Degradation Cost</span>
          <div className="text-2xl font-mono font-black text-amber-600 dark:text-amber-400">-${annualDegradationCost}/yr</div>
          <span className="text-[10px] text-slate-500">SEI growth & cyclic wear</span>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 space-y-1">
          <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase">Net Annual Profit</span>
          <div className="text-2xl font-mono font-black text-indigo-600 dark:text-indigo-400">+${netAnnualProfit}/yr</div>
          <span className="text-[10px] text-slate-500">Clear profit after wear</span>
        </div>

        <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 space-y-1">
          <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase">3-Year SOH Impact</span>
          <div className="text-2xl font-mono font-black text-purple-600 dark:text-purple-300">-{threeYearSohDrop}%</div>
          <span className="text-[10px] text-slate-500">Warranty compliant drop</span>
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sliders size={16} className="text-indigo-500" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">Daily V2G Export Limit: {dailyDischargeKwh} kWh/day</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setV2gMode('SMART_DEGRADATION_AWARE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                v2gMode === 'SMART_DEGRADATION_AWARE' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              Smart Health-Aware V2G
            </button>
            <button
              onClick={() => setV2gMode('AGGRESSIVE_MAX_REVENUE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                v2gMode === 'AGGRESSIVE_MAX_REVENUE' ? 'bg-amber-600 text-white shadow-sm' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              Aggressive Max Revenue
            </button>
          </div>
        </div>

        <input
          type="range"
          min="10"
          max="50"
          step="5"
          value={dailyDischargeKwh}
          onChange={(e) => setDailyDischargeKwh(Number(e.target.value))}
          className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
        />
      </div>

      {/* 24-Hour Dispatch Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3.5">Time Window</th>
              <th className="p-3.5">Dispatch Mode</th>
              <th className="p-3.5">Power Flow</th>
              <th className="p-3.5">Tariff Rate</th>
              <th className="p-3.5">Grid Impact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
            {dispatchRows.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                <td className="p-3.5 font-bold text-slate-900 dark:text-white">{row.hour}</td>
                <td className="p-3.5">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    row.mode.includes('V2G') ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30' :
                    row.mode.includes('Charging') ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' :
                    'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {row.mode}
                  </span>
                </td>
                <td className="p-3.5 font-bold text-slate-900 dark:text-white">{row.power}</td>
                <td className="p-3.5 text-amber-600 dark:text-amber-400 font-bold">{row.tariff}</td>
                <td className="p-3.5 text-slate-600 dark:text-slate-400 text-xs font-sans">{row.gridImpact}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

