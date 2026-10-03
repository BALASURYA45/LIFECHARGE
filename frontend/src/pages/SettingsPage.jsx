import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import {
  Sliders,
  Bell,
  Clock,
  Sparkles,
  Globe,
  Moon,
  Sun,
  ShieldCheck,
  Save,
  CheckCircle2,
  Database,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { getErrorMessage } from '../utils/getErrorMessage.js';

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { user, saveProfile } = useAuth();
  const [message, setMessage] = useState('');
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      dailyReminderEnabled: user?.dailyReminderEnabled ?? true,
      reminderTime: user?.reminderTime ?? '20:00',
      browserNotificationsEnabled: user?.browserNotificationsEnabled ?? false,
    },
  });

  const dailyReminderEnabled = watch('dailyReminderEnabled');
  const browserNotificationsEnabled = watch('browserNotificationsEnabled');

  const currentLang = i18n.language || 'en';

  async function onSubmit(values) {
    setMessage('');
    setServerError('');

    try {
      await saveProfile({
        name: user?.name,
        dailyReminderEnabled: values.dailyReminderEnabled,
        reminderTime: values.reminderTime,
        browserNotificationsEnabled: values.browserNotificationsEnabled,
      });
      setMessage(t('settings.saved', 'Application preferences & reminder settings saved!'));
      setTimeout(() => setMessage(''), 4000);
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  }

  function handleLanguageChange(langCode) {
    i18n.changeLanguage(langCode);
    localStorage.setItem('lifecharge_language', langCode);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header Banner */}
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-[#070D14] p-6 sm:p-8 text-white shadow-2xl dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-400">
              <Sliders size={14} /> APPLICATION PREFERENCES
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Settings & Configuration
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl font-medium leading-relaxed">
              Manage battery logging reminders, desktop alerts, interface language, telemetry sync options, and system preferences.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md shrink-0 space-y-1">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Active Language</p>
            <p className="text-sm font-black text-amber-400 flex items-center gap-2">
              <Globe size={16} /> {currentLang === 'ta' ? 'தமிழ் (Tamil)' : currentLang === 'hi' ? 'हिन्दी (Hindi)' : 'English'}
            </p>
          </div>
        </div>
      </section>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Section 1: Reminders & Alerts */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-md dark:border-slate-800 dark:bg-slate-900 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="grid size-10 place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/20">
                <Bell size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Reminders & Daily Alerts</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Configure routine battery stat logging prompts</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Daily Reminder Toggle */}
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/20 dark:text-amber-300">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Daily Battery Reminder</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Alert me to record battery stats daily</p>
                  </div>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    {...register('dailyReminderEnabled')}
                  />
                  <div className="peer h-6 w-11 rounded-full bg-slate-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-slate-700 dark:peer-checked:bg-emerald-500" />
                </label>
              </div>

              {/* Preferred Reminder Time */}
              {dailyReminderEnabled ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/60">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    Preferred Daily Alert Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="time"
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-11 pr-4 text-sm font-bold text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-emerald-400"
                      {...register('reminderTime')}
                    />
                  </div>
                </div>
              ) : null}

              {/* Browser Push Notifications */}
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/20 dark:text-emerald-300">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Desktop Push Alerts</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Receive browser pop-up reminders</p>
                  </div>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    {...register('browserNotificationsEnabled')}
                  />
                  <div className="peer h-6 w-11 rounded-full bg-slate-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-slate-700 dark:peer-checked:bg-emerald-500" />
                </label>
              </div>
            </div>
          </section>

          {/* Section 2: Localization & Interface Preferences */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-md dark:border-slate-800 dark:bg-slate-900 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="grid size-10 place-items-center rounded-xl bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400 border border-teal-500/20">
                <Globe size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Language & Regional Format</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Select application interface language</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Select Platform Interface Language
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleLanguageChange('en')}
                  className={`p-4 rounded-2xl border text-left transition font-bold text-xs flex flex-col justify-between h-24 ${
                    currentLang === 'en'
                      ? 'border-teal-500 bg-teal-500/10 text-teal-700 dark:text-teal-300 border-2'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <span className="text-base font-black">English</span>
                  <span className="text-[10px] text-slate-500">Default (Global)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLanguageChange('ta')}
                  className={`p-4 rounded-2xl border text-left transition font-bold text-xs flex flex-col justify-between h-24 ${
                    currentLang === 'ta'
                      ? 'border-teal-500 bg-teal-500/10 text-teal-700 dark:text-teal-300 border-2'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <span className="text-base font-black">தமிழ்</span>
                  <span className="text-[10px] text-slate-500">Tamil (தமிழ்)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLanguageChange('hi')}
                  className={`p-4 rounded-2xl border text-left transition font-bold text-xs flex flex-col justify-between h-24 ${
                    currentLang === 'hi'
                      ? 'border-teal-500 bg-teal-500/10 text-teal-700 dark:text-teal-300 border-2'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <span className="text-base font-black">हिन्दी</span>
                  <span className="text-[10px] text-slate-500">Hindi (हिन्दी)</span>
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <p className="font-bold text-slate-900 dark:text-white mb-1">Instant Multi-Language Sync</p>
                Switching language dynamically updates 100% of navigation menus, research chart titles, digital twin controls, and chatbot prompts.
              </div>
            </div>
          </section>
        </div>

        {/* Save Bar & Status Alerts */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div>
            {message ? (
              <p className="flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={18} /> {message}
              </p>
            ) : serverError ? (
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{serverError}</p>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ensure your notification times and reminder options are saved.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-emerald-950/40 transition hover:from-emerald-500 hover:to-teal-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Save size={18} />
            {isSubmitting ? 'Saving settings...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
