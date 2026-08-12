import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, BatteryCharging, Filter, Trash2, Edit3 } from 'lucide-react';
import CsvUploadPanel from '../components/CsvUploadPanel.jsx';
import { batteryFields } from '../constants/batteryFields.js';
import { deleteBatteryRecord, getBatteryHistory } from '../services/batteryService.js';
import { getErrorMessage } from '../utils/getErrorMessage.js';
import { useToast } from '../components/useToastHook.jsx';
import { useConfirm } from '../components/useConfirm.jsx';

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
    const confirmed = await confirm({ title: t('common.delete', 'Delete Record'), message: t('common.deleteConfirm', 'Are you sure you want to delete this battery record?') });

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
      {/* Header Banner */}
      <div className="lc-card-static rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400">
              <BatteryCharging size={28} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('battery.title', 'Battery Records')}</p>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white md:text-3xl tracking-tight">{t('battery.heading', 'EV Battery Records & Logs')}</h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">{t('battery.description', 'Manage your logged battery health history or upload CSV datasets.')}</p>
            </div>
          </div>

          <Link className="lc-focus inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-cyan-600/20 transition hover:bg-cyan-500 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400" to="/battery/new">
            <Plus size={18} />
            {t('battery.addRecord', 'Add New Record')}
          </Link>
        </div>
      </div>

      <CsvUploadPanel onUploaded={loadRecords} />

      {/* History Table Container */}
      <div className="lc-card-static rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">{t('battery.history', 'Recorded Battery Health Logs')}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('battery.recordsStored', { count: pagination.total })}</p>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <select
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white md:w-auto"
              value={source}
              onChange={(event) => {
                setSource(event.target.value);
                setPagination((current) => ({ ...current, page: 1 }));
              }}
            >
              <option value="">{t('battery.allSources', 'All Data Sources')}</option>
              <option value="manual">{t('battery.manual', 'Manual Entry')}</option>
              <option value="csv">{t('battery.csv', 'CSV Import')}</option>
            </select>
          </div>
        </div>

        {error ? <p className="p-5 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400">{error}</p> : null}
        {isLoading ? <p className="p-5 text-sm font-semibold text-slate-500 animate-pulse">{t('battery.loading', 'Loading records...')}</p> : null}
        {!isLoading && records.length === 0 ? <p className="p-5 text-sm text-slate-500 dark:text-slate-400">{t('battery.noRecords', 'No battery health records recorded yet.')}</p> : null}
        
        {records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
                <tr>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider">{t('battery.source', 'Source')}</th>
                  {batteryFields.slice(0, 6).map((field) => (
                    <th key={field.name} className="px-5 py-3 text-xs font-bold uppercase tracking-wider">{field.label}</th>
                  ))}
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider">{t('battery.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {records.map((record, index) => (
                  <tr
                    key={record._id}
                    className={`text-slate-900 dark:text-slate-200 transition-colors ${
                      index % 2 === 0
                        ? 'bg-white dark:bg-slate-900'
                        : 'bg-slate-100/80 dark:bg-slate-800/60'
                    } hover:bg-cyan-50/60 dark:hover:bg-slate-800/90`}
                  >
                    <td className="px-5 py-4 uppercase text-xs font-bold">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {record.source}
                      </span>
                    </td>
                    {batteryFields.slice(0, 6).map((field) => (
                      <td key={field.name} className="px-5 py-4 font-semibold">{record[field.name]}</td>
                    ))}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3 text-xs font-bold">
                        <Link className="inline-flex items-center gap-1 text-cyan-600 hover:text-cyan-500 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors" to={`/battery/${record._id}/edit`}>
                          <Edit3 size={14} /> {t('battery.edit', 'Edit')}
                        </Link>
                        <button className="inline-flex items-center gap-1 text-red-500 hover:text-red-600 dark:text-red-400 transition-colors" type="button" onClick={() => handleDelete(record._id)}>
                          <Trash2 size={14} /> {t('battery.delete', 'Delete')}
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