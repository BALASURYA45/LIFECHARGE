import { BatteryCharging, ClipboardCheck, Gauge, Thermometer, Zap } from 'lucide-react';
import { useState } from 'react';
import { getVehicleSpec, getVehicleTypeCode } from '../constants/vehicleDatabase.js';
import VehicleSelector from './VehicleSelector.jsx';
import SubmitButton from './SubmitButton.jsx';

/**
 * SimpleBatteryForm - A user-friendly form for EV battery health check.
 * Instead of asking technical terms, it asks simple questions any EV user can answer.
 */
export default function SimpleBatteryForm({ defaultValues, isLoading, onSubmit }) {
  const [step, setStep] = useState(1); // 1: vehicle, 2: usage, 3: review
  const [vehicle, setVehicle] = useState({
    categoryId: defaultValues?.categoryId ?? '',
    make: defaultValues?.make ?? '',
    model: defaultValues?.model ?? '',
  });
  const [usage, setUsage] = useState({
    vehicleAge: defaultValues?.vehicleAge ?? '',
    totalKmDriven: defaultValues?.totalKmDriven ?? '',
    dailyDistance: defaultValues?.dailyDistance ?? '',
    chargingFrequency: defaultValues?.chargingFrequency ?? '',
    fastChargePercent: defaultValues?.fastChargePercent ?? '',
    avgTemperature: defaultValues?.avgTemperature ?? '',
    chargingDuration: defaultValues?.chargingDuration ?? '',
    socAtEndOfDay: defaultValues?.socAtEndOfDay ?? '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedSpec = vehicle.categoryId && vehicle.make && vehicle.model
    ? getVehicleSpec(vehicle.categoryId, vehicle.make, vehicle.model)
    : null;

  function updateUsage(field, value) {
    setUsage((prev) => ({ ...prev, [field]: value }));
  }

  function buildPayload() {
    if (!selectedSpec) return null;

    const age = Number(usage.vehicleAge) || 0;
    const totalKm = Number(usage.totalKmDriven) || 0;
    const dailyKm = Number(usage.dailyDistance) || 0;
    const chargeFreq = Number(usage.chargingFrequency) || 0;
    const fastCharge = Number(usage.fastChargePercent) || 0;
    const temp = Number(usage.avgTemperature) || 25;
    const chargeDur = Number(usage.chargingDuration) || 0;
    const socEnd = Number(usage.socAtEndOfDay) || 50;

    // Estimate charging cycles from km driven and range
    const estimatedCycles = totalKm > 0 && selectedSpec.typicalRange > 0
      ? Math.round(totalKm / selectedSpec.typicalRange)
      : 0;

    // Determine vehicle type one-hot encoding
    const isTwoWheeler = vehicle.categoryId === 'two_wheeler' ? 1 : 0;
    const isThreeWheeler = vehicle.categoryId === 'three_wheeler' ? 1 : 0;
    const isFourWheeler = vehicle.categoryId === 'four_wheeler' ? 1 : 0;
    const isBus = vehicle.categoryId === 'bus_heavy' ? 1 : 0;

    // Determine chemistry one-hot encoding
    const batteryType = (selectedSpec.batteryType || '').toLowerCase();
    const isLfp = (batteryType.includes('lfp') || batteryType.includes('lithium iron')) ? 1 : 0;
    const isNmc = (batteryType.includes('nmc') || batteryType.includes('nickel')) ? 1 : 0;
    const isLeadAcid = (batteryType.includes('lead acid') || batteryType.includes('lead-acid')) ? 1 : 0;

    return {
      // Vehicle identification (for display & storage)
      vehicleCategory: vehicle.categoryId,
      vehicleMake: vehicle.make,
      vehicleModel: vehicle.model,
      vehicleType: getVehicleTypeCode(vehicle.categoryId),

      // Core battery specs (from database)
      batteryCapacity: selectedSpec.batteryCapacity,
      voltage: selectedSpec.voltage,
      expectedCycles: selectedSpec.expectedCycles,
      typicalRange: selectedSpec.typicalRange,

      // User-provided usage data
      batteryAge: age,
      totalKmDriven: totalKm,
      dailyDistance: dailyKm,
      chargingCycles: estimatedCycles,
      chargingFrequency: chargeFreq,
      fastChargingUsage: fastCharge,
      averageTemperature: temp,
      chargingDuration: chargeDur,
      socHistory: socEnd,

      // Vehicle-type one-hot encoding for ML model
      is_two_wheeler: isTwoWheeler,
      is_three_wheeler: isThreeWheeler,
      is_four_wheeler: isFourWheeler,
      is_bus: isBus,

      // Chemistry one-hot encoding for ML model
      is_chemistry_lfp: isLfp,
      is_chemistry_nmc: isNmc,
      is_chemistry_lead_acid: isLeadAcid,
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const payload = buildPayload();
    if (!payload) return;
    setIsSubmitting(true);
    try {
      await onSubmit(payload);
    } finally {
      setIsSubmitting(false);
    }
  }

  function canProceedToStep2() {
    return vehicle.categoryId && vehicle.make && vehicle.model;
  }

  function canProceedToStep3() {
    return (
      usage.vehicleAge !== '' &&
      usage.totalKmDriven !== '' &&
      usage.dailyDistance !== '' &&
      usage.chargingFrequency !== '' &&
      usage.fastChargePercent !== ''
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* Progress Steps */}
      <div className="flex items-center gap-2 text-sm">
        {[
          { num: 1, label: 'Your Vehicle' },
          { num: 2, label: 'Usage Details' },
          { num: 3, label: 'Review & Check' },
        ].map((s) => (
          <button
            key={s.num}
            type="button"
            onClick={() => {
              if (s.num === 2 && !canProceedToStep2()) return;
              if (s.num === 3 && !canProceedToStep3()) return;
              setStep(s.num);
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 transition ${
              step === s.num
                ? 'bg-accent/20 text-accent-light font-bold'
                : (s.num === 2 && !canProceedToStep2()) || (s.num === 3 && !canProceedToStep3())
                  ? 'text-slate-600 cursor-not-allowed'
                  : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className={`grid size-6 place-items-center rounded-full text-xs font-bold ${
              step === s.num ? 'bg-accent text-slate-950' : 'bg-slate-700 text-slate-300'
            }`}>
              {s.num}
            </span>
            {s.label}
          </button>
        ))}
      </div>

      {/* Step 1: Vehicle Selection */}
      {step === 1 ? (
        <div className="rounded-lg border border-cyan-500/15 bg-slate-900/80 p-4 sm:p-6">
          <VehicleSelector value={vehicle} onChange={setVehicle} />
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              disabled={!canProceedToStep2()}
              onClick={() => setStep(2)}
              className="lc-focus rounded-lg bg-accent px-6 py-3 font-bold text-slate-950 hover:bg-accent-light transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next: Usage Details →
            </button>
          </div>
        </div>
      ) : null}

      {/* Step 2: Simple Usage Questions */}
      {step === 2 ? (
        <div className="rounded-lg border border-cyan-500/15 bg-slate-900/80 p-4 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-lg border border-accent/30 bg-accent/10 text-accent-light">
              <Gauge size={22} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-black text-white">How do you use your EV?</h2>
              <p className="text-sm text-slate-300">Answer these simple questions about your driving & charging habits</p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <SimpleField
              icon={BatteryCharging}
              label="How old is your vehicle's battery?"
              hint="Approximate age since first use"
              unit="years"
              value={usage.vehicleAge}
              onChange={(v) => updateUsage('vehicleAge', v)}
              min={0}
              max={30}
              step={0.5}
            />
            <SimpleField
              icon={Gauge}
              label="Total kilometers driven (ODO)"
              hint="Approximate total distance covered"
              unit="km"
              value={usage.totalKmDriven}
              onChange={(v) => updateUsage('totalKmDriven', v)}
              min={0}
              max={500000}
              step={100}
            />
            <SimpleField
              icon={Gauge}
              label="How many km do you drive daily?"
              hint="Average per day"
              unit="km/day"
              value={usage.dailyDistance}
              onChange={(v) => updateUsage('dailyDistance', v)}
              min={0}
              max={500}
              step={1}
            />
            <SimpleField
              icon={Zap}
              label="How many times do you charge per week?"
              hint="Including both home & public charging"
              unit="times/week"
              value={usage.chargingFrequency}
              onChange={(v) => updateUsage('chargingFrequency', v)}
              min={0}
              max={20}
              step={1}
            />
            <SimpleField
              icon={Zap}
              label="How often do you use fast charging?"
              hint="Percentage of charges at DC fast chargers"
              unit="%"
              value={usage.fastChargePercent}
              onChange={(v) => updateUsage('fastChargePercent', v)}
              min={0}
              max={100}
              step={5}
            />
            <SimpleField
              icon={Thermometer}
              label="Average temperature in your city"
              hint="Typical ambient temperature where you ride/drive"
              unit="°C"
              value={usage.avgTemperature}
              onChange={(v) => updateUsage('avgTemperature', v)}
              min={-10}
              max={60}
              step={1}
            />
            <SimpleField
              icon={BatteryCharging}
              label="Average charging duration"
              hint="How long does a full charge take?"
              unit="hours"
              value={usage.chargingDuration}
              onChange={(v) => updateUsage('chargingDuration', v)}
              min={0}
              max={24}
              step={0.5}
            />
            <SimpleField
              icon={BatteryCharging}
              label="Battery level at end of day"
              hint="Typical SOC % when you park for the day"
              unit="%"
              value={usage.socAtEndOfDay}
              onChange={(v) => updateUsage('socAtEndOfDay', v)}
              min={0}
              max={100}
              step={5}
            />
          </div>

          <div className="mt-6 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="lc-focus rounded-lg border border-slate-700 px-6 py-3 font-bold text-slate-300 hover:border-slate-500 transition"
            >
              ← Back
            </button>
            <button
              type="button"
              disabled={!canProceedToStep3()}
              onClick={() => setStep(3)}
              className="lc-focus rounded-lg bg-accent px-6 py-3 font-bold text-slate-950 hover:bg-accent-light transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next: Review →
            </button>
          </div>
        </div>
      ) : null}

      {/* Step 3: Review & Submit */}
      {step === 3 && selectedSpec ? (
        <div className="rounded-lg border border-cyan-500/15 bg-slate-900/80 p-4 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-lg border border-accent/30 bg-accent/10 text-accent-light">
              <ClipboardCheck size={22} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-black text-white">Review & Run Health Check</h2>
              <p className="text-sm text-slate-300">Please verify your details before running the battery health check</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-accent-light">Vehicle</p>
              <p className="mt-2 text-white font-bold">{vehicle.make} {vehicle.model}</p>
              <p className="text-sm text-slate-400">{selectedSpec.batteryCapacity} kWh • {selectedSpec.typicalRange} km range • {selectedSpec.batteryType}</p>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-accent-light">Battery Age</p>
              <p className="mt-2 text-white font-bold">{usage.vehicleAge || 0} years</p>
              <p className="text-sm text-slate-400">Expected life: {selectedSpec.estimatedLifeYears} years</p>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-accent-light">Usage</p>
              <p className="mt-2 text-white font-bold">{Number(usage.totalKmDriven || 0).toLocaleString('en-IN')} km total</p>
              <p className="text-sm text-slate-400">{usage.dailyDistance || 0} km/day • {usage.chargingFrequency || 0} charges/week</p>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-accent-light">Charging</p>
              <p className="mt-2 text-white font-bold">{usage.fastChargePercent || 0}% fast charging</p>
              <p className="text-sm text-slate-400">{usage.chargingDuration || 0} hrs/charge • End-of-day SOC: {usage.socAtEndOfDay || 50}%</p>
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="lc-focus rounded-lg border border-slate-700 px-6 py-3 font-bold text-slate-300 hover:border-slate-500 transition"
            >
              ← Edit Details
            </button>
            <SubmitButton isLoading={isSubmitting || isLoading}>
              <span className="inline-flex items-center gap-2">
                <ClipboardCheck size={18} aria-hidden="true" />
                Run Battery Health Check
              </span>
            </SubmitButton>
          </div>
        </div>
      ) : null}
    </form>
  );
}

function SimpleField({ icon: Icon, label, hint, unit, value, onChange, min, max, step }) {
  return (
    <label className="block">
      <span className="flex items-center gap-2 text-sm font-medium text-slate-200">
        {Icon ? <Icon size={16} className="text-accent-light shrink-0" aria-hidden="true" /> : null}
        {label}
      </span>
      {hint ? <span className="mt-0.5 block text-xs text-slate-500">{hint}</span> : null}
      <div className="mt-1.5 flex items-center gap-2">
        <input
          className="lc-focus w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 transition placeholder:text-slate-600 focus:border-accent"
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
        />
        <span className="shrink-0 text-xs font-medium text-slate-500 w-14">{unit}</span>
      </div>
    </label>
  );
}