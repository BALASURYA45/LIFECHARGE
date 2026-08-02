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

function formatPercentage(value) {
  return value === null || value === undefined ? '' : `${value}%`;
}

function formatNumber(value) {
  return value === null || value === undefined ? '' : String(value);
}

function formatPredictionInput(input) {
  if (!input) return {};
  return {
    batteryAge: formatNumber(input.batteryAge),
    chargingCycles: formatNumber(input.chargingCycles),
    chargingFrequency: formatNumber(input.chargingFrequency),
    fastChargingUsage: formatPercentage(input.fastChargingUsage),
    averageTemperature: formatNumber(input.averageTemperature),
    chargingDuration: formatNumber(input.chargingDuration),
    dailyDistance: formatNumber(input.dailyDistance),
    socHistory: formatPercentage(input.socHistory),
    batteryCapacity: formatNumber(input.batteryCapacity),
    voltage: formatNumber(input.voltage),
    current: formatNumber(input.current),
    totalKmDriven: formatNumber(input.totalKmDriven),
    expectedCycles: formatNumber(input.expectedCycles),
    typicalRange: formatNumber(input.typicalRange),
    estimatedLifeYears: formatNumber(input.estimatedLifeYears),
  };
}

function formatEnhancements(enhancements) {
  if (!enhancements) return {};
  return {
    thermalStress: enhancements.thermalStress?.level || '',
    cyclicStress: enhancements.cyclicStress?.level || '',
    anomalyScore: formatNumber(enhancements.anomalyDetection?.score),
    anomalyDetected: enhancements.anomalyDetection?.isAnomalous ? 'Yes' : 'No',
    prognosisOptimal: enhancements.prognosis?.OPTIMAL?.monthsTo80SOH ? `${enhancements.prognosis.OPTIMAL.monthsTo80SOH} months` : '',
    prognosisModerate: enhancements.prognosis?.MODERATE?.monthsTo80SOH ? `${enhancements.prognosis.MODERATE.monthsTo80SOH} months` : '',
    prognosisHarsh: enhancements.prognosis?.HARSH?.monthsTo80SOH ? `${enhancements.prognosis.HARSH.monthsTo80SOH} months` : '',
  };
}

function addSectionHeading(doc, title) {
  doc.moveDown(0.5);
  doc.font('Helvetica-Bold').fontSize(14).fillColor('#0f172a').text(title);
  doc.moveDown(0.2);
  const lineY = doc.y;
  doc.rect(48, lineY, 504, 6).fill('#111827');
  doc.moveDown(1.2);
}

function addKeyValueTable(doc, rows) {
  const rowHeight = 20;
  const startX = 48;
  const labelWidth = 220;
  const valueX = 280;
  const tableWidth = 504;

  rows.forEach((row, index) => {
    if (doc.y + rowHeight > 760) {
      doc.addPage();
    }

    if (index % 2 === 1) {
      doc.save();
      doc.fillColor('#f8fafc').rect(startX, doc.y, tableWidth, rowHeight).fill();
      doc.restore();
    }

    const labelText = row[0] || '–';
    const valueText = row[1] === undefined || row[1] === null || row[1] === '' ? 'N/A' : String(row[1]);

    doc.font('Helvetica-Bold').fontSize(10).fillColor('#0f172a').text(labelText, startX + 6, doc.y + 5, {
      width: labelWidth - 12,
      lineBreak: false,
    });
    doc.font('Helvetica').fontSize(10).fillColor('#475569').text(valueText, valueX + 6, doc.y + 5, {
      width: tableWidth - valueX - 12,
      align: 'left',
      lineBreak: false,
    });

    doc.y += rowHeight;
  });

  doc.moveDown(0.8);
}

function addHistoryTable(doc, rows) {
  const rowHeight = 20;
  const startX = 48;
  const tableWidth = 504;
  const columns = [180, 80, 80, 120];

  doc.font('Helvetica-Bold').fontSize(10).fillColor('#0f172a');
  doc.text('Date', startX + 6, doc.y + 5, { width: columns[0] - 12 });
  doc.text('SOH', startX + columns[0] + 6, doc.y + 5, { width: columns[1] - 12 });
  doc.text('RUL', startX + columns[0] + columns[1] + 6, doc.y + 5, { width: columns[2] - 12 });
  doc.text('Status', startX + columns[0] + columns[1] + columns[2] + 6, doc.y + 5, { width: columns[3] - 12 });
  doc.y += rowHeight;

  rows.forEach((row, index) => {
    if (doc.y + rowHeight > 760) {
      doc.addPage();
    }

    if (index % 2 === 1) {
      doc.save();
      doc.fillColor('#f8fafc').rect(startX, doc.y, tableWidth, rowHeight).fill();
      doc.restore();
    }

    doc.font('Helvetica').fontSize(10).fillColor('#475569');
    doc.text(row[0], startX + 6, doc.y + 5, { width: columns[0] - 12 });
    doc.text(row[1], startX + columns[0] + 6, doc.y + 5, { width: columns[1] - 12 });
    doc.text(row[2], startX + columns[0] + columns[1] + 6, doc.y + 5, { width: columns[2] - 12 });
    doc.text(row[3], startX + columns[0] + columns[1] + columns[2] + 6, doc.y + 5, { width: columns[3] - 12 });
    doc.y += rowHeight;
  });

  doc.moveDown(0.8);
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
    'Vehicle Category',
    'Vehicle Make',
    'Vehicle Model',
    'Vehicle Type',
    'SOH',
    'RUL',
    'Battery Status',
    'Risk Score',
    'Risk Label',
    'Confidence Score',
    'Degradation Trend',
    'Model Name',
    'Model Training ID',
    'Battery Age',
    'Charging Cycles',
    'Charging Frequency',
    'Fast Charging Usage',
    'Average Temperature',
    'Charging Duration',
    'Daily Distance',
    'SOC History',
    'Battery Capacity',
    'Voltage',
    'Current',
    'Total KM Driven',
    'Expected Cycles',
    'Typical Range',
    'Estimated Life Years',
    'Thermal Stress',
    'Cyclic Stress',
    'Anomaly Score',
    'Anomaly Detected',
    'Risk Factors',
    'Recommendations Summary',
    'Explanation',
  ];

  const rows = predictions.map((prediction) => {
    const input = formatPredictionInput(prediction.input);
    const enhancements = formatEnhancements(prediction.enhancements);
    return [
      formatDate(prediction.createdAt),
      prediction.vehicleCategory || '',
      prediction.vehicleMake || '',
      prediction.vehicleModel || '',
      prediction.vehicleType || '',
      prediction.SOH,
      prediction.RUL,
      prediction.batteryStatus,
      prediction.riskScore,
      prediction.riskLabel,
      prediction.confidenceScore,
      prediction.degradationTrend,
      prediction.modelName,
      prediction.modelTrainingId,
      input.batteryAge,
      input.chargingCycles,
      input.chargingFrequency,
      input.fastChargingUsage,
      input.averageTemperature,
      input.chargingDuration,
      input.dailyDistance,
      input.socHistory,
      input.batteryCapacity,
      input.voltage,
      input.current,
      input.totalKmDriven,
      input.expectedCycles,
      input.typicalRange,
      input.estimatedLifeYears,
      enhancements.thermalStress,
      enhancements.cyclicStress,
      enhancements.anomalyScore,
      enhancements.anomalyDetected,
      prediction.riskFactors?.join('; ') || '',
      prediction.recommendations?.summary || '',
      prediction.explanation?.plainEnglishExplanation || '',
    ];
  });

  return [headers, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');
}

export async function generatePredictionPdf(userId, user) {
  const predictions = await getReportPredictions(userId);
  await createReportMetadata(userId, 'pdf', predictions.length);

  if (!predictions.length) {
    throw new AppError('No predictions found. Generate predictions before creating a report.', 404);
  }

  const latest = predictions[0];
  const input = formatPredictionInput(latest.input);
  const enhancements = formatEnhancements(latest.enhancements);
  const doc = new PDFDocument({ margin: 48, size: 'A4' });
  const chunks = [];

  doc.on('data', (chunk) => chunks.push(chunk));

  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(22).text('LIFECHARGE Battery Health Report', { align: 'center' });
  doc.moveDown(0.5);
  doc.font('Helvetica').fontSize(10).fillColor('#475569').text(`Generated for ${user.name || 'User'} (${user.email || 'N/A'})`, { align: 'center' });
  doc.text(`Generated at ${formatDate(new Date())}`, { align: 'center' });
  doc.moveDown(1);

  doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(48, doc.y).lineTo(548, doc.y).stroke();
  doc.moveDown(1);

  addSectionHeading(doc, 'Executive Summary');
  doc.font('Helvetica').fontSize(11).fillColor('#475569').text(`This report documents the latest battery health evaluation for ${latest.vehicleMake || 'your vehicle'} ${latest.vehicleModel || ''}. It provides a clear summary of current health, remaining useful life, risk factors, confidence, and recommended next steps.`, { lineGap: 3 });
  doc.moveDown(0.5);
  doc.list([
    `SOH ${latest.SOH}% indicates ${100 - latest.SOH}% degradation from new condition.`,
    `RUL ${latest.RUL} months estimates remaining service life based on current operating behavior.`,
    `Risk level: ${latest.riskLabel || 'N/A'} (${latest.riskScore ?? 'N/A'}).`,
    `Confidence: ${latest.confidenceScore ?? 'N/A'}% using model ${latest.modelName || 'N/A'}.`,
  ], { bulletRadius: 2, textIndent: 12, lineGap: 3 });

  addSectionHeading(doc, 'Vehicle & Battery Profile');
  addKeyValueTable(doc, [
    ['Category', latest.vehicleCategory || 'N/A'],
    ['Make', latest.vehicleMake || 'N/A'],
    ['Model', latest.vehicleModel || 'N/A'],
    ['Vehicle Type', latest.vehicleType || 'N/A'],
  ]);

  addSectionHeading(doc, 'Operating Inputs');
  addKeyValueTable(doc, [
    ['Battery Age', `${input.batteryAge || 'N/A'} months`],
    ['Charging Cycles', input.chargingCycles],
    ['Charging Frequency', input.chargingFrequency],
    ['Fast Charging Usage', input.fastChargingUsage],
    ['Average Temperature', `${input.averageTemperature || 'N/A'} °C`],
    ['Charging Duration', `${input.chargingDuration || 'N/A'} minutes`],
    ['Daily Distance', `${input.dailyDistance || 'N/A'} km`],
    ['SOC History', input.socHistory],
    ['Battery Capacity', `${input.batteryCapacity || 'N/A'} kWh`],
    ['Voltage', `${input.voltage || 'N/A'} V`],
    ['Current', `${input.current || 'N/A'} A`],
    ['Total KM Driven', `${input.totalKmDriven || 'N/A'} km`],
    ['Expected Cycles', input.expectedCycles],
    ['Typical Range', `${input.typicalRange || 'N/A'} km`],
    ['Estimated Life Years', input.estimatedLifeYears],
  ]);

  addSectionHeading(doc, 'Latest Prediction Details');
  addKeyValueTable(doc, [
    ['SOH', `${latest.SOH}%`],
    ['RUL', `${latest.RUL} months`],
    ['Battery Status', latest.batteryStatus || 'N/A'],
    ['Risk Score', `${latest.riskScore ?? 'N/A'} (${latest.riskLabel || 'N/A'})`],
    ['Confidence', `${latest.confidenceScore ?? 'N/A'}%`],
    ['Degradation Trend', latest.degradationTrend || 'N/A'],
    ['Model', latest.modelName || 'N/A'],
    ['Prediction Date', formatDate(latest.createdAt)],
  ]);

  if (latest.riskFactors?.length) {
    addSectionHeading(doc, 'Risk Drivers');
    latest.riskFactors.forEach((factor) => {
      doc.font('Helvetica').fontSize(11).fillColor('#475569').text(`• ${factor}`, { paragraphGap: 2 });
    });
  }

  if (latest.recommendations?.items?.length) {
    addSectionHeading(doc, 'Recommendations');
    latest.recommendations.items.slice(0, 6).forEach((item, index) => {
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#0f172a').text(`${index + 1}. ${item.title}`);
      doc.font('Helvetica').fontSize(10).fillColor('#475569').text(item.description, { indent: 18, lineGap: 2 });
      doc.moveDown(0.5);
    });
  }

  if (latest.explanation?.plainEnglishExplanation) {
    addSectionHeading(doc, 'Explainability Summary');
    doc.font('Helvetica').fontSize(11).fillColor('#475569').text(latest.explanation.plainEnglishExplanation, { lineGap: 3 });
  }

  addSectionHeading(doc, 'Enhancements & Prognosis');
  addKeyValueTable(doc, [
    ['Thermal Stress', enhancements.thermalStress],
    ['Cyclic Stress', enhancements.cyclicStress],
    ['Anomaly Detected', enhancements.anomalyDetected],
    ['Anomaly Score', enhancements.anomalyScore],
    ['Optimal Prognosis', enhancements.prognosisOptimal],
    ['Moderate Prognosis', enhancements.prognosisModerate],
    ['Harsh Prognosis', enhancements.prognosisHarsh],
  ]);

  doc.addPage();
  addSectionHeading(doc, 'Recent Prediction History');
  addHistoryTable(
    doc,
    predictions.slice(0, 20).map((prediction) => [
      formatDate(prediction.createdAt),
      `${prediction.SOH}%`,
      `${prediction.RUL} months`,
      prediction.batteryStatus || 'N/A',
    ])
  );

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
  });
}
