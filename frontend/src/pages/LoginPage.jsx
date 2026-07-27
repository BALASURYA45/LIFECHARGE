import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthCard from '../components/AuthCard.jsx';
import FormField from '../components/FormField.jsx';
import SubmitButton from '../components/SubmitButton.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { getErrorMessage } from '../utils/getErrorMessage.js';

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
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

  return (
    <AuthCard title={t('auth.login.title')} subtitle={t('auth.login.subtitle')}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <FormField
          label={t('auth.login.email')}
          type="email"
          autoComplete="email"
          error={errors.email}
          {...register('email', { required: 'Email is required' })}
        />
        <FormField
          label={t('auth.login.password')}
          type="password"
          autoComplete="current-password"
          error={errors.password}
          {...register('password', { required: 'Password is required' })}
        />
        {serverError ? <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{serverError}</p> : null}
        <SubmitButton isLoading={isSubmitting}>{t('auth.login.submit')}</SubmitButton>
      </form>
      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm">
        <Link className="text-slate-600 hover:text-slate-900 font-medium transition-colors" to="/forgot-password">
          {t('auth.login.forgotPassword')}
        </Link>
        <Link className="text-slate-900 font-bold hover:underline underline-offset-4" to="/register">
          {t('auth.login.createAccount')}
        </Link>
      </div>
    </AuthCard>
  );
}