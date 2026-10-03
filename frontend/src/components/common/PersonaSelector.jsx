import React from 'react';
import { User, Truck, Wrench } from 'lucide-react';

export default function PersonaSelector({ activePersona, onSelectPersona }) {
  const personas = [
    {
      id: 'DRIVER',
      label: 'EV Owner View',
      description: 'Range Loss, Financial Valuation & Smart Charging',
      icon: User,
      color: 'teal',
    },
    {
      id: 'FLEET',
      label: 'Fleet Manager View',
      description: 'Multi-Vehicle Matrix, Route Matching & TCO',
      icon: Truck,
      color: 'indigo',
    },
    {
      id: 'TECHNICIAN',
      label: 'Technician Diagnostics',
      description: 'Cell Imbalance, SEI Growth & Fault Codes',
      icon: Wrench,
      color: 'purple',
    },
  ];

  return (
    <div className="bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-2">
      {personas.map((p) => {
        const Icon = p.icon;
        const isActive = activePersona === p.id;
        return (
          <button
            key={p.id}
            onClick={() => onSelectPersona(p.id)}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
              isActive
                ? 'bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white shadow-md border border-teal-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <div
              className={`p-2.5 rounded-xl ${
                isActive
                  ? 'bg-teal-500 text-white shadow-sm'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              <Icon size={18} />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">{p.label}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5">
                {p.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
