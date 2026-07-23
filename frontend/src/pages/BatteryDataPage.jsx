
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CsvUploadPanel from '../components/CsvUploadPanel.jsx';
import { batteryFields } from '../constants/batteryFields.js';
import { deleteBatteryRecord, getBatteryHistory } from '../services/batteryService.js';
import { getErrorMessage } from '../utils/getErrorMessage.js';
import { useToast } from '../components/Toast.jsx';
import { useConfirm } from '../components/ConfirmDialog.jsx';

export default function BatteryDataPage() {
  const { t } = useTranslation();
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [source, setSource] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadRecords = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const data = await getBatteryHistory({ page: pagination.page, limit: pagination.limit, ...(source ? { source } : {}) });
      setRecords(data.records);
      setPagination(data.pagination);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, source]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const toast = useToast();
  const confirm = useConfirm();

  async function handleDelete(recordId) {
    const confirmed = await confirm({ title: t('common.delete'), message: t('common.deleteConfirm') });

    if (!confirmed) {
      return;
    }

    try {
      await deleteBatteryRecord(recordId);
      toast.addToast('Battery record deleted.', 'success');
      loadRecords();
    } catch (deleteError) {
      toast.addToast(getErrorMessage(deleteError), 'error');
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-accent-light">{t('battery.title')}</p>
          <h1 className="mt-2 text-3xl font-bold text-white">{t('battery.heading')}</h1>
          <p className="mt-2 max-w-2xl text-slate-300">{t('battery.description')}</p>
        </div>
        <Link className="rounded-lg bg-accent px-4 py-3 font-semibold text-slate-950 hover:bg-accent-light shadow-[0_0_18px_rgba(6,182,212,0.35)] transition" to="/battery/new">
          {t('battery.addRecord')}
        </Link>
      </div>

      <CsvUploadPanel onUploaded={loadRecords} />

      <div className="rounded-lg border border-cyan-500/15 bg-slate-900/80">
        <div className="flex flex-col gap-3 border-b border-cyan-500/20 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold text-white">{t('battery.history')}</h2>
            <p className="text-sm text-slate-300">{t('battery.recordsStored', { count: pagination.total })}</p>
          </div>
          <select
            className="w-full rounded border border-cyan-500/25 bg-slate-950 px-3 py-2 text-sm text-slate-200 md:w-auto"
            value={source}
            onChange={(event) => {
              setSource(event.target.value);
              setPagination((current) => ({ ...current, page: 1 }));
            }}
          >
            <option value="">{t('battery.allSources')}</option>
            <option value="manual">{t('battery.manual')}</option>
            <option value="csv">{t('battery.csv')}</option>
          </select>
        </div>
        {error ? <p className="p-4 text-sm text-danger-light">{error}</p> : null}
        {isLoading ? <p className="p-4 text-sm text-slate-400">{t('battery.loading')}</p> : null}
        {!isLoading && records.length === 0 ? <p className="p-4 text-sm text-slate-400">{t('battery.noRecords')}</p> : null}
        {records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
               <thead className="bg-slate-950 text-slate-300">
                <tr>
                  <th className="px-4 py-3">{t('battery.source')}</th>
                  {batteryFields.slice(0, 6).map((field) => (
                    <th key={field.name} className="px-4 py-3">{field.label}</th>
                  ))}
                  <th className="px-4 py-3">{t('battery.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {records.map((record) => (
                  <tr key={record._id} className="text-slate-200">
                    <td className="px-4 py-3 uppercase">{record.source}</td>
                    {batteryFields.slice(0, 6).map((field) => (
                      <td key={field.name} className="px-4 py-3">{record[field.name]}</td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                         <Link className="text-accent-light hover:text-white" to={`/battery/${record._id}/edit`}>
                          {t('battery.edit')}
                        </Link>
                         <button className="text-danger-light hover:text-danger" type="button" onClick={() => handleDelete(record._id)}>
                          {t('battery.delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </section>
  );
}