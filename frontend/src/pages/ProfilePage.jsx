import { useState } from 'react';
import { useForm } from 'react-hook-form';
import FormField from '../components/FormField.jsx';
import SubmitButton from '../components/SubmitButton.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { getErrorMessage } from '../utils/getErrorMessage.js';

export default function ProfilePage() {
  const { user, saveProfile } = useAuth();
  const [message, setMessage] = useState('');
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: user?.name ?? '',
    },
  });

  async function onSubmit(values) {
    setMessage('');
    setServerError('');

    try {
      await saveProfile(values);
      setMessage('Profile updated successfully.');
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  }

  return (
    <section className="max-w-xl rounded border border-slate-800 bg-slate-900 p-6">
      <h1 className="text-2xl font-bold text-white">Profile</h1>
      <p className="mt-2 text-sm text-slate-400">{user?.email}</p>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <FormField
          label="Name"
          type="text"
          error={errors.name}
          {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name is too short' } })}
        />
        {message ? <p className="text-sm text-teal-300">{message}</p> : null}
        {serverError ? <p className="text-sm text-red-300">{serverError}</p> : null}
        <SubmitButton isLoading={isSubmitting}>Save profile</SubmitButton>
      </form>
    </section>
  );
}
