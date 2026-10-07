import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import GoogleAuthButton from '../components/GoogleAuthButton.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { getErrorMessage } from '../utils/getErrorMessage.js';

import logoImage from '../assets/lithyx-logo.png';

export default function LoginPage() {
  const { t } = useTranslation();
  const { login, loginGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  async function onSubmit(values) {
    setServerError('');

    try {
      await login(values);
      navigate(location.state?.from?.pathname ?? '/dashboard', { replace: true });
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  }

  async function handleGoogleSuccess(credential) {
    setServerError('');
    try {
      await loginGoogle(credential);
      navigate(location.state?.from?.pathname ?? '/dashboard', { replace: true });
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-stretch lg:px-8">
      <div className="flex-1 rounded-[32px] border border-slate-800 bg-[#070D14] p-8 text-white shadow-2xl shadow-slate-950/40 sm:p-10 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <img src={logoImage} alt="LITHYX Logo" className="size-12 rounded-2xl border border-emerald-500/40 object-cover shadow-lg shadow-emerald-950/40" />
            <div>
              <p className="text-xl font-black tracking-[0.14em] text-white">LITHYX</p>
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Battery Intelligence Platform</p>
            </div>
          </div>
          <h1 className="text-3xl font-black sm:text-4xl text-white">Advanced Hybrid Physics & AI Battery Diagnostics</h1>
          <p className="mt-4 max-w-lg text-sm leading-7 text-emerald-100/90 sm:text-base">
            Review your daily, weekly, and monthly routines, understand your battery health, and keep your EV maintenance on track.
          </p>
          <div className="mt-8 space-y-3 text-sm text-emerald-100">
            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-950/30 px-4 py-3">• Guided routines that turn complex battery inputs into clear action plans.</div>
            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-950/30 px-4 py-3">• A clean dashboard for predictions, reports, and battery insights.</div>
            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-950/30 px-4 py-3">• Secure sign-in with email or Google in one step.</div>
          </div>
        </div>
      </div>

      <div className="flex-1 rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-card backdrop-blur-xl sm:p-8 dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mb-6">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">{t('auth.login.title')}</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t('auth.login.subtitle')}</p>
        </div>

        <GoogleAuthButton label={t('auth.login.google')} onSuccess={handleGoogleSuccess} />

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">or continue with email</span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('auth.login.email')}</span>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-900"
              type="email"
              autoComplete="email"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email ? <span className="mt-1 block text-sm text-emerald-500">{errors.email.message}</span> : null}
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('auth.login.password')}</span>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-900"
              type="password"
              autoComplete="current-password"
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password ? <span className="mt-1 block text-sm text-emerald-500">{errors.password.message}</span> : null}
          </label>
          {serverError ? <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300">{serverError}</p> : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-sm font-semibold text-white transition hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-950/40 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Signing in...' : t('auth.login.submit')}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
          <Link className="font-medium text-slate-600 transition hover:text-emerald-500 dark:text-slate-400 dark:hover:text-emerald-400" to="/forgot-password">
            {t('auth.login.forgotPassword')}
          </Link>
          <Link className="font-semibold text-slate-900 transition hover:text-emerald-500 dark:text-white dark:hover:text-emerald-400" to="/register">
            {t('auth.login.createAccount')}
          </Link>
        </div>
      </div>
    </section>
  );
}