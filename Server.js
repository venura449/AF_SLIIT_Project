const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db.js');


const authRoutes = require('./routes/auth/authRoutes.js');
const userRoutes = require('./routes/users/userRoutes.js');
const documentRoutes = require('./routes/documents/documentRoutes.js');
const needRoutes = require('./routes/donations/needRoutes.js');
const feedbackRoutes = require('./routes/feedback/feedbackRoutes.js');
const adminDashRoutes = require('./routes/admin/adminDashRoutes.js');
const donationRoutes = require('./routes/donations/donationRoutes.js')

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
// Configure CORS to allow credentials and set proper origin
const corsOptions = {
  origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/needs', needRoutes);
app.use('/api/v1/feedbacks', feedbackRoutes);
app.use('/api/v1/admin', adminDashRoutes);
app.use('/api/v1/donation', donationRoutes);

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
