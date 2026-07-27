import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BatteryDataForm from '../components/BatteryDataForm.jsx';
import { createBatteryRecord, getBatteryRecord, updateBatteryRecord } from '../services/batteryService.js';
import { getErrorMessage } from '../utils/getErrorMessage.js';

export default function BatteryDataFormPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(Boolean(id));
  const isEditing = Boolean(id);

  useEffect(() => {
    let isMounted = true;

    async function loadRecord() {
      if (!id) {
        return;
      }

      try {
        const data = await getBatteryRecord(id);
        if (isMounted) {
          setRecord(data.record);
        }
      } catch (loadError) {
        setError(getErrorMessage(loadError));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadRecord();

    return () => {
      isMounted = false;
    };
  }, [id]);

  async function handleSubmit(values) {
    setError('');

    try {
      if (isEditing) {
        await updateBatteryRecord(id, values);
      } else {
        await createBatteryRecord(values);
      }

      navigate('/battery');
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    }
  }

  return (
    <section className="mx-auto max-w-4xl lc-card-static rounded-2xl p-5 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">{t('battery.title')}</p>
          <h1 className="mt-2 text-2xl font-black text-slate-900 tracking-tight">
            {isEditing ? t('batteryForm.editRecord') : t('batteryForm.addRecord')}
          </h1>
        </div>
        <Link className="lc-focus text-sm font-semibold text-slate-900 hover:text-accent transition-colors" to="/battery">
          {t('common.backToHistory')}
        </Link>
      </div>
      {error ? <p className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}
      {isLoading ? (
        <p className="text-sm text-slate-500">{t('batteryForm.loadingRecord')}</p>
      ) : (
        <BatteryDataForm defaultValues={record ?? {}} isLoading={isLoading} onSubmit={handleSubmit} />
      )}
    </section>
  );
}