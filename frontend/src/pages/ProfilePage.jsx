import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import FormField from '../components/FormField.jsx';
import SubmitButton from '../components/SubmitButton.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { getErrorMessage } from '../utils/getErrorMessage.js';

export default function ProfilePage() {
  const { t } = useTranslation();
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
      setMessage(t('profile.updated'));
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  }

  return (
    <section className="max-w-xl lc-card-static rounded-2xl p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900">{t('profile.title')}</h1>
        <p className="mt-1 text-sm text-slate-600">{user?.email}</p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <FormField
          label={t('profile.name')}
          type="text"
          error={errors.name}
          {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name is too short' } })}
        />
        {message ? <p className="text-sm text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">{message}</p> : null}
        {serverError ? <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{serverError}</p> : null}
        <SubmitButton isLoading={isSubmitting}>{t('profile.save')}</SubmitButton>
      </form>
    </section>
  );
}