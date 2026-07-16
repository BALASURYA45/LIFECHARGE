import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthCard from '../components/AuthCard.jsx';
import FormField from '../components/FormField.jsx';
import SubmitButton from '../components/SubmitButton.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { getErrorMessage } from '../utils/getErrorMessage.js';

export default function LoginPage() {
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
    <AuthCard title="Welcome back" subtitle="Login to continue monitoring EV battery health.">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email}
          {...register('email', { required: 'Email is required' })}
        />
        <FormField
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password}
          {...register('password', { required: 'Password is required' })}
        />
        {serverError ? <p className="text-sm text-red-300">{serverError}</p> : null}
        <SubmitButton isLoading={isSubmitting}>Login</SubmitButton>
      </form>
      <div className="mt-5 flex justify-between text-sm text-slate-400">
        <Link className="text-teal-300 hover:text-teal-200" to="/forgot-password">
          Forgot password?
        </Link>
        <Link className="text-teal-300 hover:text-teal-200" to="/register">
          Create account
        </Link>
      </div>
    </AuthCard>
  );
}
