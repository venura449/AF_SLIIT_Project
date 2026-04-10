const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables FIRST, before any other imports that read process.env
dotenv.config();

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swaggerConfig.js');
const connectDB = require('./config/db.js');


const authRoutes = require('./routes/auth/authRoutes.js');
const userRoutes = require('./routes/users/userRoutes.js');
const documentRoutes = require('./routes/documents/documentRoutes.js');
const needRoutes = require('./routes/donations/needRoutes.js');
const feedbackRoutes = require('./routes/feedback/feedbackRoutes.js');
const adminDashRoutes = require('./routes/admin/adminDashRoutes.js');
const donationRoutes = require('./routes/donations/donationRoutes.js')
const notificationRoutes = require('./routes/notifications/notificationRoutes.js');
const itemListingRoutes = require('./routes/donations/itemListingRoutes.js');
const messageRoutes = require('./routes/donations/messageRoutes.js');
const paymentRoutes = require("./routes/payment/paymentRoutes.js");
// Load environment variables
dotenv.config();


// Initialize Express app
const app = express();

const defaultAllowedOrigins = [
  'https://af-sliit-project.vercel.app',
  'http://localhost:3000',
  'http://localhost:5001',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
];

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((origin) => origin.trim())
  : defaultAllowedOrigins;

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB (skip in test environment)
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running', timestamp: new Date() });
});

app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'AF SLIIT Project API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
  },
}));

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/needs', needRoutes);
app.use('/api/v1/feedbacks', feedbackRoutes);
app.use('/api/v1/admin', adminDashRoutes);
app.use('/api/v1/donation', donationRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/items', itemListingRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/payment', paymentRoutes);

// Serve uploaded files (protected - only admin can access via API)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Only start server if this file is run directly
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
