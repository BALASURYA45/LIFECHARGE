import { forwardRef } from 'react';

const FormField = forwardRef(function FormField({ label, error, ...inputProps }, ref) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      <input
        ref={ref}
        className="mt-2 w-full rounded border border-slate-700 bg-slate-950 px-3 py-3 text-slate-100 outline-none transition focus:border-teal-400"
        {...inputProps}
      />
      {error ? <span className="mt-1 block text-sm text-red-300">{error.message}</span> : null}
    </label>
  );
});

export default FormField;
