const request = require('supertest');
const app = require('../server'); // Assuming server exports app

describe('Auth API', () => {
  it('should register a user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test@example.com', password: '123456', role: 'ticket-checker' });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('data');
  });
});