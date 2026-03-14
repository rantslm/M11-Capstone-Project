const request = require('supertest');
const app = require('../src/server');

describe('Contacts routes', () => {
  const password = 'password123';
  let token = '';
  let applicationId = null;
  let createdContactId = null;

  beforeAll(async () => {
    const email = `contacts_${Date.now()}@example.com`;

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
        company_name: 'Figma',
        position_title: 'Product Designer',
        stage: 'Applied',
        location: 'Remote',
        notes: 'Created for contacts tests',
      });

    applicationId = applicationRes.body.id;
  });

  it('should create a contact for an authenticated user application', async () => {
    const res = await request(app)
      .post(`/contacts/application/${applicationId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Jane Recruiter',
        title: 'Recruiter',
        email: 'jane@example.com',
        phone: '555-123-4567',
        linkedin_url: 'https://linkedin.com/in/janerecruiter',
        contact_type: 'Recruiter',
        notes: 'Initial outreach contact',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Jane Recruiter');

    createdContactId = res.body.id;
  });

  it('should get contacts for an authenticated user application', async () => {
    const res = await request(app)
      .get(`/contacts/application/${applicationId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    const foundContact = res.body.find((contact) => contact.id === createdContactId);

    expect(foundContact).toBeDefined();
    expect(foundContact.name).toBe('Jane Recruiter');
  });
});
