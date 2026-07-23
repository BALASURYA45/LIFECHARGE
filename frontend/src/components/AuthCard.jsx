export default function AuthCard({ title, subtitle, children }) {
  return (
    <section className="mx-auto max-w-md rounded-lg border border-cyan-500/20 bg-slate-900/70 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.25)]">
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-cyan-100/90">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}
