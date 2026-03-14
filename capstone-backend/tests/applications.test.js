const request = require('supertest');
const app = require('../src/server');
const db = require('../models');

describe('Applications routes', () => {
  const password = 'password123';
  let token = '';
  let createdApplicationId = null;

  /**
   * Register and log in a fresh test user before running application tests.
   * This gives us a valid JWT token for protected routes.
   */
  beforeAll(async () => {
    const email = `applications_${Date.now()}@example.com`;

    await request(app).post('/auth/register').send({
      email,
      password,
    });

    const loginRes = await request(app).post('/auth/login').send({
      email,
      password,
    });

    token = loginRes.body.token;
  });

  it('should reject GET /applications without a token', async () => {
    const res = await request(app).get('/applications');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('should return applications for an authenticated user', async () => {
    const res = await request(app)
      .get('/applications')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should create a new application for an authenticated user', async () => {
    const res = await request(app)
      .post('/applications')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_name: 'Netflix',
        position_title: 'UI Designer',
        stage: 'Applied',
        location: 'Remote',
        job_url: 'https://example.com/job',
        salary_min: 90000,
        salary_max: 120000,
        notes: 'Created from Jest test',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.company_name).toBe('Netflix');
    expect(res.body.position_title).toBe('UI Designer');

    createdApplicationId = res.body.id;
  });

  it('should return the newly created application in GET /applications', async () => {
    const res = await request(app)
      .get('/applications')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    const foundApplication = res.body.find(
      (application) => application.id === createdApplicationId
    );

    expect(foundApplication).toBeDefined();
    expect(foundApplication.company_name).toBe('Netflix');
  });

  it('should update an existing application for an authenticated user', async () => {
    const res = await request(app)
      .put(`/applications/${createdApplicationId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        stage: 'Interviewing',
        location: 'New York',
        notes: 'Updated from Jest test',
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.stage).toBe('Interviewing');
    expect(res.body.location).toBe('New York');
    expect(res.body.notes).toBe('Updated from Jest test');
  });

  it('should delete an existing application for an authenticated user', async () => {
    const res = await request(app)
      .delete(`/applications/${createdApplicationId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  it('should no longer return the deleted application in GET /applications', async () => {
    const res = await request(app)
      .get('/applications')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    const deletedApplication = res.body.find(
      (application) => application.id === createdApplicationId
    );

    expect(deletedApplication).toBeUndefined();
  });
});

afterAll(async () => {
  await db.sequelize.close();
});
