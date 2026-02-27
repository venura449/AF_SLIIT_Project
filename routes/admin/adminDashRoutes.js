const express = require('express');

const {
    getAdminDashStats,
    getWeather,
    // getMonthlyDonations,
    // getMonthlyGrowth,
} = require('../../controllers/admin/adminDashController.js');

const router = express.Router();

/**
 * @swagger
 * /api/v1/admin/dashboard:
 *   get:
 *     summary: Get Admin Dashboard Statistics
 *     description: Retrieve dashboard statistics including total users, donations, needs, and feedbacks
 *     tags:
 *       - Admin Dashboard
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: number
 *                 totalDonations:
 *                   type: number
 *                 totalNeeds:
 *                   type: number
 *                 totalFeedbacks:
 *                   type: number
 *                 verifiedUsers:
 *                   type: number
 *                 pendingDocuments:
 *                   type: number
 *       500:
 *         description: Internal server error
 */
router.get('/dashboard', getAdminDashStats);

/**
 * @swagger
 * /api/v1/admin/weather:
 *   get:
 *     summary: Get Current Weather Information
 *     description: Retrieve current weather data using OpenWeather Current Weather API 2.5. Returns real-time weather conditions for the specified location including temperature, humidity, wind speed, cloudiness, and visibility.
 *     tags:
 *       - Admin Dashboard
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *           example: 6.9271
 *         description: Latitude of the location (decimal, -90 to 90)
 *       - in: query
 *         name: lon
 *         required: true
 *         schema:
 *           type: number
 *           example: 79.8612
 *         description: Longitude of the location (decimal, -180 to 180)
 *     responses:
 *       200:
 *         description: Weather data retrieved successfully from OpenWeather API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentTemp:
 *                   type: number
 *                   example: 28.5
 *                   description: Current temperature in Celsius
 *                 weatherDescription:
 *                   type: string
 *                   example: partly cloudy
 *                   description: Human-readable description of weather conditions
 *                 humidity:
 *                   type: number
 *                   example: 72
 *                   description: Humidity percentage (0-100)
 *                 windSpeed:
 *                   type: number
 *                   example: 5.2
 *                   description: Wind speed in m/s
 *                 feelsLike:
 *                   type: number
 *                   example: 28.1
 *                   description: "'Feels like' temperature accounting for humidity and wind (Celsius)"
 *                 clouds:
 *                   type: number
 *                   example: 45
 *                   description: Cloudiness percentage (0-100)
 *                 pressure:
 *                   type: number
 *                   example: 1013
 *                   description: Atmospheric pressure in hPa
 *                 visibility:
 *                   type: number
 *                   example: 10000
 *                   description: Visibility range in meters
 *       400:
 *         description: Missing or invalid query parameters (lat and lon are required and must be valid numbers)
 *       401:
 *         description: Unauthorized - Invalid or missing API key
 *       404:
 *         description: Location not found or invalid coordinates
 *       500:
 *         description: Internal server error or failed to fetch weather data (network error, service unavailable)
 */
router.get('/weather', getWeather);

module.exports = router;
