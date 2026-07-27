import { FileDown, FileText, Sheet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      <div className="lc-card-static rounded-2xl p-5 sm:p-6 lg:p-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">{t('reports.title')}</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900 md:text-4xl tracking-tight">{t('reports.heading')}</h1>
        <p className="mt-3 max-w-3xl text-slate-600 leading-relaxed">
          {t('reports.description')}
        </p>
      </div>

      {message ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <article className="lc-card-static rounded-xl p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-900/20">
              <FileText size={24} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-black text-slate-900">{t('reports.pdfTitle')}</h2>
              <p className="text-sm text-slate-600">{t('reports.pdfDesc')}</p>
            </div>
          </div>
          <button
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-bold text-white hover:bg-slate-800 disabled:opacity-70 shadow-lg shadow-slate-900/20 transition-all duration-200"
            type="button"
            disabled={downloadingType === 'pdf'}
            onClick={() => handleDownload('pdf')}
          >
            <FileDown size={18} aria-hidden="true" />
            {downloadingType === 'pdf' ? t('reports.generating') : t('reports.downloadPdf')}
          </button>
        </article>

        <article className="lc-card-static rounded-xl p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-900/20">
              <Sheet size={24} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-black text-slate-900">{t('reports.csvTitle')}</h2>
              <p className="text-sm text-slate-600">{t('reports.csvDesc')}</p>
            </div>
          </div>
          <button
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-bold text-white hover:bg-slate-800 disabled:opacity-70 shadow-lg shadow-slate-900/20 transition-all duration-200"
            type="button"
            disabled={downloadingType === 'csv'}
            onClick={() => handleDownload('csv')}
          >
            <FileDown size={18} aria-hidden="true" />
            {downloadingType === 'csv' ? t('reports.generating') : t('reports.downloadCsv')}
          </button>
        </article>
      </div>

      <section className="lc-card-static rounded-xl overflow-hidden">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-black text-slate-900">{t('reports.history')}</h2>
        </div>
        {isLoading ? <p className="p-5 text-sm text-slate-500">{t('reports.loading')}</p> : null}
        {!isLoading && reports.length === 0 ? <p className="p-5 text-sm text-slate-600">{t('reports.noReports')}</p> : null}
        {reports.length ? (
          <div className="divide-y divide-slate-100">
            {reports.map((report) => (
              <article key={report._id} className="flex flex-col justify-between gap-2 p-5 text-sm md:flex-row md:items-center">
                <div>
                  <p className="font-bold text-slate-900">{report.title}</p>
                  <p className="mt-1 text-slate-600">
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