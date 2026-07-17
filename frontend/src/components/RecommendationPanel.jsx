const priorityStyles = {
  High: 'border-red-700 bg-red-950 text-red-100',
  Medium: 'border-amber-700 bg-amber-950 text-amber-100',
  Low: 'border-teal-700 bg-teal-950 text-teal-100',
};

export default function RecommendationPanel({ recommendations, isLoading, onGenerate }) {
  return (
    <section className="rounded border border-slate-800 bg-slate-900 p-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h2 className="text-lg font-semibold text-white">Recommendations</h2>
          <p className="mt-1 text-sm text-slate-400">
            {recommendations?.summary ?? 'Generate actions to improve battery lifespan.'}
          </p>
        </div>
        <button
          className="rounded bg-teal-500 px-4 py-2 font-semibold text-slate-950 hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-70"
          type="button"
          disabled={isLoading}
          onClick={onGenerate}
        >
          {isLoading ? 'Generating...' : recommendations ? 'Regenerate' : 'Generate'}
        </button>
      </div>

      {recommendations?.items?.length ? (
        <div className="mt-5 space-y-3">
          {recommendations.items.map((item) => (
            <article key={`${item.title}-${item.category}`} className="rounded border border-slate-800 bg-slate-950 p-4">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <h3 className="font-semibold text-white">{item.title}</h3>
                <span className={`w-fit rounded border px-2 py-1 text-xs font-semibold ${priorityStyles[item.priority]}`}>
                  {item.priority}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
              <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">{item.category}</p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
