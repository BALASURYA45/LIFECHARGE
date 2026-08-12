import { ClipboardCheck, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { batteryFields, defaultBatteryValues } from '../constants/batteryFields.js';

function toPayload(values) {
  return {
    ...Object.fromEntries(batteryFields.map((field) => [field.name, Number(values[field.name])])),
    notes: values.notes ?? '',
  };
}

export default function BatteryDataForm({ defaultValues, isLoading, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      ...defaultBatteryValues,
      notes: '',
      ...defaultValues,
    },
  });

  return (
    <form className="space-y-6" onSubmit={handleSubmit((values) => onSubmit(toPayload(values)))}>
      <div className="grid gap-5 sm:grid-cols-2">
        {batteryFields.map((field, index) => (
          <div
            key={field.name}
            className={`space-y-2 p-4 rounded-2xl border transition-all ${
              index % 2 === 0
                ? 'border-slate-200 bg-slate-50/90 dark:border-slate-800/80 dark:bg-slate-800/40'
                : 'border-slate-200 bg-slate-100/80 dark:border-slate-800 dark:bg-slate-800/70'
            }`}
          >
            <div className="flex items-center justify-between">
              <label htmlFor={field.name} className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {field.label}
              </label>
              {field.unit ? (
                <span className="rounded-full border border-cyan-200 bg-cyan-50/80 px-2.5 py-0.5 text-[11px] font-bold text-cyan-700 dark:border-cyan-500/20 dark:bg-slate-800 dark:text-cyan-400">
                  {field.unit}
                </span>
              ) : null}
            </div>

            <input
              id={field.name}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-cyan-400"
              type="number"
              min={field.min}
              max={field.max}
              step={field.step}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              {...register(field.name, {
                required: `${field.label} is required`,
                min: { value: field.min, message: `Minimum value is ${field.min}` },
                max: { value: field.max, message: `Maximum value is ${field.max}` },
              })}
            />

            {errors[field.name] ? (
              <p className="text-xs font-semibold text-red-500 dark:text-red-400">{errors[field.name].message}</p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="space-y-2 pt-2">
        <label htmlFor="notes" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Vehicle or Service Notes <span className="text-[10px] lowercase font-normal text-slate-400">(Optional)</span>
        </label>
        <textarea
          id="notes"
          className="min-h-28 w-full rounded-xl border border-slate-300 bg-slate-50/60 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-cyan-400 dark:focus:bg-slate-900"
          maxLength={500}
          placeholder="e.g. Daily city driving pattern, recent fast-charge session, or battery symptoms."
          {...register('notes')}
        />
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="lc-focus inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-cyan-600/20 transition-all hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
        >
          <ClipboardCheck size={18} />
          {isSubmitting || isLoading ? 'Processing Battery Profile...' : 'Save & Run Health Check'}
        </button>
      </div>
    </form>
  );
}
