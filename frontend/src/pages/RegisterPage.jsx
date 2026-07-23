import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import AuthCard from '../components/AuthCard.jsx';
import FormField from '../components/FormField.jsx';
import SubmitButton from '../components/SubmitButton.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { getErrorMessage } from '../utils/getErrorMessage.js';

export default function RegisterPage() {
  const { t } = useTranslation();
  const { register: registerAccount } = useAuth();
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
      await registerAccount(values);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  }

  return (
    <AuthCard title={t('auth.register.title')} subtitle={t('auth.register.subtitle')}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <FormField
          label={t('auth.register.name')}
          type="text"
          autoComplete="name"
          error={errors.name}
          {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name is too short' } })}
        />
        <FormField
          label={t('auth.register.email')}
          type="email"
          autoComplete="email"
          error={errors.email}
          {...register('email', { required: 'Email is required' })}
        />
        <FormField
          label={t('auth.register.password')}
          type="password"
          autoComplete="new-password"
          error={errors.password}
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'Use at least 8 characters' },
            pattern: {
              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
              message: 'Use uppercase, lowercase, and a number',
            },
          })}
        />
        {serverError ? <p className="text-sm text-danger-light">{serverError}</p> : null}
        <SubmitButton isLoading={isSubmitting}>{t('auth.register.submit')}</SubmitButton>
      </form>
      <p className="mt-5 text-sm text-slate-300">
        {t('auth.register.alreadyRegistered')}{' '}
        <Link className="text-accent-light hover:text-white" to="/login">
          {t('auth.register.login')}
        </Link>
      </p>
    </AuthCard>
  );
}