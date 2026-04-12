const supertest = require('supertest');
const app = require('../../Server');
const Review = require('../../models/feedback/Review');
const Feedback = require('../../models/feedback/Feedback');
const User = require('../../models/users/User');

const API_PREFIX = '/api/v1/feedbacks';

describe('Review Endpoints Testing Started ! ', () => {
    let donorToken;
    let donorId;
    let donorEmail;
    let donorUsername;
    let recipientId;
    let recipientEmail;
    let recipientUsername;
    let feedbackId;

    beforeAll(async () => {
        const timestamp = String(Date.now()).slice(-6);

        donorUsername = `donor_${timestamp}`;
        donorEmail = `donor_${timestamp}@test.com`;
        recipientUsername = `recipient_${timestamp}`;
        recipientEmail = `recipient_${timestamp}@test.com`;

        const donorCreds = {
            username: donorUsername,
            email: donorEmail,
            password: 'password123',
            role: 'Donor',
        };

        const recipientCreds = {
            username: recipientUsername,
            email: recipientEmail,
            password: 'password123',
            role: 'Recipient',
        };

        const donorSignup = await supertest(app)
            .post('/api/v1/auth/signup')
            .send(donorCreds);
        const donorLogin = await supertest(app)
            .post('/api/v1/auth/login')
            .send({ email: donorCreds.email, password: donorCreds.password });

        const recipientSignup = await supertest(app)
            .post('/api/v1/auth/signup')
            .send(recipientCreds);

        donorToken = donorLogin.body.token;
        donorId = donorSignup.body.user.id;
        recipientId = recipientSignup.body.user.id;

        const feedback = new Feedback({
            need: '6992a98e8c7a4a7cfd4b6a47',
            user: recipientId,
            content: 'Feedback for review testing.',
            rating: 4,
            imageUrl: 'upload/feedback/feedback-image-1697059200000.jpg',
        });

        await feedback.save();
        feedbackId = feedback._id.toString();
    });

    afterAll(async () => {
        await Review.deleteMany({
            $or: [
                { user: donorId },
                { feedback: feedbackId },
            ],
        });
        await Feedback.deleteMany({ _id: feedbackId });
        await User.deleteMany({
            email: { $in: [donorEmail, recipientEmail] },
            username: { $in: [donorUsername, recipientUsername] },
        });
    });

    describe(`POST ${API_PREFIX}/:feedbackId/createReview`, () => {
        it('Should successfully submit review', async () => {
            const res = await supertest(app)
                .post(`${API_PREFIX}/${feedbackId}/createReview`)
                .set('Authorization', `Bearer ${donorToken}`)
                .send({
                    description: 'This is a test review message.',
                    rating: 5,
                });

            expect(res.status).toBe(201);
            expect(res.body.message).toBe('Review added successfully');
            expect(res.body.review).toBeDefined();
            expect(res.body.review.description).toBe('This is a test review message.');
            expect(res.body.review.rating).toBe(5);
        });

        it('Should fail when description is missing', async () => {
            const res = await supertest(app)
                .post(`${API_PREFIX}/${feedbackId}/createReview`)
                .set('Authorization', `Bearer ${donorToken}`)
                .send({
                    rating: 4,
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('All fields are required');
        });

        it('Should fail when rating is missing', async () => {
            const res = await supertest(app)
                .post(`${API_PREFIX}/${feedbackId}/createReview`)
                .set('Authorization', `Bearer ${donorToken}`)
                .send({
                    description: 'Missing rating review',
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('All fields are required');
        });
    });

    describe(`GET ${API_PREFIX}/fetchReviews`, () => {
        it('Should successfully fetch all reviews', async () => {
            const res = await supertest(app)
                .get(`${API_PREFIX}/fetchReviews`);

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Reviews fetched successfully');
            expect(res.body.reviews).toBeDefined();
            expect(Array.isArray(res.body.reviews)).toBe(true);
        });
    });

    describe(`PUT ${API_PREFIX}/updateReview/:id`, () => {
        it('Should successfully update review', async () => {
            const review = new Review({
                feedback: feedbackId,
                user: donorId,
                description: 'Original review message.',
                rating: 3,
            });
            await review.save();

            const res = await supertest(app)
                .put(`${API_PREFIX}/updateReview/${review._id}`)
                .set('Authorization', `Bearer ${donorToken}`)
                .send({
                    description: 'Updated review message.',
                    rating: 5,
                });

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Review updated successfully');
            expect(res.body.review.description).toBe('Updated review message.');
            expect(res.body.review.rating).toBe(5);
        });

        it('Should fail when review does not exist', async () => {
            const nonExistentId = '6987026e5c4ff18435a10228';

            const res = await supertest(app)
                .put(`${API_PREFIX}/updateReview/${nonExistentId}`)
                .set('Authorization', `Bearer ${donorToken}`)
                .send({
                    description: 'Updated review message.',
                    rating: 5,
                });

            expect(res.status).toBe(404);
            expect(res.body.error).toBe('Review not found');
        });
    });

    describe(`DELETE ${API_PREFIX}/deleteReview/:id`, () => {
        it('Should successfully delete review', async () => {
            const review = new Review({
                feedback: feedbackId,
                user: donorId,
                description: 'Review to be deleted.',
                rating: 2,
            });
            await review.save();

            const res = await supertest(app)
                .delete(`${API_PREFIX}/deleteReview/${review._id}`)
                .set('Authorization', `Bearer ${donorToken}`);

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Review deleted successfully');
        });

        it('Should fail when review does not exist', async () => {
            const nonExistentId = '6987026e5c4ff18435aa0228';

            const res = await supertest(app)
                .delete(`${API_PREFIX}/deleteReview/${nonExistentId}`)
                .set('Authorization', `Bearer ${donorToken}`);

            expect(res.status).toBe(404);
            expect(res.body.error).toBe('Review not found');
        });
    });
});
