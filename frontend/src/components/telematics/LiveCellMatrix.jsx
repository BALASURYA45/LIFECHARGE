import React, { useState } from 'react';
import { Zap, AlertTriangle, ShieldCheck, Cpu, Flame, RefreshCw, Thermometer, Layers } from 'lucide-react';

export default function LiveCellMatrix({ cellVoltages = [], hotspotCellIndex = 42, deltaV = 0.04, onSelectHotspot }) {
  const [selectedCell, setSelectedCell] = useState(null);
  const [viewMode, setViewMode] = useState('voltage'); // 'voltage' | 'thermal' | 'resistance'
  const [isBalancing, setIsBalancing] = useState(false);
  const [balancedVoltages, setBalancedVoltages] = useState(null);

  // Generate fallback 96-cell array if stream data is absent
  const rawVoltages = (cellVoltages && cellVoltages.length >= 96)
    ? cellVoltages
    : Array.from({ length: 96 }, (_, i) => {
        const noise = Math.sin(i * 0.4) * 0.05 + (i % 7) * 0.01;
        const v = 3.78 + noise;
        if (i === hotspotCellIndex - 1) return 3.48; // thermal hotspot cell drop
        return Number(v.toFixed(3));
      });

  const displayVoltages = balancedVoltages || rawVoltages;

  // Calculate cell stats
  const minVoltage = Math.min(...displayVoltages);
  const maxVoltage = Math.max(...displayVoltages);
  const avgVoltage = (displayVoltages.reduce((a, b) => a + b, 0) / displayVoltages.length).toFixed(3);
  const activeDeltaV = (maxVoltage - minVoltage).toFixed(3);

  // Calculate simulated temperature (°C) & internal resistance (mΩ) per cell
  const getCellMetrics = (voltage, index) => {
    const isHotspot = index + 1 === hotspotCellIndex;
    const tempC = isHotspot ? 48.5 : Number((25 + (3.95 - voltage) * 45).toFixed(1));
    const resistanceMohm = isHotspot ? 14.8 : Number((4.2 + (3.90 - voltage) * 12).toFixed(2));
    return { tempC, resistanceMohm, isHotspot };
  };

  const getCellBgColor = (voltage, index) => {
    const { tempC, isHotspot } = getCellMetrics(voltage, index);

    if (isHotspot) {
      return 'bg-rose-600 text-white shadow-lg shadow-rose-900/60 animate-pulse border-2 border-rose-300';
    }

    if (viewMode === 'thermal') {
      if (tempC > 40) return 'bg-rose-500 text-white border border-rose-300 font-bold';
      if (tempC > 30) return 'bg-amber-500 text-slate-950 border border-amber-300 font-bold';
      return 'bg-emerald-600/90 text-emerald-100 border border-emerald-500/40';
    }

    if (viewMode === 'resistance') {
      const { resistanceMohm } = getCellMetrics(voltage, index);
      if (resistanceMohm > 10) return 'bg-purple-600 text-white border border-purple-400 font-bold';
      if (resistanceMohm > 6) return 'bg-indigo-600 text-white border border-indigo-400 font-bold';
      return 'bg-teal-600/90 text-teal-100 border border-teal-500/40';
    }

    // Default Voltage View
    if (voltage < 3.55) return 'bg-amber-600 text-white border border-amber-400 font-bold';
    if (voltage > 3.88) return 'bg-emerald-500 text-slate-950 font-bold border border-emerald-300';
    return 'bg-emerald-600/90 text-emerald-100 border border-emerald-500/40 hover:bg-emerald-500';
  };

  const handleRunBmsBalancing = () => {
    setIsBalancing(true);
    setTimeout(() => {
      const avg = Number(avgVoltage);
      const equalized = displayVoltages.map(() => Number((avg + (Math.random() * 0.006 - 0.003)).toFixed(3)));
      setBalancedVoltages(equalized);
      setIsBalancing(false);
    }, 1200);
  };

  const handleResetBalancing = () => {
    setBalancedVoltages(null);
  };

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
            <Zap className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              96-Cell Live Telematics Matrix Inspector
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300 font-mono font-bold">
                12S8P Pack Architecture
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Click any cell module to inspect individual voltage, thermal hotspot telemetry, and internal resistance ($R_{`{int}`}$)
            </p>
          </div>
        </div>

        {/* Mode Toggle Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('voltage')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'voltage' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap size={13} /> Voltage (V)
            </button>
            <button
              onClick={() => setViewMode('thermal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'thermal' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame size={13} /> Thermal (°C)
            </button>
            <button
              onClick={() => setViewMode('resistance')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'resistance' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers size={13} /> Resistance ($R_{`{int}`}$)
            </button>
          </div>

          <button
            onClick={balancedVoltages ? handleResetBalancing : handleRunBmsBalancing}
            disabled={isBalancing}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 text-white shadow-md ${
              balancedVoltages
                ? 'bg-slate-700 hover:bg-slate-600'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500'
            }`}
          >
            <RefreshCw size={13} className={isBalancing ? 'animate-spin' : ''} />
            {isBalancing ? 'Balancing BMS Cells...' : balancedVoltages ? 'Reset BMS Equalization' : 'Run Passive BMS Balancing'}
          </button>
        </div>
      </div>

      {/* Summary Telemetry Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-slate-300 flex justify-between items-center">
          <span className="text-slate-500 text-[10px] uppercase font-bold">Minimum Voltage:</span>
          <span className="text-amber-400 font-black text-sm">{minVoltage.toFixed(3)} V</span>
        </div>
        <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-slate-300 flex justify-between items-center">
          <span className="text-slate-500 text-[10px] uppercase font-bold">Pack Average:</span>
          <span className="text-emerald-400 font-black text-sm">{avgVoltage} V</span>
        </div>
        <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-slate-300 flex justify-between items-center">
          <span className="text-slate-500 text-[10px] uppercase font-bold">Maximum Voltage:</span>
          <span className="text-cyan-400 font-black text-sm">{maxVoltage.toFixed(3)} V</span>
        </div>
        <div className={`p-3 rounded-2xl border flex justify-between items-center font-bold ${
          Number(activeDeltaV) > 0.05 ? 'bg-rose-950/60 border-rose-800 text-rose-300' : 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
        }`}>
          <span className="text-[10px] uppercase font-bold flex items-center gap-1">
            {Number(activeDeltaV) > 0.05 ? <AlertTriangle size={13} className="text-rose-400" /> : <ShieldCheck size={13} className="text-emerald-400" />}
            Imbalance (ΔV):
          </span>
          <span className="font-black text-sm">{activeDeltaV} V</span>
        </div>
      </div>

      {/* 96-Cell Grid Layout */}
      <div className="grid grid-cols-8 sm:grid-cols-12 gap-1.5">
        {displayVoltages.map((voltage, index) => {
          const cellNumber = index + 1;
          const { tempC, resistanceMohm, isHotspot } = getCellMetrics(voltage, index);
          const isSelected = selectedCell === cellNumber;

          return (
            <button
              key={index}
              onClick={() => setSelectedCell(cellNumber)}
              className={`p-2 rounded-xl text-center transition-all duration-200 relative text-[10px] font-mono cursor-pointer ${getCellBgColor(
                voltage,
                index
              )} ${isSelected ? 'ring-2 ring-white scale-110 z-20 shadow-xl' : 'hover:scale-105'}`}
              title={`Cell #${cellNumber}: ${voltage}V | ${tempC}°C | ${resistanceMohm}mΩ`}
            >
              <div className="font-bold opacity-75 text-[9px]">#{cellNumber}</div>
              <div className="text-[11px] font-black tracking-tight">
                {viewMode === 'thermal'
                  ? `${tempC.toFixed(0)}°C`
                  : viewMode === 'resistance'
                  ? `${resistanceMohm.toFixed(1)}mΩ`
                  : `${voltage.toFixed(2)}V`}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Cell Drill-down Drawer */}
      {selectedCell && (
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs animate-fade-in">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-white font-mono font-bold text-sm">Cell Module #{selectedCell} Metrics:</span>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 font-bold">
                Voltage: {displayVoltages[selectedCell - 1]} V
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-rose-400 font-bold">
                Temp: {getCellMetrics(displayVoltages[selectedCell - 1], selectedCell - 1).tempC}°C
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-purple-400 font-bold">
                $R_{`{int}`}$: {getCellMetrics(displayVoltages[selectedCell - 1], selectedCell - 1).resistanceMohm} mΩ
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (onSelectHotspot) onSelectHotspot(selectedCell - 1);
              }}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
            >
              <AlertTriangle size={13} />
              Set Cell #{selectedCell} Hotspot
            </button>
            <button
              onClick={() => setSelectedCell(null)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

