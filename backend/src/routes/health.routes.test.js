import test from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../app.js';

test('responds with health status from /api/health', async () => {
  const response = await request(app).get('/api/health');
  assert.strictEqual(response.status, 200);
});
