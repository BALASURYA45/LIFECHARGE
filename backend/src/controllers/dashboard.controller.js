import { getDashboardSummary } from '../services/dashboard.service.js';

export async function dashboardSummary(request, response) {
  const summary = await getDashboardSummary(request.user._id);
  response.status(200).json({ success: true, summary });
}
