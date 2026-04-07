const request = require('supertest');
const app = require('../../Server');
const User = require('../../models/users/User');
const ItemListing = require('../../models/donations/ItemListing');

const API_PREFIX = '/api/v1/items';

describe('Item Listing Endpoints Integration Testing', () => {
    let donorToken;
    let adminToken;
    let recipientToken;
    let testItemId;

    beforeAll(async () => {
        // Clean existing test users
        await User.deleteMany({
            email: {
                $in: [
                    'donor_item@test.com',
                    'admin_item@test.com',
                    'recipient_item@test.com',
                ],
            },
        });

        // Create Donor user
        const donorCreds = {
            username: 'donor_item_test',
            email: 'donor_item@test.com',
            password: 'password123',
            role: 'Donor',
        };
        await User.create(donorCreds);
        const donorLogin = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: donorCreds.email, password: donorCreds.password });
        donorToken = donorLogin.body.token;

        // Create Admin user
        const adminCreds = {
            username: 'admin_item_test',
            email: 'admin_item@test.com',
            password: 'password123',
            role: 'Admin',
        };
        await User.create(adminCreds);
        const adminLogin = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: adminCreds.email, password: adminCreds.password });
        adminToken = adminLogin.body.token;

        // Create Recipient user
        const recipientCreds = {
            username: 'recipient_item_test',
            email: 'recipient_item@test.com',
            password: 'password123',
            role: 'Recipient',
        };
        await User.create(recipientCreds);
        const recipientLogin = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: recipientCreds.email, password: recipientCreds.password });
        recipientToken = recipientLogin.body.token;
    });

    afterAll(async () => {
        await ItemListing.deleteMany({ title: { $regex: /^Test Item/ } });
        await User.deleteMany({
            email: {
                $in: [
                    'donor_item@test.com',
                    'admin_item@test.com',
                    'recipient_item@test.com',
                ],
            },
        });
    });

    // --- TEST: Create Item ---
    describe(`POST ${API_PREFIX}`, () => {
        it('Should create a new item listing when Donor is authenticated', async () => {
            const res = await request(app)
                .post(API_PREFIX)
                .set('Authorization', `Bearer ${donorToken}`)
                .field('title', 'Test Item - Laptop')
                .field('description', 'A used laptop in good condition')
                .field('category', 'Electronics')
                .field('condition', 'Good')
                .field('location', 'Colombo');

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.title).toBe('Test Item - Laptop');
            expect(res.body.data.category).toBe('Electronics');
            testItemId = res.body.data._id;
        });

        it('Should reject item creation without authentication', async () => {
            const res = await request(app)
                .post(API_PREFIX)
                .field('title', 'Test Item - No Auth')
                .field('description', 'Should fail')
                .field('category', 'Books')
                .field('condition', 'New');

            expect(res.statusCode).toBe(401);
        });

        it('Should reject item creation when Recipient tries to create', async () => {
            const res = await request(app)
                .post(API_PREFIX)
                .set('Authorization', `Bearer ${recipientToken}`)
                .field('title', 'Test Item - Recipient')
                .field('description', 'Should fail - wrong role')
                .field('category', 'Clothing')
                .field('condition', 'New');

            expect(res.statusCode).toBe(403);
        });
    });

    // --- TEST: Get Available Items ---
    describe(`GET ${API_PREFIX}/available`, () => {
        it('Should return available items for authenticated users', async () => {
            const res = await request(app)
                .get(`${API_PREFIX}/available`)
                .set('Authorization', `Bearer ${recipientToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('Should return 401 when unauthenticated', async () => {
            const res = await request(app).get(`${API_PREFIX}/available`);
            expect(res.statusCode).toBe(401);
        });
    });

    // --- TEST: Get My Items ---
    describe(`GET ${API_PREFIX}/my-items`, () => {
        it('Should return items belonging to the authenticated donor', async () => {
            const res = await request(app)
                .get(`${API_PREFIX}/my-items`)
                .set('Authorization', `Bearer ${donorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('Should reject non-donor users from accessing my-items', async () => {
            const res = await request(app)
                .get(`${API_PREFIX}/my-items`)
                .set('Authorization', `Bearer ${recipientToken}`);

            expect(res.statusCode).toBe(403);
        });
    });

    // --- TEST: Get All Items (Admin) ---
    describe(`GET ${API_PREFIX}/all`, () => {
        it('Should return all items for Admin role', async () => {
            const res = await request(app)
                .get(`${API_PREFIX}/all`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('Should reject non-admin users', async () => {
            const res = await request(app)
                .get(`${API_PREFIX}/all`)
                .set('Authorization', `Bearer ${donorToken}`);

            expect(res.statusCode).toBe(403);
        });
    });

    // --- TEST: Get Item By ID ---
    describe(`GET ${API_PREFIX}/:id`, () => {
        it('Should retrieve a single item by ID', async () => {
            if (!testItemId) return;

            const res = await request(app)
                .get(`${API_PREFIX}/${testItemId}`)
                .set('Authorization', `Bearer ${donorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data._id).toBe(testItemId);
        });

        it('Should return 404 for a non-existent item ID', async () => {
            const res = await request(app)
                .get(`${API_PREFIX}/000000000000000000000000`)
                .set('Authorization', `Bearer ${donorToken}`);

            expect(res.statusCode).toBe(404);
        });
    });

    // --- TEST: Update Item ---
    describe(`PUT ${API_PREFIX}/:id`, () => {
        it('Should allow a Donor to update their own item', async () => {
            if (!testItemId) return;

            const res = await request(app)
                .put(`${API_PREFIX}/${testItemId}`)
                .set('Authorization', `Bearer ${donorToken}`)
                .send({ condition: 'Like New', location: 'Kandy' });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('Should reject update from a non-owner donor', async () => {
            if (!testItemId) return;

            // Create a second donor
            const donor2 = await User.create({
                username: 'donor2_item_test',
                email: 'donor2_item@test.com',
                password: 'password123',
                role: 'Donor',
            });
            const donor2Login = await request(app)
                .post('/api/v1/auth/login')
                .send({ email: 'donor2_item@test.com', password: 'password123' });
            const donor2Token = donor2Login.body.token;

            const res = await request(app)
                .put(`${API_PREFIX}/${testItemId}`)
                .set('Authorization', `Bearer ${donor2Token}`)
                .send({ condition: 'Fair' });

            expect([400, 403, 404]).toContain(res.statusCode);

            await User.deleteOne({ email: 'donor2_item@test.com' });
        });
    });

    // --- TEST: Delete Item ---
    describe(`DELETE ${API_PREFIX}/:id`, () => {
        it('Should allow a Donor to delete their own item', async () => {
            if (!testItemId) return;

            const res = await request(app)
                .delete(`${API_PREFIX}/${testItemId}`)
                .set('Authorization', `Bearer ${donorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('Should return 401 when deleting without auth', async () => {
            const res = await request(app).delete(
                `${API_PREFIX}/000000000000000000000000`,
            );
            expect(res.statusCode).toBe(401);
        });
    });
});
