const request = require('supertest');
const app = require('../src/server');
const db = require('../models');

describe('Basic app routes', () => {
  it('should return API running message from GET /', async () => {
    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Capstone API running');
  });

  it('should reject GET /applications without a token', async () => {
    const res = await request(app).get('/applications');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});

afterAll(async () => {
  await db.sequelize.close();
});
