const request = require('supertest');
const path = require('path');
const fs = require('fs');
const app = require('../../Server');
const Need = require('../../models/donations/Need');
const User = require('../../models/users/User');

const API_PREFIX = '/api/v1/needs';

describe('Need Endpoints Integration Testing', () => {
    let userToken;
    let otherUserToken;
    let donorToken;
    let testNeedId;
    let adminToken;

    beforeAll(async () => {
        // Clean up any existing test users before creating new ones
        await User.deleteMany({ email: { $in: ['rec@test.com', 'donor@test.com', 'admin@test.com'] } });

        // 1. Create and Login a Regular User (Recipient)
        const userCreds = { username: 'recipient_test', email: 'rec@test.com', password: 'password123', role: 'Recipient' };
        await request(app).post('/api/v1/auth/signup').send(userCreds);
        const userLogin = await request(app).post('/api/v1/auth/login').send({ email: userCreds.email, password: userCreds.password });
        userToken = userLogin.body.token;

        // 2. Create and Login a Donor (For verification testing)
        const donorCreds = { username: 'donor_test', email: 'donor@test.com', password: 'password123', role: 'Donor' };
        await User.create(donorCreds); // Direct create to ensure role is 'Donor'
        const donorLogin = await request(app).post('/api/v1/auth/login').send({ email: donorCreds.email, password: donorCreds.password });
        donorToken = donorLogin.body.token;

        // 3. Create and Login an Admin User
        const adminCreds = { username: 'admin_test', email: 'admin@test.com', password: 'password123', role: 'Admin' };
        await User.create(adminCreds); // Direct create to ensure role is 'Admin'
        const adminLogin = await request(app).post('/api/v1/auth/login').send({ email: adminCreds.email, password: adminCreds.password });
        adminToken = adminLogin.body.token;
    });

    afterAll(async () => {
        await Need.deleteMany({});
        await User.deleteMany({ email: { $in: ['rec@test.com', 'donor@test.com', 'admin@test.com'] } });
    });

    // --- TEST: Create Need ---
    describe(`POST ${API_PREFIX}/create`, () => {
        it('Should successfully create a new need with valid token', async () => {
            const res = await request(app)
                .post(`${API_PREFIX}/create`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    title: 'Help for Education',
                    description: 'Need funds for university fees',
                    category: 'Education',
                    urgency: 'Medium',
                    location: 'Colombo',
                    goalAmount: 50000
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.title).toBe('Help for Education');
            testNeedId = res.body.data._id; // Save for later tests
        });

        it('Should fail to create need if token is missing', async () => {
            const res = await request(app).post(`${API_PREFIX}/create`).send({ title: 'No Token' });
            expect(res.statusCode).toBe(401);
        });
    });

    // --- TEST: Get All Needs (Filtered) ---
    describe(`GET ${API_PREFIX}/getall`, () => {
        it('Should fetch all needs with status 200', async () => {
            const res = await request(app).get(`${API_PREFIX}/getall`);
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('Should apply category filters correctly', async () => {
            const res = await request(app).get(`${API_PREFIX}/getall?category=Education`);
            expect(res.statusCode).toBe(200);
            // Verify that returned data matches filter if your service handles it
        });
    });

    // describe(`GET ${API_PREFIX}/my-needs`, () => {
    //     it('Should fetch only the needs belonging to the logged-in user', async () => {
    //         const res = await request(app)
    //             .get(`${API_PREFIX}/my-needs`)
    //             .set('Authorization', `Bearer ${userToken}`);

    //         expect(res.statusCode).toBe(200);
    //         expect(res.body.data.length).toBeGreaterThan(0);
    //         expect(res.body.data[0].title).toBe('User 1 Need');
    //     });
    // });
    // describe(`PUT ${API_PREFIX}/update/:needId`, () => {
    //     it('Should allow owner to update their own need', async () => {
    //         const res = await request(app)
    //             .put(`${API_PREFIX}/update/${testNeedId}`)
    //             .set('Authorization', `Bearer ${userToken}`)
    //             .send({ title: 'Updated Title' });

    //         expect(res.statusCode).toBe(200);
    //         expect(res.body.data.title).toBe('Updated Title');
    //     });

    //     it('Should block a different user from updating the need', async () => {
    //         const res = await request(app)
    //             .put(`${API_PREFIX}/update/${testNeedId}`)
    //             .set('Authorization', `Bearer ${otherUserToken}`)
    //             .send({ title: 'Hacker Title' });

    //         // Using 400 or 403 based on your specific error handling
    //         expect([400, 403]).toContain(res.statusCode); 
    //     });
    // });

    // --- TEST: Upload Verification Docs (File Upload) ---
    // describe(`PATCH ${API_PREFIX}/upload-verification/:needId`, () => {
    //     it('Should upload files successfully', async () => {
    //         const filePath = path.join(__dirname, '../fixtures/test-image.png');

    //         // Ensure the fixture exists so the test doesn't crash
    //         if (!fs.existsSync(filePath)) {
    //             console.warn("Skipping upload test: fixture image not found");
    //             return;
    //         }

    //         const res = await request(app)
    //             .patch(`${API_PREFIX}/upload-verification/${testNeedId}`)
    //             .set('Authorization', `Bearer ${userToken}`)
    //             .attach('docs', filePath); // 'docs' must match controller req.files

    //         expect(res.statusCode).toBe(200);
    //         expect(res.body.success).toBe(true);
    //         expect(res.body.data.verificationDocs).toBeDefined();
    //     });

    //     it('Should return 400 if no files are uploaded', async () => {
    //         const res = await request(app)
    //             .patch(`${API_PREFIX}/upload-verification/${testNeedId}`)
    //             .set('Authorization', `Bearer ${userToken}`);

    //         expect(res.statusCode).toBe(400);
    //         expect(res.body.message).toBe('No files uploaded');
    //     });
    // });
    // --- TEST: Update Progress ---
    describe(`PATCH ${API_PREFIX}/update/:needId`, () => {
        it('Should fail update if user is Recipient', async () => {
            const res = await request(app)
                .patch(`${API_PREFIX}/update/${testNeedId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ amount: 1000 });

            expect(res.statusCode).toBe(403);
        });
    });

    // --- TEST: Verify Need (Admin Only) ---
    // --- TEST: Verify Need (Admin Only) ---
    describe(`PATCH ${API_PREFIX}/approve/:needId`, () => {
        it('Should fail verification if user is not an Admin', async () => {
            it('Should successfully verify need if user is Admin', async () => {
                const res = await request(app)
                    .patch(`${API_PREFIX}/approve/${testNeedId}`)
                    .set('Authorization', `Bearer ${adminToken}`);

                // Admin role required
                expect(res.statusCode).toBe(403);
            });

            it('Should fail verification if user is Recipient', async () => {
                it('Should fail verification if user is not an Admin', async () => {
                    const res = await request(app)
                        .patch(`${API_PREFIX}/approve/${testNeedId}`)
                        .set('Authorization', `Bearer ${userToken}`);

                    // Admin role required
                    // Assuming authorize('Admin') returns 403
                    expect(res.statusCode).toBe(403);
                });
            });


        });