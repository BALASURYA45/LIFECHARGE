export default function AuthCard({ title, subtitle, children }) {
  return (
    <section className="mx-auto max-w-md rounded border border-slate-800 bg-slate-900 p-6">
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-slate-400">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}
