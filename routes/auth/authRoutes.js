const express = require('express');
const {
  signup,
  login,
  googleLogin,
  getGoogleAuthUrl,
  googleCallback,
  getProfile,
  updateProfile,
  deleteProfile,
  forgotPassword,
  resetPassword,
} = require('../../controllers/auth/authController');
const { protect } = require('../../middleware/authmiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/v1/auth/signup:
 *   post:
 *     summary: User Registration
 *     description: Create a new user account with email and password
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - username
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: gaya@gmail.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: Gayasha123@
 *               username:
 *                 type: string
 *                 example: Venu_nasa
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/signup', signup);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: User Login
 *     description: Authenticate user with email and password
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: gaya@gmail.com
 *               password:
 *                 type: string
 *                 example: Gayasha123@
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', login);

/**
 * @swagger
 * /api/v1/auth/google-login:
 *   post:
 *     summary: Google OAuth Login
 *     description: Authenticate user with Google ID token (creates account if not exists)
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *                 description: Google Firebase ID token from client
 *                 example: eyJhbGciOiJSUzI1NiIsImtpZCI6IjI4YTQyMWNxNmI...
 *     responses:
 *       200:
 *         description: Google login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid or expired ID token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/google-login', googleLogin);

/**
 * @swagger
 * /api/v1/auth/google-auth-url:
 *   get:
 *     summary: Get Google OAuth Authorization URL
 *     description: Returns the Google OAuth URL for frontend redirect oauth flow
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: OAuth URL retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authUrl:
 *                   type: string
 *                   description: URL to redirect user to for Google authentication
 *                 state:
 *                   type: string
 *                   description: State parameter for CSRF protection
 */
router.get('/google-auth-url', getGoogleAuthUrl);

/**
 * @swagger
 * /api/v1/auth/google-callback:
 *   get:
 *     summary: Google OAuth Callback
 *     description: Handles callback from Google OAuth, exchanges code for token, and redirects to frontend
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Authorization code from Google
 *       - in: query
 *         name: state
 *         required: false
 *         schema:
 *           type: string
 *         description: State parameter for CSRF validation
 *     responses:
 *       302:
 *         description: Redirect to frontend with token
 *       400:
 *         description: Missing authorization code
 */
router.get('/google-callback', googleCallback);

/**
 * @swagger
 * /api/v1/auth/profile:
 *   get:
 *     summary: Get User Profile
 *     description: Retrieve the authenticated user's profile information
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Token missing or invalid
 */
router.get('/profile', protect, getProfile);

/**
 * @swagger
 * /api/v1/auth/profile:
 *   put:
 *     summary: Update User Profile
 *     description: Update the authenticated user's profile information
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.put('/profile', protect, updateProfile);

/**
 * @swagger
 * /api/v1/auth/profile:
 *   delete:
 *     summary: Delete User Account
 *     description: Delete the authenticated user's account
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.delete('/profile', protect, deleteProfile);

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Forgot Password
 *     description: Send a password reset link to the user's email
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: gaya@gmail.com
 *     responses:
 *       200:
 *         description: Password reset link sent
 *       400:
 *         description: Email not found
 */
router.post('/forgot-password', forgotPassword);

/**
 * @swagger
 * /api/v1/auth/reset-password/{token}:
 *   post:
 *     summary: Reset Password
 *     description: Reset user password using the token from the email link
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: path
 *         name: token
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
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */
router.post('/reset-password/:token', resetPassword);

module.exports = router;
