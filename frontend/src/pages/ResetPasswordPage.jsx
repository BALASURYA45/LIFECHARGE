import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import AuthCard from '../components/AuthCard.jsx';
import FormField from '../components/FormField.jsx';
import SubmitButton from '../components/SubmitButton.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { resetPassword } from '../services/authService.js';
import { getErrorMessage } from '../utils/getErrorMessage.js';

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const { token } = useParams();
  const { login } = useAuth();
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
      const data = await resetPassword(token, values);
      await login({ email: data.user.email, password: values.password });
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  }

  return (
    <AuthCard title={t('auth.resetPassword.title')} subtitle={t('auth.resetPassword.subtitle')}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <FormField
          label={t('auth.resetPassword.newPassword')}
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
        <SubmitButton isLoading={isSubmitting}>{t('auth.resetPassword.submit')}</SubmitButton>
      </form>
    </AuthCard>
  );
}