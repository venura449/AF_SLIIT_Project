const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'AF SLIIT Project API',
            version: '1.0.0',
            description: 'A full-stack web application that connects donors with underprivileged individuals in local communities',
            contact: {
                name: 'AF SLIIT Project Team',
                url: 'https://github.com/venura449/AF_SLIIT_Project',
            },
        },
        servers: [
            {
                url: 'http://localhost:5001',
                description: 'Development Server',
            },
            {
                url: 'https://api.example.com',
                description: 'Production Server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT Authorization header using the Bearer scheme',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        email: { type: 'string' },
                        password: { type: 'string' },
                        role: { type: 'string', enum: ['User', 'Donor', 'Admin'] },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        nic: { type: 'string' },
                        phoneNumber: { type: 'string' },
                        address: { type: 'string' },
                        verified: { type: 'boolean' },
                        status: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                Donation: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        donorId: { type: 'string' },
                        needId: { type: 'string' },
                        amount: { type: 'number' },
                        status: { type: 'string', enum: ['pending', 'confirmed', 'completed'] },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                Need: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        userId: { type: 'string' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        category: { type: 'string' },
                        targetAmount: { type: 'number' },
                        currentAmount: { type: 'number' },
                        status: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                Feedback: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        needId: { type: 'string' },
                        userId: { type: 'string' },
                        rating: { type: 'number', minimum: 1, maximum: 5 },
                        comment: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Review: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        feedbackId: { type: 'string' },
                        userId: { type: 'string' },
                        comment: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Notification: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        userId: { type: 'string' },
                        title: { type: 'string' },
                        body: { type: 'string' },
                        data: { type: 'object' },
                        fcmToken: { type: 'string' },
                        isRead: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                        message: { type: 'string' },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: [
        './routes/auth/authRoutes.js',
        './routes/users/userRoutes.js',
        './routes/documents/documentRoutes.js',
        './routes/donations/needRoutes.js',
        './routes/donations/donationRoutes.js',
        './routes/feedback/feedbackRoutes.js',
        './routes/admin/adminDashRoutes.js',
        './routes/notifications/notificationRoutes.js',
    ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
