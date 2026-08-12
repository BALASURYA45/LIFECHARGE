import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BatteryCharging, ArrowLeft } from 'lucide-react';
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
    <section className="mx-auto max-w-4xl space-y-6">
      {/* Executive Header & Form Container */}
      <div className="lc-card-static rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400">
              <BatteryCharging size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('battery.title', 'Battery Intelligence')}
              </p>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {isEditing ? t('batteryForm.editRecord', 'Edit Battery Record') : t('batteryForm.addRecord', 'Add New Battery Profile')}
              </h1>
            </div>
          </div>

          <Link
            className="lc-focus inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750 self-start sm:self-auto"
            to="/battery"
          >
            <ArrowLeft size={16} />
            {t('common.backToHistory', 'Back to History')}
          </Link>
        </div>

        {error ? (
          <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-500/20 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </p>
        ) : null}

        <div className="mt-6">
          {isLoading ? (
            <p className="text-sm font-semibold text-slate-500 animate-pulse">{t('batteryForm.loadingRecord', 'Loading battery profile data...')}</p>
          ) : (
            <BatteryDataForm defaultValues={record ?? {}} isLoading={isLoading} onSubmit={handleSubmit} />
          )}
        </div>
      </div>
    </section>
  );
}