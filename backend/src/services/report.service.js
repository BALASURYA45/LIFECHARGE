import PDFDocument from 'pdfkit';
import { Prediction } from '../models/Prediction.js';
import { Report } from '../models/Report.js';
import { AppError } from '../utils/AppError.js';

function formatDate(value) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function csvEscape(value) {
  const stringValue = value === null || value === undefined ? '' : String(value);
  return `"${stringValue.replaceAll('"', '""')}"`;
}

async function getReportPredictions(userId) {
  return Prediction.find({ user: userId }).sort({ createdAt: -1 }).limit(100);
}

async function createReportMetadata(userId, type, predictionCount) {
  return Report.create({
    user: userId,
    type,
    title: type === 'pdf' ? 'Battery Health PDF Report' : 'Battery Prediction CSV Export',
    predictionCount,
    status: predictionCount ? 'generated' : 'empty',
  });
}

export async function listReports(userId) {
  return Report.find({ user: userId }).sort({ generatedAt: -1 }).limit(50);
}

export async function generatePredictionCsv(userId) {
  const predictions = await getReportPredictions(userId);
  await createReportMetadata(userId, 'csv', predictions.length);

  const headers = [
    'Generated At',
    'SOH',
    'RUL',
    'Battery Status',
    'Confidence Score',
    'Degradation Trend',
    'Model Name',
    'Fast Charging Usage',
    'Average Temperature',
    'SOC History',
  ];

  const rows = predictions.map((prediction) => [
    formatDate(prediction.createdAt),
    prediction.SOH,
    prediction.RUL,
    prediction.batteryStatus,
    prediction.confidenceScore,
    prediction.degradationTrend,
    prediction.modelName,
    prediction.input.fastChargingUsage,
    prediction.input.averageTemperature,
    prediction.input.socHistory,
  ]);

  return [headers, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');
}

export async function generatePredictionPdf(userId, user) {
  const predictions = await getReportPredictions(userId);
  await createReportMetadata(userId, 'pdf', predictions.length);

  if (!predictions.length) {
    throw new AppError('No predictions found. Generate predictions before creating a report.', 404);
  }

  const latest = predictions[0];
  const doc = new PDFDocument({ margin: 48, size: 'A4' });
  const chunks = [];

  doc.on('data', (chunk) => chunks.push(chunk));

  doc.fontSize(22).text('LIFECHARGE Battery Health Report', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(10).fillColor('#555').text(`Generated for ${user.name} (${user.email})`, { align: 'center' });
  doc.text(`Generated at ${formatDate(new Date())}`, { align: 'center' });
  doc.moveDown(1.5);

  doc.fillColor('#000').fontSize(16).text('Latest Prediction');
  doc.moveDown(0.5);
  doc.fontSize(11);
  doc.text(`SOH: ${latest.SOH}%`);
  doc.text(`RUL: ${latest.RUL} months`);
  doc.text(`Battery Status: ${latest.batteryStatus}`);
  doc.text(`Confidence Score: ${latest.confidenceScore}%`);
  doc.text(`Degradation Trend: ${latest.degradationTrend}`);
  doc.text(`Model: ${latest.modelName}`);
  doc.moveDown(1);

  if (latest.recommendations?.items?.length) {
    doc.fontSize(16).text('Recommendations');
    doc.moveDown(0.5);
    latest.recommendations.items.slice(0, 6).forEach((item, index) => {
      doc.fontSize(11).text(`${index + 1}. ${item.title} (${item.priority})`);
      doc.fillColor('#555').text(item.description, { indent: 16 });
      doc.fillColor('#000').moveDown(0.4);
    });
  }

  doc.addPage();
  doc.fontSize(16).text('Prediction History');
  doc.moveDown(0.5);

  predictions.slice(0, 30).forEach((prediction, index) => {
    doc.fontSize(10).text(
      `${index + 1}. ${formatDate(prediction.createdAt)} | SOH ${prediction.SOH}% | RUL ${prediction.RUL} months | ${prediction.batteryStatus} | Confidence ${prediction.confidenceScore}%`,
    );
  });

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
  });
}
