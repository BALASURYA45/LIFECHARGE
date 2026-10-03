import { useState } from 'react';
import { Upload, Download, Sparkles, FileSpreadsheet, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { createBatteryRecord, uploadBatteryCsv } from '../services/batteryService.js';
import { getErrorMessage } from '../utils/getErrorMessage.js';

export default function CsvUploadPanel({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleUpload(event) {
    event.preventDefault();

    if (!file) {
      setError('Please select a valid CSV file first.');
      return;
    }

    setError('');
    setMessage('');
    setIsUploading(true);

    try {
      const data = await uploadBatteryCsv(file);
      setMessage(`${data.insertedCount} telemetry records imported successfully.`);
      setFile(null);
      if (onUploaded) onUploaded();
    } catch (uploadError) {
      const apiErrors = uploadError?.response?.data?.errors;
      setError(
        apiErrors?.length
          ? apiErrors.map((item) => `Row ${item.row}: ${item.message}`).join(' | ')
          : getErrorMessage(uploadError),
      );
    } finally {
      setIsUploading(false);
    }
  }

  function handleDownloadSample() {
    const sampleCsvContent = `batteryAge,chargingCycles,chargingFrequency,fastChargingUsage,averageTemperature,chargingDuration,dailyDistance,socHistory,batteryCapacity,voltage,current,notes
2.5,450,4.0,25.0,28.5,1.8,45.0,85.0,75.0,380.0,120.0,Commercial EV Log #1
3.2,680,5.5,42.0,35.2,2.4,65.0,92.0,71.5,372.0,145.0,Summer Highway Route Log
1.1,190,3.0,12.5,22.0,1.2,30.0,78.0,78.2,395.0,110.0,Optimal Climate Log
4.5,920,6.0,55.0,38.8,2.8,80.0,95.0,68.0,365.0,160.0,Frequent DC Fast Charge Entry`;

    const blob = new Blob([sampleCsvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'battery_telemetry_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function handleGenerateMockData() {
    setIsGenerating(true);
    setError('');
    setMessage('');

    try {
      const mockEntries = [
        {
          batteryAge: Number((1.5 + Math.random() * 2.5).toFixed(1)),
          chargingCycles: Math.floor(200 + Math.random() * 500),
          chargingFrequency: Number((3 + Math.random() * 3).toFixed(1)),
          fastChargingUsage: Number((15 + Math.random() * 35).toFixed(1)),
          averageTemperature: Number((24 + Math.random() * 12).toFixed(1)),
          chargingDuration: Number((1.5 + Math.random() * 1.5).toFixed(1)),
          dailyDistance: Number((35 + Math.random() * 45).toFixed(1)),
          socHistory: Number((75 + Math.random() * 20).toFixed(1)),
          batteryCapacity: Number((70 + Math.random() * 10).toFixed(1)),
          voltage: Number((370 + Math.random() * 25).toFixed(1)),
          current: Number((100 + Math.random() * 50).toFixed(1)),
          notes: 'Auto-generated high fidelity EV telemetry sample',
        },
        {
          batteryAge: Number((3.0 + Math.random() * 2.0).toFixed(1)),
          chargingCycles: Math.floor(650 + Math.random() * 400),
          chargingFrequency: Number((4.5 + Math.random() * 2.5).toFixed(1)),
          fastChargingUsage: Number((35 + Math.random() * 40).toFixed(1)),
          averageTemperature: Number((32 + Math.random() * 10).toFixed(1)),
          chargingDuration: Number((2.0 + Math.random() * 1.5).toFixed(1)),
          dailyDistance: Number((50 + Math.random() * 40).toFixed(1)),
          socHistory: Number((80 + Math.random() * 15).toFixed(1)),
          batteryCapacity: Number((66 + Math.random() * 8).toFixed(1)),
          voltage: Number((360 + Math.random() * 20).toFixed(1)),
          current: Number((120 + Math.random() * 60).toFixed(1)),
          notes: 'Auto-generated stress-profile EV telemetry sample',
        },
      ];

      for (const entry of mockEntries) {
        await createBatteryRecord(entry);
      }

      setMessage(`Generated ${mockEntries.length} sample EV telemetry records successfully.`);
      if (onUploaded) onUploaded();
    } catch (genError) {
      setError(getErrorMessage(genError));
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Title & Info */}
        <div className="flex items-start gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400">
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Data Import & Dataset Ingestion Hub
            </h3>
            <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
              Upload multi-cell battery telemetry datasets (CSV) or trigger sample telemetry generation.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadSample}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
          >
            <Download size={14} className="text-cyan-500" />
            Download Sample CSV
          </button>

          <button
            type="button"
            onClick={handleGenerateMockData}
            disabled={isGenerating}
            className="inline-flex items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 px-3.5 py-2 text-xs font-bold text-purple-600 transition hover:bg-purple-500/20 dark:bg-purple-500/20 dark:text-purple-300 dark:hover:bg-purple-500/30 disabled:opacity-60"
          >
            {isGenerating ? (
              <RefreshCw size={14} className="animate-spin text-purple-500" />
            ) : (
              <Sparkles size={14} className="text-purple-500" />
            )}
            {isGenerating ? 'Generating...' : 'Seed Mock Telemetry Data'}
          </button>
        </div>
      </div>

      {/* Upload Zone */}
      <form onSubmit={handleUpload} className="mt-5">
        <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-6 text-center transition hover:border-cyan-500 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-cyan-500">
          <Upload size={28} className="text-cyan-500 mb-2" />
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {file ? file.name : 'Select or drag your battery dataset (.csv)'}
          </p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Supports standard Lithium-ion sensor schemas (Voltage, Current, Temp, Cycles, Capacity)
          </p>

          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </div>

        {/* Feedback Messages */}
        {message && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={16} />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={isUploading || !file}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-cyan-600/20 transition hover:bg-cyan-500 disabled:opacity-50 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
          >
            {isUploading ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14} />}
            {isUploading ? 'Uploading Dataset...' : 'Import Dataset'}
          </button>
        </div>
      </form>
    </div>
  );
}
