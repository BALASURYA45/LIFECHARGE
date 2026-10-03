import React, { useState, useEffect } from 'react';
import { Sliders, Eye, EyeOff, LayoutGrid, RotateCcw, Check } from 'lucide-react';

const DEFAULT_WIDGETS = [
  { id: 'kpi_soh', name: 'Average State of Health (SOH)', enabled: true, category: 'KPI' },
  { id: 'kpi_rul', name: 'Remaining Useful Life (RUL)', enabled: true, category: 'KPI' },
  { id: 'kpi_anomalies', name: 'Anomalies & Thermal Risks', enabled: true, category: 'KPI' },
  { id: 'kpi_fleet', name: 'Active Fleet Vehicles', enabled: true, category: 'KPI' },
  { id: 'chart_soh', name: 'Degradation Trajectory Chart', enabled: true, category: 'Analytics' },
  { id: 'recommendations', name: 'Predictive Charging Recommendations', enabled: true, category: 'Advisory' },
];

export default function CustomizableDashboard({ children, onConfigChange }) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [widgets, setWidgets] = useState(() => {
    const saved = localStorage.getItem('lifecharge_dashboard_widgets');
    return saved ? JSON.parse(saved) : DEFAULT_WIDGETS;
  });

  useEffect(() => {
    localStorage.setItem('lifecharge_dashboard_widgets', JSON.stringify(widgets));
    if (onConfigChange) {
      onConfigChange(widgets);
    }
  }, [widgets, onConfigChange]);

  const toggleWidget = (id) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w))
    );
  };

  const resetWidgets = () => {
    setWidgets(DEFAULT_WIDGETS);
  };

  return (
    <div className="space-y-4">
      {/* Dashboard Configuration Toolbar */}
      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <LayoutGrid className="text-emerald-500" size={18} />
          <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Customizable Fleet Dashboard
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition"
          >
            <Sliders size={14} />
            {isConfigOpen ? 'Close Layout Editor' : 'Customize Widgets'}
          </button>
        </div>
      </div>

      {/* Widget Layout Configuration Panel */}
      {isConfigOpen && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-500/30 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Toggle Visible Metric Cards & Charts
            </h4>
            <button
              onClick={resetWidgets}
              className="text-[11px] font-bold text-emerald-500 hover:underline flex items-center gap-1"
            >
              <RotateCcw size={12} /> Reset to Default
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
            {widgets.map((widget) => (
              <button
                key={widget.id}
                onClick={() => toggleWidget(widget.id)}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition ${
                  widget.enabled
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-400'
                }`}
              >
                <span className="truncate">{widget.name}</span>
                {widget.enabled ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Render children passed down */}
      {typeof children === 'function' ? children({ widgets }) : children}
    </div>
  );
}
