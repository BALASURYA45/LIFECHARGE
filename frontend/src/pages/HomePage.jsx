const setupItems = [
  'Baseline scenario comparison',
  'Adjustable battery inputs',
  'SOH delta analysis',
  'RUL delta analysis',
  'Scenario insights',
];

export default function HomePage() {
  return (
    <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-teal-300">
          AI-Based EV Battery Health Prediction
        </p>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight text-white md:text-5xl">
          Production-ready foundation for SOH, RUL, XAI, and predictive maintenance.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
          The application now simulates battery health changes before dashboard analytics
          and reports are added.
        </p>
      </div>

      <div className="rounded border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-lg font-semibold text-white">Module 8 Completed Scope</h2>
        <ul className="mt-4 space-y-3">
          {setupItems.map((item) => (
            <li key={item} className="flex items-center gap-3 text-sm text-slate-300">
              <span className="size-2 rounded-full bg-teal-400" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
