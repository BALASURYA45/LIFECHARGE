import { FileDown, FileText, Sheet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { downloadReport, getReports } from '../services/reportService.js';
import { getErrorMessage } from '../utils/getErrorMessage.js';

function formatDate(value) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingType, setDownloadingType] = useState('');

  async function loadReports() {
    setIsLoading(true);

    try {
      const data = await getReports();
      setReports(data.reports);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  async function handleDownload(type) {
    setError('');
    setMessage('');
    setDownloadingType(type);

    try {
      const blob = await downloadReport(type);
      saveBlob(blob, type === 'pdf' ? 'lifecharge-report.pdf' : 'lifecharge-predictions.csv');
      setMessage(`${type.toUpperCase()} report generated successfully.`);
      await loadReports();
    } catch (downloadError) {
      setError(getErrorMessage(downloadError));
    } finally {
      setDownloadingType('');
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-300">Reports</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Export battery health reports</h1>
        <p className="mt-2 max-w-3xl text-slate-400">
          Generate PDF reports for submission and CSV exports for analysis from stored prediction history.
        </p>
      </div>

      {message ? <p className="rounded border border-teal-800 bg-teal-950 p-3 text-sm text-teal-100">{message}</p> : null}
      {error ? <p className="rounded border border-red-900 bg-red-950 p-3 text-sm text-red-200">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded border border-slate-800 bg-slate-900 p-5">
          <FileText className="text-teal-300" size={28} aria-hidden="true" />
          <h2 className="mt-4 text-lg font-semibold text-white">PDF Report</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Includes latest SOH/RUL, battery status, recommendations, and prediction history.
          </p>
          <button
            className="mt-5 inline-flex items-center gap-2 rounded bg-teal-500 px-4 py-3 font-semibold text-slate-950 hover:bg-teal-400 disabled:opacity-70"
            type="button"
            disabled={downloadingType === 'pdf'}
            onClick={() => handleDownload('pdf')}
          >
            <FileDown size={18} aria-hidden="true" />
            {downloadingType === 'pdf' ? 'Generating...' : 'Download PDF'}
          </button>
        </article>

        <article className="rounded border border-slate-800 bg-slate-900 p-5">
          <Sheet className="text-teal-300" size={28} aria-hidden="true" />
          <h2 className="mt-4 text-lg font-semibold text-white">CSV Export</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Exports prediction history with SOH, RUL, status, confidence, and key input features.
          </p>
          <button
            className="mt-5 inline-flex items-center gap-2 rounded bg-teal-500 px-4 py-3 font-semibold text-slate-950 hover:bg-teal-400 disabled:opacity-70"
            type="button"
            disabled={downloadingType === 'csv'}
            onClick={() => handleDownload('csv')}
          >
            <FileDown size={18} aria-hidden="true" />
            {downloadingType === 'csv' ? 'Generating...' : 'Download CSV'}
          </button>
        </article>
      </div>

      <section className="rounded border border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800 p-4">
          <h2 className="font-semibold text-white">Report history</h2>
        </div>
        {isLoading ? <p className="p-4 text-sm text-slate-400">Loading reports...</p> : null}
        {!isLoading && reports.length === 0 ? <p className="p-4 text-sm text-slate-400">No reports generated yet.</p> : null}
        {reports.length ? (
          <div className="divide-y divide-slate-800">
            {reports.map((report) => (
              <article key={report._id} className="flex flex-col justify-between gap-2 p-4 text-sm md:flex-row md:items-center">
                <div>
                  <p className="font-semibold text-white">{report.title}</p>
                  <p className="mt-1 text-slate-400">
                    {report.type.toUpperCase()} | {report.predictionCount} predictions | {report.status}
                  </p>
                </div>
                <p className="text-slate-500">{formatDate(report.generatedAt)}</p>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </section>
  );
}
