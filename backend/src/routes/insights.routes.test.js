import { test } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../app.js';

test('GET /api/insights/financial returns financial degradation metrics', async () => {
  const response = await request(app)
    .get('/api/insights/financial?soh=93.1&odometry=45000')
    .expect(200);

  assert.strictEqual(response.body.success, true);
  assert.ok(response.body.data.currentPackValuationUsd > 0);
  assert.ok(response.body.data.accumulatedDepreciationUsd >= 0);
  assert.ok(response.body.data.degradationRatePerYearPct > 0);
});

test('GET /api/insights/fleet returns multi-vehicle fleet matrix', async () => {
  const response = await request(app)
    .get('/api/insights/fleet')
    .expect(200);

  assert.strictEqual(response.body.success, true);
  assert.ok(response.body.data.summary.totalVehicles > 0);
  assert.ok(Array.isArray(response.body.data.vehicles));
});

test('POST /api/insights/charging-advisor returns smart charging plan', async () => {
  const response = await request(app)
    .post('/api/insights/charging-advisor')
    .send({
      currentSoc: 25,
      targetSoc: 80,
      ambientTempC: 36,
      departureInHours: 8,
    })
    .expect(200);

  assert.strictEqual(response.body.success, true);
  assert.ok(response.body.data.recommendation.recommendedMaxKw > 0);
  assert.strictEqual(response.body.data.recommendation.thermalPreconditioning, 'PRE_COOLING_REQUIRED');
});

test('POST /api/insights/battery-passport returns digital battery passport', async () => {
  const response = await request(app)
    .post('/api/insights/battery-passport')
    .send({
      vin: '19XFA2F83ME00101',
      soh: 93.1,
    })
    .expect(200);

  assert.strictEqual(response.body.success, true);
  assert.ok(response.body.data.passportId);
  assert.strictEqual(response.body.data.healthCertification.healthGrade, 'A+');
  assert.ok(response.body.data.verificationHash);
});
