const request = require('supertest');
const app = require('../src/server');

describe('Activities routes', () => {
  const password = 'password123';
  let token = '';
  let applicationId = null;
  let createdActivityId = null;

  beforeAll(async () => {
    const email = `activities_${Date.now()}@example.com`;

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
        company_name: 'Adobe',
        position_title: 'UX Designer',
        stage: 'Interviewing',
        location: 'Remote',
        notes: 'Created for activities tests',
      });

    applicationId = applicationRes.body.id;
  });

  it('should create an activity for an authenticated user application', async () => {
    const res = await request(app)
      .post(`/activities/application/${applicationId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'Interview',
        occurred_at: '2026-03-10T15:00:00.000Z',
        summary: 'Phone screen with recruiter',
        details: 'Discussed role and next steps',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.type).toBe('Interview');

    createdActivityId = res.body.id;
  });

  it('should get activities for an authenticated user application', async () => {
    const res = await request(app)
      .get(`/activities/application/${applicationId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    const foundActivity = res.body.find(
      (activity) => activity.id === createdActivityId
    );

    expect(foundActivity).toBeDefined();
    expect(foundActivity.type).toBe('Interview');
  });
});
