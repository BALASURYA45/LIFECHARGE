
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
      <div className="lc-card-static rounded-2xl p-5 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">{t('battery.title')}</p>
            <h1 className="mt-2 text-3xl font-black text-slate-900 md:text-4xl tracking-tight">{t('battery.heading')}</h1>
            <p className="mt-3 max-w-2xl text-slate-600 leading-relaxed">{t('battery.description')}</p>
          </div>
          <Link className="lc-focus inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all duration-200" to="/battery/new">
            {t('battery.addRecord')}
          </Link>
        </div>
      </div>

      <CsvUploadPanel onUploaded={loadRecords} />

      <div className="lc-card-static rounded-xl overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">{t('battery.history')}</h2>
            <p className="text-sm text-slate-600">{t('battery.recordsStored', { count: pagination.total })}</p>
          </div>
          <select
            className="lc-focus w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 md:w-auto"
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
        {error ? <p className="p-5 text-sm text-red-700 bg-red-50 border-t border-red-100">{error}</p> : null}
        {isLoading ? <p className="p-5 text-sm text-slate-500">{t('battery.loading')}</p> : null}
        {!isLoading && records.length === 0 ? <p className="p-5 text-sm text-slate-600">{t('battery.noRecords')}</p> : null}
        {records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
               <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider">{t('battery.source')}</th>
                  {batteryFields.slice(0, 6).map((field) => (
                    <th key={field.name} className="px-5 py-3 text-xs font-bold uppercase tracking-wider">{field.label}</th>
                  ))}
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider">{t('battery.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((record) => (
                  <tr key={record._id} className="text-slate-900 hover:bg-slate-50/60">
                    <td className="px-5 py-4 uppercase text-xs font-semibold">{record.source}</td>
                    {batteryFields.slice(0, 6).map((field) => (
                      <td key={field.name} className="px-5 py-4">{record[field.name]}</td>
                    ))}
                    <td className="px-5 py-4">
                      <div className="flex gap-4">
                         <Link className="text-slate-900 font-semibold hover:text-accent transition-colors" to={`/battery/${record._id}/edit`}>
                          {t('battery.edit')}
                        </Link>
                         <button className="text-slate-600 hover:text-red-600 transition-colors" type="button" onClick={() => handleDelete(record._id)}>
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