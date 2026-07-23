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
        {message ? <p className="rounded border border-energy/40 bg-energy/10 p-3 text-sm text-energy">{message}</p> : null}
        {serverError ? <p className="text-sm text-danger-light">{serverError}</p> : null}
        <SubmitButton isLoading={isSubmitting}>{t('auth.forgotPassword.submit')}</SubmitButton>
      </form>
      <Link className="mt-5 inline-block text-sm text-accent-light hover:text-white" to="/login">
        {t('auth.forgotPassword.backToLogin')}
      </Link>
    </AuthCard>
  );
}