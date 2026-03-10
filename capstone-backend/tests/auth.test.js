const request = require('supertest');
const app = require('../src/app');

describe('Auth routes', () => {
  const uniqueEmail = `testuser_${Date.now()}@example.com`;
  const password = 'password123';

  it('should register a new user', async () => {
    const res = await request(app).post('/auth/register').send({
      email: uniqueEmail,
      password,
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe(uniqueEmail);
  });

  it('should reject duplicate email registration', async () => {
    // first registration
    await request(app)
      .post('/auth/register')
      .send({
        email: `duplicate_${Date.now()}@example.com`,
        password,
      });

    const duplicateEmail = `fixedduplicate@example.com`;

    // ensure one known user exists
    await request(app).post('/auth/register').send({
      email: duplicateEmail,
      password,
    });

    const res = await request(app).post('/auth/register').send({
      email: duplicateEmail,
      password,
    });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error');
  });

  it('should log in an existing user', async () => {
    const loginEmail = `login_${Date.now()}@example.com`;

    await request(app).post('/auth/register').send({
      email: loginEmail,
      password,
    });

    const res = await request(app).post('/auth/login').send({
      email: loginEmail,
      password,
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe(loginEmail);
  });

  it('should reject duplicate email registration', async () => {
    const duplicateEmail = `duplicate_${Date.now()}@example.com`;

    await request(app).post('/auth/register').send({
      email: duplicateEmail,
      password,
    });

    const res = await request(app).post('/auth/register').send({
      email: duplicateEmail,
      password,
    });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error');
  });
});
