import { BatteryCharging, Database, ShieldCheck, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <section>
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-300">Protected dashboard</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Welcome, {user?.name}</h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          Authentication is active. Battery dataset management is ready, and predictions, XAI charts, recommendations, and reports will attach to this secure user workspace in later modules.
        </p>
        <Link className="mt-5 inline-block rounded bg-teal-500 px-4 py-3 font-semibold text-slate-950 hover:bg-teal-400" to="/battery">
          Manage battery data
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ['Account secured', ShieldCheck],
          ['User workspace', UserRound],
          ['Dataset management', Database],
          ['Battery modules ready', BatteryCharging],
        ].map(([label, Icon]) => (
          <article key={label} className="rounded border border-slate-800 bg-slate-900 p-5">
            <Icon className="text-teal-300" size={24} aria-hidden="true" />
            <h2 className="mt-4 font-semibold text-white">{label}</h2>
          </article>
        ))}
      </div>
    </section>
  );
}
