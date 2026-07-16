import { useState } from 'react';
import { Upload } from 'lucide-react';
import { uploadBatteryCsv } from '../services/batteryService.js';
import { getErrorMessage } from '../utils/getErrorMessage.js';

export default function CsvUploadPanel({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  async function handleUpload(event) {
    event.preventDefault();

    if (!file) {
      setError('Choose a CSV file first');
      return;
    }

    setError('');
    setMessage('');
    setIsUploading(true);

    try {
      const data = await uploadBatteryCsv(file);
      setMessage(`${data.insertedCount} records imported successfully.`);
      setFile(null);
      onUploaded();
    } catch (uploadError) {
      const apiErrors = uploadError?.response?.data?.errors;
      setError(apiErrors?.length ? apiErrors.map((item) => `Row ${item.row}: ${item.message}`).join(' | ') : getErrorMessage(uploadError));
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form className="rounded border border-slate-800 bg-slate-900 p-5" onSubmit={handleUpload}>
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded bg-slate-800 text-teal-300">
          <Upload size={20} aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-semibold text-white">Upload CSV</h2>
          <p className="text-sm text-slate-400">Import historical battery records from a validated dataset.</p>
        </div>
      </div>
      <input
        className="mt-5 w-full rounded border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-slate-300"
        type="file"
        accept=".csv,text/csv"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
      />
      {message ? <p className="mt-3 text-sm text-teal-300">{message}</p> : null}
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
      <button
        className="mt-4 rounded bg-teal-500 px-4 py-2 font-semibold text-slate-950 hover:bg-teal-400 disabled:opacity-70"
        type="submit"
        disabled={isUploading}
      >
        {isUploading ? 'Uploading...' : 'Upload dataset'}
      </button>
    </form>
  );
}
