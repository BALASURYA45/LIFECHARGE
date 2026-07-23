import { ClipboardCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { batteryFields, defaultBatteryValues } from '../constants/batteryFields.js';
import SubmitButton from './SubmitButton.jsx';

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
      <div className="grid gap-4 md:grid-cols-2">
        {batteryFields.map((field) => (
          <label key={field.name} className="block">
            <span className="flex items-center justify-between text-sm font-medium text-slate-200">
              {field.label}
              <span className="text-xs text-slate-500">{field.unit}</span>
            </span>
            <input
              className="lc-focus mt-2 w-full rounded border border-slate-700 bg-slate-950 px-3 py-3 text-slate-100 transition placeholder:text-slate-600 focus:border-cyan-300"
              type="number"
              min={field.min}
              max={field.max}
              step={field.step}
              {...register(field.name, {
                required: `${field.label} is required`,
                min: { value: field.min, message: `Minimum value is ${field.min}` },
                max: { value: field.max, message: `Maximum value is ${field.max}` },
              })}
            />
            {errors[field.name] ? <span className="mt-1 block text-sm text-red-300">{errors[field.name].message}</span> : null}
          </label>
        ))}
      </div>
      <label className="block">
        <span className="text-sm font-medium text-slate-200">Vehicle or service notes</span>
        <textarea
          className="lc-focus mt-2 min-h-28 w-full rounded border border-slate-700 bg-slate-950 px-3 py-3 text-slate-100 transition placeholder:text-slate-600 focus:border-cyan-300"
          maxLength={500}
          placeholder="Optional: driving pattern, recent service, charging behavior, or symptoms."
          {...register('notes')}
        />
      </label>
      <SubmitButton isLoading={isSubmitting || isLoading}>
        <span className="inline-flex items-center gap-2">
          <ClipboardCheck size={18} aria-hidden="true" />
          Run Battery Health Check
        </span>
      </SubmitButton>
    </form>
  );
}
