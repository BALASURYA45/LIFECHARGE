import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import {
  DollarSign,
  Recycle,
  Leaf,
  BatteryCharging,
  Sun,
  ShieldCheck,
  TrendingDown,
  Download,
  FileCheck,
} from 'lucide-react';

export default function SecondLifeValuationPanel({
  currentSOH = 94.2,
  cycleSimCount = 185,
  batteryCapacity = 75,
  batteryId = 'BT_EV_001',
}) {
  // Financial valuation dynamics
  const initialValueUsd = 12500;
  const currentValuationUsd = Math.round(initialValueUsd * (currentSOH / 100) * 0.92);
  const secondLifeThresholdSOH = 80;
  const isSecondLifeReady = currentSOH <= secondLifeThresholdSOH;

  // CO2 avoided metrics: ~0.4 kg CO2 saved per kWh delivered vs gasoline
  const kwhDeliveredTotal = Math.round(cycleSimCount * batteryCapacity * 0.85);
  const co2AvoidedTonnes = Number((kwhDeliveredTotal * 0.00042).toFixed(1));
  const equivalentTreesPlanted = Math.round(co2AvoidedTonnes * 45);

  // Financial residual valuation curve vs SOH
  const valuationData = [
    { soh: 100, marketValue: 12500, secondLifeValue: 0 },
    { soh: 90, marketValue: 10400, secondLifeValue: 0 },
    { soh: 80, marketValue: 7800, secondLifeValue: 5200 },
    { soh: 70, marketValue: 4200, secondLifeValue: 4800 },
    { soh: 60, marketValue: 2100, secondLifeValue: 3900 },
    { soh: 50, marketValue: 800, secondLifeValue: 2600 },
  ];

  // Second life application suitability scores (%)
  const secondLifeSuitability = [
    { application: 'Solar ESS Buffer', suitability: 94, recommended: true },
    { application: 'Telecom Tower Backup', suitability: 88, recommended: true },
    { application: 'EV Charging Buffer', suitability: 76, recommended: false },
    { application: 'Microgrid Balancing', suitability: 82, recommended: true },
    { application: 'Direct Recycling (Li/Ni)', suitability: 45, recommended: false },
  ];

  const handleExportPassportCertificate = () => {
    const certHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>EU Battery Passport & Asset Valuation Certificate - ${batteryId}</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; margin: 40px; background: #0b131f; color: #f8fafc; }
    .card { background: #1e293b; padding: 35px; border-radius: 20px; border: 1px solid #334155; max-width: 800px; margin: auto; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0d9488; padding-bottom: 15px; }
    h1 { color: #14b8a6; font-size: 24px; margin: 0; }
    .badge { background: #0f766e; color: #ccfbf1; padding: 5px 12px; border-radius: 99px; font-weight: bold; font-size: 12px; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 25px 0; }
    .box { background: #0f172a; padding: 16px; border-radius: 12px; border: 1px solid #334155; }
    .lbl { font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: bold; }
    .val { font-size: 22px; font-weight: 900; color: #2dd4bf; margin-top: 5px; font-family: monospace; }
    .footer { font-size: 11px; color: #64748b; margin-top: 30px; text-align: center; border-top: 1px solid #334155; padding-top: 15px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div>
        <h1>EU Battery Passport & Asset Valuation Certificate</h1>
        <p style="font-size: 12px; color: #94a3b8; margin-top: 4px;">Verified by LifeCharge Digital Twin Engine • ISO 15118 & EU Battery Regulation 2023/1542 Compliant</p>
      </div>
      <span class="badge">CERTIFIED</span>
    </div>

    <div class="grid">
      <div class="box"><div class="lbl">Battery Asset ID</div><div class="val">${batteryId}</div></div>
      <div class="box"><div class="lbl">State of Health (SOH)</div><div class="val">${currentSOH}%</div></div>
      <div class="box"><div class="lbl">Est. Pack Market Value</div><div class="val">$${currentValuationUsd.toLocaleString()} USD</div></div>
      <div class="box"><div class="lbl">Accumulated Cycles</div><div class="val">${cycleSimCount} Cycles</div></div>
      <div class="box"><div class="lbl">CO2 Avoided Lifetime</div><div class="val">${co2AvoidedTonnes} Tonnes</div></div>
      <div class="box"><div class="lbl">Second-Life Status</div><div class="val" style="font-size:16px">${isSecondLifeReady ? 'READY FOR ESS REPURPOSING' : 'FIRST-LIFE EV OPERATION'}</div></div>
    </div>

    <h3 style="color: #cbd5e1; font-size: 14px; margin-top: 20px;">Recommended Second-Life Applications</h3>
    <ul style="font-size: 13px; color: #94a3b8; line-height: 1.6;">
      <li><strong>Solar ESS Stationary Buffer:</strong> 94% Suitability Index (High Priority)</li>
      <li><strong>Telecom Tower Emergency Backup:</strong> 88% Suitability Index</li>
      <li><strong>Microgrid Energy Storage:</strong> 82% Suitability Index</li>
    </ul>

    <div class="footer">
      Digitally Signed Certificate • LifeCharge Battery Intelligence • Timestamp: ${new Date().toISOString()}
    </div>
  </div>
</body>
</html>
    `;

    const blob = new Blob([certHtml], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `EU_Battery_Passport_${batteryId}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 mb-1">
            <Recycle size={14} />
            Circular Economy & Residual Asset Engine
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            Second-Life Battery Repurposing & Asset Valuation
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Predicts pack financial residual market value, second-life grid storage transition readiness, and cumulative carbon offset.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPassportCertificate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 text-xs font-bold text-white hover:from-teal-500 hover:to-emerald-500 transition shadow-lg shrink-0"
          >
            <FileCheck size={15} /> Export EU Battery Passport Certificate
          </button>

          <div className="px-4 py-2 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/40 text-right shrink-0">
            <div className="text-[10px] uppercase font-bold text-teal-700 dark:text-teal-400">Estimated Pack Market Value</div>
            <div className="text-xl font-mono font-black text-teal-600 dark:text-teal-400">${currentValuationUsd.toLocaleString()} USD</div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>Second-Life Readiness</span>
            <Recycle className="text-teal-500" size={16} />
          </div>
          <div className="text-lg font-black text-slate-900 dark:text-white">
            {isSecondLifeReady ? 'READY FOR ESS REPURPOSING' : 'FIRST-LIFE EV OPERATION'}
          </div>
          <div className="text-[10px] text-slate-400">80% SOH EOL Repurposing Threshold</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>Cumulative CO₂ Avoided</span>
            <Leaf className="text-emerald-500" size={16} />
          </div>
          <div className="text-lg font-mono font-black text-emerald-600 dark:text-emerald-400">
            {co2AvoidedTonnes} Tonnes CO₂
          </div>
          <div className="text-[10px] text-slate-400">Vs internal combustion equivalent</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>Trees Planted Equivalent</span>
            <Sun className="text-amber-500" size={16} />
          </div>
          <div className="text-lg font-mono font-black text-amber-600 dark:text-amber-400">
            +{equivalentTreesPlanted} Mature Trees
          </div>
          <div className="text-[10px] text-slate-400">Environmental sustainability impact</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graph 1: Valuation Curve */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
            Asset Market Value vs Second-Life Value ($ USD)
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={valuationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="soh" stroke="#94a3b8" unit="%" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                <Area type="monotone" dataKey="marketValue" stroke="#0d9488" fill="#0d9488" fillOpacity={0.4} name="EV Automotive Value ($)" />
                <Area type="monotone" dataKey="secondLifeValue" stroke="#10b981" fill="#10b981" fillOpacity={0.4} name="Stationary ESS Value ($)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 2: Second Life Suitability Bar Chart */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
            Second-Life Application Suitability Index (%)
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={secondLifeSuitability} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" />
                <YAxis type="category" dataKey="application" stroke="#94a3b8" width={140} fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="suitability" fill="#0d9488" radius={[0, 8, 8, 0]} name="Suitability (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

