import { Activity, BatteryCharging } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export default function MainLayout({ children }) {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded bg-teal-500 text-slate-950">
              <BatteryCharging size={22} aria-hidden="true" />
            </span>
            <div>
              <p className="text-lg font-semibold">LIFECHARGE</p>
              <p className="text-sm text-slate-400">EV battery health intelligence</p>
            </div>
          </Link>
          <nav className="flex items-center gap-3 text-sm text-slate-300">
            {isAuthenticated ? (
              <>
                <NavLink className="hover:text-white" to="/dashboard">
                  Dashboard
                </NavLink>
                <NavLink className="hover:text-white" to="/battery">
                  Battery Data
                </NavLink>
                <NavLink className="hover:text-white" to="/ml-training">
                  ML Training
                </NavLink>
                <NavLink className="hover:text-white" to="/profile">
                  {user?.name ?? 'Profile'}
                </NavLink>
                <button
                  className="rounded bg-slate-800 px-3 py-2 text-slate-100 hover:bg-slate-700"
                  type="button"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <div className="hidden items-center gap-2 sm:flex">
                  <Activity size={18} aria-hidden="true" />
                  <span>Module 2 auth</span>
                </div>
                <NavLink className="hover:text-white" to="/login">
                  Login
                </NavLink>
                <NavLink className="rounded bg-teal-500 px-3 py-2 font-semibold text-slate-950" to="/register">
                  Register
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
    </div>
  );
}
