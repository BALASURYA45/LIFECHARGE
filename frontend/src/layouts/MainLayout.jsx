import { BarChart3, BatteryCharging, CalendarClock, ClipboardCheck, Gauge, LayoutGrid, LogIn, LogOut, Menu, UserRound, X } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth.js';
import LanguageSwitcher from '../components/LanguageSwitcher.jsx';
import SkipToContent from '../components/SkipToContent.jsx';
import OfflineIndicator from '../components/OfflineIndicator.jsx';
import LifyChatbot from '../components/LifyChatbot.jsx';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', key: 'dashboard', icon: Gauge },
  { to: '/routine', key: 'routine', icon: CalendarClock },
  { to: '/prediction', key: 'prediction', icon: ClipboardCheck },
  { to: '/showroom', key: 'showroom', icon: LayoutGrid },
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
    <div className="min-h-screen bg-white text-slate-900">
      <SkipToContent />
      <OfflineIndicator />
      <header className="sticky top-0 z-40 border-b border-emerald-700/30 bg-gradient-to-r from-emerald-700 via-green-600 to-emerald-500 text-white shadow-lg shadow-emerald-900/20 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-3 lc-focus shrink-0 group" onClick={closeMobileMenu}>
            <span className="relative grid size-10 shrink-0 place-items-center rounded-xl bg-white/15 text-white shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
              <BatteryCharging size={22} aria-hidden="true" />
            </span>
            <div className="hidden xs:block">
              <p className="text-lg font-black tracking-[0.12em] text-white leading-tight">{t('app.title')}</p>
              <p className="text-xs font-medium text-emerald-50 leading-tight">{t('app.subtitle')}</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-0.5 text-sm lg:flex">
            {isAuthenticated ? (
              <>
                {navItems.map(({ to, key, icon: Icon }) => (
                  <NavLink
                    key={to}
                    className={({ isActive }) =>
                      `lc-focus relative flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-200 whitespace-nowrap ${
                        isActive ? 'text-white bg-white/10' : 'text-emerald-50 hover:text-white hover:bg-white/10'
                      }`
                    }
                    to={to}
                  >
                    {({ isActive }) => (
                      <>
                        <Icon size={16} aria-hidden="true" />
                        {t(`nav.${key}`)}
                        {isActive && <span className="absolute -bottom-1 left-2 right-2 h-0.5 rounded-full bg-white" />}
                      </>
                    )}
                  </NavLink>
                ))}
                <div className="mx-2 h-4 w-px bg-white/20" />
                <NavLink
                  className={({ isActive }) =>
                    `lc-focus flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-200 whitespace-nowrap ${
                      isActive ? 'text-white bg-white/10' : 'text-emerald-50 hover:text-white hover:bg-white/10'
                    }`
                  }
                  to="/profile"
                >
                  {({ isActive }) => (
                    <>
                      <UserRound size={16} aria-hidden="true" />
                      <span className="max-w-[100px] truncate">{user?.name ?? t('nav.profile')}</span>
                      {isActive && <span className="absolute -bottom-1 left-2 right-2 h-0.5 rounded-full bg-white" />}
                    </>
                  )}
                </NavLink>
                <LanguageSwitcher />
                <button
                  className="lc-focus flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-emerald-50 transition-all duration-200 hover:border-white hover:bg-white/10 hover:text-white whitespace-nowrap"
                  type="button"
                  onClick={handleLogout}
                >
                  <LogOut size={16} aria-hidden="true" />
                  {t('nav.signOut')}
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-emerald-50">
                  <span className="text-xs font-medium">{t('app.tagline')}</span>
                </div>
                <LanguageSwitcher />
                <NavLink className="lc-focus flex items-center gap-2 rounded-lg px-3 py-2 text-emerald-50 transition-all duration-200 hover:text-white hover:bg-white/10 whitespace-nowrap" to="/login">
                  <LogIn size={16} aria-hidden="true" />
                  {t('nav.signIn')}
                </NavLink>
                <NavLink className="lc-focus rounded-lg bg-white px-4 py-2 font-bold text-emerald-700 hover:bg-emerald-50 whitespace-nowrap shadow-lg shadow-emerald-900/20 transition-all duration-200" to="/register">
                  {t('nav.createAccount')}
                </NavLink>
              </>
            )}
          </nav>

          {/* Mobile hamburger button */}
          <button
            className="lc-focus flex items-center justify-center rounded-lg p-2 text-white hover:bg-white/10 lg:hidden transition-all duration-200"
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? t('common.close') : t('common.menu')}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="border-t border-white/20 bg-emerald-700/95 px-4 pb-4 pt-2 lg:hidden">
            <div className="flex flex-col gap-1 text-sm text-emerald-50">
              {isAuthenticated ? (
                <>
                  {navItems.map(({ to, key, icon: Icon }) => (
                    <NavLink
                      key={to}
                      className={({ isActive }) =>
                        `lc-focus flex items-center gap-3 rounded-lg px-3 py-3 transition-all duration-200 ${
                          isActive ? 'bg-white/10 text-white font-semibold' : 'text-emerald-50 hover:bg-white/10 hover:text-white'
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
                      `lc-focus flex items-center gap-3 rounded-lg px-3 py-3 transition-all duration-200 ${
                        isActive ? 'bg-white/10 text-white font-semibold' : 'text-emerald-50 hover:bg-white/10 hover:text-white'
                      }`
                    }
                    to="/profile"
                    onClick={closeMobileMenu}
                  >
                    <UserRound size={18} aria-hidden="true" />
                    {user?.name ?? t('nav.profile')}
                  </NavLink>
                  <div className="flex items-center gap-2 border-t border-white/20 pt-2 mt-1">
                    <LanguageSwitcher />
                    <button
                      className="lc-focus flex items-center gap-3 rounded-lg border border-white/20 px-4 py-3 text-white transition-all duration-200 hover:border-white hover:bg-white/10 flex-1 justify-center"
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
                  <NavLink className="lc-focus flex items-center gap-3 rounded-lg px-3 py-3 text-emerald-50 transition-all duration-200 hover:bg-white/10 hover:text-white" to="/login" onClick={closeMobileMenu}>
                    <LogIn size={18} aria-hidden="true" />
                    {t('nav.signIn')}
                  </NavLink>
                  <NavLink className="lc-focus rounded-lg bg-white px-3 py-3 font-bold text-emerald-700 hover:bg-emerald-50 justify-center shadow-lg shadow-emerald-900/20 transition-all duration-200" to="/register" onClick={closeMobileMenu}>
                    {t('nav.createAccount')}
                  </NavLink>
                  <div className="flex items-center justify-center border-t border-white/20 pt-2 mt-1">
                    <LanguageSwitcher />
                  </div>
                </>
              )}
            </div>
          </nav>
        )}
      </header>
      <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">{children}</main>
      {isAuthenticated ? <LifyChatbot /> : null}
    </div>
  );
}


