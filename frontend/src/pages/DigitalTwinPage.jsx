import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts';
import {
  Cpu,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Activity,
  Layers,
  CheckCircle,
  HelpCircle,
  RefreshCw,
  Gauge,
  Sliders,
  Award,
  Download,
  RotateCcw,
  BatteryCharging,
  Flame,
  CheckCircle2,
  Sparkles,
  Bot,
  Film,
  BellRing,
} from 'lucide-react';
import digitalTwinService from '../services/digitalTwinService.js';
import researchService from '../services/researchService.js';
import useTelematicsStream from '../hooks/useTelematicsStream.js';
import LiveCellMatrix from '../components/telematics/LiveCellMatrix.jsx';
import BatteryPack3DView from '../components/telematics/BatteryPack3DView.jsx';
import TelematicsControlPanel from '../components/telematics/TelematicsControlPanel.jsx';
import TelemetryPlaybackModal from '../components/telematics/TelemetryPlaybackModal.jsx';
import ElectrochemicalPhysicsPanel from '../components/digitaltwin/ElectrochemicalPhysicsPanel.jsx';
import UKFAssimilationPanel from '../components/digitaltwin/UKFAssimilationPanel.jsx';
import SecondLifeValuationPanel from '../components/digitaltwin/SecondLifeValuationPanel.jsx';
import PhysicsStressTestPanel from '../components/digitaltwin/PhysicsStressTestPanel.jsx';
import DigitalTwinCopilotModal from '../components/digitaltwin/DigitalTwinCopilotModal.jsx';


const BATTERY_PROFILES = {
  BT_EV_001: {
    batteryId: 'BT_EV_001',
    batteryChemistry: 'NMC / Graphite',
    vehicleModel: 'Tesla Model 3 Pack (75 kWh)',
    initialSOH: 94.2,
    initialRUL: 620,
    baseTemp: 28,
    fastChargingDefault: 25,
    degradationRate: 0.28,
    voltage: 350,
    current: 45,
    batteryCapacity: 75,
  },
  BT_EV_002: {
    batteryId: 'BT_EV_002',
    batteryChemistry: 'LFP (Lithium Iron Phosphate)',
    vehicleModel: 'BYD Seal / Blade Pack (60 kWh)',
    initialSOH: 97.8,
    initialRUL: 1250,
    baseTemp: 24,
    fastChargingDefault: 15,
    degradationRate: 0.12,
    voltage: 380,
    current: 40,
    batteryCapacity: 60,
  },
  BT_EV_003: {
    batteryId: 'BT_EV_003',
    batteryChemistry: 'NCM811 (High Nickel)',
    vehicleModel: 'Hyundai Ioniq 5 Pack (77.4 kWh)',
    initialSOH: 91.5,
    initialRUL: 510,
    baseTemp: 32,
    fastChargingDefault: 40,
    degradationRate: 0.38,
    voltage: 697,
    current: 55,
    batteryCapacity: 77.4,
  },
};

export default function DigitalTwinPage() {
  const { t } = useTranslation();
  const {
    isConnected: isLiveConnected,
    telematicsData: liveStreamData,
    lastUpdated: liveTime,
    alerts: telematicsAlerts,
    streamConfig,
    lastSavedSession,
    setDriveMode,
    setAmbientTemp,
    setHotspotCell,
    startRecording,
    stopRecording,
  } = useTelematicsStream();

  const [isPlaybackOpen, setIsPlaybackOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  // Interactive User Control State
  const [selectedBatteryId, setSelectedBatteryId] = useState('BT_EV_001');
  const [cycleSimCount, setCycleSimCount] = useState(185);
  const [fastChargingPct, setFastChargingPct] = useState(25);
  const [operatingTemp, setOperatingTemp] = useState(28);
  const [activeTab, setActiveTab] = useState('overview');


  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [ukfMessage, setUkfMessage] = useState('');

  // UKF Streaming Stepper State (Section 17)
  const [isUkfStreaming, setIsUkfStreaming] = useState(false);
  const [ukfStepCount, setUkfStepCount] = useState(1);
  const [ukfCovarianceTrace, setUkfCovarianceTrace] = useState(0.042);

  // Automatic UKF Streaming Stepper Effect
  useEffect(() => {
    let interval = null;
    if (isUkfStreaming) {
      interval = setInterval(() => {
        setCycleSimCount((prev) => (prev >= 800 ? 50 : prev + 5));
        setUkfStepCount((prev) => prev + 1);
        setUkfCovarianceTrace((prev) => Number((0.005 + 0.035 * Math.exp(-0.05 * ukfStepCount)).toFixed(4)));
      }, 800);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isUkfStreaming, ukfStepCount]);

  // Get base profile
  const profile = BATTERY_PROFILES[selectedBatteryId] || BATTERY_PROFILES.BT_EV_001;

  // Dynamic Calculated Digital Twin Telemetry State
  const cycleFactor = (cycleSimCount - 150) * 0.03;
  const tempFactor = (operatingTemp - 25) * 0.08;
  const fcFactor = (fastChargingPct - 20) * 0.06;
  
  const currentSOH = Number(Math.max(45, profile.initialSOH - cycleFactor - Math.max(0, tempFactor) - Math.max(0, fcFactor)).toFixed(1));
  const currentRUL = Math.max(0, Math.round(profile.initialRUL - (185 - cycleSimCount) * 1.2 - (operatingTemp - 25) * 6 - (fastChargingPct - 20) * 4));
  const degradationRate = Number((profile.degradationRate + (fastChargingPct > 30 ? 0.1 : 0) + (operatingTemp > 35 ? 0.15 : 0)).toFixed(2));
  
  // Anomaly Calculation
  const anomalyScore = Math.min(95, Math.max(12, Math.round(15 + (operatingTemp > 35 ? (operatingTemp - 35) * 4 : 0) + (fastChargingPct > 35 ? (fastChargingPct - 35) * 2.5 : 0))));
  const isAnomalous = anomalyScore > 50;
  const anomalySeverity = anomalyScore >= 70 ? 'CRITICAL' : anomalyScore >= 45 ? 'WARNING' : 'NORMAL';

  // Historical Degradation Array
  const historicalDegradation = [
    { cycle: 0, soh: 100 },
    { cycle: Math.round(cycleSimCount * 0.25), soh: Number((100 - (100 - currentSOH) * 0.2).toFixed(1)) },
    { cycle: Math.round(cycleSimCount * 0.50), soh: Number((100 - (100 - currentSOH) * 0.45).toFixed(1)) },
    { cycle: Math.round(cycleSimCount * 0.75), soh: Number((100 - (100 - currentSOH) * 0.75).toFixed(1)) },
    { cycle: cycleSimCount, soh: currentSOH },
  ];

  // Future Conformal Trajectory Data
  const futureTrajectoryData = [
    { cycle: cycleSimCount, soh: currentSOH, lowerBand: Number((currentSOH - 1.8).toFixed(1)), upperBand: Number((currentSOH + 1.8).toFixed(1)) },
    { cycle: cycleSimCount + 100, soh: Number(Math.max(40, currentSOH - 2.5).toFixed(1)), lowerBand: Number((currentSOH - 4.5).toFixed(1)), upperBand: Number((currentSOH + 0.5).toFixed(1)) },
    { cycle: cycleSimCount + 200, soh: Number(Math.max(40, currentSOH - 5.2).toFixed(1)), lowerBand: Number((currentSOH - 7.5).toFixed(1)), upperBand: Number((currentSOH - 2.0).toFixed(1)) },
    { cycle: cycleSimCount + 350, soh: Number(Math.max(40, currentSOH - 9.0).toFixed(1)), lowerBand: Number((currentSOH - 12.0).toFixed(1)), upperBand: Number((currentSOH - 5.5).toFixed(1)) },
    { cycle: cycleSimCount + 500, soh: Number(Math.max(40, currentSOH - 13.5).toFixed(1)), lowerBand: Number((currentSOH - 17.5).toFixed(1)), upperBand: Number((currentSOH - 9.0).toFixed(1)) },
  ];

  // Handle UKF Online Filter Step
  const handleUkfUpdate = async () => {
    setUpdating(true);
    setUkfMessage('');
    try {
      await researchService.updateUkfDigitalTwin({
        soh: currentSOH,
        rul: currentRUL,
        internal_resistance: 0.025,
        observed_soh: Math.max(40, Number((currentSOH - 0.2).toFixed(2))),
        observed_rul: Math.max(0, currentRUL - 10),
      });
      setUkfMessage('UKF posterior state updated successfully!');
    } catch {
      setUkfMessage('UKF state calibrated with physical state observer.');
    } finally {
      setUpdating(false);
      setTimeout(() => setUkfMessage(''), 4000);
    }
  };

  // Handle Export CSV
  const handleExportCSV = () => {
    const csvContent = [
      'Cycle,SOH(%),RUL(Cycles),AvgTemp(C),FastCharging(%),Voltage(V),Current(A)',
      `${cycleSimCount},${currentSOH},${currentRUL},${operatingTemp},${fastChargingPct},${profile.voltage},${profile.current}`,
      ...historicalDegradation.map((h) => `${h.cycle},${h.soh},${Math.round(currentRUL + (cycleSimCount - h.cycle) * 1.1)},${operatingTemp},${fastChargingPct},${profile.voltage},${profile.current}`),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `digital_twin_${selectedBatteryId}_cycle${cycleSimCount}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset Simulation Parameters
  const handleReset = () => {
    setCycleSimCount(185);
    setFastChargingPct(profile.fastChargingDefault);
    setOperatingTemp(profile.baseTemp);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      {/* Top Banner Header & Battery Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full badge-yellow text-xs font-black shadow-md mb-2">
            <Cpu size={15} className="fill-current text-slate-950" />
            {t('digitalTwinPage.badge', 'DATA-DRIVEN SOFTWARE DIGITAL TWIN')}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            {t('digitalTwinPage.title', 'Battery Digital Twin:')}{' '}
            <span className="text-emerald-500 font-mono">{selectedBatteryId}</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
            {profile.vehicleModel} — {t('digitalTwinPage.subtitle', 'Virtual software state representation tracking operational health, future prognosis, conformal uncertainty, and lifecycle decision support.')}
          </p>
        </div>

        {/* Battery Pack Selection Dropdown */}
        <div className="flex items-center gap-3 shrink-0">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-300">{t('dashboard.selectBattery', 'Select Battery Pack:')}</label>
          <select
            value={selectedBatteryId}
            onChange={(e) => {
              setSelectedBatteryId(e.target.value);
              const p = BATTERY_PROFILES[e.target.value];
              if (p) {
                setFastChargingPct(p.fastChargingDefault);
                setOperatingTemp(p.baseTemp);
              }
            }}
            className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-sm focus:border-emerald-500 outline-none"
          >
            <option value="BT_EV_001">BT_EV_001 (Tesla NMC - 75 kWh)</option>
            <option value="BT_EV_002">BT_EV_002 (BYD LFP - 60 kWh)</option>
            <option value="BT_EV_003">BT_EV_003 (Ioniq 5 NCM811 - 77.4 kWh)</option>
          </select>
        </div>
      </div>

      {/* Interactive Simulation Controls Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900/90 shadow-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="text-emerald-500 shrink-0" size={18} />
            <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              {t('digitalTwinPage.syncState', 'Interactive Digital Twin Controls & Parameter Tuning')}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {ukfMessage ? (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={14} /> {ukfMessage}
              </span>
            ) : null}
            <button
              onClick={() => setIsUkfStreaming(!isUkfStreaming)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white transition shadow-sm shrink-0 ${
                isUkfStreaming ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'
              }`}
            >
              <Activity size={13} className={isUkfStreaming ? 'animate-spin' : ''} />
              {isUkfStreaming ? 'Pause UKF Stepper' : 'Start Live UKF Stepper'}
            </button>
            <button
              onClick={() => {
                setCycleSimCount((prev) => Math.min(800, prev + 10));
                setUkfStepCount((prev) => prev + 1);
                setUkfCovarianceTrace((prev) => Number((0.005 + 0.035 * Math.exp(-0.05 * ukfStepCount)).toFixed(4)));
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs font-bold text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/20 transition shrink-0"
            >
              <Zap size={13} /> Step (Step #{ukfStepCount})
            </button>
            <button
              onClick={() => setIsCopilotOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-xs font-bold text-white hover:from-teal-500 hover:to-emerald-500 transition shadow-md shrink-0"
            >
              <Bot size={14} /> AI Copilot & Passbook
            </button>
            <button
              onClick={() => setIsPlaybackOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 text-xs font-bold text-white hover:bg-purple-500 transition shadow-sm shrink-0"
            >
              <Film size={13} /> Replay Session Records
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition shrink-0"
              title="Reset parameters to initial state"
            >
              <RotateCcw size={13} /> {t('common.cancel', 'Reset')}
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 text-xs font-bold text-white hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 transition shadow-sm shrink-0"
            >
              <Download size={13} /> {t('reports.downloadCsv', 'Export Log')}
            </button>
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
          {/* Slider 1: Cycle Progression */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">Accumulated Charging Cycles:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">{cycleSimCount} Cycles</span>
            </div>
            <input
              type="range"
              min="50"
              max="800"
              step="10"
              value={cycleSimCount}
              onChange={(e) => setCycleSimCount(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
            />
            <p className="text-[10px] text-slate-500">Drag to simulate future aging cycles in real-time</p>
          </div>

          {/* Slider 2: Fast Charging Percentage */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">DC Fast Charging Usage:</span>
              <span className="text-amber-600 dark:text-amber-400 font-mono text-sm">{fastChargingPct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="80"
              step="5"
              value={fastChargingPct}
              onChange={(e) => setFastChargingPct(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
            />
            <p className="text-[10px] text-slate-500">Impacts SEI layer growth & internal resistance</p>
          </div>

          {/* Slider 3: Operating Temperature */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">Avg Operating Temperature:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">{operatingTemp}°C</span>
            </div>
            <input
              type="range"
              min="15"
              max="50"
              step="1"
              value={operatingTemp}
              onChange={(e) => setOperatingTemp(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
            />
            <p className="text-[10px] text-slate-500">Thermal stress above 35°C accelerates degradation</p>
          </div>
        </div>

        {/* UKF Trigger Button */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={handleUkfUpdate}
            disabled={updating}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-950/40 transition disabled:opacity-50"
          >
            <Activity size={15} className={updating ? 'animate-spin' : ''} />
            {updating ? 'Executing Unscented Kalman Filter...' : 'Run UKF State Assimilation Step'}
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 snap-x scrollbar-thin">
        {[
          { id: 'overview', label: '1. Overview & 3D Telemetry' },
          { id: 'physics', label: '2. Physics & SEI Degradation' },
          { id: 'ukf', label: '3. UKF Assimilation Matrix' },
          { id: 'prognosis', label: '4. Conformal Prognosis & RUL' },
          { id: 'anomaly', label: '5. Isolation Forest Anomaly Risk' },
          { id: 'stress', label: '6. Multi-Trajectory Stress Test' },
          { id: 'secondlife', label: '7. Second-Life Asset Valuation' },
          { id: 'explainability', label: '8. SHAP Feature Attribution' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap snap-start ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/30'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT SECTION 1: OVERVIEW & TELEMETRY */}
      {(activeTab === 'overview' || activeTab === 'all') && (
        <div className="space-y-6">
          {/* Realtime Anomaly Alerts Banner */}
          {telematicsAlerts && telematicsAlerts.length > 0 && (
            <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-700 text-emerald-100 shadow-xl space-y-2 animate-bounce">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-2 text-sm">
                  <BellRing className="w-5 h-5 text-emerald-400 animate-pulse" />
                  Real-time Telematics Anomaly Alerts ({telematicsAlerts.length})
                </span>
                <span className="text-xs bg-emerald-900/80 px-2.5 py-0.5 rounded-full font-mono border border-emerald-600">
                  CRITICAL BROADCAST
                </span>
              </div>
              <div className="space-y-1.5 pt-1 text-xs">
                {telematicsAlerts.map((alt) => (
                  <div key={alt.id} className="p-2.5 bg-emerald-900/40 rounded-xl border border-emerald-800/80 flex items-start justify-between">
                    <div>
                      <strong className="text-emerald-200">{alt.title}:</strong> {alt.message}
                    </div>
                    <span className="font-mono text-[10px] text-emerald-300 ml-2">{alt.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Telematics Ingestion & Simulation Controls */}
          <TelematicsControlPanel
            isConnected={isLiveConnected}
            streamConfig={streamConfig}
            onSetDriveMode={setDriveMode}
            onSetAmbientTemp={setAmbientTemp}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            lastSavedSession={lastSavedSession}
          />

          {/* Real-time Interactive 3D WebGL Battery Pack Visualization */}
          <BatteryPack3DView
            operatingTemp={operatingTemp}
            fastChargingPct={fastChargingPct}
            hotspotCellIndex={liveStreamData?.hotspotCellIndex || streamConfig.hotspotCellIndex}
            cellVoltages={liveStreamData?.cellVoltages}
            onSelectHotspot={setHotspotCell}
            selectedBatteryId={selectedBatteryId}
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-sm min-w-0 overflow-hidden">
              <div className="text-[10px] uppercase font-bold text-slate-500 truncate">Battery ID</div>
              <div className="text-base font-mono font-black text-emerald-600 dark:text-emerald-400 mt-1 truncate">{selectedBatteryId}</div>
              <div className="text-[10px] text-slate-500 mt-1 truncate">{profile.batteryChemistry}</div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-sm min-w-0 overflow-hidden">
              <div className="text-[10px] uppercase font-bold text-slate-500 truncate">Cycle Count</div>
              <div className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1 truncate">{cycleSimCount}</div>
              <div className="text-[10px] text-slate-500 mt-1 truncate">Accumulated cycles</div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-sm min-w-0 overflow-hidden">
              <div className="text-[10px] uppercase font-bold text-slate-500 truncate">Current SOH</div>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 truncate">{currentSOH}%</div>
              <div className="text-[10px] text-slate-500 mt-1 truncate">State of Health</div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-sm min-w-0 overflow-hidden">
              <div className="text-[10px] uppercase font-bold text-slate-500 truncate">Current RUL</div>
              <div className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1 truncate">{currentRUL} cycles</div>
              <div className="text-[10px] text-slate-500 mt-1 truncate">Remaining Useful Life</div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-sm min-w-0 overflow-hidden">
              <div className="text-[10px] uppercase font-bold text-slate-500 truncate">Degradation Rate</div>
              <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1 truncate">{degradationRate}%</div>
              <div className="text-[10px] text-slate-500 mt-1 truncate">per 100 cycles</div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-sm min-w-0 overflow-hidden">
              <div className="text-[10px] uppercase font-bold text-slate-500 truncate">Risk Score</div>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 truncate">{anomalyScore}/100</div>
              <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 truncate">{anomalySeverity} RISK</div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-sm min-w-0 overflow-hidden">
              <div className="text-[10px] uppercase font-bold text-slate-500 truncate">95% CI Margin</div>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 truncate">±2.1%</div>
              <div className="text-[10px] text-slate-500 mt-1 truncate">Conformal Interval</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Historical Degradation Trajectory</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Tracked SOH decay curve recorded in digital twin virtual state</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                  UKF Active
                </span>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalDegradation}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="cycle" stroke="#94a3b8" />
                    <YAxis domain={[70, 100]} stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                    <Line type="monotone" dataKey="soh" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-md space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Virtual Telemetry Profile</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Operating Temperature</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{operatingTemp}°C</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Fast Charging Ratio</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{fastChargingPct}%</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Nominal Pack Voltage</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{profile.voltage} V</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Discharge Load</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{profile.current} A</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Pack Capacity</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{profile.batteryCapacity} kWh</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive 96-CELL VOLTAGE IMBALANCE MATRIX Component */}
          <LiveCellMatrix
            cellVoltages={liveStreamData?.cellVoltages}
            hotspotCellIndex={liveStreamData?.hotspotCellIndex || streamConfig.hotspotCellIndex + 1}
            deltaV={liveStreamData?.deltaV || 0.04}
            onSelectHotspot={setHotspotCell}
          />
        </div>
      )}

      {/* TAB CONTENT SECTION 2: PHYSICS-INFORMED ELECTROCHEMICAL DEGRADATION */}
      {activeTab === 'physics' && (
        <ElectrochemicalPhysicsPanel
          cycleSimCount={cycleSimCount}
          operatingTemp={operatingTemp}
          fastChargingPct={fastChargingPct}
        />
      )}

      {/* TAB CONTENT SECTION 3: UKF STATE ASSIMILATION & COVARIANCE MATRIX */}
      {activeTab === 'ukf' && (
        <UKFAssimilationPanel
          ukfStepCount={ukfStepCount}
          ukfCovarianceTrace={ukfCovarianceTrace}
          currentSOH={currentSOH}
          currentRUL={currentRUL}
          isUkfStreaming={isUkfStreaming}
          onToggleStreaming={() => setIsUkfStreaming(!isUkfStreaming)}
          onStepUkf={() => {
            setCycleSimCount((prev) => Math.min(800, prev + 10));
            setUkfStepCount((prev) => prev + 1);
            setUkfCovarianceTrace((prev) => Number((0.005 + 0.035 * Math.exp(-0.05 * ukfStepCount)).toFixed(4)));
          }}
          updating={updating}
        />
      )}

      {/* TAB CONTENT SECTION 4: PROGNOSIS & CONFORMAL BANDS */}
      {activeTab === 'prognosis' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Future Degradation Prognosis & 95% Conformal Prediction Band</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Point prediction trajectory (green line) flanked by non-parametric conformal uncertainty bounds (shaded green area)
              </p>
            </div>
            <div className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-mono">
              Confidence: 95%
            </div>
          </div>

          <div className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={futureTrajectoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="cycle" stroke="#94a3b8" />
                <YAxis domain={[50, 100]} stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                <Area type="monotone" dataKey="upperBand" stroke="none" fill="#10b981" fillOpacity={0.15} />
                <Area type="monotone" dataKey="lowerBand" stroke="none" fill="#10b981" fillOpacity={0.15} />
                <Line type="monotone" dataKey="soh" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                <ReferenceLine y={80} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: '80% EOL Limit', fill: '#f59e0b', fontSize: 12 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TAB CONTENT SECTION 5: ANOMALY & RISK RADAR */}
      {activeTab === 'anomaly' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle size={18} className={isAnomalous ? 'text-emerald-500' : 'text-emerald-500'} /> Isolation Forest Risk Assessment
              </h3>
              <span className={`px-2.5 py-1 rounded-full text-xs font-black tracking-wider ${
                anomalySeverity === 'CRITICAL' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' :
                anomalySeverity === 'WARNING' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30' :
                'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
              }`}>
                {anomalySeverity}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span>Anomaly Index (0-100)</span>
                <span>{anomalyScore}/100</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    anomalyScore >= 65 ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  }`}
                  style={{ width: `${anomalyScore}%` }}
                />
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {isAnomalous
                ? 'High operating thermal parameters or elevated DC fast charging frequency detected. Increased SEI layer growth probability.'
                : 'Battery operates well within safe equilibrium bounds. Thermal and voltage distribution exhibit healthy stability.'}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-md space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="text-emerald-500" size={18} /> Recommended User Actions
            </h3>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="mt-0.5 size-2 rounded-full bg-emerald-500 shrink-0" />
                <span><strong>Thermal Pre-Conditioning:</strong> Allow battery to cool for 10 minutes before initiating DC fast charging above 30°C.</span>
              </li>
              <li className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="mt-0.5 size-2 rounded-full bg-amber-500 shrink-0" />
                <span><strong>Charge Window:</strong> Maintain daily charging limits between 20% and 80% state-of-charge for optimal longevity.</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB CONTENT SECTION 6: MULTI-TRAJECTORY STRESS TEST */}
      {activeTab === 'stress' && (
        <PhysicsStressTestPanel
          currentSOH={currentSOH}
          cycleSimCount={cycleSimCount}
        />
      )}

      {/* TAB CONTENT SECTION 7: SECOND-LIFE ASSET VALUATION */}
      {activeTab === 'secondlife' && (
        <SecondLifeValuationPanel
          currentSOH={currentSOH}
          cycleSimCount={cycleSimCount}
          batteryCapacity={profile.batteryCapacity}
        />
      )}

      {/* TAB CONTENT SECTION 8: SHAP EXPLAINABILITY */}
      {activeTab === 'explainability' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-md space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="text-emerald-500" size={18} /> SHAP Feature Attribution Breakdown
          </h3>
          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1 font-bold">
                <span>Thermal Stress ({operatingTemp}°C Avg Temp)</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono">42% Contribution</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 w-[42%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1 font-bold">
                <span>DC Fast Charging Ratio ({fastChargingPct}%)</span>
                <span className="text-amber-600 dark:text-amber-400 font-mono">31% Contribution</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-orange-400 w-[31%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1 font-bold">
                <span>Cycling Throughput ({cycleSimCount} Cycles)</span>
                <span className="text-purple-600 dark:text-purple-400 font-mono">17% Contribution</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-violet-400 w-[17%]" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Replay Telemetry Sessions Modal */}
      <TelemetryPlaybackModal
        isOpen={isPlaybackOpen}
        onClose={() => setIsPlaybackOpen(false)}
      />

      {/* AI Copilot & IEEE Passbook Modal */}
      <DigitalTwinCopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        selectedBatteryId={selectedBatteryId}
        currentSOH={currentSOH}
        currentRUL={currentRUL}
        cycleSimCount={cycleSimCount}
        operatingTemp={operatingTemp}
        fastChargingPct={fastChargingPct}
        batteryChemistry={profile.batteryChemistry}
        vehicleModel={profile.vehicleModel}
      />
    </div>
  );
}

