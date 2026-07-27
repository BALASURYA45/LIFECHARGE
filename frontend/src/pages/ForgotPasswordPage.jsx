import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import AuthCard from '../components/AuthCard.jsx';
import FormField from '../components/FormField.jsx';
import SubmitButton from '../components/SubmitButton.jsx';
import { forgotPassword } from '../services/authService.js';
import { getErrorMessage } from '../utils/getErrorMessage.js';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  async function onSubmit(values) {
    setMessage('');
    setServerError('');

    try {
      const data = await forgotPassword(values);
      setMessage(data.resetToken ? `${data.message} Development token: ${data.resetToken}` : data.message);
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  }

  return (
    <AuthCard title={t('auth.forgotPassword.title')} subtitle={t('auth.forgotPassword.subtitle')}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <FormField
          label={t('auth.forgotPassword.email')}
          type="email"
          autoComplete="email"
          error={errors.email}
          {...register('email', { required: 'Email is required' })}
        />
        {message ? <p className="text-sm text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">{message}</p> : null}
        {serverError ? <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{serverError}</p> : null}
        <SubmitButton isLoading={isSubmitting}>{t('auth.forgotPassword.submit')}</SubmitButton>
      </form>
      <p className="mt-6 text-center text-sm">
        <span className="text-slate-600">{t('auth.forgotPassword.remembered')}</span>{' '}
        <Link className="text-slate-900 font-bold hover:underline underline-offset-4" to="/login">
          {t('auth.forgotPassword.backToLogin')}
        </Link>
      </p>
    </AuthCard>
  );
}