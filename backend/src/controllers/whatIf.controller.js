import { runWhatIfSimulation } from '../services/whatIf.service.js';

export async function simulateWhatIf(request, response) {
  const result = await runWhatIfSimulation(request.body);
  response.status(200).json({ success: true, result });
}
