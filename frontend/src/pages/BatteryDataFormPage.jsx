import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import BatteryDataForm from '../components/BatteryDataForm.jsx';
import { createBatteryRecord, getBatteryRecord, updateBatteryRecord } from '../services/batteryService.js';
import { getErrorMessage } from '../utils/getErrorMessage.js';

export default function BatteryDataFormPage() {
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
    <section className="mx-auto max-w-4xl rounded border border-slate-800 bg-slate-900 p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-300">Battery Dataset Management</p>
          <h1 className="mt-2 text-2xl font-bold text-white">{isEditing ? 'Edit battery record' : 'Add battery record'}</h1>
        </div>
        <Link className="text-sm text-teal-300 hover:text-teal-200" to="/battery">
          Back to history
        </Link>
      </div>
      {error ? <p className="mb-4 rounded border border-red-900 bg-red-950 p-3 text-sm text-red-200">{error}</p> : null}
      {isLoading ? <p className="text-sm text-slate-400">Loading record...</p> : <BatteryDataForm defaultValues={record ?? {}} isLoading={isLoading} onSubmit={handleSubmit} />}
    </section>
  );
}
