import { Loader2 } from 'lucide-react';

export default function SubmitButton({ children, isLoading }) {
  return (
    <button
      className="lc-focus flex w-full items-center justify-center gap-2 rounded bg-cyan-300 px-4 py-3 font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
      type="submit"
      disabled={isLoading}
    >
      {isLoading ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : null}
      {isLoading ? 'Running check...' : children}
    </button>
  );
}
