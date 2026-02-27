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
            services.countActiveUsers.mockRejectedValue(new Error('Database error'));
            services.getMonthlyDonations.mockRejectedValue(new Error('Database error'));
            services.getMonthlyGrowth.mockRejectedValue(new Error('Database error'));

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
            services.countActiveUsers.mockResolvedValue(80);
            services.getMonthlyDonations.mockResolvedValue([
                { _id: 1, totalAmount: 1000 },  
                { _id: 2, totalAmount: 1500 },
            ]);
            services.getMonthlyGrowth.mockResolvedValue([
                { _id: 1, totalUsers: 10 },  
                { _id: 2, totalUsers: 20 },
            ]);

            const res = await request(app)
                .get(`${API_PREFIX}/dashboard`);

            expect(res.status).toBe(200);
            expect(res.body.totalUsers).toBe(100);
            expect(res.body.totalFeedbacks).toBe(50);
            expect(res.body.totalNeeds).toBe(25);
            expect(res.body.activeUsers).toBe(80);
            expect(res.body.monthlyDonations).toEqual([
                { _id: 1, totalAmount: 1000 },
                { _id: 2, totalAmount: 1500 },
            ]);
            expect(res.body.monthlyGrowth).toEqual([
                { _id: 1, totalUsers: 10 },
                { _id: 2, totalUsers: 20 },
            ]);
        });
    });
});