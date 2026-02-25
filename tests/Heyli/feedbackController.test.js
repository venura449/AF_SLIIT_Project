const supertest = require('supertest');
const app = require('../../Server');
const Feedback = require('../../models/feedback/Feedback');
const User = require('../../models/users/User');

const API_PREFIX = '/api/v1/feedbacks';

describe('Feedback Endpoints Testing Started ! ', () => {
    let userToken;

    beforeAll(async () => {
        // 1. Create and Login a Regular User (Recipient)
        const userCreds = { username: 'recipient_test', email: 'rec@test.com', password: 'password123', role: 'Recipient' };
        await supertest(app).post('/api/v1/auth/signup').send(userCreds);
        const userLogin = await supertest(app).post('/api/v1/auth/login').send({ email: userCreds.email, password: userCreds.password });
        userToken = userLogin.body.token;
    });

    afterAll(async () => {
        await Feedback.deleteMany({});
    });
    describe(`POST ${API_PREFIX}/createFeedback`, () => {
        it('Should successfully submit feedback', async () => {
            const res = await supertest(app)
                .post(`${API_PREFIX}/createFeedback`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    need: '6992a98e8c7a4a7cfd4b6a47', 
                    content: 'This is a test feedback message.',
                    rating: 4,
                    imageUrl: 'http://example.com/image.jpg',
                });
            expect(res.status).toBe(201);
            expect(res.body.message).toBe('Feedback added successfully');
            expect(res.body.savedFeedback).toBeDefined();
            expect(res.body.savedFeedback.content).toBe('This is a test feedback message.');
            expect(res.body.savedFeedback.rating).toBe(4);
        });

        it('Should fail when content is missing', async () => {
            const res = await supertest(app)
                .post(`${API_PREFIX}/createFeedback`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    need: '6992a98e8c7a4a7cfd4b6a47', 
                    rating: 4,  
                    imageUrl: 'http://example.com/image.jpg',
                });
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('All fields are required');
        });

        it('Should fail when imageUrl is missing', async () => {
            const res = await supertest(app)
                .post(`${API_PREFIX}/createFeedback`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    need: '6992a98e8c7a4a7cfd4b6a47', 
                    content: 'This is a test feedback message.',
                    rating: 4,  
                });
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('All fields are required');
        });

        it('Should fail when need is missing', async () => {
            const res = await supertest(app)
                .post(`${API_PREFIX}/createFeedback`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    content: 'This is a test feedback message.',
                    rating: 4,  
                    imageUrl: 'http://example.com/image.jpg',
                });
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('All fields are required');
        });
    });

    describe(`GET ${API_PREFIX}/fetchFeedbacks`, () => {
        it('Should successfully fetch all feedbacks', async () => {
            const res = await supertest(app)
                .get(`${API_PREFIX}/fetchFeedbacks`);
            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Feedbacks fetched successfully');
            expect(res.body.feedbacks).toBeDefined();
            expect(Array.isArray(res.body.feedbacks)).toBe(true);
        });
    });

    describe(`PUT ${API_PREFIX}/updateFeedback/:id`, () => {
        it('Should successfully update feedback', async () => {
            const feedback = new Feedback({
                need: '6992a98e8c7a4a7cfd4b6a47', 
                user: '698f150949022e1b9f7f82f6',
                content: 'Original feedback message.',
                rating: 3,
                imageUrl: 'http://example.com/original-image.jpg',
            });
            await feedback.save(); 
            const res = await supertest(app)
                .put(`${API_PREFIX}/updateFeedback/${feedback._id}`)
                .send({
                    content: 'Updated feedback message.',
                    rating: 5,
                    imageUrl: 'http://example.com/updated-image.jpg',
                });
            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Feedback updated successfully');
            expect(res.body.updatedFeedback.content).toBe('Updated feedback message.');
            expect(res.body.updatedFeedback.rating).toBe(5);
        });

        it('Should fail when feedback does not exist', async () => {
            const nonExistentId = '6987026e5c4ff18435a10228';
            const res = await supertest(app)
                .put(`${API_PREFIX}/updateFeedback/${nonExistentId}`)
                .send({
                    content: 'Updated feedback message.',
                    rating: 5,
                    imageUrl: 'http://example.com/updated-image.jpg',
                });
            expect(res.status).toBe(404);
            expect(res.body.error).toBe('Feedback not found');
        });
    });

    describe(`DELETE ${API_PREFIX}/deleteFeedback/:id`, () => {
        it('Should successfully delete feedback', async () => {
            const feedback = new Feedback({
                need: '6992a98e8c7a4a7cfd4b6a47', 
                user: '698f150949022e1b9f7f82f6',
                content: 'Feedback to be deleted.', 
                rating: 2,
                imageUrl: 'http://example.com/delete-image.jpg',
            });
            await feedback.save();
            const res = await supertest(app)
                .delete(`${API_PREFIX}/deleteFeedback/${feedback._id}`);
            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Feedback deleted successfully');
        });

        it('Should fail when feedback does not exist', async () => {
            const nonExistentId = '6987026e5c4ff18435aa0228';
            const res = await supertest(app)
                .delete(`${API_PREFIX}/deleteFeedback/${nonExistentId}`);
            expect(res.status).toBe(404);
            expect(res.body.error).toBe('Feedback not found');
        }); 
    });

});