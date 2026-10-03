import React, { useState } from 'react';
import { Sliders, Activity, Thermometer, Radio, CircleDot, Square, Save, Flame, BatteryCharging, Car, Zap } from 'lucide-react';

export default function TelematicsControlPanel({
  isConnected = false,
  streamConfig = {},
  onSetDriveMode,
  onSetAmbientTemp,
  onStartRecording,
  onStopRecording,
  lastSavedSession,
}) {
  const [sessionNameInput, setSessionNameInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const driveModes = [
    { key: 'CITY_DRIVING', label: 'City Driving', icon: Car, color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
    { key: 'FAST_CHARGING', label: 'Fast Charge (120kW)', icon: BatteryCharging, color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10' },
    { key: 'HIGH_LOAD', label: 'High Load / Highway', icon: Zap, color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
    { key: 'THERMAL_STRESS', label: 'Extreme Thermal', icon: Flame, color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
  ];

  const handleRecordingToggle = () => {
    if (streamConfig.isRecording) {
      onStopRecording();
    } else {
      setIsModalOpen(true);
    }
  };

  const confirmStartRecording = (e) => {
    e.preventDefault();
    const name = sessionNameInput.trim() || `EV_Trip_${new Date().toISOString().slice(11, 19).replace(/:/g, '')}`;
    onStartRecording(name);
    setSessionNameInput('');
    setIsModalOpen(false);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-md mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
            <Sliders className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Telematics Control & Live Ingestion Engine
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1.5 ${
                isConnected ? 'bg-emerald-950 border border-emerald-700 text-emerald-300' : 'bg-emerald-950 border border-emerald-700 text-emerald-300'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-emerald-400'}`}></span>
                {isConnected ? 'LIVE WS CONNECTED (0.5 Hz)' : 'DISCONNECTED'}
              </span>
            </h3>
            <p className="text-xs text-slate-400">Inject real-time thermal/load scenarios and record telemetry streams</p>
          </div>
        </div>

        {/* Live Recording Button */}
        <div className="flex items-center gap-3">
          {lastSavedSession && (
            <span className="text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-lg flex items-center gap-1 font-mono">
              <Save className="w-3.5 h-3.5" />
              Saved: {lastSavedSession.sessionName}
            </span>
          )}

          <button
            onClick={handleRecordingToggle}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg ${
              streamConfig.isRecording
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse shadow-emerald-900/50'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/40'
            }`}
          >
            {streamConfig.isRecording ? (
              <>
                <Square className="w-4 h-4 fill-white" />
                Stop Recording Telemetry
              </>
            ) : (
              <>
                <CircleDot className="w-4 h-4 text-emerald-300" />
                Record Session Stream
              </>
            )}
          </button>
        </div>
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Drive Mode Selectors */}
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-indigo-400" />
            Vehicle Operational Mode
          </label>
          <div className="grid grid-cols-2 gap-2">
            {driveModes.map((mode) => {
              const Icon = mode.icon;
              const isActive = streamConfig.driveMode === mode.key;
              return (
                <button
                  key={mode.key}
                  onClick={() => onSetDriveMode(mode.key)}
                  className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                    isActive ? `${mode.color} ring-1 ring-white/20 font-bold shadow-md` : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{mode.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Ambient Temperature Slider */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-emerald-400" />
                Ambient Environment Temperature
              </label>
              <span className="text-sm font-mono font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-800">
                {streamConfig.ambientTemp}°C
              </span>
            </div>
            <input
              type="range"
              min="-10"
              max="55"
              step="1"
              value={streamConfig.ambientTemp || 25}
              onChange={(e) => onSetAmbientTemp(e.target.value)}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>-10°C (Winter)</span>
              <span>25°C (Optimal)</span>
              <span>55°C (Extreme Desert)</span>
            </div>
          </div>

          <div className="mt-3 p-2.5 bg-slate-950/50 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              Broadcasting Telemetry Topic:
            </span>
            <span className="font-mono text-cyan-300">/ws/telematics/live</span>
          </div>
        </div>
      </div>

      {/* Modal for entering Session Name */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={confirmStartRecording} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <CircleDot className="w-5 h-5 text-emerald-500" />
              Start Telemetry Recording
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Enter a session name to save all incoming 0.5Hz telemetry frames into MongoDB for digital twin analysis and replay.
            </p>
            <input
              type="text"
              placeholder="e.g. FastCharge_ThermalTest_01"
              value={sessionNameInput}
              onChange={(e) => setSessionNameInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white mb-5 focus:outline-none focus:border-indigo-500 font-mono"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
              >
                Start Recording
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
