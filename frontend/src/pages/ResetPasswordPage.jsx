import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import AuthCard from '../components/AuthCard.jsx';
import FormField from '../components/FormField.jsx';
import SubmitButton from '../components/SubmitButton.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { resetPassword } from '../services/authService.js';
import { getErrorMessage } from '../utils/getErrorMessage.js';

export default function ResetPasswordPage() {
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
    <AuthCard title="Set new password" subtitle="Choose a strong password for your LIFECHARGE account.">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <FormField
          label="New password"
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
        {serverError ? <p className="text-sm text-red-300">{serverError}</p> : null}
        <SubmitButton isLoading={isSubmitting}>Reset password</SubmitButton>
      </form>
    </AuthCard>
  );
}
