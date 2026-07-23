import { BarChart3, BatteryCharging, ClipboardCheck, Gauge, LogIn, LogOut, Menu, SlidersHorizontal, UserRound, X } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth.js';
import LanguageSwitcher from '../components/LanguageSwitcher.jsx';
import SkipToContent from '../components/SkipToContent.jsx';
import OfflineIndicator from '../components/OfflineIndicator.jsx';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', key: 'dashboard', icon: Gauge },
  { to: '/prediction', key: 'prediction', icon: ClipboardCheck },
  { to: '/battery', key: 'battery', icon: BatteryCharging },
  { to: '/what-if', key: 'scenarios', icon: SlidersHorizontal },
  { to: '/reports', key: 'reports', icon: BarChart3 },
];

export default function MainLayout({ children }) {
  const { t } = useTranslation();
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleLogout() {
    setMobileMenuOpen(false);
    logout();
    navigate('/login');
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <div className="min-h-screen text-slate-900">
      <SkipToContent />
      <OfflineIndicator />
      <header className="sticky top-0 z-40 border-b border-cyan-500/20 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-3 lc-focus shrink-0" onClick={closeMobileMenu}>
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-cyan-300 text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.35)]">
              <BatteryCharging size={22} aria-hidden="true" />
            </span>
            <div className="hidden xs:block">
              <p className="text-lg font-black tracking-[0.18em] text-white leading-tight">{t('app.title')}</p>
              <p className="text-sm text-cyan-200/90 leading-tight">{t('app.subtitle')}</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 text-sm lg:flex">
            {isAuthenticated ? (
              <>
                {navItems.map(({ to, key, icon: Icon }) => (
                  <NavLink
                    key={to}
                    className={({ isActive }) =>
                      `lc-focus flex items-center gap-1.5 rounded-lg px-2.5 py-2 transition whitespace-nowrap ${
                        isActive ? 'bg-cyan-500/15 text-cyan-700' : 'text-slate-600 hover:bg-cyan-500/10 hover:text-slate-900'
                      }`
                    }
                    to={to}
                  >
                    <Icon size={16} aria-hidden="true" />
                    {t(`nav.${key}`)}
                  </NavLink>
                ))}
                <NavLink
                  className={({ isActive }) =>
                    `lc-focus flex items-center gap-1.5 rounded-lg px-2.5 py-2 transition whitespace-nowrap ${
                      isActive ? 'bg-cyan-500/15 text-cyan-700' : 'text-slate-600 hover:bg-cyan-500/10 hover:text-slate-900'
                    }`
                  }
                  to="/profile"
                >
                  <UserRound size={16} aria-hidden="true" />
                  {user?.name ?? t('nav.profile')}
                </NavLink>
                <LanguageSwitcher />
                <button
                  className="lc-focus flex items-center gap-1.5 rounded-lg border border-cyan-500/20 px-2.5 py-2 text-slate-700 transition hover:border-danger hover:text-danger whitespace-nowrap"
                  type="button"
                  onClick={handleLogout}
                >
                  <LogOut size={16} aria-hidden="true" />
                  {t('nav.signOut')}
                </button>
              </>
            ) : (
              <>
                <div className="hidden items-center gap-2 rounded-lg border border-cyan-500/20 px-3 py-2 text-cyan-700 sm:flex">
                  <Menu size={16} aria-hidden="true" />
                  <span>{t('app.tagline')}</span>
                </div>
                <LanguageSwitcher />
                <NavLink className="lc-focus flex items-center gap-1.5 rounded-lg px-2.5 py-2 hover:bg-cyan-500/10 hover:text-slate-900 whitespace-nowrap" to="/login">
                  <LogIn size={16} aria-hidden="true" />
                  {t('nav.signIn')}
                </NavLink>
                <NavLink className="lc-focus rounded-lg bg-accent px-3 py-2 font-bold text-white hover:bg-accent-light whitespace-nowrap shadow-[0_0_18px_rgba(6,182,212,0.35)] transition" to="/register">
                  {t('nav.createAccount')}
                </NavLink>
              </>
            )}
          </nav>

          {/* Mobile hamburger button */}
          <button
            className="lc-focus flex items-center justify-center rounded-lg p-2 text-slate-300 hover:bg-cyan-500/10 hover:text-white lg:hidden transition"
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? t('common.close') : t('common.menu')}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen ? (
          <nav className="border-t border-cyan-500/20 bg-white/95 px-4 pb-4 pt-2 lg:hidden">
            <div className="flex flex-col gap-1 text-sm text-slate-700">
              {isAuthenticated ? (
                <>
                  {navItems.map(({ to, key, icon: Icon }) => (
                  <NavLink
                    key={to}
                    className={({ isActive }) =>
                      `lc-focus flex items-center gap-3 rounded-lg px-3 py-3 transition ${
                        isActive ? 'bg-cyan-500/15 text-cyan-700' : 'text-slate-600 hover:bg-cyan-500/10 hover:text-slate-900'
                      }`
                    }
                    to={to}
                    onClick={closeMobileMenu}
                  >
                      <Icon size={18} aria-hidden="true" />
                      {t(`nav.${key}`)}
                    </NavLink>
                  ))}
                  <NavLink
                    className={({ isActive }) =>
                      `lc-focus flex items-center gap-3 rounded-lg px-3 py-3 transition ${
                        isActive ? 'bg-cyan-500/15 text-cyan-700' : 'text-slate-600 hover:bg-cyan-500/10 hover:text-slate-900'
                      }`
                    }
                    to="/profile"
                    onClick={closeMobileMenu}
                  >
                    <UserRound size={18} aria-hidden="true" />
                    {user?.name ?? t('nav.profile')}
                  </NavLink>
                  <div className="flex items-center gap-2 border-t border-cyan-500/20 pt-2 mt-1">
                    <LanguageSwitcher />
                    <button
                      className="lc-focus flex items-center gap-3 rounded-lg border border-cyan-500/20 px-4 py-3 text-slate-700 transition hover:border-danger hover:text-danger flex-1 justify-center"
                      type="button"
                      onClick={handleLogout}
                    >
                      <LogOut size={18} aria-hidden="true" />
                      {t('nav.signOut')}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <NavLink className="lc-focus flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-cyan-500/10 hover:text-slate-900" to="/login" onClick={closeMobileMenu}>
                    <LogIn size={18} aria-hidden="true" />
                    {t('nav.signIn')}
                  </NavLink>
                  <NavLink className="lc-focus rounded-lg bg-accent px-3 py-3 font-bold text-white hover:bg-accent-light justify-center shadow-[0_0_18px_rgba(6,182,212,0.35)] transition" to="/register" onClick={closeMobileMenu}>
                    {t('nav.createAccount')}
                  </NavLink>
                  <div className="flex items-center justify-center border-t border-cyan-500/20 pt-2 mt-1">
                    <LanguageSwitcher />
                  </div>
                </>
              )}
            </div>
          </nav>
        ) : null}
      </header>
      <main id="main-content" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-10">{children}</main>
    </div>
  );
}