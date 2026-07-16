import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CsvUploadPanel from '../components/CsvUploadPanel.jsx';
import { batteryFields } from '../constants/batteryFields.js';
import { deleteBatteryRecord, getBatteryHistory } from '../services/batteryService.js';
import { getErrorMessage } from '../utils/getErrorMessage.js';

export default function BatteryDataPage() {
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

  async function handleDelete(recordId) {
    const confirmed = window.confirm('Delete this battery record?');

    if (!confirmed) {
      return;
    }

    await deleteBatteryRecord(recordId);
    loadRecords();
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-300">Battery Dataset Management</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Historical battery records</h1>
          <p className="mt-2 max-w-2xl text-slate-400">Add, import, validate, edit, and delete the records used by prediction and training modules.</p>
        </div>
        <Link className="rounded bg-teal-500 px-4 py-3 font-semibold text-slate-950 hover:bg-teal-400" to="/battery/new">
          Add record
        </Link>
      </div>

      <CsvUploadPanel onUploaded={loadRecords} />

      <div className="rounded border border-slate-800 bg-slate-900">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-800 p-4 md:flex-row md:items-center">
          <div>
            <h2 className="font-semibold text-white">Dataset history</h2>
            <p className="text-sm text-slate-400">{pagination.total} records stored</p>
          </div>
          <select
            className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200"
            value={source}
            onChange={(event) => {
              setSource(event.target.value);
              setPagination((current) => ({ ...current, page: 1 }));
            }}
          >
            <option value="">All sources</option>
            <option value="manual">Manual</option>
            <option value="csv">CSV</option>
          </select>
        </div>
        {error ? <p className="p-4 text-sm text-red-300">{error}</p> : null}
        {isLoading ? <p className="p-4 text-sm text-slate-400">Loading records...</p> : null}
        {!isLoading && records.length === 0 ? <p className="p-4 text-sm text-slate-400">No battery records found.</p> : null}
        {records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-slate-950 text-slate-400">
                <tr>
                  <th className="px-4 py-3">Source</th>
                  {batteryFields.slice(0, 6).map((field) => (
                    <th key={field.name} className="px-4 py-3">{field.label}</th>
                  ))}
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {records.map((record) => (
                  <tr key={record._id} className="text-slate-300">
                    <td className="px-4 py-3 uppercase">{record.source}</td>
                    {batteryFields.slice(0, 6).map((field) => (
                      <td key={field.name} className="px-4 py-3">{record[field.name]}</td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <Link className="text-teal-300 hover:text-teal-200" to={`/battery/${record._id}/edit`}>
                          Edit
                        </Link>
                        <button className="text-red-300 hover:text-red-200" type="button" onClick={() => handleDelete(record._id)}>
                          Delete
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
