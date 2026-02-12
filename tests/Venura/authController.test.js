const request = require('supertest');
const app = require('../../Server');
const User = require('../../models/Venura/User');

const API_PREFIX = '/api/v1/auth';

describe('Auth Endpoints Testing Started ! ', () => {

  describe(`POST ${API_PREFIX}/signup`, () => {
    it('Should successfully register a new user', async () => {
      const timestamp = Date.now();
      const res = await request(app)
        .post(`${API_PREFIX}/signup`)
        .send({
          username: `testuser_${timestamp}`,
          email: `test_${timestamp}@example.com`,
          password: 'password123',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('User registered successfully');
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.username).toBe(`testuser_${timestamp}`);
      expect(res.body.user.email).toBe(`test_${timestamp}@example.com`);
    }, 15000);

    it('Should fail when username is missing', async () => {
      const timestamp = Date.now();
      const res = await request(app)
        .post(`${API_PREFIX}/signup`)
        .send({
          email: `test_${timestamp}@example.com`,
          password: 'password123',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('All fields are required');
    }, 10000);

    it('Should fail when email is missing', async () => {
      const timestamp = Date.now();
      const res = await request(app)
        .post(`${API_PREFIX}/signup`)
        .send({
          username: `testuser_${timestamp}`,
          password: 'password123',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('All fields are required');
    }, 10000);

    it('Should fail when password is missing', async () => {
      const timestamp = Date.now();
      const res = await request(app)
        .post(`${API_PREFIX}/signup`)
        .send({
          username: `testuser_${timestamp}`,
          email: `test_${timestamp}@example.com`,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('All fields are required');
    }, 10000);

    it('Should fail when user with same email already exists', async () => {
      const timestamp = Date.now();
      const sameEmail = `duplicate_${timestamp}@example.com`;
      
      await request(app)
        .post(`${API_PREFIX}/signup`)
        .send({
          username: `testuser1_${timestamp}`,
          email: sameEmail,
          password: 'password123',
        });

      const res = await request(app)
        .post(`${API_PREFIX}/signup`)
        .send({
          username: `testuser2_${timestamp}`,
          email: sameEmail,
          password: 'password456',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('User already exists');
    }, 20000);

    it('Should fail when user with same username already exists', async () => {
      const timestamp = Date.now();
      const sameUsername = `duplicateuser_${timestamp}`;
      
      await request(app)
        .post(`${API_PREFIX}/signup`)
        .send({
          username: sameUsername,
          email: `test1_${timestamp}@example.com`,
          password: 'password123',
        });

      const res = await request(app)
        .post(`${API_PREFIX}/signup`)
        .send({
          username: sameUsername,
          email: `test2_${timestamp}@example.com`,
          password: 'password456',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('User already exists');
    }, 20000);
  });

  describe(`POST ${API_PREFIX}/login`, () => {
    let testUserEmail;
    let testUserPassword = 'password123';

    beforeEach(async () => {
      // Create a unique test user before login tests
      const timestamp = Date.now();
      testUserEmail = `logintest_${timestamp}@example.com`;
      
      await request(app)
        .post(`${API_PREFIX}/signup`)
        .send({
          username: `loginuser_${timestamp}`,
          email: testUserEmail,
          password: testUserPassword,
        });
    }, 15000);

    it('Should successfully login with correct credentials', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/login`)
        .send({
          email: testUserEmail,
          password: testUserPassword,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Login successful');
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(testUserEmail);
    }, 15000);

    it('Should fail when email is missing', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/login`)
        .send({
          password: testUserPassword,
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Email and password are required');
    }, 10000);

    it('Should fail when password is missing', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/login`)
        .send({
          email: testUserEmail,
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Email and password are required');
    }, 10000);

    it('Should fail when email does not exist', async () => {
      const timestamp = Date.now();
      const res = await request(app)
        .post(`${API_PREFIX}/login`)
        .send({
          email: `nonexistent_${timestamp}@example.com`,
          password: testUserPassword,
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Invalid email or password');
    }, 10000);

    it('Should fail when password is incorrect', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/login`)
        .send({
          email: testUserEmail,
          password: 'wrongpassword',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Invalid email or password');
    }, 15000);

    it('Should return valid JWT token on successful login', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/login`)
        .send({
          email: testUserEmail,
          password: testUserPassword,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeTruthy();
      expect(res.body.token.split('.').length).toBe(3);
    }, 15000);
  });
});
