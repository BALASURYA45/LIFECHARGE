import { Bike, Bus, Car, Truck, CheckCircle2 } from 'lucide-react';
import { vehicleCategories, getMakesForCategory, getModelsForMake, getVehicleSpec } from '../constants/vehicleDatabase.js';

const categoryIcons = {
  two_wheeler: Bike,
  three_wheeler: Truck,
  four_wheeler: Car,
  bus_heavy: Bus,
};

export default function VehicleSelector({ value, onChange }) {
  const { categoryId, make, model } = value;

  const makes = categoryId ? getMakesForCategory(categoryId) : [];
  const models = categoryId && make ? getModelsForMake(categoryId, make) : [];
  const selectedSpec = categoryId && make && model ? getVehicleSpec(categoryId, make, model) : null;

  function handleCategoryChange(newCategoryId) {
    onChange({ categoryId: newCategoryId, make: '', model: '' });
  }

  function handleMakeChange(newMake) {
    onChange({ categoryId, make: newMake, model: '' });
  }

  function handleModelChange(newModel) {
    onChange({ categoryId, make, model: newModel });
  }

  return (
    <div className="space-y-6">
      {/* Step 1: Vehicle Category */}
      <div>
        <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <span>STEP 1: SELECT VEHICLE TYPE</span>
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {vehicleCategories.map((cat) => {
            const Icon = categoryIcons[cat.id];
            const isActive = categoryId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={`lc-focus flex flex-col items-center justify-between gap-2.5 rounded-2xl border p-4 text-center transition-all duration-200 ${
                  isActive
                    ? 'border-2 border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-md shadow-emerald-950/20 scale-[1.02]'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <div className={`p-2.5 rounded-xl transition ${isActive ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-sm' : 'bg-slate-200/60 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300'}`}>
                  <Icon size={24} aria-hidden="true" />
                </div>
                <div>
                  <span className="text-xs font-extrabold block text-slate-900 dark:text-white">{cat.label}</span>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 block leading-tight">{cat.description}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Make Dropdown */}
      {categoryId ? (
        <div className="animate-in fade-in duration-200">
          <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
            STEP 2: SELECT BRAND / MANUFACTURER
          </p>
          <select
            className="lc-focus w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-xs font-bold text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-emerald-400"
            value={make}
            onChange={(e) => handleMakeChange(e.target.value)}
          >
            <option value="">-- Choose your brand --</option>
            {makes.map((m) => (
              <option key={m} value={m} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold">
                {m}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {/* Step 3: Model Dropdown */}
      {make ? (
        <div className="animate-in fade-in duration-200">
          <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
            STEP 3: SELECT SPECIFIC MODEL
          </p>
          <select
            className="lc-focus w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-xs font-bold text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-emerald-400"
            value={model}
            onChange={(e) => handleModelChange(e.target.value)}
          >
            <option value="">-- Choose your vehicle model --</option>
            {models.map((m) => (
              <option key={m.model} value={m.model} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold">
                {m.model} ({m.yearRange}) — {m.batteryCapacity} kWh, {m.typicalRange} km range
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {/* Vehicle Spec Summary Card */}
      {selectedSpec ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 dark:border-slate-800 dark:bg-slate-800/80 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 mb-3 border-b border-emerald-500/10 pb-2.5 dark:border-slate-700">
            <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
            <p className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Vehicle Parameters Identified: <span className="text-emerald-600 dark:text-emerald-400 font-mono">{make} {model}</span>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs sm:grid-cols-3">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Pack Capacity:</span>{' '}
              <span className="font-bold text-slate-900 dark:text-white">{selectedSpec.batteryCapacity} kWh</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Typical Range:</span>{' '}
              <span className="font-bold text-slate-900 dark:text-white">{selectedSpec.typicalRange} km</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Battery Type:</span>{' '}
              <span className="font-bold text-slate-900 dark:text-white">{selectedSpec.batteryType}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Warranty:</span>{' '}
              <span className="font-bold text-slate-900 dark:text-white">{selectedSpec.warrantyYears} yrs / {selectedSpec.warrantyKm.toLocaleString('en-IN')} km</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Expected Life:</span>{' '}
              <span className="font-bold text-slate-900 dark:text-white">{selectedSpec.estimatedLifeYears} years</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Cycle Baseline:</span>{' '}
              <span className="font-bold text-slate-900 dark:text-white">{selectedSpec.expectedCycles.toLocaleString('en-IN')} cycles</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}