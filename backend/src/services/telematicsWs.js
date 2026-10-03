import { WebSocketServer } from 'ws';
import TelematicsSession from '../models/telematics.model.js';

class TelematicsWSService {
  constructor() {
    this.wss = null;
    this.clients = new Set();
    this.simulationInterval = null;

    // Configurable simulation parameters
    this.driveMode = 'CITY_DRIVING'; // CITY_DRIVING | FAST_CHARGING | HIGH_LOAD | THERMAL_STRESS
    this.ambientTemp = 25.0; // Celsius
    this.hotspotCellIndex = 41; // Cell 42 (0-indexed 41)
    this.simulatedSoc = 78.5;
    this.imbalanceSeverity = 0.08; // V diff for degraded cell

    // Session Recording State
    this.isRecording = false;
    this.recordingStartTime = null;
    this.recordingSessionName = '';
    this.recordedFrames = [];
  }

  init(server) {
    this.wss = new WebSocketServer({ server, path: '/ws/telematics' });

    this.wss.on('connection', (ws) => {
      this.clients.add(ws);
      console.log('⚡ Client connected to Realtime Telematics Stream');

      // Send initial state snapshot
      ws.send(
        JSON.stringify({
          type: 'CONNECTED',
          message: 'Telematics stream active',
          config: {
            driveMode: this.driveMode,
            ambientTemp: this.ambientTemp,
            isRecording: this.isRecording,
          },
        })
      );

      ws.on('message', (messageRaw) => {
        try {
          const message = JSON.parse(messageRaw.toString());
          this.handleClientCommand(ws, message);
        } catch (err) {
          console.error('Failed to parse incoming WS message:', err.message);
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
      });
    });

    this.startSimulation();
  }

  handleClientCommand(ws, message) {
    switch (message.type) {
      case 'SET_MODE':
        if (['CITY_DRIVING', 'FAST_CHARGING', 'HIGH_LOAD', 'THERMAL_STRESS'].includes(message.mode)) {
          this.driveMode = message.mode;
          this.broadcastConfigUpdate();
        }
        break;

      case 'SET_AMBIENT_TEMP':
        if (typeof message.temp === 'number' && message.temp >= -10 && message.temp <= 60) {
          this.ambientTemp = Number(message.temp.toFixed(1));
          this.broadcastConfigUpdate();
        }
        break;

      case 'SET_HOTSPOT_CELL':
        if (typeof message.cellIndex === 'number' && message.cellIndex >= 0 && message.cellIndex < 96) {
          this.hotspotCellIndex = message.cellIndex;
          this.broadcastConfigUpdate();
        }
        break;

      case 'START_RECORDING':
        this.isRecording = true;
        this.recordingStartTime = new Date();
        this.recordingSessionName = message.sessionName || `Session_${Date.now()}`;
        this.recordedFrames = [];
        this.broadcastConfigUpdate();
        break;

      case 'STOP_RECORDING':
        this.stopAndSaveRecording();
        break;

      default:
        console.warn('Unknown WebSocket command received:', message.type);
    }
  }

  broadcastConfigUpdate() {
    const configPayload = JSON.stringify({
      type: 'CONFIG_UPDATE',
      config: {
        driveMode: this.driveMode,
        ambientTemp: this.ambientTemp,
        hotspotCellIndex: this.hotspotCellIndex,
        isRecording: this.isRecording,
        recordingStartTime: this.recordingStartTime,
      },
    });

    for (const client of this.clients) {
      if (client.readyState === 1) {
        client.send(configPayload);
      }
    }
  }

  async stopAndSaveRecording() {
    if (!this.isRecording) return;

    this.isRecording = false;
    const durationSec = Math.round((new Date() - this.recordingStartTime) / 1000);
    const sessionName = this.recordingSessionName;
    const frames = [...this.recordedFrames];

    this.recordingStartTime = null;
    this.recordedFrames = [];
    this.broadcastConfigUpdate();

    try {
      if (frames.length > 0) {
        const doc = await TelematicsSession.create({
          sessionName,
          durationSec,
          frameCount: frames.length,
          driveMode: this.driveMode,
          avgPackTemp: Number((frames.reduce((a, b) => a + b.packTemp, 0) / frames.length).toFixed(1)),
          maxDeltaV: Math.max(...frames.map((f) => f.deltaV)),
          frames,
        });

        const savedPayload = JSON.stringify({
          type: 'RECORDING_SAVED',
          session: {
            id: doc._id,
            sessionName: doc.sessionName,
            durationSec: doc.durationSec,
            frameCount: doc.frameCount,
          },
        });

        for (const client of this.clients) {
          if (client.readyState === 1) {
            client.send(savedPayload);
          }
        }
      }
    } catch (err) {
      console.error('Failed to save recorded telematics session:', err.message);
    }
  }

  startSimulation() {
    if (this.simulationInterval) return;

    this.simulationInterval = setInterval(() => {
      if (this.clients.size === 0 && !this.isRecording) return;

      const payload = this.generateLiveTelematics();
      const alerts = this.checkAnomalyAlerts(payload);

      const message = JSON.stringify({
        type: 'TELEMATICS_UPDATE',
        data: payload,
        alerts,
      });

      if (this.isRecording) {
        this.recordedFrames.push(payload);
      }

      for (const client of this.clients) {
        if (client.readyState === 1) {
          client.send(message);
        }
      }
    }, 2000); // 0.5 Hz update tick
  }

  generateLiveTelematics() {
    const numCells = 96;

    // Base properties according to mode
    let baseVoltage = 3.65;
    let modeCurrent = 15.4;
    let modeTempOffset = 0;

    switch (this.driveMode) {
      case 'FAST_CHARGING':
        baseVoltage = 3.95;
        modeCurrent = -120.0 + (Math.random() - 0.5) * 10.0; // Negative for charging
        modeTempOffset = 8.5;
        this.simulatedSoc = Math.min(99.0, this.simulatedSoc + 0.15);
        break;

      case 'HIGH_LOAD':
        baseVoltage = 3.52;
        modeCurrent = 185.0 + (Math.random() - 0.5) * 15.0;
        modeTempOffset = 12.0;
        this.simulatedSoc = Math.max(5.0, this.simulatedSoc - 0.25);
        break;

      case 'THERMAL_STRESS':
        baseVoltage = 3.58;
        modeCurrent = 65.0 + (Math.random() - 0.5) * 5.0;
        modeTempOffset = 22.0;
        this.simulatedSoc = Math.max(5.0, this.simulatedSoc - 0.1);
        break;

      case 'CITY_DRIVING':
      default:
        baseVoltage = 3.65;
        modeCurrent = 22.0 + (Math.random() - 0.5) * 4.0;
        modeTempOffset = 2.0;
        this.simulatedSoc = Math.max(5.0, this.simulatedSoc - 0.05);
        break;
    }

    const cellVoltages = [];
    let minV = 4.2;
    let maxV = 0.0;
    let totalV = 0;

    for (let i = 0; i < numCells; i++) {
      let noise = (Math.random() - 0.5) * 0.03;
      if (i === this.hotspotCellIndex) {
        noise -= this.imbalanceSeverity; // degraded cell voltage drop
      }
      const v = Number((baseVoltage + noise).toFixed(3));
      cellVoltages.push(v);
      if (v < minV) minV = v;
      if (v > maxV) maxV = v;
      totalV += v;
    }

    const deltaV = Number((maxV - minV).toFixed(3));
    const packVoltage = Number(totalV.toFixed(1));
    const current = Number(modeCurrent.toFixed(1));

    // Calculate temp dynamic based on ambient + mode offset + current heating
    const currentHeat = Math.abs(current) * 0.05;
    const packTemp = Number((this.ambientTemp + modeTempOffset + currentHeat + (Math.random() - 0.5) * 0.8).toFixed(1));
    const soc = Number(this.simulatedSoc.toFixed(1));
    const soh = 94.2;

    return {
      timestamp: new Date().toISOString(),
      driveMode: this.driveMode,
      packVoltage,
      current,
      packTemp,
      ambientTemp: this.ambientTemp,
      soc,
      soh,
      deltaV,
      cellBalancingActive: deltaV > 0.04,
      hotspotCellIndex: this.hotspotCellIndex + 1, // 1-based cell index for display
      cellVoltages,
    };
  }

  checkAnomalyAlerts(data) {
    const alerts = [];

    if (data.deltaV > 0.07) {
      alerts.push({
        id: `alt_delta_v_${Date.now()}`,
        severity: 'HIGH',
        code: 'CELL_VOLTAGE_IMBALANCE',
        title: 'Severe Cell Imbalance Detected',
        message: `Cell voltage delta is ${data.deltaV}V (Threshold: 0.07V). Cell ${data.hotspotCellIndex} is sagging.`,
        timestamp: new Date().toLocaleTimeString(),
      });
    }

    if (data.packTemp > 44.0) {
      alerts.push({
        id: `alt_temp_${Date.now()}`,
        severity: 'CRITICAL',
        code: 'THERMAL_OVERHEAT_WARNING',
        title: 'Battery Pack Thermal Overheat',
        message: `Battery pack temperature reached ${data.packTemp}°C (Critical > 44°C). Cooling circuit triggered.`,
        timestamp: new Date().toLocaleTimeString(),
      });
    } else if (data.packTemp > 38.0) {
      alerts.push({
        id: `alt_temp_warn_${Date.now()}`,
        severity: 'MEDIUM',
        code: 'ELEVATED_TEMPERATURE',
        title: 'Elevated Pack Temperature',
        message: `Pack temp is elevated at ${data.packTemp}°C under ${data.driveMode} mode.`,
        timestamp: new Date().toLocaleTimeString(),
      });
    }

    if (data.soc < 15.0) {
      alerts.push({
        id: `alt_soc_${Date.now()}`,
        severity: 'LOW',
        code: 'LOW_STATE_OF_CHARGE',
        title: 'Low Battery SOC',
        message: `State of Charge is at ${data.soc}%. Recharge recommended soon.`,
        timestamp: new Date().toLocaleTimeString(),
      });
    }

    return alerts;
  }

  stopSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }
}

export const telematicsWS = new TelematicsWSService();
export default telematicsWS;

