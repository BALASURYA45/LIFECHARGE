import { describe, expect, it } from 'vitest';
import { buildReply, classifyBatteryConcern } from '../components/LifyChatbot.jsx';

const prediction = {
  vehicleMake: 'Tesla',
  vehicleModel: 'Model 3',
  SOH: 62,
  RUL: 9,
  batteryStatus: 'Warning',
  riskLabel: 'High Risk',
  confidenceScore: 88,
  riskFactors: ['High thermal stress', 'Frequent fast charging'],
  input: {
    fastChargingUsage: 65,
    averageTemperature: 39,
    socHistory: 92,
  },
};

describe('LifyChatbot battery intelligence', () => {
  it('detects battery-related issue questions using actual battery metrics', () => {
    const result = classifyBatteryConcern('Is my battery serious? SOH is 62 and RUL is 9 months');

    expect(result.isBatteryRelated).toBe(true);
    expect(result.category).toBe('issue');
  });

  it('answers battery issue questions with concrete guidance based on the report', () => {
    const answer = buildReply('is my battery health serious?', prediction, [prediction], (key) => key);

    expect(answer.toLowerCase()).toContain('serious');
    expect(answer.toLowerCase()).toContain('soh');
    expect(answer.toLowerCase()).toContain('rul');
  });

  it('asks for clarification when the user message is not about the battery', () => {
    const answer = buildReply('what is the weather today?', null, [], (key) => key);

    expect(answer.toLowerCase()).toMatch(/battery|clarify|health|report/i);
  });
});
