const request = require('supertest');
const app = require('../src/server');
const db = require('../models');

describe('Tasks routes', () => {
  const password = 'password123';
  let token = '';
  let applicationId = null;
  let createdTaskId = null;

  beforeAll(async () => {
    const email = `tasks_${Date.now()}@example.com`;

    await request(app).post('/auth/register').send({
      email,
      password,
    });

    const loginRes = await request(app).post('/auth/login').send({
      email,
      password,
    });

    token = loginRes.body.token;

    const applicationRes = await request(app)
      .post('/applications')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_name: 'Spotify',
        position_title: 'Frontend Engineer',
        stage: 'Applied',
        location: 'Remote',
        notes: 'Created for tasks tests',
      });

    applicationId = applicationRes.body.id;
  });

  it('should create a task for an authenticated user application', async () => {
    const res = await request(app)
      .post(`/tasks/application/${applicationId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Send follow-up email',
        status: 'Open',
        due_at: '2026-03-12T17:00:00.000Z',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe('Send follow-up email');

    createdTaskId = res.body.id;
  });

  it('should get tasks for an authenticated user application', async () => {
    const res = await request(app)
      .get(`/tasks/application/${applicationId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    const foundTask = res.body.find((task) => task.id === createdTaskId);

    expect(foundTask).toBeDefined();
    expect(foundTask.title).toBe('Send follow-up email');
  });
});

afterAll(async () => {
  await db.sequelize.close();
});
