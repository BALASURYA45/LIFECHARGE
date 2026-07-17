import { generatePredictionCsv, generatePredictionPdf, listReports } from '../services/report.service.js';

export async function reports(request, response) {
  const result = await listReports(request.user._id);
  response.status(200).json({ success: true, reports: result });
}

export async function reportCsv(request, response) {
  const csv = await generatePredictionCsv(request.user._id);

  response.setHeader('Content-Type', 'text/csv');
  response.setHeader('Content-Disposition', 'attachment; filename="lifecharge-predictions.csv"');
  response.status(200).send(csv);
}

export async function reportPdf(request, response) {
  const pdf = await generatePredictionPdf(request.user._id, request.user);

  response.setHeader('Content-Type', 'application/pdf');
  response.setHeader('Content-Disposition', 'attachment; filename="lifecharge-report.pdf"');
  response.status(200).send(pdf);
}
