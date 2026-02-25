jest.mock('../../services/admin/adminDashService.js');

const request = require('supertest');
const app = require('../../Server');
const services = require('../../services/admin/adminDashService.js');

const API_PREFIX = '/api/v1/admin';

describe('Admin Dashboard Endpoints Testing Started ! ', () => {

    describe(`GET ${API_PREFIX}/dashboard`, () => {
        afterEach(() => {
                jest.resetAllMocks();
        });

        it('Should handle errors gracefully', async () => {
            // Mock the service functions to throw an error
            services.countTotUsers.mockRejectedValue(new Error('Database error'));
            services.countTotFeedbacks.mockRejectedValue(new Error('Database error'));
            services.countTotNeeds.mockRejectedValue(new Error('Database error'));

            const res = await request(app)
                .get(`${API_PREFIX}/dashboard`);    
            expect(res.status).toBe(500);
            expect(res.body.error).toBe('Database error');
        });

        it('Should successfully retrieve dashboard data', async () => {
            // Mock the service functions to return sample data
            services.countTotUsers.mockResolvedValue(100);
            services.countTotFeedbacks.mockResolvedValue(50);
            services.countTotNeeds.mockResolvedValue(25);

            const res = await request(app)
                .get(`${API_PREFIX}/dashboard`);

            expect(res.status).toBe(200);
            expect(res.body.totalUsers).toBe(100);
            expect(res.body.totalFeedbacks).toBe(50);
            expect(res.body.totalNeeds).toBe(25);
        });
    });
});