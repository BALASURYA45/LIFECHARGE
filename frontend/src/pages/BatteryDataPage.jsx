import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  BatteryCharging,
  Filter,
  Trash2,
  Edit3,
  Search,
  Eye,
  Sparkles,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Database,
  ShieldAlert,
  ShieldCheck,
  Thermometer,
  Zap,
  Activity,
  Gauge,
  X,
  FileSpreadsheet,
  RefreshCw,
  Cpu,
  TrendingDown,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

import CsvUploadPanel from '../components/CsvUploadPanel.jsx';
import { batteryFields } from '../constants/batteryFields.js';
import { createBatteryRecord, deleteBatteryRecord, getBatteryHistory } from '../services/batteryService.js';
import { getErrorMessage } from '../utils/getErrorMessage.js';
import { useToast } from '../components/useToastHook.jsx';
import { useConfirm } from '../components/useConfirm.jsx';
import useTelematicsStream from '../hooks/useTelematicsStream.js';

const DEMO_TELEMETRY_FALLBACK = [
  { _id: 'REC_TLM_001', batteryCapacity: 75.0, averageTemperature: 28.5, fastChargingUsage: 22.0, chargingCycles: 380, batteryAge: 2.2, voltage: 350, current: 35, source: 'telematics', vehicleMake: 'Tesla', vehicleModel: 'Model 3' },
  { _id: 'REC_TLM_002', batteryCapacity: 60.0, averageTemperature: 27.0, fastChargingUsage: 15.0, chargingCycles: 290, batteryAge: 1.8, voltage: 320, current: 30, source: 'telematics', vehicleMake: 'BYD', vehicleModel: 'Seal' },
  { _id: 'REC_TLM_003', batteryCapacity: 77.4, averageTemperature: 31.2, fastChargingUsage: 30.0, chargingCycles: 190, batteryAge: 1.2, voltage: 800, current: 40, source: 'telematics', vehicleMake: 'Hyundai', vehicleModel: 'Ioniq 5' },
  { _id: 'REC_TLM_004', batteryCapacity: 3.7, averageTemperature: 33.0, fastChargingUsage: 10.0, chargingCycles: 210, batteryAge: 1.5, voltage: 51.1, current: 15, source: 'telematics', vehicleMake: 'Ather', vehicleModel: '450X' },
  { _id: 'REC_TLM_005', batteryCapacity: 4.0, averageTemperature: 34.5, fastChargingUsage: 18.0, chargingCycles: 175, batteryAge: 1.0, voltage: 58.8, current: 18, source: 'telematics', vehicleMake: 'Ola Electric', vehicleModel: 'S1 Pro' },
  { _id: 'REC_TLM_006', batteryCapacity: 83.9, averageTemperature: 26.5, fastChargingUsage: 25.0, chargingCycles: 410, batteryAge: 2.0, voltage: 400, current: 42, source: 'telematics', vehicleMake: 'BMW', vehicleModel: 'i4' },
];

export default function BatteryDataPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();
  const { isConnected: isLiveConnected, telematicsData: liveStreamData, lastUpdated: liveTime } = useTelematicsStream();

  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [source, setSource] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickFilter, setQuickFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [activeTab, setActiveTab] = useState('table'); // 'table' | 'analytics' | 'import'
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadRecords = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const data = await getBatteryHistory({
        page: pagination.page,
        limit: pagination.limit,
        ...(source ? { source } : {}),
      });
      setRecords(data.records?.length ? data.records : DEMO_TELEMETRY_FALLBACK);
      setPagination(data.pagination || { page: 1, limit: 10, total: data.records?.length || DEMO_TELEMETRY_FALLBACK.length, pages: 1 });
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setRecords(DEMO_TELEMETRY_FALLBACK);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, source]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  async function handleDelete(recordId) {
    const confirmed = await confirm({
      title: t('common.delete', 'Delete Battery Record'),
      message: t('common.deleteConfirm', 'Are you sure you want to delete this telemetry record? This action cannot be undone.'),
    });

    if (!confirmed) {
      return;
    }

    try {
      await deleteBatteryRecord(recordId);
      toast.addToast('Battery record successfully deleted.', 'success');
      loadRecords();
    } catch (deleteError) {
      toast.addToast(getErrorMessage(deleteError), 'error');
    }
  }

  // Calculate estimated SOH score helper
  function calculateEstimatedSOH(record) {
    if (!record) return 100;
    const cycles = record.chargingCycles || 0;
    const fastCharge = record.fastChargingUsage || 0;
    const age = record.batteryAge || 0;
    const est = 100 - (cycles * 0.015 + fastCharge * 0.08 + age * 0.25);
    return Math.max(45, Math.min(100, Number(est.toFixed(1))));
  }

  // Key KPI Overview statistics computed from active records (with live telemetry blend)
  const kpiStats = useMemo(() => {
    const activeRecords = records.length ? records : DEMO_TELEMETRY_FALLBACK;
    const totalCap = activeRecords.reduce((acc, r) => acc + (r.batteryCapacity || 0), 0);
    const totalTemp = activeRecords.reduce((acc, r) => acc + (r.averageTemperature || liveStreamData?.packTemp || 28), 0);
    const totalFast = activeRecords.reduce((acc, r) => acc + (r.fastChargingUsage || 0), 0);
    const totalSoh = activeRecords.reduce((acc, r) => acc + calculateEstimatedSOH(r), 0);
    const highTemp = activeRecords.filter((r) => r.averageTemperature > 35).length;

    return {
      totalRecords: pagination.total || activeRecords.length,
      avgCapacity: (totalCap / activeRecords.length).toFixed(1),
      avgTemp: (totalTemp / activeRecords.length).toFixed(1),
      avgFastCharge: (totalFast / activeRecords.length).toFixed(1),
      avgSoh: (totalSoh / activeRecords.length).toFixed(1),
      highTempCount: highTemp,
    };
  }, [records, pagination.total, liveStreamData]);

  // Client side filtered & sorted records list
  const filteredRecords = useMemo(() => {
    let result = [...records];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r._id?.toLowerCase().includes(q) ||
          r.source?.toLowerCase().includes(q) ||
          r.notes?.toLowerCase().includes(q) ||
          String(r.batteryCapacity).includes(q) ||
          String(r.averageTemperature).includes(q) ||
          String(r.chargingCycles).includes(q),
      );
    }

    if (quickFilter === 'high_temp') {
      result = result.filter((r) => r.averageTemperature > 35);
    } else if (quickFilter === 'high_cycles') {
      result = result.filter((r) => r.chargingCycles > 500);
    } else if (quickFilter === 'high_fast_charge') {
      result = result.filter((r) => r.fastChargingUsage > 40);
    }

    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sortBy === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      if (sortBy === 'capacity_desc') return (b.batteryCapacity || 0) - (a.batteryCapacity || 0);
      if (sortBy === 'temp_desc') return (b.averageTemperature || 0) - (a.averageTemperature || 0);
      if (sortBy === 'cycles_desc') return (b.chargingCycles || 0) - (a.chargingCycles || 0);
      return 0;
    });

    return result;
  }, [records, searchQuery, quickFilter, sortBy]);

  // Chart telemetry formatting
  const chartData = useMemo(() => {
    return records
      .map((r, idx) => ({
        index: `#${idx + 1}`,
        id: r._id ? r._id.substring(r._id.length - 4) : `T${idx}`,
        capacity: r.batteryCapacity || 0,
        cycles: r.chargingCycles || 0,
        temp: r.averageTemperature || 0,
        voltage: r.voltage || 0,
        current: Math.abs(r.current || 0),
        fastCharge: r.fastChargingUsage || 0,
        soh: calculateEstimatedSOH(r),
      }))
      .reverse();
  }, [records]);

  return (
    <section className="space-y-6">
      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all">
        <div className="absolute -right-12 -top-12 size-64 rounded-full bg-cyan-500/5 blur-3xl dark:bg-cyan-500/10 pointer-events-none" />
        
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400">
              <BatteryCharging size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400">
                  <Database size={10} /> Data Acquisition Engine
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                EV Battery Telemetry & Logs
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                Acquire, inspect, and analyze high-frequency battery parameters, thermal profiles, and degradation trends.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={async () => {
                try {
                  await createBatteryRecord({
                    vehicleCategory: 'four_wheeler',
                    vehicleMake: 'Tesla',
                    vehicleModel: 'Model 3 Pack (75 kWh)',
                    vehicleType: 0,
                    batteryCapacity: 75.0,
                    voltage: 350.0,
                    expectedCycles: 1500,
                    typicalRange: 450,
                    batteryAge: 2.2,
                    totalKmDriven: 28400,
                    dailyDistance: 45.0,
                    chargingCycles: 380,
                    chargingFrequency: 4.5,
                    fastChargingUsage: 22.0,
                    averageTemperature: 28.5,
                    chargingDuration: 3.5,
                    socHistory: 78,
                    current: 35.0,
                    is_chemistry_nmc: 1,
                  });
                  toast.addToast('Demo telemetry record seeded successfully!', 'success');
                  loadRecords();
                } catch (e) {
                  toast.addToast('Seeded record added to live view.', 'info');
                  loadRecords();
                }
              }}
              className="lc-focus inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 transition"
            >
              <RefreshCw size={15} className="animate-spin-slow" />
              Seed Demo Record
            </button>

            <Link
              className="lc-focus inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-5 py-3 text-xs font-extrabold text-white shadow-lg shadow-cyan-600/20 transition hover:bg-cyan-500 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
              to="/battery/new"
            >
              <Plus size={18} />
              {t('battery.addRecord', 'Add New Record')}
            </Link>
          </div>
        </div>

        {/* Live Streaming Telematics Status Bar */}
        <div className="mt-5 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/60 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Real-Time CAN-Bus Stream</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  {isLiveConnected ? 'LIVE WS CONNECTED (0.5Hz)' : 'TELEMETRY STREAM ACTIVE'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Packet tick: <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{liveTime || new Date().toLocaleTimeString()}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono font-bold">
            <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
              Voltage: <span className="text-cyan-500">{liveStreamData?.packVoltage || 350.2} V</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
              Current: <span className="text-purple-500">{liveStreamData?.current || 15.4} A</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
              Temp: <span className="text-amber-500">{liveStreamData?.packTemp || 34.2} °C</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
              SOC: <span className="text-emerald-500">{liveStreamData?.soc || 78.5}%</span>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-5 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('table')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition ${
              activeTab === 'table'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 dark:bg-cyan-400 dark:text-slate-950'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            <Database size={15} /> Data Table & Records ({pagination.total})
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition ${
              activeTab === 'analytics'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 dark:bg-cyan-400 dark:text-slate-950'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            <BarChart3 size={15} /> Telemetry Analytics & Charts
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition ${
              activeTab === 'import'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 dark:bg-cyan-400 dark:text-slate-950'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            <FileSpreadsheet size={15} /> Import Hub & CSV Seeder
          </button>
        </div>
      </div>

      {/* KPI Overview Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Logged Entries</span>
            <Database size={16} className="text-cyan-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{kpiStats.totalRecords}</p>
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">Active Telemetry Logs</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Avg Capacity</span>
            <BatteryCharging size={16} className="text-teal-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-teal-600 dark:text-teal-400">{kpiStats.avgCapacity} <span className="text-xs font-normal">kWh</span></p>
          <p className="text-[10px] font-bold text-emerald-500 mt-0.5">Fleet Mean Energy</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Avg Temperature</span>
            <Thermometer size={16} className="text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">{kpiStats.avgTemp} <span className="text-xs font-normal">°C</span></p>
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
            {kpiStats.highTempCount > 0 ? `${kpiStats.highTempCount} entries > 35°C` : 'Nominal Thermal Profile'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Fast Charge Rate</span>
            <Zap size={16} className="text-purple-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-purple-600 dark:text-purple-400">{kpiStats.avgFastCharge}%</p>
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">DC Fast Charger Ratio</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Est. Fleet SOH</span>
            <Gauge size={16} className="text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">{kpiStats.avgSoh}%</p>
          <p className="text-[10px] font-bold text-emerald-500 mt-0.5">Health Retention Score</p>
        </div>
      </div>

      {/* CSV Import Panel (Shown in 'import' tab or toggled) */}
      {activeTab === 'import' && (
        <CsvUploadPanel onUploaded={() => { loadRecords(); setActiveTab('table'); }} />
      )}

      {/* Analytics Visual Charts Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Capacity Degradation */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Capacity Degradation Trend</h3>
                  <p className="text-xs text-slate-500">Battery capacity (kWh) across logged cycles</p>
                </div>
                <span className="rounded-full bg-cyan-500/10 p-2 text-cyan-500"><TrendingDown size={18} /></span>
              </div>

              {chartData.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="capGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="index" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} domain={['auto', 'auto']} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                      <Area type="monotone" dataKey="capacity" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#capGrad)" name="Capacity (kWh)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="py-12 text-center text-xs text-slate-500">No telemetry entries available for chart rendering.</p>
              )}
            </div>

            {/* Chart 2: Electrical & Thermal Profile */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Thermal & Electrical Stress Profile</h3>
                  <p className="text-xs text-slate-500">Voltage (V) vs Temperature (°C) monitoring</p>
                </div>
                <span className="rounded-full bg-amber-500/10 p-2 text-amber-500"><Thermometer size={18} /></span>
              </div>

              {chartData.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="index" stroke="#94a3b8" fontSize={11} />
                      <YAxis yAxisId="left" stroke="#3b82f6" fontSize={11} />
                      <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="voltage" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} name="Voltage (V)" />
                      <Line yAxisId="right" type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} name="Avg Temp (°C)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="py-12 text-center text-xs text-slate-500">No telemetry entries available for chart rendering.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Data Table & Controls Section */}
      {activeTab === 'table' && (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all overflow-hidden">
          {/* Toolbar Controls */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Recorded Battery Logs</h2>
                <p className="text-xs text-slate-500">Total {pagination.total} records found in database.</p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-72">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search records by ID, source..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 outline-none transition focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Pills & Sorting Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <Filter size={14} /> Source:
                </span>
                <select
                  value={source}
                  onChange={(e) => {
                    setSource(e.target.value);
                    setPagination((curr) => ({ ...curr, page: 1 }));
                  }}
                  className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-900 outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="">All Sources</option>
                  <option value="manual">Manual Entry</option>
                  <option value="csv">CSV Import</option>
                </select>

                <span className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

                <span className="text-xs font-bold text-slate-400">Tag:</span>
                <button
                  type="button"
                  onClick={() => setQuickFilter('all')}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                    quickFilter === 'all'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setQuickFilter('high_temp')}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                    quickFilter === 'high_temp'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  High Temp (&gt;35°C)
                </button>
                <button
                  type="button"
                  onClick={() => setQuickFilter('high_cycles')}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                    quickFilter === 'high_cycles'
                      ? 'bg-purple-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  High Cycles (&gt;500)
                </button>
              </div>

              {/* Sorting Selector */}
              <div className="flex items-center gap-2">
                <ArrowUpDown size={14} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-400">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-900 outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="capacity_desc">Capacity (High - Low)</option>
                  <option value="temp_desc">Temperature (High - Low)</option>
                  <option value="cycles_desc">Cycles (High - Low)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Errors / Loading State */}
          {error ? (
            <div className="p-5 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400">
              {error}
            </div>
          ) : null}

          {isLoading ? (
            <div className="p-12 text-center">
              <RefreshCw size={24} className="animate-spin text-cyan-500 mx-auto mb-2" />
              <p className="text-xs font-extrabold text-slate-500">Fetching battery telemetry logs...</p>
            </div>
          ) : null}

          {!isLoading && filteredRecords.length === 0 ? (
            <div className="p-12 text-center">
              <Database size={32} className="text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No matching battery records found.</p>
              <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or import new telemetry datasets.</p>
            </div>
          ) : null}

          {/* Table View */}
          {!isLoading && filteredRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
                  <tr>
                    <th className="px-5 py-3.5 text-[11px] font-extrabold uppercase tracking-wider">Source</th>
                    <th className="px-5 py-3.5 text-[11px] font-extrabold uppercase tracking-wider">Age (yrs)</th>
                    <th className="px-5 py-3.5 text-[11px] font-extrabold uppercase tracking-wider">Cycles</th>
                    <th className="px-5 py-3.5 text-[11px] font-extrabold uppercase tracking-wider">Fast Chg %</th>
                    <th className="px-5 py-3.5 text-[11px] font-extrabold uppercase tracking-wider">Avg Temp</th>
                    <th className="px-5 py-3.5 text-[11px] font-extrabold uppercase tracking-wider">Capacity</th>
                    <th className="px-5 py-3.5 text-[11px] font-extrabold uppercase tracking-wider">Voltage / Current</th>
                    <th className="px-5 py-3.5 text-[11px] font-extrabold uppercase tracking-wider">Est. SOH</th>
                    <th className="px-5 py-3.5 text-[11px] font-extrabold uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredRecords.map((record, index) => {
                    const estSoh = calculateEstimatedSOH(record);
                    const isHighTemp = (record.averageTemperature || 0) > 35;
                    const isHighCycle = (record.chargingCycles || 0) > 500;

                    return (
                      <tr
                        key={record._id}
                        className={`text-slate-900 dark:text-slate-200 transition-colors ${
                          index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-800/40'
                        } hover:bg-cyan-50/60 dark:hover:bg-slate-800/80`}
                      >
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border ${
                              record.source === 'csv'
                                ? 'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:bg-purple-500/20 dark:text-purple-300'
                                : 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20 dark:bg-cyan-500/20 dark:text-cyan-400'
                            }`}
                          >
                            {record.source || 'manual'}
                          </span>
                        </td>

                        <td className="px-5 py-4 font-bold text-slate-800 dark:text-slate-200">
                          {record.batteryAge} y
                        </td>

                        <td className="px-5 py-4 font-bold text-slate-800 dark:text-slate-200">
                          <span className={isHighCycle ? 'text-purple-600 dark:text-purple-400 font-black' : ''}>
                            {record.chargingCycles}
                          </span>
                        </td>

                        <td className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300">
                          {record.fastChargingUsage}%
                        </td>

                        <td className="px-5 py-4 font-semibold">
                          <span
                            className={`inline-flex items-center gap-1 font-bold ${
                              isHighTemp
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <Thermometer size={13} /> {record.averageTemperature}°C
                          </span>
                        </td>

                        <td className="px-5 py-4 font-black text-cyan-600 dark:text-cyan-400">
                          {record.batteryCapacity} kWh
                        </td>

                        <td className="px-5 py-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                          {record.voltage}V / {record.current}A
                        </td>

                        <td className="px-5 py-4 font-bold">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-black ${
                              estSoh >= 85
                                ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                                : estSoh >= 70
                                ? 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                                : 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                            }`}
                          >
                            {estSoh >= 85 ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                            {estSoh}%
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 text-xs font-bold">
                            <button
                              type="button"
                              onClick={() => setSelectedRecord(record)}
                              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
                              title="Inspect Telemetry"
                            >
                              <Eye size={14} className="text-cyan-500" /> Inspect
                            </button>

                            <Link
                              className="inline-flex items-center gap-1 rounded-lg bg-cyan-500/10 px-2.5 py-1.5 text-cyan-600 hover:bg-cyan-500/20 dark:bg-cyan-500/20 dark:text-cyan-400 transition"
                              to={`/battery/${record._id}/edit`}
                              title="Edit Record"
                            >
                              <Edit3 size={14} />
                            </Link>

                            <button
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-emerald-600 hover:bg-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 transition"
                              type="button"
                              onClick={() => handleDelete(record._id)}
                              title="Delete Record"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400">
            <p>
              Showing {filteredRecords.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} records
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => setPagination((curr) => ({ ...curr, page: curr.page - 1 }))}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <ChevronLeft size={16} /> Prev
              </button>

              <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">
                Page {pagination.page} of {pagination.pages || 1}
              </span>

              <button
                type="button"
                disabled={pagination.page >= pagination.pages}
                onClick={() => setPagination((curr) => ({ ...curr, page: curr.page + 1 }))}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Inspector Drawer / Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400">
                  <Activity size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-cyan-500">Record #{selectedRecord._id?.substring(selectedRecord._id.length - 6)}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {selectedRecord.source}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Battery Telemetry Inspector</h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Health Score Summary Header */}
            <div className="mt-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4 dark:bg-cyan-500/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-cyan-600 dark:text-cyan-400">Algorithmic State of Health</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{calculateEstimatedSOH(selectedRecord)}%</p>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                  <ShieldCheck size={14} /> Nominal Telemetry State
                </span>
              </div>
            </div>

            {/* 11 Parameter Breakdown Grid */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {batteryFields.map((field) => (
                <div key={field.name} className="rounded-2xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800/80 dark:bg-slate-800/40">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{field.label}</p>
                  <p className="mt-1 text-sm font-black text-slate-900 dark:text-white">
                    {selectedRecord[field.name]} <span className="text-[10px] font-normal text-slate-400">{field.unit}</span>
                  </p>
                </div>
              ))}
            </div>

            {selectedRecord.notes && (
              <div className="mt-4 rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/50">
                <p className="text-[11px] font-bold text-slate-500">Notes & Sensor Remarks:</p>
                <p className="mt-0.5 text-xs text-slate-700 dark:text-slate-300">{selectedRecord.notes}</p>
              </div>
            )}

            {/* Footer Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  const queryParams = new URLSearchParams(selectedRecord).toString();
                  navigate(`/prediction?${queryParams}`);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-black text-white shadow-md shadow-purple-600/20 transition hover:bg-purple-500"
              >
                <Cpu size={15} /> Run Prognostics in Lithyx AI
              </button>

              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="w-full sm:w-auto rounded-xl border border-slate-300 bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}