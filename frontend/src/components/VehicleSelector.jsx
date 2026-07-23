import { Bike, Bus, Car, Truck } from 'lucide-react';
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
    <div className="space-y-5">
      {/* Step 1: Vehicle Category */}
      <div>
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.15em] text-accent-light">
          Step 1: Select Vehicle Type
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
                className={`lc-focus flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition ${
                  isActive
                    ? 'border-accent bg-accent/10 text-accent-light shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-500 hover:bg-slate-900'
                }`}
              >
                <Icon size={28} aria-hidden="true" />
                <span className="text-sm font-bold">{cat.label}</span>
                <span className="text-xs text-slate-500">{cat.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Make */}
      {categoryId ? (
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.15em] text-accent-light">
            Step 2: Select Brand
          </p>
          <select
            className="lc-focus w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 transition focus:border-accent"
            value={make}
            onChange={(e) => handleMakeChange(e.target.value)}
          >
            <option value="">-- Choose your brand --</option>
            {makes.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      ) : null}

      {/* Step 3: Model */}
      {make ? (
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.15em] text-accent-light">
            Step 3: Select Model
          </p>
          <select
            className="lc-focus w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 transition focus:border-accent"
            value={model}
            onChange={(e) => handleModelChange(e.target.value)}
          >
            <option value="">-- Choose your model --</option>
            {models.map((m) => (
              <option key={m.model} value={m.model}>
                {m.model} ({m.yearRange}) — {m.batteryCapacity} kWh, {m.typicalRange} km range
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {/* Vehicle Spec Summary */}
      {selectedSpec ? (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-900/20 p-4">
          <p className="mb-2 text-sm font-bold text-emerald-300">✓ Vehicle Identified</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
            <div>
              <span className="text-slate-500">Battery:</span>{' '}
              <span className="text-slate-200">{selectedSpec.batteryCapacity} kWh</span>
            </div>
            <div>
              <span className="text-slate-500">Range:</span>{' '}
              <span className="text-slate-200">{selectedSpec.typicalRange} km</span>
            </div>
            <div>
              <span className="text-slate-500">Chemistry:</span>{' '}
              <span className="text-slate-200">{selectedSpec.batteryType}</span>
            </div>
            <div>
              <span className="text-slate-500">Warranty:</span>{' '}
              <span className="text-slate-200">{selectedSpec.warrantyYears} yrs / {selectedSpec.warrantyKm.toLocaleString('en-IN')} km</span>
            </div>
            <div>
              <span className="text-slate-500">Expected Life:</span>{' '}
              <span className="text-slate-200">{selectedSpec.estimatedLifeYears} years</span>
            </div>
            <div>
              <span className="text-slate-500">Cycle Life:</span>{' '}
              <span className="text-slate-200">{selectedSpec.expectedCycles.toLocaleString('en-IN')} cycles</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}