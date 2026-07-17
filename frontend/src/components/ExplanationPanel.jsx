const directionStyles = {
  positive: 'bg-teal-400',
  negative: 'bg-red-400',
};

function FactorList({ title, factors }) {
  return (
    <div className="rounded border border-slate-800 bg-slate-950 p-4">
      <h3 className="font-semibold text-white">{title}</h3>
      {factors?.length ? (
        <ul className="mt-3 space-y-2">
          {factors.map((factor) => (
            <li key={`${factor.feature}-${factor.direction}`} className="text-sm text-slate-300">
              <span className="font-medium text-slate-100">{factor.label}</span>
              <span className="text-slate-500"> · {factor.impact}% impact</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-slate-500">No factors available.</p>
      )}
    </div>
  );
}

export default function ExplanationPanel({ explanation, isLoading, onGenerate }) {
  return (
    <section className="rounded border border-slate-800 bg-slate-900 p-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h2 className="text-lg font-semibold text-white">Explainable AI</h2>
          <p className="mt-1 text-sm text-slate-400">
            {explanation ? `Method: ${explanation.method}` : 'Generate an explanation for the latest prediction.'}
          </p>
        </div>
        <button
          className="rounded bg-teal-500 px-4 py-2 font-semibold text-slate-950 hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-70"
          type="button"
          disabled={isLoading}
          onClick={onGenerate}
        >
          {isLoading ? 'Explaining...' : explanation ? 'Regenerate explanation' : 'Generate explanation'}
        </button>
      </div>

      {explanation ? (
        <div className="mt-5 space-y-5">
          <p className="rounded border border-slate-800 bg-slate-950 p-4 text-sm leading-6 text-slate-200">
            {explanation.plainEnglishExplanation}
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <FactorList title="Top Negative Factors" factors={explanation.topNegativeFactors} />
            <FactorList title="Top Positive Factors" factors={explanation.topPositiveFactors} />
          </div>

          <div>
            <h3 className="mb-3 font-semibold text-white">Feature importance</h3>
            <div className="space-y-3">
              {explanation.featureImportance?.map((feature) => (
                <div key={feature.feature}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-slate-300">{feature.label}</span>
                    <span className="text-slate-500">{feature.impact}%</span>
                  </div>
                  <div className="h-2 rounded bg-slate-800">
                    <div
                      className={`h-2 rounded ${directionStyles[feature.direction]}`}
                      style={{ width: `${Math.min(feature.impact, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
