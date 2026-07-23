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
        {serverError ? <p className="text-sm text-danger-light">{serverError}</p> : null}
        <SubmitButton isLoading={isSubmitting}>{t('auth.login.submit')}</SubmitButton>
      </form>
      <div className="mt-5 flex justify-between text-sm text-slate-300">
        <Link className="text-accent-light hover:text-white" to="/forgot-password">
          {t('auth.login.forgotPassword')}
        </Link>
        <Link className="text-accent-light hover:text-white" to="/register">
          {t('auth.login.createAccount')}
        </Link>
      </div>
    </AuthCard>
  );
}