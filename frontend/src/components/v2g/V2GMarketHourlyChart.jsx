import React, { useState } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  Zap,
  DollarSign,
  Clock,
  CheckCircle2,
  Sliders,
  Globe,
} from 'lucide-react';

export default function V2GMarketHourlyChart({
  peakTariff = 0.38,
  offPeakTariff = 0.12,
  dailyDischargeKwh = 25,
}) {
  const [marketPreset, setMarketPreset] = useState('caiso'); // 'caiso' | 'epex' | 'ercot' | 'custom'

  // Generate 24-hour profile based on market preset
  const generateHourlyData = () => {
    const data = [];
    for (let hour = 0; hour < 24; hour++) {
      const hourStr = `${hour.toString().padStart(2, '0')}:00`;
      let tariff = offPeakTariff;
      let powerKw = 0; // +kW for Charging, -kW for V2G Discharge
      let mode = 'Standby';

      if (marketPreset === 'caiso') {
        // CAISO Duck Curve: Super Off-peak 10-14 (Solar excess), Super Peak 17-21
        if (hour >= 17 && hour <= 21) {
          tariff = peakTariff;
          powerKw = -6.2; // Discharge V2G
          mode = 'V2G Discharge';
        } else if (hour >= 1 && hour <= 5) {
          tariff = offPeakTariff;
          powerKw = 7.4; // Smart Charge
          mode = 'Smart Charging';
        }
      } else if (marketPreset === 'epex') {
        // European EPEX Spot: Morning Peak 07-09, Evening Peak 18-21
        if ((hour >= 7 && hour <= 9) || (hour >= 18 && hour <= 21)) {
          tariff = peakTariff;
          powerKw = -5.8;
          mode = 'V2G Discharge';
        } else if (hour >= 1 && hour <= 5) {
          tariff = offPeakTariff;
          powerKw = 7.4;
          mode = 'Smart Charging';
        }
      } else {
        // ERCOT / Custom
        if (hour >= 16 && hour <= 20) {
          tariff = peakTariff;
          powerKw = -7.0;
          mode = 'V2G Discharge';
        } else if (hour >= 0 && hour <= 4) {
          tariff = offPeakTariff;
          powerKw = 7.4;
          mode = 'Smart Charging';
        }
      }

      data.push({
        hour: hourStr,
        tariff: Number(tariff.toFixed(2)),
        powerKw: Number(powerKw.toFixed(1)),
        mode,
      });
    }
    return data;
  };

  const hourlyData = generateHourlyData();

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-1">
            <Clock size={14} />
            24-Hour Spot Energy Market & Smart Dispatch Schedule
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            24-Hour Electricity Tariff & Bi-Directional Power Schedule
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Hour-by-hour wholesale tariff pricing ($/kWh) aligned with automated EV smart charging and V2G grid peak discharge.
          </p>
        </div>

        {/* Market Preset Selector */}
        <div className="flex items-center gap-2 shrink-0">
          <Globe className="text-slate-400" size={16} />
          <select
            value={marketPreset}
            onChange={(e) => setMarketPreset(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none focus:border-emerald-500"
          >
            <option value="caiso">CAISO California TOU Duck Curve</option>
            <option value="epex">EPEX SPOT European Day-Ahead</option>
            <option value="ercot">ERCOT Texas Dynamic Peak Pricing</option>
          </select>
        </div>
      </div>

      {/* 24-Hour Dual-Axis Composed Chart */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} />
            <YAxis yAxisId="left" stroke="#10b981" unit="$/kWh" domain={[0, 0.90]} label={{ value: 'Tariff Rate ($/kWh)', angle: -90, position: 'insideLeft', fill: '#10b981', fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" unit="kW" domain={[-10, 10]} label={{ value: 'Power (kW)', angle: 90, position: 'insideRight', fill: '#f59e0b', fontSize: 11 }} />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
            <Legend />
            <Line yAxisId="left" type="stepAfter" dataKey="tariff" stroke="#10b981" strokeWidth={3} name="Grid Tariff Rate ($/kWh)" />
            <Bar yAxisId="right" dataKey="powerKw" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Power Transfer (+kW Charge / -kW V2G)" />
            <ReferenceLine yAxisId="right" y={0} stroke="#64748b" strokeDasharray="3 3" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Schedule Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
          <span>Smart Recharge Window:</span>
          <span className="font-mono font-bold">01:00 - 05:00 (${offPeakTariff}/kWh)</span>
        </div>
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-between">
          <span>V2G Peak Discharge Window:</span>
          <span className="font-mono font-bold">17:00 - 21:00 (${peakTariff}/kWh)</span>
        </div>
        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-between">
          <span>Daily Net Tariff Spread:</span>
          <span className="font-mono font-bold">+${(peakTariff - offPeakTariff).toFixed(2)} / kWh</span>
        </div>
      </div>
    </div>
  );
}
