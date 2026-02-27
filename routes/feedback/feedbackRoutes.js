const express = require('express');

const {protect} = require('../../middleware/authmiddleware.js');
const {
    addFeedback,
    feedback,
    updateFeedback,
    deleteFeedback,
    updateAvgRating
} = require('../../controllers/feedback/feedbackController.js');
const {
    addReview,
    getReviews,
    updateReview,
    deleteReview
} = require('../../controllers/feedback/reviewController.js');

const router = express.Router();

/**
 * @swagger
 * /api/v1/feedbacks/createFeedback:
 *   post:
 *     summary: Create Feedback
 *     description: Create a new feedback for a need
 *     tags:
 *       - Feedback
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - needId
 *               - rating
 *             properties:
 *               needId:
 *                 type: string
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Feedback created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Feedback'
 *       401:
 *         description: Unauthorized
 */
router.post('/createFeedback', protect, addFeedback);

/**
 * @swagger
 * /api/v1/feedbacks/fetchFeedbacks:
 *   get:
 *     summary: Get All Feedbacks
 *     description: Retrieve all feedbacks
 *     tags:
 *       - Feedback
 *     responses:
 *       200:
 *         description: Feedbacks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Feedback'
 */
router.get('/fetchFeedbacks', feedback);

/**
 * @swagger
 * /api/v1/feedbacks/updateFeedback/{id}:
 *   put:
 *     summary: Update Feedback
 *     description: Update an existing feedback
 *     tags:
 *       - Feedback
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Feedback ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Feedback updated successfully
 *       404:
 *         description: Feedback not found
 */
router.put('/updateFeedback/:id', updateFeedback);

/**
 * @swagger
 * /api/v1/feedbacks/updateAvgRating/{id}:
 *   patch:
 *     summary: Update Average Rating
 *     description: Update the average rating for a need
 *     tags:
 *       - Feedback
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               averageRating:
 *                 type: number
 *     responses:
 *       200:
 *         description: Average rating updated successfully
 */
router.patch('/updateAvgRating/:id', updateAvgRating);

/**
 * @swagger
 * /api/v1/feedbacks/deleteFeedback/{id}:
 *   delete:
 *     summary: Delete Feedback
 *     description: Delete a feedback
 *     tags:
 *       - Feedback
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Feedback ID
 *     responses:
 *       200:
 *         description: Feedback deleted successfully
 *       404:
 *         description: Feedback not found
 */
router.delete('/deleteFeedback/:id', deleteFeedback);

/**
 * @swagger
 * /api/v1/feedbacks/{feedbackId}/createReview:
 *   post:
 *     summary: Create Review
 *     description: Create a review for a feedback
 *     tags:
 *       - Reviews
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: feedbackId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - comment
 *             properties:
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       401:
 *         description: Unauthorized
 */
router.post('/:feedbackId/createReview', protect, addReview);

/**
 * @swagger
 * /api/v1/feedbacks/fetchReviews:
 *   get:
 *     summary: Get All Reviews
 *     description: Retrieve all reviews
 *     tags:
 *       - Reviews
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 */
router.get('/fetchReviews', getReviews);

/**
 * @swagger
 * /api/v1/feedbacks/updateReview/{id}:
 *   put:
 *     summary: Update Review
 *     description: Update an existing review
 *     tags:
 *       - Reviews
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       404:
 *         description: Review not found
 */
router.put('/updateReview/:id', updateReview);

/**
 * @swagger
 * /api/v1/feedbacks/deleteReview/{id}:
 *   delete:
 *     summary: Delete Review
 *     description: Delete a review
 *     tags:
 *       - Reviews
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       404:
 *         description: Review not found
 */
router.delete('/deleteReview/:id', deleteReview);

module.exports = router;
