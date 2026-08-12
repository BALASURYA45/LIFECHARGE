import test from "node:test";
import assert from "node:assert";
import request from "supertest";
import app from "../app.js";

test("GET /api/notifications requires authentication", async () => {
  const response = await request(app).get("/api/notifications");
  assert.strictEqual(response.status, 401);
});

test("PATCH /api/notifications/settings requires authentication", async () => {
  const response = await request(app)
    .patch("/api/notifications/settings")
    .send({ dailyReminderEnabled: true });
  assert.strictEqual(response.status, 401);
});
