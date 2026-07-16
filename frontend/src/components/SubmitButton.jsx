export default function SubmitButton({ children, isLoading }) {
  return (
    <button
      className="w-full rounded bg-teal-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-70"
      type="submit"
      disabled={isLoading}
    >
      {isLoading ? 'Please wait...' : children}
    </button>
  );
}
