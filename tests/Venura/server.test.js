const request = require('supertest');
const app = require('../../Server.js');

describe('Server Basic Tests', () => {
  it('Server Health Check Passed !', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('Root Endpoint Responds Successfully !', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
  });
});
