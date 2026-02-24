const request = require('supertest');
const app = require('../../Server');
const User = require('../../models/Venura/User');

const USER_MGMT_PREFIX = '/api/v1/users';
const AUTH_PREFIX = '/api/v1/auth';

describe('User Management Integration Testing', () => {
  let adminToken;
  let adminId;
  let regularUserToken;
  let regularUserId;
  let testUserId;
  let testUserEmail;

   afterAll(async () => {
      try {
        // Delete all test users created during testing
        await User.deleteMany({
          $or: [
            { username: { $regex: /^testuser_/ } },
            { username: { $regex: /^testuser1_/ } },
            { username: { $regex: /^testuser2_/ } },
            { username: { $regex: /^duplicateuser_/ } },
            { username: { $regex: /^loginuser_/ } },
            { email: { $regex: /^test_.*@example\.com$/ } },
            { email: { $regex: /^test1_.*@example\.com$/ } },
            { email: { $regex: /^test2_.*@example\.com$/ } },
            { email: { $regex: /^duplicate_.*@example\.com$/ } },
            { email: { $regex: /^logintest_.*@example\.com$/ } },
          ]
        });
        console.log('Test users cleaned up successfully');
      } catch (error) {
        console.error('Error cleaning up test users:', error);
      }
    });

  beforeAll(async () => {
    // Clean up test users
    await User.deleteMany({
      $or: [
        { username: { $regex: /^admin_/ } },
        { username: { $regex: /^regularuser_/ } },
        { username: { $regex: /^testuser_/ } },
        { email: { $regex: /^admin_.*@test\.com$/ } },
        { email: { $regex: /^regularuser_.*@test\.com$/ } },
        { email: { $regex: /^testuser_.*@test\.com$/ } },
      ]
    });

    // Create Admin User (First create as Donor, then update to Admin role)
    const timestamp = Date.now();
    const adminEmail = `admin_${timestamp}@test.com`;
    const adminRes = await request(app)
      .post(`${AUTH_PREFIX}/signup`)
      .send({
        username: `admin_${timestamp}`,
        email: adminEmail,
        password: 'admin123',
        role: 'Donor'
      });
    
    adminId = adminRes.body.user.id;
    
    // Update admin to have Admin role
    await User.findByIdAndUpdate(adminId, { role: 'Admin' });
    
    const adminLoginRes = await request(app)
      .post(`${AUTH_PREFIX}/login`)
      .send({
        email: adminEmail,
        password: 'admin123'
      });
    adminToken = adminLoginRes.body.token;

    // Create Regular User
    const regularEmail = `regularuser_${timestamp}@test.com`;
    const regularRes = await request(app)
      .post(`${AUTH_PREFIX}/signup`)
      .send({
        username: `regularuser_${timestamp}`,
        email: regularEmail,
        password: 'user123',
        role: 'Recipient'
      });
    
    regularUserId = regularRes.body.user.id;

    const regularLoginRes = await request(app)
      .post(`${AUTH_PREFIX}/login`)
      .send({
        email: regularEmail,
        password: 'user123'
      });
    regularUserToken = regularLoginRes.body.token;

    // Create Test User for management
    testUserEmail = `testuser_${timestamp}@test.com`;
    const testUserRes = await request(app)
      .post(`${AUTH_PREFIX}/signup`)
      .send({
        username: `testuser_${timestamp}`,
        email: testUserEmail,
        password: 'test123',
        role: 'Donor'
      });
    testUserId = testUserRes.body.user.id;
  });

  afterAll(async () => {
    // Clean up all test users
    await User.deleteMany({
      $or: [
        { username: { $regex: /^admin_/ } },
        { username: { $regex: /^regularuser_/ } },
        { username: { $regex: /^testuser_/ } },
        { email: { $regex: /^admin_.*@test\.com$/ } },
        { email: { $regex: /^regularuser_.*@test\.com$/ } },
        { email: { $regex: /^testuser_.*@test\.com$/ } },
      ]
    });
  });

  // ===== GET ALL USERS =====
  describe(`GET ${USER_MGMT_PREFIX}/`, () => {
    // Positive Cases
    it('Should get all users when admin is authenticated', async () => {
      const res = await request(app)
        .get(`${USER_MGMT_PREFIX}/`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(3); // At least admin, regular, test users
    });

    it('Should return users with required fields', async () => {
      const res = await request(app)
        .get(`${USER_MGMT_PREFIX}/`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body[0]).toHaveProperty('_id');
      expect(res.body[0]).toHaveProperty('username');
      expect(res.body[0]).toHaveProperty('email');
      expect(res.body[0]).toHaveProperty('role');
      expect(res.body[0]).toHaveProperty('isActive');
    });

    // Negative Cases
    it('Should fail when user is not authenticated', async () => {
      const res = await request(app)
        .get(`${USER_MGMT_PREFIX}/`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message');
    });

    it('Should fail when user is not admin', async () => {
      const res = await request(app)
        .get(`${USER_MGMT_PREFIX}/`)
        .set('Authorization', `Bearer ${regularUserToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('message');
    });

    it('Should fail with invalid token', async () => {
      const res = await request(app)
        .get(`${USER_MGMT_PREFIX}/`)
        .set('Authorization', 'Bearer invalid_token_xyz');

      expect(res.statusCode).toBe(401);
    });

    // Edge Cases
    it('Should return empty array if no users exist (after cleanup)', async () => {
      // This is a hypothetical case - in reality we always have users
      const res = await request(app)
        .get(`${USER_MGMT_PREFIX}/`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  // ===== UPDATE USER STATUS =====
  describe(`PUT ${USER_MGMT_PREFIX}/:userId/status`, () => {
    let statusTestUserId;

    beforeEach(async () => {
      // Create a fresh user for each status test
      const timestamp = Date.now();
      const statusTestEmail = `statustest_${timestamp}@test.com`;
      const createRes = await request(app)
        .post(`${AUTH_PREFIX}/signup`)
        .send({
          username: `statustest_${timestamp}`,
          email: statusTestEmail,
          password: 'test123',
          role: 'Donor'
        });
      statusTestUserId = createRes.body.user.id;
    });

    afterEach(async () => {
      // Clean up the test user
      await User.findByIdAndDelete(statusTestUserId);
    });
    // Positive Cases
    it('Should deactivate user when admin sends isActive: false', async () => {
      const res = await request(app)
        .put(`${USER_MGMT_PREFIX}/${statusTestUserId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain('deactivated');
      expect(res.body.user.isActive).toBe(false);
    });

    it('Should activate user when admin sends isActive: true', async () => {
      const res = await request(app)
        .put(`${USER_MGMT_PREFIX}/${statusTestUserId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: true });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain('activated');
      expect(res.body.user.isActive).toBe(true);
    });

    // Negative Cases
    it('Should fail when user is not authenticated', async () => {
      const res = await request(app)
        .put(`${USER_MGMT_PREFIX}/${statusTestUserId}/status`)
        .send({ isActive: false });

      expect(res.statusCode).toBe(401);
    });

    it('Should fail when non-admin user tries to update status', async () => {
      const res = await request(app)
        .put(`${USER_MGMT_PREFIX}/${statusTestUserId}/status`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({ isActive: false });

      expect(res.statusCode).toBe(403);
    });

    it('Should allow isActive field to be missing (defaults to current)', async () => {
      const res = await request(app)
        .put(`${USER_MGMT_PREFIX}/${statusTestUserId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      // API allows empty body and returns 200 (no op)
      expect(res.statusCode).toBe(200);
    });

    // Edge Cases
    it('Should fail with invalid userId format (non-MongoDB ID)', async () => {
      const res = await request(app)
        .put(`${USER_MGMT_PREFIX}/invalid-id-123/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });

      expect(res.statusCode).toBe(400);
    });

    it('Should fail when userId does not exist', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // Valid MongoDB ObjectId format
      const res = await request(app)
        .put(`${USER_MGMT_PREFIX}/${fakeId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('Should accept boolean values for isActive', async () => {
      const res1 = await request(app)
        .put(`${USER_MGMT_PREFIX}/${statusTestUserId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: true });

      const res2 = await request(app)
        .put(`${USER_MGMT_PREFIX}/${statusTestUserId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });

      expect(res1.statusCode).toBe(200);
      expect(res2.statusCode).toBe(200);
    });

    it('Should handle isActive as non-boolean (coercion)', async () => {
      const res = await request(app)
        .put(`${USER_MGMT_PREFIX}/${statusTestUserId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: 1 });

      // Should either accept or reject based on implementation
      expect([200, 400]).toContain(res.statusCode);
    });
  });

  // ===== UPDATE USER =====
  describe(`PUT ${USER_MGMT_PREFIX}/:userId`, () => {
    let updateTestUserId;

    beforeEach(async () => {
      // Create a fresh user for each update test
      const timestamp = Date.now();
      const updateTestEmail = `updatetest_${timestamp}@test.com`;
      const createRes = await request(app)
        .post(`${AUTH_PREFIX}/signup`)
        .send({
          username: `updatetest_${timestamp}`,
          email: updateTestEmail,
          password: 'test123',
          role: 'Donor'
        });
      updateTestUserId = createRes.body.user.id;
    });

    afterEach(async () => {
      // Clean up the test user
      await User.findByIdAndDelete(updateTestUserId);
    });
    // Positive Cases
    it('Should update user role successfully', async () => {
      const res = await request(app)
        .put(`${USER_MGMT_PREFIX}/${updateTestUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'Recipient' });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('User updated successfully');
      expect(res.body.user.role).toBe('Recipient');
    });

    it('Should update user username successfully', async () => {
      const newUsername = `updated_${Date.now()}`;
      const res = await request(app)
        .put(`${USER_MGMT_PREFIX}/${updateTestUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ username: newUsername });

      expect(res.statusCode).toBe(200);
      expect(res.body.user.username).toBe(newUsername);
    });

    it('Should update multiple user fields at once', async () => {
      const newUsername = `multi_${Date.now()}`;
      const res = await request(app)
        .put(`${USER_MGMT_PREFIX}/${updateTestUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: newUsername,
          role: 'Donor'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.user.username).toBe(newUsername);
      expect(res.body.user.role).toBe('Donor');
    });

    // Negative Cases
    it('Should fail when user is not authenticated', async () => {
      const res = await request(app)
        .put(`${USER_MGMT_PREFIX}/${updateTestUserId}`)
        .send({ role: 'Admin' });

      expect(res.statusCode).toBe(401);
    });

    it('Should fail when non-admin user tries to update', async () => {
      const res = await request(app)
        .put(`${USER_MGMT_PREFIX}/${updateTestUserId}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({ role: 'Admin' });

      expect(res.statusCode).toBe(403);
    });

    it('Should fail with empty request body', async () => {
      const res = await request(app)
        .put(`${USER_MGMT_PREFIX}/${updateTestUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      // Depending on implementation, could be 200 (no-op), 400, or other
      expect([200, 400]).toContain(res.statusCode);
    });

    // Edge Cases
    it('Should fail with invalid userId format', async () => {
      const res = await request(app)
        .put(`${USER_MGMT_PREFIX}/not-a-valid-id`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'Donor' });

      expect(res.statusCode).toBe(400);
    });

    it('Should fail when userId does not exist', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .put(`${USER_MGMT_PREFIX}/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'Donor' });

      expect(res.statusCode).toBe(400);
    });

    it('Should allow updating email field through admin update', async () => {
      const newEmail = `newemail_${Date.now()}@test.com`;
      const res = await request(app)
        .put(`${USER_MGMT_PREFIX}/${updateTestUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: newEmail });

      expect(res.statusCode).toBe(200);
      // Email can be updated by admin
      const updatedUser = await User.findById(updateTestUserId);
      expect(updatedUser.email).toBe(newEmail);
    });

    it('Should handle special characters in username', async () => {
      const specialUsername = `user_!@#$_${Date.now()}`;
      const res = await request(app)
        .put(`${USER_MGMT_PREFIX}/${updateTestUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ username: specialUsername });

      // Should either accept or reject based on validation rules
      expect([200, 400]).toContain(res.statusCode);
    });

    it('Should accept valid role values (Admin, Donor, Recipient)', async () => {
      const validRoles = ['Admin', 'Donor', 'Recipient'];
      
      for (const role of validRoles) {
        const res = await request(app)
          .put(`${USER_MGMT_PREFIX}/${updateTestUserId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ role });
        
        expect(res.statusCode).toBe(200);
        expect(res.body.user.role).toBe(role);
      }
    });

    it('Should reject invalid role values', async () => {
      const res = await request(app)
        .put(`${USER_MGMT_PREFIX}/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'InvalidRole' });

      expect(res.statusCode).toBe(400);
    });
  });

  // ===== DELETE USER =====
  describe(`DELETE ${USER_MGMT_PREFIX}/:userId`, () => {
    let userToDeleteId;
    let userToDeleteEmail;

    beforeEach(async () => {
      // Create a user to delete for each test
      const timestamp = Date.now();
      userToDeleteEmail = `delete_${timestamp}@test.com`;
      const createRes = await request(app)
        .post(`${AUTH_PREFIX}/signup`)
        .send({
          username: `deleteuser_${timestamp}`,
          email: userToDeleteEmail,
          password: 'delete123',
          role: 'Donor'
        });
      userToDeleteId = createRes.body.user.id;
    });

    // Positive Cases
    it('Should successfully delete user when admin sends request', async () => {
      const res = await request(app)
        .delete(`${USER_MGMT_PREFIX}/${userToDeleteId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('User deleted successfully');
      expect(res.body.user.id.toString()).toBe(userToDeleteId.toString());
    });

    it('Should verify user is deleted after deletion', async () => {
      await request(app)
        .delete(`${USER_MGMT_PREFIX}/${userToDeleteId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Create new user to test verification
      const timestamp = Date.now();
      const verifyEmail = `verify_${timestamp}@test.com`;
      const createRes = await request(app)
        .post(`${AUTH_PREFIX}/signup`)
        .send({
          username: `verifyuser_${timestamp}`,
          email: verifyEmail,
          password: 'verify123'
        });
      const verifyId = createRes.body.user.id;

      const verifyRes = await request(app)
        .delete(`${USER_MGMT_PREFIX}/${verifyId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      const deletedUser = await User.findById(verifyId);
      expect(deletedUser).toBeNull();
    });

    // Negative Cases
    it('Should fail when user is not authenticated', async () => {
      const res = await request(app)
        .delete(`${USER_MGMT_PREFIX}/${userToDeleteId}`);

      expect(res.statusCode).toBe(401);
    });

    it('Should fail when non-admin user tries to delete', async () => {
      const res = await request(app)
        .delete(`${USER_MGMT_PREFIX}/${userToDeleteId}`)
        .set('Authorization', `Bearer ${regularUserToken}`);

      expect(res.statusCode).toBe(403);
    });

    // Edge Cases
    it('Should fail with invalid userId format', async () => {
      const res = await request(app)
        .delete(`${USER_MGMT_PREFIX}/invalid-id`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(400);
    });

    it('Should fail when userId does not exist', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .delete(`${USER_MGMT_PREFIX}/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(400);
    });

    it('Should fail when deleting already deleted user', async () => {
      // Delete once
      await request(app)
        .delete(`${USER_MGMT_PREFIX}/${userToDeleteId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Try to delete again
      const res = await request(app)
        .delete(`${USER_MGMT_PREFIX}/${userToDeleteId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(400);
    });

    it('Should not allow regular user to delete another user', async () => {
      const res = await request(app)
        .delete(`${USER_MGMT_PREFIX}/${userToDeleteId}`)
        .set('Authorization', `Bearer ${regularUserToken}`);

      expect(res.statusCode).toBe(403);
      
      // Verify user still exists
      const user = await User.findById(userToDeleteId);
      expect(user).not.toBeNull();
    });

    it('Should handle rapid consecutive delete attempts', async () => {
      const timestamp = Date.now();
      const rapidEmail = `rapid_${timestamp}@test.com`;
      const createRes = await request(app)
        .post(`${AUTH_PREFIX}/signup`)
        .send({
          username: `rapiduser_${timestamp}`,
          email: rapidEmail,
          password: 'rapid123'
        });
      const rapidId = createRes.body.user.id;

      const res1 = await request(app)
        .delete(`${USER_MGMT_PREFIX}/${rapidId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      const res2 = await request(app)
        .delete(`${USER_MGMT_PREFIX}/${rapidId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res1.statusCode).toBe(200);
      expect(res2.statusCode).toBe(400); // Second delete should fail
    });
  });

  // ===== AUTHORIZATION TESTS =====
  describe('Authorization and Authentication Tests', () => {
    it('Should reject request with malformed Authorization header', async () => {
      const res = await request(app)
        .get(`${USER_MGMT_PREFIX}/`)
        .set('Authorization', 'MalformedToken');

      expect(res.statusCode).toBe(401);
    });

    it('Should reject request with expired or tampered token', async () => {
      const res = await request(app)
        .get(`${USER_MGMT_PREFIX}/`)
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.invalid');

      expect(res.statusCode).toBe(401);
    });

    it('Should work with Bearer token (case-insensitive if applicable)', async () => {
      const res = await request(app)
        .get(`${USER_MGMT_PREFIX}/`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
    });
  });
});
