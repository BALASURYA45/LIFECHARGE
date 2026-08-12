import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import GoogleAuthButton from '../components/GoogleAuthButton.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { getErrorMessage } from '../utils/getErrorMessage.js';

export default function RegisterPage() {
  const { t } = useTranslation();
  const { register: registerAuth, loginGoogle } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  async function onSubmit(values) {
    setServerError('');

    try {
      await registerAuth(values);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  }

  async function handleGoogleSuccess(credential) {
    setServerError('');
    try {
      await loginGoogle(credential);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-stretch lg:px-8">
      <div className="flex-1 rounded-[32px] border border-emerald-100 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 p-8 text-white shadow-2xl shadow-emerald-950/20 sm:p-10">
        <p className="mb-4 inline-flex rounded-full bg-white/15 px-3 py-1 text-sm font-medium backdrop-blur">LIFECHARGE</p>
        <h1 className="text-3xl font-black sm:text-4xl">Build your EV battery profile in minutes.</h1>
        <p className="mt-4 max-w-lg text-sm leading-7 text-emerald-50/90 sm:text-base">
          Create a secure account to save your routines, predictions, and maintenance insights in one place.
        </p>
        <div className="mt-8 space-y-3 text-sm text-emerald-50">
          <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3">• Sync your battery analysis history across devices.</div>
          <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3">• Access reports, predictions, and recommendations instantly.</div>
          <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3">• Sign up with Google or your email in seconds.</div>
        </div>
      </div>

      <div className="flex-1 rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-card backdrop-blur-xl sm:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-black text-slate-900">{t('auth.register.title')}</h2>
          <p className="mt-2 text-sm text-slate-500">{t('auth.register.subtitle')}</p>
        </div>

        <GoogleAuthButton label={t('auth.register.google')} onSuccess={handleGoogleSuccess} />

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">or create account</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">{t('auth.register.name')}</span>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white"
              type="text"
              autoComplete="name"
              {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name is too short' } })}
            />
            {errors.name ? <span className="mt-1 block text-sm text-red-500">{errors.name.message}</span> : null}
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">{t('auth.register.email')}</span>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white"
              type="email"
              autoComplete="email"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email ? <span className="mt-1 block text-sm text-red-500">{errors.email.message}</span> : null}
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">{t('auth.register.password')}</span>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white"
              type="password"
              autoComplete="new-password"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Use at least 8 characters' },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                  message: 'Use uppercase, lowercase, and a number',
                },
              })}
            />
            {errors.password ? <span className="mt-1 block text-sm text-red-500">{errors.password.message}</span> : null}
          </label>
          {serverError ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{serverError}</p> : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Creating account...' : t('auth.register.submit')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm">
          <span className="text-slate-600">{t('auth.register.alreadyRegistered')}</span>{' '}
          <Link className="font-semibold text-slate-900 transition hover:text-emerald-700" to="/login">
            {t('auth.register.login')}
          </Link>
        </p>
      </div>
    </section>
  );
}