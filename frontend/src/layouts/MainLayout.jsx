import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  BarChart3,
  BatteryCharging,
  Box,
  ChevronRight,
  ChevronDown,
  Cpu,
  Database,
  FileText,
  FlaskConical,
  Gauge,
  Layers,
  LogIn,
  LogOut,
  Menu,
  Moon,
  Network,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  Settings,
  Sliders,
  Sparkles,
  Sun,
  UserRound,
  X,
  Zap,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import LanguageSwitcher from '../components/LanguageSwitcher.jsx';
import NotificationBell from '../components/NotificationBell.jsx';
import SkipToContent from '../components/SkipToContent.jsx';
import OfflineIndicator from '../components/OfflineIndicator.jsx';
import LifyChatbot from '../components/LifyChatbot.jsx';
import logoImage from '../assets/lithyx-logo.png';

const routeKeyMap = {
  dashboard: 'dashboard',
  battery: 'battery',
  'dataset-manager': 'datasets',
  'health-indicators': 'healthIndicators',
  'lithyx-prediction': 'lithyxPrediction',
  'digital-twin': 'digitalTwin',
  'cross-chemistry': 'crossChemistry',
  uncertainty: 'uncertainty',
  explainability: 'explainability',
  'what-if': 'whatIf',
  'model-comparison': 'benchmark',
  'ablation-study': 'ablation',
  'research-experiments': 'research',
  reports: 'reports',
  'early-life': 'earlyLife',
  routine: 'routine',
  showroom: 'showroom',
  profile: 'profile',
  settings: 'settings',
};

const menuCategories = [
  {
    categoryKey: 'overview',
    category: 'OVERVIEW & TELEMETRY',
    items: [
      { to: '/dashboard', key: 'dashboard', label: 'Dashboard', icon: Gauge, badgeKey: 'live', badge: 'Live' },
      { to: '/battery', key: 'battery', label: 'Data Acquisition', icon: Database },
      { to: '/dataset-manager', key: 'datasets', label: 'Dataset Catalog', icon: Layers },
    ],
  },
  {
    categoryKey: 'featureEngineering',
    category: 'FEATURE ENGINEERING & PHYSICS',
    items: [
      { to: '/health-indicators', key: 'healthIndicators', label: 'Health Indicators', icon: Activity, badgeKey: 'dqdv', badge: 'dQ/dV' },
      { to: '/lithyx-prediction', key: 'lithyxPrediction', label: 'LITHYX Core Engine', icon: Cpu, badgeKey: 'physics', badge: 'Physics' },
      { to: '/digital-twin', key: 'digitalTwin', label: 'Digital Twin & UKF', icon: Box, badgeKey: 'ukf', badge: 'UKF' },
    ],
  },
  {
    categoryKey: 'advancedPrognostics',
    category: 'ADVANCED PROGNOSTICS & ADAPTATION',
    items: [
      { to: '/cross-chemistry', key: 'crossChemistry', label: 'Cross-Chemistry Transfer', icon: Network, badgeKey: 'domain', badge: 'Domain' },
      { to: '/uncertainty', key: 'uncertainty', label: 'Conformal Uncertainty', icon: Sparkles, badgeKey: 'bounds', badge: '95% Bounds' },
      { to: '/explainability', key: 'explainability', label: 'Explainability & SHAP', icon: Sliders, badgeKey: 'shap', badge: 'SHAP' },
      { to: '/what-if', key: 'whatIf', label: 'What-If Simulation', icon: Zap, badgeKey: 'scenario', badge: 'Scenario' },
      { to: '/v2g-optimizer', key: 'v2gOptimizer', label: 'V2G Economic Optimizer', icon: BatteryCharging, badgeKey: 'v2g', badge: 'V2G' },
    ],
  },
  {
    categoryKey: 'benchmarking',
    category: 'BENCHMARKING & EXPERIMENTS',
    items: [
      { to: '/model-comparison', key: 'benchmark', label: 'Model Benchmark', icon: BarChart3 },
      { to: '/ablation-study', key: 'ablation', label: 'Ablation Study', icon: FlaskConical },
      { to: '/research-experiments', key: 'research', label: 'Experiment Runner', icon: Sliders },
      { to: '/reports', key: 'reports', label: 'Research Reports', icon: FileText },
    ],
  },
];

const quickAccessItems = [
  { to: '/digital-twin', key: 'digitalTwin', label: '3D Digital Twin', icon: Box, iconColor: 'text-emerald-500 dark:text-emerald-400' },
  { to: '/what-if', key: 'whatIf', label: 'ONNX What-If Engine', icon: Zap, iconColor: 'text-amber-500 dark:text-amber-400' },
  { to: '/explainability', key: 'shap', label: 'SHAP Feature Attribution', icon: Sliders, iconColor: 'text-purple-500 dark:text-purple-400' },
  { to: '/v2g-optimizer', key: 'v2gOptimizer', label: 'V2G Economic Optimizer', icon: BatteryCharging, iconColor: 'text-blue-500 dark:text-blue-400' },
  { to: '/reports', key: 'reports', label: 'Battery Passport & Reports', icon: FileText, iconColor: 'text-teal-500 dark:text-teal-400' },
];

export default function MainLayout({ children }) {
  const { t } = useTranslation();
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  const [collapsedCategories, setCollapsedCategories] = useState({});

  useEffect(() => {
    const storedTheme = window.localStorage.getItem('lithyx_theme') || window.localStorage.getItem('lifecharge_theme');
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    window.localStorage.setItem('lithyx_theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  }

  function handleLogout() {
    setMobileMenuOpen(false);
    logout();
    navigate('/login');
  }

  function toggleCategory(catTitle) {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catTitle]: !prev[catTitle],
    }));
  }

  const currentRouteKey = location.pathname.replace('/', '');
  const activeHeaderTitle = t(`header.${routeKeyMap[currentRouteKey] || 'dashboard'}`, location.pathname.replace('/', '').replace('-', ' ') || 'Dashboard');

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100 flex">
      <SkipToContent />
      <OfflineIndicator />

      {/* Desktop Left Sidebar Menu */}
      {isAuthenticated && (
        <aside
          className={`fixed top-0 bottom-0 left-0 z-40 bg-white border-r border-slate-200 text-slate-800 dark:bg-[#0B131F] dark:border-slate-800/80 dark:text-slate-100 flex flex-col transition-all duration-300 shadow-xl dark:shadow-2xl ${
            sidebarOpen ? 'w-64 xl:w-72' : 'w-20'
          } hidden lg:flex`}
        >
          {/* Top Brand Block */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 bg-slate-50/90 dark:border-slate-800/80 dark:bg-[#070D14] shrink-0">
            <Link to="/" className="flex items-center gap-3 shrink-0 group">
              <img
                src={logoImage}
                alt="LITHYX Logo"
                className="size-10 shrink-0 rounded-xl object-cover border border-emerald-500/30 shadow-md shadow-emerald-950/30 transition-all duration-300 group-hover:scale-105"
              />
              {sidebarOpen && (
                <div className="shrink-0 overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <p className="text-lg font-black tracking-[0.14em] text-slate-900 dark:text-white leading-tight">{t('app.title', 'LITHYX')}</p>
                    <span className="badge-yellow rounded px-1.5 py-0.5 text-[9px] font-black text-slate-950 uppercase border border-amber-400 shadow-sm shadow-yellow-500/30">v2.5</span>
                  </div>
                  <p className="text-[9px] font-bold text-amber-500 dark:text-amber-400 tracking-wider uppercase leading-tight truncate">{t('header.prognosticsPlatform', 'PROGNOSTICS PLATFORM')}</p>
                </div>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 p-1.5 rounded-lg transition"
              title={sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
            >
              {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            </button>
          </div>

          {/* Categorized Sub-Menu Navigation List */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 no-scrollbar">
            {menuCategories.map((cat, catIdx) => {
              const isCollapsed = collapsedCategories[cat.category];
              const categoryTitle = t(`navCategories.${cat.categoryKey}`, cat.category);
              return (
                <div key={catIdx} className="space-y-1.5">
                  {/* Main Category Header */}
                  {sidebarOpen ? (
                    <button
                      type="button"
                      onClick={() => toggleCategory(cat.category)}
                      className="w-full flex items-center justify-between px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-600/90 hover:text-amber-700 dark:text-amber-400/90 dark:hover:text-amber-300 transition group"
                    >
                      <span className="truncate">{categoryTitle}</span>
                      {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                    </button>
                  ) : (
                    <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />
                  )}

                  {/* Sub-Category Links */}
                  {!isCollapsed &&
                    cat.items.map(({ to, key, label, icon: Icon, badge, badgeKey }) => (
                      <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                          `group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs transition-all duration-200 ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-600 border-l-4 border-emerald-600 font-bold shadow-sm shadow-emerald-100 pl-2.5 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500 dark:shadow-emerald-950/30'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white font-semibold border-l-4 border-transparent'
                          }`
                        }
                      >
                        <div className="flex items-center gap-3 shrink-0 truncate">
                          <Icon size={17} className="text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:scale-110 transition duration-200" />
                          {sidebarOpen && <span className="truncate">{t(`nav.${key}`, label)}</span>}
                        </div>

                        {sidebarOpen && badge && (
                          <span className={`rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-wider shrink-0 ${
                            ['ukf', 'v2g', 'physics', 'scenario', 'live'].includes(badgeKey)
                              ? 'badge-yellow'
                              : 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500/30'
                          }`}>
                            {badgeKey ? t(`navBadge.${badgeKey}`, badge) : badge}
                          </span>
                        )}
                      </NavLink>
                    ))}
                </div>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          {sidebarOpen && (
            <div className="p-3 border-t border-slate-200 bg-slate-50 text-[10px] text-slate-500 dark:border-slate-800/80 dark:bg-[#070D14] dark:text-slate-400 space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-300">
                <span>{t('footer.platform', 'Research Platform')}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono">{t('footer.active', 'v2.5 Active')}</span>
              </div>
              <p className="text-[9px] leading-tight text-slate-400 dark:text-slate-500">{t('footer.engine', 'Hybrid Physics & Explainability Engine')}</p>
            </div>
          )}
        </aside>
      )}

      {/* Main Workspace Layout Container */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isAuthenticated ? (sidebarOpen ? 'lg:pl-64 xl:pl-72' : 'lg:pl-20') : ''}`}>
        
        {/* Top Sticky Header Bar */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 text-slate-800 backdrop-blur-md shadow-sm dark:border-slate-800/80 dark:bg-[#0B131F]/95 dark:text-slate-100 dark:shadow-md">
          <div className="w-full flex items-center justify-between gap-2 px-3 py-2.5 sm:px-6 sm:py-3 lg:px-8">
            
            {/* Left Header Controls */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
              {/* Mobile Sidebar Toggle Button */}
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700 transition shrink-0"
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
              )}

              {/* Brand Logo for unauthenticated / mobile drawer header */}
              {(!isAuthenticated || mobileMenuOpen) && (
                <Link to="/" className="flex items-center gap-2 shrink-0">
                  <img
                    src={logoImage}
                    alt="LITHYX Logo"
                    className="size-8 sm:size-9 shrink-0 rounded-xl object-cover border border-emerald-500/30 shadow-sm"
                  />
                  <p className="text-base sm:text-lg font-black tracking-[0.14em] text-slate-900 dark:text-white">LITHYX</p>
                </Link>
              )}

              {/* Section Header Title Breadcrumb */}
              {isAuthenticated && (
                <div className="hidden sm:block min-w-0 truncate">
                  <p className="text-[10px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase truncate">{t('header.researchPlatform', 'LITHYX RESEARCH PLATFORM')}</p>
                  <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white capitalize truncate">
                    {activeHeaderTitle}
                  </p>
                </div>
              )}
            </div>

            {/* Right Header Utilities (Profile, Notification, Language, Theme, Logout) */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 text-xs font-medium ml-auto shrink-0">
              {isAuthenticated ? (
                <>
                  <NotificationBell />
                  <NavLink
                    className="lc-focus flex size-8 sm:size-9 items-center justify-center rounded-full border border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 shadow-sm hover:border-emerald-500/50 hover:shadow-md transition-all duration-200 group shrink-0"
                    to="/profile"
                    title={user?.name ?? 'User Profile'}
                    aria-label={user?.name ?? 'User Profile'}
                  >
                    <div className="flex size-6 sm:size-7 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-sm shadow-emerald-950/30 group-hover:scale-105 transition duration-200">
                      <UserRound size={13} className="stroke-[2.5]" />
                    </div>
                  </NavLink>
                  <NavLink
                    className="lc-focus hidden xs:flex size-8 sm:size-9 items-center justify-center rounded-xl border border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 shadow-sm hover:border-amber-500/50 hover:text-amber-500 hover:shadow-md transition-all duration-200 shrink-0"
                    to="/settings"
                    title="Settings & Preferences"
                    aria-label="Settings & Preferences"
                  >
                    <Settings size={15} />
                  </NavLink>
                  <div className="hidden sm:block h-4 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />
                  <LanguageSwitcher />
                  <button
                    className="lc-focus flex size-8 sm:size-9 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-700 hover:border-emerald-500/40 hover:bg-slate-50 hover:text-emerald-600 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:border-emerald-500/40 dark:hover:bg-slate-800 dark:hover:text-emerald-400 shadow-sm transition-all duration-200 shrink-0"
                    type="button"
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                  >
                    {theme === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-slate-600" />}
                  </button>
                  <button
                    className="lc-focus hidden sm:flex size-8 sm:size-9 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-500 hover:border-emerald-500/40 hover:bg-emerald-50 hover:text-emerald-600 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400 dark:hover:border-emerald-500/40 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400 shadow-sm transition-all duration-200 shrink-0"
                    type="button"
                    onClick={handleLogout}
                    aria-label={t('nav.signOut')}
                    title={t('nav.signOut')}
                  >
                    <LogOut size={15} />
                  </button>
                </>
              ) : (
                <>
                  <LanguageSwitcher />
                  <button
                    className="lc-focus flex size-8 sm:size-9 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-700 hover:border-emerald-500/40 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800 transition-all duration-200 shadow-sm shrink-0"
                    type="button"
                    onClick={toggleTheme}
                  >
                    {theme === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-slate-600" />}
                  </button>
                  <NavLink className="lc-focus flex items-center gap-1.5 rounded-xl px-2.5 sm:px-3.5 py-1.5 font-bold text-slate-700 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 transition shrink-0" to="/login">
                    <LogIn size={15} />
                    <span>{t('nav.signIn')}</span>
                  </NavLink>
                  <NavLink className="lc-focus rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3 sm:px-4 py-1.5 font-bold text-white hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-950/40 transition shrink-0" to="/register">
                    {t('nav.createAccount')}
                  </NavLink>
                </>
              )}
            </div>
          </div>

          {/* Quick Access Segmented Dock Strip */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center justify-between px-6 py-2 border-t border-slate-200/60 bg-slate-100/50 dark:border-slate-800/60 dark:bg-[#070D14]/80 backdrop-blur-xl">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/60 dark:bg-slate-900/80 border border-slate-300/50 dark:border-slate-800/80 shadow-inner overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 shrink-0 select-none">
                  <span className="relative flex size-2 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
                  </span>
                  <span>Shortcuts</span>
                </div>

                {quickAccessItems.map(({ to, key, label, icon: Icon, iconColor }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `relative group px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all duration-200 shrink-0 ${
                        isActive
                          ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white dark:shadow-md font-bold'
                          : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-800/50'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          size={14}
                          className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                            isActive ? 'text-emerald-600 dark:text-emerald-400' : iconColor
                          }`}
                        />
                        <span>{t(`nav.${key}`, label)}</span>
                        {isActive && (
                          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>

              <div className="hidden xl:flex items-center gap-2 text-[11px] font-mono text-slate-400 dark:text-slate-500">
                <span className="px-2.5 py-1 rounded-md bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 font-medium">
                  ⌘K Quick Navigation
                </span>
              </div>
            </div>
          )}

          {/* Mobile Drawer Menu (Collapsible on Mobile) */}
          {mobileMenuOpen && (
            <nav className="border-t border-slate-200 bg-white px-4 pb-6 pt-4 lg:hidden shadow-2xl space-y-5 dark:border-slate-800 dark:bg-[#0B131F] max-h-[calc(100vh-4rem)] overflow-y-auto">
              {/* User profile card & logout for mobile */}
              {isAuthenticated && (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold">
                      <UserRound size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{user?.name || 'User'}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{user?.email || 'Authenticated'}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-100 transition"
                  >
                    <LogOut size={14} />
                    <span>{t('nav.signOut', 'Sign Out')}</span>
                  </button>
                </div>
              )}

              {menuCategories.map((cat, cIdx) => (
                <div key={cIdx} className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600/90 dark:text-emerald-400/90">{cat.category}</p>
                  <div className="space-y-1">
                    {cat.items.map(({ to, key, label, icon: Icon }) => (
                      <NavLink
                        key={to}
                        to={to}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-xl px-3.5 py-2.5 font-semibold text-xs transition-all ${
                            isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                          }`
                        }
                      >
                        <Icon size={18} className="text-emerald-600 dark:text-emerald-400" />
                        {t(`nav.${key}`, label)}
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          )}
        </header>

        {/* Main Content Area */}
        <main id="main-content" className="flex-1 mx-auto max-w-7xl w-full px-4 py-6 sm:px-6 lg:py-8">
          {children}
        </main>
      </div>

      {isAuthenticated ? <LifyChatbot /> : null}
    </div>
  );
}
