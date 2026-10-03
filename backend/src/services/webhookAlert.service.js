import axios from 'axios';
import { logger } from '../utils/logger.js';

class WebhookAlertService {
  constructor() {
    this.webhookEndpoints = process.env.MAINTENANCE_WEBHOOK_URLS
      ? process.env.MAINTENANCE_WEBHOOK_URLS.split(',')
      : [];
  }

  async dispatchMaintenanceAlert({ vehicleId, soh, rul, anomalySeverity, alertType }) {
    const payload = {
      event: 'BATTERY_MAINTENANCE_ALERT',
      timestamp: new Date().toISOString(),
      vehicleId: vehicleId || 'EV_UNKNOWN',
      soh,
      rul,
      severity: anomalySeverity || 'WARNING',
      alertType: alertType || 'CAPACITY_DEGRADATION',
      message: `Critical battery maintenance required for vehicle ${vehicleId}. Current SOH: ${soh}%, RUL: ${rul} cycles.`,
    };

    logger.warn(`🚨 DISPATCHING MAINTENANCE ALERT WEBHOOK: ${payload.message}`);

    if (this.webhookEndpoints.length === 0) {
      logger.info('No external webhook URLs configured. Simulated webhook dispatch successful.');
      return { status: 'SIMULATED', payload };
    }

    const results = await Promise.allSettled(
      this.webhookEndpoints.map((url) => axios.post(url.trim(), payload, { timeout: 5000 }))
    );

    return { status: 'DISPATCHED', results };
  }
}

export const webhookAlertService = new WebhookAlertService();
export default webhookAlertService;
