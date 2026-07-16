import { Activity, BatteryCharging } from 'lucide-react';

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded bg-teal-500 text-slate-950">
              <BatteryCharging size={22} aria-hidden="true" />
            </span>
            <div>
              <p className="text-lg font-semibold">LIFECHARGE</p>
              <p className="text-sm text-slate-400">EV battery health intelligence</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-sm text-slate-300 sm:flex">
            <Activity size={18} aria-hidden="true" />
            <span>Module 1 setup</span>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
    </div>
  );
}
