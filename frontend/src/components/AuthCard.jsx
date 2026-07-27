export default function AuthCard({ title, subtitle, children }) {
  return (
    <section className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white/90 p-6 sm:p-8 shadow-card backdrop-blur-xl">
      <div className="mb-6 flex items-center gap-3">
        <div className="grid size-11 place-items-center rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-900/20">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-5">
            <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="mt-2">{children}</div>
    </section>
  );
}
