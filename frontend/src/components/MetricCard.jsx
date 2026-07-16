export default function MetricCard({ label, value }) {
  return (
    <article className="rounded border border-slate-800 bg-slate-950 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value ?? '-'}</p>
    </article>
  );
}
