import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Gauge } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import PersonaSelector from '../components/common/PersonaSelector.jsx';
import ConsumerInsightCard from '../components/dashboard/ConsumerInsightCard.jsx';
import FleetOverviewView from '../components/dashboard/FleetOverviewView.jsx';
import SmartChargingAdvisorModal from '../components/dashboard/SmartChargingAdvisorModal.jsx';
import BatteryPassportView from '../components/reports/BatteryPassportView.jsx';
import CustomizableDashboard from '../components/dashboard/CustomizableDashboard.jsx';

export default function DashboardPage() {
  const { t } = useTranslation();
  const [activePersona, setActivePersona] = useState('DRIVER'); // DRIVER | FLEET | TECHNICIAN
  const [selectedBattery, setSelectedBattery] = useState('CELL_LFP_001');

  // Modals state
  const [isSmartChargingOpen, setIsSmartChargingOpen] = useState(false);
  const [isPassportOpen, setIsPassportOpen] = useState(false);

  // Dynamic API Data State
  const [financialData, setFinancialData] = useState({
    currentPackValuationUsd: 11172,
    accumulatedDepreciationUsd: 828,
    depreciationPerKmUsd: 0.0184,
    annualDepreciationForecastUsd: 360,
    potentialSmartChargingSavingsUsd: 126,
    resalePremiumPenaltyUsd: 550,
    netFuelSavingsToDateUsd: 3150,
    metrics: { soh: 93.1, odometryKm: 45000 },
  });

  const [fleetData, setFleetData] = useState({
    summary: {
      totalVehicles: 5,
      avgSoh: 93.7,
      avgRul: 864,
      highRiskCount: 1,
      availableForLongHaul: 3,
      fleetStatus: 'ATTENTION_REQUIRED',
    },
    vehicles: [
      {
        vin: '19XFA2F83ME00101',
        name: 'Tesla Model Y (Delivery #1)',
        chemistry: 'NMC',
        soh: 96.2,
        rulCycles: 1050,
        odometryKm: 32000,
        currentSoc: 84,
        packTempC: 28.5,
        deltaV: 0.018,
        riskLevel: 'LOW',
        recommendedDuty: 'Long-Haul Highway Route (350+ km)',
        status: 'AVAILABLE',
      },
      {
        vin: '5YJ3E1EA7KF00204',
        name: 'Nissan Leaf (City Metro #2)',
        chemistry: 'LFP',
        soh: 88.5,
        rulCycles: 680,
        odometryKm: 78000,
        currentSoc: 65,
        packTempC: 34.2,
        deltaV: 0.042,
        riskLevel: 'MODERATE',
        recommendedDuty: 'Urban Short Express Route (<150 km)',
        status: 'IN_SERVICE',
      },
      {
        vin: 'WAUZZZF84LA00309',
        name: 'Hyundai Ioniq 5 (Express #3)',
        chemistry: 'NMC',
        soh: 94.0,
        rulCycles: 920,
        odometryKm: 41000,
        currentSoc: 92,
        packTempC: 30.1,
        deltaV: 0.024,
        riskLevel: 'LOW',
        recommendedDuty: 'Regional Fleet Duty (250 km)',
        status: 'CHARGING',
      },
      {
        vin: 'KMHD84LF7MU00412',
        name: 'BYD Atto 3 (Van #4)',
        chemistry: 'LFP',
        soh: 81.8,
        rulCycles: 490,
        odometryKm: 112000,
        currentSoc: 42,
        packTempC: 41.5,
        deltaV: 0.076,
        riskLevel: 'HIGH',
        recommendedDuty: 'Depot Standby / Maintenance Inspection',
        status: 'MAINTENANCE_REQUIRED',
      },
      {
        vin: 'WBY8P2C51KA00515',
        name: 'BMW i4 (Executive Shuttle #5)',
        chemistry: 'NMC',
        soh: 98.1,
        rulCycles: 1180,
        odometryKm: 18000,
        currentSoc: 95,
        packTempC: 26.0,
        deltaV: 0.012,
        riskLevel: 'LOW',
        recommendedDuty: 'VIP Long-Range Transport (400+ km)',
        status: 'AVAILABLE',
      },
    ],
  });

  useEffect(() => {
    // Fetch financial insights from backend API if available
    fetch('/api/insights/financial?soh=93.1&odometry=45000')
      ? fetch('/api/insights/financial?soh=93.1&odometry=45000')
          .then((res) => res.json())
          .then((res) => {
            if (res.success && res.data) setFinancialData(res.data);
          })
          .catch(() => {})
      : null;

    // Fetch fleet insights from backend API if available
    fetch('/api/insights/fleet')
      ? fetch('/api/insights/fleet')
          .then((res) => res.json())
          .then((res) => {
            if (res.success && res.data) setFleetData(res.data);
          })
          .catch(() => {})
      : null;
  }, []);

  // Sample data for charts
  const sohData = [
    { cycle: 0, soh: 100.0, lower: 98.8, upper: 100.0 },
    { cycle: 50, soh: 98.2, lower: 97.0, upper: 99.4 },
    { cycle: 100, soh: 96.5, lower: 95.1, upper: 97.9 },
    { cycle: 150, soh: 94.8, lower: 93.2, upper: 96.4 },
    { cycle: 200, soh: 93.1, lower: 91.3, upper: 94.9 },
    { cycle: 250, soh: 91.5, lower: 89.6, upper: 93.4 },
    { cycle: 300, soh: 89.8, lower: 87.8, upper: 91.8 },
  ];

  const rulData = [
    { cycle: 0, rul: 1200 },
    { cycle: 50, rul: 1120 },
    { cycle: 100, rul: 1040 },
    { cycle: 150, rul: 960 },
    { cycle: 200, rul: 880 },
    { cycle: 250, rul: 800 },
    { cycle: 300, rul: 720 },
  ];

  const hiTrendData = [
    { cycle: 0, dQdV_Peak: 2.45, dVdQ_Inflect: 0.42 },
    { cycle: 100, dQdV_Peak: 2.21, dVdQ_Inflect: 0.48 },
    { cycle: 200, dQdV_Peak: 1.98, dVdQ_Inflect: 0.54 },
    { cycle: 300, dQdV_Peak: 1.75, dVdQ_Inflect: 0.62 },
  ];

  const physicsVsAiData = [
    { cycle: 0, PurePhysics: 100, LithyxHybrid: 100 },
    { cycle: 100, PurePhysics: 97.0, LithyxHybrid: 96.5 },
    { cycle: 200, PurePhysics: 94.3, LithyxHybrid: 93.1 },
    { cycle: 300, PurePhysics: 91.8, LithyxHybrid: 89.8 },
  ];

  const crossChemData = [
    { chemistry: 'LFP (Iron Phos.)', SOH_RMSE: 0.92, RUL_MAE: 6.8 },
    { chemistry: 'NMC (Nickel Mang.)', SOH_RMSE: 1.15, RUL_MAE: 8.4 },
    { chemistry: 'NCA (Nickel Cobalt)', SOH_RMSE: 1.28, RUL_MAE: 9.6 },
    { chemistry: 'LCO (Cobalt Oxide)', SOH_RMSE: 1.45, RUL_MAE: 11.2 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1 text-xs font-bold text-teal-400 mb-2">
            <Gauge size={14} /> {t('dashboard.badge', 'LIFECHARGE REAL-TIME INSIGHTS')}
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            {t('dashboard.titleText', 'Battery Health & Decision Intelligence')}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            {t('dashboard.descriptionText', 'Predictive battery health, economic degradation insights, and prescriptive charging optimization.')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedBattery}
            onChange={(e) => setSelectedBattery(e.target.value)}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B131F] px-4 py-2 text-xs font-bold text-slate-900 dark:text-white"
          >
            <option value="CELL_LFP_001">CELL_LFP_001 (Tesla Model 3 LFP)</option>
            <option value="CELL_NMC_004">CELL_NMC_004 (Model Y NMC Pack)</option>
            <option value="CELL_NCA_008">CELL_NCA_008 (High Power Performance)</option>
          </select>
        </div>
      </div>

      {/* Persona Switcher Component */}
      <PersonaSelector activePersona={activePersona} onSelectPersona={setActivePersona} />

      {/* Persona View 1: DRIVER / EV OWNER */}
      {activePersona === 'DRIVER' && (
        <div className="space-y-8">
          <ConsumerInsightCard
            financialData={financialData}
            onOpenSmartCharging={() => setIsSmartChargingOpen(true)}
            onOpenPassport={() => setIsPassportOpen(true)}
          />

          {/* SOH & RUL Trajectory Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B131F] p-6 space-y-3 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">SOH Degradation & Range Loss Trajectory</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sohData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="cycle" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" domain={[85, 100]} fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px' }} />
                    <Line type="monotone" dataKey="soh" stroke="#14b8a6" strokeWidth={3} name="SOH (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B131F] p-6 space-y-3 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Remaining Useful Life (RUL Cycles)</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rulData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="cycle" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px' }} />
                    <Line type="monotone" dataKey="rul" stroke="#06b6d4" strokeWidth={3} name="RUL (Cycles)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Persona View 2: FLEET MANAGER */}
      {activePersona === 'FLEET' && (
        <FleetOverviewView fleetData={fleetData} />
      )}

      {/* Persona View 3: TECHNICIAN / RESEARCH DIAGNOSTICS */}
      {activePersona === 'TECHNICIAN' && (
        <div className="space-y-8">
          <CustomizableDashboard />

          {/* 6 Key Overview KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B131F] p-4 space-y-1 shadow-sm">
              <p className="text-[11px] font-semibold text-slate-500">{t('dashboard.currentSoh', 'Current SOH')}</p>
              <p className="text-2xl font-black text-teal-400">93.1%</p>
              <span className="text-[10px] font-bold text-emerald-400">{t('dashboard.healthyState', 'Healthy State')}</span>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B131F] p-4 space-y-1 shadow-sm">
              <p className="text-[11px] font-semibold text-slate-500">{t('dashboard.predictedRul', 'Predicted RUL')}</p>
              <p className="text-2xl font-black text-cyan-400 font-mono">880 {t('dashboard.cycles', 'Cycles')}</p>
              <span className="text-[10px] font-bold text-slate-400">{t('dashboard.serviceYears', '~ 4.8 Service Years')}</span>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B131F] p-4 space-y-1 shadow-sm">
              <p className="text-[11px] font-semibold text-slate-500">{t('dashboard.conformalBounds', '95% Conformal Bounds')}</p>
              <p className="text-sm font-black text-emerald-400 font-mono">[91.3% - 94.9%]</p>
              <span className="text-[10px] font-bold text-slate-400">{t('dashboard.picpCoverage', 'PICP: 95.4% Coverage')}</span>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B131F] p-4 space-y-1 shadow-sm">
              <p className="text-[11px] font-semibold text-slate-500">{t('dashboard.reliabilityScore', 'Reliability Score')}</p>
              <p className="text-2xl font-black text-indigo-400">98.4 / 100</p>
              <span className="text-[10px] font-bold text-teal-400">{t('dashboard.highConfidence', 'High Confidence')}</span>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B131F] p-4 space-y-1 shadow-sm">
              <p className="text-[11px] font-semibold text-slate-500">{t('dashboard.batteryChemistry', 'Battery Chemistry')}</p>
              <p className="text-lg font-black text-purple-400">{t('dashboard.lfpChemistry', 'LFP Chemistry')}</p>
              <span className="text-[10px] font-bold text-slate-400">3.2V Nominal</span>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B131F] p-4 space-y-1 shadow-sm">
              <p className="text-[11px] font-semibold text-slate-500">{t('dashboard.cycleCount', 'Cycle Count')}</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">Cycle 200</p>
              <span className="text-[10px] font-bold text-slate-400">{t('dashboard.cyclingRate', '1.0C Cycling')}</span>
            </div>
          </div>

          {/* Research Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B131F] p-6 space-y-3 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Split Conformal Prediction Interval Bounds</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sohData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="cycle" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" domain={[85, 100]} fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px' }} />
                    <Area type="monotone" dataKey="upper" stroke="none" fill="#10b981" fillOpacity={0.25} />
                    <Area type="monotone" dataKey="lower" stroke="none" fill="#0f172a" fillOpacity={0.8} />
                    <Area type="monotone" dataKey="soh" stroke="#10b981" strokeWidth={2} fill="none" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B131F] p-6 space-y-3 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">dQ/dV Peak Height Degradation Decay</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={hiTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="cycle" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px' }} />
                    <Line type="monotone" dataKey="dQdV_Peak" stroke="#f59e0b" strokeWidth={3} name="dQ/dV Peak Height (Ah/V)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B131F] p-6 space-y-3 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Baseline Empirical Physics vs AI Model</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={physicsVsAiData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="cycle" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" domain={[85, 100]} fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px' }} />
                    <Line type="monotone" dataKey="PurePhysics" stroke="#64748b" strokeDasharray="4 4" strokeWidth={2} name="Pure Empirical Physics" />
                    <Line type="monotone" dataKey="LithyxHybrid" stroke="#14b8a6" strokeWidth={3} name="LITHYX Physics+AI" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B131F] p-6 space-y-3 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Cross-Chemistry Prediction Accuracy (RMSE)</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={crossChemData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="chemistry" stroke="#94a3b8" fontSize={9} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px' }} />
                    <Bar dataKey="SOH_RMSE" fill="#a855f7" radius={[6, 6, 0, 0]} name="SOH RMSE (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Smart Charging Advisor Modal */}
      <SmartChargingAdvisorModal
        isOpen={isSmartChargingOpen}
        onClose={() => setIsSmartChargingOpen(false)}
      />

      {/* Digital Battery Passport Modal */}
      <BatteryPassportView
        isOpen={isPassportOpen}
        onClose={() => setIsPassportOpen(false)}
      />
    </div>
  );
}
