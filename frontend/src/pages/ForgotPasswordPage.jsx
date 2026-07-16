import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import AuthCard from '../components/AuthCard.jsx';
import FormField from '../components/FormField.jsx';
import SubmitButton from '../components/SubmitButton.jsx';
import { forgotPassword } from '../services/authService.js';
import { getErrorMessage } from '../utils/getErrorMessage.js';

export default function ForgotPasswordPage() {
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
    <AuthCard title="Reset password" subtitle="Enter your registered email to receive a secure reset link.">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email}
          {...register('email', { required: 'Email is required' })}
        />
        {message ? <p className="rounded border border-teal-800 bg-teal-950 p-3 text-sm text-teal-100">{message}</p> : null}
        {serverError ? <p className="text-sm text-red-300">{serverError}</p> : null}
        <SubmitButton isLoading={isSubmitting}>Send reset link</SubmitButton>
      </form>
      <Link className="mt-5 inline-block text-sm text-teal-300 hover:text-teal-200" to="/login">
        Back to login
      </Link>
    </AuthCard>
  );
}
