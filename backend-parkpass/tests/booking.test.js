const request = require('supertest');
const app = require('../server');

let token;
beforeAll(async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'bhatashu954@gmail.com', password: '123456' });
  token = res.body.token;
});

describe('GET /api/bookings', () => {
  it('returns 200 with array', async () => {
    const res = await request(app)
      .get('/api/bookings')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});