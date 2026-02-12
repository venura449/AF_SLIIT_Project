const mongoose = require('mongoose');

// Increase timeout for all tests
jest.setTimeout(30000);

// Close any open MongoDB connections after all tests
afterAll(async () => {
  // Close all MongoDB connections
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});
