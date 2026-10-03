import { Loader2 } from 'lucide-react';

export default function SubmitButton({ children, isLoading }) {
  return (
    <button
      className="lc-focus flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-3 font-bold text-white shadow-lg shadow-red-950/40 transition hover:from-red-500 hover:to-rose-500 disabled:cursor-not-allowed disabled:opacity-70"
      type="submit"
      disabled={isLoading}
    >
      {isLoading ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : null}
      {isLoading ? 'Running check...' : children}
    </button>
  );
}
