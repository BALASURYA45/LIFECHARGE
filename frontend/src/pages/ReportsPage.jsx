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
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-accent-dark">{t('reports.title')}</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">{t('reports.heading')}</h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          {t('reports.description')}
        </p>
      </div>

      {message ? <p className="rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm text-accent-light">{message}</p> : null}
      {error ? <p className="rounded-lg border border-danger-light/30 bg-danger/10 p-3 text-sm text-danger-light">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border border-cyan-500/15 bg-slate-900/80 p-4 sm:p-5">
          <FileText className="text-accent-light" size={28} aria-hidden="true" />
          <h2 className="mt-4 text-lg font-semibold text-white">{t('reports.pdfTitle')}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            {t('reports.pdfDesc')}
          </p>
          <button
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 font-semibold text-slate-950 hover:bg-accent-light disabled:opacity-70 shadow-[0_0_18px_rgba(6,182,212,0.35)] transition"
            type="button"
            disabled={downloadingType === 'pdf'}
            onClick={() => handleDownload('pdf')}
          >
            <FileDown size={18} aria-hidden="true" />
            {downloadingType === 'pdf' ? t('reports.generating') : t('reports.downloadPdf')}
          </button>
        </article>

        <article className="rounded-lg border border-cyan-500/15 bg-slate-900/80 p-4 sm:p-5">
          <Sheet className="text-accent-light" size={28} aria-hidden="true" />
          <h2 className="mt-4 text-lg font-semibold text-white">{t('reports.csvTitle')}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            {t('reports.csvDesc')}
          </p>
          <button
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 font-semibold text-slate-950 hover:bg-accent-light disabled:opacity-70 shadow-[0_0_18px_rgba(6,182,212,0.35)] transition"
            type="button"
            disabled={downloadingType === 'csv'}
            onClick={() => handleDownload('csv')}
          >
            <FileDown size={18} aria-hidden="true" />
            {downloadingType === 'csv' ? t('reports.generating') : t('reports.downloadCsv')}
          </button>
        </article>
      </div>

      <section className="rounded-lg border border-cyan-500/15 bg-slate-900/80">
        <div className="border-b border-cyan-500/20 p-4">
          <h2 className="font-semibold text-white">{t('reports.history')}</h2>
        </div>
        {isLoading ? <p className="p-4 text-sm text-slate-400">{t('reports.loading')}</p> : null}
        {!isLoading && reports.length === 0 ? <p className="p-4 text-sm text-slate-300">{t('reports.noReports')}</p> : null}
        {reports.length ? (
          <div className="divide-y divide-cyan-500/15">
            {reports.map((report) => (
              <article key={report._id} className="flex flex-col justify-between gap-2 p-4 text-sm md:flex-row md:items-center">
                <div>
                  <p className="font-semibold text-white">{report.title}</p>
                  <p className="mt-1 text-slate-300">
                    {report.type.toUpperCase()} | {report.predictionCount} predictions | {report.status}
                  </p>
                </div>
                <p className="text-slate-400">{formatDate(report.generatedAt)}</p>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </section>
  );
}