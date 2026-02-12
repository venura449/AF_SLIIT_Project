const mongoose = require('mongoose');

// Increase timeout for all tests
jest.setTimeout(30000);

// Connect to database before tests
beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/af_sliit_project_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 20000,
    });
  }
});

// Close any open MongoDB connections after all tests
afterAll(async () => {
  // Close all MongoDB connections
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});
