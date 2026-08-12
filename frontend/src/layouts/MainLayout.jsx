import { Activity, BarChart3, BatteryCharging, CalendarClock, ClipboardCheck, Cpu, Gauge, LayoutGrid, LogIn, LogOut, Menu, Moon, Sliders, Sun, UserRound, X, Zap } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import LanguageSwitcher from '../components/LanguageSwitcher.jsx';
import NotificationBell from '../components/NotificationBell.jsx';
import SkipToContent from '../components/SkipToContent.jsx';
import OfflineIndicator from '../components/OfflineIndicator.jsx';
import LifyChatbot from '../components/LifyChatbot.jsx';

const navItems = [
  { to: '/dashboard', key: 'dashboard', label: 'Dashboard', icon: Gauge },
  { to: '/digital-twin', key: 'digitalTwin', label: 'Digital Twin', icon: Cpu },
  { to: '/early-life', key: 'earlyLife', label: 'Early-Life', icon: Activity },
  { to: '/model-comparison', key: 'benchmark', label: 'Model Benchmark', icon: Cpu },
  { to: '/research-experiments', key: 'research', label: 'Research Hub', icon: Sliders },
  { to: '/what-if', key: 'whatIf', label: 'What-If', icon: Zap },
  { to: '/routine', key: 'routine', label: 'Routine', icon: CalendarClock },
  { to: '/reports', key: 'reports', label: 'Reports', icon: BarChart3 },
];

export default function MainLayout({ children }) {
  const { t } = useTranslation();
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const storedTheme = window.localStorage.getItem('lifecharge_theme');
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    window.localStorage.setItem('lifecharge_theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  }

  function handleLogout() {
    setMobileMenuOpen(false);
    logout();
    navigate('/login');
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <SkipToContent />
      <OfflineIndicator />
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white text-slate-900 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 dark:text-white">
        <div className="w-full flex items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 lc-focus shrink-0 group" onClick={closeMobileMenu}>
            <span className="relative grid size-10 shrink-0 place-items-center rounded-xl bg-cyan-500/10 text-cyan-600 shadow-sm transition-all duration-300 group-hover:scale-105 dark:bg-cyan-500/20 dark:text-cyan-400">
              <BatteryCharging size={22} aria-hidden="true" />
            </span>
            <div className="hidden xs:block">
              <p className="text-lg font-black tracking-[0.12em] text-slate-900 dark:text-white leading-tight">{t('app.title')}</p>
              <p className="text-xs font-medium text-slate-600 dark:text-cyan-400 leading-tight">{t('app.subtitle')}</p>
            </div>
          </Link>

          {/* Desktop Main Navigation Tabs */}
          {isAuthenticated && (
            <nav className="hidden items-center gap-1 text-sm lg:flex ml-4">
              {navItems.map(({ to, key, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  className={({ isActive }) =>
                    `lc-focus relative flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-200 whitespace-nowrap font-medium ${
                      isActive
                        ? 'text-cyan-700 bg-cyan-50/80 font-bold dark:text-cyan-300 dark:bg-slate-800'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                    }`
                  }
                  to={to}
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={16} aria-hidden="true" />
                      {t(`nav.${key}`, label || key)}
                      {isActive && <span className="absolute -bottom-1 left-2 right-2 h-0.5 rounded-full bg-cyan-600 dark:bg-cyan-400" />}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          )}

          {/* Far Right Utilities (Profile, Notification, Language, Theme, Logout) */}
          <div className="hidden items-center gap-2.5 text-sm lg:flex ml-auto shrink-0">
            {isAuthenticated ? (
              <>
                <NotificationBell />
                <NavLink
                  className={({ isActive }) =>
                    `lc-focus relative flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-200 whitespace-nowrap font-medium ${
                      isActive
                        ? 'text-cyan-700 bg-cyan-50/80 font-bold dark:text-cyan-300 dark:bg-slate-800'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                    }`
                  }
                  to="/profile"
                >
                  {({ isActive }) => (
                    <>
                      <UserRound size={16} aria-hidden="true" />
                      <span className="max-w-[120px] truncate">{user?.name ?? t('nav.profile')}</span>
                      {isActive && <span className="absolute -bottom-1 left-2 right-2 h-0.5 rounded-full bg-cyan-600 dark:bg-cyan-400" />}
                    </>
                  )}
                </NavLink>
                <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />
                <LanguageSwitcher />
                <button
                  className="lc-focus flex size-9 items-center justify-center rounded-lg border border-slate-300 bg-slate-50/80 text-slate-700 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white"
                  type="button"
                  onClick={toggleTheme}
                  aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                  title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {theme === 'dark' ? <Sun size={17} aria-hidden="true" className="text-amber-400" /> : <Moon size={17} aria-hidden="true" className="text-slate-600" />}
                </button>
                <button
                  className="lc-focus flex size-9 items-center justify-center rounded-lg border border-slate-300 bg-slate-50/80 text-slate-700 transition-all duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-red-900/60 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                  type="button"
                  onClick={handleLogout}
                  aria-label={t('nav.signOut')}
                  title={t('nav.signOut')}
                >
                  <LogOut size={17} aria-hidden="true" />
                </button>
              </>
            ) : (
              <>
                <LanguageSwitcher />
                <button
                  className="lc-focus flex size-9 items-center justify-center rounded-lg border border-slate-300 bg-slate-50/80 text-slate-700 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white"
                  type="button"
                  onClick={toggleTheme}
                  aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                  title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {theme === 'dark' ? <Sun size={17} aria-hidden="true" className="text-amber-400" /> : <Moon size={17} aria-hidden="true" className="text-slate-600" />}
                </button>
                <NavLink className="lc-focus flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-slate-700 transition-all duration-200 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 whitespace-nowrap" to="/login">
                  <LogIn size={16} aria-hidden="true" />
                  {t('nav.signIn')}
                </NavLink>
                <NavLink className="lc-focus rounded-lg bg-cyan-600 px-4 py-2 font-bold text-white hover:bg-cyan-500 whitespace-nowrap shadow-md transition-all duration-200 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400" to="/register">
                  {t('nav.createAccount')}
                </NavLink>
              </>
            )}
          </div>

          {/* Mobile hamburger button */}
          <button
            className="lc-focus flex items-center justify-center rounded-lg p-2 text-slate-800 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800 lg:hidden transition-all duration-200"
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? t('common.close') : t('common.menu')}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="border-t border-slate-200 bg-white px-4 pb-4 pt-2 lg:hidden transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-1 text-sm text-slate-800 dark:text-white">
              {isAuthenticated ? (
                <>
                  {navItems.map(({ to, key, label, icon: Icon }) => (
                    <NavLink
                      key={to}
                      className={({ isActive }) =>
                        `lc-focus flex items-center gap-3 rounded-lg px-3 py-3 font-medium transition-all duration-200 ${
                          isActive ? 'bg-cyan-50 text-cyan-700 font-semibold dark:bg-slate-800 dark:text-cyan-300' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white'
                        }`
                      }
                      to={to}
                      onClick={closeMobileMenu}
                    >
                      <Icon size={18} aria-hidden="true" />
                      {t(`nav.${key}`, label || key)}
                    </NavLink>
                  ))}
                  <NavLink
                    className={({ isActive }) =>
                      `lc-focus flex items-center gap-3 rounded-lg px-3 py-3 font-medium transition-all duration-200 ${
                        isActive ? 'bg-cyan-50 text-cyan-700 font-semibold dark:bg-slate-800 dark:text-cyan-300' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white'
                      }`
                    }
                    to="/profile"
                    onClick={closeMobileMenu}
                  >
                    <UserRound size={18} aria-hidden="true" />
                    {user?.name ?? t('nav.profile')}
                  </NavLink>
                  <div className="flex flex-col gap-2 border-t border-slate-200 dark:border-slate-800 pt-3 mt-1">
                    <LanguageSwitcher />
                    <button
                      className="lc-focus flex items-center gap-3 rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-slate-800 dark:text-slate-200 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800 justify-center font-medium"
                      type="button"
                      onClick={toggleTheme}
                      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                      {theme === 'dark' ? <Sun size={18} aria-hidden="true" className="text-amber-400" /> : <Moon size={18} aria-hidden="true" className="text-slate-600" />}
                      {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                    </button>
                    <button
                      className="lc-focus flex items-center gap-3 rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-slate-800 dark:text-slate-200 transition-all duration-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 justify-center font-medium"
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
                  <NavLink className="lc-focus flex items-center gap-3 rounded-lg px-3 py-3 text-slate-800 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white" to="/login" onClick={closeMobileMenu}>
                    <LogIn size={18} aria-hidden="true" />
                    {t('nav.signIn')}
                  </NavLink>
                  <NavLink className="lc-focus rounded-lg bg-cyan-600 px-3 py-3 font-bold text-white hover:bg-cyan-500 justify-center shadow-md transition-all duration-200 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400" to="/register" onClick={closeMobileMenu}>
                    {t('nav.createAccount')}
                  </NavLink>
                  <div className="flex flex-col gap-2 border-t border-slate-200 dark:border-slate-800 pt-3 mt-1">
                    <LanguageSwitcher />
                    <button
                      className="lc-focus flex items-center gap-3 rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-slate-800 dark:text-slate-200 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800 justify-center font-medium"
                      type="button"
                      onClick={toggleTheme}
                      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                      {theme === 'dark' ? <Sun size={18} aria-hidden="true" className="text-amber-400" /> : <Moon size={18} aria-hidden="true" className="text-slate-600" />}
                      {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                    </button>
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


